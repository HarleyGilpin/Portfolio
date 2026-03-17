import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Shield, ShieldCheck, Lock, Search, Code, Palette, TrendingUp, Zap, Send, Loader2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';
import { motion, useInView } from 'framer-motion';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';
import SEO from '../components/SEO';
import MatrixRain from '../components/MatrixRain';
import ProfilePic from '../assets/profile-pic.webp';
import ProjectGeorgeWalcott from '../assets/project-georgewalcott.png';
import ProjectAllDirt from '../assets/project-alldirt.png';

/* ─── Typing Animation Hook ─── */
const useTypingEffect = (words, typingSpeed = 100, deletingSpeed = 60, pauseTime = 2000) => {
    const [text, setText] = useState('');
    const [wordIndex, setWordIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentWord = words[wordIndex];
        let timeout;

        if (!isDeleting && text === currentWord) {
            timeout = setTimeout(() => setIsDeleting(true), pauseTime);
        } else if (isDeleting && text === '') {
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % words.length);
        } else {
            timeout = setTimeout(() => {
                setText(currentWord.substring(0, text.length + (isDeleting ? -1 : 1)));
            }, isDeleting ? deletingSpeed : typingSpeed);
        }

        return () => clearTimeout(timeout);
    }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseTime]);

    return text;
};

/* ─── Animated Counter Hook ─── */
const useCounter = (target, duration = 2000, isVisible = false) => {
    const [count, setCount] = useState(0);
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (!isVisible || hasAnimated.current) return;
        hasAnimated.current = true;

        let start = 0;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [isVisible, target, duration]);

    return count;
};

/* ─── Stat Card Component ─── */
const StatCard = ({ value, suffix, label, isVisible }) => {
    const count = useCounter(value, 2000, isVisible);
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
        >
            <div className="text-4xl md:text-5xl font-bold font-space-grotesk text-accent-primary mb-2">
                {count}{suffix}
            </div>
            <div className="text-text-secondary text-sm uppercase tracking-wider">{label}</div>
        </motion.div>
    );
};

/* ─── Fade-in Section Wrapper ─── */
const FadeInSection = ({ children, className = '', delay = 0 }) => (
    <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, delay, ease: 'easeOut' }}
        className={className}
    >
        {children}
    </motion.section>
);

/* ─── Main Home Page ─── */
const Home = () => {
    const typedRole = useTypingEffect([
        'IT Auditor',
        'Software Engineer',
        'Cybersecurity Specialist',
        'Full Stack Developer',
    ]);

    const statsRef = useRef(null);
    const statsInView = useInView(statsRef, { once: true, margin: '-100px' });
    const formRef = useRef();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await emailjs.sendForm(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                formRef.current,
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            );
            toast.success('Message sent! I\'ll get back to you soon.');
            e.target.reset();
        } catch (error) {
            const errorMessage = error.text || error.message || 'Unknown error';
            toast.error(`Failed: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const cyberCards = [
        { icon: ShieldCheck, title: 'IT Audit & Compliance', desc: 'Comprehensive IT audits aligned with frameworks like SOX, COBIT, and NIST to protect your organization.' },
        { icon: Lock, title: 'Security Architecture', desc: 'Designing secure systems from the ground up with defense-in-depth strategies and zero-trust principles.' },
        { icon: Search, title: 'Vulnerability Assessment', desc: 'Identifying weaknesses in your infrastructure before attackers do, with actionable remediation plans.' },
        { icon: Shield, title: 'CISA Certified', desc: 'Passed the Certified Information Systems Auditor exam, demonstrating deep expertise in IS audit and control.' },
    ];

    const services = [
        { icon: Code, title: 'Web Development', desc: 'Full-stack applications built with modern frameworks, optimized for performance and security.' },
        { icon: Palette, title: 'UI/UX Design', desc: 'Stunning, responsive interfaces that captivate users and drive conversions.' },
        { icon: TrendingUp, title: 'SEO & Marketing', desc: 'Data-driven strategies to boost your visibility and reach more customers.' },
        { icon: Zap, title: 'Automation', desc: 'Custom workflows and integrations that streamline your business operations.' },
    ];

    return (
        <div className="min-h-screen overflow-hidden -mt-24">
            <SEO
                title="Future of Web Experiences"
                description="Harley Gilpin is an IT Auditor and Software Engineer specializing in building secure, futuristic, and high-performance web applications."
                keywords="IT Auditor, Software Engineer, Cybersecurity, CISA, Web Developer, React, Portfolio, Security, Full Stack"
            />

            {/* ═══════════════════════════════════════════
                SECTION 1 — HERO
            ═══════════════════════════════════════════ */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16">
                {/* Matrix Rain BG */}
                <MatrixRain opacity={0.18} />
                {/* Radial glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-primary/15 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-accent-secondary/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-12 md:gap-8">
                        {/* Text */}
                        <motion.div
                            className="flex-1 text-center md:text-left"
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                        >
                            <motion.p
                                className="text-accent-primary font-mono text-sm mb-4 tracking-widest uppercase"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                &gt; Hello, I'm Harley Gilpin
                            </motion.p>

                            <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
                                Building the <span className="text-gradient">Future</span>
                                <br />of Web Experiences
                            </h1>

                            <div className="text-2xl md:text-3xl font-space-grotesk font-semibold text-text-secondary mb-8 h-10">
                                <span className="text-accent-primary">{typedRole}</span>
                                <span className="typing-cursor">|</span>
                            </div>

                            <p className="text-lg text-text-secondary mb-10 max-w-xl mx-auto md:mx-0">
                                Crafting secure, futuristic digital solutions at the intersection of
                                cybersecurity, software engineering, and digital marketing.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <Link
                                    to="/contact"
                                    className="group px-8 py-3.5 bg-accent-primary text-black font-bold rounded-full hover:shadow-lg hover:shadow-accent-primary/25 transition-all flex items-center justify-center gap-2"
                                >
                                    Get a Free Consultation <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    to="/projects"
                                    className="px-8 py-3.5 border border-border-color rounded-full hover:bg-border-color transition-all font-medium text-center"
                                >
                                    View My Work
                                </Link>
                            </div>
                        </motion.div>

                        {/* Profile Photo */}
                        <motion.div
                            className="flex-1 flex justify-center md:justify-end relative"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                        >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] md:w-[380px] md:h-[380px] bg-accent-secondary/25 rounded-full blur-[60px] -z-10" />

                            <div className="relative p-1 rounded-full gradient-rotate-border">
                                <div className="rounded-full overflow-hidden bg-bg-primary w-[250px] h-[250px] md:w-[350px] md:h-[350px] border-4 border-bg-primary">
                                    <img
                                        src={ProfilePic}
                                        alt="Harley Gilpin"
                                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </div>

                            {/* Floating badges */}
                            <motion.div
                                className="absolute -bottom-2 -left-2 md:left-4 glass-panel px-4 py-2 flex items-center gap-2 text-sm"
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <ShieldCheck size={18} className="text-accent-primary" />
                                <span className="font-medium">CISA Certified</span>
                            </motion.div>
                            <motion.div
                                className="absolute -top-2 -right-2 md:right-4 glass-panel px-4 py-2 flex items-center gap-2 text-sm"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                            >
                                <Code size={18} className="text-accent-secondary" />
                                <span className="font-medium">Full Stack Dev</span>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 10, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-6 h-10 rounded-full border-2 border-text-muted flex justify-center pt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                    </div>
                </motion.div>
            </section>

            {/* ═══════════════════════════════════════════
                SECTION 2 — CYBERSECURITY EXPERTISE
            ═══════════════════════════════════════════ */}
            <FadeInSection className="py-20 md:py-28 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-primary/[0.02] to-transparent pointer-events-none" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <motion.p
                            className="text-accent-primary font-mono text-sm mb-3 tracking-widest uppercase"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            &gt; Security First
                        </motion.p>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            Cybersecurity <span className="text-gradient">Expertise</span>
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto text-lg">
                            Protecting digital assets with a security-first mindset, backed by industry certifications and hands-on experience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {cyberCards.map((card, i) => (
                            <motion.div
                                key={card.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                                className="glass-panel p-6 group hover:border-accent-primary/30 transition-colors cursor-default"
                            >
                                <div className="w-12 h-12 rounded-lg bg-accent-primary/10 flex items-center justify-center mb-4 group-hover:bg-accent-primary/20 transition-colors">
                                    <card.icon size={24} className="text-accent-primary" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{card.title}</h3>
                                <p className="text-text-secondary text-sm leading-relaxed">{card.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </FadeInSection>

            {/* ═══════════════════════════════════════════
                SECTION 3 — STATS
            ═══════════════════════════════════════════ */}
            <section ref={statsRef} className="py-16 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="glass-panel p-10 md:p-14 grid grid-cols-2 md:grid-cols-4 gap-8 bg-gradient-to-r from-accent-primary/[0.04] to-accent-secondary/[0.04]">
                        <StatCard value={10} suffix="+" label="Years Experience" isVisible={statsInView} />
                        <StatCard value={50} suffix="+" label="Projects Delivered" isVisible={statsInView} />
                        <StatCard value={100} suffix="%" label="Client Satisfaction" isVisible={statsInView} />
                        <StatCard value={1} suffix="" label="CISA Certification" isVisible={statsInView} />
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                SECTION 3.5 — FEATURED PROJECTS
            ═══════════════════════════════════════════ */}
            <FadeInSection className="py-20 md:py-28">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <motion.p
                            className="text-accent-primary font-mono text-sm mb-3 tracking-widest uppercase"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            &gt; Recent Work
                        </motion.p>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            Featured <span className="text-gradient">Projects</span>
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto text-lg">
                            Real-world websites I've designed and developed for clients.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        {[
                            {
                                title: 'Training by George Walcott',
                                desc: 'A premium fitness training platform for a PAC-10 Champion and 3x Jamaican Olympic Trials qualifier, featuring program enrollment and athlete showcase.',
                                image: ProjectGeorgeWalcott,
                                url: 'https://trainingbygeorgewalcott.com',
                                tags: ['React', 'Next.js', 'Fitness'],
                            },
                            {
                                title: 'All Dirt, Inc.',
                                desc: 'A professional excavation and septic services website for a Lane County contractor, featuring service pages, SEO optimization, and lead generation.',
                                image: ProjectAllDirt,
                                url: 'https://alldirtinc.com',
                                tags: ['React', 'SEO', 'Construction'],
                            },
                        ].map((project, i) => (
                            <motion.a
                                key={project.title}
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.15 }}
                                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                                className="glass-panel overflow-hidden group hover:border-accent-primary/30 transition-colors block"
                            >
                                {/* Browser mockup preview */}
                                <div className="relative overflow-hidden">
                                    <div className="bg-bg-tertiary px-4 py-2 flex items-center gap-2 border-b border-border-color">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                                        </div>
                                        <span className="text-[10px] text-text-muted ml-2 truncate">{project.url}</span>
                                    </div>
                                    <div className="aspect-[16/10] overflow-hidden">
                                        <img
                                            src={project.image}
                                            alt={project.title}
                                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-bold">{project.title}</h3>
                                        <ExternalLink size={18} className="text-text-muted group-hover:text-accent-primary transition-colors" />
                                    </div>
                                    <p className="text-text-secondary text-sm mb-4 leading-relaxed">{project.desc}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map((tag) => (
                                            <span key={tag} className="px-3 py-1 text-xs rounded-full bg-accent-primary/5 text-accent-primary border border-accent-primary/20">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.a>
                        ))}
                    </div>

                    <div className="text-center">
                        <Link
                            to="/projects"
                            className="inline-flex items-center gap-2 text-accent-primary font-semibold hover:gap-3 transition-all"
                        >
                            View All Projects <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </FadeInSection>

            {/* ═══════════════════════════════════════════
                SECTION 4 — SERVICES PREVIEW
            ═══════════════════════════════════════════ */}
            <FadeInSection className="py-20 md:py-28">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <motion.p
                            className="text-accent-secondary font-mono text-sm mb-3 tracking-widest uppercase"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            &gt; What I Do
                        </motion.p>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            Services <span className="text-gradient">Offered</span>
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto text-lg">
                            End-to-end digital solutions — from building secure web apps to growing your online presence.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {services.map((service, i) => (
                            <motion.div
                                key={service.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                                className="glass-panel p-6 group hover:border-accent-secondary/30 transition-colors cursor-default"
                            >
                                <div className="w-12 h-12 rounded-lg bg-accent-secondary/10 flex items-center justify-center mb-4 group-hover:bg-accent-secondary/20 transition-colors">
                                    <service.icon size={24} className="text-accent-secondary" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{service.title}</h3>
                                <p className="text-text-secondary text-sm leading-relaxed">{service.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-center">
                        <Link
                            to="/services"
                            className="inline-flex items-center gap-2 text-accent-primary font-semibold hover:gap-3 transition-all"
                        >
                            View All Services & Pricing <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </FadeInSection>

            {/* ═══════════════════════════════════════════
                SECTION 5 — LEAD GENERATION CTA
            ═══════════════════════════════════════════ */}
            <FadeInSection className="py-20 md:py-28">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto glass-panel overflow-hidden relative">
                        {/* Glow accents */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary" />
                        <div className="absolute -top-20 -right-20 w-60 h-60 bg-accent-primary/10 rounded-full blur-[80px] pointer-events-none" />
                        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent-secondary/10 rounded-full blur-[80px] pointer-events-none" />

                        <div className="relative z-10 grid md:grid-cols-2 gap-10 p-8 md:p-12">
                            {/* Left — Copy */}
                            <div className="flex flex-col justify-center">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                    Let's <span className="text-gradient">Secure</span> Your Digital Future
                                </h2>
                                <p className="text-text-secondary mb-6 leading-relaxed">
                                    Ready to build something exceptional? Whether you need a secure web application,
                                    cybersecurity consultation, or a complete digital overhaul — I'm here to help.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {['Free Consultation', 'Fast Response', 'No Commitment'].map((tag) => (
                                        <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Right — Form */}
                            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        name="user_name"
                                        required
                                        placeholder="Your Name"
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:border-accent-primary focus:outline-none transition-colors text-text-primary placeholder:text-text-muted"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="email"
                                        name="user_email"
                                        required
                                        placeholder="your@email.com"
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:border-accent-primary focus:outline-none transition-colors text-text-primary placeholder:text-text-muted"
                                    />
                                </div>
                                <div>
                                    <textarea
                                        name="message"
                                        rows="3"
                                        required
                                        placeholder="Tell me about your project..."
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:border-accent-primary focus:outline-none transition-colors text-text-primary placeholder:text-text-muted resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-lg font-bold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <><Loader2 className="animate-spin" size={18} /> Sending...</>
                                    ) : (
                                        <>Send Message <Send size={18} /></>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </FadeInSection>
        </div>
    );
};

export default Home;
