import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────────────────────

export type UserRole = 'customer' | 'seller' | 'admin';

export interface CustomerProfile {
  id: string; role: 'customer'; email: string; full_name: string;
  phone: string; cpf: string; address_street: string; address_number: string;
  address_complement: string; address_neighborhood: string; address_city: string;
  address_state: string; address_zip: string; created_at: string;
}

export interface SellerProfile {
  id: string; role: 'seller'; email: string; full_name: string; phone: string;
  store_name: string; cnpj: string; description: string; address_street: string;
  address_number: string; address_complement: string; address_neighborhood: string;
  address_city: string; address_state: string; address_zip: string;
  logo: string; banner: string; category: string; delivery_time: string;
  hours: string; whatsapp: string; social_instagram: string;
  plan_id: string; plan_limit: number; plan_expires_at: string; is_active: boolean;
  created_at: string;
}

export interface AdminProfile {
  id: string; role: 'admin'; email: string; full_name: string; created_at: string;
}

export type UserProfile = CustomerProfile | SellerProfile | AdminProfile;

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signInCustomer: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpCustomer: (data: { email: string; password: string; full_name: string; phone: string; cpf: string }) => Promise<{ error: string | null }>;
  signInSeller: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpSeller: (data: { email: string; password: string; full_name: string; store_name: string; cnpj: string; phone: string }) => Promise<{ error: string | null }>;
  signInAdmin: (login: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  updateSellerById: (id: string, data: Partial<SellerProfile>) => void;
  getAllSellers: () => SellerProfile[];
  isCustomer: boolean;
  isSeller: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// ── Storage helpers ────────────────────────────────────────────────────────

const STORAGE_KEY = 'compraai_user';
const USERS_KEY = 'compraai_users';

const getStoredUser = (): UserProfile | null => {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
};
const setStoredUser = (user: UserProfile | null) => {
  if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_KEY);
};
const getAllUsers = (): any[] => {
  try { const r = localStorage.getItem(USERS_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
};
const saveUser = (user: UserProfile, password: string) => {
  const users = getAllUsers();
  users.push({ ...user, password });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};
const updateStoredUserById = (id: string, data: Partial<UserProfile>) => {
  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx >= 0) { users[idx] = { ...users[idx], ...data }; localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
};

// ── Seed admin account ─────────────────────────────────────────────────────

const seedAdmin = () => {
  const users = getAllUsers();
  if (!users.some(u => u.role === 'admin')) {
    const admin: AdminProfile = {
      id: 'admin_001', role: 'admin', email: 'admin@compraai.com',
      full_name: 'Administrador', created_at: new Date().toISOString(),
    };
    users.push({ ...admin, password: 'admin123' });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};

// ── Provider ───────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedAdmin();
    const stored = getStoredUser();
    setUser(stored);
    setLoading(false);
  }, []);

  const signInCustomer = async (email: string, password: string): Promise<{ error: string | null }> => {
    const found = getAllUsers().find(u => u.email === email && u.role === 'customer');
    if (!found) return { error: 'E-mail não encontrado. Crie uma conta primeiro.' };
    if (found.password !== password) return { error: 'Senha incorreta.' };
    const { password: _, ...profile } = found;
    setUser(profile); setStoredUser(profile);
    return { error: null };
  };

  const signUpCustomer = async (data: { email: string; password: string; full_name: string; phone: string; cpf: string }): Promise<{ error: string | null }> => {
    const users = getAllUsers();
    if (users.some(u => u.email === data.email)) return { error: 'E-mail já cadastrado.' };
    if (users.some(u => u.role === 'customer' && (u as CustomerProfile).cpf === data.cpf)) return { error: 'CPF já cadastrado.' };
    const profile: CustomerProfile = {
      id: 'cust_' + Date.now(), role: 'customer', email: data.email,
      full_name: data.full_name, phone: data.phone, cpf: data.cpf,
      address_street: '', address_number: '', address_complement: '',
      address_neighborhood: '', address_city: '', address_state: '', address_zip: '',
      created_at: new Date().toISOString(),
    };
    saveUser(profile, data.password);
    setUser(profile); setStoredUser(profile);
    return { error: null };
  };

  const signInSeller = async (email: string, password: string): Promise<{ error: string | null }> => {
    const found = getAllUsers().find(u => u.email === email && u.role === 'seller');
    if (!found) return { error: 'E-mail não encontrado. Cadastre sua loja primeiro.' };
    if (found.password !== password) return { error: 'Senha incorreta.' };
    const sp = found as SellerProfile & { password: string };
    if (sp.is_active === false) return { error: 'Sua loja está desativada. Entre em contato com o suporte.' };
    const { password: _, ...profile } = found;
    setUser(profile); setStoredUser(profile);
    return { error: null };
  };

  const signUpSeller = async (data: { email: string; password: string; full_name: string; store_name: string; cnpj: string; phone: string }): Promise<{ error: string | null }> => {
    const users = getAllUsers();
    if (users.some(u => u.email === data.email)) return { error: 'E-mail já cadastrado.' };
    if (users.some(u => u.role === 'seller' && (u as SellerProfile).cnpj === data.cnpj)) return { error: 'CNPJ já cadastrado.' };
    const profile: SellerProfile = {
      id: 'seller_' + Date.now(), role: 'seller', email: data.email,
      full_name: data.full_name, phone: data.phone, store_name: data.store_name, cnpj: data.cnpj,
      description: '', address_street: '', address_number: '', address_complement: '',
      address_neighborhood: '', address_city: '', address_state: '', address_zip: '',
      logo: '', banner: '', category: '', delivery_time: '', hours: '',
      whatsapp: data.phone, social_instagram: '',
      plan_id: 'plan_10', plan_limit: 10, is_active: true,
      plan_expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
      created_at: new Date().toISOString(),
    };
    saveUser(profile, data.password);
    setUser(profile); setStoredUser(profile);
    return { error: null };
  };

  const signInAdmin = async (login: string, password: string): Promise<{ error: string | null }> => {
    // Accept both login username and email
    const found = getAllUsers().find(u =>
      u.role === 'admin' && (u.email === login || login === 'admin') && u.id === 'admin_001'
    );
    if (!found) return { error: 'Credenciais de admin inválidas.' };
    if (found.password !== password) return { error: 'Senha incorreta.' };
    const { password: _, ...profile } = found;
    setUser(profile); setStoredUser(profile);
    return { error: null };
  };

  const signOut = () => { setUser(null); setStoredUser(null); };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data } as UserProfile;
    setUser(updated); setStoredUser(updated);
    updateStoredUserById(user.id, data);
    toast.success('Dados atualizados!');
  };

  const updateSellerById = (id: string, data: Partial<SellerProfile>) => {
    updateStoredUserById(id, data);
    // If current user is that seller, update their session too
    if (user?.id === id) {
      const updated = { ...user, ...data } as UserProfile;
      setUser(updated); setStoredUser(updated);
    }
  };

  const getAllSellers = (): SellerProfile[] =>
    getAllUsers().filter(u => u.role === 'seller').map(({ password: _, ...u }) => u as SellerProfile);

  return (
    <AuthContext.Provider value={{
      user, loading, signInCustomer, signUpCustomer, signInSeller, signUpSeller, signInAdmin,
      signOut, updateProfile, updateSellerById, getAllSellers,
      isCustomer: user?.role === 'customer',
      isSeller: user?.role === 'seller',
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
};
