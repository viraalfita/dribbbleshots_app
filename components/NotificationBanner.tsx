'use client';

import { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';

type Notification = {
    id: number;
    message: string;
    type: 'approved' | 'rejected' | 'info';
};

export default function NotificationBanner() {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        fetch('/api/notifications')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setNotifications(data.notifications);
                }
            });
    }, []);

    const dismiss = async (id: number) => {
        await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="w-full space-y-2 mb-6">
      {notifications.map(n => (
        <div 
          key={n.id} 
          className={`relative overflow-hidden rounded-lg p-4 flex items-start gap-4 border shadow-sm
            ${n.type === 'approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100' : ''}
            ${n.type === 'rejected' ? 'bg-amber-500/10 border-amber-500/20 text-amber-100' : ''}
            ${n.type === 'info' ? 'bg-blue-500/10 border-blue-500/20 text-blue-100' : ''}
          `}
        >
          <Bell className={`w-5 h-5 shrink-0 
             ${n.type === 'approved' ? 'text-emerald-400' : ''}
             ${n.type === 'rejected' ? 'text-amber-400' : ''}
             ${n.type === 'info' ? 'text-blue-400' : ''}
          `} />
          <div className="flex-1 pr-8">
            <p className="text-sm font-medium">{n.message}</p>
          </div>
          <button 
            onClick={() => dismiss(n.id)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
