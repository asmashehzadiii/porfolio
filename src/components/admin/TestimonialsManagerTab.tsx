import React, { useState } from 'react';
import { WebsiteData, TestimonialItem } from '../../types';
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Star,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Upload
} from 'lucide-react';
import { uploadMediaFile } from '../../services/api';

interface TestimonialsManagerTabProps {
  data: WebsiteData;
  onChange: (newData: WebsiteData) => void;
  token: string;
}

export const TestimonialsManagerTab: React.FC<TestimonialsManagerTabProps> = ({ data, onChange, token }) => {
  const [editingItem, setEditingItem] = useState<TestimonialItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const testimonials = data.testimonials || [];

  const updateTestimonials = (newList: TestimonialItem[]) => {
    onChange({
      ...data,
      testimonials: newList
    });
  };

  const handleStartNew = () => {
    const item: TestimonialItem = {
      id: `test-${Date.now()}`,
      clientName: 'New Client',
      clientRole: 'Creator / Founder',
      clientCompany: 'Brand Media',
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      reviewText: 'Working with Asma transformed our video content retention and audience growth!',
      projectType: 'Short-Form Reels Editing',
      order: testimonials.length + 1,
      isPublished: true,
      featured: true
    };
    setEditingItem(item);
    setIsCreating(true);
  };

  const handleSave = (itemToSave: TestimonialItem) => {
    if (isCreating) {
      updateTestimonials([...testimonials, itemToSave]);
    } else {
      updateTestimonials(testimonials.map(t => (t.id === itemToSave.id ? itemToSave : t)));
    }
    setEditingItem(null);
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this client testimonial?')) {
      updateTestimonials(testimonials.filter(t => t.id !== id));
      if (editingItem?.id === id) setEditingItem(null);
    }
  };

  const togglePublish = (id: string) => {
    updateTestimonials(
      testimonials.map(t => (t.id === id ? { ...t, isPublished: !t.isPublished } : t))
    );
  };

  const moveTestimonial = (index: number, direction: 'up' | 'down') => {
    const list = [...testimonials];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    list.forEach((t, idx) => (t.order = idx + 1));
    updateTestimonials(list);
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;

    setUploadingAvatar(true);
    try {
      const res = await uploadMediaFile(token, file);
      setEditingItem({
        ...editingItem,
        clientAvatar: res.url
      });
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-white/10 bg-neutral-900/60">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            Client Reviews & Testimonials
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Manage reviews displayed in the horizontal infinite slider on the public website.
          </p>
        </div>

        <button
          onClick={handleStartNew}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client Review</span>
        </button>
      </div>

      {/* Testimonials List */}
      <div className="space-y-3">
        {testimonials.map((item, idx) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl border border-white/10 bg-neutral-950/80 hover:border-amber-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.clientAvatar}
                alt={item.clientName}
                className="w-12 h-12 rounded-full object-cover border-2 border-amber-400/40 shrink-0"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-neutral-100">{item.clientName}</h4>
                  <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                  {!item.isPublished && (
                    <span className="text-[10px] font-semibold px-1.5 rounded bg-neutral-800 text-neutral-400">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400">
                  {item.clientRole} • {item.clientCompany}
                </p>
                <p className="text-xs text-neutral-300 italic line-clamp-1 mt-1">
                  "{item.reviewText}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end md:self-auto">
              <button
                onClick={() => moveTestimonial(idx, 'up')}
                disabled={idx === 0}
                className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-20"
              >
                <MoveUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => moveTestimonial(idx, 'down')}
                disabled={idx === testimonials.length - 1}
                className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-20"
              >
                <MoveDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => togglePublish(item.id)}
                className="p-1.5 text-neutral-400 hover:text-white"
                title={item.isPublished ? 'Hide from slider' : 'Show in slider'}
              >
                {item.isPublished ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setEditingItem({ ...item });
                  setIsCreating(false);
                }}
                className="p-1.5 text-amber-400 hover:text-amber-300"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 text-neutral-500 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Testimonial Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg p-6 rounded-3xl bg-neutral-950 border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-neutral-100">
              {isCreating ? 'Add Client Review' : 'Edit Testimonial'}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-neutral-300 mb-1">Client Name *</label>
                <input
                  type="text"
                  required
                  value={editingItem.clientName}
                  onChange={(e) => setEditingItem({ ...editingItem, clientName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-100"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-300 mb-1">Star Rating (1 - 5)</label>
                <select
                  value={editingItem.rating}
                  onChange={(e) => setEditingItem({ ...editingItem, rating: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-100"
                >
                  <option value={5}>★★★★★ (5 Stars)</option>
                  <option value={4}>★★★★☆ (4 Stars)</option>
                  <option value={3}>★★★☆☆ (3 Stars)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-neutral-300 mb-1">Client Role</label>
                <input
                  type="text"
                  value={editingItem.clientRole}
                  onChange={(e) => setEditingItem({ ...editingItem, clientRole: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-100"
                  placeholder="e.g. Founder & Creator"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-300 mb-1">Company / Channel</label>
                <input
                  type="text"
                  value={editingItem.clientCompany}
                  onChange={(e) => setEditingItem({ ...editingItem, clientCompany: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-100"
                  placeholder="e.g. Media Brand"
                />
              </div>
            </div>

            {/* Avatar upload */}
            <div>
              <label className="block text-xs text-neutral-300 mb-1">Client Photo / Avatar</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingItem.clientAvatar}
                  onChange={(e) => setEditingItem({ ...editingItem, clientAvatar: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-100"
                  placeholder="Photo URL..."
                />
                <label className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer flex items-center gap-1 shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingAvatar ? 'Uploading...' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadAvatar}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs text-neutral-300 mb-1">Review Text</label>
              <textarea
                rows={3}
                value={editingItem.reviewText}
                onChange={(e) => setEditingItem({ ...editingItem, reviewText: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-100"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900 border border-white/5">
              <label className="flex items-center gap-2 text-xs text-neutral-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingItem.isPublished}
                  onChange={(e) => setEditingItem({ ...editingItem, isPublished: e.target.checked })}
                  className="rounded text-amber-500"
                />
                <span>Publish in Website Slider</span>
              </label>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-lg border border-white/10 text-xs text-neutral-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(editingItem)}
                className="px-5 py-2 rounded-lg bg-amber-500 text-neutral-950 font-bold text-xs"
              >
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
