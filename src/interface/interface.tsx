import { AccountTier, AffiliationStatus, BiometricType, BlockchainNetwork, BooleanString, Coin, Fiat, PaymentRail, RequestStatus, Role, SenderStatus, Status, TeamRole, TeamStatus, TransactionStatus, TransactionType, UserType, WalletStatus, WalletType } from "@/enums/enums";


export interface IHandshakeClient {
    publicKey: string;
    privateKey: string;
}

export interface IRequestAccess {
    _id: string;
    rojifiId: string;
    firstname: string;
    lastname: string;
    middlename: string;
    email: string;
    businessName: string;
    businessWebsite: string;
    message: string;
    weeklyVolume: number;
    phoneCode: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    agreement: boolean;
    approved: boolean;
    deleted: boolean;
    archived: boolean;
    approvedAt: Date | null;
    deletedAt: Date | null;
    archivedAt: Date | null;
    metadata: Record<string, any>;
}

export interface IResponse<Data = any, Error = any> {
    code: number;
    status: Status;
    message: string;
    data?: Data;
    error?: Error;
    pagination?: IPagination;
    timestamp: string;
    requestId: string;
    copyright: ICopyright;
    help: Array<string>;
    docs: string;
    version: string;
    handshake?: string;
}

export interface IPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ICopyright {
    year: string;
    holder: string;
    license: string;
    licenseUrl: string;
}

export interface IWallet {
    _id: string;
    currency: Fiat | Coin;
    userId: IUser;
    type: WalletType;
    walletId: string; // Unique wallet identifier
    balance: number; // Current available balance
    pending_payment_balance: number; // Pending payments
    status: WalletStatus; // Wallet status
    isPrimary: boolean; // Is this the user's primary wallet?
    icon: string; // Icon representing the wallet
    symbol: "₦" | "$" | "€" | "£",
    activated: boolean;
    name: string;
    deposit: Array<{
        currency: Coin | Fiat;
        icon: string;
        timestamp: Date;
        active: boolean;
        address: string;
        privateKey: string;
        publicKey: string;
        accountNumber: string; // Optional account number
        institution: string; // Optional financial institution name
        network: BlockchainNetwork;
    }>;
    requested: Array<{
        currency: Fiat;
        status: RequestStatus;
        senderId: string;
        userId: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}


export interface IContactUs {
    firstname: string;
    lastname: string;
    email: string;
    businessName: string;
    businessWebsite: string;
    phoneCode: string;
    phoneNumber: string;
    message: string;
    agreement: boolean;
    responded: boolean;
    responseMessage: string;
    deleted: boolean;
    archived: boolean;
    respondedAt: Date | null;
    deletedAt: Date | null;
    ArchivedAt: Date | null;
    metadata: Record<string, any>;
}

export interface IRequestAccess {
    rojifiId: string;
    firstname: string;
    lastname: string;
    middlename: string;
    email: string;
    businessName: string;
    businessWebsite: string;
    message: string;
    weeklyVolume: number;
    phoneCode: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    agreement: boolean;
    approved: boolean;
    deleted: boolean;
    archived: boolean;
    approvedAt: Date | null;
    deletedAt: Date | null;
    archivedAt: Date | null;
    metadata: Record<string, any>;
}

export interface IUser extends IRequestAccess {
    post_no_debit: string;
    address_line_one: string;
    address_line_two: string;
    username: string;
    fullName: string;
    isEmailVerified: boolean;
    key: string;
    phoneNumberHash: string;
    isPhoneNumberVerified: boolean;
    dateOfBirth: string;
    pin: string;
    mnemonic: string;
    referralCode: string;
    password: string;
    //////////////////////////////////

    cacCertOfIncoporation: string,
    memorandumArticlesOfAssociation: string,
    cacStatusReport: string,
    proofOfAddress: string,

    cacCertOfIncoporationIsVerified: boolean,
    memorandumArticlesOfAssociationIsVerified: boolean,
    cacStatusReportIsVerified: boolean,
    proofOfAddressIsVerified: boolean,

    cacCertOfIncoporationVerifiedAt: Date | null,
    memorandumArticlesOfAssociationVerifiedAt: Date | null,
    cacStatusReportVerifiedAt: Date | null,
    proofOfAddressVerifiedAt: Date | null,

    requested: {
        otcdesk: RequestStatus;
        virtualCard: RequestStatus;
    }

    //////////////////////////////////
    biometricType: BiometricType;
    biometric: string;
    biometricVerified: boolean;
    biometricVerifiedAt: Date;
    biometricEnabled: boolean;
    isVerificationComplete: boolean;
    loginCount: number;
    loginLastAt: Date;
    loginLastIp: string;
    loginLastDevice: string;
    twoFactorSecret: string;
    twoFactorURL: string;
    twoFactorEnabled: boolean;
    twoFactorVerified: boolean;
    twoFactorVerifiedAt: Date;
    isSuspecious: boolean;
    isActive: boolean;
    isSuspended: boolean;
    isBanned: boolean;
    userType: UserType;
    refreshToken: string;
    deviceToken: string;
    createdAt: Date;
    updatedAt: Date;
    passkey: string;
    passkeyEnabled: boolean;
    passkeyVerified: boolean;
    passkeyVerifiedAt: Date;
    tier: AccountTier;
    firstDepositConfirmed: boolean;
    deletedBy: string | null;
    comparePassword(password: string): Promise<boolean>;
    comparePin(pin: string): Promise<boolean>;
    comparePasskey(passkey: string): Promise<boolean>;
    compareBiometric(biometric: string): Promise<boolean>;
    compareDeviceToken(deviceToken: string): Promise<boolean>;
}

export interface IDeposit {
    userId: string;
    type: "crypto" | "fiat";
    account: string;
    bankName: string;
    accountName: string;
    routingNumber: string;
    blockchainNetwork: BlockchainNetwork;
    currency: Coin | Fiat;
    privateKey: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IbankWallet {
    userId: string;
    balance: number;

    deposit: IDeposit;
    currency: Fiat;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITeamMember {
    rojifiId: string;
    userId?: string;
    email: string;
    fullName?: string;
    role: TeamRole;
    status: TeamStatus;
    joined: boolean;
    accepted: boolean;
    joinedAt: Date | null;
    invitedAt: Date | null;
    acceptedAt: Date | null;
    archived: boolean;
    archivedAt: Date | null;
    deleted: boolean;
    deletedAt: Date | null;
}

export interface ITeams {
    creator: string;
    sender: string;
    description: string;
    members: Array<ITeamMember>;
    deleted: boolean;
    deletedAt: Date | null;
    archived: boolean;
    archivedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    rojifiId: string;
}

export interface ISender {
    _id: string;
    rojifiId: string;
    creator: string;
    teams: string;
    country: string;
    countryflag: string;
    businessRegistrationNumber: string;
    businessVerificationCompleted: boolean;
    businessVerificationCompletedAt: Date | null;
    businessName: string;
    taxIdentificationNumber: string;
    taxIdentificationNumberVerified: boolean;
    taxIdentificationNumberVerifiedAt: Date | null;
    volume: number;
    email: string;
    phoneNumber: string;
    phoneCountryCode: string;
    countryOfIncorporation: string;
    percentageOwnership: number;
    affiliationStatus: AffiliationStatus;
    dateOfIncorporation: Date;
    businessAddress: string;
    businessCity: string;
    businessState: string;
    businessPostalCode: string;
    creatorFirstName: string;
    creatorLastName: string;
    creatorMiddleName: string;
    creatorDateOfBirth: Date;
    creatorPosition: string;
    creatorBirthCountry: string;
    isBeneficialOwner: BooleanString;
    creatorRole: Role;
    creatorAddress: string;
    creatorCity: string;
    creatorState: string;
    creatorPostalCode: string;
    creatorPercentageOwnership: number;
    creatorEmail: string;
    creatorIsBusinessContact: BooleanString;
    creatorVotingRightPercentage: number;
    creatorTaxIdentificationNumber: string;
    creatorTaxIdentificationNumberVerified: boolean;
    creatorTaxIdentificationNumberVerifiedAt: Date | null;
    creatorSocialSecurityNumber: string;
    creatorSocialSecurityNumberVerified: boolean;
    creatorSocialSecurityNumberVerifiedAt: Date | null;
    deleted: boolean;
    deletedAt: Date | null;
    archived: boolean;
    archivedAt: Date | null;
    businessMemorandumAndArticlesOfAssociationKyc: string;
    businessMemorandumAndArticlesOfAssociationKycVerified: boolean;
    businessMemorandumAndArticlesOfAssociationKycVerifiedAt: Date | null;
    businessCertificateOfIncorporationKyc: string;
    businessCertificateOfIncorporationKycVerified: boolean;
    businessCertificateOfIncorporationKycVerifiedAt: Date | null;
    businessCertificateOfIncorporationStatusReportKyc: string;
    businessCertificateOfIncorporationStatusReportKycVerified: boolean;
    businessCertificateOfIncorporationStatusReportKycVerifiedAt: Date | null;
    businessProofOfAddressKyc: string;
    businessProofOfAddressKycVerified: boolean;
    businessProofOfAddressKycVerifiedAt: Date | null;
    status: SenderStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPayment {
    rojifiId: string;
    sender: string;
    senderWallet: string;
    senderName: string;
    senderCurrency: Fiat;
    status: TransactionStatus;
    swiftCode: string;
    beneficiaryAccountName: string;
    beneficiaryCountry: string;
    beneficiaryCountryCode: string;
    beneficiaryBankName: string;
    beneficiaryCurrency: string;
    beneficiaryAccountNumber: string;
    beneficiaryBankAddress: string;
    beneficiaryAmount: string;
    beneficiaryAccountType: "business" | "personal";
    beneficiaryIban: string;
    beneficiaryAddress: string;
    beneficiaryCity: string;
    beneficiaryState: string;
    beneficiaryPostalCode: string;
    beneficiaryAbaRoutingNumber: string;
    beneficiaryBankStateBranch: string;
    beneficiaryIFSC: string;
    beneficiaryInstitutionNumber: string;
    beneficiaryTransitNumber: string;
    beneficiaryRoutingCode: string;
    paymentInvoice: string;
    paymentInvoiceNumber: string;
    paymentInvoiceDate: Date;
    purposeOfPayment: string;
    paymentFor: string;
    paymentRail: PaymentRail;
    reference: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface INewsLetter {
    email: string;
    canceled: boolean;
    canceledAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface ILocation {
    ip: string;
    city: string;
    region: string;
    country: string;
    timezone: string;
    state: string;
    org: string;
    network: string;
    version: string;
    region_code: string;
    country_name: string;
    country_code: string;
    country_code_iso3: string;
    country_capital: string;
    country_tld: string;
    continent_code: string;
    in_eu: boolean;
    postal: any,
    latitude: number;
    longitude: number;
    utc_offset: string;
    country_calling_code: string;
    currency: string;
    currency_name: string;
    languages: string;
    country_area: number;
    country_population: number;
    asn: string;
}

export interface ITransaction extends IPayment {
    _id: string;
    from: string;
    to: string;
    fromCurrency: Coin;
    toCurrency: Coin;
    userId: IUser;
    swapToAmount: number;
    hash: string;
    sendHash: string;
    nonce: string;
    confirmations: string;
    blockNumber: string;
    timestamp: string;
    network: BlockchainNetwork;
    location: ILocation;
    createdAt: Date;
    updatedAt: Date;
    ///////
    txId: string;
    type: TransactionType;
    status: TransactionStatus;
    amount: string;
    wallet: Fiat;
    receipt?: string;
    mt103?: string;
    fees: {
        amount: string;
        currency: string;
    }[];
}