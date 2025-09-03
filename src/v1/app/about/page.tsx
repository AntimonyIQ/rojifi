"use client"

import { useState, useEffect } from "react"
import { Header } from "@/v1/components/header"
import { Footer } from "@/v1/components/footer"
import { AboutHero } from "@/v1/components/about/about-hero"
import { AboutValues } from "@/v1/components/about/about-values"
import { AboutVision } from "@/v1/components/about/about-vision"
import { AboutMission } from "@/v1/components/about/about-mission"
import { AboutCta } from "@/v1/components/about/about-cta"
import { session, SessionData } from "@/v1/session/session"
import Handshake from "@/v1/hash/handshake"
import { IHandshakeClient, IPayment, ISender, IUser } from "@/v1/interface/interface"

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
            const nsd: SessionData = {
                user: {} as any,
                activeWallet: '',
                client: client,
                deviceid: client.publicKey,
                isLoggedIn: false,
                devicename: "Unknown",
                authorization: "",
                wallets: [],
                transactions: [],
                sender: {} as ISender,
                draftPayment: {} as IPayment
            };

            session.login(nsd);
        }
    }, [])

    return { isLoggedIn, user }
}

export default function AboutPage() {

    const { isLoggedIn, user } = useAuth()

    return (
        <main className="flex min-h-screen flex-col">
            <Header isLoggedIn={isLoggedIn} user={user} />
            <AboutHero />
            <AboutValues />
            <AboutVision />
            <AboutMission />
            <AboutCta />
            <Footer />
        </main>
    )
}
