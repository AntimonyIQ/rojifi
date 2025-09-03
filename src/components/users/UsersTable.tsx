import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    MoreVertical,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import UserDetailsDialog from "./UserDetailsDialog";
import { format } from "date-fns";
import UserEditDialog from "./UserEditDialog";
import UserDeleteDialog from "./UserDeleteDialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import UserAccountsDialog from "./UserAccountsDialog";
import UserIssueVirtualAccountDialog from "./UserIssueVirtualAccountDialog";
import { IUser } from "@/interface/interface";

interface UsersTableProps {
    users: Array<IUser>;
    loading: boolean;
    total?: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export default function UsersTable({
    users = [],
    loading = false,
    total = 0,
    currentPage,
    onPageChange,
}: UsersTableProps) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>(""); // "" = All, "active", "inactive"
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [virtualAccountsDialogOpen, setVirtualAccountsDialogOpen] =
        useState(false);
    const [issueVirtualAccountsDialogOpen, setIssueVirtualAccountsDialogOpen] =
        useState(false);
    const itemsPerPage = 10;

    // console.log("total users:", total);
    // console.log("users:", users);

    // Filter users based on search and status
    const filteredUsers = users.filter((user) => {
        // Search filter
        const matchesSearch =
            user.firstname.toLowerCase().includes(search.toLowerCase()) ||
            user.lastname.toLowerCase().includes(search.toLowerCase()) ||
            user.fullName.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            user._id.toString().includes(search);

        // Status filter

        return matchesSearch;
    });

    const totalPages = Math.ceil(total / itemsPerPage);

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

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handleOpenDetails = (user: IUser) => {
        setSelectedUser(user);
        setDetailsOpen(true);
    };

    const handleOpenVirtualAccounts = (user: IUser) => {
        setSelectedUser(user);
        setVirtualAccountsDialogOpen(true);
    };

    const handleIssueVirtualAccount = (user: IUser) => {
        setSelectedUser(user);
        setIssueVirtualAccountsDialogOpen(true);
    };

    const handleOpenEditUser = (user: IUser) => {
        setSelectedUser(user);
        setEditModalOpen(true);
    };

    // @ts-ignore
    const handleOpenDeleteUser = (user: IUser) => {
        setSelectedUser(user);
        setDeleteModalOpen(true);
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

    // Loading state
    if (loading) {
        return (
            <Card>
                <CardHeader className="px-6 py-5 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-32" />
                        <div className="flex gap-2">
                            <Skeleton className="h-10 w-64" />
                            <Skeleton className="h-10 w-10" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <Skeleton className="h-4 w-10" />
                                </TableHead>
                                <TableHead>
                                    <Skeleton className="h-4 w-20" />
                                </TableHead>
                                <TableHead>
                                    <Skeleton className="h-4 w-20" />
                                </TableHead>
                                <TableHead>
                                    <Skeleton className="h-4 w-20" />
                                </TableHead>
                                <TableHead>
                                    <Skeleton className="h-4 w-20" />
                                </TableHead>
                                <TableHead>
                                    <Skeleton className="h-4 w-10" />
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 10 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <Skeleton className="h-4 w-10" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <div className="ml-3">
                                                <Skeleton className="h-4 w-24" />
                                                <Skeleton className="h-3 w-32 mt-1" />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-36" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-24" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end">
                                            <Skeleton className="h-8 w-16" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-48" />
                            <div className="flex space-x-2">
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-8 w-24" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader className="px-6 py-5 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <CardTitle className="text-xl font-semibold text-gray-800">
                            Users
                        </CardTitle>
                        <div className="flex w-full md:w-auto gap-2">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search users..."
                                    className="pl-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Status filter pills */}
                    <div className="flex flex-wrap items-center gap-2 mt-4 border-t border-gray-100 pt-4">
                        <span className="text-sm text-gray-500 mr-2">Status:</span>
                        <Badge
                            variant={statusFilter === "" ? "default" : "outline"}
                            className={`cursor-pointer hover:bg-primary/90 transition-all ${statusFilter === ""
                                ? "bg-primary text-white"
                                : "text-gray-600 hover:text-white"
                                }`}
                            onClick={() => setStatusFilter("")}
                        >
                            All
                        </Badge>
                        <Badge
                            variant={statusFilter === "active" ? "default" : "outline"}
                            className={`cursor-pointer transition-all ${statusFilter === "active"
                                ? "bg-green-600 text-white hover:bg-green-700"
                                : "text-green-700 border-green-200 bg-green-50 hover:bg-green-100"
                                }`}
                            onClick={() => setStatusFilter("active")}
                        >
                            Active
                        </Badge>
                        <Badge
                            variant={statusFilter === "inactive" ? "default" : "outline"}
                            className={`cursor-pointer transition-all ${statusFilter === "inactive"
                                ? "bg-gray-600 text-white hover:bg-gray-700"
                                : "text-gray-700 border-gray-200 bg-gray-50 hover:bg-gray-100"
                                }`}
                            onClick={() => setStatusFilter("inactive")}
                        >
                            Inactive
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {/* <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </TableHead> */}
                                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID
                                    </TableHead>
                                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Business Name
                                    </TableHead>
                                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Country
                                    </TableHead>
                                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </TableHead>
                                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Joined Date
                                    </TableHead>
                                    <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </TableHead>
                                    {/* <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></TableHead> */}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user._id}>
                                            {/* <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.id}
                      </TableCell> */}
                                            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user._id === null ? "N/A" : user._id}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div
                                                        className={`h-8 w-8 rounded-full flex items-center justify-center font-medium ${getAvatarColor(
                                                            user.fullName
                                                        )}`}
                                                    >
                                                        {getInitials(user.fullName)}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.fullName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.country === null ? "N/A" : user.country}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 whitespace-nowrap">
                                                <Badge
                                                    className={`font-medium ${getStatusColor(
                                                        user.isActive ? "active" : "inactive"
                                                    )}`}
                                                >
                                                    {user.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {format(new Date(user.createdAt), "MMM d, yyyy")}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <button className="p-1 rounded-md hover:bg-muted">
                                                            <MoreVertical className="size-5 text-gray-600" />
                                                        </button>
                                                    </PopoverTrigger>

                                                    <PopoverContent
                                                        className="w-[200px] p-2"
                                                        align="end"
                                                        side="bottom"
                                                    >
                                                        <div className="space-y-1 ">
                                                            <Button
                                                                variant="ghost"
                                                                className="text-gray-700 hover:text-gray-700/80"
                                                                onClick={() => handleOpenDetails(user)}
                                                            >
                                                                View User Info
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                className="text-gray-700 hover:text-gray-700/80"
                                                                onClick={() => handleOpenVirtualAccounts(user)}
                                                            >
                                                                View Accounts
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                className="text-gray-700 hover:text-gray-700/80"
                                                                onClick={() => handleIssueVirtualAccount(user)}
                                                            >
                                                                Issue Virtual Account
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                className="text-gray-700 hover:text-gray-700/80"
                                                                onClick={() => handleOpenEditUser(user)}
                                                            >
                                                                Edit User Info
                                                            </Button>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </TableCell>
                                            {/* <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          className="text-primary hover:text-primary/80"
                          onClick={() => handleOpenEditUser(user)}
                        >
                          <SquarePen />
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-red-600 hover:text-red-500/80"
                          onClick={() => handleOpenDeleteUser(user)}
                        >
                          <Trash />
                        </Button>
                      </TableCell> */}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="text-sm text-gray-700">
                                Showing{" "}
                                <span className="font-medium">
                                    {filteredUsers.length > 0
                                        ? (currentPage - 1) * itemsPerPage + 1
                                        : 0}
                                </span>{" "}
                                to{" "}
                                <span className="font-medium">
                                    {Math.min(currentPage * itemsPerPage, total)}
                                </span>{" "}
                                of <span className="font-medium">{total}</span> users
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePreviousPage}
                                // disabled={page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNextPage}
                                // disabled={page >= totalPages}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <UserDetailsDialog
                user={selectedUser}
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
            />
            {/* user accounts - virtual accounts & linked bank accounts */}
            <UserAccountsDialog
                user={selectedUser}
                open={virtualAccountsDialogOpen}
                onOpenChange={setVirtualAccountsDialogOpen}
            />
            {/* issue virtual account */}
            <UserIssueVirtualAccountDialog
                user={selectedUser}
                open={issueVirtualAccountsDialogOpen}
                onOpenChange={setIssueVirtualAccountsDialogOpen}
            />

            {/* user edit dialog */}
            <UserEditDialog
                user={selectedUser}
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
            />
            {/* user delete dialog */}
            <UserDeleteDialog
                user={selectedUser}
                open={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
            />
        </>
    );
}
