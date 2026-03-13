'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NotificationBanner from '@/components/NotificationBanner';
import { StatusBadge } from '@/components/StatusBadge';
import { Plus, ChevronRight, LayoutTemplate } from 'lucide-react';
import { LogoutButton } from '@/components/LogoutButton';
import { cn } from '@/lib/utils'; // Make sure lib/utils.ts is true

type Plan = {
    id: number;
    title: string;
    specificTheme: string;
    status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
    createdAt: string;
    aiScore: number | null;
    aiLabel: string | null;
};

// Quick LabelBadge for designer view
function LabelBadge({ label }: { label: string | null }) {
    if (!label) return <span className="text-xs text-slate-500 italic">Pending</span>;

    const colors: Record<string, string> = {
        'Produce Now': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'Secondary Queue': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'Experimental': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        'Reject': 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    return (
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border', colors[label] || 'bg-slate-500/10 text-slate-400 border-slate-500/20')}>
            {label}
        </span>
    );
}

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/plans')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setPlans(data.plans);
                }
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-[#0F1117] text-white p-8">
            <div className="max-w-5xl mx-auto">
                <NotificationBanner />

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">My Plans</h1>
                        <p className="text-slate-400">Submit and track your Dribbble shot plans.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/plans/new"
                            className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            New Plan
                        </Link>
                        <LogoutButton />
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4 animate-pulse">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-24" />
                        ))}
                    </div>
                ) : plans.length === 0 ? (
                    <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-12 text-center">
                        <LayoutTemplate className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">No plans yet</h3>
                        <p className="text-slate-400 mb-6">Start by submitting your first Dribbble shot plan for review.</p>
                        <Link
                            href="/plans/new"
                            className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Create your first plan
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {plans.map(plan => (
                            <Link
                                key={plan.id}
                                href={`/plans/${plan.id}`}
                                className="block bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold text-white group-hover:text-teal-400 transition-colors">
                                                {plan.title || 'Untitled'}
                                            </h3>
                                            <StatusBadge status={plan.status} />
                                        </div>
                                        <p className="text-sm text-slate-400">{plan.specificTheme}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        {plan.aiScore !== null && (
                                            <div className="flex items-center gap-3 pr-6 border-r border-slate-800">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">AI Score</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "text-lg font-bold tracking-tight",
                                                            plan.aiScore >= 85 ? "text-emerald-400" :
                                                                plan.aiScore >= 70 ? "text-blue-400" :
                                                                    plan.aiScore >= 55 ? "text-purple-400" : "text-amber-400"
                                                        )}>
                                                            {plan.aiScore}
                                                        </span>
                                                        <LabelBadge label={plan.aiLabel} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-slate-500">
                                                {new Date(plan.createdAt).toLocaleDateString()}
                                            </span>
                                            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
}
