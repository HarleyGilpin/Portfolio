import React from 'react';
import { Link } from 'react-router';
import { useBlog } from '../context/BlogContext';
import SEO from '../components/SEO';
import { ArrowRight } from 'lucide-react';

const Blog = () => {
    const { posts } = useBlog();
    const [selectedCategory, setSelectedCategory] = React.useState('All');

    // Get unique categories
    const categories = ['All', ...new Set(posts.map(post => post.category).filter(Boolean))];

    const filteredPosts = selectedCategory === 'All'
        ? posts
        : posts.filter(post => post.category === selectedCategory);

    return (
        <div className="pt-4 pb-16 container mx-auto px-4">
            <SEO
                title="Blog"
                description="Thoughts and insights on software engineering, web development, and more."
            />

            <h1 className="text-4xl font-bold mb-12"><span className="text-gradient">Blog</span></h1>

            {/* Category Filter */}
            {categories.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-12 justify-center">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category
                                ? 'bg-accent-primary text-background'
                                : 'bg-card-bg border border-border-color hover:border-accent-primary/50'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            )}

            <div className="grid gap-8 max-w-4xl mx-auto">
                {filteredPosts.map(post => (
                    <article key={post.id} className="glass-panel p-8 hover:border-accent-primary/30 transition-colors">
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold mb-2">
                                <Link to={`/blog/${post.slug}`} className="hover:text-accent-primary transition-colors">
                                    {post.title}
                                </Link>
                            </h2>
                            <p className="text-sm text-text-muted mb-2">
                                {new Date(post.created_at).toLocaleDateString()}
                                {post.category && (
                                    <>
                                        <span className="mx-2">•</span>
                                        <span className="text-accent-primary font-medium">{post.category}</span>
                                    </>
                                )}
                            </p>
                        </div>

                        <p className="text-text-secondary mb-6 line-clamp-3">
                            {post.excerpt}
                        </p>

                        <Link
                            to={`/blog/${post.slug}`}
                            className="inline-flex items-center gap-2 text-accent-primary font-medium hover:gap-3 transition-all"
                        >
                            Read Article <ArrowRight size={16} />
                        </Link>
                    </article>
                ))}



                {filteredPosts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-text-secondary text-lg">No posts found. Check back later!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blog;
