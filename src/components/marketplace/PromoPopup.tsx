import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface PopupAd {
  id: string;
  title: string;
  body: string;
  image_url: string;
  button_text: string;
  button_link: string;
  frequency: string;
}

const PromoPopup = () => {
  const [popup, setPopup] = useState<PopupAd | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('popup_ads')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      if (!data) return;

      const key = `popup_seen_${data.id}`;
      const freq = data.frequency;

      if (freq === 'once_per_day') {
        const last = localStorage.getItem(key);
        if (last === new Date().toDateString()) return;
      } else if (freq === 'once_per_session') {
        if (sessionStorage.getItem(key)) return;
      }

      setPopup({
        ...data,
        title: data.title || '',
        body: data.body || '',
        image_url: data.image_url || '',
        button_text: data.button_text || '',
        button_link: data.button_link || '',
      });
      setTimeout(() => setOpen(true), 1500);
    };
    load();
  }, []);

  const handleClose = () => {
    setOpen(false);
    if (!popup) return;
    const key = `popup_seen_${popup.id}`;
    if (popup.frequency === 'once_per_day') {
      localStorage.setItem(key, new Date().toDateString());
    } else if (popup.frequency === 'once_per_session') {
      sessionStorage.setItem(key, '1');
    }
  };

  if (!popup) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
        <button onClick={handleClose} className="absolute top-3 right-3 z-10 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors">
          <X className="h-4 w-4" />
        </button>
        {popup.image_url && (
          <img src={popup.image_url} alt={popup.title} className="w-full aspect-video object-cover" />
        )}
        <div className="p-6">
          {popup.title && <h3 className="text-xl font-bold mb-2">{popup.title}</h3>}
          {popup.body && <p className="text-sm text-muted-foreground mb-4">{popup.body}</p>}
          {popup.button_text && popup.button_link && (
            <Button asChild className="w-full rounded-full">
              <a href={popup.button_link}>{popup.button_text}</a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromoPopup;
