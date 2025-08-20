import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NewDayLoader: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    className="fixed inset-0 bg-[var(--page-bg)] z-[200] flex flex-col items-center justify-center"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.2 } }}
                    aria-live="polite"
                    aria-busy="true"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="w-16 h-16"
                    >
                        <img src="/images/Jar.png" alt="Loading..." className="w-full h-full object-contain" />
                    </motion.div>
                    <motion.p
                        className="mt-6 text-lg font-semibold text-[var(--text-secondary)]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: 0.3 } }}
                        exit={{ opacity: 0 }}
                    >
                        Checking today's chores...
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NewDayLoader;