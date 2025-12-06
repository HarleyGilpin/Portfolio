import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaFileContract, FaHome, FaDownload } from 'react-icons/fa';
import { toast } from 'sonner';

const Success = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [loading, setLoading] = useState(true);
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        const verifyOrder = async () => {
            if (!sessionId) {
                setLoading(false);
                return;
            }

            try {
                // In a real app, you might poll this or wait for webhook
                // For simplicity, we'll verify the session directly via our API
                const response = await fetch(`/api/verify-order?session_id=${sessionId}`);
                const data = await response.json();

                if (response.ok) {
                    setOrderData(data.order);
                    toast.success("Payment confirmed! Order created.");
                } else {
                    toast.error("Could not verify order details.");
                }
            } catch (error) {
                console.error("Verification error:", error);
                toast.error("Something went wrong verifying the order.");
            } finally {
                setLoading(false);
            }
        };

        verifyOrder();
    }, [sessionId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary"></div>
            </div>
        );
    }

    if (!sessionId) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-text-primary p-4">
                <h1 className="text-2xl font-bold mb-4">No Session Found</h1>
                <Link to="/" className="text-accent-primary hover:underline">Return Home</Link>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-20 min-h-screen bg-background text-text-primary px-4">
            <div className="container mx-auto max-w-3xl text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <FaCheckCircle className="text-6xl text-accent-primary mx-auto mb-6" />
                    <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
                    <p className="text-text-muted text-xl mb-12">
                        Thank you for your business. Your project has been officially kicked off.
                    </p>
                </motion.div>

                {orderData && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-card-bg border border-border-color rounded-xl p-8 text-left max-w-2xl mx-auto shadow-2xl"
                    >
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-border-color pb-4">
                            <FaFileContract className="text-accent-primary" /> Service Agreement
                        </h2>

                        <div className="space-y-4 text-text-secondary text-sm mb-8 h-64 overflow-y-auto p-4 bg-bg-primary rounded-lg font-mono">
                            <pre className="whitespace-pre-wrap font-sans">
                                {orderData.agreement_content || "Agreement generating..."}
                            </pre>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => window.print()}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-card-bg border border-accent-primary text-accent-primary rounded-lg hover:bg-accent-primary/10 transition-colors font-medium"
                            >
                                <FaDownload /> Save Agreement
                            </button>
                            <Link
                                to="/"
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-accent-primary text-background rounded-lg hover:bg-accent-secondary transition-colors font-bold"
                            >
                                <FaHome /> Return Home
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Success;
