import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  X,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle,
  ClipboardCheck,
  DollarSign,
  ShoppingCart,
  Building,
  FileText,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const typeIcons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: AlertCircle,
  approval: ClipboardCheck,
};

const typeColors = {
  info: 'text-primary bg-primary/10',
  warning: 'text-warning bg-warning/10',
  success: 'text-success bg-success/10',
  error: 'text-destructive bg-destructive/10',
  approval: 'text-accent bg-accent/10',
};

const categoryIcons = {
  system: Settings,
  financial: DollarSign,
  purchase: ShoppingCart,
  construction: Building,
  contract: FileText,
};

const priorityBadges = {
  low: 'bg-muted text-muted-foreground',
  normal: 'bg-primary/10 text-primary',
  high: 'bg-warning/10 text-warning',
  urgent: 'bg-destructive/10 text-destructive animate-pulse',
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onArchive }: NotificationItemProps) {
  const TypeIcon = typeIcons[notification.type] || Info;
  const CategoryIcon = categoryIcons[notification.category] || Settings;
  const isUnread = notification.status === 'unread';

  return (
    <div
      className={cn(
        'p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors',
        isUnread && 'bg-primary/5'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-lg shrink-0', typeColors[notification.type])}>
          <TypeIcon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={cn('text-sm font-medium truncate', isUnread && 'font-semibold')}>
              {notification.title}
            </h4>
            {notification.priority !== 'normal' && (
              <Badge className={cn('text-xs px-1.5 py-0', priorityBadges[notification.priority])}>
                {notification.priority === 'urgent' ? 'Urgente' : notification.priority === 'high' ? 'Alta' : 'Baixa'}
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CategoryIcon className="w-3 h-3" />
              <span>
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {notification.action_url && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                  <Link to={notification.action_url}>
                    {notification.action_label || 'Ver'}
                  </Link>
                </Button>
              )}
              {isUnread && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onMarkAsRead(notification.id)}
                  title="Marcar como lida"
                >
                  <Check className="w-3 h-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => onArchive(notification.id)}
                title="Arquivar"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    archiveNotification,
  } = useNotifications();

  const unreadNotifications = notifications.filter(n => n.status === 'unread');
  const readNotifications = notifications.filter(n => n.status === 'read');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-96 p-0"
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-foreground">Notificações</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={markAllAsRead}
            >
              <CheckCheck className="w-3 h-3" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        <Tabs defaultValue="unread" className="w-full">
          <TabsList className="w-full grid grid-cols-2 p-1 m-2 h-9">
            <TabsTrigger value="unread" className="text-xs gap-1">
              Não lidas
              {unreadCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read" className="text-xs">
              Lidas
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px]">
            <TabsContent value="unread" className="m-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Carregando...
                </div>
              ) : unreadNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhuma notificação nova</p>
                </div>
              ) : (
                unreadNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onArchive={archiveNotification}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="read" className="m-0">
              {readNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhuma notificação lida</p>
                </div>
              ) : (
                readNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onArchive={archiveNotification}
                  />
                ))
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
