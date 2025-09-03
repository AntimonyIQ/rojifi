import axios from 'axios';
import { API_BASE_URL } from '@/v1/utils/constant';
import { BankAccount, Bank, TransferResponse, InternationalAccountVerificationResponse } from '@/v1/types/bank.type';

// Fetch virtual accounts
export const fetchVirtualAccounts = async (): Promise<BankAccount[]> => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("fetchVirtualAccounts error: No token found in localStorage");
        throw new Error('User is not authenticated');
    }

    try {
        const response = await axios.get<{ status: number; code: string; message: string; data: { account_name: string; account_number: string; bank: string }[] }>(
            `${API_BASE_URL}/payment/virtual-account`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )

        return response.data.data.map((account) => ({
            id: '',
            bankName: account.bank,
            accountNumber: account.account_number,
            accountName: account.account_name,
            currency: 'NGN',
            status: 'verified',
        }));
    } catch (error: any) {
        console.error("fetchVirtualAccounts error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: error.config,
            stack: error.stack,
        });
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch virtual accounts');
    }
};

// Fetch list of banks
export const fetchBanks = async (): Promise<Bank[]> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('User is not authenticated');

    try {
        const response = await axios.get<{ status: number; code: string; message: string; data: Bank[] }>(
            `${API_BASE_URL}/payment/banks`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data.data;
    } catch (error: any) {
        console.error("fetchBanks error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: error.config,
            stack: error.stack,
        });
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch banks');
    }
};

// Verify a bank account
export const verifyBankAccount = async (bankCode: string, accountNumber: string): Promise<string> => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("verifyBankAccount error: No token found in localStorage");
        throw new Error('User is not authenticated');
    }

    try {
        const response = await axios.put<{ status: number; code: string; message: string; data: { account_name: string } }>(
            `${API_BASE_URL}/payment/verify-account`,
            {
                account_number: accountNumber,
                bank_code: bankCode,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data.data.account_name;
    } catch (error: any) {
        console.error("verifyBankAccount error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: error.config,
            stack: error.stack,
        });
        throw new Error(error.response?.data?.message || error.message || 'Failed to verify account');
    }
};

// Add a new bank account
export const addBankAccount = async (payload: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    currency: string;
    bankCode: string;
}): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("addBankAccount error: No token found in localStorage");
        throw new Error('User is not authenticated');
    }

    if (!API_BASE_URL) {
        console.error("addBankAccount error: API_BASE_URL is not defined");
        throw new Error('API base URL is not configured');
    }

    // Validate payload
    if (!payload.bankName || !payload.accountNumber || !payload.accountName || !payload.bankCode) {
        console.error("addBankAccount error: Invalid payload", { payload });
        throw new Error('All required fields (bankName, accountNumber, accountName, bankCode) must be provided');
    }

    try {
        // Transform payload to match API expectations
        const apiPayload = {
            bank_name: payload.bankName,
            account_number: payload.accountNumber,
            account_name: payload.accountName,
            bank_code: payload.bankCode,
        };

        console.log("Sending payload to API:", apiPayload);
        console.log("Request URL:", `${API_BASE_URL}/user/bank`);
        console.log("Token:", token);

        const response = await axios.post<{ status: number; code: string; message: string }>(
            `${API_BASE_URL}/user/bank`,
            apiPayload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log("addBankAccount response:", response.data);

        if (response.data.status !== 201 || response.data.code !== 'success') {
            throw new Error(response.data.message || 'Failed to add bank account');
        }

        // No data field in response; success is indicated by status 201
    } catch (error: any) {
        console.error("addBankAccount error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: error.config,
            stack: error.stack,
            name: error.name,
        });
        throw new Error(error.response?.data?.message || error.message || 'Failed to add bank account');
    }
};

// Fetch linked bank accounts
export const fetchBankAccounts = async (): Promise<BankAccount[]> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('User is not authenticated');

    try {
        const response = await axios.get<{ status: number; code: string; message: string; data: { id: string; bank_name: string; account_number: string; account_name: string; bank_code: string }[] }>(
            `${API_BASE_URL}/user/bank`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data.data.map((account) => ({
            id: account.id,
            bankName: account.bank_name,
            accountNumber: account.account_number,
            accountName: account.account_name,
            currency: 'NGN',
            status: 'verified',
        }));
    } catch (error: any) {
        console.error("fetchBankAccounts error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            stack: error.stack,
        });
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch bank accounts');
    }
};

// Remove a bank account
export const removeBankAccount = async (id: string): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('User is not authenticated');

    try {
        await axios.delete<{ status: number; code: string; message: string }>(
            `${API_BASE_URL}/user/bank/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
    } catch (error: any) {
        console.error("removeBankAccount error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            stack: error.stack,
        });
        throw new Error(error.response?.data?.message || error.message || 'Failed to remove bank account');
    }
};

// Fetch list of banks for transfers
export const fetchTransferBanks = async (currency?: string): Promise<Bank[]> => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("fetchTransferBanks error: No token found in localStorage");
        throw new Error('User is not authenticated');
    }

    try {
        const params = currency ? { currency } : {};
        const response = await axios.get<{ status: number; code: string; message: string; data: Bank[] }>(
            `${API_BASE_URL}/payment/transfer-banks`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params,
            }
        );

        if (response.data.status !== 200 || response.data.code !== 'success') {
            throw new Error(response.data.message || 'Failed to fetch transfer banks');
        }

        return response.data.data;
    } catch (error: any) {
        console.error("fetchTransferBanks error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: error.config,
            stack: error.stack,
            currency,
        });
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch transfer banks');
    }
};
// Verify an international bank account
// Verify an international bank account
export const verifyInternationalAccount = async (
    bankCode: string,
    accountNumber: string,
    currency: string, // Currency UUID
    iban?: string // Optional IBAN for currencies like EUR, GBP, CAD
): Promise<string> => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("verifyInternationalAccount error: No token found in localStorage");
        throw new Error('User is not authenticated');
    }

    try {
        const payload: any = {
            account_number: accountNumber,
            bank_code: bankCode,
            currency,
        };
        if (iban) {
            payload.iban = iban;
        }

        const response = await axios.put<InternationalAccountVerificationResponse>(
            `${API_BASE_URL}/payment/verify-international-account`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (response.data.status !== 200 || response.data.code !== 'success') {
            throw new Error(response.data.message || 'Failed to verify international account');
        }

        return response.data.data.account_name;
    } catch (error: any) {
        console.error("verifyInternationalAccount error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: error.config,
            stack: error.stack,
        });
        throw new Error(
            error.response?.data?.message || error.message || 'Failed to verify international account'
        );
    }
};



// Initiate a bank transfer
export const initiateTransfer = async (payload: {
    amount: number;
    currency: string;
    pin: string;
    narration: string;
    account_number: string;
    bank_code: string;
    beneficiary_name: string;
    bank_name: string;
    iban?: string;
}): Promise<TransferResponse> => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("initiateTransfer error: No token found in localStorage");
        throw new Error('User is not authenticated');
    }

    // Validate payload
    if (
        !payload.amount ||
        !payload.currency ||
        !payload.pin ||
        !payload.narration ||
        !payload.account_number ||
        !payload.bank_code ||
        !payload.beneficiary_name ||
        !payload.bank_name
    ) {
        console.error("initiateTransfer error: Invalid payload", { payload });
        throw new Error('All required fields (amount, currency, pin, narration, account_number, bank_code, beneficiary_name) must be provided');
    }

    let apiPayload: any = {};
    try {
        apiPayload = {
            amount: payload.amount,
            currency: payload.currency,
            pin: payload.pin,
            narration: payload.narration,
            account_number: payload.account_number,
            bank_code: payload.bank_code,
            beneficiary_name: payload.beneficiary_name,
            bank_name: payload.bank_name,
        };
        if (payload.iban) {
            apiPayload.iban = payload.iban;
        }

        const response = await axios.post<TransferResponse>(
            `${API_BASE_URL}/payment/transfer`,
            apiPayload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (response.data.status !== 200 && response.data.status !== 201) {
            throw new Error(response.data.message || 'Failed to initiate transfer');
        }

        return response.data;
    } catch (error: any) {
        console.error("initiateTransfer error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: error.config,
            stack: error.stack,
            payload: apiPayload,
        });
        throw new Error(
            error.response?.data?.message || error.message || 'Failed to initiate transfer'
        );
    }
};

