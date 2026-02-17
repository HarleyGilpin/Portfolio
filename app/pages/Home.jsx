import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import SEO from '../components/SEO';
import ProfilePic from '../assets/profile-pic.webp';

const Home = () => {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20 pb-10">
            <SEO
                title="Future of Web Experiences"
                description="Harley Gilpin is an IT Auditor and Software Engineer specializing in building secure, futuristic, and high-performance web applications."
                keywords="IT Auditor, Software Engineer, Web Developer, React, Portfolio, Security, Frontend, Full Stack"
            />
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-primary/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-12 md:gap-8">
                    {/* Text Content */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                            Building the <span className="text-gradient">Future</span>
                            <br /> of Web Experiences
                        </h1>

                        <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto md:mx-0">
                            I'm Harley Gilpin, an IT Auditor and Software Engineer crafting futuristic digital solutions.
                        </p>

                        <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
                            <Link
                                to="/projects"
                                className="px-8 py-3 bg-accent-primary text-black font-bold rounded-full hover:bg-white transition-colors flex items-center justify-center gap-2"
                            >
                                View Projects <ArrowRight size={20} />
                            </Link>
                            <Link
                                to="/contact"
                                className="px-8 py-3 border border-border-color rounded-full hover:bg-border-color transition-colors"
                            >
                                Contact Me
                            </Link>
                        </div>
                    </div>

                    {/* Image Content */}
                    <div className="flex-1 flex justify-center md:justify-end relative">
                        {/* Glow behind image */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] md:w-[380px] md:h-[380px] bg-accent-secondary/30 rounded-full blur-[60px] -z-10" />

                        <div className="relative p-1 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary">
                            <div className="rounded-full overflow-hidden bg-bg-primary w-[250px] h-[250px] md:w-[350px] md:h-[350px] border-4 border-bg-primary">
                                <img
                                    src={ProfilePic}
                                    alt="Harley Gilpin"
                                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
