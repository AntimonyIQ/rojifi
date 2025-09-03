import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
// @ts-ignore
import { AlertCircle, User as UserIcon, CreditCard, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import KycForm from "./Kycform";
import WalletsComponent from "./WalletComponent";
import { IUser } from "@/interface/interface";
import TransactionsComponent from "./TransactionComponent";

interface UserDetailsDialogProps {
    user: IUser | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function UserDetailsDialog({
    user,
    open,
    onOpenChange,
}: UserDetailsDialogProps) {
    if (!user) return null;

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
                return "bg-green-100 text-green-800";
            case "inactive":
                return "bg-gray-100 text-gray-800";
            case "suspended":
                return "bg-red-100 text-red-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-blue-100 text-blue-800";
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase();
    };

    const getAvatarColor = (name: string) => {
        const colors = [
            "bg-green-100 text-green-700",
            "bg-blue-100 text-blue-700",
            "bg-purple-100 text-purple-700",
            "bg-indigo-100 text-indigo-700",
            "bg-pink-100 text-pink-700",
        ];

        // Simple hash function to get consistent color for a name
        const hash = name.split("").reduce((acc, char) => {
            return acc + char.charCodeAt(0);
        }, 0);

        return colors[hash % colors.length];
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1350px] max-h-[90vh] overflow-auto hide-scrollbar">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                        User Details
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col sm:flex-row items-start gap-4 py-4">
                    <div
                        className={cn(
                            "h-16 w-16 rounded-full flex items-center justify-center text-xl font-medium",
                            getAvatarColor(user.fullName)
                        )}
                    >
                        {getInitials(user.fullName)}
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-medium">{user.fullName}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <Badge className={cn("mt-2", getStatusColor(user.isActive ? "active" : "inactive"))}>
                            {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                </div>

                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="w-full grid grid-cols-4">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="transactions">Transactions</TabsTrigger>
                        <TabsTrigger value="kyc">Kyc</TabsTrigger>
                        <TabsTrigger value="wallets">Wallets</TabsTrigger>
                        {/* <TabsTrigger value="activity">Activity</TabsTrigger>  */}
                    </TabsList>
                    <TabsContent value="profile" className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500">Phone</p>
                                <p className="text-sm">
                                    {user.phoneNumber === null ? "N/A" : user.phoneNumber}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500">Date Joined</p>
                                <p className="text-sm">
                                    {format(new Date(user.createdAt), "MMMM d, yyyy")}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500">User ID</p>
                                <p className="text-sm">{user._id}</p>
                            </div>
                            <div className="space-y-1">
                                {/* <p className="text-xs font-medium text-gray-500">Last Login</p> */}
                                {/* <p className="text-sm">{format(new Date(user.lastLoginDate), "MMM d, yyyy, h:mm a")}</p> */}
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <p className="text-xs font-medium text-gray-500">Address</p>
                                <p className="text-sm">
                                    {user.address + " " + user.address}
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="activity" className="mt-4">
                        <div className="rounded-md border">
                            <div className="py-4 px-4 flex items-center justify-between border-b">
                                <h3 className="text-sm font-medium">Activity Log</h3>
                                <p className="text-xs text-gray-500">Last 7 days</p>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="transactions" className="mt-4">
                        <TransactionsComponent userId={user._id} />
                    </TabsContent>
                    <TabsContent value="wallets">
                        <WalletsComponent userId={user._id} />
                    </TabsContent>
                    <TabsContent value="kyc">
                        <KycForm userId={user._id} />
                    </TabsContent>
                </Tabs>

                <DialogFooter>

                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
