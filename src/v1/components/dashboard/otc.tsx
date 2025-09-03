"use client"

import React, { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion";
import { ArrowUpRight, MonitorDot } from "lucide-react";
import { toast } from "sonner";
import { IResponse, IUser } from "@/interface/interface";
import { session, SessionData } from "@/session/session";
import { RequestStatus, Status } from "@/enums/enums";
import Defaults from "@/defaults/defaults";
import { ILoginFormProps } from "../auth/login-form";

export default function OTCView() {
    const [user, setUser] = React.useState<IUser | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const sd: SessionData = session.getUserData();

    useEffect(() => {
        if (sd) {
            setUser(sd.user);
        }
    }, [sd]);

    const handleRequest = async (): Promise<void> => {
        try {
            setLoading(true)

            Defaults.LOGIN_STATUS();

            const res = await fetch(`${Defaults.API_BASE_URL}/user/otc/request`, {
                method: 'POST',
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

                const userres = await fetch(`${Defaults.API_BASE_URL}/wallet`, {
                    method: 'GET',
                    headers: {
                        ...Defaults.HEADERS,
                        'x-rojifi-handshake': sd.client.publicKey,
                        'x-rojifi-deviceid': sd.deviceid,
                        Authorization: `Bearer ${sd.authorization}`,
                    },
                });

                const userdata: IResponse = await userres.json();
                if (userdata.status === Status.ERROR) throw new Error(userdata.message || userdata.error);
                if (userdata.status === Status.SUCCESS) {
                    if (!userdata.handshake) throw new Error('Unable to process response right now, please try again.');
                    const parseData: ILoginFormProps = Defaults.PARSE_DATA(userdata.data, sd.client.privateKey, userdata.handshake);

                    session.updateSession({
                        ...sd,
                        user: parseData.user,
                        wallets: parseData.wallets,
                        transactions: parseData.transactions,
                        sender: parseData.sender,
                    });

                    setUser(parseData.user);
                    toast.success("OTC request sent. We'll review your request and get back to you shortly.")
                }
            }
        } catch (error: any) {
            toast.error(error.message || "Error Activating OTC desk");
        } finally {
            setLoading(false)
        }
    }

    if (user && user.requested && user.requested.otcdesk === RequestStatus.PENDING) {
        return (
            <div className="w-full mt-40 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center w-20 h-20">
                    <motion.div
                        className="absolute w-20 h-20 rounded-full bg-yellow-400 opacity-50"
                        initial={{ scale: 0, opacity: 0.6 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            repeatType: "mirror",
                            ease: "easeOut"
                        }}
                    />
                    <MonitorDot size={28} className="relative z-10 text-yellow-900" />
                </div>
                <div className="flex flex-col items-center text-center justify-center gap-2 mt-3">
                    <h2 className="font-bold">OTC Desk Activation Pending</h2>
                    <p>
                        Your request to activate your <span className="font-semibold">OTC Desk</span> is currently <span className="text-yellow-600 font-medium">pending approval</span>.<br />
                        You will be notified once OTC trading is enabled for your account.<br />
                        If you have any questions, please contact support.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full mt-40 flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center w-20 h-20">
                {/* First ripple */}
                <motion.div
                    className="absolute w-20 h-20 rounded-full bg-blue-400 opacity-50"
                    initial={{ scale: 0, opacity: 0.6 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeOut"
                    }}
                />
                {/* Second ripple with delay for overlap */}
                <motion.div
                    className="absolute w-20 h-20 rounded-full bg-blue-400 opacity-50"
                    initial={{ scale: 0, opacity: 0.6 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeOut",
                        delay: 0.75
                    }}
                />
                {/* Icon always centered */}
                <MonitorDot size={28} className="relative z-10 text-blue-900" />
            </div>

            <div className="flex flex-col items-center text-center justify-center gap-2 mt-3">
                <h2 className="font-bold">Activate OTC Desk</h2>
                <p>
                    To activate your OTC Desk, click on the
                    <span className="text-blue-500 font-medium">"Activate OTC"</span> button below.<br />
                    This will send a request to our support team to enable OTC trading for your account.
                </p>
                <div className="flex items-center gap-2 pt-5">
                    <Button
                        size="lg"
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                        onClick={handleRequest}
                    >
                        {loading ? "Loading..." : (
                            <>
                                <ArrowUpRight className="h-4 w-4" />
                                <span className="hidden sm:inline">Activate OTC</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}

