import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReceiptUploadProps {
  paymentType: 'plan_subscription' | 'order';
  paymentReferenceId: string;
  amount: number;
  onUploaded?: (receiptId: string) => void;
  className?: string;
}

const ReceiptUpload = ({ paymentType, paymentReferenceId, amount, onUploaded, className = '' }: ReceiptUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

      // Upload file
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

      // Create receipt record — auto-confirmed
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

      // Create notification for admin
      await supabase.from('notifications').insert({
        title: '💰 Comprovante de pagamento recebido',
        body: `Um comprovante de ${paymentType === 'plan_subscription' ? 'assinatura de plano' : 'pedido'} no valor de R$ ${amount.toFixed(2).replace('.', ',')} foi enviado e confirmado automaticamente.`,
        type: 'payment',
        created_by: user.id,
        link: '/admin/pagamentos',
      });

      if (file.type.startsWith('image/')) {
        setPreview(receiptUrl);
      }

      setUploaded(true);
      toast.success('Comprovante enviado e confirmado automaticamente!');
      onUploaded?.(receipt.id);
    } catch (err: any) {
      console.error('Receipt upload error:', err);
      toast.error('Erro ao enviar comprovante: ' + (err.message || 'Tente novamente'));
    } finally {
      setUploading(false);
    }
  };

  if (uploaded) {
    return (
      <div className={`rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4 text-center space-y-2 ${className}`}>
        <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto" />
        <p className="text-sm font-bold text-emerald-700">Comprovante confirmado!</p>
        <p className="text-xs text-emerald-600">Seu pagamento foi confirmado automaticamente.</p>
        {preview && (
          <img src={preview} alt="Comprovante" className="mx-auto mt-2 max-h-40 rounded-lg border object-contain" />
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center space-y-3 ${className}`}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <ImageIcon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-sm font-bold">Envie o comprovante PIX</p>
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
