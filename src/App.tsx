import { Route, Switch } from "wouter";
// import DashboardPage from "@/v1/app/dashboard/page";
// import UsersPage from "@/app/users/page";
// import TransactionsPage from "@/app/transactions/page";
// import AnalyticsPage from "@/app/analytics/page";
// import SettingsPage from "@/app/settings/page";
// import StaffManagementPage from "@/app/staff/page";

// import MessagingPage from "@/app/messaging/page";
import NotFound from "@/pages/not-found";
// import DashboardLayout from "@/components/layout/DashboardLayout";
import { AnimatePresence } from "framer-motion";
import { ProtectedRoute } from "./app/ProtectedRoute";
import { RedirectIfAuthenticated } from "./app/RedirectIfAuthenticated";
// import WalletsPage from "./app/wallets/page";
// import OTCPage from "./app/otc/page";
// import VirtualCardPage from "./app/virtualcard/page";
// import SendersPage from "./app/senders/page";
import LoginPage from "./v1/app/login/page";
import { DashboardLayout } from "./v1/components/dashboard/dashboard-layout";
import Home from "./v1/app/page";
import ContactPage from "./v1/app/contactus/page";
import DashboardPage from "./v1/app/dashboard/[wallet]/page";
import AboutPage from "./v1/app/about/page";
import CardsPage from "./v1/app/cards/page";
import ForgotPasswordPage from "./v1/app/forgot-password/page";
import HelpPage from "./v1/app/help/page";
import MulticurrencyPage from "./v1/app/multicurrency/page";
import OnboardingPage from "./v1/app/onboarding/page";
import OtcPage from "./v1/app/otc/page";
import OtpPage from "./v1/app/otp/page";
import PrivacyPage from "./v1/app/privacy/page";
import RequestAccessPage from "./v1/app/request-access/page";
import ResetPasswordPage from "./v1/app/reset-password/page";
import VerifyEmailPage from "./v1/app/verify-email/page";
import React from "react";

function AppRoute({
    path,
    page: Page,
}: {
    path: string;
    page: React.ComponentType;
}) {
    return (
        <ProtectedRoute path={path}>
            <DashboardLayout>
                <Page />
            </DashboardLayout>
        </ProtectedRoute>
    );
}

function App() {

    const routes: Array<{ path: string, element: React.ReactElement }> = [
        { path: "/", element: <Home /> },
        { path: "/about", element: <AboutPage /> },
        { path: "/cards", element: <CardsPage /> },
        { path: "/contactus", element: <ContactPage /> },
        { path: "/forgot-password", element: <ForgotPasswordPage /> },
        { path: "/help", element: <HelpPage /> },
        { path: "/multicurrency", element: <MulticurrencyPage /> },
        { path: "/onboarding", element: <OnboardingPage /> },
        { path: "/otc", element: <OtcPage /> },
        { path: "/otp", element: <OtpPage /> },
        { path: "/privacy", element: <PrivacyPage /> },
        { path: "/request-access", element: <RequestAccessPage /> },
        { path: "/reset-password", element: <ResetPasswordPage /> },
        { path: "/verify-email", element: <VerifyEmailPage /> },
    ];

    return (
        <AnimatePresence mode="wait">
            <Switch>
                <RedirectIfAuthenticated path="/login">
                    <LoginPage />
                </RedirectIfAuthenticated>
                <AppRoute path="/dashboard/:wallet" page={DashboardPage} />

                {routes.map((r, i) => (
                    < Route key={i} path={r.path}>{r.element}</Route>
                ))}

                <Route path="*">
                    <NotFound />
                </Route>
            </Switch>
        </AnimatePresence>
    );
}

export default App;
