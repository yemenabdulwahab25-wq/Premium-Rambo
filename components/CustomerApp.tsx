
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  ArrowLeft, 
  Plus, 
  Minus, 
  Clock,
  ChevronRight,
  Zap,
  Trash2,
  History,
  Store,
  Heart,
  Banknote,
  Star,
  MapPin,
  Truck,
  AlertCircle,
  Tag,
  Info,
  Circle,
  Navigation,
  Calendar,
  Mail,
  Check,
  Smartphone,
  CreditCard,
  ShieldCheck,
  Eye,
  EyeOff,
  User as UserIcon,
  LogOut,
  Map as MapIcon,
  PlusCircle,
  Phone,
  Settings as SettingsIcon,
  Save,
  X,
  Coins,
  Gift,
  Share,
  Lock,
  Sparkles,
  Layers,
  Bot,
  ShieldAlert
} from 'lucide-react';
import { Product, CartItem, StoreSettings, Order, OrderStatus, WeightPrice, PaymentMethod, PaymentStatus, OrderType, User, Address } from '../types';
import { getCategoryIcon } from '../constants';
import { bobbyProAssistant } from '../services/geminiService';

interface CustomerAppProps {
  products: Product[];
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, weight: string) => void;
  updateCartQuantity: (productId: string, weight: string, delta: number) => void;
  placeOrder: (name: string, phone: string, time: string, paymentMethod: PaymentMethod, orderType: OrderType, deliveryAddress?: string, notes?: string, email?: string, marketingOptIn?: boolean) => Order;
  settings: StoreSettings;
  orders: Order[];
  categories: string[];
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  currentUser: User | null;
  onLogin: (phone: string) => boolean;
  onRegister: (name: string, phone: string, email: string) => boolean;
  onLogout: () => void;
  updateUser: (user: User) => void;
  onStaffLogin: () => void;
  checkoutData: any;
  setCheckoutData: React.Dispatch<React.SetStateAction<any>>;
}

const CustomerApp: React.FC<CustomerAppProps> = ({ 
  products, cart, addToCart, removeFromCart, updateCartQuantity, placeOrder, settings, orders, categories, favorites, toggleFavorite, currentUser, onLogin, onRegister, onLogout, updateUser, onStaffLogin, checkoutData, setCheckoutData
}) => {
  const [activeTab, setActiveTab] = useState<'store'|'orders'|'account'>('store');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<WeightPrice | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBobbyOpen, setIsBobbyOpen] = useState(false);
  const [bobbyQuery, setBobbyQuery] = useState('');
  const [bobbyMessages, setBobbyMessages] = useState<{role: 'user'|'bot', text: string}[]>([]);
  const [showBobbyTour, setShowBobbyTour] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authData, setAuthData] = useState({ name: '', phone: '', email: '' });

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('bobby_tour_complete');
    if (!hasSeenTour) setShowBobbyTour(true);
  }, []);

  const availableBrandsForCategory = useMemo(() => {
    if (!activeCategory) return [];
    const brandsMap = new window.Map<string, string>();
    products.forEach(p => {
      if (p.category === activeCategory && p.isPublished) brandsMap.set(p.brand, p.brandLogo);
    });
    return Array.from(brandsMap.entries()).map(([name, logo]) => ({ name, logo }));
  }, [products, activeCategory]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.isPublished);
    if (activeCategory) result = result.filter(p => p.category === activeCategory);
    if (activeBrand) result = result.filter(p => p.brand === activeBrand);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)));
    }
    return result;
  }, [products, activeCategory, activeBrand, searchQuery]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleBobbyAsk = async () => {
    if (!bobbyQuery.trim()) return;
    const msg = bobbyQuery;
    setBobbyMessages(prev => [...prev, { role: 'user', text: msg }]);
    setBobbyQuery('');
    const response = await bobbyProAssistant(msg, products);
    setBobbyMessages(prev => [...prev, { role: 'bot', text: response || "Analysing genetics vault..." }]);
  };

  const handleCheckout = () => {
    if (!settings.isStoreOpen) return alert('Store is currently closed for pickups.');
    if (!checkoutData.name || !checkoutData.phone) return alert('Contact information is required.');
    placeOrder(checkoutData.name, checkoutData.phone, checkoutData.time, checkoutData.payment, checkoutData.orderType, undefined, checkoutData.notes, checkoutData.email, checkoutData.marketingOptIn);
    setIsCheckingOut(false);
    setIsCartOpen(false);
    setActiveTab('orders');
  };

  const renderStore = () => (
    <div className="animate-in fade-in duration-500 pb-40">
      <div className={`w-full py-3 px-4 flex items-center justify-center gap-2.5 transition-all duration-500 ${settings.isStoreOpen ? 'bg-emerald-600 text-white shadow-lg' : 'bg-rose-600 text-white'}`}>
        <Circle size={10} fill="currentColor" className={settings.isStoreOpen ? 'animate-pulse' : ''} />
        <span className="text-[10px] font-black uppercase tracking-[4px]">{settings.isStoreOpen ? 'MENU LIVE' : 'MENU CLOSED'}</span>
      </div>

      <div className="sticky top-0 bg-white/95 backdrop-blur-2xl shadow-sm z-30 p-4 border-b border-slate-100">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden bg-slate-100 shadow-xl border border-slate-200 shrink-0">
                  {settings.logoUrl ? <img src={settings.logoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-900 flex items-center justify-center text-emerald-500 font-black">R</div>}
               </div>
               <span className="font-black text-slate-900 tracking-tighter text-xl">Premium Rambo</span>
            </div>
            <button onClick={() => setIsCartOpen(true)} className="relative p-3 bg-slate-50 text-slate-900 rounded-2xl active:scale-90 transition-all border border-slate-200">
              <ShoppingCart size={22} />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-lg">{cart.reduce((s, i) => s + i.quantity, 0)}</span>}
            </button>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search premium genetics..." className="w-full bg-slate-100 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none text-slate-950 placeholder:text-slate-400" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-8 mt-4">
        {!selectedProduct && (
          <>
            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[4px] ml-4 flex items-center gap-2">
                {activeCategory ? <Check size={12} className="text-emerald-500" /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                Step 1: Select Category
              </h4>
              <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar px-2">
                {categories.map((cat) => (
                  <button key={cat} onClick={() => { setActiveCategory(cat); setActiveBrand(null); }} className={`flex flex-col items-center justify-center p-5 min-w-[120px] rounded-[32px] border transition-all active:scale-95 ${activeCategory === cat ? 'bg-emerald-600 border-emerald-500 shadow-xl text-white' : 'bg-white border-slate-100 text-slate-700 shadow-md'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${activeCategory === cat ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}`}>{getCategoryIcon(cat)}</div>
                    <span className="text-[11px] font-black uppercase tracking-widest">{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {activeCategory && (
              <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between ml-4 mr-4">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[4px] flex items-center gap-2">
                    {activeBrand ? <Check size={12} className="text-emerald-500" /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                    Step 2: {activeCategory} Brands
                  </h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2">
                  {availableBrandsForCategory.map((brand) => (
                    <button key={brand.name} onClick={() => setActiveBrand(brand.name)} className={`flex flex-col items-center justify-center p-6 md:p-8 rounded-[40px] border transition-all active:scale-95 ${activeBrand === brand.name ? 'bg-slate-900 border-slate-800 shadow-xl text-white' : 'bg-white border-slate-100 text-slate-700 shadow-sm'}`}>
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-slate-50 mb-4 border border-slate-100 shadow-inner shrink-0"><img src={brand.logo} className="w-full h-full object-cover" /></div>
                      <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-center truncate w-full">{brand.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(activeBrand || searchQuery) && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8 border-t border-slate-100">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[4px] ml-4 flex items-center gap-2"><Sparkles size={12} className="text-emerald-500" />Available Genetics</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2">
                  {filteredProducts.map(product => {
                    const lowestPrice = Math.min(...product.weights.map(w => w.price));
                    return (
                      <div key={product.id} className="bg-white rounded-[44px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all flex flex-col group relative">
                        <div className="absolute top-4 right-4 z-10 flex gap-2">
                          <button onClick={() => setQuickViewProduct(product)} className="p-2 rounded-full backdrop-blur-md bg-white/40 text-slate-900 border border-white/50"><Eye size={18}/></button>
                        </div>
                        <div onClick={() => setSelectedProduct(product)} className="aspect-[4/5] relative overflow-hidden bg-slate-50 cursor-pointer"><img src={product.image} className="w-full h-full object-cover group-hover:scale-110 duration-700" /></div>
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div onClick={() => setSelectedProduct(product)} className="cursor-pointer">
                            <h3 className="font-black text-slate-900 leading-tight mb-1 text-sm md:text-base truncate">{product.name}</h3>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[2px] truncate">{product.type} • {product.thc}%</p>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-base text-emerald-600 font-black">${lowestPrice}</span>
                            <div onClick={() => setSelectedProduct(product)} className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl group-hover:bg-emerald-600 transition-colors cursor-pointer"><Plus size={18} /></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative">
      <div className="max-w-7xl mx-auto w-full">
        {activeTab === 'store' && renderStore()}
        {activeTab === 'orders' && (
          <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-500 pb-40">
             <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter ml-4">Transmission Queue</h2>
             <div className="space-y-6">
                {orders.length === 0 ? (
                  <div className="py-40 text-center opacity-10 flex flex-col items-center"><History size={80} className="mb-6 text-slate-900" /><p className="font-black uppercase text-sm tracking-[6px] text-slate-900 text-center">No Orders Tracked</p></div>
                ) : (
                  orders.map(order => (
                    <div key={order.id} className="bg-white rounded-[32px] md:rounded-[56px] border border-slate-100 shadow-xl overflow-hidden hover:shadow-2xl transition-all">
                       <div className="p-6 md:p-8 border-b flex justify-between items-center bg-slate-50/50"><div className="space-y-1"><span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest">TRANSMISSION ID</span><span className="text-sm md:text-base font-black text-slate-900 uppercase tracking-widest">#{order.id}</span></div><span className={`px-4 md:px-6 py-2 md:py-3 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border ${order.status === OrderStatus.Ready ? 'bg-emerald-500 text-white border-emerald-400 animate-pulse' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{order.status}</span></div>
                       <div className="p-8 md:p-10 bg-slate-900 text-white flex justify-between items-center"><span className="text-[10px] md:text-[11px] font-black uppercase tracking-[4px] md:tracking-[6px] text-slate-500">Total Value</span><span className="text-3xl md:text-4xl font-black text-emerald-400 tracking-tighter">${order.total.toFixed(2)}</span></div>
                    </div>
                  ))
                )}
             </div>
          </div>
        )}
        {activeTab === 'account' && (
          <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-12 animate-in fade-in duration-500 pb-40">
            {currentUser ? (
              <div className="bg-white rounded-[32px] md:rounded-[64px] border border-slate-100 p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-[120px] rounded-full"></div>
                <div className="flex items-center justify-between relative z-10 mb-8 md:mb-12">
                  <div className="flex items-center gap-4 md:gap-8">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-emerald-600 rounded-2xl md:rounded-[44px] flex items-center justify-center text-white shrink-0"><UserIcon size={32} className="md:size-[48px]" /></div>
                    <div><h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter truncate max-w-[200px] md:max-w-full">{currentUser.name}</h2><p className="text-slate-400 font-bold uppercase tracking-[4px] text-[8px] md:text-[10px] mt-1">Active Member</p></div>
                  </div>
                  <button onClick={onLogout} className="p-4 md:p-6 bg-rose-50 text-rose-600 rounded-2xl md:rounded-[32px] hover:bg-rose-100 transition-all shrink-0"><LogOut size={20} className="md:size-[28px]" /></button>
                </div>
                <div className="bg-slate-900 p-8 md:p-10 rounded-[32px] md:rounded-[48px] shadow-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-6 md:mb-8"><span className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 tracking-[5px] md:tracking-[8px]">Loyalty Stash</span><span className="text-4xl md:text-5xl font-black text-white">{currentUser.points}</span></div>
                    <div className="w-full h-3 md:h-4 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${Math.min(100, (currentUser.points / settings.loyalty.rewardThreshold) * 100)}%` }} /></div>
                    <p className="mt-4 md:mt-6 text-[8px] md:text-[9px] font-black uppercase text-slate-500 tracking-[2px] md:tracking-[3px] text-center">{settings.loyalty.rewardDescription}</p>
                </div>

                {/* Staff Access point (Discreet) */}
                <div className="mt-20 pt-10 border-t border-slate-100 flex justify-center">
                   <button 
                     onClick={onStaffLogin} 
                     className="flex items-center gap-3 px-8 py-4 rounded-2xl border border-slate-100 text-slate-300 hover:text-emerald-600 hover:border-emerald-100 transition-all active:scale-95 group"
                   >
                     <ShieldAlert size={18} className="group-hover:animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-[4px]">Staff Portal Access</span>
                   </button>
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                <div className="text-center py-20 md:py-28 bg-white rounded-[32px] md:rounded-[64px] border border-slate-100 shadow-xl space-y-8 md:space-y-10 px-6">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-2xl md:rounded-[40px] flex items-center justify-center text-slate-200 mx-auto"><UserIcon size={40} className="md:size-[48px]"/></div>
                    <div className="space-y-3"><h3 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter">Membership Portal</h3><p className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-[4px] md:tracking-[5px]">Access exotic drops and points.</p></div>
                    <button onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }} className="w-full sm:w-auto bg-slate-900 text-white px-10 md:px-20 py-5 md:py-7 rounded-2xl md:rounded-[40px] font-black uppercase text-[11px] md:text-[12px] tracking-[4px] md:tracking-[6px] shadow-2xl active:scale-95 transition-all">SIGN IN / JOIN VAULT</button>
                </div>

                {/* Staff Access point for unauthenticated state */}
                <div className="flex justify-center">
                   <button 
                     onClick={onStaffLogin} 
                     className="flex items-center gap-3 px-8 py-4 rounded-2xl border border-slate-100 text-slate-300 hover:text-emerald-600 hover:border-emerald-100 transition-all active:scale-95 group"
                   >
                     <ShieldAlert size={18} />
                     <span className="text-[10px] font-black uppercase tracking-[4px]">Staff Entry</span>
                   </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-3xl border-t px-4 md:px-8 py-6 md:py-10 flex justify-center z-[120] shadow-[0_-20px_50px_rgba(0,0,0,0.05)] rounded-t-[32px] md:rounded-t-[64px]">
        <div className="max-w-md w-full flex justify-around items-center">
          <button onClick={() => { setActiveTab('store'); setActiveCategory(null); setActiveBrand(null); }} className={`flex flex-col items-center gap-1.5 md:gap-2.5 transition-all ${activeTab === 'store' ? 'text-emerald-600 scale-110' : 'text-slate-300'}`}><Store size={26} className="md:size-[30px]" /><span className="text-[8px] md:text-[9px] font-black uppercase tracking-[3px] md:tracking-[6px]">Menu</span></button>
          <button onClick={() => setActiveTab('orders')} className={`flex flex-col items-center gap-1.5 md:gap-2.5 transition-all ${activeTab === 'orders' ? 'text-emerald-600 scale-110' : 'text-slate-300'}`}><History size={26} className="md:size-[30px]" /><span className="text-[8px] md:text-[9px] font-black uppercase tracking-[3px] md:tracking-[6px]">Queue</span></button>
          <button onClick={() => setActiveTab('account')} className={`flex flex-col items-center gap-1.5 md:gap-2.5 transition-all ${activeTab === 'account' ? 'text-emerald-600 scale-110' : 'text-slate-300'}`}><Star size={26} className="md:size-[30px]" /><span className="text-[8px] md:text-[9px] font-black uppercase tracking-[3px] md:tracking-[6px]">Vault</span></button>
        </div>
      </nav>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default CustomerApp;
