'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

type BreakdownProps = {
    scores: {
        region_timing_fit: number;
        buyer_fit: number;
        authority_fit: number;
        visual_potential: number;
        business_relevance: number;
        discovery_potential: number;
        generic_penalty: number;
    };
};

export function ScoreBreakdown({ scores }: BreakdownProps) {
    const bars = useMemo(() => [
        { label: 'Region & Timing Fit', val: scores.region_timing_fit, max: 20, color: 'bg-emerald-500' },
        { label: 'Buyer Relevance', val: scores.buyer_fit, max: 20, color: 'bg-blue-500' },
        { label: 'Agency Authority', val: scores.authority_fit, max: 20, color: 'bg-indigo-500' },
        { label: 'Visual Potential', val: scores.visual_potential, max: 15, color: 'bg-fuchsia-500' },
        { label: 'Business Reality', val: scores.business_relevance, max: 15, color: 'bg-rose-500' },
        { label: 'Discovery & SEO', val: scores.discovery_potential, max: 10, color: 'bg-amber-500' },
    ], [scores]);

    return (
        <div className="space-y-4">
            {bars.map(bar => (
                <div key={bar.label} className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                        <span>{bar.label}</span>
                        <span>{Math.max(0, bar.val)} / {bar.max}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={cn("h-full rounded-full transition-all duration-1000 ease-out", bar.color)}
                            style={{ width: `${Math.max(0, (bar.val / bar.max) * 100)}%` }}
            />
                    </div>
                </div>
            ))}
            {scores.generic_penalty < 0 && (
                <div className="pt-2 mt-4 border-t border-slate-700/50 flex justify-between text-xs text-red-400 font-medium bg-red-500/5 p-2 rounded-md border border-red-500/10">
                    <span>Generic / Low-Trust Penalty</span>
                    <span>{scores.generic_penalty} points</span>
                </div>
            )}
        </div>
    );
}
