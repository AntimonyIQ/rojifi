"use client"
import { ContactForm } from "@/v1/components/auth/contact-form";
import { useSEO } from '@/hooks/useSEO';

export default function ContactPage() {
    return (
        <>
            {useSEO({ page: 'contactus' })}
            <div className="min-h-screen bg-gray-50 flex items-center justify-center ">
                <ContactForm />
            </div>
        </>
    )
}
