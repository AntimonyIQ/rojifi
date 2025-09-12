import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { session } from "@/v1/session/session";

// InactivityTracker: Shows a confirmation modal after 5 minutes of no user activity
// If user doesn't respond within 30s:
//  - On /signup/* routes: redirect to home page
//  - On /dashboard/* routes: logout and redirect to /login

const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const MODAL_COUNTDOWN_SECONDS = 30; // 30s countdown once modal appears

// LocalStorage keys used to coordinate across tabs and survive throttling
const LS_INACTIVITY_EXPIRES = 'rojifi:inactivity:expires'; // milliseconds timestamp
const LS_MODAL_EXPIRES = 'rojifi:inactivity:modal_expires'; // milliseconds timestamp

export const InactivityTracker: React.FC = () => {
    const [location, navigate] = useLocation();
    const [showModal, setShowModal] = useState(false);
    const [countdown, setCountdown] = useState(MODAL_COUNTDOWN_SECONDS);

    const inactivityTimerRef = useRef<number | null>(null);
    const countdownIntervalRef = useRef<number | null>(null);
    const lastActivityRef = useRef<number>(Date.now());
    const inactivityExpiresAtRef = useRef<number | null>(null);
    const modalExpiresAtRef = useRef<number | null>(null);

    const isMonitoredRoute = useCallback(() => {
        if (!location) return false;
        return location.startsWith("/signup/") || location.startsWith("/dashboard/");
    }, [location]);

    const clearInactivityTimer = () => {
        if (inactivityTimerRef.current) {
            window.clearTimeout(inactivityTimerRef.current);
            inactivityTimerRef.current = null;
        }
        inactivityExpiresAtRef.current = null;
        try { localStorage.removeItem(LS_INACTIVITY_EXPIRES); } catch (e) { }
    };

    const clearCountdown = () => {
        if (countdownIntervalRef.current) {
            window.clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
        modalExpiresAtRef.current = null;
        try { localStorage.removeItem(LS_MODAL_EXPIRES); } catch (e) { }
    };

    const resetInactivityTimer = useCallback(() => {
        if (!isMonitoredRoute()) return; // Only track on monitored routes
        clearInactivityTimer();
        const expiresAt = Date.now() + INACTIVITY_TIMEOUT_MS;
        inactivityExpiresAtRef.current = expiresAt;
        try { localStorage.setItem(LS_INACTIVITY_EXPIRES, String(expiresAt)); } catch (e) { }

        // Schedule the timeout as a best-effort; the real authority will be the expiresAt timestamp
        inactivityTimerRef.current = window.setTimeout(() => {
            // If actual time has passed, show modal; otherwise compute using timestamp
            setShowModal(true);
            // compute modal expiry timestamp and persist
            const modalExpires = Date.now() + MODAL_COUNTDOWN_SECONDS * 1000;
            modalExpiresAtRef.current = modalExpires;
            try { localStorage.setItem(LS_MODAL_EXPIRES, String(modalExpires)); } catch (e) { }
            setCountdown(MODAL_COUNTDOWN_SECONDS);
        }, INACTIVITY_TIMEOUT_MS);
    }, [isMonitoredRoute]);

    const handleActivity = useCallback(() => {
        lastActivityRef.current = Date.now();
        if (showModal) return; // Don't auto-dismiss while modal visible; user must choose
        resetInactivityTimer();
    }, [showModal, resetInactivityTimer]);

    // Start / reset inactivity tracking when route changes
    useEffect(() => {
        if (showModal) return; // If modal showing due to previous route, keep it until action
        if (isMonitoredRoute()) {
            resetInactivityTimer();
        } else {
            clearInactivityTimer();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    // Global activity listeners
    useEffect(() => {
        const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
        events.forEach(ev => window.addEventListener(ev, handleActivity, { passive: true }));
        return () => {
            events.forEach(ev => window.removeEventListener(ev, handleActivity));
        };
    }, [handleActivity]);

    // Auto action (logout/redirect) -- defined early so other effects can call it
    const handleAutoAction = useCallback(() => {
        if (!location) return;
        setShowModal(false);
        clearInactivityTimer();
        clearCountdown();

        // handle dashboard dynamic route (/dashboard/[wallet])
        if (location.startsWith("/signup/")) {
            navigate("/");
        } else if (location.startsWith("/dashboard/")) {
            session.logout();
            navigate("/login");
        }
    }, [location, navigate]);

    // Countdown management when modal becomes visible
    useEffect(() => {
        // Use an absolute timestamp to compute remaining time so the countdown
        // progresses correctly even after throttling or tab inactivity.
        const startCountdown = () => {
            clearCountdown();
            // If modalExpiresAtRef is not set (modal was shown via other tab/storage), try load from localStorage
            if (!modalExpiresAtRef.current) {
                try {
                    const stored = localStorage.getItem(LS_MODAL_EXPIRES);
                    if (stored) modalExpiresAtRef.current = Number(stored);
                } catch (e) { /* ignore */ }
            }

            // If still not set, initialize now
            if (!modalExpiresAtRef.current) {
                modalExpiresAtRef.current = Date.now() + MODAL_COUNTDOWN_SECONDS * 1000;
                try { localStorage.setItem(LS_MODAL_EXPIRES, String(modalExpiresAtRef.current)); } catch (e) { }
            }

            // Immediately compute remaining and set countdown
            const tick = () => {
                const expires = modalExpiresAtRef.current as number;
                const remainingMs = Math.max(0, expires - Date.now());
                const remainingSec = Math.ceil(remainingMs / 1000);
                setCountdown(remainingSec);
                if (remainingMs <= 0) {
                    // auto action
                    window.setTimeout(() => handleAutoAction(), 0);
                }
            };

            // run tick now and then every second
            tick();
            countdownIntervalRef.current = window.setInterval(tick, 1000);
        };

        if (showModal) {
            startCountdown();
        } else {
            clearCountdown();
        }

        return () => clearCountdown();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showModal]);

    // Listen to storage events so other tabs can trigger modal/logout across tabs
    useEffect(() => {
        const onStorage = (ev: StorageEvent) => {
            if (!ev.key) return;
            if (ev.key === LS_INACTIVITY_EXPIRES) {
                // If inactivity expires time is now or past and we're on a monitored route, show modal
                try {
                    const stored = ev.newValue ? Number(ev.newValue) : null;
                    if (stored && Date.now() >= stored && isMonitoredRoute()) {
                        setShowModal(true);
                        // set modal expiry based on now
                        const modalExpires = Date.now() + MODAL_COUNTDOWN_SECONDS * 1000;
                        modalExpiresAtRef.current = modalExpires;
                        try { localStorage.setItem(LS_MODAL_EXPIRES, String(modalExpires)); } catch (e) { }
                    }
                } catch (e) { }
            }

            if (ev.key === LS_MODAL_EXPIRES) {
                // Another tab updated modal expiry; if it is expired, perform auto action
                try {
                    const stored = ev.newValue ? Number(ev.newValue) : null;
                    if (stored) {
                        modalExpiresAtRef.current = stored;
                        if (Date.now() >= stored) {
                            handleAutoAction();
                        } else {
                            // ensure modal visible and countdown follows
                            setShowModal(true);
                        }
                    }
                } catch (e) { }
            }
        };

        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [handleAutoAction, isMonitoredRoute]);

    // When page visibility changes, check deadlines immediately so we don't wait for throttled timers
    useEffect(() => {
        const onVisibility = () => {
            // If inactivity expired while tab was hidden, show modal (or auto action)
            try {
                const storedInactivity = localStorage.getItem(LS_INACTIVITY_EXPIRES);
                if (storedInactivity) {
                    const inactivityExp = Number(storedInactivity);
                    if (Date.now() >= inactivityExp && isMonitoredRoute()) {
                        setShowModal(true);
                        const modalExpires = Date.now() + MODAL_COUNTDOWN_SECONDS * 1000;
                        modalExpiresAtRef.current = modalExpires;
                        try { localStorage.setItem(LS_MODAL_EXPIRES, String(modalExpires)); } catch (e) { }
                    }
                }

                const storedModal = localStorage.getItem(LS_MODAL_EXPIRES);
                if (storedModal) {
                    const modalExp = Number(storedModal);
                    modalExpiresAtRef.current = modalExp;
                    if (Date.now() >= modalExp) {
                        handleAutoAction();
                    } else {
                        setShowModal(true);
                    }
                }
            } catch (e) { }
        };

        document.addEventListener('visibilitychange', onVisibility);
        return () => document.removeEventListener('visibilitychange', onVisibility);
    }, [handleAutoAction, isMonitoredRoute]);

    const handleContinue = () => {
        setShowModal(false);
        resetInactivityTimer();
    };
    const handleEndSessionNow = () => {
        handleAutoAction();
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearInactivityTimer();
            clearCountdown();
        };
    }, []);

    if (!showModal) return null;

    const isSignup = location?.startsWith("/signup/");
    const isDashboard = location?.startsWith("/dashboard/");

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inactivity-title"
        >
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 border">
                <h2 id="inactivity-title" className="text-lg font-semibold text-gray-900 mb-2 text-center">
                    Are you still there?
                </h2>
                <p className="text-sm text-gray-600 mb-4 text-center">
                    You've been inactive for a while. {isSignup && "For security, your signup session will end."}
                    {isDashboard && "For security, you'll be logged out soon."}
                </p>
                <div className="flex items-center justify-center mb-6">
                    <div className="text-4xl font-bold tabular-nums text-primary">
                        {countdown}
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleContinue}
                        autoFocus
                        className="flex-1 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                        Continue Session
                    </button>
                    <button
                        onClick={handleEndSessionNow}
                        className="flex-1 px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
                    >
                        {isSignup ? "Go Home Now" : "Logout Now"}
                    </button>
                </div>
                <p className="mt-4 text-[11px] text-center text-gray-400">
                    Auto {isSignup ? "redirect" : "logout"} after timeout for your security.
                </p>
            </div>
        </div>
    );
};

export default InactivityTracker;
