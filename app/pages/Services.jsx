import React from 'react';
import { Link } from 'react-router';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import {
    FaCode,
    FaPaintBrush,
    FaSearchDollar,
    FaPenNib,
    FaHashtag,
    FaFingerprint,
    FaCogs,
    FaCheckCircle,
    FaRocket,
    FaClock,
    FaComments,
    FaEnvelopeOpenText
} from 'react-icons/fa';

const Services = () => {
    const services = [
        {
            icon: <FaCode className="text-4xl text-accent-primary mb-4" />,
            title: "Web Design",
            description: "Stunning, responsive websites that captivate and convert."
        },
        {
            icon: <FaPaintBrush className="text-4xl text-accent-primary mb-4" />,
            title: "Graphic Design",
            description: "Visual assets that define your brand identity."
        },
        {
            icon: <FaSearchDollar className="text-4xl text-accent-primary mb-4" />,
            title: "SEO & Digital Marketing",
            description: "Strategies to rank higher and reach more customers."
        },
        {
            icon: <FaPenNib className="text-4xl text-accent-primary mb-4" />,
            title: "Copywriting",
            description: "Persuasive text that sells your story."
        },
        {
            icon: <FaHashtag className="text-4xl text-accent-primary mb-4" />,
            title: "Social Media Marketing",
            description: "Engaging content to grow your audience."
        },
        {
            icon: <FaFingerprint className="text-4xl text-accent-primary mb-4" />,
            title: "Branding & Logo Design",
            description: "Memorable identities for lasting impressions."
        },
        {
            icon: <FaCogs className="text-4xl text-accent-primary mb-4" />,
            title: "Automation & Tech",
            description: "Custom solutions to streamline your workflow."
        },
        {
            icon: <FaEnvelopeOpenText className="text-4xl text-accent-primary mb-4" />,
            title: "Email Marketing",
            description: "Campaigns that nurture leads and drive sales."
        }
    ];

    const pricingTiers = [
        {
            price: "$10",
            name: "Starter Task",
            description: "Perfect for quick fixes or small tweaks.",
            features: ["Minor CSS/HTML edits", "Logo vectorization", "Social media caption", "Basic email setup"]
        },
        {
            price: "$25",
            name: "Basic Boost",
            description: "Essential updates and small creative assets.",
            features: ["Banner/Hero image design", "Content updates", "Plugin configuration", "Simple graphic edits"]
        },
        {
            price: "$50",
            name: "Growth Pack",
            description: "Solid improvements for your digital presence.",
            features: ["One-page SEO optimization", "Blog post writing (500w)", "Custom social media template", "Form setup & integration"]
        },
        {
            price: "$100",
            name: "Pro Build",
            description: "Professional grade components and features.",
            features: ["Landing page section design", "Advanced automation setup", "Detailed keyword research", "Email newsletter template"]
        },
        {
            price: "$200",
            name: "Advanced Strategy",
            description: "Comprehensive solutions for growing brands.",
            features: ["Full landing page (3-5 sections)", "Brand style guide", "In-depth competitor analysis", "Complex API integration"]
        },
        {
            price: "$250",
            name: "Business Accelerator",
            description: "Scale your operations with multi-page setups.",
            features: ["3-Page Website (Home, About, Contact)", "Advanced SEO & Speed Optimization", "Email Marketing Setup (Welcome Sequence)", "Social Media Content Calendar (2 weeks)"]
        },
        {
            price: "$500",
            name: "Agency Package",
            description: "Complete project delivery for tangible results.",
            features: ["5-page informational website", "Full branding package", "Month-long social media plan", "Custom web application prototype"]
        },
        {
            price: "$1000",
            name: "Enterprise Solution",
            description: "Top-tier development and strategic overhaul.",
            features: ["Full-stack custom application", "Comprehensive E-commerce build", "Complete digital marketing overhaul", "Priority support & strategy"]
        }
    ];

    const steps = [
        { number: "01", title: "Select Tier", desc: "Choose the package that fits your needs." },
        { number: "02", title: "Briefing", desc: "Share your vision and requirements." },
        { number: "03", title: "Creation", desc: "I get to work delivering top-quality results." },
        { number: "04", title: "Delivery", desc: "Review, refine, and launch." }
    ];

    return (
        <div className="pt-20 min-h-screen bg-background text-text-primary px-4 sm:px-8 lg:px-16 pb-20">
            <SEO
                title="Web Design & SEO Services"
                description="Professional web design, graphic design, and SEO services. Transparent pricing for startups and growing businesses."
                keywords="Web Design, SEO Services, Graphic Design, Branding, Digital Marketing, Copywriting"
            />
            {/* Hero Section */}
            <section className="text-center mb-20">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-6xl font-bold mb-6 gradient-text"
                >
                    Elevate Your Digital Presence
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-text-muted max-w-2xl mx-auto"
                >
                    Professional web design, branding, and marketing services tailored to scale your business.
                    Quality work, transparent pricing, delivered fast.
                </motion.p>
            </section>

            {/* Services Grid */}
            <section className="mb-24">
                <h2 className="text-3xl font-bold mb-10 text-center">My Expertise</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ y: -5 }}
                            className="bg-card-bg p-6 rounded-xl border border-border-color shadow-lg hover:shadow-accent-primary/20 transition-all"
                        >
                            {service.icon}
                            <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                            <p className="text-text-muted">{service.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Pricing Tiers */}
            <section className="mb-24">
                <h2 className="text-3xl font-bold mb-4 text-center">Simple, Transparent Pricing</h2>
                <p className="text-text-muted text-center mb-12 max-w-2xl mx-auto">
                    Choose a fixed-price tier that matches your project size. No hidden fees.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center">
                    {pricingTiers.map((tier, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ scale: 1.02 }}
                            className="bg-card-bg rounded-xl border border-border-color overflow-hidden flex flex-col"
                        >
                            <div className="p-6 flex-grow">
                                <div className="text-3xl font-bold text-accent-primary mb-2">{tier.price}</div>
                                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                                <p className="text-text-muted text-sm mb-4">{tier.description}</p>
                                <ul className="space-y-2">
                                    {tier.features.map((feature, i) => (
                                        <li key={i} className="flex items-start text-sm">
                                            <FaCheckCircle className="text-accent-primary mt-1 mr-2 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="p-6 pt-0 mt-auto">
                                <Link
                                    to={`/checkout?tier=${index}`}
                                    className="block w-full text-center py-2 rounded-lg bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary font-semibold transition-colors border border-accent-primary/50"
                                >
                                    Select {tier.name}
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Process Section */}
            <section className="mb-24">
                <h2 className="text-3xl font-bold mb-10 text-center">How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="relative p-6 border border-border-color rounded-xl bg-card-bg overflow-hidden group hover:border-accent-primary/50 transition-colors">
                            <div className="text-5xl font-bold text-accent-primary/5 absolute top-2 right-2 z-0 group-hover:text-accent-primary/10 transition-colors select-none">
                                {step.number}
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                                <p className="text-text-muted">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Trust Section */}
            <section className="mb-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-center bg-card-bg/50 p-10 rounded-2xl border border-border-color">
                <div>
                    <FaComments className="text-4xl text-accent-primary mx-auto mb-4" />
                    <h3 className="font-bold mb-2">Clear Communication</h3>
                    <p className="text-text-muted text-sm">Always in the loop, every step of the way.</p>
                </div>
                <div>
                    <FaRocket className="text-4xl text-accent-primary mx-auto mb-4" />
                    <h3 className="font-bold mb-2">Fast Delivery</h3>
                    <p className="text-text-muted text-sm">Respecting deadlines without compromising quality.</p>
                </div>
                <div>
                    <FaCheckCircle className="text-4xl text-accent-primary mx-auto mb-4" />
                    <h3 className="font-bold mb-2">Quality Guarantee</h3>
                    <p className="text-text-muted text-sm">Professional standards for professional results.</p>
                </div>
            </section>

            {/* CTA Section */}
            <section className="text-center py-16 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-3xl border border-accent-primary/20">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
                <p className="text-xl text-text-muted mb-8 max-w-xl mx-auto">
                    Choose your service tier above and get started instantly.
                    Let’s build something amazing together.
                </p>
                <button
                    onClick={() => window.scrollTo({ top: document.querySelector('.grid-cols-1').offsetTop - 100, behavior: 'smooth' })}
                    className="bg-accent-primary hover:bg-accent-secondary text-black font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105"
                >
                    View Tiers & Start
                </button>
            </section>
        </div>
    );
};

export default Services;
