import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useBlog } from '../context/BlogContext';
import SEO from '../components/SEO';
import DOMPurify from 'dompurify';

const BlogPost = () => {
    const { slug } = useParams();
    const { getPostBySlug, loading } = useBlog();
    const post = getPostBySlug(slug);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!post) {
        return <Navigate to="/blog" replace />;
    }

    const sanitizedContent = DOMPurify.sanitize(post.content, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'div', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'img', 'span', 'hr', 'pre', 'code'],
        ALLOWED_ATTR: ['href', 'target', 'src', 'alt', 'class', 'className', 'style', 'width', 'height', 'data-list']
    });
    const [scrollProgress, setScrollProgress] = React.useState(0);

    React.useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scroll = `${totalScroll / windowHeight}`;
            setScrollProgress(Number(scroll));
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="pt-4 pb-16 container mx-auto px-4 relative">
            {/* Scroll Progress Bar */}
            <div
                className="fixed top-0 left-0 h-1 bg-accent-primary z-[60]"
                style={{ width: `${scrollProgress * 100}%` }}
            />

            <SEO
                title={post.title}
                description={post.excerpt}
                keywords={post.keywords}
                type="article"
            />

            <article className="max-w-3xl mx-auto">
                <header className="mb-8 text-center">
                    {post.category && (
                        <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-accent-primary uppercase bg-accent-primary/10 rounded-full">
                            {post.category}
                        </span>
                    )}
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
                    <p className="text-text-muted">
                        {new Date(post.created_at).toLocaleDateString()}
                    </p>
                </header>

                {post.image && (
                    <div className="mb-10 rounded-2xl overflow-hidden shadow-2xl">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-auto object-cover max-h-[500px]"
                        />
                    </div>
                )}

                <div
                    className="prose prose-invert prose-lg max-w-none glass-panel p-8 md:p-12"
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
            </article>
        </div>
    );
};

export default BlogPost;
