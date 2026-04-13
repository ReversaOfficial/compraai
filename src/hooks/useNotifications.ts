import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string;
  image_url: string;
  created_at: string;
  is_read: boolean;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) { setNotifications([]); setUnreadCount(0); return; }
    const { data: notifs } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    const { data: reads } = await supabase
      .from('notification_reads')
      .select('notification_id')
      .eq('user_id', user.id);
    
    const readIds = new Set((reads || []).map(r => r.notification_id));
    const mapped = (notifs || []).map(n => ({
      ...n,
      body: n.body || '',
      link: n.link || '',
      image_url: n.image_url || '',
      is_read: readIds.has(n.id),
    }));
    setNotifications(mapped);
    setUnreadCount(mapped.filter(n => !n.is_read).length);
  }, [user]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    await supabase.from('notification_reads').insert({ notification_id: notificationId, user_id: user.id });
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    if (!user) return;
    const unread = notifications.filter(n => !n.is_read);
    if (unread.length === 0) return;
    await supabase.from('notification_reads').insert(
      unread.map(n => ({ notification_id: n.id, user_id: user.id }))
    );
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markAsRead, markAllRead, refetch: fetchNotifications };
};
