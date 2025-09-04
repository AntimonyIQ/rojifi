"use client"

import { useState, useEffect } from "react"
import { Header } from "@/v1/components/header"
import { Footer } from "@/v1/components/footer"
import { HelpHero } from "@/v1/components/help/help-hero"
import { HelpContactOptions } from "@/v1/components/help/help-contact-options"
import { IUser } from "@/v1/interface/interface"
import { session, SessionData } from "@/v1/session/session"

// Custom hook to manage authentication state
const useAuth = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [user, setUser] = useState<IUser | null>(null)

    useEffect(() => {
        const sd: SessionData = session.getUserData();
        if (sd) {
            setIsLoggedIn(sd.isLoggedIn === true ? true : false);
            setUser(sd.user);
        }
    }, [])

    return { isLoggedIn, user }
}


export default function HelpPage() {

    const { isLoggedIn, user } = useAuth()
    return (
        <main className="flex min-h-screen flex-col">
            <Header isLoggedIn={isLoggedIn} user={user} />
            <HelpHero />
            <HelpContactOptions />
            <Footer />
        </main>
    )
}
