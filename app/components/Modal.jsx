import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ isOpen, onClose, title, children }) => {
    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-card-bg border border-border-color rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col relative"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center p-6 border-b border-border-color sticky top-0 bg-card-bg rounded-t-xl z-10">
                                <h3 className="text-xl font-bold text-text-primary">{title}</h3>
                                <button
                                    onClick={onClose}
                                    className="text-text-secondary hover:text-accent-primary transition-colors p-2"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            {/* Scrollable Body */}
                            <div className="p-6 overflow-y-auto text-text-secondary leading-relaxed space-y-4">
                                {children}
                            </div>

                            {/* Footer (Optional, can be removed if not needed) */}
                            <div className="p-4 border-t border-border-color flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-accent-primary text-background font-bold rounded-lg hover:bg-accent-secondary transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Modal;
