"use client";

import { useEffect, useState } from "react";
// Read-only wallets table - no card or input UI required
import { IPagination, IResponse, IWallet } from "@/interface/interface";
import { session, SessionData } from "@/session/session";
import Defaults from "@/defaults/defaults";
import { Status } from "@/enums/enums";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";


export default function WalletsComponent({ userId }: { userId: string }) {
    const [wallets, setWallets] = useState<Array<IWallet>>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [_pagination, setPagination] = useState<IPagination>({
        total: 0,
        totalPages: 0,
        page: 1,
        limit: 10,
    });
    const sd: SessionData = session.getUserData();

    useEffect(() => {
        if (sd) {
            fetchWallets();
        }
    }, [sd]);

    const fetchWallets = async () => {
        try {
            setLoading(true)

            Defaults.LOGIN_STATUS();
            const url: string = `${Defaults.API_BASE_URL}/admin/wallet/list?userId=${userId}`;

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

    // No-op handlers — UI is read-only

    if (loading)
        return (
            <div className="w-full h-full flex items-center justify-center space-y-2 mt-10">
                <div className="flex flex-col items-center space-y-2">
                    <div className="border-b border-primary rounded-full w-10 h-10 animate-spin duration-300"></div>
                    <p className="text-center text-sm">Fetching Wallets...</p>
                </div>
            </div>
        );

    const formatBalance = (wallet: any) => {
        const symbol = wallet.symbol ?? (wallet.currency && (wallet.currency as any).symbol) ?? '';
        const value = typeof wallet.balance === 'number' ? wallet.balance : Number(wallet.balance || 0);
        const formatted = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
        return `${symbol}${formatted}`;
    };

    const countText = `${wallets.length} ${wallets.length === 1 ? 'wallet' : 'wallets'}`;

    return (
        <Card>
            <CardHeader className="px-6 py-5 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <CardTitle className="text-base font-semibold text-gray-800">User Wallets</CardTitle>
                        <div className="text-xs text-gray-500 mt-1">Read-only list of wallets for this user</div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
                            {countText}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Wallet</TableHead>
                            <TableHead>Balance</TableHead>
                            <TableHead>Currency</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {wallets.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={4}>
                                    <div className="w-full flex flex-col items-center justify-center py-8">
                                        <div className="text-sm text-gray-500">No wallets found for this user.</div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            wallets.map((wallet: IWallet, idx: number) => (
                                <TableRow key={idx} className="hover:bg-gray-50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {wallet.icon ? (
                                                <img src={wallet.icon} alt={wallet.name ?? 'icon'} className="h-6 w-6 rounded-full object-cover" />
                                            ) : (
                                                <div className="h-9 w-9 rounded-full bg-primary-50 flex items-center justify-center text-primary">⚡</div>
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{wallet.name ?? (wallet.currency && (wallet.currency as any).toString()) ?? '-'}</div>
                                                <div className="text-xs text-gray-500">{wallet.userId?.fullName ?? '-'}</div>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="text-sm font-semibold text-gray-900">{formatBalance(wallet)}</div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {wallet.icon ? (
                                                <img src={wallet.icon} alt={wallet.name ?? 'icon'} className="h-6 w-6 rounded-full object-cover" />
                                            ) : null}
                                            <div className="text-sm text-gray-700">{(wallet.currency && (wallet.currency as any).toString()) ?? '-'}</div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <Badge variant={wallet.activated ? 'default' : 'secondary'}>
                                            {wallet.activated ? 'active' : 'inactive'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            )))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
