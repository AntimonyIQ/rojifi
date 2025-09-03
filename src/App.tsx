import { Route, Switch } from "wouter";
import LoginPage from "@/app/login/page";
import DashboardPage from "@/app/dashboard/page";
import UsersPage from "@/app/users/page";
import TransactionsPage from "@/app/transactions/page";
import AnalyticsPage from "@/app/analytics/page";
import SettingsPage from "@/app/settings/page";
import StaffManagementPage from "@/app/staff/page";

import MessagingPage from "@/app/messaging/page";
import NotFound from "@/pages/not-found";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AnimatePresence } from "framer-motion";
import { ProtectedRoute } from "./app/ProtectedRoute";
import { RedirectIfAuthenticated } from "./app/RedirectIfAuthenticated";
import WalletsPage from "./app/wallets/page";
import OTCPage from "./app/otc/page";
import VirtualCardPage from "./app/virtualcard/page";
import SendersPage from "./app/senders/page";

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
    return (
        <AnimatePresence mode="wait">
            <Switch>
                {/* <Route path="/" component={LoginPage} /> */}
                <RedirectIfAuthenticated path="/">
                    <LoginPage />
                </RedirectIfAuthenticated>
                <AppRoute path="/dashboard" page={DashboardPage} />
                <AppRoute path="/users" page={UsersPage} />
                <AppRoute path="/transactions" page={TransactionsPage} />
                <AppRoute path="/analytics" page={AnalyticsPage} />
                <AppRoute path="/messaging" page={MessagingPage} />
                <AppRoute path="/settings" page={SettingsPage} />
                <AppRoute path="/staff" page={StaffManagementPage} />
                <AppRoute path="/wallets" page={WalletsPage} />
                <AppRoute path="/otc" page={OTCPage} />
                <AppRoute path="/virtual-card" page={VirtualCardPage} />
                <AppRoute path="/senders" page={SendersPage} />
                <Route path="*">
                    <NotFound />
                </Route>
            </Switch>
        </AnimatePresence>
    );
}

export default App;
