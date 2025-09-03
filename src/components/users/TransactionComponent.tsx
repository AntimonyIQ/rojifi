"use client";

import { useEffect, useState } from "react";
// Read-only wallets table - no card or input UI required
import { IPagination, IResponse, ITransaction } from "@/interface/interface";
import { session, SessionData } from "@/session/session";
import Defaults from "@/defaults/defaults";
import { Status, TransactionStatus } from "@/enums/enums";

export default function TransactionsComponent({ userId }: { userId: string }) {
    const [transactions, setTransactions] = useState<Array<ITransaction>>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [pagination, setPagination] = useState<IPagination>({
        total: 0,
        totalPages: 0,
        page: 1,
        limit: 10,
    });
    const sd: SessionData = session.getUserData();

    useEffect(() => {
        if (sd) {
            fetchTransactions();
        }
    }, [sd]);

    const fetchTransactions = async () => {
        try {
            setLoading(true)

            Defaults.LOGIN_STATUS();
            const url: string = `${Defaults.API_BASE_URL}/admin/transaction/list?userId=${userId}&page=${pagination.page}&limit=${pagination.limit}`;

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
                if (!data.handshake) throw new Error('Unable to process transaction response right now, please try again.');
                const parseData: Array<ITransaction> = Defaults.PARSE_DATA(data.data, sd.client.privateKey, data.handshake);
                setTransactions(parseData);
                if (data.pagination) {
                    setPagination(data.pagination);
                }
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading)
        return (
            <div className="w-full h-full flex items-center justify-center space-y-2 mt-10">
                <div className="flex flex-col items-center space-y-2">
                    <div className="border-b border-primary rounded-full w-10 h-10 animate-spin duration-300"></div>
                    <p className="text-center text-sm">Fetching Transactions...</p>
                </div>
            </div>
        );

    const formatAmount = (transaction: ITransaction) => {
        const value = typeof transaction.amount === 'number' ? transaction.amount : Number(transaction.amount || 0);
        const formatted = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
        return `${formatted}`;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">Transactions</h3>
                <p className="text-sm text-gray-500">{transactions.length} transactions</p>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-full align-middle">
                    <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg bg-white">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beneficiary Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beneficiary Currency</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {transactions.map((transaction: ITransaction, idx: number) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0">
                                                    {transaction.beneficiaryAccountName ? (
                                                        <img src={`https://dicebear.com/api/identicon/${transaction.beneficiaryAccountName}.svg`} alt={transaction.beneficiaryAccountName ?? 'icon'} className="h-6 w-6 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="h-9 w-9 rounded-full bg-primary-50 flex items-center justify-center text-primary">⚡</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{transaction.beneficiaryAccountName}</div>
                                                    <div className="text-xs text-gray-500">{transaction.userId?.fullName ?? '-'}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">{formatAmount(transaction)}</div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="text-sm text-gray-700">{(transaction.beneficiaryCurrency ?? '-')}</div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {transaction.status && (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.status === TransactionStatus.SUCCESSFUL ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {transaction.status}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
