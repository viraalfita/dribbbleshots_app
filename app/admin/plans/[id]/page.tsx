'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';
import { ScoreBreakdown } from '@/components/ScoreBreakdown';
import { ChevronLeft, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Reuse LabelBadge (extract later)
function LabelBadge({ label, size = 'sm' }: { label: string | null, size?: 'sm' | 'lg' }) {
    if (!label) return null;
    const colors: Record<string, string> = {
        'Produce Now': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'Secondary Queue': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'Experimental': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        'Reject': 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return (
        <span className={cn(
            'inline-flex items-center font-semibold border rounded',
            colors[label] || 'bg-slate-500/10 text-slate-400 border-slate-500/20',
            size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1.5 text-sm'
        )}>
            {label}
        </span>
    );
}

export default function AdminPlanReviewPage() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [submitting, setSubmitting] = useState(false);
    const [notes, setNotes] = useState({
        specific_theme: '',
        title: '',
        target_market: '',
        product_type: '',
        sections_or_screens: '',
        app_explanation: '',
        ref_links: ''
    });

    useEffect(() => {
        fetch(`/api/plans/${id}`)
      .then(res => res.json())
      .then(d => {
        if (d.success) setData(d);
        else router.push('/admin'); 
        setLoading(false);
      });
  }, [id, router]);

  const submitReview = async (decision: 'approved' | 'rejected') => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/plans/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, fieldNotesJson: notes })
      });
      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        alert('Review submission failed');
        setSubmitting(false);
      }
    } catch {
      alert('Network error');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0F1117] flex items-center justify-center text-slate-500 animate-pulse">Loading review data...</div>;
  }
  if (!data || !data.plan) return null;

  const { plan, aiEvaluation, generalTheme } = data;
  const structData = plan.productType === 'website' ? plan.sectionsJson 
                   : plan.productType === 'mobile' ? plan.screensJson 
                   : plan.pagesJson;

  // Has it already been reviewed?
  const isReviewed = plan.status === 'approved' || plan.status === 'rejected';

  const updateNote = (field: keyof typeof notes, val: string) => {
    setNotes(prev => ({ ...prev, [field]: val }));
  };

  return (
    <div className="min-h-screen bg-[#0F1117] text-white p-8 pb-32">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">Review: {plan.title || 'Untitled Plan'}</h1>
                <StatusBadge status={plan.status} />
              </div>
              <p className="text-slate-400 text-sm">Submitted {new Date(plan.createdAt).toLocaleString()} by Designer ID: {plan.designerId}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content (Left) */}
          <div className="col-span-1 lg:col-span-8 space-y-8">
            
            {/* View/Edit Field Blocks */}
            <section className="space-y-6">
              
              {/* Context */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative">
                 <h3 className="text-lg font-semibold text-teal-400 mb-4 pb-2 border-b border-slate-800">1. Core Concept</h3>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">General Theme</h4>
                      <p className="text-slate-300">{generalTheme?.macroTheme} &gt; {generalTheme?.nicheName}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Target Market</h4>
                      <p className="text-slate-300">{plan.targetMarket}</p>
                    </div>
                    <div className="col-span-2">
                       <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Specific Angle</h4>
                       <p className="text-white font-medium">{plan.specificTheme}</p>
                       {!isReviewed && (
                         <input 
                           type="text" 
                           placeholder="Admin note for specific angle..." 
                           value={notes.specific_theme}
                           onChange={e => updateNote('specific_theme', e.target.value)}
                           className="mt-3 w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                         />
                       )}
                    </div>
                    <div className="col-span-2 bg-slate-950 p-4 rounded-lg border border-slate-800">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">App Explanation</h4>
                      <p className="text-slate-300 text-sm whitespace-pre-wrap">{plan.appExplanation}</p>
                      {!isReviewed && (
                        <input 
                          type="text" 
                          placeholder="Admin note for explanation..." 
                          value={notes.app_explanation}
                          onChange={e => updateNote('app_explanation', e.target.value)}
                          className="mt-3 w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                        />
                      )}
                    </div>
                 </div>
              </div>

               {/* Structure */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                 <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
                    <h3 className="text-lg font-semibold text-teal-400">2. Structure ({plan.productType})</h3>
                 </div>
                 <div className="space-y-3 mb-4">
                  {structData?.map((item: any, i: number) => (
                    <div key={i} className="flex gap-4 p-3 bg-slate-950 rounded-lg border border-slate-800">
                       <div className="w-6 text-sm font-mono text-slate-500 pt-0.5">{i+1}.</div>
                       <div>
                         <p className="font-medium text-slate-200 mb-0.5">{item.name}</p>
                         <p className="text-sm text-slate-400 pr-4">{item.description || item.flow}</p>
                       </div>
                    </div>
                  ))}
                 </div>
                 {!isReviewed && (
                    <input 
                      type="text" 
                      placeholder="Admin note for structure..." 
                      value={notes.sections_or_screens}
                      onChange={e => updateNote('sections_or_screens', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                    />
                  )}
              </div>
              
              {/* Refs */}
              {plan.refLinksJson && plan.refLinksJson.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-teal-400 mb-4 pb-2 border-b border-slate-800">3. References</h3>
                    <ul className="space-y-2 mb-4">
                      {plan.refLinksJson.map((link: string, i: number) => (
                        <li key={i}>
                          <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">{link}</a>
                        </li>
                      ))}
                    </ul>
                    {!isReviewed && (
                        <input 
                          type="text" 
                          placeholder="Admin note for links..." 
                          value={notes.ref_links}
                          onChange={e => updateNote('ref_links', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                        />
                    )}
                </div>
              )}

            </section>
          </div>

          {/* Sidebar (Right) */}
          <div className="col-span-1 lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            
            {/* AI Evaluation Card */}
            {aiEvaluation ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                 <div className="p-6 border-b border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-white">AI Evaluation</h3>
                    <div className="text-right">
                      <div className="text-3xl font-bold tracking-tighter mb-1 text-white">
                        {aiEvaluation.score}<span className="text-lg text-slate-500 font-normal">/100</span>
                      </div>
                      <LabelBadge label={aiEvaluation.label} size="sm" />
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 italic">"{aiEvaluation.overallVerdict}"</p>
                </div>
                
                <div className="p-5 bg-slate-950/50">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Score Breakdown</h4>
                  <ScoreBreakdown scores={aiEvaluation.scoreBreakdownJson} />
                </div>
                
                <div className="p-5 border-t border-slate-800 space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-0 bg-slate-900/90 py-2 backdrop-blur-sm">AI Notes</h4>
                  {Object.entries(aiEvaluation.fieldFeedbackJson).map(([field, msg]: [string, any]) => (
                    <div key={field} className="bg-slate-800/30 p-2 rounded border border-slate-800/80 text-sm">
                      <span className="font-medium text-teal-400/80 capitalize block mb-0.5">{field.replace(/_/g, ' ')}</span>
                      <span className="text-slate-300 inline-block align-top">{msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-500">
                 No AI Evaluation available.
              </div>
            )}
            
            {/* Admin Action Panel */}
            {!isReviewed && (
              <div className="bg-slate-900 border-2 border-slate-800 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-4">Final Decision</h3>
                <p className="text-sm text-slate-400 mb-6">Review the AI score, add any necessary notes on the left, and make your final call.</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => submitReview('rejected')}
                    disabled={submitting}
                    className="flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-lg border-2 border-amber-500/20 bg-amber-500/5 text-amber-500 font-medium hover:bg-amber-500/10 hover:border-amber-500/40 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-6 h-6" />
                    Reject
                  </button>
                  <button
                    onClick={() => submitReview('approved')}
                    disabled={submitting}
                    className="flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-lg border-2 border-emerald-500/20 bg-emerald-500/5 text-emerald-500 font-medium hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    Approve
                  </button>
                </div>
              </div>
            )}

            {isReviewed && (
               <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
                  <p className="text-slate-400 mb-2">This plan has already been reviewed.</p>
                  <StatusBadge status={plan.status} />
               </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
