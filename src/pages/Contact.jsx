import React from 'react';
import { Mail, Linkedin, Send } from 'lucide-react';

const Contact = () => {
    return (
        <div className="pt-24 pb-16 container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-8 text-center"><span className="text-gradient">Get In Touch</span></h1>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Contact Info */}
                <div className="space-y-8">
                    <p className="text-lg text-text-secondary">
                        Whether you have a question, a project idea, or just want to say hi, feel free to reach out!
                    </p>

                    <div className="space-y-4">
                        <a href="mailto:hg@harleygilpin.com" className="flex items-center gap-4 p-4 glass-panel hover:bg-white/5 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                                <Mail />
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Email</p>
                                <p className="font-medium">hg@harleygilpin.com</p>
                            </div>
                        </a>

                        <a href="https://www.linkedin.com/in/harleygilpin/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 glass-panel hover:bg-white/5 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-accent-secondary/10 flex items-center justify-center text-accent-secondary">
                                <Linkedin />
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">LinkedIn</p>
                                <p className="font-medium">Harley Gilpin</p>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Form */}
                <form className="glass-panel p-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-text-secondary">Name</label>
                        <input
                            type="text"
                            className="w-full bg-bg-primary border border-white/10 rounded-lg p-3 focus:border-accent-primary focus:outline-none transition-colors"
                            placeholder="Your Name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-text-secondary">Email</label>
                        <input
                            type="email"
                            className="w-full bg-bg-primary border border-white/10 rounded-lg p-3 focus:border-accent-primary focus:outline-none transition-colors"
                            placeholder="your@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-text-secondary">Message</label>
                        <textarea
                            rows="4"
                            className="w-full bg-bg-primary border border-white/10 rounded-lg p-3 focus:border-accent-primary focus:outline-none transition-colors"
                            placeholder="Hello..."
                        ></textarea>
                    </div>
                    <button className="w-full py-3 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-lg font-bold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                        Send Message <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Contact;
