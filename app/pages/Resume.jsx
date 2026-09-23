import React from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import {
    Briefcase, GraduationCap, Award, MapPin, Github, Linkedin, ExternalLink,
    Code2, ShieldCheck, Gamepad2, Workflow, Sparkles, Layers, ArrowRight, GitPullRequest,
} from 'lucide-react';

import SEO from '../components/SEO';
import {
    profile, stats, experience, highlights, skills, certifications, education,
} from '../data/resume';

const categoryIcons = {
    Web: Code2,
    Automation: Workflow,
    Security: ShieldCheck,
    'Games & XR': Gamepad2,
    'Open Source': GitPullRequest,
};

/* ─── Fade-in Wrapper ─── */
const FadeIn = ({ children, className = '', delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, delay, ease: 'easeOut' }}
        className={className}
    >
        {children}
    </motion.div>
);

const SectionHeading = ({ icon, children }) => (
    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        {icon} {children}
    </h2>
);

const Resume = () => {
    return (
        <div className="pt-4 pb-16 container mx-auto px-4">
            <SEO
                title="Resume"
                description="Harley Gilpin's resume: software engineer and CISA-certified IT auditor. Full-stack web development, workflow automation, application security, SOC 1/SOC 2 audit, and Unity/XR development."
                keywords="Harley Gilpin, resume, software engineer, IT auditor, CISA, SOC 2, full-stack developer, React, Next.js, Django, Unity, Eugene Oregon"
            />
            <h1 className="text-4xl font-bold mb-12"><span className="text-gradient">Resume</span></h1>

            {/* Header */}
            <FadeIn className="glass-panel p-8 md:p-10 mb-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'var(--gradient-main)' }} />
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-2">{profile.name}</h2>
                        <p className="text-lg text-accent-primary mb-2">{profile.tagline}</p>
                        <p className="flex items-center gap-2 text-text-secondary">
                            <MapPin size={16} /> {profile.location}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <a
                            href={profile.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub"
                            className="w-11 h-11 rounded-full glass-panel flex items-center justify-center text-text-secondary hover:text-accent-primary hover:border-accent-primary/50 transition-colors"
                        >
                            <Github size={20} />
                        </a>
                        <a
                            href={profile.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="LinkedIn"
                            className="w-11 h-11 rounded-full glass-panel flex items-center justify-center text-text-secondary hover:text-accent-primary hover:border-accent-primary/50 transition-colors"
                        >
                            <Linkedin size={20} />
                        </a>
                        <Link to="/contact" className="px-6 py-2.5 rounded-lg font-bold bg-[var(--accent-primary)] text-black hover:opacity-90 transition-opacity">
                            Get in Touch
                        </Link>
                    </div>
                </div>

                <p className="text-text-secondary leading-relaxed mb-8">{profile.summary}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map(stat => (
                        <div key={stat.label} className="rounded-lg bg-white/5 border border-border-color p-4 text-center">
                            <p className="text-2xl md:text-3xl font-bold font-space-grotesk text-gradient">{stat.value}</p>
                            <p className="text-xs md:text-sm text-text-secondary mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </FadeIn>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                {/* Main column */}
                <div className="lg:col-span-2 space-y-16">
                    {/* Experience timeline */}
                    <section>
                        <SectionHeading icon={<Briefcase className="text-accent-primary" />}>Experience</SectionHeading>
                        <ol className="relative border-l border-border-color ml-2 space-y-10">
                            {experience.map((job, index) => (
                                <li key={job.title} className="pl-8 relative">
                                    <span
                                        className="absolute -left-[9px] top-2 w-4 h-4 rounded-full ring-4 ring-bg-primary"
                                        style={{ background: 'var(--gradient-main)' }}
                                    />
                                    <FadeIn delay={index * 0.1} className="glass-panel p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold">{job.title}</h3>
                                                <p className="text-accent-primary">{job.company} · {job.location}</p>
                                            </div>
                                            <span className="text-sm text-text-muted whitespace-nowrap sm:mt-1">{job.dates}</span>
                                        </div>
                                        <ul className="space-y-2">
                                            {job.bullets.map(bullet => (
                                                <li key={bullet} className="flex gap-3 text-text-secondary">
                                                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent-secondary flex-shrink-0" />
                                                    <span>{bullet}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </FadeIn>
                                </li>
                            ))}
                        </ol>
                    </section>

                    {/* Selected work */}
                    <section>
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <Sparkles className="text-accent-secondary" /> Selected Work
                            </h2>
                            <Link to="/projects" className="flex items-center gap-2 text-sm text-accent-primary hover:text-text-primary transition-colors">
                                View projects <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {highlights.map((item, index) => {
                                const CategoryIcon = categoryIcons[item.category] ?? Code2;
                                return (
                                    <FadeIn
                                        key={item.title}
                                        delay={(index % 2) * 0.1}
                                        className={`glass-panel p-6 flex flex-col hover:border-accent-primary/50 transition-colors ${item.featured ? 'md:col-span-2' : ''}`}
                                    >
                                        <span className="self-start flex items-center gap-1.5 px-3 py-1 mb-4 text-xs rounded-full bg-accent-secondary/10 text-text-primary border border-accent-secondary/40">
                                            <CategoryIcon size={14} /> {item.category}
                                        </span>
                                        <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                        <p className="text-sm text-text-secondary mb-4 flex-grow">{item.description}</p>
                                        {item.bullets && (
                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mb-4">
                                                {item.bullets.map(bullet => (
                                                    <li key={bullet} className="flex gap-3 text-sm text-text-secondary">
                                                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent-secondary flex-shrink-0" />
                                                        <span>{bullet}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {item.link && (
                                            <a
                                                href={item.link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm text-accent-primary hover:text-text-primary transition-colors mb-4"
                                            >
                                                {item.link.label} <ExternalLink size={14} />
                                            </a>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                            {item.tags.map(tag => (
                                                <span key={tag} className="px-3 py-1 text-xs rounded-full bg-white/5 text-accent-primary border border-accent-primary/20">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </FadeIn>
                                );
                            })}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <aside className="space-y-8">
                    <FadeIn className="glass-panel p-6">
                        <SectionHeading icon={<Layers className="text-accent-secondary" />}>Skills</SectionHeading>
                        <div className="space-y-5">
                            {skills.map(group => (
                                <div key={group.label}>
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">{group.label}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {group.items.map(skill => (
                                            <span key={skill} className="px-2.5 py-1 text-xs rounded-md bg-white/5 text-text-secondary border border-border-color">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </FadeIn>

                    <FadeIn className="glass-panel p-6" delay={0.1}>
                        <SectionHeading icon={<Award className="text-accent-primary" />}>Certification</SectionHeading>
                        {certifications.map(cert => (
                            <div key={cert.name}>
                                <p className="font-bold">{cert.name}</p>
                                <p className="text-sm text-text-secondary">{cert.issuer} · {cert.date}</p>
                            </div>
                        ))}
                    </FadeIn>

                    <FadeIn className="glass-panel p-6" delay={0.2}>
                        <SectionHeading icon={<GraduationCap className="text-accent-secondary" />}>Education</SectionHeading>
                        {education.map(entry => (
                            <div key={entry.degree}>
                                <p className="font-bold">{entry.degree}</p>
                                <p className="text-sm text-accent-primary mb-2">{entry.school} · {entry.location}</p>
                                <ul className="space-y-1">
                                    {entry.details.map(detail => (
                                        <li key={detail} className="text-sm text-text-secondary">{detail}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </FadeIn>
                </aside>
            </div>
        </div>
    );
};

export default Resume;
