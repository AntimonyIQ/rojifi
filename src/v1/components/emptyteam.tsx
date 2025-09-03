import React from "react";
import { motion } from "framer-motion";
import { Plus, ReceiptText } from "lucide-react";
import { Button } from "./ui/button";

interface EmptyTeamProps {
    statusFilter: string;
    onClick: () => void;
}

export default class EmptyTeam extends React.Component<EmptyTeamProps> {
    render(): React.ReactNode {
        const { statusFilter, onClick } = this.props;

        return (
            <div className="w-full flex flex-col items-center justify-center">
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
                    <ReceiptText size={28} className="relative z-10 text-blue-900" />
                </div>

                <div className="flex flex-col items-center text-center justify-center gap-2 mt-3">
                    <h2 className="font-bold">No {statusFilter} team</h2>
                    <p>
                        You currently have no {statusFilter} teams, Create one by clicking on the <br />
                        <span className="text-blue-500 font-medium">"Invite your Team"</span> button,
                        or check any of the other tabs to see your other teams
                    </p>
                    <div className="flex items-center gap-2 pt-5">
                        <Button
                            size="lg"
                            className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                            onClick={onClick}
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Invite your Team</span>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}
