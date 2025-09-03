import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IPagination, IResponse, ISender } from "@/interface/interface";
import Defaults from "@/defaults/defaults";
import { session, SessionData } from "@/session/session";
import { Status } from "@/enums/enums";

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

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
// ...existing code... (removed unused Button import)

export default function SendersPage() {
    const [value, setValue] = useState<string>("list");
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [selectedSender, setSelectedSender] = useState<ISender | null>(null);
    const [selectedAction, setSelectedAction] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [senders, setSenders] = useState<Array<ISender>>([]);
    const [search, _setSearch] = useState<string>("");
    const [pagination, setPagination] = useState<IPagination>({
        total: 0,
        totalPages: 0,
        page: 1,
        limit: 10,
    });
    const sd: SessionData = session.getUserData();

    useEffect(() => {
        fetchSenders();
    }, [pagination.page, pagination.limit, search]);

    const fetchSenders = async () => {
        try {
            setLoading(true)

            Defaults.LOGIN_STATUS();

            const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
            const url: string = `${Defaults.API_BASE_URL}/admin/sender/list?page=${pagination.page}&limit=${pagination.limit}${searchParam}`;

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
                const parseData: Array<ISender> = Defaults.PARSE_DATA(data.data, sd.client.privateKey, data.handshake);
                setSenders(parseData);
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
                <h1 className="text-2xl font-semibold">Senders</h1>
                <p className="text-sm text-muted-foreground">Manage senders and their onboarding status</p>
            </header>

            <div className="bg-card p-4 rounded-md">
                <Tabs value={value} onValueChange={(v) => setValue(v)}>
                    <TabsList>
                        <TabsTrigger value="list">All Senders</TabsTrigger>
                        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                        <TabsTrigger value="admin">Admin</TabsTrigger>
                    </TabsList>

                    <TabsContent value="list">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium">Senders</h2>
                                <div>
                                    <Button variant="outline" className="btn btn-sm">New Sender</Button>
                                </div>
                            </div>

                            <div className="mt-4 overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Sender ID</TableHead>
                                            <TableHead>Business</TableHead>
                                            <TableHead>Country</TableHead>
                                            <TableHead>Volume</TableHead>
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
                                                        <span>Loading senders...</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {!loading && senders.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-6 text-sm text-muted-foreground">No senders found.</TableCell>
                                            </TableRow>
                                        )}

                                        {!loading && senders.map((s: ISender, idx: number) => (
                                            <TableRow key={s._id || idx}>
                                                <TableCell>{s._id || "-"}</TableCell>
                                                <TableCell>{s.businessName || "-"}</TableCell>
                                                <TableCell>{s.country || "-"}</TableCell>
                                                <TableCell>{s.volume?.toLocaleString() || "-"}</TableCell>
                                                <TableCell>
                                                    <Badge variant={s.affiliationStatus === 'live' ? 'success' : s.affiliationStatus === 'pending' ? 'warning' : 'outline'} className="capitalize">
                                                        {s.affiliationStatus}
                                                    </Badge>
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
                                                                <DropdownMenuItem onSelect={() => { setSelectedSender(s); setSelectedAction('approve'); setIsDialogOpen(true); }}>
                                                                    <Check className="mr-2" size={14} /> Approve
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => { setSelectedSender(s); setSelectedAction('request_info'); setIsDialogOpen(true); }}>
                                                                    <MessageSquare className="mr-2" size={14} /> Request Info
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => { setSelectedSender(s); setSelectedAction('reject'); setIsDialogOpen(true); }}>
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
                                        <p className="text-sm text-muted-foreground">Confirm <strong>{selectedAction}</strong> for sender <strong>{selectedSender?.businessName || selectedSender?._id}</strong>.</p>
                                    </div>
                                    <DialogFooter>
                                        <div className="flex gap-2">
                                            <button className="btn btn-sm" onClick={() => setIsDialogOpen(false)}>Cancel</button>
                                            <button className="btn btn-sm btn-primary" onClick={async () => {
                                                // TODO: call API to perform action
                                                console.log('Perform action', selectedAction, 'for', selectedSender);
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
                                Admin controls and settings for senders go here.
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}