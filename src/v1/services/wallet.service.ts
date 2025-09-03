import axios from 'axios';
import { API_BASE_URL } from '@/utils/constant';
import { TransactionResponse, WalletResponse, SwapFeeResponse, ExchangeRateResponse, SwapResponse, WithdrawalResponse, Currency } from '@/types/wallet.type';

export class WalletService {
    private readonly baseUrl: string;

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    /**
     * Creates a new wallet for a specific currency
     * @param currencyId The ID of the currency for the new wallet
     * @returns Promise<WalletResponse>
     */
    async createWallet(currencyId: string): Promise<WalletResponse> {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("User is not authenticated");

            const response = await axios.post<WalletResponse>(
                `${this.baseUrl}/wallet/create/${currencyId}`,
                {}, // Empty body since the currency ID is in the URL
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(
                error instanceof Error
                    ? `Failed to create wallet for currency ${currencyId}: ${error.message}`
                    : `Failed to create wallet for currency ${currencyId}: An unknown error occurred`
            );
        }
    }

    /**
     * Fetches all wallets for the user
     * @returns Promise<WalletResponse>
     */
    async getAllWallets(): Promise<WalletResponse> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("User is not authenticated");

        try {
            const response = await axios.get<WalletResponse>(`${this.baseUrl}/wallet/user/all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        } catch (error) {
            throw new Error(error instanceof Error ? `Failed to fetch wallets: ${error.message}` : 'Failed to fetch wallets: An unknown error occurred');
        }
    }

    /**
     * Fetches transaction history for a specific wallet
     * @param walletId The ID of the wallet
     * @param offset The page offset (default: 1)
     * @param limit The number of transactions per page (default: 10)
     * @returns Promise<TransactionResponse>
     */
    async getWalletTransactions(
        walletId: string,
        offset: number = 1,
        limit: number = 10
    ): Promise<TransactionResponse> {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("User is not authenticated");

            const response = await axios.get<TransactionResponse>(
                `${this.baseUrl}/transaction/user/history/wallet/${walletId}`,
                {
                    params: { offset, limit },
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(error instanceof Error ? `Failed to fetch transactions for wallet ${walletId}: ${error.message}` : `Failed to fetch transactions for wallet ${walletId}: An unknown error occurred`);
        }
    }

    /**
     * Fetches swap transaction fees
     * @param fromCurrency The source currency ID
     * @param toCurrency The target currency ID
     * @param amount The amount to swap
     * @returns Promise<SwapFeeResponse>
     */
    async getSwapFees(
        fromCurrency: string,
        toCurrency: string,
        amount: number
    ): Promise<SwapFeeResponse> {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("User is not authenticated");

            const response = await axios.get<{ data: SwapFeeResponse }>(
                `${this.baseUrl}/transaction/fee/swap`,
                {
                    params: {
                        from_currency: fromCurrency,
                        to_currency: toCurrency,
                        amount,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            return response.data.data;
        } catch (error) {
            throw new Error(error instanceof Error ? `Failed to fetch swap fees: ${error.message}` : 'Failed to fetch swap fees: An unknown error occurred');
        }
    }

    /**
     * Performs a swap transaction
     * @param amount The amount to swap
     * @param fromCurrency The source currency ID
     * @param toCurrency The target currency ID
     * @returns Promise<SwapResponse>
     */
    async performSwap(
        amount: number,
        fromCurrency: string,
        toCurrency: string
    ): Promise<SwapResponse> {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("User is not authenticated");

            const response = await axios.post<SwapResponse>(
                `${this.baseUrl}/payment/swap`,
                {
                    amount,
                    from_currency: fromCurrency,
                    to_currency: toCurrency,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(error instanceof Error ? `Failed to perform swap: ${error.message}` : 'Failed to perform swap: An unknown error occurred');
        }
    }

    /**
     * Fetches all available exchange rates
     * @returns Promise<ExchangeRateResponse>
     */
    async getExchangeRates(): Promise<ExchangeRateResponse> {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("User is not authenticated");

            const response = await axios.get<ExchangeRateResponse>(
                `${this.baseUrl}/exchange-rate`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(error instanceof Error ? `Failed to fetch exchange rates: ${error.message}` : 'Failed to fetch exchange rates: An unknown error occurred');
        }
    }

    /**
     * Initiates a withdrawal from a wallet to a bank account
     * @param amount The amount to withdraw
     * @param pin The user's transaction PIN
     * @param bank The bank account ID
     * @returns Promise<WithdrawalResponse>
     */
    async initiateWithdrawal(amount: number, pin: string, bank: string): Promise<WithdrawalResponse> {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("User is not authenticated");

            const response = await axios.post<WithdrawalResponse>(
                `${this.baseUrl}/payment/withdraw`,
                {
                    amount,
                    pin,
                    bank,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(
                error instanceof Error
                    ? `Failed to initiate withdrawal: ${error.message}`
                    : 'Failed to initiate withdrawal: An unknown error occurred'
            );
        }
    }
    /**
   * Fetches transaction history for the user across all wallets
   * @param offset The page offset (default: 1)
   * @param limit The number of transactions per page (default: 10)
   * @returns Promise<TransactionResponse>
   */
    async getUserTransactionHistory(
        offset: number = 1,
        limit: number = 10
    ): Promise<TransactionResponse> {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("User is not authenticated");

            const response = await axios.get<TransactionResponse>(
                `${this.baseUrl}/transaction/user/history`,
                {
                    params: { offset, limit },
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(
                error instanceof Error
                    ? `Failed to fetch user transaction history: ${error.message}`
                    : `Failed to fetch user transaction history: An unknown error occurred`
            );
        }
    }
}

// Fetch list of currencies
export const fetchCurrencies = async (): Promise<Currency[]> => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("fetchCurrencies error: No token found in localStorage");
        throw new Error('User is not authenticated');
    }

    try {
        const response = await axios.get<{ status: number; code: string; message: string; data: Currency[] }>(
            `${API_BASE_URL}/currency`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (response.data.status !== 200 || response.data.code !== 'success') {
            throw new Error(response.data.message || 'Failed to fetch currencies');
        }

        return response.data.data;
    } catch (error: any) {
        console.error("fetchCurrencies error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: error.config,
            stack: error.stack,
        });
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch currencies');
    }

};


