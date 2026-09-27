import { type ChangeEvent, type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  CreditCard,
  Leaf,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { Link, Route, Switch, useLocation, useParams, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  type CartLine,
  type Order,
  type Product,
  type ProductCategory,
  type ProductState,
  money,
  products,
  readCart,
  readOrders,
  states,
  writeCart,
  writeOrders,
} from '@/lib/catalog';

const queryClient = new QueryClient();

function ProductVisual({ product, large = false }: { product: Product; large?: boolean }) {
  return (
    <div
      className={`relative isolate overflow-hidden bg-gradient-to-br ${product.visual} ${
        large ? 'min-h-[340px] sm:min-h-[460px]' : 'aspect-[1.12] min-h-[190px]'
      }`}
      data-testid={`visual-product-${product.id}`}
    >
      <img
        src={product.image}
        alt={product.name}
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        loading={large ? 'eager' : 'lazy'}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#163d30]/90 via-[#163d30]/5 to-transparent" />
      <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full border-[18px] border-white/10" />
      <div className="absolute -bottom-20 -left-8 h-44 w-44 rounded-full border-[20px] border-black/10" />
      <div className="absolute left-5 top-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">
        <span className="h-1.5 w-1.5 rounded-full bg-[#f2c34f]" />
        Deccan Foods
      </div>
      <div className="absolute bottom-5 left-5 right-5">
        <p className="max-w-[240px] font-display text-2xl font-semibold leading-[0.95] tracking-[-0.05em] text-white sm:text-3xl">
          {product.name}
        </p>
        <div className="mt-2 max-w-[240px] border-l border-white/40 pl-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white/80">
          {product.packSize} · {product.state}
        </div>
      </div>
      {large && (
        <div className="absolute right-5 top-5 rounded-full bg-[#f2c34f] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#153f32]">
          From {product.state}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (product: Product) => void }) {
  const unavailable = product.availability === 'Sold out';
  return (
    <article className="group overflow-hidden rounded-[1.25rem] border border-[#d9d0bc] bg-[#fdfbf5] shadow-[0_8px_24px_rgba(22,61,48,.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(22,61,48,.12)]" data-testid={`card-product-${product.id}`}>
      <Link href={`/products/${product.id}`} className="block">
        <ProductVisual product={product} />
      </Link>
      <div className="p-5">
        <div className="mb-2 flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#758072]">
          <span>{product.category}</span>
          <span className={product.availability === 'Low stock' ? 'text-[#b46134]' : product.availability === 'Sold out' ? 'text-[#aa3e35]' : 'text-[#398061]'}>{product.availability}</span>
        </div>
        <Link href={`/products/${product.id}`} className="block">
          <h3 className="font-display text-[1.35rem] font-semibold leading-tight text-[#163d30] transition group-hover:text-[#af692f]" data-testid={`text-product-${product.id}`}>{product.name}</h3>
          <p className="mt-2 text-sm text-[#687268]">{product.packSize}</p>
        </Link>
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="font-mono text-lg font-medium text-[#163d30]" data-testid={`text-price-${product.id}`}>{money(product.price)}</span>
          <button type="button" disabled={unavailable} onClick={() => onAdd(product)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#163d30] px-4 text-xs font-bold uppercase tracking-[0.1em] text-[#fffaf0] transition hover:bg-[#af692f] disabled:cursor-not-allowed disabled:bg-[#c7c3b8]" data-testid={`button-add-product-${product.id}`}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Add
          </button>
        </div>
      </div>
    </article>
  );
}

function useCart() {
  const [cart, setCart] = useState<CartLine[]>(() => readCart());
  useEffect(() => {
    const sync = () => setCart(readCart());
    window.addEventListener('deccan-cart-change', sync);
    return () => window.removeEventListener('deccan-cart-change', sync);
  }, []);
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cart.reduce((sum, line) => {
    const product = products.find((item) => item.id === line.productId);
    return sum + (product?.price || 0) * line.quantity;
  }, 0);
  return { cart, count, subtotal };
}

function Header() {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-[#d9d0bc]/80 bg-[#f8f5ed]/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-3" data-testid="link-home-logo">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#163d30] text-[#f2c34f]">
            <Leaf className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="leading-none">
            <span className="block font-display text-[1.3rem] font-bold tracking-[-0.04em] text-[#163d30]">Deccan</span>
            <span className="block text-[9px] font-bold uppercase tracking-[0.28em] text-[#af692f]">Foods · since 1987</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          <Link href="/products" className="text-sm font-semibold text-[#435648] transition hover:text-[#af692f]" data-testid="link-products">Shop all</Link>
          <Link href="/products?category=Breads" className="text-sm font-semibold text-[#435648] transition hover:text-[#af692f]" data-testid="link-breads">Breads</Link>
          <Link href="/products?category=Biscuits" className="text-sm font-semibold text-[#435648] transition hover:text-[#af692f]" data-testid="link-biscuits">Biscuits</Link>
          <Link href="/orders" className="text-sm font-semibold text-[#435648] transition hover:text-[#af692f]" data-testid="link-orders">Your orders</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/cart" className="relative grid h-11 w-11 place-items-center rounded-full text-[#163d30] transition hover:bg-[#ebe3d3]" aria-label={`Cart with ${count} items`} data-testid="link-cart">
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            {count > 0 && <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-[#f2c34f] px-1 text-[10px] font-bold text-[#163d30]" data-testid="text-cart-count">{count}</span>}
          </Link>
          <button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-[#d9d0bc] md:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle menu" data-testid="button-toggle-menu">
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <span className="text-lg">≡</span>}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav className="border-t border-[#d9d0bc] bg-[#f8f5ed] px-5 py-4 md:hidden" aria-label="Mobile navigation">
          <div className="flex flex-col gap-4">
            <Link href="/products" onClick={() => setMenuOpen(false)} className="font-semibold text-[#163d30]" data-testid="mobile-link-products">Shop all</Link>
            <Link href="/orders" onClick={() => setMenuOpen(false)} className="font-semibold text-[#163d30]" data-testid="mobile-link-orders">Your orders</Link>
          </div>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24 bg-[#163d30] px-5 py-12 text-[#f8f5ed] lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f2c34f] text-[#163d30]"><Leaf className="h-5 w-5" aria-hidden="true" /></span>
            <span className="font-display text-2xl font-semibold">Deccan Foods</span>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-6 text-[#c9d3c4]">Good things from five southern states, packed for the pantry you come home to.</p>
        </div>
        <div>
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f2c34f]">Explore</p>
          <div className="flex flex-col gap-3 text-sm text-[#e2e8df]">
            <Link href="/products" className="hover:text-[#f2c34f]">All products</Link>
            <Link href="/products?category=Breads" className="hover:text-[#f2c34f]">Breads</Link>
            <Link href="/products?category=Mints" className="hover:text-[#f2c34f]">Pocket mints</Link>
          </div>
        </div>
        <div>
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f2c34f]">A small promise</p>
          <p className="text-sm leading-6 text-[#c9d3c4]">No shortcuts on flavour. No fuss at checkout. Delivered to your door.</p>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-[#47705b] pt-5 text-xs text-[#9eb3a0]">© 2025 Deccan Foods · Made for everyday South Indian tables</div>
    </footer>
  );
}

function Shell({ children, notice }: { children: ReactNode; notice?: string }) {
  return (
    <div className="df-grain min-h-[100dvh] bg-[#f8f5ed] text-[#163d30]">
      <Header />
      {notice && <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#163d30] px-5 py-3 text-sm font-semibold text-[#f8f5ed] shadow-xl" role="status" data-testid="status-toast"><Check className="h-4 w-4 text-[#f2c34f]" aria-hidden="true" />{notice}</div>}
      {children}
      <Footer />
    </div>
  );
}

function Home({ onAdd }: { onAdd: (product: Product) => void }) {
  const featured = products.filter((product) => product.featured).slice(0, 4);
  return (
    <>
      <main>
        <section className="relative overflow-hidden bg-[#163d30] px-5 pb-16 pt-14 text-[#f8f5ed] lg:px-8 lg:pb-24 lg:pt-20">
          <div className="absolute -right-24 -top-28 h-[520px] w-[520px] rounded-full border-[60px] border-[#2a5b45] opacity-70" />
          <div className="absolute bottom-[-240px] left-[38%] h-[460px] w-[460px] rounded-full border-[70px] border-[#214d3b]" />
          <div className="relative mx-auto grid max-w-7xl items-end gap-12 lg:grid-cols-[1.08fr_.92fr]">
            <div className="df-rise">
              <div className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#f2c34f]"><span className="h-px w-10 bg-[#f2c34f]" /> Pantry stories from the Deccan</div>
              <h1 className="max-w-3xl font-display text-[3.7rem] font-semibold leading-[.91] tracking-[-0.07em] sm:text-7xl lg:text-[7.2rem]">A little<br /><em className="font-normal text-[#f2c34f]">South</em> in<br />every bite.</h1>
              <p className="mt-8 max-w-md text-base leading-7 text-[#cbd7cb]">Bakes, breads and after-meal rituals rooted in the homes and high streets of southern India.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/products" className="inline-flex min-h-12 items-center gap-3 rounded-full bg-[#f2c34f] px-6 text-sm font-bold text-[#163d30] transition hover:bg-[#ffe08a]" data-testid="link-hero-shop">Shop the pantry <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                <Link href="/products?category=Breads" className="inline-flex min-h-12 items-center rounded-full border border-[#75947f] px-6 text-sm font-bold text-[#f8f5ed] transition hover:border-[#f2c34f] hover:text-[#f2c34f]" data-testid="link-hero-breads">Find your bread</Link>
              </div>
            </div>
            <div className="relative df-rise df-rise-delay-2">
              <div className="relative mx-auto max-w-[440px] rotate-2 overflow-hidden rounded-[2rem] border border-[#76927b] bg-gradient-to-br from-[#c58b3f] via-[#7e4d32] to-[#243d32] p-6 shadow-2xl">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#f2c34f 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                <div className="relative flex min-h-[380px] flex-col justify-between rounded-[1.4rem] border border-white/30 p-6">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white/80"><span>Est. 1987</span><span>Batch no. 05</span></div>
                  <div><div className="font-display text-[5rem] font-semibold leading-[.8] tracking-[-0.08em] text-[#f7df91]">BITE</div><div className="mt-1 font-display text-[5rem] font-semibold leading-[.8] tracking-[-0.08em] text-white">LOCAL</div><p className="mt-7 max-w-[220px] text-xs uppercase leading-5 tracking-[0.18em] text-white/75">Small batch pantry favourites from five states.</p></div>
                  <div className="flex items-center justify-between border-t border-white/30 pt-4 text-xs text-white/80"><span>deccanfoods.in</span><Leaf className="h-5 w-5 text-[#f2c34f]" aria-hidden="true" /></div>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-3 rounded-2xl bg-[#f2c34f] px-4 py-3 text-xs font-bold text-[#163d30] shadow-lg"><span className="block font-mono text-xl">05</span><span className="uppercase tracking-[0.13em]">states, one table</span></div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#af692f]">What’s on the table</p><h2 className="font-display text-4xl font-semibold tracking-[-0.05em] text-[#163d30] sm:text-5xl">Pick a mood.<br /><span className="text-[#af692f]">We’ll bring the bite.</span></h2></div>
            <Link href="/products" className="inline-flex items-center gap-2 text-sm font-bold text-[#163d30] underline decoration-[#f2c34f] decoration-4 underline-offset-4" data-testid="link-home-all-products">See all pantry picks <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { name: 'Biscuits', copy: 'For the 4 pm pause.', category: 'Biscuits', color: 'bg-[#d4863e]' },
              { name: 'Breads', copy: 'For slow mornings.', category: 'Breads', color: 'bg-[#587c65]' },
              { name: 'Mints', copy: 'For the clean finish.', category: 'Mints', color: 'bg-[#b9a84b]' },
            ].map((item, index) => (
              <Link key={item.name} href={`/products?category=${item.category}`} className={`group relative min-h-[250px] overflow-hidden rounded-[1.4rem] ${item.color} p-6 text-[#fffaf0] transition hover:-translate-y-1`} data-testid={`link-category-${item.category.toLowerCase()}`}>
                <div className="absolute -right-8 -top-12 h-52 w-52 rounded-full border-[28px] border-white/15 transition duration-500 group-hover:scale-110" />
                <div className="relative flex h-full flex-col justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/75">01 · {String(index + 1).padStart(2, '0')}</p><h3 className="mt-16 font-display text-4xl font-semibold tracking-[-0.05em]">{item.name}</h3></div><div className="flex items-center justify-between border-t border-white/30 pt-4 text-sm font-semibold"><span>{item.copy}</span><ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" aria-hidden="true" /></div></div>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-[#e9e3d4] px-5 py-16 lg:px-8 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#af692f]">The Deccan map</p><h2 className="font-display text-4xl font-semibold leading-none tracking-[-0.06em] text-[#163d30] sm:text-6xl">Good taste<br />travels well.</h2><p className="mt-6 max-w-sm text-sm leading-6 text-[#5d6b5e]">Every packet starts somewhere specific. Follow the flavours back to the state that made them.</p><Link href="/products" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#163d30]" data-testid="link-discover-states">Discover by state <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {states.map((state, index) => <Link key={state} href={`/products?state=${encodeURIComponent(state)}`} className="group flex min-h-[170px] flex-col justify-between rounded-2xl border border-[#cbc1ae] bg-[#f8f5ed] p-4 transition hover:border-[#163d30] hover:bg-[#163d30] hover:text-[#f8f5ed]" data-testid={`link-state-${state.toLowerCase().replaceAll(' ', '-')}`}><span className="font-mono text-xs text-[#af692f] group-hover:text-[#f2c34f]">0{index + 1}</span><span className="font-display text-xl font-semibold leading-tight">{state}</span><ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" /></Link>)}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
          <div className="flex items-end justify-between"><div><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#af692f]">Most loved this week</p><h2 className="font-display text-4xl font-semibold tracking-[-0.05em] text-[#163d30]">The good stuff.</h2></div><Link href="/products" className="hidden items-center gap-2 text-sm font-bold text-[#163d30] sm:flex" data-testid="link-featured-view-all">View all <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{featured.map((product, index) => <div key={product.id} className={`df-rise df-rise-delay-${Math.min(index + 1, 3)}`}><ProductCard product={product} onAdd={onAdd} /></div>)}</div>
        </section>
        <section className="mx-5 mb-10 overflow-hidden rounded-[1.8rem] bg-[#af692f] px-6 py-10 text-[#fffaf0] lg:mx-auto lg:max-w-7xl lg:px-12 lg:py-14"><div className="grid items-center gap-8 sm:grid-cols-[1fr_auto]"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f2d27c]">A pantry note</p><h2 className="mt-3 max-w-xl font-display text-4xl font-semibold leading-none tracking-[-0.05em] sm:text-5xl">The best snack is the one you didn’t have to think about.</h2></div><Link href="/products" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f8f5ed] px-6 text-sm font-bold text-[#163d30] transition hover:bg-[#f2c34f]" data-testid="link-banner-shop">Fill the pantry <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></section>
      </main>
    </>
  );
}

function ProductsPage({ onAdd }: { onAdd: (product: Product) => void }) {
  const params = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(params.get('q') || '');
  const [category, setCategory] = useState<ProductCategory | 'All'>((params.get('category') as ProductCategory) || 'All');
  const [state, setState] = useState<ProductState | 'All'>((params.get('state') as ProductState) || 'All');
  const [showFilters, setShowFilters] = useState(false);
  const filtered = useMemo(() => products.filter((product) => {
    const matchesSearch = `${product.name} ${product.description}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (category === 'All' || product.category === category) && (state === 'All' || product.state === state);
  }), [search, category, state]);
  return (
    <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <div className="border-b border-[#d9d0bc] pb-10"><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-[#af692f]">The pantry, opened</p><div className="flex flex-col justify-between gap-7 md:flex-row md:items-end"><h1 className="max-w-2xl font-display text-5xl font-semibold leading-[.95] tracking-[-0.07em] text-[#163d30] sm:text-7xl">Pick something<br /><span className="text-[#af692f]">properly good.</span></h1><p className="max-w-xs text-sm leading-6 text-[#657466]">Baked, blended and packed across the South. Browse by craving or by state.</p></div></div>
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex min-h-12 flex-1 items-center gap-3 rounded-full border border-[#d9d0bc] bg-[#fdfbf5] px-5 lg:max-w-md"><Search className="h-4 w-4 text-[#7e8a7e]" aria-hidden="true" /><span className="sr-only">Search products</span><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-[#92998e]" placeholder="Search biscuits, bread, mints…" data-testid="input-search-products" /></label>
        <button type="button" onClick={() => setShowFilters((shown) => !shown)} className="inline-flex min-h-12 items-center justify-between gap-3 rounded-full border border-[#d9d0bc] px-5 text-sm font-semibold lg:hidden" data-testid="button-toggle-filters">Filters <ChevronDown className={`h-4 w-4 transition ${showFilters ? 'rotate-180' : ''}`} aria-hidden="true" /></button>
        <div className={`${showFilters ? 'flex' : 'hidden'} flex-wrap gap-2 lg:flex`}>
          {(['All', 'Biscuits', 'Breads', 'Mints'] as const).map((item) => <button type="button" key={item} onClick={() => setCategory(item)} className={`min-h-11 rounded-full px-4 text-xs font-bold uppercase tracking-[0.1em] transition ${category === item ? 'bg-[#163d30] text-[#f8f5ed]' : 'border border-[#d9d0bc] text-[#637064] hover:border-[#163d30]'}`} data-testid={`button-category-${item.toLowerCase()}`}>{item}</button>)}
          <select value={state} onChange={(event) => setState(event.target.value as ProductState | 'All')} className="min-h-11 rounded-full border border-[#d9d0bc] bg-transparent px-4 text-xs font-bold uppercase tracking-[0.1em] text-[#637064] outline-none" aria-label="Filter by state" data-testid="select-state-filter"><option value="All">All states</option>{states.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        </div>
      </div>
      <div className="mt-10 flex items-center justify-between"><p className="text-sm text-[#657466]" data-testid="text-product-count"><span className="font-bold text-[#163d30]">{filtered.length}</span> pantry picks</p><div className="hidden items-center gap-2 text-xs text-[#879084] sm:flex"><span className="h-2 w-2 rounded-full bg-[#398061]" /> In stock · <span className="h-2 w-2 rounded-full bg-[#c97845]" /> Low stock</div></div>
      {filtered.length ? <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} />)}</div> : <div className="mt-8 rounded-[1.5rem] border border-dashed border-[#c8beaa] bg-[#f1ebde] px-6 py-20 text-center"><Sparkles className="mx-auto h-8 w-8 text-[#af692f]" aria-hidden="true" /><h2 className="mt-5 font-display text-3xl font-semibold text-[#163d30]">Nothing in this aisle yet.</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#657466]">Try a different state, category or search term. The pantry has more to show you.</p><button type="button" onClick={() => { setSearch(''); setCategory('All'); setState('All'); }} className="mt-6 rounded-full bg-[#163d30] px-5 py-3 text-sm font-bold text-[#f8f5ed]" data-testid="button-clear-filters">Clear filters</button></div>}
    </main>
  );
}

function ProductPage({ onAdd }: { onAdd: (product: Product) => void }) {
  const { id } = useParams<{ id: string }>();
  const product = products.find((item) => item.id === id);
  const [added, setAdded] = useState(false);
  const [purchaseMode, setPurchaseMode] = useState<'one-time' | 'recurring'>('one-time');
  if (!product) return <NotFound />;
  return (
    <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <Link href="/products" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#627064]" data-testid="link-back-products"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to shop</Link>
      <div className="grid gap-10 lg:grid-cols-[1fr_.9fr] lg:gap-16">
        <div className="overflow-hidden rounded-[1.8rem]"><ProductVisual product={product} large /></div>
        <div className="flex flex-col justify-center"><div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#af692f]"><span>{product.category}</span><span className="h-1 w-1 rounded-full bg-[#af692f]" /><span>{product.state}</span></div><h1 className="mt-5 font-display text-5xl font-semibold leading-[.92] tracking-[-0.07em] text-[#163d30] sm:text-7xl" data-testid="text-product-detail-name">{product.name}</h1><p className="mt-6 max-w-lg text-base leading-7 text-[#627064]">{product.description}</p><div className="mt-8 flex items-end gap-4"><span className="font-mono text-3xl font-medium text-[#163d30]" data-testid="text-product-detail-price">{money(purchaseMode === 'recurring' ? Math.round(product.price * .95) : product.price)}</span>{product.compareAt && <span className="mb-1 text-sm text-[#899187] line-through">{money(product.compareAt)}</span>}<span className={`mb-1 text-xs font-bold uppercase tracking-[0.14em] ${product.availability === 'Sold out' ? 'text-[#aa3e35]' : product.availability === 'Low stock' ? 'text-[#b46134]' : 'text-[#398061]'}`}>{product.availability}</span></div><div className="mt-7 grid gap-3 sm:grid-cols-2" aria-label="Purchase frequency">{(['one-time', 'recurring'] as const).map((mode) => <label key={mode} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${purchaseMode === mode ? 'border-[#163d30] bg-[#e9e3d4]' : 'border-[#d9d0bc]'}`}><input type="radio" name="purchase-mode" value={mode} checked={purchaseMode === mode} onChange={() => setPurchaseMode(mode)} className="accent-[#163d30]" data-testid={`radio-purchase-${mode}`} /><span className="flex-1"><span className="block text-sm font-bold text-[#163d30]">{mode === 'one-time' ? 'One-time purchase' : 'Repeat every month'}</span><span className="mt-1 block text-xs text-[#788478]">{mode === 'one-time' ? 'Just this pantry run' : 'Save 5% · pause anytime'}</span></span></label>)}</div><div className="mt-8 flex flex-col gap-3 sm:flex-row"><button type="button" disabled={product.availability === 'Sold out'} onClick={() => { onAdd(product); setAdded(true); setTimeout(() => setAdded(false), 1800); }} className="inline-flex min-h-14 flex-1 items-center justify-center gap-3 rounded-full bg-[#163d30] px-7 text-sm font-bold text-[#f8f5ed] transition hover:bg-[#af692f] disabled:bg-[#c7c3b8]" data-testid="button-add-detail">{added ? <><Check className="h-5 w-5" aria-hidden="true" /> Added to cart</> : <><ShoppingBag className="h-5 w-5" aria-hidden="true" /> Add to cart</>}</button><Link href="/cart" className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#d9d0bc] px-7 text-sm font-bold text-[#163d30] transition hover:border-[#163d30]" data-testid="link-view-cart">View cart</Link></div><div className="mt-10 grid grid-cols-2 border-y border-[#d9d0bc] py-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#879084]">Pack size</p><p className="mt-2 text-sm font-bold text-[#163d30]">{product.packSize}</p></div><div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#879084]">Delivery</p><p className="mt-2 text-sm font-bold text-[#163d30]">2–4 working days</p></div></div></div>
      </div>
      <div className="mt-14 grid gap-5 border-t border-[#d9d0bc] pt-10 sm:grid-cols-2"><div className="rounded-2xl bg-[#e9e3d4] p-6"><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#af692f]">What’s inside</p><h2 className="mt-3 font-display text-2xl font-semibold text-[#163d30]">Ingredients</h2><p className="mt-3 text-sm leading-6 text-[#627064]">{product.ingredients}</p></div><div className="rounded-2xl bg-[#e9e3d4] p-6"><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#af692f]">Good to know</p><h2 className="mt-3 font-display text-2xl font-semibold text-[#163d30]">Allergens</h2><p className="mt-3 text-sm leading-6 text-[#627064]">{product.allergens}</p></div></div>
    </main>
  );
}

function CartPage() {
  const { cart, subtotal } = useCart();
  const [, setLocation] = useLocation();
  const update = (productId: string, quantity: number) => {
    const next = cart.map((line) => line.productId === productId ? { ...line, quantity } : line).filter((line) => line.quantity > 0);
    writeCart(next);
  };
  const delivery = subtotal > 499 || subtotal === 0 ? 0 : 49;
  return (
    <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <div className="border-b border-[#d9d0bc] pb-8"><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#af692f]">Your pantry</p><h1 className="font-display text-5xl font-semibold tracking-[-0.07em] text-[#163d30] sm:text-7xl">The cart.</h1></div>
      {cart.length === 0 ? <div className="mx-auto max-w-lg py-24 text-center"><div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#e9e3d4]"><ShoppingBag className="h-8 w-8 text-[#af692f]" aria-hidden="true" /></div><h2 className="mt-7 font-display text-3xl font-semibold text-[#163d30]">A little empty in here.</h2><p className="mt-3 text-sm leading-6 text-[#657466]">Your next good snack is only a few clicks away.</p><Link href="/products" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#163d30] px-6 text-sm font-bold text-[#f8f5ed]" data-testid="link-empty-cart-shop">Browse the pantry <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div> : <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px] lg:items-start"><div className="divide-y divide-[#d9d0bc]">{cart.map((line) => { const product = products.find((item) => item.id === line.productId); if (!product) return null; return <div className="flex gap-4 py-6 first:pt-0" key={line.productId} data-testid={`row-cart-${line.productId}`}><div className="w-28 shrink-0 overflow-hidden rounded-xl sm:w-36"><ProductVisual product={product} /></div><div className="flex min-w-0 flex-1 flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#af692f]">{product.category}</p><h2 className="mt-1 font-display text-2xl font-semibold leading-tight text-[#163d30]">{product.name}</h2><p className="mt-1 text-sm text-[#7b857b]">{product.packSize} · {money(product.price)}</p></div><div className="flex items-center justify-between gap-5 sm:justify-end"><div className="flex items-center rounded-full border border-[#d9d0bc]"><button type="button" className="grid h-10 w-10 place-items-center text-[#163d30]" onClick={() => update(product.id, line.quantity - 1)} aria-label={`Decrease ${product.name} quantity`} data-testid={`button-decrease-${product.id}`}><Minus className="h-4 w-4" aria-hidden="true" /></button><span className="w-8 text-center text-sm font-bold" data-testid={`text-quantity-${product.id}`}>{line.quantity}</span><button type="button" className="grid h-10 w-10 place-items-center text-[#163d30]" onClick={() => update(product.id, line.quantity + 1)} aria-label={`Increase ${product.name} quantity`} data-testid={`button-increase-${product.id}`}><Plus className="h-4 w-4" aria-hidden="true" /></button></div><span className="w-20 text-right font-mono text-sm font-medium">{money(product.price * line.quantity)}</span><button type="button" onClick={() => update(product.id, 0)} className="grid h-10 w-10 place-items-center rounded-full text-[#aa3e35] transition hover:bg-[#f0d9d0]" aria-label={`Remove ${product.name}`} data-testid={`button-remove-${product.id}`}><Trash2 className="h-4 w-4" aria-hidden="true" /></button></div></div></div>; })}</div><aside className="rounded-[1.5rem] bg-[#e9e3d4] p-6 sm:p-8"><h2 className="font-display text-2xl font-semibold text-[#163d30]">Order summary</h2><div className="mt-7 space-y-4 border-b border-[#cfc3ae] pb-5 text-sm"><div className="flex justify-between"><span className="text-[#657466]">Subtotal</span><span className="font-mono font-medium" data-testid="text-cart-subtotal">{money(subtotal)}</span></div><div className="flex justify-between"><span className="text-[#657466]">Delivery</span><span className="font-mono font-medium">{delivery ? money(delivery) : 'Free'}</span></div></div><div className="flex justify-between py-5"><span className="font-bold text-[#163d30]">Total</span><span className="font-mono text-xl font-medium text-[#163d30]" data-testid="text-cart-total">{money(subtotal + delivery)}</span></div><p className="mb-5 flex items-center gap-2 text-xs text-[#657466]"><Truck className="h-4 w-4 text-[#af692f]" aria-hidden="true" /> {subtotal >= 499 ? 'Free delivery unlocked' : 'Free delivery over ₹499'}</p><button type="button" onClick={() => setLocation('/checkout')} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#163d30] text-sm font-bold text-[#f8f5ed] transition hover:bg-[#af692f]" data-testid="button-checkout">Continue to checkout <ArrowRight className="h-4 w-4" aria-hidden="true" /></button></aside></div>}
    </main>
  );
}

function CheckoutPage() {
  const { cart, subtotal } = useCart();
  const [, setLocation] = useLocation();
  const [placed, setPlaced] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', line: '', city: '', state: 'Karnataka', pincode: '', slot: 'Tomorrow · 10:00 am – 1:00 pm' });
  const delivery = subtotal > 499 || subtotal === 0 ? 0 : 49;
  const change = (key: keyof typeof form) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const placeOrder = (event: FormEvent) => {
    event.preventDefault();
    if (!cart.length) return;
    const order: Order = { id: `DF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`, createdAt: new Date().toISOString(), status: 'Confirmed', customer: { name: form.name, email: form.email, phone: form.phone }, address: { line: form.line, city: form.city, state: form.state, pincode: form.pincode }, slot: form.slot, items: cart.flatMap((line) => { const product = products.find((item) => item.id === line.productId); return product ? [{ ...line, name: product.name, price: product.price, packSize: product.packSize }] : []; }), subtotal, delivery, total: subtotal + delivery };
    writeOrders([order, ...readOrders()]);
    writeCart([]);
    setPlaced(true);
    setTimeout(() => setLocation('/orders'), 900);
  };
  if (!cart.length && !placed) return <main className="mx-auto max-w-xl px-5 py-28 text-center"><PackageCheck className="mx-auto h-10 w-10 text-[#af692f]" aria-hidden="true" /><h1 className="mt-5 font-display text-4xl font-semibold">Your checkout is waiting for a cart.</h1><Link href="/products" className="mt-7 inline-flex rounded-full bg-[#163d30] px-6 py-3 text-sm font-bold text-[#f8f5ed]" data-testid="link-checkout-shop">Shop products</Link></main>;
  return <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16"><div className="border-b border-[#d9d0bc] pb-8"><Link href="/cart" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#627064]" data-testid="link-back-cart"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to cart</Link><h1 className="font-display text-5xl font-semibold tracking-[-0.07em] text-[#163d30] sm:text-7xl">Almost home.</h1></div><form onSubmit={placeOrder} className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]"><div className="space-y-8"><section><div className="mb-5 flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#163d30] text-sm font-bold text-[#f8f5ed]">1</span><h2 className="font-display text-2xl font-semibold">Your details</h2></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Full name" value={form.name} onChange={change('name')} required testId="input-name" /><Field label="Email address" type="email" value={form.email} onChange={change('email')} required testId="input-email" /><Field label="Phone number" type="tel" value={form.phone} onChange={change('phone')} required testId="input-phone" /></div></section><section><div className="mb-5 flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#163d30] text-sm font-bold text-[#f8f5ed]">2</span><h2 className="font-display text-2xl font-semibold">Where should we deliver?</h2></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Address" value={form.line} onChange={change('line')} required testId="input-address" className="sm:col-span-2" /><Field label="City" value={form.city} onChange={change('city')} required testId="input-city" /><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#657466]">State</span><select value={form.state} onChange={change('state')} className="min-h-12 w-full rounded-xl border border-[#d9d0bc] bg-[#fdfbf5] px-4 text-sm outline-none" data-testid="select-checkout-state">{states.map((item) => <option key={item}>{item}</option>)}</select></label><Field label="Pincode" value={form.pincode} onChange={change('pincode')} required testId="input-pincode" /></div></section><section><div className="mb-5 flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#163d30] text-sm font-bold text-[#f8f5ed]">3</span><h2 className="font-display text-2xl font-semibold">Choose a delivery slot</h2></div><div className="grid gap-3 sm:grid-cols-2">{['Tomorrow · 10:00 am – 1:00 pm', 'Tomorrow · 4:00 pm – 7:00 pm'].map((slot) => <label key={slot} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm font-semibold transition ${form.slot === slot ? 'border-[#163d30] bg-[#e9e3d4]' : 'border-[#d9d0bc]'}`}><input type="radio" name="slot" value={slot} checked={form.slot === slot} onChange={change('slot')} className="accent-[#163d30]" data-testid={`radio-slot-${slot.includes('10') ? 'morning' : 'evening'}`} /><Clock3 className="h-4 w-4 text-[#af692f]" aria-hidden="true" />{slot}</label>)}</div></section></div><aside className="h-fit rounded-[1.5rem] bg-[#e9e3d4] p-6 sm:p-8"><h2 className="font-display text-2xl font-semibold">Your order</h2><div className="mt-6 space-y-4 border-b border-[#cfc3ae] pb-5">{cart.map((line) => { const product = products.find((item) => item.id === line.productId); return product ? <div key={line.productId} className="flex justify-between gap-4 text-sm"><span className="text-[#657466]">{product.name} <span className="font-mono text-xs">× {line.quantity}</span></span><span className="font-mono">{money(product.price * line.quantity)}</span></div> : null; })}</div><div className="space-y-3 py-5 text-sm"><div className="flex justify-between"><span className="text-[#657466]">Subtotal</span><span className="font-mono">{money(subtotal)}</span></div><div className="flex justify-between"><span className="text-[#657466]">Delivery</span><span className="font-mono">{delivery ? money(delivery) : 'Free'}</span></div></div><div className="flex justify-between border-t border-[#cfc3ae] pt-5"><span className="font-bold">Total</span><span className="font-mono text-xl font-medium" data-testid="text-checkout-total">{money(subtotal + delivery)}</span></div><button type="submit" disabled={placed} className="mt-7 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#163d30] text-sm font-bold text-[#f8f5ed] transition hover:bg-[#af692f] disabled:bg-[#398061]" data-testid="button-place-order">{placed ? <><Check className="h-5 w-5" aria-hidden="true" /> Order placed</> : <><CreditCard className="h-5 w-5" aria-hidden="true" /> Place order</>}</button><p className="mt-4 text-center text-xs leading-5 text-[#7a857a]">This is a mock checkout. No payment will be charged.</p></aside></form></main>;
}

function Field({ label, type = 'text', value, onChange, required, testId, className = '' }: { label: string; type?: string; value: string; onChange: (event: ChangeEvent<HTMLInputElement>) => void; required?: boolean; testId: string; className?: string }) {
  return <label className={`block ${className}`}><span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#657466]">{label}</span><input type={type} value={value} onChange={onChange} required={required} className="min-h-12 w-full rounded-xl border border-[#d9d0bc] bg-[#fdfbf5] px-4 text-sm outline-none transition focus:border-[#163d30]" data-testid={testId} /></label>;
}

function OrdersPage() {
  const [orders] = useState<Order[]>(() => readOrders());
  const [open, setOpen] = useState<string | null>(orders[0]?.id || null);
  return <main className="mx-auto max-w-5xl px-5 py-12 lg:px-8 lg:py-16"><div className="border-b border-[#d9d0bc] pb-8"><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#af692f]">The paper trail</p><h1 className="font-display text-5xl font-semibold tracking-[-0.07em] text-[#163d30] sm:text-7xl">Your orders.</h1></div>{orders.length === 0 ? <div className="mx-auto max-w-lg py-24 text-center"><div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#e9e3d4]"><Truck className="h-8 w-8 text-[#af692f]" aria-hidden="true" /></div><h2 className="mt-7 font-display text-3xl font-semibold">No deliveries yet.</h2><p className="mt-3 text-sm leading-6 text-[#657466]">When the pantry leaves our kitchen, its journey will show up here.</p><Link href="/products" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#163d30] px-6 text-sm font-bold text-[#f8f5ed]" data-testid="link-orders-shop">Start shopping <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div> : <div className="mt-10 space-y-4">{orders.map((order) => <article key={order.id} className="overflow-hidden rounded-[1.3rem] border border-[#d9d0bc] bg-[#fdfbf5]" data-testid={`card-order-${order.id}`}><button type="button" onClick={() => setOpen(open === order.id ? null : order.id)} className="flex min-h-24 w-full items-center justify-between gap-4 px-5 text-left sm:px-7" data-testid={`button-toggle-order-${order.id}`}><div><div className="flex flex-wrap items-center gap-3"><h2 className="font-mono text-sm font-medium text-[#163d30]">{order.id}</h2><span className="rounded-full bg-[#dbe9d9] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#398061]">{order.status}</span></div><p className="mt-2 text-xs text-[#7c877d]">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · {order.items.length} {order.items.length === 1 ? 'item' : 'items'}</p></div><div className="flex items-center gap-4"><span className="font-mono text-sm font-medium">{money(order.total)}</span><ChevronDown className={`h-4 w-4 text-[#7c877d] transition ${open === order.id ? 'rotate-180' : ''}`} aria-hidden="true" /></div></button>{open === order.id && <div className="border-t border-[#d9d0bc] bg-[#f5f0e5] px-5 py-6 sm:px-7"><div className="grid gap-6 sm:grid-cols-[1fr_auto]"><div className="space-y-3">{order.items.map((item) => <div key={item.productId} className="flex items-center justify-between gap-4 text-sm"><span className="text-[#627064]">{item.name} <span className="font-mono text-xs">× {item.quantity}</span></span><span className="font-mono">{money(item.price * item.quantity)}</span></div>)}</div><div className="text-sm sm:text-right"><p className="flex items-center gap-2 text-[#627064] sm:justify-end"><Truck className="h-4 w-4 text-[#af692f]" aria-hidden="true" /> {order.slot}</p><p className="mt-2 text-[#627064]">{order.address.city}, {order.address.state} · {order.address.pincode}</p></div></div></div>}</article>)}</div>}</main>;
}

function AppContent() {
  const [notice, setNotice] = useState('');
  const addToCart = (product: Product) => {
    const cart = readCart();
    const existing = cart.find((line) => line.productId === product.id);
    writeCart(existing ? cart.map((line) => line.productId === product.id ? { ...line, quantity: line.quantity + 1 } : line) : [...cart, { productId: product.id, quantity: 1 }]);
    setNotice(`${product.name} added to cart`);
    setTimeout(() => setNotice(''), 2200);
  };
  return <Shell notice={notice}><Switch><Route path="/" component={() => <Home onAdd={addToCart} />} /><Route path="/products" component={() => <ProductsPage onAdd={addToCart} />} /><Route path="/products/:id" component={() => <ProductPage onAdd={addToCart} />} /><Route path="/cart" component={CartPage} /><Route path="/checkout" component={CheckoutPage} /><Route path="/orders" component={OrdersPage} /><Route component={NotFound} /></Switch></Shell>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><RoutedErrorBoundary><AppContent /></RoutedErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;