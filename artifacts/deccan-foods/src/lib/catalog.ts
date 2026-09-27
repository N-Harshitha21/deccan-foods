import malnadMilletBiscuitsImage from '@assets/generated_images/malnad-millet-biscuits.png';
import filterKaapiCreamsImage from '@assets/generated_images/filter-kaapi-creams.png';
import nariyalCoconutCookiesImage from '@assets/generated_images/nariyal-coconut-cookies.png';
import godhumaRuskImage from '@assets/generated_images/godhuma-rusk.png';
import jowarSourdoughLoafImage from '@assets/generated_images/jowar-sourdough-loaf.png';
import pudinaPocketMintsImage from '@assets/generated_images/pudina-pocket-mints.png';
import gingerLimeMintsImage from '@assets/generated_images/ginger-lime-mints.png';
import elaneerMilkBunImage from '@assets/generated_images/elaneer-milk-bun.png';

export type ProductCategory = 'Biscuits' | 'Breads' | 'Mints';
export type ProductState =
  | 'Karnataka'
  | 'Kerala'
  | 'Tamil Nadu'
  | 'Andhra Pradesh'
  | 'Telangana';

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  state: ProductState;
  description: string;
  price: number;
  compareAt?: number;
  packSize: string;
  availability: 'In stock' | 'Low stock' | 'Sold out';
  ingredients: string;
  allergens: string;
  visual: string;
  initials: string;
  image: string;
  featured?: boolean;
};

export type CartLine = { productId: string; quantity: number };

export type Order = {
  id: string;
  createdAt: string;
  status: 'Confirmed' | 'Preparing' | 'Out for delivery' | 'Delivered';
  customer: { name: string; email: string; phone: string };
  address: { line: string; city: string; state: string; pincode: string };
  slot: string;
  items: Array<CartLine & { name: string; price: number; packSize: string }>;
  subtotal: number;
  delivery: number;
  total: number;
};

export const products: Product[] = [
  {
    id: 'malnad-millet-biscuits',
    name: 'Malnad Millet Biscuits',
    category: 'Biscuits',
    state: 'Karnataka',
    description: 'A crisp, gently sweet biscuit baked with ragi from the misty Malnad hills.',
    price: 85,
    compareAt: 95,
    packSize: '200 g',
    availability: 'In stock',
    ingredients: 'Ragi flour, wheat flour, jaggery, coconut oil, cardamom.',
    allergens: 'Contains wheat (gluten). Made in a facility that handles nuts.',
    visual: 'from-[#e9ba55] via-[#d98d32] to-[#a54a2c]',
    initials: 'MM',
    image: malnadMilletBiscuitsImage,
    featured: true,
  },
  {
    id: 'filter-kaapi-creams',
    name: 'Filter Kaapi Creams',
    category: 'Biscuits',
    state: 'Tamil Nadu',
    description: 'Buttery sandwich biscuits with a fragrant South Indian coffee cream.',
    price: 110,
    packSize: '180 g',
    availability: 'In stock',
    ingredients: 'Wheat flour, sugar, butter, coffee, milk solids, cocoa.',
    allergens: 'Contains wheat (gluten) and milk.',
    visual: 'from-[#b46a3a] via-[#713d2c] to-[#392c2c]',
    initials: 'FC',
    image: filterKaapiCreamsImage,
    featured: true,
  },
  {
    id: 'nariyal-coconut-cookies',
    name: 'Nariyal Coconut Cookies',
    category: 'Biscuits',
    state: 'Kerala',
    description: 'Toasty coconut, a touch of sea salt, and a crumbly coastal bite.',
    price: 95,
    packSize: '180 g',
    availability: 'Low stock',
    ingredients: 'Wheat flour, desiccated coconut, cane sugar, butter, sea salt.',
    allergens: 'Contains wheat (gluten) and milk.',
    visual: 'from-[#ead99d] via-[#c5a25e] to-[#7c6a3a]',
    initials: 'NC',
    image: nariyalCoconutCookiesImage,
    featured: true,
  },
  {
    id: 'godhuma-rusk',
    name: 'Godhuma Rusk',
    category: 'Breads',
    state: 'Andhra Pradesh',
    description: 'Twice-baked wheat rusks made for evening chai and long conversations.',
    price: 70,
    packSize: '250 g',
    availability: 'In stock',
    ingredients: 'Wheat flour, sugar, vegetable oil, yeast, salt.',
    allergens: 'Contains wheat (gluten).',
    visual: 'from-[#e5b668] via-[#bc7337] to-[#70402b]',
    initials: 'GR',
    image: godhumaRuskImage,
    featured: true,
  },
  {
    id: 'jowar-sourdough-loaf',
    name: 'Jowar Sourdough Loaf',
    category: 'Breads',
    state: 'Telangana',
    description: 'A slow-fermented loaf with earthy jowar and a delicate crackle.',
    price: 145,
    packSize: '400 g',
    availability: 'Low stock',
    ingredients: 'Jowar flour, wheat flour, sourdough starter, water, salt.',
    allergens: 'Contains wheat (gluten).',
    visual: 'from-[#ab7a4d] via-[#6f553e] to-[#333831]',
    initials: 'JS',
    image: jowarSourdoughLoafImage,
    featured: true,
  },
  {
    id: 'pudina-mints',
    name: 'Pudina Pocket Mints',
    category: 'Mints',
    state: 'Karnataka',
    description: 'Cool peppermint and fresh pudina in a pocket-sized tin.',
    price: 45,
    packSize: '35 g',
    availability: 'In stock',
    ingredients: 'Sugar, peppermint oil, pudina extract, natural colour.',
    allergens: 'No known allergens.',
    visual: 'from-[#aecb91] via-[#4b8a65] to-[#155344]',
    initials: 'PM',
    image: pudinaPocketMintsImage,
  },
  {
    id: 'ginger-lime-mints',
    name: 'Ginger Lime Mints',
    category: 'Mints',
    state: 'Kerala',
    description: 'Bright lime oils meet warm ginger for a clean finish after every meal.',
    price: 50,
    packSize: '35 g',
    availability: 'In stock',
    ingredients: 'Sugar, ginger extract, lime oil, citric acid.',
    allergens: 'No known allergens.',
    visual: 'from-[#d9df87] via-[#92a949] to-[#367159]',
    initials: 'GL',
    image: gingerLimeMintsImage,
  },
  {
    id: 'elaneer-bun',
    name: 'Elaneer Milk Bun',
    category: 'Breads',
    state: 'Tamil Nadu',
    description: 'Soft milk buns with tender coconut sweetness, made for breakfast tables.',
    price: 120,
    packSize: '6 pieces',
    availability: 'Sold out',
    ingredients: 'Wheat flour, milk, tender coconut, sugar, butter, yeast.',
    allergens: 'Contains wheat (gluten) and milk.',
    visual: 'from-[#f1d5ac] via-[#c18b5c] to-[#80513c]',
    initials: 'EB',
    image: elaneerMilkBunImage,
  },
];

export const states: ProductState[] = [
  'Karnataka',
  'Kerala',
  'Tamil Nadu',
  'Andhra Pradesh',
  'Telangana',
];

const CART_KEY = 'deccan-foods-cart';
const ORDERS_KEY = 'deccan-foods-orders';

export function readCart(): CartLine[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]') as CartLine[];
  } catch {
    return [];
  }
}

export function writeCart(cart: CartLine[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('deccan-cart-change'));
}

export function readOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]') as Order[];
  } catch {
    return [];
  }
}

export function writeOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

// Shopify Storefront API readiness: this catalogue mirrors product/variant fields,
// and checkout keeps cart lines separate so the API adapter can replace this layer.
export const shopifyProductMapping = {
  productId: 'id',
  title: 'name',
  productType: 'category',
  variants: [{ price: 'price', weight: 'packSize', availableForSale: 'availability' }],
};

export function money(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}
