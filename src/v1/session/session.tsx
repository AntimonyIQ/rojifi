import Handshake from "@/v1/hash/handshake";
import JWT from "@/v1/hash/jwt";
import { IHandshakeClient, IPayment, ISender, ITransaction, IUser, IWallet } from "@/v1/interface/interface";

export interface SignupProgress {
    rojifiId: string;
    currentStage: 'signup' | 'business-details' | 'business-financials' | 'verification' | 'director';
    completedStages: string[];
    timestamp: number;
}

export interface SessionData {
    user: IUser;
    activeWallet: string;
    isLoggedIn: boolean;
    client: IHandshakeClient;
    deviceid: string;
    authorization: string;
    wallets: Array<IWallet>;
    transactions: Array<ITransaction>;
    sender: ISender;
    draftPayment: IPayment;
    signupProgress?: SignupProgress;
    [key: string]: any;
}

interface DecodedToken {
    isLoggedIn: boolean;
    userData: SessionData;
    exp?: number;
}

export default class Session {
    private isLoggedIn: boolean;
    private userData: SessionData;
    private secretKey: string;
    private client: IHandshakeClient = Handshake.generate();
    private user: IUser = {} as IUser;
    private sender: ISender = {} as ISender;
    private draftPayment: IPayment = {} as IPayment;

    constructor(secretKey: string) {
        this.isLoggedIn = false;

        this.userData = {
            user: this.user,
            activeWallet: '',
            isLoggedIn: false,
            client: this.client,
            deviceid: this.client.publicKey,
            authorization: '',
            wallets: [],
            transactions: [],
            sender: this.sender,
            draftPayment: this.draftPayment,
            signupProgress: undefined
        };
        this.secretKey = secretKey;
        this.loadSession();
    }

    private loadSession(): void {
        const storedToken = localStorage.getItem('session');
        if (storedToken) {
            try {
                const decodedToken = JWT.decode(storedToken, this.secretKey) as DecodedToken;
                if (decodedToken && typeof decodedToken === 'object') {
                    const { isLoggedIn, userData, exp } = decodedToken;
                    this.isLoggedIn = isLoggedIn;
                    this.userData = userData;

                    const currentTime = Math.floor(Date.now() / 1000);
                    if (exp && exp < currentTime) {
                        console.error('Token has expired. Clearing from local storage.');
                        localStorage.removeItem('session');
                    }
                } else {
                    throw new Error('Invalid token data');
                }
            } catch (error) {
                console.error('Failed to load session:', (error as Error).message);
                localStorage.removeItem('session');
            }
        }
    }

    private saveSession(): void {
        // 60 minutes * 24 hours * 365 days = 525,600 minutes (1 year)
        const expiresInMinutes = 60 * 24 * 365;
        const token = JWT.encode({ isLoggedIn: this.isLoggedIn, userData: this.userData }, this.secretKey, expiresInMinutes);
        localStorage.setItem('session', token);
    }

    public login(userData: SessionData): void {
        this.isLoggedIn = true;
        this.userData = userData;
        this.saveSession();
    }

    public logout(): void {
        this.isLoggedIn = false;
        this.userData = {
            user: this.user,
            activeWallet: '',
            isLoggedIn: false,
            client: this.client,
            deviceid: this.client.publicKey,
            authorization: '',
            wallets: [],
            transactions: [],
            sender: this.sender,
            draftPayment: this.draftPayment,
            signupProgress: undefined
        };
        this.saveSession();
    }

    public checkLoggedIn(): boolean {
        return this.isLoggedIn;
    }

    public getUserData(): SessionData {
        return this.userData;
    }

    public updateSession(userData: SessionData): void {
        if (this.isLoggedIn) {
            this.userData = { ...this.userData, ...userData };
            this.saveSession();
        } else {
            console.error('Cannot update session. User is not logged in.');
        }
    }

    public updateSessionKey(key: string, value: any): void {
        if (this.isLoggedIn) {
            if (key in this.userData) {
                this.userData[key] = value;
                this.saveSession();
            } else {
                console.error(`Key '${key}' does not exist in userData.`);
            }
        } else {
            console.error('Cannot update session. User is not logged in.');
        }
    }

    // Signup Progress Management Methods
    public setSignupProgress(rojifiId: string, stage: SignupProgress['currentStage'], completedStages: string[] = []): void {
        if (!ENABLE_SIGNUP_PROGRESS_TRACKING) return;

        this.userData.signupProgress = {
            rojifiId,
            currentStage: stage,
            completedStages,
            timestamp: Date.now()
        };
        this.saveSession();
    }

    public updateSignupStage(stage: SignupProgress['currentStage']): void {
        if (!ENABLE_SIGNUP_PROGRESS_TRACKING || !this.userData.signupProgress) return;

        // Add current stage to completed stages if not already there
        if (!this.userData.signupProgress.completedStages.includes(this.userData.signupProgress.currentStage)) {
            this.userData.signupProgress.completedStages.push(this.userData.signupProgress.currentStage);
        }

        this.userData.signupProgress.currentStage = stage;
        this.userData.signupProgress.timestamp = Date.now();
        this.saveSession();
    }

    public getSignupProgress(): SignupProgress | undefined {
        if (!ENABLE_SIGNUP_PROGRESS_TRACKING) return undefined;
        return this.userData.signupProgress;
    }

    public clearSignupProgress(): void {
        this.userData.signupProgress = undefined;
        this.saveSession();
    }

    public hasSignupProgress(rojifiId?: string): boolean {
        if (!ENABLE_SIGNUP_PROGRESS_TRACKING || !this.userData.signupProgress) return false;

        if (rojifiId && this.userData.signupProgress.rojifiId !== rojifiId) return false;

        // Check if progress is not too old (e.g., 30 days)
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        const isRecent = (Date.now() - this.userData.signupProgress.timestamp) < thirtyDaysInMs;

        return isRecent;
    }

    public getResumeUrl(): string {
        if (!ENABLE_SIGNUP_PROGRESS_TRACKING || !this.userData.signupProgress) return '/';

        const { rojifiId, currentStage } = this.userData.signupProgress;
        const stageRoutes = {
            'signup': `/signup/${rojifiId}`,
            'business-details': `/signup/${rojifiId}/business-details`,
            'business-financials': `/signup/${rojifiId}/business-financials`,
            'verification': `/signup/${rojifiId}/verification`,
            'director': `/signup/${rojifiId}/director`
        };

        return stageRoutes[currentStage] || `/signup/${rojifiId}`;
    }
}

const secretKey: string = "a054d1f7f839eccf142fbaacedde77a415eee92298188d9734b863b58e1d8809";

// ============================================
// SIGNUP PROGRESS TRACKING CONFIGURATION
// ============================================
// Set to true to enable signup progress tracking and resume functionality
// Set to false to disable the feature completely
export const ENABLE_SIGNUP_PROGRESS_TRACKING = false;
// ============================================

export const session: Session = new Session(secretKey);