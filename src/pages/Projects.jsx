import React from 'react';
import { ExternalLink, Github } from 'lucide-react';

const Projects = () => {
    const projects = [
        {
            title: "2011Scape",
            description: "A RuneScape emulation project recreating the game as it was in 2011. Involves complex server-side logic and community management.",
            tags: ["Java", "Game Dev", "Community"],
            link: "#"
        },
        // Add more projects here
    ];

    return (
        <div className="pt-4 pb-16 container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-12"><span className="text-gradient">Featured Projects</span></h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {projects.map((project, index) => (
                    <div key={index} className="glass-panel p-6 hover:border-accent-primary/50 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-bold">{project.title}</h3>
                            <div className="flex gap-3">
                                <a href={project.link} className="text-text-secondary hover:text-white transition-colors">
                                    <Github size={20} />
                                </a>
                                <a href={project.link} className="text-text-secondary hover:text-white transition-colors">
                                    <ExternalLink size={20} />
                                </a>
                            </div>
                        </div>

                        <p className="text-text-secondary mb-6">{project.description}</p>

                        <div className="flex flex-wrap gap-2">
                            {project.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 text-xs rounded-full bg-white/5 text-accent-primary border border-accent-primary/20">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Projects;
