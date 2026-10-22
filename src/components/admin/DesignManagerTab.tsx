import React, { useState } from 'react';
import { WebsiteData, DesignItem, PublishStatus } from '../../types';
import {
  Palette,
  Plus,
  Upload,
  Trash2,
  Edit2,
  Copy,
  MoveUp,
  MoveDown,
  Tag,
  FolderPlus,
  Maximize2
} from 'lucide-react';
import { uploadMediaFile, updateWebsiteData } from '../../services/api';

interface DesignManagerTabProps {
  data: WebsiteData;
  onChange: (newData: WebsiteData) => void;
  token: string;
}

export const DesignManagerTab: React.FC<DesignManagerTabProps> = ({ data, onChange, token }) => {
  const [editingItem, setEditingItem] = useState<DesignItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [showHeadingsEditor, setShowHeadingsEditor] = useState<boolean>(false);

  const designs = data.designs || [];
  const categories = data.designCategories || ['All', 'Thumbnails', 'Brand Identity & Logos', 'Posters & Banners'];
  const designHeadings = data.sectionHeadings?.designs || {};

  const updateDesignHeadings = (field: string, value: string) => {
    onChange({
      ...data,
      sectionHeadings: {
        ...data.sectionHeadings,
        designs: {
          ...(data.sectionHeadings?.designs || {}),
          [field]: value
        }
      }
    });
  };

  const updateDesigns = async (newDesigns: DesignItem[]) => {
    const updatedData = {
      ...data,
      designs: newDesigns
    };
    onChange(updatedData);
    if (token) {
      try {
        await updateWebsiteData(token, updatedData);
      } catch (e) {
        console.warn('Auto-save design error:', e);
      }
    }
  };

  const handleStartNew = () => {
    const item: DesignItem = {
      id: `des-${Date.now()}`,
      title: 'New Graphic Design Artwork',
      description: 'High CTR composition, custom typography, and 3D visual assets.',
      category: categories[1] || 'Thumbnails',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
      clientName: '',
      featured: true,
      order: designs.length + 1,
      status: 'published',
      tags: ['Design', 'Photoshop'],
      createdAt: new Date().toISOString()
    };
    setEditingItem(item);
    setIsCreating(true);
  };

  const handleSave = (itemToSave: DesignItem) => {
    if (isCreating) {
      updateDesigns([itemToSave, ...designs]);
    } else {
      updateDesigns(designs.map(d => (d.id === itemToSave.id ? itemToSave : d)));
    }
    setEditingItem(null);
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this design artwork?')) {
      updateDesigns(designs.filter(d => d.id !== id));
      if (editingItem?.id === id) setEditingItem(null);
    }
  };

  const handleDuplicate = (item: DesignItem) => {
    const clone: DesignItem = {
      ...item,
      id: `des-${Date.now()}`,
      title: `${item.title} (Copy)`,
      order: designs.length + 1
    };
    updateDesigns([clone, ...designs]);
  };

  const moveDesign = (index: number, direction: 'up' | 'down') => {
    const list = [...designs];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    list.forEach((d, idx) => (d.order = idx + 1));
    updateDesigns(list);
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const cat = newCatName.trim();
    if (!categories.includes(cat)) {
      onChange({
        ...data,
        designCategories: [...categories, cat]
      });
    }
    setNewCatName('');
  };

  const handleDeleteCategory = (cat: string) => {
    if (cat === 'All') return;
    if (confirm(`Delete category "${cat}"? Designs in this category won't be deleted.`)) {
      onChange({
        ...data,
        designCategories: categories.filter(c => c !== cat)
      });
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;

    setUploadingImage(true);
    try {
      const res = await uploadMediaFile(token, file);
      const updatedItem = {
        ...editingItem,
        imageUrl: res.url
      };
      setEditingItem(updatedItem);

      if (!isCreating) {
        const updatedList = designs.map(d => (d.id === updatedItem.id ? updatedItem : d));
        await updateDesigns(updatedList);
      }
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleQuickDesignUpload = async (e: React.ChangeEvent<HTMLInputElement>, item: DesignItem) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadMediaFile(token, file);
      const updated = { ...item, imageUrl: res.url };
      const updatedList = designs.map(d => (d.id === updated.id ? updated : d));
      await updateDesigns(updatedList);
    } catch (err: any) {
      alert('Image upload failed: ' + err.message);
    } finally {
      e.target.value = '';
    }
  };

  const filteredDesigns = filterCategory === 'All'
    ? designs
    : designs.filter(d => d.category === filterCategory);

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-white/10 bg-neutral-900/60">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-400" />
            Graphic Design Portfolio Manager
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Upload thumbnails, mockups, posters, brand identity logos, and social media posts directly from your computer.
          </p>
        </div>

        <button
          onClick={handleStartNew}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shrink-0 transition-transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add Graphic Artwork</span>
        </button>
      </div>

      {/* Graphic Design Section Headings Editor */}
      <div className="p-4 rounded-2xl border border-white/10 bg-neutral-900/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-neutral-100">Graphic Design Section Titles & Headings</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">Editable</span>
          </div>
          <button
            type="button"
            onClick={() => setShowHeadingsEditor(!showHeadingsEditor)}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            {showHeadingsEditor ? 'Hide Titles ▲' : 'Edit Section Titles ▼'}
          </button>
        </div>

        {showHeadingsEditor && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-white/10 animate-in fade-in">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">Section Main Title</label>
              <input
                type="text"
                value={designHeadings.title ?? 'Graphic Design Showcase'}
                onChange={(e) => updateDesignHeadings('title', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-white/15 bg-neutral-950 text-neutral-100 text-xs focus:border-amber-400 focus:outline-none"
                placeholder="Graphic Design Showcase"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">Section Badge Pill</label>
              <input
                type="text"
                value={designHeadings.badge ?? 'Visual Branding & Graphic Design'}
                onChange={(e) => updateDesignHeadings('badge', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-white/15 bg-neutral-950 text-neutral-100 text-xs focus:border-amber-400 focus:outline-none"
                placeholder="Visual Branding & Graphic Design"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">Section Subtitle / Description</label>
              <input
                type="text"
                value={designHeadings.subtitle ?? 'High CTR YouTube thumbnails, logo brand systems, social media banners, and promotional print assets.'}
                onChange={(e) => updateDesignHeadings('subtitle', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-white/15 bg-neutral-950 text-neutral-100 text-xs focus:border-amber-400 focus:outline-none"
                placeholder="High CTR YouTube thumbnails..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Category Pills & Add Category */}
      <div className="p-4 rounded-xl border border-white/10 bg-neutral-900/40 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <div key={cat} className="flex items-center group">
                <button
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    filterCategory === cat
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'bg-neutral-950 text-neutral-400 hover:text-white border border-white/5'
                  }`}
                >
                  {cat}
                </button>
                {cat !== 'All' && (
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 px-1 transition-opacity text-xs"
                    title={`Delete category ${cat}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="New category..."
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={handleAddCategory}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-xs flex items-center gap-1"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Designs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDesigns.map((item, idx) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl border border-white/10 bg-neutral-950/80 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 mb-3 border border-white/5">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30">
                  {item.category}
                </span>
                <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-semibold ${
                  item.status === 'published' ? 'bg-emerald-500/80 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {item.status}
                </span>
              </div>

              <h4 className="text-sm font-bold text-neutral-100 line-clamp-1">{item.title}</h4>
              <p className="text-xs text-neutral-400 line-clamp-2 mt-1">{item.description}</p>
            </div>

            <div className="pt-4 border-t border-white/5 mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveDesign(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 text-neutral-400 hover:text-white disabled:opacity-20"
                >
                  <MoveUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => moveDesign(idx, 'down')}
                  disabled={idx === designs.length - 1}
                  className="p-1 text-neutral-400 hover:text-white disabled:opacity-20"
                >
                  <MoveDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDuplicate(item)}
                  className="p-1.5 text-neutral-400 hover:text-white"
                  title="Duplicate Artwork"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingItem({ ...item });
                    setIsCreating(false);
                  }}
                  className="p-1.5 text-amber-400 hover:text-amber-300"
                  title="Edit Details"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-neutral-500 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Design Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl bg-neutral-950 border border-white/10 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-neutral-900/80">
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-400" />
                <span>{isCreating ? 'Add Graphic Artwork' : 'Edit Design Item'}</span>
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Artwork Title *</label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-neutral-900 text-sm text-neutral-100 focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Image Upload */}
              <div className="p-4 rounded-xl border border-white/10 bg-neutral-900/40 space-y-3">
                <label className="block text-xs font-semibold text-neutral-300">Design Image</label>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-950 border border-white/5">
                  <img
                    src={editingItem.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingItem.imageUrl}
                    onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-200"
                    placeholder="Image URL..."
                  />
                  <label className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUploadImage}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-neutral-900 text-xs text-neutral-100"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Client Name</label>
                  <input
                    type="text"
                    value={editingItem.clientName || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, clientName: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-neutral-900 text-xs text-neutral-100"
                    placeholder="e.g. Nike, TechVibe..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-900 text-xs text-neutral-100 resize-none"
                />
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/60 border border-white/5">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-neutral-300">Publishing Status:</label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as PublishStatus })}
                    className="px-2.5 py-1 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-100"
                  >
                    <option value="published">Published (Live)</option>
                    <option value="draft">Draft</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.featured}
                    onChange={(e) => setEditingItem({ ...editingItem, featured: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span>Featured</span>
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3 bg-neutral-900/80">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSave(editingItem)}
                className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md"
              >
                Save Graphic Artwork
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
