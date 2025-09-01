import { session, SessionData } from "@/session/session";
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

    if (!match) return null;

    if (!sd || !sd.isLoggedIn) {
        return <Redirect to="/" />;
    }

    return <>{children}</>;
}
