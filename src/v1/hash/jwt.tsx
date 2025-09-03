'use client';

import { Buffer } from 'buffer';
import CryptoJS from 'crypto-js';

interface Payload {
    [key: string]: any;
    exp?: number;
}

export default class JWT {
    static encode(payload: Payload, secretKey: string, expiresInMinutes: number): string {
        const currentTime = Math.floor(Date.now() / 1000);
        const expirationTime = currentTime + (expiresInMinutes * 60);
        payload.exp = expirationTime;

        const header = {
            alg: 'HS256',
            typ: 'JWT'
        };
        const encodedHeader = this.base64urlEncode(JSON.stringify(header));
        const encodedPayload = this.base64urlEncode(JSON.stringify(payload));
        const signature = this.hmacSHA256(`${encodedHeader}.${encodedPayload}`, secretKey);
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }

    static decode(token: string, secretKey: string): Payload {
        const [encodedHeader, encodedPayload, signature] = token.split('.');
        const payload = JSON.parse(this.base64urlDecode(encodedPayload));
        const expectedSignature = this.hmacSHA256(`${encodedHeader}.${encodedPayload}`, secretKey);

        if (signature !== expectedSignature) {
            throw new Error('Invalid signature');
        }

        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
            throw new Error('Token has expired');
        }

        return payload;
    }

    private static base64urlEncode(str: string): string {
        return Buffer.from(str)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    private static base64urlDecode(str: string): string {
        try {
            str = str.replace(/-/g, '+').replace(/_/g, '/');
            const decoded = Buffer.from(str, 'base64').toString('binary');
            return decodeURIComponent(escape(decoded));
        } catch (e) {
            throw new Error('The string to be decoded is not correctly encoded.');
        }
    }

    private static hmacSHA256(data: string, key: string): string {
        return CryptoJS.HmacSHA256(data, key).toString(CryptoJS.enc.Base64)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }
}