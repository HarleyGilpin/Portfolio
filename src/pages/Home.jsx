import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-primary/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10 text-center">
                <h1 className="text-5xl md:text-7xl font-bold mb-6">
                    Building the <span className="text-gradient">Future</span>
                    <br /> of Web Experiences
                </h1>

                <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
                    I'm Harley Gilpin, an IT Auditor and Software Engineer crafting futuristic digital solutions.
                </p>

                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <Link
                        to="/projects"
                        className="px-8 py-3 bg-accent-primary text-bg-primary font-bold rounded-full hover:bg-white transition-colors flex items-center justify-center gap-2"
                    >
                        View Projects <ArrowRight size={20} />
                    </Link>
                    <Link
                        to="/contact"
                        className="px-8 py-3 border border-white/20 rounded-full hover:bg-white/5 transition-colors"
                    >
                        Contact Me
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
