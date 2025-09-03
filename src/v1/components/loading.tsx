import { LoaderPinwheel } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";

export default class Loading extends React.Component {
    render(): React.ReactNode {
        return (
            <div className="w-full flex flex-col items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear"
                    }}
                >
                    <LoaderPinwheel size={28} />
                </motion.div>
            </div>
        );
    }
}
