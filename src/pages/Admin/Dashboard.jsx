import React, { useState } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import BlotFormatter from 'quill-blot-formatter/dist/BlotFormatter';
import { useBlog } from '../../context/BlogContext';
import { Plus, Edit, Trash2, LogOut } from 'lucide-react';
import SEO from '../../components/SEO';
import { upload } from '@vercel/blob/client';
import { toast } from 'sonner';

Quill.register('modules/blotFormatter', BlotFormatter);

const Dashboard = () => {
    const { posts, addPost, updatePost, deletePost, logout, adminToken } = useBlog();
    const [isEditing, setIsEditing] = useState(false);
    const [currentPost, setCurrentPost] = useState({ title: '', content: '', excerpt: '', image: '', category: '', keywords: '' });
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (file) => {
        setIsUploading(true);
        const toastId = toast.loading('Uploading image...');
        try {
            const newBlob = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: `/api/upload?auth=${encodeURIComponent(adminToken)}`,
            });
            console.log('Client-side upload success:', newBlob);
            toast.success('Image uploaded successfully', { id: toastId });
            return newBlob.url;
        } catch (error) {
            console.error('Client-side upload error:', error);
            toast.error('Failed to upload image', { id: toastId });
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const handleFeaturedImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Reuse the existing upload logic but set the specific state
        const url = await handleImageUpload(file);
        if (url) {
            setCurrentPost(prev => ({ ...prev, image: url }));
        }
    };

    const handleSave = async () => {
        if (!currentPost.title || !currentPost.content) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            const postToSave = {
                ...currentPost,
                image: currentPost.image || null // Ensure image is not undefined
            };

            if (currentPost.id) {
                await updatePost(currentPost.id, postToSave);
                toast.success('Post updated successfully');
            } else {
                await addPost(postToSave);
                toast.success('Post created successfully');
            }
            setIsEditing(false);
            setCurrentPost({ title: '', content: '', excerpt: '', image: '', category: '', keywords: '' });
        } catch (error) {
            console.error(error);
            toast.error('Failed to save post');
        }
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

    const modules = React.useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: function () {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'image/*');
                    input.click();

                    input.onchange = async () => {
                        const file = input.files[0];
                        if (file) {
                            const url = await handleImageUpload(file);
                            if (url) {
                                const quill = this.quill;
                                const range = quill.getSelection();
                                quill.insertEmbed(range.index, 'image', url);
                            }
                        }
                    };
                }
            }
        },
        blotFormatter: {}
    }), []);

    return (
        <div className="pt-4 pb-16 container mx-auto px-4">
            <SEO title="Admin Dashboard" description="Manage blog posts" />

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            setCurrentPost({ title: '', content: '', excerpt: '', image: '', category: '', keywords: '' });
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Featured Image */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Featured Image</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Image URL"
                                    value={currentPost.image || ''}
                                    onChange={(e) => setCurrentPost({ ...currentPost, image: e.target.value })}
                                    className="flex-1 bg-bg-primary border border-white/10 rounded-lg p-3 focus:border-accent-primary focus:outline-none"
                                />
                                <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 flex items-center justify-center transition-colors">
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFeaturedImageUpload} />
                                    Upload
                                </label>
                            </div>
                            {currentPost.image && (
                                <div className="mt-2 relative h-32 w-full rounded-lg overflow-hidden border border-white/10">
                                    <img src={currentPost.image} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setCurrentPost({ ...currentPost, image: '' })}
                                        className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Category & Keywords */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Category (e.g. Engineering, Design)</label>
                                <input
                                    type="text"
                                    value={currentPost.category || ''}
                                    onChange={(e) => setCurrentPost({ ...currentPost, category: e.target.value })}
                                    className="w-full bg-bg-primary border border-white/10 rounded-lg p-3 focus:border-accent-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Keywords (comma separated)</label>
                                <input
                                    type="text"
                                    placeholder="react, tutorial, web dev"
                                    value={currentPost.keywords || ''}
                                    onChange={(e) => setCurrentPost({ ...currentPost, keywords: e.target.value })}
                                    className="w-full bg-bg-primary border border-white/10 rounded-lg p-3 focus:border-accent-primary focus:outline-none"
                                />
                            </div>
                        </div>
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

                    <div className="bg-white text-black rounded-lg overflow-hidden h-[300px] mb-12 relative">
                        <ReactQuill
                            theme="snow"
                            value={currentPost.content}
                            onChange={(content) => setCurrentPost({ ...currentPost, content })}
                            className="h-[250px]"
                            modules={modules}
                        />
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                <div className="bg-bg-primary px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-accent-primary border-t-transparent"></div>
                                    <span className="text-sm font-medium">Uploading image...</span>
                                </div>
                            </div>
                        )}
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
                                <p className="text-text-secondary text-sm">{new Date(post.created_at).toLocaleDateString()}</p>
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
