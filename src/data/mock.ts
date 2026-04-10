export interface Store {
  id: string;
  name: string;
  logo: string;
  banner: string;
  description: string;
  address: string;
  phone: string;
  rating: number;
  productsCount: number;
  category: string;
  isActive: boolean;
  plan: 'basic' | 'intermediate' | 'premium';
  planLimit: number;
}

export interface Product {
  id: string;
  storeId: string;
  storeName: string;
  name: string;
  description: string;
  price: number;
  promoPrice?: number;
  category: string;
  categoryId: string;
  image: string;
  images: string[];
  stock: number;
  sold: number;
  isActive: boolean;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  deliveryTime: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: { product: Product; quantity: number; storeId: string }[];
  total: number;
  status: 'pending' | 'paid' | 'preparing' | 'ready' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'pix' | 'credit_card';
  createdAt: string;
  deliveryMethod: 'delivery' | 'pickup';
}

export const categories: Category[] = [
  { id: 'moda', name: 'Moda', icon: '👗', count: 142 },
  { id: 'eletronicos', name: 'Eletrônicos', icon: '📱', count: 89 },
  { id: 'casa', name: 'Casa & Decoração', icon: '🏠', count: 76 },
  { id: 'cozinha', name: 'Cozinha', icon: '🍳', count: 64 },
  { id: 'cama-mesa-banho', name: 'Cama, Mesa & Banho', icon: '🛏️', count: 58 },
  { id: 'beleza', name: 'Beleza', icon: '💄', count: 63 },
  { id: 'esporte', name: 'Esporte', icon: '⚽', count: 54 },
  { id: 'alimentacao', name: 'Alimentação', icon: '🍕', count: 98 },
  { id: 'livros', name: 'Livros', icon: '📚', count: 45 },
  { id: 'pet-shop', name: 'Pet Shop', icon: '🐾', count: 37 },
  { id: 'brinquedos', name: 'Brinquedos', icon: '🧸', count: 29 },
  { id: 'ferramentas', name: 'Ferramentas', icon: '🔧', count: 22 },
];

export const stores: Store[] = [
  { id: 's1', name: 'Moda Bella', logo: '', banner: '', description: 'Roupas femininas e acessórios', address: 'Rua das Flores, 123', phone: '(11) 99999-1111', rating: 4.8, productsCount: 28, category: 'Moda', isActive: true, plan: 'premium', planLimit: 100 },
  { id: 's2', name: 'TechZone', logo: '', banner: '', description: 'Eletrônicos e acessórios', address: 'Av. Central, 456', phone: '(11) 99999-2222', rating: 4.6, productsCount: 45, category: 'Eletrônicos', isActive: true, plan: 'premium', planLimit: 100 },
  { id: 's3', name: 'Casa Viva', logo: '', banner: '', description: 'Decoração, cozinha e utilidades domésticas', address: 'Rua da Paz, 789', phone: '(11) 99999-3333', rating: 4.7, productsCount: 22, category: 'Casa & Decoração', isActive: true, plan: 'intermediate', planLimit: 50 },
  { id: 's4', name: 'Sabor da Terra', logo: '', banner: '', description: 'Produtos artesanais e gourmet', address: 'Praça Central, 10', phone: '(11) 99999-4444', rating: 4.9, productsCount: 18, category: 'Alimentação', isActive: true, plan: 'basic', planLimit: 30 },
  { id: 's5', name: 'Bella Pele', logo: '', banner: '', description: 'Cosméticos e cuidados pessoais', address: 'Rua dos Ipês, 55', phone: '(11) 99999-5555', rating: 4.5, productsCount: 30, category: 'Beleza', isActive: true, plan: 'intermediate', planLimit: 50 },
  { id: 's6', name: 'SportFit', logo: '', banner: '', description: 'Artigos esportivos e fitness', address: 'Av. Atlética, 200', phone: '(11) 99999-6666', rating: 4.4, productsCount: 15, category: 'Esporte', isActive: true, plan: 'basic', planLimit: 30 },
  { id: 's7', name: 'Conforto & Cia', logo: '', banner: '', description: 'Cama, mesa, banho e conforto para o lar', address: 'Rua do Comércio, 88', phone: '(11) 99999-7777', rating: 4.7, productsCount: 20, category: 'Cama, Mesa & Banho', isActive: true, plan: 'intermediate', planLimit: 50 },
  { id: 's8', name: 'Chef em Casa', logo: '', banner: '', description: 'Utensílios e acessórios de cozinha', address: 'Rua Gastronômica, 42', phone: '(11) 99999-8888', rating: 4.6, productsCount: 25, category: 'Cozinha', isActive: true, plan: 'intermediate', planLimit: 50 },
];

const imgs = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
  'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400',
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
  'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=400',
  'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400',
  'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400',
  'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
];

// Imagens extras por categoria
const kitchenImgs = [
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
  'https://images.unsplash.com/photo-1584990347449-a4c5a3e715e3?w=400',
  'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=400',
  'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400',
];

const bedBathImgs = [
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',
  'https://images.unsplash.com/photo-1616627561950-9f746e330187?w=400',
  'https://images.unsplash.com/photo-1609766418204-94aae0ecba6c?w=400',
];

const homeImgs = [
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
  'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
];

export const products: Product[] = [
  // === MODA ===
  { id: 'p1', storeId: 's1', storeName: 'Moda Bella', name: 'Vestido Floral Primavera', description: 'Vestido leve e elegante com estampa floral, perfeito para o dia a dia.', price: 189.90, promoPrice: 149.90, category: 'Moda', categoryId: 'moda', image: imgs[0], images: [imgs[0]], stock: 15, sold: 42, isActive: true, deliveryAvailable: true, pickupAvailable: true, deliveryTime: '2-3 dias', createdAt: '2026-04-01' },
  { id: 'p7', storeId: 's1', storeName: 'Moda Bella', name: 'Bolsa Couro Ecológico', description: 'Bolsa espaçosa em couro ecológico com design sofisticado.', price: 219.90, category: 'Moda', categoryId: 'moda', image: imgs[2], images: [imgs[2]], stock: 7, sold: 29, isActive: true, deliveryAvailable: true, pickupAvailable: true, deliveryTime: '2-3 dias', createdAt: '2026-04-04' },

  // === ELETRÔNICOS ===
  { id: 'p2', storeId: 's2', storeName: 'TechZone', name: 'Fone Bluetooth Premium', description: 'Fone sem fio com cancelamento de ruído ativo e bateria de longa duração.', price: 299.90, category: 'Eletrônicos', categoryId: 'eletronicos', image: imgs[7], images: [imgs[7]], stock: 30, sold: 87, isActive: true, deliveryAvailable: true, pickupAvailable: true, deliveryTime: '1-2 dias', createdAt: '2026-03-28' },
  { id: 'p8', storeId: 's2', storeName: 'TechZone', name: 'Smartwatch Fitness', description: 'Relógio inteligente com monitor cardíaco e GPS integrado.', price: 599.90, promoPrice: 499.90, category: 'Eletrônicos', categoryId: 'eletronicos', image: imgs[0], images: [imgs[0]], stock: 25, sold: 63, isActive: true, deliveryAvailable: true, pickupAvailable: true, deliveryTime: '1-2 dias', createdAt: '2026-03-25' },

  // === CASA & DECORAÇÃO ===
  { id: 'p3', storeId: 's3', storeName: 'Casa Viva', name: 'Vaso Decorativo Cerâmica', description: 'Vaso artesanal em cerâmica com acabamento rústico.', price: 89.90, promoPrice: 69.90, category: 'Casa & Decoração', categoryId: 'casa', image: imgs[8], images: [imgs[8]], stock: 8, sold: 23, isActive: true, deliveryAvailable: true, pickupAvailable: false, deliveryTime: '3-5 dias', createdAt: '2026-04-02' },
  { id: 'p9', storeId: 's3', storeName: 'Casa Viva', name: 'Luminária Pendente Industrial', description: 'Luminária com design industrial em metal e vidro.', price: 179.90, category: 'Casa & Decoração', categoryId: 'casa', image: imgs[4], images: [imgs[4]], stock: 5, sold: 14, isActive: true, deliveryAvailable: true, pickupAvailable: false, deliveryTime: '3-5 dias', createdAt: '2026-04-06' },
  { id: 'p20', storeId: 's3', storeName: 'Casa Viva', name: 'Tapete Geométrico Sala', description: 'Tapete decorativo com estampa geométrica moderna para sala de estar. 150x200cm.', price: 259.90, promoPrice: 199.90, category: 'Casa & Decoração', categoryId: 'casa', image: homeImgs[0], images: [homeImgs[0]], stock: 6, sold: 31, isActive: true, deliveryAvailable: true, pickupAvailable: false, deliveryTime: '3-5 dias', createdAt: '2026-04-03' },
  { id: 'p21', storeId: 's3', storeName: 'Casa Viva', name: 'Almofada Veludo Premium', description: 'Almofada decorativa em veludo com enchimento de silicone. 45x45cm.', price: 69.90, category: 'Casa & Decoração', categoryId: 'casa', image: homeImgs[1], images: [homeImgs[1]], stock: 20, sold: 45, isActive: true, deliveryAvailable: true, pickupAvailable: true, deliveryTime: '2-3 dias', createdAt: '2026-04-05' },
  { id: 'p22', storeId: 's3', storeName: 'Casa Viva', name: 'Sofá Retrátil 3 Lugares', description: 'Sofá retrátil e reclinável em tecido suede. Conforto premium para sua sala.', price: 1899.90, promoPrice: 1499.90, category: 'Casa & Decoração', categoryId: 'casa', image: homeImgs[2], images: [homeImgs[2]], stock: 3, sold: 8, isActive: true, deliveryAvailable: true, pickupAvailable: false, deliveryTime: '5-10 dias', createdAt: '2026-04-01' },

  // === COZINHA ===
  { id: 'p13', storeId: 's8', storeName: 'Chef em Casa', name: 'Jogo de Talheres Inox 24pç', description: 'Conjunto completo de talheres em aço inoxidável com acabamento polido. Inclui garfos, facas, colheres e colheres de sobremesa.', price: 129.90, promoPrice: 99.90, category: 'Cozinha', categoryId: 'cozinha', image: kitchenImgs[0], images: [kitchenImgs[0]], stock: 20, sold: 65, isActive: true, deliveryAvailable: true, pickupAvailable: true, deliveryTime: '2-3 dias', createdAt: '2026-04-02' },
  { id: 'p14', storeId: 's8', storeName: 'Chef em Casa', name: 'Panela Antiaderente Premium', description: 'Panela com revestimento cerâmico antiaderente, tampa de vidro e cabo ergonômico. 24cm.', price: 189.90, category: 'Cozinha', categoryId: 'cozinha', image: kitchenImgs[1], images: [kitchenImgs[1]], stock: 15, sold: 38, isActive: true, deliveryAvailable: true, pickupAvailable: true, deliveryTime: '2-3 dias', createdAt: '2026-04-03' },
  { id: 'p15', storeId: 's8', storeName: 'Chef em Casa', name: 'Garfo de Churrasco Inox', description: 'Garfo trinchante em aço inox com cabo de madeira nobre. Ideal para churrascos e assados.', price: 49.90, category: 'Cozinha', categoryId: 'cozinha', image: kitchenImgs[2], images: [kitchenImgs[2]], stock: 30, sold: 92, isActive: true, deliveryAvailable: true, pickupAvailable: true, deliveryTime: '1-2 dias', createdAt: '2026-04-05' },
  { id: 'p16', storeId: 's8', storeName: 'Chef em Casa', name: 'Jogo de Potes Herméticos 10pç', description: 'Kit com 10 potes herméticos em vidro temperado com tampa de bambu. Ideal para organização da cozinha.', price: 159.90, promoPrice: 119.90, category: 'Cozinha', categoryId: 'cozinha', image: kitchenImgs[3], images: [kitchenImgs[3]], stock: 12, sold: 47, isActive: true, deliveryAvailable: true, pickupAvailable: true, deliveryTime: '2-3 dias', createdAt: '2026-04-04' },

  // === CAMA, MESA & BANHO ===
  { id: 'p17', storeId: 's7', storeName: 'Conforto & Cia', name: 'Edredom King Plumas', description: 'Edredom king size com enchimento de plumas sintéticas. Ultra macio e quentinho. 260x280cm.', price: 349.90, promoPrice: 279.90, category: 'Cama, Mesa & Banho', categoryId: 'cama-mesa-banho', image: bedBathImgs[0], images: [bedBathImgs[0]], stock: 10, sold: 55, isActive: true, deliveryAvailable: true, pickupAvailable: true, deliveryTime: '2-4 dias', createdAt: '2026-04-01' },
  { id: 'p18', storeId: 's7', storeName: 'Conforto & Cia', name: 'Jogo de Cama Casal 400 fios', description: 'Jogo de cama casal em algodão egípcio 400 fios. Inclui lençol, fronhas e capa.', price: 299.90, category: 'Cama, Mesa & Banho', categoryId: 'cama-mesa-banho', image: bedBathImgs[1], images: [bedBathImgs[1]], stock: 8, sold: 33, isActive: true, deliveryAvailable: true, pickupAvailable: true, deliveryTime: '2-3 dias', createdAt: '2026-04-03' },
  { id: 'p19', storeId: 's7', storeName: 'Conforto & Cia', name: 'Toalha de Banho Felpuda', description: 'Toalha de banho 100% algodão, extra macia e absorvente. 70x140cm.', price: 59.90, promoPrice: 44.90, category: 'Cama, Mesa & Banho', categoryId: 'cama-mesa-banho', image: bedBathImgs[2], images: [bedBathImgs[2]], stock: 40, sold: 120, isActive: true, deliveryAvailable: true, pickupAvailable: true, deliveryTime: '1-2 dias', createdAt: '2026-04-06' },
  { id: 'p23', storeId: 's7', storeName: 'Conforto & Cia', name: 'Jogo Americano Mesa 6pç', description: 'Kit com 6 jogos americanos em tecido impermeável com design moderno. Perfeito para mesa de jantar.', price: 89.90, category: 'Cama, Mesa & Banho', categoryId: 'cama-mesa-banho', image: bedBathImgs[3], images: [bedBathImgs[3]], stock: 15, sold: 28, isActive: true, deliveryAvailable: true, pickupAvailable: true, deliveryTime: '2-3 dias', createdAt: '2026-04-07' },

  // === ALIMENTAÇÃO ===
  { id: 'p4', storeId: 's4', storeName: 'Sabor da Terra', name: 'Kit Gourmet Artesanal', description: 'Cesta com queijos, geleias e pães artesanais da região.', price: 159.90, category: 'Alimentação', categoryId: 'alimentacao', image: imgs[9], images: [imgs[9]], stock: 12, sold: 56, isActive: true, deliveryAvailable: true, pickupAvailable: true, deliveryTime: '1 dia', createdAt: '2026-04-05' },
  { id: 'p11', storeId: 's4', storeName: 'Sabor da Terra', name: 'Café Especial Torrado 250g', description: 'Café 100% arábica de produção local, torra média.', price: 45.90, category: 'Alimentação', categoryId: 'alimentacao', image: imgs[3], images: [imgs[3]], stock: 50, sold: 120, isActive: true, deliveryAvailable: true, pickupAvailable: true, deliveryTime: '1 dia', createdAt: '2026-04-01' },

  // === BELEZA ===
  { id: 'p5', storeId: 's5', storeName: 'Bella Pele', name: 'Kit Skincare Completo', description: 'Kit com limpeza, tônico, sérum e hidratante facial.', price: 249.90, promoPrice: 199.90, category: 'Beleza', categoryId: 'beleza', image: imgs[10], images: [imgs[10], imgs[11]], stock: 20, sold: 34, isActive: true, deliveryAvailable: true, pickupAvailable: true, deliveryTime: '2-3 dias', createdAt: '2026-04-03' },
  { id: 'p10', storeId: 's5', storeName: 'Bella Pele', name: 'Perfume Floral 100ml', description: 'Fragrância floral delicada com notas de jasmim e rosa.', price: 189.90, category: 'Beleza', categoryId: 'beleza', image: imgs[6], images: [imgs[6]], stock: 18, sold: 41, isActive: true, deliveryAvailable: true, pickupAvailable: true, deliveryTime: '1-2 dias', createdAt: '2026-04-07' },

  // === ESPORTE ===
  { id: 'p6', storeId: 's6', storeName: 'SportFit', name: 'Tênis Running Pro', description: 'Tênis de corrida com amortecimento avançado e design leve.', price: 399.90, promoPrice: 329.90, category: 'Esporte', categoryId: 'esporte', image: imgs[5], images: [imgs[5]], stock: 10, sold: 18, isActive: true, deliveryAvailable: true, pickupAvailable: true, deliveryTime: '2-4 dias', createdAt: '2026-03-30' },
  { id: 'p12', storeId: 's6', storeName: 'SportFit', name: 'Garrafa Térmica 750ml', description: 'Garrafa em aço inox com isolamento térmico de 24h.', price: 79.90, promoPrice: 59.90, category: 'Esporte', categoryId: 'esporte', image: imgs[1], images: [imgs[1]], stock: 35, sold: 78, isActive: true, deliveryAvailable: true, pickupAvailable: true, deliveryTime: '1-2 dias', createdAt: '2026-03-29' },
];

// Helper: buscar categoria pelo ID
export const getCategoryById = (id: string): Category | undefined =>
  categories.find(c => c.id === id);

// Helper: buscar produtos por categoryId
export const getProductsByCategory = (categoryId: string): Product[] =>
  products.filter(p => p.categoryId === categoryId);

// Helper: buscar categoria pelo nome
export const getCategoryByName = (name: string): Category | undefined =>
  categories.find(c => c.name === name);

export const orders: Order[] = [
  { id: 'ORD-001', customerId: 'c1', customerName: 'Maria Silva', items: [{ product: products[0], quantity: 1, storeId: 's1' }, { product: products[12], quantity: 2, storeId: 's4' }], total: 469.70, status: 'delivered', paymentMethod: 'pix', createdAt: '2026-04-06', deliveryMethod: 'delivery' },
  { id: 'ORD-002', customerId: 'c2', customerName: 'João Santos', items: [{ product: products[2], quantity: 1, storeId: 's2' }], total: 299.90, status: 'preparing', paymentMethod: 'credit_card', createdAt: '2026-04-07', deliveryMethod: 'pickup' },
  { id: 'ORD-003', customerId: 'c3', customerName: 'Ana Oliveira', items: [{ product: products[14], quantity: 1, storeId: 's5' }, { product: products[16], quantity: 1, storeId: 's6' }], total: 529.80, status: 'paid', paymentMethod: 'pix', createdAt: '2026-04-08', deliveryMethod: 'delivery' },
  { id: 'ORD-004', customerId: 'c4', customerName: 'Carlos Lima', items: [{ product: products[3], quantity: 1, storeId: 's2' }], total: 499.90, status: 'pending', paymentMethod: 'credit_card', createdAt: '2026-04-08', deliveryMethod: 'delivery' },
  { id: 'ORD-005', customerId: 'c5', customerName: 'Fernanda Costa', items: [{ product: products[13], quantity: 3, storeId: 's4' }], total: 137.70, status: 'ready', paymentMethod: 'pix', createdAt: '2026-04-07', deliveryMethod: 'pickup' },
];
