
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CategoryEnum, 
  OrderStatus, 
  Product, 
  Order, 
  StoreSettings, 
  CartItem,
  PaymentMethod,
  PaymentStatus,
  OrderType,
  MessageLog,
  User,
  Address,
  StrainType
} from './types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from './constants';
import CustomerApp from './components/CustomerApp';
import AdminApp from './components/AdminApp';
import AgeGate from './components/AgeGate';
import { Lock, X, ChevronRight, ShieldCheck, CloudCheck, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  // --- REAL-TIME VAULT STORAGE ---
  const [isAgeVerified, setIsAgeVerified] = useState(() => {
    return localStorage.getItem('age_verified') === 'true';
  });
  
  const [isCustomerUnlocked, setIsCustomerUnlocked] = useState(() => {
    return sessionStorage.getItem('customer_unlocked') === 'true';
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('rambo_products_v4');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { console.error("Vault recovery triggered.", e); }
    }
    return INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('rambo_orders_v4');
    return saved ? JSON.parse(saved).map((o: any) => ({ ...o, timestamp: new Date(o.timestamp) })) : [];
  });

  const [messageLogs, setMessageLogs] = useState<MessageLog[]>(() => {
    const saved = localStorage.getItem('message_logs');
    return saved ? JSON.parse(saved).map((l: any) => ({ ...l, timestamp: new Date(l.timestamp) })) : [];
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('rambo_settings_v4');
    return saved ? { ...INITIAL_SETTINGS, ...JSON.parse(saved) } : INITIAL_SETTINGS;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : Object.values(CategoryEnum);
  });

  const [brands, setBrands] = useState<string[]>(() => {
    const saved = localStorage.getItem('brands');
    if (saved) return JSON.parse(saved);
    return Array.from(new Set(products.map(p => p.brand)));
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('rambo_users');
    return saved ? JSON.parse(saved).map((u: any) => ({ ...u, createdAt: new Date(u.createdAt) })) : [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('rambo_current_user');
    if (!saved || saved === 'null') return null;
    try {
      const parsed = JSON.parse(saved);
      return parsed ? { ...parsed, createdAt: new Date(parsed.createdAt) } : null;
    } catch { return null; }
  });

  // --- PERSISTENT CHECKOUT DATA (Never lost) ---
  const [checkoutData, setCheckoutData] = useState(() => {
    const saved = localStorage.getItem('rambo_checkout_data');
    const defaultData = { 
      name: '', phone: '', email: '', marketingOptIn: true,
      time: 'ASAP', payment: PaymentMethod.InStore, 
      orderType: 'pickup' as OrderType, deliveryAddress: '', notes: '' 
    };
    return saved ? JSON.parse(saved) : defaultData;
  });

  const [isSaving, setIsSaving] = useState(false);

  // --- ATOMIC SYNC: Universal Database Sync ---
  useEffect(() => { 
    setIsSaving(true);
    localStorage.setItem('rambo_products_v4', JSON.stringify(products));
    localStorage.setItem('rambo_orders_v4', JSON.stringify(orders));
    localStorage.setItem('message_logs', JSON.stringify(messageLogs));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('brands', JSON.stringify(brands));
    localStorage.setItem('favorites', JSON.stringify(favorites));
    localStorage.setItem('rambo_settings_v4', JSON.stringify(settings));
    localStorage.setItem('rambo_users', JSON.stringify(users));
    localStorage.setItem('rambo_current_user', JSON.stringify(currentUser));
    localStorage.setItem('rambo_checkout_data', JSON.stringify(checkoutData));
    
    const timeout = setTimeout(() => setIsSaving(false), 800);
    return () => clearTimeout(timeout);
  }, [products, orders, messageLogs, categories, brands, favorites, settings, users, currentUser, checkoutData]);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [customerPinInput, setCustomerPinInput] = useState('');
  const [customerPinError, setCustomerPinError] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('rambo_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('rambo_cart', JSON.stringify(cart));
  }, [cart]);

  const handleAdminExit = useCallback(() => {
    setIsAdmin(false);
    setIsAdminPasswordModalOpen(false);
    setSettings(prev => ({ ...prev, isStoreOpen: false }));
  }, []);

  const handleAdminEnter = () => {
    setIsAdminPasswordModalOpen(true);
  };

  const verifyAdminPassword = () => {
    if (adminPasswordInput === settings.adminPassword) {
      setIsAdmin(true);
      setIsAdminPasswordModalOpen(false);
      setAdminPasswordInput('');
      setPasswordError(false);
      setSettings(prev => ({ ...prev, isStoreOpen: true }));
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 1000);
    }
  };

  const verifyCustomerPin = () => {
    if (customerPinInput === settings.customerPin) {
      setIsCustomerUnlocked(true);
      sessionStorage.setItem('customer_unlocked', 'true');
      setCustomerPinInput('');
      setCustomerPinError(false);
    } else {
      setCustomerPinError(true);
      setTimeout(() => setCustomerPinError(false), 1000);
    }
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === item.productId && i.weight === item.weight);
      if (existing) {
        return prev.map(i => 
          (i.productId === item.productId && i.weight === item.weight) 
            ? { ...i, quantity: i.quantity + item.quantity } 
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (productId: string, weight: string) => {
    setCart(prev => prev.filter(i => !(i.productId === productId && i.weight === weight)));
  };

  const updateCartQuantity = (productId: string, weight: string, delta: number) => {
    setCart(prev => prev.map(i => 
      (i.productId === productId && i.weight === weight) 
        ? { ...i, quantity: Math.max(1, i.quantity + delta) } 
        : i
    ));
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId];
      
      // If user is logged in, sync their account favorites
      if (currentUser) {
        const updatedUser = { ...currentUser, favorites: newFavorites };
        setCurrentUser(updatedUser);
        setUsers(uList => uList.map(u => u.id === updatedUser.id ? updatedUser : u));
      }
      
      return newFavorites;
    });
  };

  const placeOrder = (name: string, phone: string, time: string, paymentMethod: PaymentMethod, orderType: OrderType, deliveryAddress?: string, notes?: string, email?: string, marketingOptIn: boolean = false) => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      userId: currentUser?.id,
      customerName: name, customerPhone: phone, customerEmail: email, marketingOptIn,
      items: [...cart], total, status: OrderStatus.Placed, timestamp: new Date(),
      pickupTime: time, paymentMethod, paymentStatus: PaymentStatus.Unpaid, orderType,
      deliveryAddress, notes
    };
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  if (!isAgeVerified) {
    return <AgeGate onVerify={() => {
      setIsAgeVerified(true);
      localStorage.setItem('age_verified', 'true');
    }} />;
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-[#05070a] overflow-hidden">
      {/* Global Autosave Indicator */}
      <div className="fixed top-4 right-4 z-[5000] flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-xl rounded-full border border-white/5 pointer-events-none transition-opacity duration-300">
        {isSaving ? (
          <RefreshCw size={12} className="text-emerald-500 animate-spin" />
        ) : (
          <CloudCheck size={12} className="text-emerald-500" />
        )}
        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Vault Sync Active</span>
      </div>

      {settings.customerPinEnabled && !isCustomerUnlocked && !isAdmin && (
        <div className="fixed inset-0 w-full h-full bg-[#05070a] flex items-center justify-center p-6 z-[4000]">
          <div className="max-w-md w-full bg-[#0a0d14] rounded-[56px] border border-slate-900 p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] rounded-full"></div>
            <div className="w-20 h-20 bg-emerald-600/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-inner">
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Authorized Access</h2>
            <p className="text-slate-500 font-bold mb-10 leading-relaxed italic">The vault is currently locked. Enter authorized entry pin.</p>
            <div className={`space-y-8 transition-all ${customerPinError ? 'animate-shake' : ''}`}>
              <input 
                type="password" autoFocus value={customerPinInput}
                onChange={(e) => setCustomerPinInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && verifyCustomerPin()}
                className="w-full bg-slate-950 border border-slate-800 rounded-[32px] px-8 py-6 text-center font-black text-white text-3xl tracking-[15px] outline-none transition-all shadow-inner focus:border-emerald-500"
                placeholder="••••"
              />
              <button onClick={verifyCustomerPin} className="w-full bg-emerald-600 text-white py-7 rounded-[32px] font-black uppercase tracking-[4px] text-xs shadow-2xl">UNLOCK VAULT</button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN LAYER */}
      <div style={{ display: isAdmin ? 'block' : 'none' }} className="absolute inset-0 z-[100] transition-opacity duration-300">
        <AdminApp 
          products={products} setProducts={setProducts} 
          orders={orders} settings={settings} setSettings={setSettings}
          updateOrderStatus={updateOrderStatus} categories={categories}
          setCategories={setCategories} brands={brands} setBrands={setBrands}
          onExit={handleAdminExit}
        />
      </div>
      
      {/* CUSTOMER LAYER */}
      <div style={{ display: !isAdmin ? 'block' : 'none' }} className="absolute inset-0 overflow-y-auto z-[50] transition-opacity duration-300">
        <CustomerApp 
          products={products} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart}
          updateCartQuantity={updateCartQuantity} placeOrder={placeOrder}
          settings={settings} orders={orders} categories={categories}
          favorites={favorites} toggleFavorite={toggleFavorite}
          currentUser={currentUser} onLogin={(p) => {
            const user = users.find(u => u.phone === p);
            if (user) { 
              setCurrentUser(user); 
              // Load user's favorites into global favorites state on login
              if (user.favorites) setFavorites(user.favorites);
              return true; 
            }
            return false;
          }} 
          onRegister={(n, p, e) => {
            const newUser: User = { 
              id: Math.random().toString(36).substr(2, 9).toUpperCase(), 
              name: n, phone: p, email: e, addresses: [], points: 0, 
              favorites: favorites, // Carry over guest favorites to new account
              createdAt: new Date() 
            };
            setUsers(prev => [...prev, newUser]);
            setCurrentUser(newUser);
            return true;
          }}
          onLogout={() => {
            setCurrentUser(null);
            // Optionally clear favorites on logout if you want strictly per-account guest experience
            // setFavorites([]); 
          }} 
          updateUser={u => setUsers(prev => prev.map(x => x.id === u.id ? u : x))}
          onStaffLogin={handleAdminEnter}
          checkoutData={checkoutData}
          setCheckoutData={setCheckoutData}
        />
      </div>

      {isAdminPasswordModalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#05070a]/90 backdrop-blur-xl" onClick={() => setIsAdminPasswordModalOpen(false)}></div>
          <div className={`relative w-full max-w-sm bg-[#0a0d14] rounded-[40px] border p-10 shadow-2xl transition-all duration-300 ${passwordError ? 'border-red-500 animate-shake' : 'border-slate-800'}`}>
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500"><Lock size={24}/></div>
                <h3 className="text-xl font-black text-white uppercase tracking-widest">Staff Entry</h3>
              </div>
              <button onClick={() => setIsAdminPasswordModalOpen(false)} className="text-slate-600 hover:text-white transition-colors cursor-pointer p-2"><X size={24}/></button>
            </div>
            <div className="space-y-8">
              <input 
                type="password" autoFocus value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && verifyAdminPassword()}
                className="w-full bg-slate-950 border border-slate-900 rounded-[24px] px-8 py-5 text-center font-black text-white text-2xl tracking-[10px] focus:border-blue-500 outline-none transition-all"
                placeholder="••••"
              />
              <button onClick={verifyAdminPassword} className="w-full bg-blue-600 text-white py-6 rounded-[24px] font-black uppercase tracking-[4px] text-xs shadow-xl active:scale-95 transition-all">AUTHORIZE STAFF</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        .animate-shake { animation: shake 0.2s both; }
      `}</style>
    </div>
  );
};

export default App;
