import React from 'react';
import { Link } from 'react-router-dom';

import SEO from '../components/SEO';

const About = () => {
    return (
        <div className="pt-24 pb-16 container mx-auto px-4">
            <SEO title="About Me" description="Learn more about Harley Gilpin, an IT Auditor and Software Engineer." />
            <h1 className="text-4xl md:text-5xl font-bold mb-12 text-center"><span className="text-gradient">About Me</span></h1>

            <div className="space-y-12 max-w-4xl mx-auto">
                {/* Intro / UVP */}
                <div className="glass-panel p-8 md:p-10">
                    <h2 className="text-2xl font-bold mb-4 text-text-primary">The Intersection of Marketing & Development</h2>
                    <p className="text-lg text-text-secondary leading-relaxed">
                        I bridge the gap between building products and growing them. As a Digital Marketer, Full Stack Developer, and IT Auditor,
                        I bring a unique full-funnel perspective to every project. I don't just write code; I build data-driven solutions that
                        solve real business problems and drive growth.
                    </p>
                </div>

                {/* Background */}
                <div className="glass-panel p-8 md:p-10">
                    <h2 className="text-2xl font-bold mb-4 text-text-primary">My Journey</h2>
                    <div className="space-y-4 text-text-secondary leading-relaxed">
                        <p>
                            I bring over <strong>a decade of professional experience designing websites</strong>, combined with deep expertise in the cybersecurity and accounting fields. As an IT Auditor, I apply a security-first mindset to every project. I have <strong>passed my CISA exam</strong> and am currently building my skillset in defensive security while working towards full certification.
                        </p>
                        <p>
                            I also specialize in building business automation workflows, streamlining operations using <span className="text-text-primary font-medium">Python</span>, <span className="text-text-primary font-medium">Alteryx Designer</span>, and the <span className="text-text-primary font-medium">Microsoft Power Platform</span>.
                        </p>
                        <p>
                            My diverse background spans across multiple industries including <strong>Accounting, Music, Gaming, Fitness, and Construction</strong>.
                            This variety has equipped me with the adaptability to understand unique industry challenges and tailor technical solutions to meet them.
                        </p>
                    </div>
                </div>

                {/* Skills Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="glass-panel p-8">
                        <h3 className="text-xl font-bold mb-6 text-[var(--accent-secondary)]">Technical Stack</h3>
                        <div className="flex flex-wrap gap-2">
                            {['Python', 'Kotlin', 'React', 'Java', 'HTML/CSS/JS'].map(skill => (
                                <span key={skill} className="px-3 py-1 bg-[#1a1a1a] rounded-full text-sm text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="glass-panel p-8">
                        <h3 className="text-xl font-bold mb-6 text-[var(--accent-tertiary)]">Marketing & Data</h3>
                        <div className="flex flex-wrap gap-2">
                            {['Google Ads Certified', 'SEO', 'Analytics', 'Automation'].map(tool => (
                                <span key={tool} className="px-3 py-1 bg-[#1a1a1a] rounded-full text-sm text-white border border-[var(--accent-tertiary)]/30">
                                    {tool}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Personal */}
                <div className="glass-panel p-8 md:p-10">
                    <h2 className="text-2xl font-bold mb-4 text-text-primary">Beyond the Code</h2>
                    <p className="text-text-secondary leading-relaxed">
                        When I'm not optimizing workflows or debugging code, you can find me on the slopes <strong>snowboarding</strong>,
                        on the trails <strong>running</strong>, or staying active.
                        I bring the same discipline and drive from my days as a collegiate <strong>sprints and jumps track athlete</strong> to my professional work.
                        I also love contributing to open source projects; the code for this website is freely available on my <a href="https://github.com/HarleyGilpin/Portfolio" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] hover:underline">GitHub</a>.
                    </p>
                </div>

                {/* CTA */}
                <div className="text-center py-8">
                    <p className="text-xl text-text-primary mb-8">Ready to leverage this unique skillset for your next project?</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/services" className="px-8 py-3 rounded-lg font-bold bg-[var(--accent-primary)] text-black hover:opacity-90 transition-opacity">
                            View My Services
                        </Link>
                        <Link to="/contact" className="px-8 py-3 rounded-lg font-bold border border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-black transition-all">
                            Contact Me
                        </Link>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default About;
