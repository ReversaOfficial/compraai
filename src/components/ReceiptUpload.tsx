import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, Loader2, Image as ImageIcon, Timer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface ReceiptUploadProps {
  paymentType: 'plan_subscription' | 'order' | 'banner' | 'highlight';
  paymentReferenceId: string;
  amount: number;
  onUploaded?: (receiptId: string) => void;
  /** Called when the 5-min timer expires (auto-activation) */
  onTimerComplete?: () => void;
  className?: string;
}

const TIMER_SECONDS = 300; // 5 minutes

const ReceiptUpload = ({ paymentType, paymentReferenceId, amount, onUploaded, onTimerComplete, className = '' }: ReceiptUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const [timerDone, setTimerDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const activatedRef = useRef(false);

  // Countdown timer
  useEffect(() => {
    if (uploaded || timerDone) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [uploaded, timerDone]);

  // Auto-activate when timer finishes
  useEffect(() => {
    if (timerDone && !uploaded && !activatedRef.current) {
      activatedRef.current = true;
      toast.success('Tempo esgotado! Seu pagamento foi ativado automaticamente.');
      onTimerComplete?.();
    }
  }, [timerDone, uploaded, onTimerComplete]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const progress = ((TIMER_SECONDS - secondsLeft) / TIMER_SECONDS) * 100;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Envie uma imagem ou PDF do comprovante');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('Faça login para enviar o comprovante'); return; }

      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('payment-receipts')
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('payment-receipts')
        .getPublicUrl(path);

      const receiptUrl = urlData.publicUrl;

      const { data: receipt, error: insertError } = await supabase
        .from('payment_receipts')
        .insert({
          receipt_url: receiptUrl,
          payment_type: paymentType,
          payment_reference_id: paymentReferenceId,
          amount,
          uploaded_by: user.id,
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      await supabase.from('notifications').insert({
        title: '💰 Comprovante de pagamento recebido',
        body: `Um comprovante de ${paymentType === 'plan_subscription' ? 'assinatura de plano' : 'pagamento'} no valor de R$ ${amount.toFixed(2).replace('.', ',')} foi enviado e confirmado automaticamente.`,
        type: 'payment',
        created_by: user.id,
        link: '/admin/pagamentos',
      });

      if (file.type.startsWith('image/')) {
        setPreview(receiptUrl);
      }

      activatedRef.current = true;
      setUploaded(true);
      toast.success('Comprovante enviado! Ativação imediata realizada.');
      onUploaded?.(receipt.id);
    } catch (err: any) {
      console.error('Receipt upload error:', err);
      toast.error('Erro ao enviar comprovante: ' + (err.message || 'Tente novamente'));
    } finally {
      setUploading(false);
    }
  };

  // Already activated (upload or timer)
  if (uploaded || timerDone) {
    return (
      <div className={`rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4 text-center space-y-2 ${className}`}>
        <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto" />
        <p className="text-sm font-bold text-emerald-700">
          {uploaded ? 'Comprovante confirmado — ativação imediata!' : 'Pagamento ativado automaticamente!'}
        </p>
        <p className="text-xs text-emerald-600">
          {uploaded ? 'Seu comprovante foi recebido e o serviço foi ativado.' : 'O tempo de espera foi concluído e o serviço foi ativado.'}
        </p>
        {preview && (
          <img src={preview} alt="Comprovante" className="mx-auto mt-2 max-h-40 rounded-lg border object-contain" />
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center space-y-3 ${className}`}>
      {/* Timer */}
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Timer className="h-5 w-5" />
          <span className="text-2xl font-mono font-extrabold">{mm}:{ss}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-700 space-y-1">
        <p className="font-bold">⚡ Envie o comprovante para ativação imediata!</p>
        <p>Sem comprovante, a ativação será automática em <strong>{mm}:{ss}</strong>.</p>
      </div>

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <ImageIcon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-sm font-bold">Envie o comprovante PIX (opcional)</p>
        <p className="text-xs text-muted-foreground">Foto ou print do comprovante de transferência</p>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleUpload}
      />
      <Button
        variant="outline"
        className="rounded-full gap-2"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
        ) : (
          <><Upload className="h-4 w-4" /> Enviar Comprovante</>
        )}
      </Button>
      <p className="text-[10px] text-muted-foreground">Imagem ou PDF · Máximo 5MB</p>
    </div>
  );
};

export default ReceiptUpload;
