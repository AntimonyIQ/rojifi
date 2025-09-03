export interface BankAccount {
    id: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    currency?: string;
    status?: string;
}

export interface Currency {
    id: string;
    name: string;
    code: string;
    symbol: string;
    decimal_place?: number;
    country: string;
    country_code: string;
}

export interface Wallet {
    id: string;
    currency: Currency;
    formatted_balance: string;
    flag?: string;
}

export interface TransactionCurrency {
    code: string;
    decimal_place: number;
}

export interface Transaction {
    id: string;
    created_at: string;
    type: 'credit' | 'debit' | 'swap' | 'withdrawal' | 'transfer';
    // :start
    status: 'successful' | 'failed' | 'pending' | 'processing';
    amount: string;
    wallet: "NGN" | "USD" | "EUR" | "GBP";
    sender_fullname: string;
    beneficiary_fullname: string;
    beneficiary_account: string;
    beneficiary_country: string;
    beneficiary_address: string;
    beneficiary_email: string;
    beneficiary_phone: string;
    swift_code: string;
    bank_name: string;
    bank_address: string;
    attachment: string;
    invoice_number: string;
    invoice_date: string;
    purpose_of_transaction: string;
    tracking_number: string;
    reference: string;
    reference_beneficiary: string;
    completed_date: string;
    processed_date: string;
    initiated_date: string;
    created_by: string;
    receipt?: string;
    mt103?: string;
    fees: {
        amount: string;
        currency: string;
    }[];
}

export interface TransactionResponse {
    status: number;
    code: string;
    message: string;
    data: Transaction[];
    metadata: {
        page: number;
        limit: number;
        total: number;
    };
}

export interface WalletResponse {
    status: number;
    code: string;
    message: string;
    data: Wallet[];
}

export interface SwapFeeResponse {
    fee: number;
    amount: number;
    rate: string;
    from_currency: string;
    to_currency: string;
    swap_amount: number;
}

export interface SwapResponse {
    transactionId: string;
    status: string;
}

export interface ExchangeRate {
    id: string;
    rate: string;
    base_currency: {
        id: string;
        name: string;
        code: string;
        country: string;
        decimal_place: number;
    };
    target_currency: {
        id: string;
        name: string;
        code: string;
        country: string;
        decimal_place: number;
    };
}

export interface ExchangeRateResponse {
    data: ExchangeRate[];
}

export interface WithdrawalResponse {
    status: number;
    code: string;
    message: string;
    data: {
        transactionId: string;
        amount: number;
        bank: string;
        status: string;
    };
}