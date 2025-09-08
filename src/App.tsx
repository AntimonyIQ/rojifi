import { Route, Switch } from "wouter";

import React from "react";
import NotFound from "@/pages/not-found";
import { AnimatePresence } from "framer-motion";
import { ProtectedRoute } from "./app/ProtectedRoute";
import { RedirectIfAuthenticated } from "./app/RedirectIfAuthenticated";
import LoginPage from "./v1/app/login/page";
import { DashboardLayout } from "./v1/components/dashboard/dashboard-layout";
import { VerificationInReview } from "./v1/components/dashboard/verification-in-review";
import Home from "./v1/app/page";
import ContactPage from "./v1/app/contactus/page";
import DashboardPage from "./v1/app/dashboard/[wallet]/page";
import VirtualCardPage from "./v1/app/dashboard/[wallet]/virtualcard/page";
import BeneficiaryPage from "./v1/app/dashboard/[wallet]/beneficiary/page";
import WalletPage from "./v1/app/dashboard/[wallet]/wallet/page";
import TeamsPage from "./v1/app/dashboard/[wallet]/teams/page";
import StatementPage from "./v1/app/dashboard/[wallet]/statement/page";
import SwapPage from "./v1/app/dashboard/[wallet]/swap/page";
import SenderPage from "./v1/app/dashboard/[wallet]/sender/page";
import EditSenderPage from "./v1/app/dashboard/[wallet]/sender/edit/page";
import OTCDashboardPage from "./v1/app/dashboard/[wallet]/otc/page";
import PaymentPage from "./v1/app/dashboard/[wallet]/payment/page";
import BusinessProfilePage from "./v1/app/dashboard/[wallet]/businessprofile/page";
import DepositPage from "./v1/app/dashboard/[wallet]/deposit/page";
import SettingsPage from "./v1/app/dashboard/[wallet]/settings/page";
import TransactionsPage from "./v1/app/dashboard/[wallet]/transactions/page";
import AboutPage from "./v1/app/about/page";
import CardsPage from "./v1/app/cards/page";
import ForgotPasswordPage from "./v1/app/forgot-password/page";
import HelpPage from "./v1/app/help/page";
import MulticurrencyPage from "./v1/app/multicurrency/page";
import OnboardingPage from "./v1/app/onboarding/page";
import OtcPage from "./v1/app/otc/page";
// import OtpPage from "./v1/app/otp/page";
import PrivacyPage from "./v1/app/privacy/page";
import RequestAccessPage from "./v1/app/request-access/page";
import ResetPasswordPage from "./v1/app/reset-password/page";
import VerifyEmailPage from "./v1/app/verify-email/page";
import SignupPage from "./v1/app/signup/[id]/page";
import BusinessDetailsPage from "./v1/app/signup/[id]/business-details/page";
import KYCKYBVerificationPage from "./v1/app/signup/[id]/verification/page";
import InvitationPage from "./v1/app/invitation/[id]/page";
import FaqPage from "./v1/app/faq/page";
import DirectorPage from "./v1/app/signup/[id]/director/page";
import { session, SessionData } from "./v1/session/session";
// ...existing code...

function AppRoute({
    path,
    page: Page,
}: {
    path: string;
    page: React.ComponentType;
}) {
    const sd: SessionData = session.getUserData();

    // State 1: No sender data - show normal page
    if (!sd || !sd.sender) {
        return (
            <ProtectedRoute path={path}>
                <DashboardLayout>
                    <Page />
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    const isVerificationComplete = sd.sender.businessVerificationCompleted;

    // State 2: Verification incomplete
    if (!isVerificationComplete) {
        // Exception: Business profile page should still show normally
        if (path === "/dashboard/:wallet/businessprofile") {
            return (
                <Route path={path}>
                    {() => (
                        <ProtectedRoute path={path}>
                            <DashboardLayout>
                                <BusinessProfilePage />
                            </DashboardLayout>
                        </ProtectedRoute>
                    )}
                </Route>
            );
        }

        // All other routes show verification in review component
        // Render within Route component so useParams works correctly
        return (
            <Route path={path}>
                {() => (
                    <ProtectedRoute path={path}>
                        <DashboardLayout>
                            <VerificationInReview />
                        </DashboardLayout>
                    </ProtectedRoute>
                )}
            </Route>
        );
    }

    // State 3: Verification complete - show normal pages
    return (
        <Route path={path}>
            {() => (
                <ProtectedRoute path={path}>
                    <DashboardLayout>
                        <Page />
                    </DashboardLayout>
                </ProtectedRoute>
            )}
        </Route>
    );
}

function App() {

    const routes: Array<{ path: string, element: React.ReactElement }> = [
        { path: "/", element: <Home /> },
        { path: "/about", element: <AboutPage /> },
        { path: "/cards", element: <CardsPage /> },
        { path: "/contactus", element: <ContactPage /> },
        { path: "/faq", element: <FaqPage /> },
        { path: "/forgot-password", element: <ForgotPasswordPage /> },
        { path: "/help", element: <HelpPage /> },
        { path: "/multicurrency", element: <MulticurrencyPage /> },
        { path: "/onboarding", element: <OnboardingPage /> },
        { path: "/otc", element: <OtcPage /> },
        // { path: "/otp", element: <OtpPage /> },
        { path: "/privacy", element: <PrivacyPage /> },
        { path: "/request-access", element: <RequestAccessPage /> },
        { path: "/reset-password", element: <ResetPasswordPage /> },
        { path: "/verify-email", element: <VerifyEmailPage /> },
        { path: "/signup/:id/verification", element: <KYCKYBVerificationPage /> },
        { path: "/signup/:id/business-details", element: <BusinessDetailsPage /> },
        { path: "/signup/:id/director", element: <DirectorPage /> },
        { path: "/signup/:id", element: <SignupPage /> },
        { path: "/invitation/:id", element: <InvitationPage /> },
    ];

    return (
        <AnimatePresence mode="wait">
            <Switch>
                <RedirectIfAuthenticated path="/login">
                    <LoginPage />
                </RedirectIfAuthenticated>
                <AppRoute path="/dashboard/:wallet/virtualcard" page={VirtualCardPage} />
                <AppRoute path="/dashboard/:wallet/bankstatement" page={StatementPage} />
                <AppRoute path="/dashboard/:wallet/beneficiary" page={BeneficiaryPage} />
                <AppRoute path="/dashboard/:wallet/wallet" page={WalletPage} />
                <AppRoute path="/dashboard/:wallet/teams" page={TeamsPage} />
                <AppRoute path="/dashboard/:wallet/statement" page={StatementPage} />
                <AppRoute path="/dashboard/:wallet/swap" page={SwapPage} />
                <AppRoute path="/dashboard/:wallet/sender/edit" page={EditSenderPage} />
                <AppRoute path="/dashboard/:wallet/sender" page={SenderPage} />
                <AppRoute path="/dashboard/:wallet/otc" page={OTCDashboardPage} />
                <AppRoute path="/dashboard/:wallet/payment" page={PaymentPage} />
                <AppRoute path="/dashboard/:wallet/businessprofile" page={BusinessProfilePage} />
                <AppRoute path="/dashboard/:wallet/deposit" page={DepositPage} />
                <AppRoute path="/dashboard/:wallet/settings" page={SettingsPage} />
                <AppRoute path="/dashboard/:wallet/transactions" page={TransactionsPage} />
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
