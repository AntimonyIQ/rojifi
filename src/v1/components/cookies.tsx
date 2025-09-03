"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";

type Consent = {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
};

const COOKIE_NAME = "rojify_cookie_consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

function setCookie(name: string, value: string, maxAgeSeconds = COOKIE_MAX_AGE) {
    const secure = typeof window !== "undefined" && window.location.protocol === "https:";
    const parts = [
        `${name}=${encodeURIComponent(value)}`,
        `path=/`,
        `max-age=${maxAgeSeconds}`,
        `SameSite=Lax`,
    ];
    if (secure) parts.push("Secure");
    document.cookie = parts.join("; ");
}

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\\/\\+^])/g, "\\$1") + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
}

function readConsent(): Consent | null {
    try {
        const raw = getCookie(COOKIE_NAME);
        if (!raw) return null;
        return JSON.parse(raw) as Consent;
    } catch (e) {
        return null;
    }
}

export default function CookieConsent() {
    const [open, setOpen] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [consent, setConsent] = useState<Consent>({ essential: true, analytics: false, marketing: false });

    useEffect(() => {
        const existing = readConsent();
        if (!existing) {
            // show banner/modal if no stored consent
            setOpen(true);
        } else {
            setConsent(existing);
        }
    }, []);

    const acceptAll = () => {
        const next: Consent = { essential: true, analytics: true, marketing: true };
        setConsent(next);
        setCookie(COOKIE_NAME, JSON.stringify(next));
        setOpen(false);
    };

    const rejectNonEssential = () => {
        const next: Consent = { essential: true, analytics: false, marketing: false };
        setConsent(next);
        setCookie(COOKIE_NAME, JSON.stringify(next));
        setOpen(false);
    };

    const savePreferences = () => {
        setCookie(COOKIE_NAME, JSON.stringify(consent));
        setOpen(false);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
            <div
                role="dialog"
                aria-modal="true"
                className="pointer-events-auto w-full max-w-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-5 md:p-6 mb-4"
            >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">We use cookies</h3>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            We use essential cookies to make the site work. We&apos;d also like to use analytics and marketing
                            cookies to understand how you use the site and show personalized content. You can accept all, reject
                            non-essential, or manage your preferences.
                        </p>

                        {showDetails && (
                            <div className="mt-4 space-y-3">
                                <label className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 p-3 rounded">
                                    <div>
                                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Analytics</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-300">Helps us improve the product.</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={consent.analytics}
                                        onChange={(e) => setConsent((s) => ({ ...s, analytics: e.target.checked }))}
                                        className="h-4 w-4"
                                    />
                                </label>

                                <label className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 p-3 rounded">
                                    <div>
                                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Marketing</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-300">Used for advertising and personalization.</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={consent.marketing}
                                        onChange={(e) => setConsent((s) => ({ ...s, marketing: e.target.checked }))}
                                        className="h-4 w-4"
                                    />
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="flex-shrink-0 flex flex-col items-stretch gap-3 w-full md:w-auto">
                        <Button
                            onClick={acceptAll}
                            variant="default"
                            className="px-4 py-2 rounded text-white text-sm font-medium"
                        >
                            Accept all
                        </Button>

                        <Button
                            onClick={rejectNonEssential}
                            variant="outline"
                            className="px-4 py-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200"
                        >
                            Reject non-essential
                        </Button>

                        {showDetails ? (
                            <div className="flex gap-2">
                                <Button
                                    onClick={savePreferences}
                                    variant="default"
                                    className="flex-1 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium"
                                >
                                    Save
                                </Button>
                                <Button
                                    onClick={() => setShowDetails(false)}
                                    variant="outline"
                                    className="px-4 py-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200"
                                >
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <Button
                                onClick={() => setShowDetails(true)}
                                variant="outline"
                                className="px-4 py-2 rounded border border-transparent bg-white/60 dark:bg-slate-900/60 text-sm text-slate-700 dark:text-slate-200"
                            >
                                Manage
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

