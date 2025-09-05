import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/v1/components/ui/button";
import { Input } from "@/v1/components/ui/input";
import { Label } from "@/v1/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/v1/components/ui/card";
import { Alert, AlertDescription } from "@/v1/components/ui/alert";
import { Loader2, UserPlus, Eye, EyeOff } from "lucide-react";
import { session } from "@/v1/session/session";
import Defaults from "@/v1/defaults/defaults";

interface InvitationData {
    email: string;
    role: string;
    organisationName: string;
    status: string;
}

export default function TeamInvitationPage() {
    const { id } = useParams();
    const [, setLocation] = useLocation();
    const [loading, setLoading] = useState(false);
    const [fetchingInvite, setFetchingInvite] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    useEffect(() => {
        if (id) {
            fetchInvitationDetails();
        }
    }, [id]);

    const fetchInvitationDetails = async () => {
        try {
            setFetchingInvite(true);
            setError("");

            // Fetch invitation details using the ID
            const url = `${Defaults.API_BASE_URL}/teams/invite/${id}`;
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();

            if (data.status === "error") {
                throw new Error(data.message || "Failed to fetch invitation details");
            }

            if (data.status === "success" && data.handshake) {
                // Parse the encrypted invitation data
                const sessionData = session.getUserData();
                const inviteData = Defaults.PARSE_DATA(data.data, sessionData?.client?.privateKey || "", data.handshake);

                if (inviteData.accepted) {
                    setError("This invitation has already been accepted.");
                    return;
                }

                if (inviteData.deleted || inviteData.archived) {
                    setError("This invitation is no longer valid.");
                    return;
                }

                setInvitationData({
                    email: inviteData.email,
                    role: inviteData.role,
                    organisationName: inviteData.organisationName || "Organization",
                    status: inviteData.status
                });

                setFormData(prev => ({
                    ...prev,
                    email: inviteData.email
                }));
            }
        } catch (error) {
            console.error("Error fetching invitation:", error);
            setError(error instanceof Error ? error.message : "Failed to load invitation details");
        } finally {
            setFetchingInvite(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            // Validation
            if (!formData.fullName.trim()) {
                throw new Error("Full name is required");
            }

            if (formData.fullName.trim().length < 2) {
                throw new Error("Full name must be at least 2 characters");
            }

            if (!formData.password) {
                throw new Error("Password is required");
            }

            if (formData.password.length < 8) {
                throw new Error("Password must be at least 8 characters");
            }

            if (formData.password !== formData.confirmPassword) {
                throw new Error("Passwords do not match");
            }

            // Accept the invitation
            const url = `${Defaults.API_BASE_URL}/teams/accept-invite`;
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    rojifiId: id,
                    fullName: formData.fullName.trim(),
                    password: formData.password
                })
            });

            const data = await res.json();

            if (data.status === "error") {
                throw new Error(data.message || "Failed to accept invitation");
            }

            setSuccess("Invitation accepted successfully! Redirecting to login...");

            // Redirect to login after 2 seconds
            setTimeout(() => {
                setLocation("/login");
            }, 2000);

        } catch (error) {
            console.error("Error accepting invitation:", error);
            setError(error instanceof Error ? error.message : "Failed to accept invitation");
        } finally {
            setLoading(false);
        }
    };

    if (fetchingInvite) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-8 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                        <p className="text-gray-600">Loading invitation details...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="shadow-xl border-0">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                            <UserPlus className="h-8 w-8 text-blue-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            Join {invitationData?.organisationName}
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                            Complete your team onboarding to get started
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6">
                        {error && (
                            <Alert className="mb-6 border-red-200 bg-red-50">
                                <AlertDescription className="text-red-700">
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert className="mb-6 border-green-200 bg-green-50">
                                <AlertDescription className="text-green-700">
                                    {success}
                                </AlertDescription>
                            </Alert>
                        )}

                        {invitationData && (
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Role:</strong> {invitationData.role}
                                </p>
                                <p className="text-sm text-blue-800">
                                    <strong>Organization:</strong> {invitationData.organisationName}
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    readOnly
                                    disabled
                                    className="bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a secure password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loading}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                disabled={loading || !invitationData}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Accepting Invitation...
                                    </>
                                ) : (
                                    "Accept Invitation & Join Team"
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-gray-500">
                            By accepting this invitation, you agree to our{" "}
                            <a href="/privacy" className="text-blue-600 hover:underline">
                                Terms of Service
                            </a>{" "}
                            and{" "}
                            <a href="/privacy" className="text-blue-600 hover:underline">
                                Privacy Policy
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
