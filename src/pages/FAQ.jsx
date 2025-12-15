import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';


const faqs = [
    {
        question: "What services do you offer?",
        answer: "I specialize in full-stack web development, offering custom website design, e-commerce solutions, web application development, and ongoing maintenance/hosting packages. Whether you need a simple landing page or a complex SaaS platform, I can build it."
    },
    {
        question: "How does the payment process work?",
        answer: "For most projects, I require a 50% deposit to begin work, with the remaining 50% due upon completion and before final deployment. For ongoing services like hosting or maintenance, payments are processed automatically via Stripe on a monthly basis."
    },
    {
        question: "What is your typical turnaround time?",
        answer: "Turnaround times vary depending on the project's complexity. A standard 5-page informational website typically takes 2-4 weeks, while more complex e-commerce or web app projects can take 6-12 weeks. I'll provide a detailed timeline during our initial consultation."
    },
    {
        question: "Do you offer refunds?",
        answer: "Due to the nature of digital work, deposits are non-refundable once work has commenced. However, I am committed to your satisfaction and will work closely with you throughout the process to ensure the final product meets your expectations."
    },
    {
        question: "Can you host my website?",
        answer: "Yes! I offer ultra-fast, secure hosting packages that include SSL certificates, daily backups, and regular software updates to keep your site running smoothly and securely."
    },
    {
        question: "Will I be able to update the website myself?",
        answer: "Absolutely. I build websites with user-friendly Content Management Systems (CMS) or provide a custom admin dashboard, empowering you to easily update text, images, and blog posts without needing to touch a line of code."
    }
];

const FAQItem = ({ question, answer, isOpen, onClick }) => {
    return (
        <motion.div
            initial={false}
            className={`border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md transition-all duration-300 ${isOpen ? 'bg-white/5 border-primary/30 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]' : 'bg-white/5 hover:bg-white/10'}`}
        >
            <button
                onClick={onClick}
                className="flex items-center justify-between w-full p-6 text-left"
            >
                <span className={`text-lg font-medium transition-colors ${isOpen ? 'text-primary' : 'text-white'}`}>
                    {question}
                </span>
                <span className={`p-2 rounded-full transition-colors ${isOpen ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/60'}`}>
                    {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                </span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="px-6 pb-6 text-white/70 leading-relaxed border-t border-white/5 pt-4">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <title>FAQ - Harley Gilpin</title>
            <meta name="description" content="Frequently asked questions about my web development services, pricing, and process." />

            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
                    >
                        <HelpCircle size={14} />
                        <span>Common Questions</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-white tracking-tight"
                    >
                        Frequently Asked <span className="text-gradient">Questions</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-white/60 max-w-2xl mx-auto"
                    >
                        Here are detailed answers to the most common questions about my services, process, and terms.
                    </motion.p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + (index * 0.1) }}
                        >
                            <FAQItem
                                question={faq.question}
                                answer={faq.answer}
                                isOpen={openIndex === index}
                                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                            />
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-16 text-center bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm"
                >
                    <h3 className="text-xl font-semibold text-white mb-2">Still have questions?</h3>
                    <p className="text-white/60 mb-6">Can't find the answer you're looking for? Please chat to our friendly team.</p>
                    <a
                        href="/contact"
                        className="inline-flex items-center justify-center px-8 py-3 rounded-lg font-bold border border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-black transition-all gap-2"
                    >
                        Get in touch
                    </a>
                </motion.div>
            </div>
        </div>
    );
};

export default FAQ;
