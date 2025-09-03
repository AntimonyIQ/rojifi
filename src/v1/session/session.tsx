'use client';

import Handshake from "@/hash/handshake";
import JWT from "@/hash/jwt";
import { IHandshakeClient, IPayment, ISender, ITransaction, IUser, IWallet } from "@/interface/interface";

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
            draftPayment: this.draftPayment
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
            draftPayment: this.draftPayment
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
}

const secretKey: string = "a054d1f7f839eccf142fbaacedde77a415eee92298188d9734b863b58e1d8809";

function createSessionInstance(): Session {
    return new Session(secretKey);
}

// Lazy proxy: export a `session: Session` that doesn't construct the real
// Session until the first property is accessed. This avoids touching
// `localStorage` during server-side imports (Next.js SSR).
const lazySession = (() => {
    let instance: Session | null = null;

    const ensureInstance = () => {
        if (!instance) {
            // If we're on the server, return a lightweight stub that
            // implements the same public methods but avoids touching
            // browser-only APIs like localStorage. This prevents
            // server-side rendering from throwing when code imports
            // `session`.
            if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
                const stub = {
                    // minimal session data expected by consumers
                    checkLoggedIn: () => false,
                    getUserData: () => ({
                        user: {} as IUser,
                        activeWallet: '',
                        isLoggedIn: false,
                        client: { publicKey: '', privateKey: '' } as any,
                        deviceid: '',
                    }),
                    login: (_userData: SessionData) => { /* no-op on server */ },
                    logout: () => { /* no-op on server */ },
                    updateSession: (_userData: SessionData) => { /* no-op on server */ },
                    updateSessionKey: (_key: string, _value: any) => { /* no-op on server */ },
                } as unknown as Session;

                instance = stub;
            } else {
                instance = createSessionInstance();
            }
        }

        return instance as Session;
    };

    const handler: ProxyHandler<any> = {
        get(_target, prop) {
            const inst = ensureInstance();
            const value = (inst as any)[prop];
            if (typeof value === 'function') return value.bind(inst);
            return value;
        },
        set(_target, prop, value) {
            const inst = ensureInstance();
            (inst as any)[prop] = value;
            return true;
        },
        has(_target, prop) {
            const inst = ensureInstance();
            return prop in inst;
        }
    };

    return new Proxy({}, handler) as Session;
})();

export const session: Session = lazySession;