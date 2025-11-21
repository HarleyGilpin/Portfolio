import React, { createContext, useContext, useState, useEffect } from 'react';

const BlogContext = createContext();

export const useBlog = () => useContext(BlogContext);

export const BlogProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(() => {
        return localStorage.getItem('isAdmin') === 'true';
    });

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

    const login = (password) => {
        if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
            setIsAdmin(true);
            localStorage.setItem('isAdmin', 'true');
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAdmin(false);
        localStorage.removeItem('isAdmin');
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
                    'x-admin-auth': import.meta.env.VITE_ADMIN_PASSWORD
                },
                body: JSON.stringify(newPost),
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
                    'x-admin-auth': import.meta.env.VITE_ADMIN_PASSWORD
                },
                body: JSON.stringify(updatedPost),
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
                headers: {
                    'x-admin-auth': import.meta.env.VITE_ADMIN_PASSWORD
                }
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
