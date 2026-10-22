import React, { useState } from 'react';
import { DynamicSection, ContentBlock } from '../types';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { ChevronDown, ArrowRight, CheckCircle2, Play, ExternalLink } from 'lucide-react';

interface DynamicSectionRendererProps {
  section: DynamicSection;
  onOpenVideo?: (videoUrl: string, title: string) => void;
}

export const DynamicSectionRenderer: React.FC<DynamicSectionRendererProps> = ({ section, onOpenVideo }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (!section.isEnabled) return null;

  const bgStyle = section.backgroundColor ? { backgroundColor: section.backgroundColor } : {};
  const textStyle = section.textColor ? { color: section.textColor } : {};

  return (
    <section
      id={section.key}
      style={{ ...bgStyle, ...textStyle }}
      className="py-16 md:py-24 px-4 md:px-8 border-b border-white/5 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          {section.badge && (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-3 bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {section.badge}
            </span>
          )}
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="text-base md:text-lg opacity-75 leading-relaxed">
              {section.subtitle}
            </p>
          )}
        </div>

        {/* Layout Renderer */}
        {section.layoutType === 'before-after' && (
          <div className="max-w-4xl mx-auto">
            <BeforeAfterSlider
              beforeImage={section.customData?.beforeImage || 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80'}
              afterImage={section.customData?.afterImage || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80'}
              beforeLabel={section.customData?.beforeLabel || 'Raw Camera Footage'}
              afterLabel={section.customData?.afterLabel || 'Color Graded Cut'}
            />
            {section.blocks && section.blocks.length > 0 && (
              <div className="mt-8 text-center max-w-2xl mx-auto text-sm opacity-80 leading-relaxed">
                {section.blocks.map(b => (
                  <p key={b.id}>{b.content}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {section.layoutType === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {section.blocks.map((block) => (
              <div
                key={block.id}
                className="p-6 rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-sm hover:border-amber-500/30 transition-all hover:-translate-y-1 group"
              >
                {block.badge && (
                  <span className="inline-block text-xs font-bold text-amber-400 mb-3 tracking-wider">
                    {block.badge}
                  </span>
                )}
                {block.imageUrl && (
                  <img
                    src={block.imageUrl}
                    alt={block.content}
                    className="w-full h-40 object-cover rounded-xl mb-4"
                  />
                )}
                <h3 className="text-lg font-bold text-neutral-100 mb-2 group-hover:text-amber-400 transition-colors">
                  {block.content}
                </h3>
                {block.subcontent && (
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {block.subcontent}
                  </p>
                )}
                {block.linkUrl && (
                  <a
                    href={block.linkUrl}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 mt-4 group-hover:translate-x-1 transition-transform"
                  >
                    Learn More <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {section.layoutType === 'split-image-text' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {section.blocks.map((block) => {
              if (block.type === 'image' || block.imageUrl) {
                return (
                  <div key={block.id} className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    <img
                      src={block.imageUrl || block.content}
                      alt={section.title}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                );
              }
              return (
                <div key={block.id} className="space-y-4">
                  <h3 className="text-2xl md:text-3xl font-bold">{block.content}</h3>
                  {block.subcontent && (
                    <p className="text-base opacity-80 leading-relaxed">{block.subcontent}</p>
                  )}
                  {block.linkUrl && (
                    <a
                      href={block.linkUrl}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition-transform hover:scale-105"
                    >
                      Explore Project <ArrowRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {section.layoutType === 'faq-accordion' && (
          <div className="max-w-3xl mx-auto space-y-3">
            {section.blocks.map((block, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={block.id}
                  className="rounded-xl border border-white/10 bg-neutral-900/60 overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-neutral-100 hover:text-amber-400 transition-colors"
                  >
                    <span className="text-base md:text-lg">{block.content}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-neutral-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-amber-400' : ''}`}
                    />
                  </button>
                  {isOpen && block.subcontent && (
                    <div className="px-6 pb-5 pt-1 text-sm md:text-base text-neutral-300 leading-relaxed border-t border-white/5 animate-in fade-in">
                      {block.subcontent}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {section.layoutType === 'pricing-table' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {section.blocks.map((block) => (
              <div
                key={block.id}
                className="p-8 rounded-2xl border border-white/10 bg-neutral-900/80 backdrop-blur-md flex flex-col justify-between hover:border-amber-500/50 transition-all hover:-translate-y-1 shadow-xl relative"
              >
                {block.badge && (
                  <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-amber-500 text-neutral-950 text-xs font-bold shadow-md">
                    {block.badge}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold mb-2">{block.content}</h3>
                  {block.subcontent && (
                    <div className="text-3xl font-extrabold text-amber-400 mb-6">
                      {block.subcontent}
                    </div>
                  )}
                </div>
                {block.linkUrl && (
                  <a
                    href={block.linkUrl}
                    className="mt-6 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-center transition-all"
                  >
                    Select Plan
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {section.layoutType === 'stats-counter' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {section.blocks.map((block) => (
              <div key={block.id} className="p-6 rounded-2xl border border-white/10 bg-neutral-900/60">
                <div className="text-3xl md:text-5xl font-extrabold text-amber-400 mb-2">
                  {block.content}
                </div>
                <div className="text-xs md:text-sm uppercase tracking-wider text-neutral-400 font-semibold">
                  {block.subcontent}
                </div>
              </div>
            ))}
          </div>
        )}

        {(section.layoutType === 'grid' || section.layoutType === 'custom-blocks' || section.layoutType === 'slider' || section.layoutType === 'carousel') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.blocks.map((block) => (
              <div
                key={block.id}
                className="p-6 rounded-2xl border border-white/10 bg-neutral-900/70 hover:border-amber-500/40 transition-all"
              >
                {block.imageUrl && (
                  <img
                    src={block.imageUrl}
                    alt={block.content}
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                )}
                {block.badge && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 mb-3">
                    {block.badge}
                  </span>
                )}
                <h3 className="text-lg font-bold mb-2">{block.content}</h3>
                {block.subcontent && (
                  <p className="text-sm text-neutral-400 leading-relaxed mb-4">{block.subcontent}</p>
                )}
                {block.linkUrl && (
                  <a
                    href={block.linkUrl}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:underline"
                  >
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
