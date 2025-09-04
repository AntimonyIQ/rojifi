import { motion } from "framer-motion"

export function HeroBackground() {
    return (
        <div className="absolute inset-0 -z-10 flex items-start justify-center overflow-hidden">
            <motion.div
                className="w-full max-w-6xl opacity-100 pt-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
            >
                <img src="/flags-background.png" alt="" className="w-full h-auto" aria-hidden="true" />
            </motion.div>
        </div>
    )
}
