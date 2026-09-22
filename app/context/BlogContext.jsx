import React, { createContext, useContext, useState, useEffect } from 'react';

const BlogContext = createContext();

export const useBlog = () => useContext(BlogContext);

export const BlogProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    // Initial Auth Check
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/me');
                if (response.ok) {
                    const data = await response.json();
                    setIsAdmin(!!data.authenticated);
                }
            } catch (err) {
                // Ignore initial auth check failure silently
            }
        };
        
        // Only run checkAuth on the client
        if (typeof window !== 'undefined') {
            checkAuth();
        }
    }, []);

    // Fetch posts from API
    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/posts');
            if (!response.ok) throw new Error('Failed to fetch posts');
            const data = await response.json();
            setPosts(data);
        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const getPostBySlug = (slug) => {
        return posts.find(post => post.slug === slug);
    };

    const login = async (password) => {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
                credentials: 'include' // Important: ensures the cookie is received and saved by the browser
            });

            const data = await response.json();

            if (response.ok) {
                setIsAdmin(true);
                return { success: true };
            }

            return { success: false, error: data.error || 'Login failed' };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error' };
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch {
            // Still clear local state even if server call fails
        }
        setIsAdmin(false);
    };

    const addPost = async (post) => {
        try {
            const newPost = {
                ...post,
                slug: post.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            };

            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPost),
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to create post');
            const savedPost = await response.json();
            setPosts([savedPost, ...posts]);
            return savedPost;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const updatePost = async (id, updatedPost) => {
        try {
            const response = await fetch(`/api/post?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedPost),
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to update post');
            const savedPost = await response.json();

            setPosts(posts.map(post => post.id === id ? savedPost : post));
            return savedPost;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const deletePost = async (id) => {
        try {
            const response = await fetch(`/api/post?id=${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to delete post');

            setPosts(posts.filter(post => post.id !== id));
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    return (
        <BlogContext.Provider value={{
            posts,
            isAdmin,
            loading,
            error,
            login,
            logout,
            addPost,
            updatePost,
            deletePost,
            getPostBySlug
        }}>
            {children}
        </BlogContext.Provider>
    );
};
