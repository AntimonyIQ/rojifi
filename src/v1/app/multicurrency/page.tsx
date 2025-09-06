"use client"

import { useState, useEffect } from "react"
import { Header } from "@/v1/components/header"
import { Footer } from "@/v1/components/footer"
import { MultiCurrencyHero } from "@/v1/components/multicurrency/multicurrency-hero"
import { MultiCurrencyFeatures } from "@/v1/components/multicurrency/multicurrency-features"
import { MultiCurrencyPerks } from "@/v1/components/multicurrency/multicurrency-perks"
import { MultiCurrencyCta } from "@/v1/components/multicurrency/multicurrency-cta"
import { IUser } from "@/v1/interface/interface"
import { session, SessionData } from "@/v1/session/session"
import { useSEO } from '@/hooks/useSEO';

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

export default function MultiCurrencyPage() {

    const { isLoggedIn, user } = useAuth()
    return (
        <>
            {useSEO({ page: 'multicurrency' })}
            <main className="flex min-h-screen flex-col">
                <Header isLoggedIn={isLoggedIn} user={user} />
                <MultiCurrencyHero />
                <MultiCurrencyFeatures />
                <MultiCurrencyPerks />
                <MultiCurrencyCta />
                <Footer />
            </main>
        </>
    )
}
