import { IUser } from "@/v1/interface/interface";

export interface LoginPayload {
    email: string;
    password: string;
}

export interface UpdateUserPayload {
    firstname: string;
    lastname: string;
    phone?: string;
    address_line_one?: string;
    address_line_two?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
    otherName?: string;
    dateOfBirth?: string;
    gender?: string;
}
export interface LoginResponse {
    code: string;
    message: string;
    status: number;
    data: {
        token: string;
        is_email_verified: string;
        user?: IUser;
    };
}

export interface SignupPayload {
    email: string;
    firstname: string;
    lastname: string;
    password: string;
}