'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ThemeOption = {
    id: number;
    macroTheme: string;
    nicheName: string;
};

export function ThemePicker({
    themes,
    onSelect,
    selectedId
}: {
    themes: ThemeOption[];
    onSelect: (id: number) => void;
    selectedId?: number;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const groups = useMemo(() => {
        const filtered = themes.filter(t =>
            t.nicheName.toLowerCase().includes(search.toLowerCase()) ||
            t.macroTheme.toLowerCase().includes(search.toLowerCase())
        );

        // Group by macroTheme
        return filtered.reduce((acc, theme) => {
            if (!acc[theme.macroTheme]) acc[theme.macroTheme] = [];
            acc[theme.macroTheme].push(theme);
            return acc;
        }, {} as Record<string, ThemeOption[]>);
    }, [themes, search]);

    const selectedTheme = themes.find(t => t.id === selectedId);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
            >
                <span className={selectedTheme ? 'text-white' : 'text-slate-500'}>
                    {selectedTheme ?`${selectedTheme.macroTheme} — ${selectedTheme.nicheName}` : 'Select a general theme...'}
                </span>
                <ChevronDown className="w-5 h-5 text-slate-500" />
            </button>

            {isOpen && (
                <div className="absolute z-10 w-full mt-2 bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 border-b border-slate-800">
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search themes..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-md py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-slate-600"
                            />
                        </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto p-2 space-y-4">
                        {Object.keys(groups).length === 0 ? (
                            <p className="text-center text-sm text-slate-500 py-4">No themes found</p>
                        ) : (
                            Object.entries(groups).map(([macro, items]) => (
                                <div key={macro}>
                                    <div className="px-2 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        {macro}
                                    </div>
                                    <div className="space-y-1">
                                        {items.map(theme => (
                                            <button
                                                key={theme.id}
                                                type="button"
                                                onClick={() => {
                                                    onSelect(theme.id);
                                                    setIsOpen(false);
                                                    setSearch('');
                                                }}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-left",
                                                    selectedId === theme.id
                                                        ? "bg-teal-500/10 text-teal-400"
                                                        : "text-slate-300 hover:bg-slate-800"
                                                )}
                                            >
                                                {theme.nicheName}
                                                {selectedId === theme.id && <Check className="w-4 h-4" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
