import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone } from 'lucide-react';

const Footer = () => (
  <footer className="border-t bg-card">
    <div className="container py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hero">
              <span className="text-sm font-bold text-primary-foreground">V</span>
            </div>
            <span className="text-lg font-bold">Vitrine</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O marketplace da sua cidade. Compre de lojas locais com praticidade e segurança.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Navegação</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
            <Link to="/produtos" className="hover:text-foreground transition-colors">Produtos</Link>
            <Link to="/lojas" className="hover:text-foreground transition-colors">Lojas</Link>
            <Link to="/sobre" className="hover:text-foreground transition-colors">Sobre</Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Para Lojistas</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/lojista" className="hover:text-foreground transition-colors">Painel do Lojista</Link>
            <Link to="/cadastro-loja" className="hover:text-foreground transition-colors">Cadastre sua Loja</Link>
            <Link to="/planos" className="hover:text-foreground transition-colors">Planos</Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Contato</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Sua Cidade, BR</div>
            <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> contato@vitrine.com</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> (11) 99999-0000</div>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
        © 2026 Vitrine. Todos os direitos reservados.
      </div>
    </div>
  </footer>
);

export default Footer;
