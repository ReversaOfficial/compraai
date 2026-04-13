import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-0.5 -right-0.5 h-5 min-w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-destructive text-white border-2 border-card font-bold">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <span className="font-bold text-sm">Notificações</span>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary hover:underline">Marcar todas como lidas</button>
          )}
        </div>
        <div className="max-h-80 overflow-auto">
          {notifications.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">Nenhuma notificação</p>
          ) : (
            notifications.slice(0, 10).map(n => (
              <Link
                key={n.id}
                to={n.link || '#'}
                onClick={() => !n.is_read && markAsRead(n.id)}
                className={`flex gap-3 p-3 border-b last:border-0 hover:bg-muted/50 transition-colors ${!n.is_read ? 'bg-primary/5' : ''}`}
              >
                {n.image_url && <img src={n.image_url} alt="" className="h-10 w-10 rounded object-cover shrink-0" />}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm leading-snug ${!n.is_read ? 'font-semibold' : ''}`}>{n.title}</p>
                  {n.body && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(n.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {!n.is_read && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />}
              </Link>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
