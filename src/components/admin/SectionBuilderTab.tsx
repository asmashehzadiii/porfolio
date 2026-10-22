import React, { useState } from 'react';
import { DynamicSection, ContentBlock, SectionLayout, WebsiteData } from '../../types';
import {
  Layers,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Edit2,
  Check,
  X,
  Sliders,
  Sparkles,
  HelpCircle,
  CreditCard,
  Grid
} from 'lucide-react';

interface SectionBuilderTabProps {
  data: WebsiteData;
  onChange: (newData: WebsiteData) => void;
  token: string;
}

export const SectionBuilderTab: React.FC<SectionBuilderTabProps> = ({ data, onChange }) => {
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  const sections = data.dynamicSections || [];

  const updateSections = (newSections: DynamicSection[]) => {
    onChange({
      ...data,
      dynamicSections: newSections
    });
  };

  const handleAddNewSection = () => {
    const newId = `sec-${Date.now()}`;
    const newSection: DynamicSection = {
      id: newId,
      key: `custom-section-${Date.now()}`,
      title: 'New Custom Showcase Section',
      subtitle: 'Highlight your specialty or customized client project here.',
      badge: 'Special Feature',
      layoutType: 'cards',
      isEnabled: true,
      order: sections.length + 1,
      blocks: [
        {
          id: `blk-${Date.now()}-1`,
          type: 'card',
          badge: 'Feature 01',
          content: 'Cinematic Visual Pacing',
          subcontent: 'Engaging editing that retains viewers from the first second.'
        },
        {
          id: `blk-${Date.now()}-2`,
          type: 'card',
          badge: 'Feature 02',
          content: 'Sound Design & Mastering',
          subcontent: 'Immersive sound cues, risers, and licensed soundtracks.'
        }
      ]
    };

    updateSections([...sections, newSection]);
    setEditingSectionId(newId);
  };

  const handleDuplicateSection = (sec: DynamicSection) => {
    const clone: DynamicSection = {
      ...sec,
      id: `sec-${Date.now()}`,
      key: `${sec.key}-copy-${Math.floor(Math.random() * 1000)}`,
      title: `${sec.title} (Copy)`,
      order: sections.length + 1
    };
    updateSections([...sections, clone]);
  };

  const handleDeleteSection = (id: string) => {
    if (confirm('Are you sure you want to delete this dynamic section?')) {
      updateSections(sections.filter(s => s.id !== id));
      if (editingSectionId === id) setEditingSectionId(null);
    }
  };

  const toggleSectionEnabled = (id: string) => {
    updateSections(
      sections.map(s => (s.id === id ? { ...s, isEnabled: !s.isEnabled } : s))
    );
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;

    // Normalize order
    newSections.forEach((s, idx) => (s.order = idx + 1));
    updateSections(newSections);
  };

  const updateSectionField = (id: string, field: keyof DynamicSection, value: any) => {
    updateSections(
      sections.map(s => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  // Block handlers
  const addBlockToSection = (sectionId: string) => {
    const block: ContentBlock = {
      id: `blk-${Date.now()}`,
      type: 'card',
      content: 'New Item Heading',
      subcontent: 'Enter description or key highlights for this block.'
    };
    updateSections(
      sections.map(s => {
        if (s.id === sectionId) {
          return { ...s, blocks: [...(s.blocks || []), block] };
        }
        return s;
      })
    );
  };

  const updateBlock = (sectionId: string, blockId: string, field: keyof ContentBlock, value: any) => {
    updateSections(
      sections.map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            blocks: s.blocks.map(b => (b.id === blockId ? { ...b, [field]: value } : b))
          };
        }
        return s;
      })
    );
  };

  const removeBlock = (sectionId: string, blockId: string) => {
    updateSections(
      sections.map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            blocks: s.blocks.filter(b => b.id !== blockId)
          };
        }
        return s;
      })
    );
  };

  const editingSection = sections.find(s => s.id === editingSectionId);

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-white/10 bg-neutral-900/60">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            Dynamic Section Builder
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Create completely custom sections anytime — choose layouts, cards, before/after sliders, FAQs, and custom content blocks without writing code.
          </p>
        </div>

        <button
          onClick={handleAddNewSection}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shrink-0 self-start sm:self-auto transition-transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Section</span>
        </button>
      </div>

      {/* Sections List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left List of Sections */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">
            Website Sections ({sections.length})
          </h3>

          {sections.map((section, idx) => {
            const isEditing = section.id === editingSectionId;

            return (
              <div
                key={section.id}
                className={`p-4 rounded-xl border transition-all ${
                  isEditing
                    ? 'border-amber-400 bg-neutral-900 shadow-md ring-1 ring-amber-400/30'
                    : 'border-white/10 bg-neutral-950 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 uppercase">
                        {section.layoutType}
                      </span>
                      {!section.isEnabled && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400">
                          Hidden
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-neutral-200 mt-1 truncate">
                      {section.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveSection(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"
                      title="Move Up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveSection(idx, 'down')}
                      disabled={idx === sections.length - 1}
                      className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"
                      title="Move Down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleSectionEnabled(section.id)}
                      className="p-1 text-neutral-400 hover:text-amber-400"
                      title={section.isEnabled ? 'Hide Section' : 'Show Section'}
                    >
                      {section.isEnabled ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDuplicateSection(section)}
                      className="p-1 text-neutral-400 hover:text-white"
                      title="Duplicate Section"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingSectionId(isEditing ? null : section.id)}
                      className="p-1 text-amber-400 hover:text-amber-300"
                      title="Edit Section Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-1 text-neutral-500 hover:text-red-400"
                      title="Delete Section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Section Editor Panel */}
        <div className="lg:col-span-7">
          {editingSection ? (
            <div className="p-6 rounded-2xl border border-white/10 bg-neutral-900/80 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-amber-400" />
                  Editing Section: <span className="text-amber-400">{editingSection.title}</span>
                </h3>
                <button
                  onClick={() => setEditingSectionId(null)}
                  className="text-xs text-neutral-400 hover:text-white"
                >
                  Close Editor
                </button>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Section Title</label>
                  <input
                    type="text"
                    value={editingSection.title}
                    onChange={(e) => updateSectionField(editingSection.id, 'title', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-sm text-neutral-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={editingSection.badge || ''}
                    onChange={(e) => updateSectionField(editingSection.id, 'badge', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-sm text-neutral-100"
                    placeholder="e.g. Visual Craftsmanship"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Subtitle / Description</label>
                <input
                  type="text"
                  value={editingSection.subtitle}
                  onChange={(e) => updateSectionField(editingSection.id, 'subtitle', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-neutral-950 text-sm text-neutral-100"
                />
              </div>

              {/* Layout Picker */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2">Section Layout Style</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { id: 'cards', label: 'Feature Cards', icon: <Grid className="w-4 h-4" /> },
                      { id: 'before-after', label: 'Before & After Slider', icon: <Sliders className="w-4 h-4" /> },
                      { id: 'faq-accordion', label: 'FAQ Accordion', icon: <HelpCircle className="w-4 h-4" /> },
                      { id: 'pricing-table', label: 'Pricing Packages', icon: <CreditCard className="w-4 h-4" /> },
                      { id: 'stats-counter', label: 'Stats Counters', icon: <Sparkles className="w-4 h-4" /> },
                      { id: 'split-image-text', label: 'Split Image & Text', icon: <Layers className="w-4 h-4" /> },
                      { id: 'grid', label: 'Standard Grid', icon: <Grid className="w-4 h-4" /> },
                      { id: 'custom-blocks', label: 'Custom Blocks', icon: <Layers className="w-4 h-4" /> }
                    ] as const
                  ).map(layout => (
                    <button
                      key={layout.id}
                      type="button"
                      onClick={() => updateSectionField(editingSection.id, 'layoutType', layout.id)}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold flex flex-col gap-1.5 transition-all ${
                        editingSection.layoutType === layout.id
                          ? 'border-amber-400 bg-amber-500/15 text-amber-300'
                          : 'border-white/5 bg-neutral-950 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {layout.icon}
                      <span>{layout.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Before-and-After Config */}
              {editingSection.layoutType === 'before-after' && (
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Before & After Slider Configuration
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-neutral-300 mb-1">Before Image URL (Raw Footage)</label>
                      <input
                        type="text"
                        value={editingSection.customData?.beforeImage || ''}
                        onChange={(e) => {
                          const updated = {
                            ...(editingSection.customData || {}),
                            beforeImage: e.target.value
                          };
                          updateSectionField(editingSection.id, 'customData', updated);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-100"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-300 mb-1">After Image URL (Color Graded)</label>
                      <input
                        type="text"
                        value={editingSection.customData?.afterImage || ''}
                        onChange={(e) => {
                          const updated = {
                            ...(editingSection.customData || {}),
                            afterImage: e.target.value
                          };
                          updateSectionField(editingSection.id, 'customData', updated);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-950 text-xs text-neutral-100"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Content Blocks */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                    Content Blocks ({editingSection.blocks?.length || 0})
                  </h4>
                  <button
                    onClick={() => addBlockToSection(editingSection.id)}
                    className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 hover:bg-amber-500/30"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Block
                  </button>
                </div>

                <div className="space-y-3">
                  {editingSection.blocks && editingSection.blocks.map((block, bIdx) => (
                    <div
                      key={block.id}
                      className="p-4 rounded-xl border border-white/5 bg-neutral-950 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-400">
                          Block #{bIdx + 1}
                        </span>
                        <button
                          onClick={() => removeBlock(editingSection.id, block.id)}
                          className="text-neutral-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-neutral-400 mb-1">Headline / Question</label>
                          <input
                            type="text"
                            value={block.content}
                            onChange={(e) => updateBlock(editingSection.id, block.id, 'content', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-neutral-400 mb-1">Badge or Price</label>
                          <input
                            type="text"
                            value={block.badge || ''}
                            onChange={(e) => updateBlock(editingSection.id, block.id, 'badge', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-100"
                            placeholder="Phase 01 or $199"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-1">Description / Answer</label>
                        <textarea
                          rows={2}
                          value={block.subcontent || ''}
                          onChange={(e) => updateBlock(editingSection.id, block.id, 'subcontent', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-100"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl border border-dashed border-white/10 bg-neutral-900/30">
              <Layers className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
              <p className="text-sm text-neutral-400">
                Select a section from the left list to customize its layout and content blocks, or click <strong>Create New Section</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
