import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { UserCheck, UserX, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { IPagination, IResponse, IWallet } from "@/interface/interface";
import Defaults from "@/defaults/defaults";
import { session, SessionData } from "@/session/session";
import { Status, WalletStatus } from "@/enums/enums";

export default function WalletsPage() {
    const [wallets, setWallets] = useState<Array<IWallet>>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [pagination, setPagination] = useState<IPagination>({
        total: 0,
        totalPages: 0,
        page: 1,
        limit: 10,
    });
    const [pageInput, setPageInput] = useState<string>(String(1));
    const sd: SessionData = session.getUserData();

    useEffect(() => {
        if (sd) {
            fetchWallets();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sd, pagination.page, pagination.limit]);

    useEffect(() => {
        // keep the input in sync when page changes externally
        setPageInput(String(pagination.page));
    }, [pagination.page]);

    const fetchWallets = async () => {
        try {
            setLoading(true);

            Defaults.LOGIN_STATUS();
            const url: string = `${Defaults.API_BASE_URL}/admin/wallet/list?page=${pagination.page}&limit=${pagination.limit}`;

            const res = await fetch(url, {
                method: "GET",
                headers: {
                    ...Defaults.HEADERS,
                    "Content-Type": "application/json",
                    "x-rojifi-handshake": sd.client.publicKey,
                    "x-rojifi-deviceid": sd.deviceid,
                    Authorization: `Bearer ${sd.authorization}`,
                },
            });
            const data: IResponse = await res.json();
            if (data.status === Status.ERROR) throw new Error(data.message || data.error);
            if (data.status === Status.SUCCESS) {
                if (!data.handshake) throw new Error("Unable to process login response right now, please try again.");
                const parseData: Array<IWallet> = Defaults.PARSE_DATA(data.data, sd.client.privateKey, data.handshake);
                setWallets(parseData);
                if (data.pagination) {
                    setPagination(data.pagination);
                }
            }
        } catch (error) {
            console.error("Error fetching wallets:", error);
        } finally {
            setLoading(false);
        }
    };

    // derived filtered list
    const filteredWallets = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return wallets.filter((w) => {
            if (statusFilter !== "all") {
                // compare to either w.status or w.state depending on shape
                const s = (w as any).status || (w as any).state || "";
                if (String(s).toLowerCase() !== statusFilter) return false;
            }
            if (!q) return true;
            const fields = [
                String((w as any).id || ""),
                String((w as any).name || (w as any).label || ""),
                String((w as any).currency || ""),
                String((w as any).owner?.name || (w as any).owner || ""),
            ];
            return fields.join(" ").toLowerCase().includes(q);
        });
    }, [wallets, searchQuery, statusFilter]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);
    // status changes are handled directly by the Select component via setStatusFilter
    const handleClear = () => {
        setSearchQuery("");
        setStatusFilter("all");
    };

    const prevPage = () => {
        if (pagination.page > 1) setPagination({ ...pagination, page: pagination.page - 1 });
        setPageInput(String(Math.max(1, pagination.page - 1)));
    };
    const nextPage = () => {
        if (pagination.page < (pagination.totalPages || 1)) setPagination({ ...pagination, page: pagination.page + 1 });
        setPageInput(String(Math.min((pagination.totalPages || 1), pagination.page + 1)));
    };

    const goToPage = (value?: string) => {
        const v = value ?? pageInput;
        const n = Number(v);
        const max = pagination.totalPages || 1;
        if (Number.isNaN(n) || n < 1) {
            setPageInput(String(pagination.page));
            return;
        }
        const target = Math.min(max, Math.floor(n));
        if (target !== pagination.page) {
            setPagination({ ...pagination, page: target });
        }
        setPageInput(String(target));
    };

    return (
        <div className="space-y-6 p-4">
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total wallets</CardTitle>
                            <CardDescription>All wallets on the platform</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">{pagination.total || wallets.length}</div>
                            <div className="text-sm text-muted-foreground">Updated just now</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Active wallets</CardTitle>
                            <CardDescription>Wallets with active status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">{wallets.filter((w) => ((w as any).status || "").toString().toLowerCase() === "active").length}</div>
                            <div className="text-sm text-muted-foreground">Users actively transacting</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pending verification</CardTitle>
                            <CardDescription>Wallets pending verification</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">{wallets.filter((w) => ((w as any).status || "").toString().toLowerCase() === "pending").length}</div>
                            <div className="text-sm text-muted-foreground">Requires admin action</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Total balance</CardTitle>
                            <CardDescription>Sum across shown wallets (demo)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">$ {wallets.reduce((s, w) => s + Number((w as any).balance || 0), 0).toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">Approximate</div>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>

            <div className="bg-card p-4 rounded-md">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search wallets, owner, id, currency..."
                            className="input input-sm w-full sm:w-72 px-3 py-2 rounded border bg-transparent"
                        />
                        <div className="w-44">
                            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
                                <SelectTrigger className="input input-sm px-2 py-2 rounded border bg-transparent">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <button onClick={handleClear} className="btn btn-ghost btn-sm">Clear</button>
                    </div>
                    <div className="text-sm text-muted-foreground">Showing {filteredWallets.length} wallet(s)</div>
                </div>

                <div className="mt-4 overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Wallet ID</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead>Currency</TableHead>
                                <TableHead>Balance</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && Array.from({ length: pagination.limit }).map((_, i) => (
                                <TableRow key={`skeleton-${i}`}>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                </TableRow>
                            ))}

                            {!loading && filteredWallets.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                                        No wallets found.
                                    </TableCell>
                                </TableRow>
                            )}

                            {!loading && filteredWallets.map((w: IWallet, index: number) => (
                                <TableRow key={index}>
                                    <TableCell>{w._id || "-"}</TableCell>
                                    <TableCell>{w.userId.fullName}</TableCell>
                                    <TableCell>{w.currency}</TableCell>
                                    <TableCell>{Number(w.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {w.status === WalletStatus.active ? (
                                                <UserCheck className="text-green-500" size={16} />
                                            ) : (
                                                <UserX className="text-red-500" size={16} />
                                            )}
                                            <span className="capitalize">{w.status}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="btn btn-sm"><MoreHorizontal size={16} /></button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuItem onSelect={() => console.log('view', w._id)}>View</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => console.log('edit', w._id)}>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => console.log('suspend', w._id)}>Suspend</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <nav className="mt-4 flex items-center justify-between" aria-label="Pagination">
                    <div className="text-sm text-muted-foreground">&nbsp;</div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={prevPage}
                            disabled={pagination.page <= 1}
                            className={`btn btn-sm rounded-full px-3 py-1 transition-colors ${pagination.page <= 1 ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-white hover:bg-primary/90"}`}
                            aria-label="Previous page"
                        >
                            <ChevronLeft size={16} />
                            <span className="sr-only">Previous</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground hidden sm:inline">Page</span>
                            <input
                                value={pageInput}
                                onChange={(e) => setPageInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') goToPage(); }}
                                onBlur={() => goToPage()}
                                className="input input-sm w-16 text-center px-2 py-1 rounded border bg-transparent"
                                aria-label="Page number"
                            />
                            <span className="text-xs text-muted-foreground">of {pagination.totalPages || 1}</span>
                        </div>

                        <button
                            onClick={nextPage}
                            disabled={pagination.page >= (pagination.totalPages || 1)}
                            className={`btn btn-sm rounded-full px-3 py-1 transition-colors ${pagination.page >= (pagination.totalPages || 1) ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-white hover:bg-primary/90"}`}
                            aria-label="Next page"
                        >
                            <ChevronRight size={16} />
                            <span className="sr-only">Next</span>
                        </button>
                    </div>
                </nav>
            </div>
        </div>
    );
}