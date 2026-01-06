'use client';

import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TextRevealProps {
    text: string;
    className?: string; // Class for the container
    delay?: number;
    as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

export function TextReveal({ text, className, delay = 0, as: Component = 'h2' }: TextRevealProps) {
    const words = text.split(" ");

    // Variants for container
    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: 0.04 * i + delay },
        }),
    };

    // Variants for each word
    const child = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                damping: 12,
                stiffness: 100,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                damping: 12,
                stiffness: 100,
            },
        },
    };

    return (
        <motion.div
            style={{ overflow: "hidden", display: "flex", flexWrap: "wrap", gap: "0.25em" }}
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            className={cn(className)}
        >
            {words.map((word, index) => (
                <motion.span variants={child} key={index} className="inline-block relative">
                    {Component === 'h1' || Component === 'h2' ? (
                        // Highlight effect for headers if desired, or just plain text
                        <span className="relative z-10">{word}</span>
                    ) : (
                        word
                    )}
                </motion.span>
            ))}
        </motion.div>
    );
}
