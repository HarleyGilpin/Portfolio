import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useBlog } from '../context/BlogContext';
import SEO from '../components/SEO';
import DOMPurify from 'dompurify';

const BlogPost = () => {
    const { slug } = useParams();
    const { getPostBySlug } = useBlog();
    const post = getPostBySlug(slug);

    if (!post) {
        return <Navigate to="/blog" replace />;
    }

    const sanitizedContent = DOMPurify.sanitize(post.content);

    return (
        <div className="pt-24 pb-16 container mx-auto px-4">
            <SEO
                title={post.title}
                description={post.excerpt}
                type="article"
            />

            <article className="max-w-3xl mx-auto">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
                    <p className="text-text-muted">
                        {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                </header>

                <div
                    className="prose prose-invert prose-lg max-w-none glass-panel p-8 md:p-12"
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
            </article>
        </div>
    );
};

export default BlogPost;
