'use client';

import { Plus, Trash2 } from 'lucide-react';

export type SectionItem = {
    id: string;
    name: string;
    description: string;
};

type Props = {
    title: string;
    itemNameLabel: string;
    itemDescLabel: string;
    items: SectionItem[];
    onChange: (items: SectionItem[]) => void;
    maxItems?: number;
};

export function SectionBuilder({
    title,
    itemNameLabel,
    itemDescLabel,
    items,
    onChange,
    maxItems = 15
}: Props) {

    const addItem = () => {
        if (items.length >= maxItems) return;
        onChange([...items, { id: crypto.randomUUID(), name: '', description: '' }]);
    };

    const updateItem = (id: string, field: 'name' | 'description', value: string) => {
        onChange(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const removeItem = (id: string) => {
        onChange(items.filter(item => item.id !== id));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-300">{title}</label>
                <span className="text-xs text-slate-500">
                    {items.length} / {maxItems}
                </span>
            </div>

            <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={item.id} className="flex gap-3 items-start bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                        <div className="flex-1 space-y-3">
                            <input
                                type="text"
                                value={item.name}
                                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                placeholder={itemNameLabel}
                                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                                required
                            />
                            <textarea
                                value={item.description}
                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                placeholder={itemDescLabel}
                                rows={2}
                                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                                required
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors mt-1"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            {items.length < maxItems && (
                <button
                    type="button"
                    onClick={addItem}
                    className="w-full py-3 border-2 border-dashed border-slate-800 rounded-lg text-slate-400 hover:text-teal-400 hover:border-teal-500/50 hover:bg-teal-500/5 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Add Item
                </button>
            )}
        </div>
    );
}
