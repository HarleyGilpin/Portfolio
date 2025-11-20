import React, { createContext, useContext, useState, useEffect } from 'react';

const BlogContext = createContext();

export const useBlog = () => useContext(BlogContext);

export const BlogProvider = ({ children }) => {
    const [posts, setPosts] = useState(() => {
        const savedPosts = localStorage.getItem('blogPosts');
        return savedPosts ? JSON.parse(savedPosts) : [];
    });

    const [isAdmin, setIsAdmin] = useState(() => {
        return localStorage.getItem('isAdmin') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('blogPosts', JSON.stringify(posts));
    }, [posts]);

    useEffect(() => {
        localStorage.setItem('isAdmin', isAdmin);
    }, [isAdmin]);

    const login = (password) => {
        // Simple password for demo purposes
        if (password === 'admin123') {
            setIsAdmin(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAdmin(false);
    };

    const addPost = (post) => {
        const newPost = {
            ...post,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            slug: post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        };
        setPosts([newPost, ...posts]);
    };

    const updatePost = (id, updatedPost) => {
        setPosts(posts.map(post => post.id === id ? { ...post, ...updatedPost } : post));
    };

    const deletePost = (id) => {
        setPosts(posts.filter(post => post.id !== id));
    };

    const getPostBySlug = (slug) => {
        return posts.find(post => post.slug === slug);
    };

    return (
        <BlogContext.Provider value={{
            posts,
            isAdmin,
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
