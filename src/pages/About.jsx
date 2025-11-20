import React from 'react';

const About = () => {
    return (
        <div className="pt-24 pb-16 container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-8"><span className="text-gradient">About Me</span></h1>
            <div className="glass-panel p-8 max-w-3xl">
                <p className="text-lg text-text-secondary mb-6">
                    My name is Harley Gilpin. I am currently employed at Armanino as an IT Auditor.
                    Beyond my corporate role, I am a passionate freelance software engineer and web developer.
                </p>
                <p className="text-lg text-text-secondary">
                    I love diving into complex problems and building solutions that matter.
                    In my free time, I work on several hobby projects, including 2011Scape, a RuneScape emulation project that keeps the nostalgia alive.
                </p>
            </div>
        </div>
    );
};

export default About;
