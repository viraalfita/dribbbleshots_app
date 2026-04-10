'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';
import { ChevronRight, Filter, Settings, Users, Key } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoutButton } from '@/components/LogoutButton';

function LabelBadge({ label }: { label: string | null }) {
    if (!label) return <span className="text-xs text-slate-500 italic">Pending</span>;

    const colors = {
        'Produce Now': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'Secondary Queue': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'Experimental': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        'Reject': 'bg-red-500/10 text-red-400 border-red-500/20',
    }[label] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';

    return (
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border', colors)}>
            {label}
        </span>
    );
}

type AdminPlan = {
    id: number;
    title: string;
    specific_theme: string;
    status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
    created_at: string;
    designerUsername: string;
    aiScore: number | null;
    aiLabel: string | null;
};

export default function AdminDashboard() {
    const [plans, setPlans] = useState<AdminPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('all');

    useEffect(() => {
        fetch('/api/admin/plans')
            .then(res => res.json())
            .then(data => {
                if (data.success) setPlans(data.plans);
                setLoading(false);
            });
    }, []);

    const pendingCount = plans.filter(p => p.status === 'submitted' || p.status === 'under_review').length;

    const filteredPlans = plans.filter(p => {
        if (filter === 'pending') return p.status === 'submitted' || p.status === 'under_review';
        if (filter === 'reviewed') return p.status === 'approved' || p.status === 'rejected';
        return true;
    });

    return (
        <div className="min-h-screen bg-[#0F1117] text-white p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2 text-rose-50">Admin Workspace</h1>
                        <p className="text-blue-200/60">Review submitted Dribbble shot plans.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                            <Users className="w-5 h-5" />
                        </button>
                        <button className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                            <Settings className="w-5 h-5" />
                        </button>
                        <Link
                            href="/admin/api-keys"
                            className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                            title="API Keys"
                        >
                            <Key className="w-5 h-5" />
                        </Link>
                        <LogoutButton />
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                        <h3 className="text-sm font-medium text-slate-400 mb-1">Total Submissions</h3>
                        <p className="text-3xl font-bold text-white">{plans.length}</p>
                    </div>
                    <div className="bg-teal-900/20 border border-teal-900/50 rounded-xl p-5 shadow-sm">
                        <h3 className="text-sm font-medium text-teal-400/80 mb-1">Requires Review</h3>
                        <p className="text-3xl font-bold text-teal-400">{pendingCount}</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                        <h3 className="text-sm font-medium text-slate-400 mb-1">Approved</h3>
                        <p className="text-3xl font-bold text-slate-300">{plans.filter(p => p.status === 'approved').length}</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                        <h3 className="text-sm font-medium text-slate-400 mb-1">Rejected</h3>
                        <p className="text-3xl font-bold text-slate-300">{plans.filter(p => p.status === 'rejected').length}</p>
                    </div>
                </div>

                {/* Table Area */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                        <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                            {(['all', 'pending', 'reviewed'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={cn(
                                        "px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors",
                                        filter === f ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white"
                                    )}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 transition-colors">
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-950/50 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                    <th className="p-4 border-b border-slate-800 font-medium">Designer</th>
                                    <th className="p-4 border-b border-slate-800 font-medium">Plan Title & Niche</th>
                                    <th className="p-4 border-b border-slate-800 font-medium">Status</th>
                                    <th className="p-4 border-b border-slate-800 font-medium">AI Score</th>
                                    <th className="p-4 border-b border-slate-800 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500 animate-pulse">Loading plans...</td>
                                    </tr>
                                ) : filteredPlans.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500">No plans found in this filter.</td>
                                    </tr>
                                ) : (
                                    filteredPlans.map(plan => (
                                        <tr key={plan.id} className="hover:bg-slate-800/30 transition-colors group">
                                            <td className="p-4 align-top">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-sm font-medium text-slate-300 mr-3">
                                                    {plan.designerUsername.charAt(0).toUpperCase()}
                                                </span>
                                                <span className="text-sm text-slate-300 font-medium">{plan.designerUsername}</span>
                                            </td>
                                            <td className="p-4 align-top max-w-sm">
                                                <Link href={`/admin/plans/${plan.id}`} className="block group-hover:text-teal-400 transition-colors">
                                                    <p className="font-medium text-white mb-1 truncate">{plan.title || 'Untitled'}</p>
                                                    <p className="text-xs text-slate-400 truncate">{plan.specific_theme}</p>
                                                </Link>
                                            </td>
                                            <td className="p-4 align-top">
                                                <StatusBadge status={plan.status} />
                                            </td>
                                            <td className="p-4 align-top">
                                                {plan.aiScore !== null ? (
                                                    <div className="flex flex-col gap-1.5 items-start">
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
                                                ) : (
                                                    <span className="text-xs text-slate-500">N/A</span>
                                                )}
                                            </td>
                                            <td className="p-4 align-top text-right">
                                                <Link
                                                    href={`/admin/plans/${plan.id}`}
                                                    className="inline-flex items-center justify-center p-2 rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-colors border border-teal-500/10"
                                                >
                                                    <span className="text-sm font-medium px-2">Review</span>
                                                    <ChevronRight className="w-4 h-4 ml-1" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
