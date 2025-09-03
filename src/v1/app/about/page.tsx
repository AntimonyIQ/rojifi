"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AboutHero } from "@/components/about/about-hero"
import { AboutValues } from "@/components/about/about-values"
import { AboutVision } from "@/components/about/about-vision"
import { AboutMission } from "@/components/about/about-mission"
import { AboutCta } from "@/components/about/about-cta"
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
