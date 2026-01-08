'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export function PollWidget() {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [hasVoted, setHasVoted] = useState(false);

    const options = [
        { id: '1', text: 'Sí, la cifra refleja lo que veo en mi bolsillo' },
        { id: '2', text: 'No, siento que todo está más caro que eso' },
        { id: '3', text: 'Creo que algunos productos bajaron y otros subieron' },
        { id: '4', text: 'No he notado cambios' },
    ];

    const handleVote = () => {
        if (selectedOption) {
            setHasVoted(true);
        }
    };

    return (
        <div className="bg-[#1a1c23] text-white p-6 rounded-lg shadow-lg max-w-sm">
            {/* Header */}
            <h3 className="text-xl font-bold uppercase tracking-wider mb-1 relative inline-block">
                ENCUESTA
                <span className="absolute bottom-0 left-0 w-8 h-1 bg-white/20"></span>
            </h3>
            <div className="h-0.5 w-full bg-white/10 mb-4"></div>

            {/* Question */}
            <p className="font-medium text-base mb-6 leading-relaxed">
                El INEGI reportó inflación en México de <span className="text-white font-bold">3.6%</span>.
                En tu experiencia, ¿cómo percibes los precios?
            </p>

            {/* Content: Options or Results */}
            {!hasVoted ? (
                <div className="space-y-4">
                    {options.map((option) => (
                        <label
                            key={option.id}
                            className="flex items-start gap-3 cursor-pointer group"
                        >
                            <div className="relative flex-shrink-0 mt-0.5">
                                <input
                                    type="radio"
                                    name="poll-option"
                                    value={option.id}
                                    checked={selectedOption === option.id}
                                    onChange={() => setSelectedOption(option.id)}
                                    className="appearance-none w-5 h-5 rounded-full border-2 border-gray-500 checked:border-blue-500 bg-transparent transition-colors"
                                />
                                {selectedOption === option.id && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                                    </div>
                                )}
                            </div>
                            <span className={`text-sm ${selectedOption === option.id ? 'text-white' : 'text-gray-300'} group-hover:text-white transition-colors`}>
                                {option.text}
                            </span>
                        </label>
                    ))}

                    <button
                        onClick={handleVote}
                        disabled={!selectedOption}
                        className={`w-full py-2.5 rounded font-medium mt-4 transition-all
              ${selectedOption
                                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50'
                                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            }
            `}
                    >
                        Votar
                    </button>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-6"
                >
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">¡Gracias por tu voto!</h4>
                    <p className="text-gray-400 text-sm">Tu opinión ayuda a entender mejor la realidad económica.</p>

                    <div className="mt-6 space-y-3">
                        {/* Fake results for visual feedback */}
                        <div className="text-left text-xs text-gray-400">
                            <div className="flex justify-between mb-1">
                                <span>Más caro (65%)</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-1.5">
                                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                        </div>
                        <div className="text-left text-xs text-gray-400">
                            <div className="flex justify-between mb-1">
                                <span>Igual (20%)</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-1.5">
                                <div className="bg-gray-500 h-1.5 rounded-full" style={{ width: '20%' }}></div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
