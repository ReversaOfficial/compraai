import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────────────────────

export interface Plan {
  id: string;
  name: string;
  product_limit: number;
  monthly_price: number;
  annual_price: number;   // total anual
  annual_monthly_price: number; // valor mensal no plano anual
  discount_pct: number;
  color: string;
  popular?: boolean;
}

export interface PaymentConfig {
  pix_key: string;
  pix_key_type: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  pix_beneficiary: string;
  bank_name: string;
  bank_agency: string;
  bank_account: string;
  bank_account_type: 'corrente' | 'poupanca';
  bank_beneficiary: string;
  bank_cpf_cnpj: string;
}

export interface PaymentRecord {
  id: string;
  seller_id: string;
  seller_name: string;
  plan_id: string;
  plan_name: string;
  amount: number;
  method: 'pix' | 'credit_card';
  billing: 'monthly' | 'annual';
  status: 'pending' | 'confirmed' | 'failed';
  created_at: string;
  confirmed_at?: string;
}

const PLANS_KEY = 'compraai_plans';
const PAYMENT_CONFIG_KEY = 'compraai_payment_config';
const PAYMENTS_KEY = 'compraai_payments';

const DEFAULT_PLANS: Plan[] = [
  { id: 'plan_10',  name: 'Starter',      product_limit: 10,  monthly_price: 29.90,  annual_price: 287.04, annual_monthly_price: 23.92, discount_pct: 20, color: 'from-slate-400 to-slate-500' },
  { id: 'plan_20',  name: 'Básico',       product_limit: 20,  monthly_price: 49.90,  annual_price: 478.80, annual_monthly_price: 39.90, discount_pct: 20, color: 'from-emerald-400 to-emerald-600' },
  { id: 'plan_30',  name: 'Profissional', product_limit: 30,  monthly_price: 79.90,  annual_price: 766.80, annual_monthly_price: 63.90, discount_pct: 20, color: 'from-blue-400 to-blue-600', popular: true },
  { id: 'plan_50',  name: 'Business',     product_limit: 50,  monthly_price: 119.90, annual_price: 1150.56, annual_monthly_price: 95.88, discount_pct: 20, color: 'from-violet-400 to-violet-600' },
  { id: 'plan_100', name: 'Enterprise',   product_limit: 100, monthly_price: 199.90, annual_price: 1919.04, annual_monthly_price: 159.92, discount_pct: 20, color: 'from-amber-400 to-orange-500' },
];

const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  pix_key: '', pix_key_type: 'cnpj', pix_beneficiary: '', bank_name: '',
  bank_agency: '', bank_account: '', bank_account_type: 'corrente',
  bank_beneficiary: '', bank_cpf_cnpj: '',
};

const load = <T,>(key: string, fallback: T): T => {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
};
const save = (key: string, val: unknown) => localStorage.setItem(key, JSON.stringify(val));

// ── Context ────────────────────────────────────────────────────────────────

interface PlansCtx {
  plans: Plan[];
  setPlans: (p: Plan[]) => void;
  updatePlan: (id: string, data: Partial<Plan>) => void;
  getPlan: (id: string) => Plan | undefined;
  paymentConfig: PaymentConfig;
  setPaymentConfig: (c: PaymentConfig) => void;
  payments: PaymentRecord[];
  addPayment: (p: Omit<PaymentRecord, 'id' | 'created_at'>) => PaymentRecord;
  confirmPayment: (id: string) => void;
  getSellerPayments: (sellerId: string) => PaymentRecord[];
}

const Ctx = createContext<PlansCtx | null>(null);

export const usePlans = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('usePlans must be inside PlansProvider');
  return c;
};

export const PlansProvider = ({ children }: { children: ReactNode }) => {
  const [plans, setPlansState] = useState<Plan[]>(() => load(PLANS_KEY, DEFAULT_PLANS));
  const [paymentConfig, setPaymentConfigState] = useState<PaymentConfig>(() => load(PAYMENT_CONFIG_KEY, DEFAULT_PAYMENT_CONFIG));
  const [payments, setPayments] = useState<PaymentRecord[]>(() => load(PAYMENTS_KEY, []));

  const setPlans = (p: Plan[]) => { setPlansState(p); save(PLANS_KEY, p); };
  const setPaymentConfig = (c: PaymentConfig) => { setPaymentConfigState(c); save(PAYMENT_CONFIG_KEY, c); toast.success('Configuração de pagamento salva!'); };
  const updatePlan = (id: string, data: Partial<Plan>) => {
    const updated = plans.map(p => p.id === id ? { ...p, ...data } : p);
    setPlans(updated);
    toast.success('Plano atualizado!');
  };
  const getPlan = (id: string) => plans.find(p => p.id === id);

  const addPayment = (p: Omit<PaymentRecord, 'id' | 'created_at'>): PaymentRecord => {
    const rec: PaymentRecord = { id: 'pay_' + Date.now(), created_at: new Date().toISOString(), ...p };
    const updated = [...payments, rec];
    setPayments(updated); save(PAYMENTS_KEY, updated);
    return rec;
  };

  const confirmPayment = (id: string) => {
    const updated = payments.map(p =>
      p.id === id ? { ...p, status: 'confirmed' as const, confirmed_at: new Date().toISOString() } : p
    );
    setPayments(updated); save(PAYMENTS_KEY, updated);
  };

  const getSellerPayments = (sellerId: string) => payments.filter(p => p.seller_id === sellerId);

  return (
    <Ctx.Provider value={{ plans, setPlans, updatePlan, getPlan, paymentConfig, setPaymentConfig, payments, addPayment, confirmPayment, getSellerPayments }}>
      {children}
    </Ctx.Provider>
  );
};
