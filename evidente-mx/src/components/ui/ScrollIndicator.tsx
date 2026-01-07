'use client';

import { motion } from 'framer-motion';

export function ScrollIndicator() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 cursor-pointer hidden md:flex flex-col items-center gap-2 group"
            onClick={() => {
                const nextSection = window.innerHeight;
                window.scrollTo({ top: nextSection, behavior: 'smooth' });
            }}
        >
            <div className="w-[20px] h-[32px] border-2 border-white/30 rounded-full flex justify-center p-1 group-hover:border-white/60 transition-colors">
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-1 h-2 bg-white rounded-full"
                />
            </div>
        </motion.div>
    );
}
