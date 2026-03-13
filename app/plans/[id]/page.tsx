'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';
import { ScoreBreakdown } from '@/components/ScoreBreakdown';
import { ChevronLeft, Edit3, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export default function PlanDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/plans/${id}`)
      .then(res => res.json())
      .then(d => {
        if (d.success) setData(d);
        else router.push('/plans'); // handle not found/auth
        setLoading(false);
      });
  }, [id, router]);

  if (loading) {
    return <div className="min-h-screen bg-[#0F1117] flex items-center justify-center text-slate-500 animate-pulse">Loading plan data...</div>;
  }
  if (!data || !data.plan) return null;

  const { plan, aiEvaluation, adminReview, generalTheme } = data;

  const structData = plan.productType === 'website' ? plan.sectionsJson 
                   : plan.productType === 'mobile' ? plan.screensJson 
                   : plan.pagesJson;

  return (
    <div className="min-h-screen bg-[#0F1117] text-white p-8 pb-24">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <Link href="/plans" className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">{plan.title || 'Untitled Plan'}</h1>
                <StatusBadge status={plan.status} />
              </div>
              <p className="text-slate-400 text-sm">Submitted {new Date(plan.createdAt).toLocaleString()}</p>
            </div>
          </div>
          {plan.status === 'rejected' && (
             <Link 
               href={`/plans/${plan.id}/revise`}
               className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border border-slate-700 hover:border-slate-600"
             >
               <Edit3 className="w-4 h-4 text-slate-400" />
               Revise & Resubmit
             </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Content (Left) */}
          <div className="col-span-1 lg:col-span-2 space-y-8">
            
            {/* Context Section */}
            <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
              <h2 className="text-lg font-semibold text-teal-400 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center text-xs">1</span>
                Core Concept
              </h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">General Theme</h3>
                  <p className="text-slate-300">{generalTheme ? `${generalTheme.macroTheme} > ${generalTheme.nicheName}` : 'Unknown'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Target Market</h3>
                  <p className="text-slate-300">{plan.targetMarket}</p>
                </div>
                <div className="col-span-2">
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Specific Angle</h3>
                  <p className="text-lg font-medium text-white">{plan.specificTheme}</p>
                </div>
                <div className="col-span-2 bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <h3 className="text-sm font-medium text-slate-500 mb-2">App Explanation</h3>
                  <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">{plan.appExplanation}</p>
                </div>
              </div>
            </section>

            {/* Structure Section */}
            <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-teal-400 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center text-xs">2</span>
                  Structure ({plan.productType})
                </h2>
                <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded uppercase tracking-wider">{plan.productType}</span>
              </div>
              
              <div className="space-y-3">
                {structData && structData.length > 0 ? (
                  structData.map((item: any, i: number) => (
                    <div key={i} className="flex gap-4 p-3 bg-slate-950 rounded-lg border border-slate-800">
                       <div className="w-6 text-sm font-mono text-slate-500 pt-0.5">{i+1}.</div>
                       <div>
                         <p className="font-medium text-slate-200 mb-0.5">{item.name}</p>
                         <p className="text-sm text-slate-400 pr-4">{item.description || item.flow}</p>
                       </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic p-4 text-center border border-slate-800 border-dashed rounded-lg">No structure provided.</p>
                )}
              </div>
            </section>
            
            {/* References Section */}
            {plan.refLinksJson && plan.refLinksJson.length > 0 && (
              <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-teal-400 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center text-xs">3</span>
                  Visual References
                </h2>
                <ul className="space-y-2">
                  {plan.refLinksJson.map((link: string, i: number) => (
                    <li key={i}>
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-2">
                        <ArrowRight className="w-3 h-3" /> {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

          </div>

          {/* Sidebar (Right) */}
          <div className="col-span-1 space-y-6">
            
            {/* AI Evaluation Card */}
            {aiEvaluation && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/5 rounded-full blur-3xl" />
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <h3 className="font-semibold text-white">AI Evaluation</h3>
                    <div className="text-right">
                      <div className="text-3xl font-bold tracking-tighter mb-1 text-white">
                        {aiEvaluation.score}<span className="text-lg text-slate-500 font-normal">/100</span>
                      </div>
                      <LabelBadge label={aiEvaluation.label} size="sm" />
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 italic leading-snug relative z-10 border-l-2 border-slate-700 pl-3">
                    "{aiEvaluation.overallVerdict}"
                  </p>
                </div>
                
                <div className="p-5 bg-slate-950/50">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Score Breakdown</h4>
                  <ScoreBreakdown scores={aiEvaluation.scoreBreakdownJson} />
                </div>
                
                <div className="p-5 border-t border-slate-800 space-y-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">AI Field Notes</h4>
                  {Object.entries(aiEvaluation.fieldFeedbackJson).map(([field, msg]: [string, any]) => (
                    <div key={field} className="bg-slate-800/30 p-3 rounded-lg border border-slate-800/80">
                      <span className="text-xs font-medium text-teal-400/80 capitalize block mb-1">{field.replace(/_/g, ' ')}</span>
                      <p className="text-sm text-slate-300">{msg}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Review Card */}
            {adminReview && (
              <div className={`bg-slate-900 border rounded-xl overflow-hidden shadow-xl ${adminReview.decision === 'approved' ? 'border-emerald-500/30' : 'border-amber-500/30'}`}>
                <div className={`p-5 border-b flex items-center justify-between ${adminReview.decision === 'approved' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                  <h3 className="font-semibold text-white">Admin Review</h3>
                  <StatusBadge status={adminReview.decision} />
                </div>
                <div className="p-5 space-y-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Admin Notes</h4>
                  {Object.entries(adminReview.fieldNotesJson || {}).map(([key, note]: [string, any]) => {
                    if (!note) return null;
                    return (
                      <div key={key} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-sm">
                        <span className="text-xs font-medium text-slate-500 capitalize block mb-1">{key.replace(/_/g, ' ')}</span>
                        <p className="text-slate-300">{note}</p>
                      </div>
                    )
                  })}
                  {(!adminReview.fieldNotesJson || Object.values(adminReview.fieldNotesJson).every(v => !v)) && (
                    <p className="text-sm text-slate-500 italic">No additional admin notes provided.</p>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
