export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  currency?: string; 
  status?: string; 
}

// Interface for bank list item
export interface Bank {
  bank_code: string;
  bank_name: string;
}


export interface InternationalAccountVerificationResponse {
  status: number;
  code: string;
  message: string;
  data: {
    account_name: string;
    account_number: string;
    bank_code: string;
  };
}

export interface TransferResponse {
  status: number;
  code: string;
  message: string;
  data: {
    transaction_id: string;
    reference: string;
    amount: number;
    currency: string;
    status: string;
    narration: string;
    beneficiary_name: string;
  };
}


export interface Currency {
  id: string;
  code: string;
}