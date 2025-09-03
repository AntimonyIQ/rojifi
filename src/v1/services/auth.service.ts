import axios from 'axios';
import { API_BASE_URL } from '@/utils/constant';
import { LoginPayload, LoginResponse, UpdateUserPayload } from '@/types/auth.type';
import { IUser } from '@/interface/interface';

// Define signup payload type
export interface SignupPayload {
    email: string;
    firstname: string;
    lastname: string;
    password: string;
}

export interface IContactUs {
    firstname: string;
    lastname: string;
    email: string;
    businessName: string;
    phoneNumber: string;
    message: string;
    agreeToTerms: boolean;
}

// Define signup response type
export interface SignupResponse {
    status: number;
    code: string;
    message: string;
}

// Define change password payload type
export interface ChangePasswordPayload {
    current_password: string;
    new_password: string;
}

// Define KYC init response type
export interface KYCInitResponse {
    status: number;
    code: string;
    message: string;
    data: {
        user_id: string;
        job_id: string;
    };
}

// Set default headers for all axios requests
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

export const setAuthToken = (token: string | null) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('token', token);
    } else {
        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');
    }
};

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
    try {
        const response = await axios.put<LoginResponse>(
            `${API_BASE_URL}/auth/login`,
            payload
        );
        if (response.data.data.token) {
            setAuthToken(response.data.data.token);
        }
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Login failed');
    }
};

export const logout = async (): Promise<void> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('User is not authenticated');

        await axios.get(`${API_BASE_URL}/auth/logout`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error: any) {

        console.error('Logout failed:', error.response?.data?.message || 'Logout failed');
        throw new Error(error.response?.data?.message || 'Logout failed');
    }
};
export const signup = async (payload: SignupPayload): Promise<SignupResponse> => {
    try {
        const response = await axios.post<SignupResponse>(
            `${API_BASE_URL}/auth/signup`,
            payload
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Signup failed');
    }
};

export const contactus = async (payload: IContactUs): Promise<void> => {
    try {
        const response = await axios.post<void>(
            `${API_BASE_URL}/auth/contactus`,
            payload
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Signup failed');
    }
};

export const currentUser = async (): Promise<IUser> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('User is not authenticated');

    try {
        const response = await axios.get<{ status: number; code: string; message: string; data: IUser }>(
            `${API_BASE_URL}/user/current`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data.data;
    } catch (error: any) {
        setAuthToken(null);
        throw new Error(error.response?.data?.message || 'Failed to fetch user info');
    }
};

export const changePassword = async (payload: ChangePasswordPayload): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('User is not authenticated');

    try {
        await axios.patch<{ status: number; code: string; message: string }>(
            `${API_BASE_URL}/user/change-password`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to change password');
    }
};

export const updateUser = async (payload: UpdateUserPayload): Promise<IUser> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('User is not authenticated');

    try {
        interface UpdateUserResponse {
            status: number;
            code: string;
            message: string;
            data: IUser;
        }

        const response = await axios.patch<UpdateUserResponse>(
            `${API_BASE_URL}/user/profile`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to update user');
    }
};

export const setTransactionPin = async (payload: { pin: string; password: string }): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('User is not authenticated');

    try {
        await axios.put<{ status: number; code: string; message: string }>(
            `${API_BASE_URL}/user/pin`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to set transaction pin');
    }
};

export const requestPasswordReset = async (email: string): Promise<void> => {
    try {
        await axios.post<{ status: number; code: string; message: string }>(
            `${API_BASE_URL}/auth/reset-link`,
            { email }
        );
    } catch (error: any) {
        throw new Error(error.response?.data?.data?.message || 'Failed to send password reset link');
    }
};

export const resetPassword = async (token: string, password: string): Promise<void> => {
    try {
        await axios.put<{ status: number; code: string; message: string }>(
            `${API_BASE_URL}/auth/reset-password/${token}`,
            { password }
        );
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
};

export const verifyOTP = async (email: string, otp: string): Promise<void> => {
    try {
        await axios.put<{ status: number; code: string; message: string }>(
            `${API_BASE_URL}/auth/verify`,
            { email, otp }
        );
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    }
};

export interface SmileIDTokenResponse {
    status: number;
    code: string;
    message: string;
    data: {
        token: string;
        user_id: string;
        job_id: string;
        job_type: string;
    };
}

export const getSmileIDToken = async (): Promise<string> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('User is not authenticated');

    try {
        const response = await axios.get<SmileIDTokenResponse>(
            `${API_BASE_URL}/kyc/smile-id-token`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        const smileToken = response.data.data.token;
        localStorage.setItem('smileIDToken', smileToken);
        return smileToken;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch Smile ID token');
    }
};

export const initializeKYC = async (): Promise<KYCInitResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('User is not authenticated');

    try {
        const response = await axios.get<KYCInitResponse>(
            `${API_BASE_URL}/kyc/init`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to initialize KYC');
    }
};