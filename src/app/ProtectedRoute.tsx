import { session, SessionData } from "@/v1/session/session";
import { Redirect, useRoute } from "wouter";

export function ProtectedRoute({
    path,
    children,
}: {
    path: string;
    children: React.ReactNode;
}) {
    const sd: SessionData = session.getUserData();
    const [match] = useRoute(path);

    console.log('ProtectedRoute check:', {
        path,
        match,
        isLoggedIn: sd?.isLoggedIn,
        hasUserData: !!sd,
        sessionCheck: session.checkLoggedIn()
    });

    if (!match) return null;

    if (!sd || !sd.isLoggedIn) {
        console.log('ProtectedRoute: Redirecting to /login');
        return <Redirect to="/login" />;
    }

    return <>{children}</>;
}
