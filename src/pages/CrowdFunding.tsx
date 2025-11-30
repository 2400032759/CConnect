import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type CrowdfundPost = {
  id: string;
  title: string;
  description: string;
  photo?: string;
  authorId?: string;
  authorName?: string;
  createdAt: string;
};

export default function CrowdFunding() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CrowdfundPost[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState('');

  const STORAGE_KEY = 'civic_connect_crowdfunds';
  const buttonContainers = useRef<Record<string, HTMLDivElement | null>>({});
  const renderedButtons = useRef<Set<string>>(new Set());

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    setPosts(stored);
  }, []);

  const savePosts = (updated: CrowdfundPost[]) => {
    setPosts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please provide title and description');
      return;
    }
    const post: CrowdfundPost = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      photo: photo.trim() || undefined,
      authorId: user?.id,
      authorName: user?.name,
      createdAt: new Date().toISOString(),
    };
    const updated = [post, ...posts];
    savePosts(updated);
    setTitle('');
    setDescription('');
    setPhoto('');
    toast.success('Crowdfund post created');
  };

  const handleDelete = (id: string) => {
    const updated = posts.filter(p => p.id !== id);
    savePosts(updated);
    toast.success('Post removed');
  };

  // Render Razorpay payment button by injecting script into each post container.
  useEffect(() => {
    const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/payment-button.js';
    const PAYMENT_BUTTON_ID = 'pl_RlhJQAcRl3jEt4'; // same id used for all posts (create separate ids for per-post buttons)

    posts.forEach(post => {
      if (renderedButtons.current.has(post.id)) return;
      const container = buttonContainers.current[post.id];
      if (!container) return;

      // create form + script so the external script runs and renders the button
      const form = document.createElement('form');
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.setAttribute('data-payment_button_id', PAYMENT_BUTTON_ID);
      script.async = true;
      form.appendChild(script);
      container.appendChild(form);

      renderedButtons.current.add(post.id);
    });

    // cleanup on unmount: remove injected forms
    return () => {
      Object.values(buttonContainers.current).forEach(el => {
        if (!el) return;
        while (el.firstChild) el.removeChild(el.firstChild);
      });
      renderedButtons.current.clear();
    };
  }, [posts]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Crowd Funding</h1>
        <p className="text-gray-600">Post problems to crowdfund support. Politicians and citizens can create posts and supporters can pay using Razorpay.</p>
      </div>

      {user ? (
        <form onSubmit={handleCreate} className="space-y-4 bg-white p-6 rounded-md shadow">
          <h2 className="text-lg font-medium">Create a Crowdfund Post</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
              placeholder="Short title of the problem"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
              rows={4}
              placeholder="Describe the issue and funding needs"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Photo URL (optional)</label>
            <input
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
              placeholder="Link to an image (jpg/png) illustrating the issue"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Post</button>
            <span className="text-sm text-gray-500">You can remove your post later.</span>
          </div>
        </form>
      ) : (
        <div className="bg-yellow-50 p-4 rounded">Please log in to create a crowdfund post.</div>
      )}

      <div className="space-y-4">
        {posts.length === 0 && <p className="text-gray-500">No crowdfund posts yet.</p>}
        {posts.map(post => (
          <div key={post.id} className="bg-white p-6 rounded shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{post.title}</h3>
                <p className="text-sm text-gray-600">by {post.authorName ?? 'Anonymous'} • {new Date(post.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center space-x-2">
                {user?.id === post.authorId && (
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            {post.photo && (
              <div className="mt-4">
                <img src={post.photo} alt={post.title} className="max-h-48 w-full object-cover rounded-md border" />
              </div>
            )}

            <p className="mt-3 text-gray-700 whitespace-pre-wrap">{post.description}</p>

            <div className="mt-4">
              {/* Container where we inject the Razorpay form+script so the button is rendered and clickable */}
              <div ref={el => (buttonContainers.current[post.id] = el)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}