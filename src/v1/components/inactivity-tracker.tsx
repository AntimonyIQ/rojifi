import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { session } from "@/v1/session/session";

// InactivityTracker: Shows a confirmation modal after 5 minutes of no user activity
// If user doesn't respond within 30s:
//  - On /signup/* routes: redirect to home page
//  - On /dashboard/* routes: logout and redirect to /login

const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const MODAL_COUNTDOWN_SECONDS = 30; // 30s countdown once modal appears

export const InactivityTracker: React.FC = () => {
    const [location, navigate] = useLocation();
    const [showModal, setShowModal] = useState(false);
    const [countdown, setCountdown] = useState(MODAL_COUNTDOWN_SECONDS);

    const inactivityTimerRef = useRef<number | null>(null);
    const countdownIntervalRef = useRef<number | null>(null);
    const lastActivityRef = useRef<number>(Date.now());

    const isMonitoredRoute = useCallback(() => {
        if (!location) return false;
        return location.startsWith("/signup/") || location.startsWith("/dashboard/");
    }, [location]);

    const clearInactivityTimer = () => {
        if (inactivityTimerRef.current) {
            window.clearTimeout(inactivityTimerRef.current);
            inactivityTimerRef.current = null;
        }
    };

    const clearCountdown = () => {
        if (countdownIntervalRef.current) {
            window.clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
    };

    const resetInactivityTimer = useCallback(() => {
        if (!isMonitoredRoute()) return; // Only track on monitored routes
        clearInactivityTimer();
        inactivityTimerRef.current = window.setTimeout(() => {
            // Trigger modal after inactivity timeout
            setShowModal(true);
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

    // Countdown management when modal becomes visible
    useEffect(() => {
        if (showModal) {
            clearCountdown();
            setCountdown(MODAL_COUNTDOWN_SECONDS);
            countdownIntervalRef.current = window.setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        window.setTimeout(() => {
                            handleAutoAction();
                        }, 0);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearCountdown();
        }
        return () => clearCountdown();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showModal]);

    const handleContinue = () => {
        setShowModal(false);
        resetInactivityTimer();
    };

    const handleAutoAction = useCallback(() => {
        if (!location) return;
        setShowModal(false);
        clearInactivityTimer();
        clearCountdown();

        if (location.startsWith("/signup/")) {
            navigate("/");
        } else if (location.startsWith("/dashboard/")) {
            session.logout();
            navigate("/login");
        }
    }, [location, navigate]);

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
