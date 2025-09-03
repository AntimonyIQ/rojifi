import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IPagination, IResponse, IUser } from "@/interface/interface";
import Defaults from "@/defaults/defaults";
import { session, SessionData } from "@/session/session";
import { RequestStatus, Status } from "@/enums/enums";

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Check, MessageSquare, X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
// ...existing code... (removed unused Select imports)

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function OTCPage() {
    const [value, setValue] = useState<string>("requests");
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const [selectedAction, setSelectedAction] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [users, setUsers] = useState<Array<IUser>>([]);
    const [search, _setSearch] = useState<string>("");
    const [pagination, setPagination] = useState<IPagination>({
        total: 0,
        totalPages: 0,
        page: 1,
        limit: 10,
    });
    const sd: SessionData = session.getUserData();

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, pagination.limit, search]);

    const fetchUsers = async () => {
        try {
            setLoading(true)

            Defaults.LOGIN_STATUS();

            const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
            // const statusParam = statusFilter ? `&status=${encodeURIComponent(statusFilter)}` : "";
            const url: string = `${Defaults.API_BASE_URL}/admin/user/list?otcdesk=${RequestStatus.PENDING}&page=${pagination.page}&limit=${pagination.limit}${searchParam}`;

            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    'x-rojifi-handshake': sd.client.publicKey,
                    'x-rojifi-deviceid': sd.deviceid,
                    Authorization: `Bearer ${sd.authorization}`,
                },
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error('Unable to process login response right now, please try again.');
                const parseData: Array<IUser> = Defaults.PARSE_DATA(data.data, sd.client.privateKey, data.handshake);
                setUsers(parseData);
                if (data.pagination) {
                    setPagination(data.pagination);
                }
            }
        } catch (error: any) {
            console.error("Error fetching senders:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 p-4">
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">OTC</h1>
                <p className="text-sm text-muted-foreground">Admin panel for OTC requests and management</p>
            </header>

            <div className="bg-card p-4 rounded-md">
                <Tabs value={value} onValueChange={(v) => setValue(v)}>
                    <TabsList>
                        <TabsTrigger value="requests">Requests</TabsTrigger>
                        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                        <TabsTrigger value="admin">Admin</TabsTrigger>
                    </TabsList>

                    <TabsContent value="requests">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium">Requests</h2>
                                <div>
                                    <Button variant="outline" className="btn btn-sm">New Request</Button>
                                </div>
                            </div>

                            <div className="mt-4 overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User ID</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-6 text-sm text-muted-foreground">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                                        <span>Loading requests...</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {!loading && users.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-6 text-sm text-muted-foreground">No OTC requests found.</TableCell>
                                            </TableRow>
                                        )}

                                        {!loading && users.map((u: IUser, idx: number) => (
                                            <TableRow key={u._id || idx}>
                                                <TableCell>{u._id || "-"}</TableCell>
                                                <TableCell>{u.fullName || (u as any).name || "-"}</TableCell>
                                                <TableCell>{u.email || "-"}</TableCell>
                                                <TableCell>{u.country || "-"}</TableCell>
                                                <TableCell>
                                                    {(() => {
                                                        const s = u.requested?.otcdesk as RequestStatus | undefined;
                                                        const mapVariant = (st?: RequestStatus) => {
                                                            switch (st) {
                                                                case RequestStatus.PENDING:
                                                                    return "warning";
                                                                case RequestStatus.APPROVED:
                                                                    return "success";
                                                                case RequestStatus.DENIED:
                                                                    return "destructive";
                                                                default:
                                                                    return "outline";
                                                            }
                                                        };
                                                        return (
                                                            <Badge variant={mapVariant(s)} className=" lowercase">
                                                                {s ? String(s) : "-"}
                                                            </Badge>
                                                        );
                                                    })()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-end">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="btn btn-ghost btn-sm" aria-label="Actions">
                                                                    <MoreHorizontal size={16} />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent>
                                                                <DropdownMenuItem onSelect={() => { setSelectedUser(u); setSelectedAction('approve'); setIsDialogOpen(true); }}>
                                                                    <Check className="mr-2" size={14} /> Approve
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => { setSelectedUser(u); setSelectedAction('send_otp'); setIsDialogOpen(true); }}>
                                                                    <MessageSquare className="mr-2" size={14} /> Send OTP
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => { setSelectedUser(u); setSelectedAction('reject'); setIsDialogOpen(true); }}>
                                                                    <X className="mr-2" size={14} /> Reject
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Action confirmation dialog */}
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{selectedAction ? selectedAction.replace('_', ' ').toUpperCase() : 'Action'}</DialogTitle>
                                    </DialogHeader>
                                    <div className="py-2">
                                        <p className="text-sm text-muted-foreground">Confirm <strong>{selectedAction}</strong> for user <strong>{selectedUser?.fullName || selectedUser?._id}</strong>.</p>
                                    </div>
                                    <DialogFooter>
                                        <div className="flex gap-2">
                                            <button className="btn btn-sm" onClick={() => setIsDialogOpen(false)}>Cancel</button>
                                            <button className="btn btn-sm btn-primary" onClick={async () => {
                                                // stubbed action - replace with API call as needed
                                                console.log('Perform action', selectedAction, 'for', selectedUser);
                                                setIsDialogOpen(false);
                                            }}>Confirm</button>
                                        </div>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </TabsContent>

                    <TabsContent value="dashboard">
                        <div className="space-y-3">
                            <h2 className="text-lg font-medium">Dashboard</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="p-4 rounded border bg-background">Summary card 1 (placeholder)</div>
                                <div className="p-4 rounded border bg-background">Summary card 2 (placeholder)</div>
                                <div className="p-4 rounded border bg-background">Summary card 3 (placeholder)</div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="admin">
                        <div className="space-y-3">
                            <h2 className="text-lg font-medium">Admin</h2>
                            <div className="p-4 rounded border bg-background text-sm text-muted-foreground">
                                Admin controls and settings go here. You can wire forms, role management, or other components.
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}