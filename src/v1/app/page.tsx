"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Stats } from "@/components/stats"
import { Features } from "@/components/features"
import { Testimonials } from "@/components/testimonials"
import { Faq } from "@/components/faq"
import { Cta } from "@/components/cta"
import { Newsletter } from "@/components/newsletter"
import { Footer } from "@/components/footer"
import { session, SessionData } from "@/session/session"
import Handshake from "@/hash/handshake"
import { IHandshakeClient, IUser } from "@/interface/interface"
import CookieConsent from "@/components/cookies"

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
                authorization: "",
                wallets: [],
                transactions: []
            };

            session.login(sessionData);
        }
    }, [])

    return { isLoggedIn, user }
}

export default function Home() {
    const { isLoggedIn, user } = useAuth()

    return (
        <main className="flex min-h-screen flex-col">
            <Header isLoggedIn={isLoggedIn} user={user} />
            <Hero isLoggedIn={isLoggedIn} />
            <Stats />
            <Features />
            <Testimonials />
            <Faq />
            <Cta isLoggedIn={isLoggedIn} />
            <Newsletter />
            <Footer />
            <CookieConsent />
        </main>
    )
}