import React, { useState, useEffect } from 'react';
import { WebsiteData, VideoItem } from './types';
import { initialWebsiteData } from './data/initialData';
import { getWebsiteData, verifyToken } from './services/api';
import { ThemeProvider } from './components/ThemeManager';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { VideoPortfolio } from './components/VideoPortfolio';
import { DesignPortfolio } from './components/DesignPortfolio';
import { SkillsSection } from './components/SkillsSection';
import { DynamicSectionRenderer } from './components/DynamicSectionRenderer';
import { AboutSection } from './components/AboutSection';
import { TestimonialsMarquee } from './components/TestimonialsMarquee';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { VideoModal } from './components/VideoModal';
import { FadeUpSection } from './components/FadeUpSection';

import { LoginModal } from './components/admin/LoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Shield, Sparkles, X } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<WebsiteData>(initialWebsiteData);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  // Admin routing & authentication state
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('the_editor_admin_token');
  });

  // Check URL hash for #admin or /admin on load
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash === '#admin' || hash === '#/admin' || path === '/admin') {
        if (authToken) {
          setIsAdminView(true);
        } else {
          setShowLoginModal(true);
        }
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [authToken]);

  // Load website data from server
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const fetched = await getWebsiteData();
        if (isMounted && fetched) {
          setData(fetched);
        }
      } catch (err) {
        console.error('Error fetching website data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Verify auth token validity
  useEffect(() => {
    if (authToken) {
      verifyToken(authToken).then(isValid => {
        if (!isValid) {
          localStorage.removeItem('the_editor_admin_token');
          setAuthToken(null);
        }
      });
    }
  }, [authToken]);

  const handleAdminLoginSuccess = (token: string) => {
    localStorage.setItem('the_editor_admin_token', token);
    setAuthToken(token);
    setShowLoginModal(false);
    setIsAdminView(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('the_editor_admin_token');
    setAuthToken(null);
    setIsAdminView(false);
    window.location.hash = '';
  };

  const handleOpenAdmin = () => {
    if (authToken) {
      setIsAdminView(true);
    } else {
      setShowLoginModal(true);
    }
  };

  // Render Admin Dashboard if user is authenticated and in admin view
  if (isAdminView && authToken) {
    return (
      <ThemeProvider themeSettings={data.theme}>
        <AdminDashboard
          data={data}
          token={authToken}
          onUpdateData={(newData) => setData(newData)}
          onExitAdmin={() => setIsAdminView(false)}
          onLogout={handleAdminLogout}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider themeSettings={data.theme}>
      <div className="min-h-screen flex flex-col bg-[var(--color-site-bg)] text-[var(--color-site-text)] selection:bg-amber-400 selection:text-neutral-950 transition-colors">
        {/* Floating Quick Admin Access Banner for authenticated admin */}
        {authToken && (
          <div className="bg-amber-500 text-neutral-950 px-4 py-1.5 text-xs font-bold flex items-center justify-between sticky top-0 z-50 shadow-md">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Logged in as Admin (Asma Shehzadi)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAdminView(true)}
                className="px-2.5 py-0.5 rounded-md bg-neutral-950 text-amber-400 text-[11px] font-extrabold hover:bg-neutral-900 transition-colors"
              >
                Open Admin CMS
              </button>
            </div>
          </div>
        )}

        {/* Public Website Navigation */}
        <Navbar
          navigation={data.navigation}
          themeSettings={data.theme}
          colors={data.theme?.sectionColors?.navbar}
          onNavigateToAdmin={handleOpenAdmin}
          isAdminLoggedIn={Boolean(authToken)}
        />

        {/* Main Content */}
        <main className="flex-1">
          {/* Hero Section */}
          <FadeUpSection delayMs={0}>
            <Hero
              hero={data.hero}
              colors={data.theme?.sectionColors?.hero}
              animation={data.theme?.sectionAnimations?.hero}
              onExploreVideos={() => {
                const el = document.getElementById('video-portfolio');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenFeaturedVideo={() => {
                const feat = data.videos.find(v => v.featured) || data.videos[0];
                if (feat) setSelectedVideo(feat);
              }}
            />
          </FadeUpSection>

          {/* Video Portfolio Showcase */}
          <FadeUpSection delayMs={60}>
            <VideoPortfolio
              videos={data.videos}
              categories={data.videoCategories}
              colors={data.theme?.sectionColors?.videos}
              animation={data.theme?.sectionAnimations?.videos}
              sectionHeadings={data.sectionHeadings?.videos}
              onSelectVideo={(video) => setSelectedVideo(video)}
            />
          </FadeUpSection>

          {/* Graphic Design Gallery */}
          <FadeUpSection delayMs={60}>
            <DesignPortfolio
              designs={data.designs}
              categories={data.designCategories}
              colors={data.theme?.sectionColors?.designs}
              animation={data.theme?.sectionAnimations?.designs}
              sectionHeadings={data.sectionHeadings?.designs}
            />
          </FadeUpSection>

          {/* Dynamic Sections created in Section Builder */}
          {data.dynamicSections && data.dynamicSections.length > 0 && (
            <div className="space-y-0">
              {data.dynamicSections
                .filter(s => s.isEnabled)
                .sort((a, b) => a.order - b.order)
                .map((sec) => (
                  <FadeUpSection key={sec.id} delayMs={50}>
                    <DynamicSectionRenderer
                      section={sec}
                      onOpenVideo={(url, title) => {
                        setSelectedVideo({
                          id: `dyn-${Date.now()}`,
                          title,
                          description: '',
                          category: 'Custom',
                          videoType: 'direct_url',
                          videoUrl: url,
                          thumbnailUrl: '',
                          aspectRatio: '16:9',
                          featured: false,
                          order: 0,
                          status: 'published',
                          tags: [],
                          createdAt: ''
                        });
                      }}
                    />
                  </FadeUpSection>
                ))}
            </div>
          )}

          {/* Skills & Software Mastery and Creative Packages */}
          <FadeUpSection delayMs={60}>
            <SkillsSection
              skills={data.skills}
              services={data.services}
              pricingSettings={data.pricingSettings}
              skillsHeadings={data.sectionHeadings?.skills}
              servicesHeadings={data.sectionHeadings?.services}
              skillsColors={data.theme?.sectionColors?.skills}
              servicesColors={data.theme?.sectionColors?.pricing || data.theme?.sectionColors?.services}
              skillsAnimation={data.theme?.sectionAnimations?.skills}
              servicesAnimation={data.theme?.sectionAnimations?.services}
            />
          </FadeUpSection>

          {/* About Me Section */}
          <FadeUpSection delayMs={60}>
            <AboutSection
              about={data.about}
              colors={data.theme?.sectionColors?.about}
              animation={data.theme?.sectionAnimations?.about}
            />
          </FadeUpSection>

          {/* Testimonials & Reviews Infinite Horizontal Slider */}
          <FadeUpSection delayMs={60}>
            <section
              id="testimonials-section"
              className="py-20 md:py-28 border-b relative transition-colors"
              style={{
                backgroundColor: data.theme?.sectionColors?.testimonials?.bg || 'var(--sec-testimonials-bg, var(--color-site-bg, #0A0A0A))',
                borderColor: data.theme?.sectionColors?.testimonials?.border || 'var(--sec-testimonials-border, var(--color-site-border, #262626))'
              }}
            >
              <div className="max-w-7xl mx-auto px-4 md:px-8 mb-8 text-center">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 border"
                  style={{
                    backgroundColor: 'var(--sec-testimonials-card, var(--color-site-card))',
                    color: data.theme?.sectionColors?.testimonials?.accent || 'var(--sec-testimonials-accent, var(--color-site-accent, #F59E0B))',
                    borderColor: data.theme?.sectionColors?.testimonials?.border || 'var(--sec-testimonials-border, var(--color-site-border, #262626))'
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{data.sectionHeadings?.testimonials?.badge || 'Client Endorsements'}</span>
                </div>
                <h2
                  className="text-3xl md:text-5xl font-extrabold tracking-tight"
                  style={{ color: data.theme?.sectionColors?.testimonials?.heading || 'var(--sec-testimonials-heading, var(--color-site-heading, #FFFFFF))' }}
                >
                  {data.sectionHeadings?.testimonials?.title || 'What Creators & Brands Say'}
                </h2>
                <p
                  className="text-sm md:text-base mt-2 max-w-xl mx-auto"
                  style={{ color: data.theme?.sectionColors?.testimonials?.muted || 'var(--sec-testimonials-muted, var(--color-site-muted, #9CA3AF))' }}
                >
                  {data.sectionHeadings?.testimonials?.subtitle || 'Real feedback from YouTube creators, agencies, influencers, and luxury real estate partners.'}
                </p>
              </div>
              <TestimonialsMarquee
                testimonials={data.testimonials}
                colors={data.theme?.sectionColors?.testimonials}
                animation={data.theme?.sectionAnimations?.testimonials}
              />
            </section>
          </FadeUpSection>

          {/* Contact Section */}
          <FadeUpSection delayMs={60}>
            <ContactSection
              contact={data.contact}
              colors={data.theme?.sectionColors?.contact}
              animation={data.theme?.sectionAnimations?.contact}
              contactHeadings={data.sectionHeadings?.contact}
            />
          </FadeUpSection>
        </main>

        {/* Footer */}
        <FadeUpSection delayMs={0}>
          <Footer
            navigation={data.navigation}
            colors={data.theme?.sectionColors?.footer}
            onNavigateToAdmin={handleOpenAdmin}
          />
        </FadeUpSection>

        {/* Global Video Modal Player */}
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />

        {/* Admin Login Modal */}
        {showLoginModal && (
          <LoginModal
            onSuccess={handleAdminLoginSuccess}
            onCancel={() => {
              setShowLoginModal(false);
              window.location.hash = '';
            }}
          />
        )}
      </div>
    </ThemeProvider>
  );
}
