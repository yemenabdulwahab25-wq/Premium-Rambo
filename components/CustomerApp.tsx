
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
  EyeOff,
  User as UserIcon,
  LogOut,
  Map,
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
  Layers
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
  products, 
  cart, 
  addToCart, 
  removeFromCart, 
  updateCartQuantity, 
  placeOrder, 
  settings,
  orders,
  categories,
  favorites,
  toggleFavorite,
  currentUser,
  onLogin,
  onRegister,
  onLogout,
  updateUser,
  onStaffLogin,
  checkoutData,
  setCheckoutData
}) => {
  const [activeTab, setActiveTab] = useState<'store'|'orders'|'account'>('store');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<WeightPrice | null>(null);
  const [selectedQty, setSelectedQty] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBobbyOpen, setIsBobbyOpen] = useState(false);
  const [bobbyQuery, setBobbyQuery] = useState('');
  const [bobbyMessages, setBobbyMessages] = useState<{role: 'user'|'bot', text: string}[]>([]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authData, setAuthData] = useState({ name: '', phone: '', email: '' });

  useEffect(() => {
    if (currentUser && !checkoutData.name) {
      setCheckoutData((prev: any) => ({
        ...prev,
        name: currentUser.name,
        phone: currentUser.phone,
        email: currentUser.email,
      }));
    }
  }, [currentUser, checkoutData.name, setCheckoutData]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.isPublished);
    if (activeCategory) result = result.filter(p => p.category === activeCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) || 
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [products, activeCategory, searchQuery]);

  // --- RELATED PRODUCTS LOGIC ---
  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    
    return products
      .filter(p => p.id !== selectedProduct.id && p.isPublished)
      .map(p => {
        let score = 0;
        if (p.category === selectedProduct.category) score += 3;
        if (p.brand === selectedProduct.brand) score += 2;
        if (p.type === selectedProduct.type) score += 1;
        return { product: p, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(item => item.product);
  }, [selectedProduct, products]);

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
    
    placeOrder(
      checkoutData.name, 
      checkoutData.phone, 
      checkoutData.time, 
      checkoutData.payment, 
      checkoutData.orderType, 
      undefined, 
      checkoutData.notes,
      checkoutData.email,
      checkoutData.marketingOptIn
    );
    setIsCheckingOut(false);
    setIsCartOpen(false);
    setActiveTab('orders');
  };

  const handleAuthSubmit = () => {
    if (authMode === 'login') {
      if (!authData.phone) return alert("Mobile ID required.");
      const success = onLogin(authData.phone);
      if (!success) return alert("No membership found. Please Join.");
    } else {
      if (!authData.name || !authData.phone) return alert("Name and Mobile are required.");
      const success = onRegister(authData.name, authData.phone, authData.email);
      if (!success) return alert("Account already active.");
    }
    setIsAuthModalOpen(false);
    setAuthData({ name: '', phone: '', email: '' });
  };

  const renderStore = () => (
    <div className="animate-in fade-in duration-500 pb-40">
      <div className={`w-full py-3 px-4 flex items-center justify-center gap-2.5 transition-all duration-500 ${settings.isStoreOpen ? 'bg-emerald-600 text-white shadow-lg' : 'bg-rose-600 text-white'}`}>
        <Circle size={10} fill="currentColor" className={settings.isStoreOpen ? 'animate-pulse' : ''} />
        <span className="text-[10px] font-black uppercase tracking-[4px]">
          {settings.isStoreOpen ? 'MENU LIVE' : 'MENU CLOSED'}
        </span>
      </div>

      <div className="sticky top-0 bg-white/95 backdrop-blur-2xl shadow-sm z-30 p-4 border-b border-slate-100">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-500 font-black shadow-xl">R</div>
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
              <input type="text" placeholder="Search premium genetics..." className="w-full bg-slate-100 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none text-slate-900 placeholder:text-slate-400" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-8 mt-4">
        {!selectedProduct && (
          <>
            <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)} className={`flex flex-col items-center justify-center p-5 min-w-[120px] rounded-[32px] border transition-all active:scale-95 ${activeCategory === cat ? 'bg-emerald-600 border-emerald-500 shadow-xl text-white' : 'bg-white border-slate-100 text-slate-700 shadow-md'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${activeCategory === cat ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}`}>{getCategoryIcon(cat)}</div>
                  <span className="text-[11px] font-black uppercase tracking-widest">{cat}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {filteredProducts.map(product => {
                const lowestPrice = Math.min(...product.weights.map(w => w.price));
                const isFavorite = favorites.includes(product.id);
                return (
                  <div key={product.id} className="bg-white rounded-[44px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all flex flex-col group relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                      className={`absolute top-4 right-4 z-10 p-2 rounded-full backdrop-blur-md transition-all active:scale-75 ${isFavorite ? 'bg-rose-500/20 text-rose-500' : 'bg-white/40 text-slate-400 hover:text-rose-400'}`}
                    >
                      <Heart size={20} fill={isFavorite ? "currentColor" : "none"} strokeWidth={2.5} />
                    </button>
                    
                    <div onClick={() => { setSelectedProduct(product); setSelectedWeight(null); }} className="aspect-[4/5] relative overflow-hidden bg-slate-50 cursor-pointer">
                      <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 duration-700" />
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xl px-4 py-2 rounded-2xl text-[10px] font-black text-slate-900 flex items-center gap-2 border border-slate-200 shadow-lg"><img src={product.brandLogo} className="w-4 h-4 rounded-full" /> {product.brand}</div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div onClick={() => { setSelectedProduct(product); setSelectedWeight(null); }} className="cursor-pointer">
                        <h3 className="font-black text-slate-900 leading-tight mb-1 text-base">{product.name}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[2px]">{product.type}</p>
                      </div>
                      <div className="flex items-center justify-between mt-6">
                        <span className="text-base text-emerald-600 font-black">${lowestPrice}</span>
                        <div onClick={() => { setSelectedProduct(product); setSelectedWeight(null); }} className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl group-hover:bg-emerald-600 transition-colors cursor-pointer">
                          <Plus size={20} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {selectedProduct && (
          <div className="fixed inset-0 z-[600] bg-white overflow-y-auto animate-in slide-in-from-bottom-12 duration-500 pb-48 custom-scrollbar">
            <div className="relative aspect-square overflow-hidden bg-slate-100">
              <img src={selectedProduct.image} className="w-full h-full object-cover" />
              
              <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
                <button onClick={() => setSelectedProduct(null)} className="bg-white/40 backdrop-blur-3xl p-4 rounded-[32px] text-slate-900 active:scale-90 border border-white/50"><ArrowLeft size={28} /></button>
                <button 
                  onClick={() => toggleFavorite(selectedProduct.id)}
                  className={`p-4 rounded-[32px] backdrop-blur-3xl border active:scale-90 transition-all ${favorites.includes(selectedProduct.id) ? 'bg-rose-500 text-white border-rose-400 shadow-xl' : 'bg-white/40 text-slate-900 border-white/50'}`}
                >
                  <Heart size={28} fill={favorites.includes(selectedProduct.id) ? "currentColor" : "none"} strokeWidth={2.5} />
                </button>
              </div>
            </div>
            <div className="p-8 max-w-4xl mx-auto space-y-12">
              <div className="flex justify-between items-end">
                <div className="space-y-3"><h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{selectedProduct.name}</h2><p className="text-sm font-bold text-slate-400 uppercase tracking-[4px]">{selectedProduct.brand} • {selectedProduct.type}</p></div>
                <div className="bg-emerald-50 px-8 py-5 rounded-[40px] border border-emerald-100 text-center shadow-sm"><span className="block text-[10px] text-emerald-600 font-black uppercase mb-1 tracking-widest">THC Value</span><span className="text-3xl font-black text-emerald-900">{selectedProduct.thc}%</span></div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[6px] ml-2 flex items-center gap-2"><Info size={14}/> Genetics Profile</h4>
                <p className="text-slate-600 text-lg leading-relaxed font-medium bg-slate-50 p-8 rounded-[40px] border border-slate-100 italic">"{selectedProduct.description}"</p>
              </div>

              {/* Weight Selection */}
              <div className="space-y-8">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[6px] ml-2 flex items-center gap-2"><Layers size={14}/> Available Weights</h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedProduct.weights.map(w => (
                    <button key={w.weight} disabled={w.stock === 0} onClick={() => { setSelectedWeight(w); setSelectedQty(1); }} className={`p-10 border-2 rounded-[48px] flex flex-col items-center transition-all ${selectedWeight?.weight === w.weight ? 'border-emerald-600 bg-emerald-50/50 shadow-xl scale-[1.02]' : 'border-slate-100 bg-white active:scale-95'} ${w.stock === 0 ? 'opacity-30 grayscale cursor-not-allowed' : 'cursor-pointer hover:border-emerald-200'}`}>
                      <span className="font-black text-slate-900 text-3xl">{w.weight}</span>
                      <span className="text-emerald-600 font-black text-2xl mt-2">${w.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* RELATED PRODUCTS SECTION */}
              {relatedProducts.length > 0 && (
                <div className="space-y-8 pt-12 border-t border-slate-100">
                  <div className="flex items-center justify-between ml-2">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[6px] flex items-center gap-2"><Sparkles size={14}/> Similar Genetics</h4>
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full">Curated for You</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {relatedProducts.map(p => {
                      const isRelFavorite = favorites.includes(p.id);
                      return (
                        <div key={p.id} className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col relative">
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
                            className={`absolute top-3 right-3 z-10 p-1.5 rounded-full backdrop-blur-md transition-all active:scale-75 ${isRelFavorite ? 'bg-rose-500/20 text-rose-500' : 'bg-white/40 text-slate-400'}`}
                          >
                            <Heart size={16} fill={isRelFavorite ? "currentColor" : "none"} strokeWidth={2.5} />
                          </button>
                          
                          <div onClick={() => { setSelectedProduct(p); setSelectedWeight(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="aspect-square relative overflow-hidden bg-slate-50">
                            <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div onClick={() => { setSelectedProduct(p); setSelectedWeight(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-6">
                            <h5 className="font-black text-slate-900 text-sm leading-tight truncate">{p.name}</h5>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.type}</span>
                              <span className="text-emerald-600 font-black text-xs">${Math.min(...p.weights.map(w => w.price))}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div className="fixed bottom-0 left-0 right-0 p-8 bg-white/95 backdrop-blur-3xl border-t border-slate-100 z-[610]">
               <div className="max-w-4xl mx-auto">
                 <button 
                  disabled={!selectedWeight}
                  onClick={() => { addToCart({ productId: selectedProduct.id, name: selectedProduct.name, brand: selectedProduct.brand, weight: selectedWeight!.weight, price: selectedWeight!.price, quantity: 1, image: selectedProduct.image }); setSelectedProduct(null); setIsCartOpen(true); }} 
                  className="w-full bg-emerald-600 text-white font-black py-8 rounded-[48px] shadow-2xl active:scale-95 text-[12px] uppercase tracking-[6px] disabled:opacity-50 transition-all flex items-center justify-center gap-4"
                 >
                   {selectedWeight ? <Check size={20}/> : <Plus size={20}/>}
                   AUTHORIZE ADD TO BAG — ${selectedWeight?.price || 0}
                 </button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="max-w-4xl mx-auto p-8 space-y-10 animate-in fade-in duration-500 pb-40">
       <h2 className="text-4xl font-black text-slate-900 tracking-tighter">My Transmission Queue</h2>
       <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="py-40 text-center opacity-10 flex flex-col items-center"><History size={80} className="mb-6 text-slate-900" /><p className="font-black uppercase text-sm tracking-[6px] text-slate-900">No Orders Tracked</p></div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white rounded-[56px] border border-slate-100 shadow-xl overflow-hidden hover:shadow-2xl transition-all">
                 <div className="p-8 border-b flex justify-between items-center bg-slate-50/50"><div className="space-y-1"><span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest">TRANSMISSION ID</span><span className="text-base font-black text-slate-900 uppercase tracking-widest">#{order.id}</span></div><span className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${order.status === OrderStatus.Ready ? 'bg-emerald-500 text-white border-emerald-400 animate-pulse' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{order.status}</span></div>
                 <div className="p-10 bg-slate-900 text-white flex justify-between items-center"><span className="text-[11px] font-black uppercase tracking-[6px] text-slate-500">Total Value</span><span className="text-4xl font-black text-emerald-400 tracking-tighter">${order.total.toFixed(2)}</span></div>
              </div>
            ))
          )}
       </div>
    </div>
  );

  const renderAccount = () => (
    <div className="max-w-4xl mx-auto p-8 space-y-12 animate-in fade-in duration-500 pb-40">
      {currentUser ? (
        <>
          <div className="bg-white rounded-[64px] border border-slate-100 p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-[120px] rounded-full"></div>
            <div className="flex items-center justify-between relative z-10 mb-12">
              <div className="flex items-center gap-8">
                <div className="w-24 h-24 bg-emerald-600 rounded-[44px] flex items-center justify-center text-white shadow-2xl shadow-emerald-600/30"><UserIcon size={48} /></div>
                <div><h2 className="text-4xl font-black text-slate-900 tracking-tighter">{currentUser.name}</h2><p className="text-slate-400 font-bold uppercase tracking-[4px] text-[10px] mt-2">Active Vault Member</p></div>
              </div>
              <button onClick={onLogout} className="p-6 bg-rose-50 text-rose-600 rounded-[32px] hover:bg-rose-100 transition-all active:scale-90"><LogOut size={28} /></button>
            </div>
            <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl border border-white/5">
                <div className="flex justify-between items-center mb-8"><span className="text-[10px] font-black uppercase text-slate-500 tracking-[8px]">Loyalty Stash</span><span className="text-5xl font-black text-white">{currentUser.points}</span></div>
                <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all duration-1000" style={{ width: `${Math.min(100, (currentUser.points / settings.loyalty.rewardThreshold) * 100)}%` }} /></div>
                <p className="mt-6 text-[9px] font-black uppercase text-slate-500 tracking-[3px] text-center">{settings.loyalty.rewardDescription} UNLOCKS AT {settings.loyalty.rewardThreshold} PTS</p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-28 bg-white rounded-[64px] border border-slate-100 shadow-xl space-y-10">
            <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-200 mx-auto shadow-inner"><UserIcon size={48}/></div>
            <div className="space-y-3"><h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Membership Portal</h3><p className="text-slate-400 font-bold text-xs uppercase tracking-[5px]">Access exotic drops and points.</p></div>
            <button onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }} className="bg-slate-900 text-white px-20 py-7 rounded-[40px] font-black uppercase text-[12px] tracking-[6px] shadow-2xl active:scale-95 transition-all">SIGN IN / JOIN VAULT</button>
        </div>
      )}

      <div className="pt-32 border-t border-slate-100 flex flex-col items-center opacity-30 hover:opacity-100 transition-opacity duration-1000">
         <button onClick={onStaffLogin} className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[8px] hover:text-slate-900 transition-all cursor-pointer group"><Lock size={12} className="opacity-50 group-hover:scale-110 transition-transform"/> Staff Operations</button>
         <p className="mt-5 text-[8px] font-black text-slate-300 uppercase tracking-[6px]">PREMIUM RAMBO HQ • v2.6.5-SECURE</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative">
      <div className="pb-36">{activeTab === 'store' && renderStore()}{activeTab === 'orders' && renderOrders()}{activeTab === 'account' && renderAccount()}</div>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-3xl border-t px-8 py-10 flex justify-around items-center z-[120] shadow-[0_-20px_50px_rgba(0,0,0,0.05)] rounded-t-[64px]">
        <button onClick={() => setActiveTab('store')} className={`flex flex-col items-center gap-2.5 transition-all ${activeTab === 'store' ? 'text-emerald-600 scale-110' : 'text-slate-300'}`}><Store size={30} /><span className="text-[9px] font-black uppercase tracking-[6px]">Menu</span></button>
        <button onClick={() => setActiveTab('orders')} className={`flex flex-col items-center gap-2.5 transition-all ${activeTab === 'orders' ? 'text-emerald-600 scale-110' : 'text-slate-300'}`}><History size={30} /><span className="text-[9px] font-black uppercase tracking-[6px]">Queue</span></button>
        <button onClick={() => setActiveTab('account')} className={`flex flex-col items-center gap-2.5 transition-all ${activeTab === 'account' ? 'text-emerald-600 scale-110' : 'text-slate-300'}`}><Star size={30} /><span className="text-[9px] font-black uppercase tracking-[6px]">Vault</span></button>
      </nav>

      {isCartOpen && (
        <div className="fixed inset-0 z-[700] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-10 border-b flex items-center justify-between bg-slate-50/30"><h2 className="text-4xl font-black text-slate-900 tracking-tighter">Your Stash</h2><button onClick={() => setIsCartOpen(false)} className="p-2 text-slate-300 hover:text-slate-900"><X size={36} /></button></div>
            <div className="flex-1 overflow-y-auto p-10 space-y-12">
              {cart.map(item => (
                <div key={`${item.productId}-${item.weight}`} className="flex gap-8 group">
                  <div className="w-28 h-28 rounded-[40px] overflow-hidden shrink-0 shadow-xl border border-slate-100"><img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /></div>
                  <div className="flex-1 flex flex-col justify-center space-y-1.5">
                    <div className="flex justify-between items-start"><h4 className="font-black text-slate-900 text-xl leading-tight tracking-tight">{item.name}</h4><button onClick={() => removeFromCart(item.productId, item.weight)} className="text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={24}/></button></div>
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[4px]">{item.weight}</p>
                    <div className="flex justify-between items-center mt-3"><span className="font-black text-2xl text-slate-900">${(item.price * item.quantity).toFixed(2)}</span></div>
                  </div>
                </div>
              ))}
              {cart.length === 0 && <div className="py-40 text-center opacity-10 flex flex-col items-center"><ShoppingCart size={100} className="mb-8 text-slate-900"/><p className="font-black uppercase tracking-[10px] text-sm text-slate-900">Vault is Empty</p></div>}
            </div>
            <div className="p-12 border-t bg-white space-y-10 shadow-[0_-20px_60px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-center"><span className="text-slate-400 font-black text-[12px] uppercase tracking-[6px]">Total Stash Value</span><span className="text-6xl font-black text-slate-900 tracking-tighter">${cartTotal.toFixed(2)}</span></div>
              <button disabled={cart.length === 0} onClick={() => setIsCheckingOut(true)} className="w-full bg-emerald-600 text-white font-black py-8 rounded-[56px] uppercase tracking-[8px] text-[13px] shadow-2xl shadow-emerald-600/20 active:scale-95 transition-all">CONFIRM TRANSMISSION</button>
            </div>
          </div>
        </div>
      )}

      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl" onClick={() => setIsAuthModalOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-white rounded-[64px] p-12 shadow-2xl animate-in zoom-in-95 duration-500 border border-slate-100">
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-12 text-center leading-none">{authMode === 'login' ? 'Vault Entry' : 'New Member'}</h3>
            <div className="space-y-10">
              {authMode === 'register' && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-[4px] ml-5">Legal Name</label>
                  <input className="w-full bg-slate-100 p-6 rounded-[32px] border border-slate-200 font-black text-slate-950 outline-none focus:border-emerald-500 transition-all placeholder:text-slate-300" placeholder="Ex. Premium Rambo" value={authData.name} onChange={e => setAuthData({...authData, name: e.target.value})}/>
                </div>
              )}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[4px] ml-5">Mobile Identity</label>
                <input className="w-full bg-slate-100 p-6 rounded-[32px] border border-slate-200 font-black text-slate-950 outline-none focus:border-emerald-500 transition-all placeholder:text-slate-300" placeholder="Ex. 000-000-0000" value={authData.phone} onChange={e => setAuthData({...authData, phone: e.target.value})}/>
              </div>
              <div className="space-y-6 pt-4">
                <button onClick={handleAuthSubmit} className="w-full bg-emerald-600 text-white py-7 rounded-[40px] font-black uppercase text-[13px] tracking-[8px] shadow-2xl shadow-emerald-600/20 active:scale-95 transition-all">{authMode === 'login' ? 'AUTHORIZE' : 'JOIN VAULT'}</button>
                <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="w-full text-[11px] font-black uppercase text-emerald-600 tracking-[4px] hover:text-emerald-700 transition-colors text-center block">
                  {authMode === 'login' ? 'Register New Member' : 'Already a Member? Sign In'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`fixed bottom-36 right-8 z-[150] transition-all duration-700 ${isBobbyOpen ? 'w-full max-w-[440px] h-[720px] bottom-10 px-4' : 'w-auto'}`}>
        {isBobbyOpen ? (
          <div className="bg-white rounded-[72px] shadow-2xl flex flex-col h-full border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-24 duration-700">
            <div className="bg-slate-900 p-12 text-white flex items-center justify-between"><div className="flex items-center gap-4"><Zap size={28} fill="currentColor" className="text-emerald-500"/><span className="font-black text-2xl tracking-tighter uppercase">Bobby Pro AI</span></div><button onClick={() => setIsBobbyOpen(false)} className="p-3 hover:bg-white/10 rounded-full transition-all"><Minus size={28} /></button></div>
            <div className="flex-1 overflow-y-auto p-12 space-y-10 bg-slate-50/50 custom-scrollbar">
              <div className="p-8 rounded-[44px] text-base font-black bg-white text-slate-900 mr-12 shadow-sm border border-slate-100 leading-relaxed">Vault analytics active. What premium genetics are you tracking today?</div>
              {bobbyMessages.map((m, idx) => (<div key={idx} className={`p-8 rounded-[48px] text-base font-black shadow-xl leading-relaxed ${m.role === 'user' ? 'bg-emerald-600 text-white ml-12' : 'bg-white text-slate-900 mr-12 border border-slate-100'}`}>{m.text}</div>))}
            </div>
            <div className="p-10 border-t bg-white flex gap-6">
              <input type="text" placeholder="Ask about strain effects..." className="flex-1 bg-slate-100 border-none rounded-[36px] px-10 py-7 text-base font-black outline-none text-slate-950 placeholder:text-slate-300" value={bobbyQuery} onChange={e => setBobbyQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBobbyAsk()} />
              <button onClick={handleBobbyAsk} className="bg-slate-900 text-white p-7 rounded-[36px] shadow-2xl active:scale-90 transition-all"><ChevronRight size={28} /></button>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsBobbyOpen(true)} className="bg-slate-900 text-white px-12 py-8 rounded-[48px] shadow-2xl flex items-center gap-6 hover:scale-110 active:scale-90 transition-all group">
            <div className="relative"><Zap size={28} fill="currentColor" className="text-emerald-500 group-hover:animate-pulse"/><div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-0 group-hover:opacity-40 transition-opacity"></div></div>
            <span className="font-black text-[13px] uppercase tracking-[8px]">Ask Bobby</span>
          </button>
        )}
      </div>

      {isCheckingOut && (
        <div className="fixed inset-0 z-[800] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl" onClick={() => setIsCheckingOut(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[72px] p-12 shadow-2xl max-h-[92vh] overflow-y-auto animate-in zoom-in duration-300">
            <h2 className="text-6xl font-black text-slate-900 tracking-tighter mb-16 text-center leading-none">Transmission</h2>
            <div className="space-y-10 mb-20">
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-[6px] ml-6">Legal Name</label>
                  <input type="text" className="w-full bg-slate-100 p-7 rounded-[40px] border border-slate-200 font-black text-slate-950 focus:border-emerald-500 outline-none text-xl" value={checkoutData.name} onChange={e => setCheckoutData({...checkoutData, name: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-[6px] ml-6">Mobile Identity</label>
                  <input type="tel" className="w-full bg-slate-100 p-7 rounded-[40px] border border-slate-200 font-black text-slate-950 focus:border-emerald-500 outline-none text-xl" value={checkoutData.phone} onChange={e => setCheckoutData({...checkoutData, phone: e.target.value})} />
                </div>
            </div>
            <button onClick={handleCheckout} className="w-full text-white font-black py-9 rounded-[56px] shadow-2xl bg-emerald-600 uppercase tracking-[10px] text-[14px] hover:bg-emerald-500 active:scale-95 transition-all">AUTHORIZE ORDER</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerApp;
