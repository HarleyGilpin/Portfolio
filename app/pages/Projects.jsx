import React from 'react';
import SEO from '../components/SEO';
import { ExternalLink, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import ProjectGeorgeWalcott from '../assets/project-georgewalcott.png';
import ProjectAllDirt from '../assets/project-alldirt.png';
import Project2011Scape from '../assets/project-2011scape.png';

const Projects = () => {
    const [filter, setFilter] = React.useState('All');

    const projects = [
        {
            title: "Training by George Walcott",
            description: "A premium fitness training platform for a PAC-10 Champion and 3x Jamaican Olympic Trials qualifier, featuring program enrollment, athlete showcase, and mobile-responsive design.",
            tags: ["React", "Next.js", "Fitness"],
            category: "Web Dev",
            link: "https://trainingbygeorgewalcott.com",
            image: ProjectGeorgeWalcott,
        },
        {
            title: "All Dirt, Inc.",
            description: "A professional excavation and septic services website for a Lane County contractor, featuring service pages, SEO optimization, and lead generation forms.",
            tags: ["React", "SEO", "Construction"],
            category: "Web Dev",
            link: "https://alldirtinc.com",
            image: ProjectAllDirt,
        },
        {
            title: "2011Scape",
            description: "A RuneScape emulation project recreating the game as it was in 2011. Involves complex server-side logic and community management.",
            tags: ["Java", "Game Dev", "Community"],
            category: "Game Dev",
            link: "https://2011.rs",
            image: Project2011Scape,
        },
        {
            title: "Portfolio Website",
            description: "A modern, futuristic portfolio website built with React and Vite, featuring a custom blog, admin dashboard, and cybersecurity-themed design.",
            tags: ["React", "Tailwind", "Vite"],
            category: "Web Dev",
            link: "https://github.com/HarleyGilpin/Portfolio"
        }
    ];

    const categories = ['All', 'Web Dev', 'Game Dev', 'Mobile App'];

    const filteredProjects = filter === 'All'
        ? projects
        : projects.filter(project => project.category === filter);

    return (
        <div className="pt-4 pb-16 container mx-auto px-4">
            <SEO
                title="My Projects"
                description="Explore my portfolio of web development and game development projects, including client websites and open source work."
                keywords="Portfolio, Projects, Web Development, React Projects, Open Source, Client Work"
            />
            <h1 className="text-4xl font-bold mb-8"><span className="text-gradient">Featured Projects</span></h1>

            {/* Filter Buttons */}
            <div className="flex gap-4 mb-12 overflow-x-auto pb-2">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setFilter(category)}
                        className={`px-4 py-2 rounded-full border transition-all whitespace-nowrap ${filter === category
                            ? 'bg-accent-primary text-bg-primary border-accent-primary font-bold'
                            : 'bg-transparent border-white/10 text-text-secondary hover:border-accent-primary/50 hover:text-text-primary'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredProjects.map((project, index) => (
                    <motion.a
                        key={index}
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className="glass-panel overflow-hidden hover:border-accent-primary/50 transition-colors group block"
                    >
                        {/* Website preview if available */}
                        {project.image && (
                            <div className="relative overflow-hidden">
                                <div className="bg-bg-tertiary px-4 py-2 flex items-center gap-2 border-b border-border-color">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                                    </div>
                                    <span className="text-[10px] text-text-muted ml-2 truncate">{project.link}</span>
                                </div>
                                <div className="aspect-[16/10] overflow-hidden">
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-2xl font-bold">{project.title}</h3>
                                <div className="flex gap-3 flex-shrink-0 ml-3">
                                    {project.link.includes('github.com') && (
                                        <Github size={20} className="text-text-secondary group-hover:text-text-primary transition-colors" />
                                    )}
                                    <ExternalLink size={20} className="text-text-secondary group-hover:text-accent-primary transition-colors" />
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
                    </motion.a>
                ))}
            </div>

            {filteredProjects.length === 0 && (
                <div className="text-center py-12 text-text-secondary">
                    No projects found in this category.
                </div>
            )}
        </div>
    );
};

export default Projects;
