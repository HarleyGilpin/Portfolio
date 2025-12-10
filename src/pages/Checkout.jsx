import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaCreditCard, FaArrowRight } from 'react-icons/fa';
import { toast } from 'sonner';
import Modal from '../components/Modal';
import SEO from '../components/SEO';

const Checkout = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const tierId = searchParams.get('tier');

    // Tier Data (Ideally this would be shared or fetched)
    const tiers = {
        '0': { name: 'Starter Task', price: 10 },
        '1': { name: 'Basic Boost', price: 25 },
        '2': { name: 'Growth Pack', price: 50 },
        '3': { name: 'Pro Build', price: 100 },
        '4': { name: 'Advanced Strategy', price: 200 },
        '5': { name: 'Business Accelerator', price: 250 },
        '6': { name: 'Agency Package', price: 500 },
        '7': { name: 'Enterprise Solution', price: 1000 },
    };

    const selectedTier = tiers[tierId];

    const [formData, setFormData] = useState({
        clientName: '',
        clientEmail: '',
        projectDetails: '',
        deadline: ''
    });
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [activeModal, setActiveModal] = useState(null); // 'agreement' | 'terms' | null

    useEffect(() => {
        if (!selectedTier) {
            toast.error("No service tier selected.");
            navigate('/services');
        }
    }, [selectedTier, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    tierName: selectedTier.name,
                    price: selectedTier.price,
                    tierId: tierId // Pass simple ID or full details
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to initiate checkout');
            }

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL received');
            }

        } catch (error) {
            console.error('Checkout error:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!selectedTier) return null;

    return (
        <div className="pt-24 pb-20 min-h-screen bg-background text-text-primary px-4">
            <SEO title="Checkout" description="Secure authentication checkout." />
            <div className="container mx-auto max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-12"
                >
                    {/* Order Summary */}
                    <div className="order-2 md:order-1">
                        <h2 className="text-3xl font-bold mb-6">Project Details</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-text-secondary">Full Name</label>
                                <input
                                    type="text"
                                    name="clientName"
                                    required
                                    value={formData.clientName}
                                    onChange={handleChange}
                                    className="w-full bg-card-bg border border-border-color rounded-lg p-3 focus:outline-none focus:border-accent-primary transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-text-secondary">Email Address</label>
                                <input
                                    type="email"
                                    name="clientEmail"
                                    required
                                    value={formData.clientEmail}
                                    onChange={handleChange}
                                    className="w-full bg-card-bg border border-border-color rounded-lg p-3 focus:outline-none focus:border-accent-primary transition-colors"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-text-secondary">Project Requirements & Vision</label>
                                <textarea
                                    name="projectDetails"
                                    required
                                    value={formData.projectDetails}
                                    onChange={handleChange}
                                    rows="5"
                                    className="w-full bg-card-bg border border-border-color rounded-lg p-3 focus:outline-none focus:border-accent-primary transition-colors"
                                    placeholder="Describe your project, goals, and any specific preferences..."
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-text-secondary">Preferred Deadline (Optional)</label>
                                <input
                                    type="date"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    className="w-full bg-card-bg border border-border-color rounded-lg p-3 focus:outline-none focus:border-accent-primary transition-colors"
                                />
                            </div>

                            <div className="flex items-start gap-3 mb-6">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    className="mt-1 w-4 h-4 text-accent-primary bg-card-bg border-border-color rounded focus:ring-accent-primary focus:ring-offset-background"
                                />
                                <label htmlFor="terms" className="text-sm text-text-secondary leading-relaxed">
                                    I agree to the <button type="button" onClick={() => setActiveModal('agreement')} className="text-accent-primary hover:underline font-semibold">Service Agreement</button> and <button type="button" onClick={() => setActiveModal('terms')} className="text-accent-primary hover:underline font-semibold">Terms of Service</button>. I understand that this purchase is for digital services and is non-refundable once work commences.
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !acceptedTerms}
                                className="w-full bg-accent-primary text-background font-bold py-4 rounded-lg shadow-lg hover:bg-accent-secondary transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : (
                                    <>
                                        Proceed to Payment <FaArrowRight />
                                    </>
                                )}
                            </button>

                            <div className="flex items-center justify-center gap-2 text-sm text-text-muted mt-4">
                                <FaLock /> Secure payment processing via Stripe
                            </div>
                        </form>
                    </div>

                    {/* Order Panel */}
                    <div className="order-1 md:order-2">
                        <div className="bg-card-bg border border-border-color rounded-xl p-8 sticky top-28">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <FaCreditCard className="text-accent-primary" /> Order Summary
                            </h3>

                            <div className="border-b border-border-color pb-6 mb-6">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-semibold text-lg">{selectedTier.name}</span>
                                    <span className="font-bold text-xl text-accent-primary">${selectedTier.price}</span>
                                </div>
                                <p className="text-text-muted text-sm">One-time payment for digital services.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-secondary">Subtotal</span>
                                    <span>${selectedTier.price}.00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-secondary">Service Fee</span>
                                    <span>$0.00</span>
                                </div>
                                <div className="border-t border-border-color pt-4 flex justify-between font-bold text-lg">
                                    <span>Total Due</span>
                                    <span className="text-accent-primary">${selectedTier.price}.00</span>
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-accent-primary/5 rounded-lg border border-accent-primary/20 text-sm text-text-secondary">
                                <p>By proceeding, you agree to the Terms of Service. An automated Service Agreement will be generated upon payment.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Service Agreement Modal */}
            <Modal
                isOpen={activeModal === 'agreement'}
                onClose={() => setActiveModal(null)}
                title="Service Agreement"
            >
                <div className="space-y-4 text-sm">
                    <p><strong>1. Services</strong><br />Provider agrees to deliver the digital services described in the selected package. Services are performed as an independent contractor.</p>
                    <p><strong>2. Payment</strong><br />Full payment is required upfront to commence work. All prices are in USD.</p>
                    <p><strong>3. Intellectual Property</strong><br />Upon full payment, Client shall own all rights, title, and interest in the final deliverables created specifically for Client. Provider retains ownership of pre-existing materials and methodologies.</p>
                    <p><strong>4. Confidentiality</strong><br />Provider agrees to keep all Client proprietary information confidential and will not use it for any purpose other than providing the Services.</p>
                    <p><strong>5. Limitation of Liability</strong><br />To the fullest extent permitted by law, Provider's total liability shall not exceed the total fees paid by Client. Provider is not liable for indirect or consequential damages.</p>
                    <p><strong>6. Termination</strong><br />Either party may terminate if the other materially breaches terms. Refunds are not provided for work already performed.</p>
                    <p><strong>7. Governing Law</strong><br />This Agreement is governed by the laws of the Provider's principal place of business.</p>
                </div>
            </Modal>

            {/* Terms of Service Modal */}
            <Modal
                isOpen={activeModal === 'terms'}
                onClose={() => setActiveModal(null)}
                title="Terms of Service"
            >
                <div className="space-y-4 text-sm">
                    <p><strong>1. Acceptance of Terms</strong><br />By accessing this website and purchasing services, you agree to be bound by these Terms of Service.</p>
                    <p><strong>2. Use of Service</strong><br />You agree to use our services only for lawful purposes and properly authorized business activities.</p>
                    <p><strong>3. Digital Nature of Goods</strong><br />You acknowledge that our services are digital and intangible. Delivery is considered complete upon transmission of the final digital files or completion of the agreed task.</p>
                    <p><strong>4. No Warranty</strong><br />Services are provided "as is" without warranty of any kind, express or implied.</p>
                    <p><strong>5. Changes to Terms</strong><br />We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of new terms.</p>
                </div>
            </Modal>
        </div >
    );
};

export default Checkout;
