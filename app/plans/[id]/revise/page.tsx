'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ThemePicker, type ThemeOption } from '@/components/ThemePicker';
import { SectionBuilder, type SectionItem } from '@/components/SectionBuilder';
import { ChevronLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function RevisePlanPage() {
    const { id } = useParams();
    const router = useRouter();

    const [themes, setThemes] = useState<ThemeOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialFetchLoading, setInitialFetchLoading] = useState(true);
    const [adminNotes, setAdminNotes] = useState<any>(null);

    const [generalThemeId, setGeneralThemeId] = useState<number | undefined>();
    const [specificTheme, setSpecificTheme] = useState('');
    const [title, setTitle] = useState('');
    const [productType, setProductType] = useState<'website' | 'mobile' | 'dashboard'>('website');
    const [targetMarket, setTargetMarket] = useState('');
    const [appExplanation, setAppExplanation] = useState('');

    const [sections, setSections] = useState<SectionItem[]>([{ id: '1', name: '', description: '' }]);
    const [screens, setScreens] = useState<SectionItem[]>([{ id: '1', name: '', description: '' }]);
    const [pages, setPages] = useState<SectionItem[]>([{ id: '1', name: '', description: '' }]);
    const [refLinks, setRefLinks] = useState<string[]>(['', '', '']);

    useEffect(() => {
        fetch('/api/themes')
            .then(res => res.json())
            .then(data => { if (data.success) setThemes(data.themes); });

        fetch(`/api/plans/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.plan) {
           const p = data.plan;
           setGeneralThemeId(p.general_theme_id);
           setSpecificTheme(p.specific_theme);
           setTitle(p.title);
           setProductType(p.product_type as any);
           setTargetMarket(p.target_market);
           setAppExplanation(p.app_explanation);

           if (p.product_type === 'website')   setSections(p.sections_json || []);
           if (p.product_type === 'mobile')    setScreens(p.screens_json || []);
           if (p.product_type === 'dashboard') setPages(p.pages_json || []);

           const links = p.ref_links_json || [];
           while (links.length < 3) links.push('');
           setRefLinks(links);

           setAdminNotes(data.adminReview?.field_notes_json || null);
        } else {
           router.push('/plans');
        }
        setInitialFetchLoading(false);
      });
  }, [id, router]);

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
      sectionsJson: productType === 'website'   ? sections.filter(s => s.name) : [],
      screensJson:  productType === 'mobile'    ? screens.filter(s => s.name)  : [],
      pagesJson:    productType === 'dashboard' ? pages.filter(p => p.name)    : [],
      refLinksJson: refLinks.filter(l => l.trim() !== '')
    };

    try {
      const res = await fetch(`/api/plans/${id}/revise`, {
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
    } catch {
      alert('Network error');
      setLoading(false);
    }
  };

  const updateRefLink = (index: number, value: string) => {
    const newLinks = [...refLinks];
    newLinks[index] = value;
    setRefLinks(newLinks);
  };

  if (initialFetchLoading) return <div className="min-h-screen bg-[#0F1117] flex items-center justify-center text-slate-500 animate-pulse">Loading previous plan data...</div>;

  return (
    <div className="min-h-screen bg-[#0F1117] text-white p-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-8">

        <div className="flex items-center gap-4">
          <Link href={`/plans/${id}`} className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-amber-50">Revise & Resubmit</h1>
            <p className="text-slate-400 text-sm mt-1">Address admin feedback and resubmit your plan.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            <form onSubmit={handleSubmit} className="col-span-1 lg:col-span-8 space-y-8 bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8">

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
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                  {adminNotes?.specific_theme && (
                    <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md text-sm text-amber-200/80 flex gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                        <p>{adminNotes.specific_theme}</p>
                    </div>
                  )}
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                  {adminNotes?.title && (
                    <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md text-sm text-amber-200/80 flex gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                        <p>{adminNotes.title}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Target Market / Buyers <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={targetMarket}
                    onChange={e => setTargetMarket(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                  {adminNotes?.target_market && (
                    <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md text-sm text-amber-200/80 flex gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                        <p>{adminNotes.target_market}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">App / Concept Explanation <span className="text-red-400">*</span></label>
                  <textarea
                    value={appExplanation}
                    onChange={e => setAppExplanation(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y"
                    required
                  />
                  {adminNotes?.app_explanation && (
                    <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md text-sm text-amber-200/80 flex gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                        <p>{adminNotes.app_explanation}</p>
                    </div>
                  )}
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
                        productType === type ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {adminNotes?.product_type && (
                  <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md text-sm text-amber-200/80 flex gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                      <p>{adminNotes.product_type}</p>
                  </div>
                )}

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

                {adminNotes?.sections_or_screens && (
                  <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md text-sm text-amber-200/80 flex gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                      <p>{adminNotes.sections_or_screens}</p>
                  </div>
                )}
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
                {adminNotes?.ref_links && (
                  <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md text-sm text-amber-200/80 flex gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                      <p>{adminNotes.ref_links}</p>
                  </div>
                )}
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
                      Submit Revision
                    </>
                  )}
                </button>
              </div>

            </form>

            <div className="col-span-1 lg:col-span-4 space-y-6 lg:sticky lg:top-8">
               <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6">
                  <h3 className="font-semibold text-amber-500 flex items-center gap-2 mb-3">
                     <AlertCircle className="w-5 h-5" />
                     Admin Feedback
                  </h3>
                  <p className="text-sm text-amber-200/80 mb-4">
                     Review the notes inline on the left to understand why your plan was rejected. Update the fields and resubmit to get a new AI evaluation.
                  </p>
               </div>
            </div>

        </div>
      </div>
    </div>
  );
}
