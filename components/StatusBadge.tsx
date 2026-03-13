import { cn } from '@/lib/utils';
import { Clock, CheckCircle2, XCircle, Send } from 'lucide-react';

type Status = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';

export function StatusBadge({ status }: { status: Status }) {
    const config = {
        draft: { label: 'Draft', colors: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: Clock },
        submitted: { label: 'Submitted', colors: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Send },
        under_review: { label: 'In Review', colors: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: Clock },
        approved: { label: 'Approved', colors: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
        rejected: { label: 'Rejected', colors: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: XCircle },
    };

    const { label, colors, icon: Icon } = config[status] || config.draft;

    return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', colors)}>
            <Icon className="w-3.5 h-3.5" />
            {label}
        </span>
    );
}
