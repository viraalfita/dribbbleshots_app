'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThemePicker, type ThemeOption } from '@/components/ThemePicker';
import { SectionBuilder, type SectionItem } from '@/components/SectionBuilder';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function NewPlanPage() {
    const router = useRouter();
    const [themes, setThemes] = useState<ThemeOption[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [generalThemeId, setGeneralThemeId] = useState<number | undefined>();
    const [specificTheme, setSpecificTheme] = useState('');
    const [title, setTitle] = useState('');
    const [productType, setProductType] = useState<'website' | 'mobile' | 'dashboard'>('website');
    const [targetMarket, setTargetMarket] = useState('');
    const [appExplanation, setAppExplanation] = useState('');

    // Conditional Form State
    const [sections, setSections] = useState<SectionItem[]>([{ id: '1', name: '', description: '' }]);
    const [screens, setScreens] = useState<SectionItem[]>([{ id: '1', name: '', description: '' }]);
    const [pages, setPages] = useState<SectionItem[]>([{ id: '1', name: '', description: '' }]);

    const [refLinks, setRefLinks] = useState<string[]>(['', '', '']); // Start with 3 empty

    useEffect(() => {
        fetch('/api/themes')
            .then(res => res.json())
            .then(data => {
                if (data.success) setThemes(data.themes);
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!generalThemeId) return alert('Please select a general theme');

        setLoading(true);

        const payload = {
            generalThemeId,
            specificTheme,
            title,
            productType,
            targetMarket,
            appExplanation,
            sectionsJson: productType === 'website' ? sections.filter(s => s.name) : [],
            screensJson: productType === 'mobile' ? screens.filter(s => s.name) : [],
            pagesJson: productType === 'dashboard' ? pages.filter(p => p.name) : [],
            refLinksJson: refLinks.filter(l => l.trim() !== '')
        };

        try {
            const res = await fetch('/api/plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                router.push(`/plans/${data.planId}`);
      } else {
        alert(data.error || 'Submission failed');
        setLoading(false);
      }
    } catch (err) {
      alert('Network error');
      setLoading(false);
    }
  };

  const updateRefLink = (index: number, value: string) => {
    const newLinks = [...refLinks];
    newLinks[index] = value;
    setRefLinks(newLinks);
  };

  return (
    <div className="min-h-screen bg-[#0F1117] text-white p-8 pb-24">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="flex items-center gap-4">
          <Link href="/plans" className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">New Plan Submission</h1>
            <p className="text-slate-400 text-sm mt-1">AI will evaluate this plan immediately upon submission.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8">
          
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-teal-400 border-b border-slate-800 pb-2">1. Theme Selection</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">General Theme (from library) <span className="text-red-400">*</span></label>
              <ThemePicker themes={themes} onSelect={setGeneralThemeId} selectedId={generalThemeId} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Specific Theme / Niche Angle <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={specificTheme}
                onChange={e => setSpecificTheme(e.target.value)}
                placeholder="e.g. AI-driven patient scheduling for pediatric clinics"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <h2 className="text-lg font-semibold text-teal-400 border-b border-slate-800 pb-2">2. Core Concept</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Shot Title <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. PediCare - Appointment Management Dashboard"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Target Market / Buyers <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={targetMarket}
                onChange={e => setTargetMarket(e.target.value)}
                placeholder="e.g. Clinic managers, Healthcare operations directors"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">App / Concept Explanation <span className="text-red-400">*</span></label>
              <textarea
                value={appExplanation}
                onChange={e => setAppExplanation(e.target.value)}
                placeholder="Explain what the app does, the main problem it solves, and why it looks premium."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y"
                required
              />
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <h2 className="text-lg font-semibold text-teal-400 border-b border-slate-800 pb-2">3. Structure</h2>
            
            <div className="flex gap-4 p-1 bg-slate-950 border border-slate-800 rounded-lg">
              {(['website', 'mobile', 'dashboard'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setProductType(type)}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-md capitalize transition-colors",
                    productType === type 
                      ? "bg-slate-800 text-white shadow-sm" 
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800/50">
              {productType === 'website' && (
                <SectionBuilder 
                  title="Landing Page Sections" 
                  itemNameLabel="Section Name (e.g. Hero, Features)" 
                  itemDescLabel="What happens in this section?"
                  items={sections}
                  onChange={setSections}
                  maxItems={10}
                />
              )}
              {productType === 'mobile' && (
                <SectionBuilder 
                  title="Mobile App Screens" 
                  itemNameLabel="Screen Name (e.g. Home, Scan)" 
                  itemDescLabel="Key actions / data on this screen"
                  items={screens}
                  onChange={setScreens}
                  maxItems={15}
                />
              )}
              {productType === 'dashboard' && (
                <SectionBuilder 
                  title="Dashboard Pages & Flows" 
                  itemNameLabel="Page Name (e.g. Overview, Settings)" 
                  itemDescLabel="What data is visualized or managed here?"
                  items={pages}
                  onChange={setPages}
                  maxItems={10}
                />
              )}
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-lg font-semibold text-teal-400">4. Visual References</h2>
              <span className="text-xs text-slate-500">Optional, max 5</span>
            </div>
            
            <div className="space-y-3">
              {refLinks.map((link, i) => (
                <input
                  key={i}
                  type="url"
                  value={link}
                  onChange={e => updateRefLink(i, e.target.value)}
                  placeholder={`Reference URL ${i + 1} (Dribbble, Behance, live site)`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              ))}
              {refLinks.length < 5 && (
                <button
                  type="button"
                  onClick={() => setRefLinks([...refLinks, ''])}
                  className="text-sm text-teal-500 hover:text-teal-400 font-medium"
                >
                  + Add another link
                </button>
              )}
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AI is evaluating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Submit Plan for Evaluation
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
