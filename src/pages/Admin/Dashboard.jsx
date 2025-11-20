import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useBlog } from '../../context/BlogContext';
import { Plus, Edit, Trash2, LogOut } from 'lucide-react';
import SEO from '../../components/SEO';

import { toast } from 'sonner';

const Dashboard = () => {
    const { posts, addPost, updatePost, deletePost, logout } = useBlog();
    const [isEditing, setIsEditing] = useState(false);
    const [currentPost, setCurrentPost] = useState({ title: '', content: '', excerpt: '' });

    const handleSave = () => {
        if (!currentPost.title || !currentPost.content) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (currentPost.id) {
            updatePost(currentPost.id, currentPost);
            toast.success('Post updated successfully');
        } else {
            addPost(currentPost);
            toast.success('Post created successfully');
        }
        setIsEditing(false);
        setCurrentPost({ title: '', content: '', excerpt: '' });
    };

    const handleEdit = (post) => {
        setCurrentPost(post);
        setIsEditing(true);
    };

    const handleDelete = (id) => {
        toast('Are you sure you want to delete this post?', {
            action: {
                label: 'Delete',
                onClick: () => {
                    deletePost(id);
                    toast.success('Post deleted');
                }
            },
            cancel: {
                label: 'Cancel',
            },
        });
    };

    return (
        <div className="pt-4 pb-16 container mx-auto px-4">
            <SEO title="Admin Dashboard" description="Manage blog posts" />

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            setCurrentPost({ title: '', content: '', excerpt: '' });
                            setIsEditing(true);
                        }}
                        className="px-4 py-2 bg-accent-primary text-bg-primary rounded-lg font-bold flex items-center gap-2"
                    >
                        <Plus size={18} /> New Post
                    </button>
                    <button
                        onClick={logout}
                        className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/5 flex items-center gap-2"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>

            {isEditing ? (
                <div className="glass-panel p-6 space-y-6">
                    <h2 className="text-xl font-bold">{currentPost.id ? 'Edit Post' : 'New Post'}</h2>

                    <div>
                        <label className="block text-sm font-medium mb-2">Title</label>
                        <input
                            type="text"
                            value={currentPost.title}
                            onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                            className="w-full bg-bg-primary border border-white/10 rounded-lg p-3 focus:border-accent-primary focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Excerpt</label>
                        <textarea
                            value={currentPost.excerpt}
                            onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                            className="w-full bg-bg-primary border border-white/10 rounded-lg p-3 focus:border-accent-primary focus:outline-none"
                            rows="3"
                        />
                    </div>

                    <div className="bg-white text-black rounded-lg overflow-hidden h-[300px] mb-12">
                        <ReactQuill
                            theme="snow"
                            value={currentPost.content}
                            onChange={(content) => setCurrentPost({ ...currentPost, content })}
                            className="h-[250px]"
                            modules={{
                                toolbar: [
                                    [{ 'header': [1, 2, false] }],
                                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                                    ['link', 'image'],
                                    ['clean']
                                ],
                            }}
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-accent-primary text-bg-primary rounded-lg font-bold"
                        >
                            Save Post
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-2 border border-white/20 rounded-lg hover:bg-white/5"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map(post => (
                        <div key={post.id} className="glass-panel p-6 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold mb-1">{post.title}</h3>
                                <p className="text-text-secondary text-sm">{new Date(post.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(post)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-accent-primary"
                                >
                                    <Edit size={20} />
                                </button>
                                <button
                                    onClick={() => handleDelete(post.id)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-red-500"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {posts.length === 0 && (
                        <p className="text-text-secondary text-center py-12">No posts yet. Create one!</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
