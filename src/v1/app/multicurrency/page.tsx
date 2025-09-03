"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MultiCurrencyHero } from "@/components/multicurrency/multicurrency-hero"
import { MultiCurrencyFeatures } from "@/components/multicurrency/multicurrency-features"
import { MultiCurrencyPerks } from "@/components/multicurrency/multicurrency-perks"
import { MultiCurrencyCta } from "@/components/multicurrency/multicurrency-cta"
import { IHandshakeClient, IUser } from "@/interface/interface"
import { session, SessionData } from "@/session/session"
import Handshake from "@/hash/handshake"

// Custom hook to manage authentication state
const useAuth = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [user, setUser] = useState<IUser | null>(null)

    useEffect(() => {
        const sd: SessionData = session.getUserData();
        if (sd) {
            setIsLoggedIn(sd.isLoggedIn === true ? true : false);
            setUser(sd.user);
        } else {
            const client: IHandshakeClient = Handshake.generate();
            console.log("client: ", client);
            const sessionData: SessionData = {
                user: {} as IUser,
                activeWallet: '',
                client: client,
                deviceid: client.publicKey,
                isLoggedIn: false,
                devicename: "Unknown",
            };

            session.login(sessionData);
        }
    }, [])

    return { isLoggedIn, user }
}

export default function MultiCurrencyPage() {

    const { isLoggedIn, user } = useAuth()
    return (
        <main className="flex min-h-screen flex-col">
            <Header isLoggedIn={isLoggedIn} user={user} />
            <MultiCurrencyHero />
            <MultiCurrencyFeatures />
            <MultiCurrencyPerks />
            <MultiCurrencyCta />
            <Footer />
        </main>
    )
}
