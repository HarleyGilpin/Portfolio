import React from 'react';
import { Download, Briefcase, GraduationCap } from 'lucide-react';

const Resume = () => {
    return (
        <div className="pt-4 pb-16 container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
                <h1 className="text-4xl font-bold"><span className="text-gradient">Resume</span></h1>
                <button className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center gap-2 transition-colors">
                    <Download size={18} /> Download PDF
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Experience */}
                <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <Briefcase className="text-accent-primary" /> Experience
                    </h2>

                    <div className="space-y-8">
                        <div className="glass-panel p-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-accent-primary" />
                            <h3 className="text-xl font-bold">IT Auditor</h3>
                            <p className="text-accent-primary mb-2">Armanino • Present</p>
                            <p className="text-text-secondary">
                                As an IT Auditor in Armanino’s Risk Assurance & Advisory practice, I evaluate the security and compliance controls that support SOC 1 and SOC 2 reporting. I work directly with engineering, IT, product, and security teams to assess processes like access management, change management, incident response, vulnerability management, and governance. My role involves reviewing technical evidence, analyzing logs, validating privileged access, documenting exceptions, and clearly communicating expectations to clients throughout the audit. I focus on identifying risks early, ensuring controls operate effectively, and helping organizations build trust by maintaining secure and well-governed systems.
                            </p>
                        </div>

                        <div className="glass-panel p-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-accent-secondary" />
                            <h3 className="text-xl font-bold">Freelance Software Engineer</h3>
                            <p className="text-accent-secondary mb-2">Self-Employed • Present</p>
                            <p className="text-text-secondary">
                                Developing web applications and software solutions for various clients.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Education/Skills */}
                <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <GraduationCap className="text-accent-secondary" /> Skills
                    </h2>

                    <div className="glass-panel p-6">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold mb-3">Technical</h3>
                            <div className="flex flex-wrap gap-2">
                                {['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'IT Audit', 'Cybersecurity'].map(skill => (
                                    <span key={skill} className="px-3 py-1 bg-white/5 rounded-md text-sm border border-white/10">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Resume;
