
import React, { useState, useRef, useEffect } from 'react';
import { 
  Package, 
  Settings as SettingsIcon, 
  ClipboardList,
  Plus, 
  Trash2,
  Clock,
  TrendingUp,
  AlertTriangle,
  X,
  RefreshCw,
  LayoutGrid,
  ShieldCheck,
  LogOut,
  Zap,
  MapPin,
  ImageIcon,
  Boxes,
  MessageSquare,
  Globe,
  Volume2,
  Coins,
  Wand2,
  ChevronRight,
  Sparkles,
  Lock,
  CloudCheck,
  Truck,
  Bot,
  Layers,
  Check,
  Star,
  PlusCircle,
  Github,
  CloudUpload,
  Link2,
  Image as LucideImage,
  Upload
} from 'lucide-react';
import { Product, Order, StoreSettings, OrderStatus, StrainType, WeightPrice, MessagingSettings, LoyaltySettings, GitHubSettings } from '../types';
import { generateProductDescription, removeImageBackground } from '../services/geminiService';

interface AdminAppProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  settings: StoreSettings;
  setSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  brands: string[];
  setBrands: React.Dispatch<React.SetStateAction<string[]>>;
  onExit: () => void;
}

function SidebarIconButton({ active, onClick, icon, title }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string }) {
  return (
    <button onClick={onClick} className={`w-16 h-16 flex flex-col items-center justify-center rounded-2xl transition-all relative group cursor-pointer ${active ? 'bg-emerald-500 text-white shadow-xl scale-110' : 'text-slate-700 hover:text-slate-300 hover:bg-slate-900/50'}`}>
      {active && <div className="absolute -left-5 w-1.5 h-8 bg-emerald-500 rounded-r-full shadow-[0_0_15px_#10b981]"></div>}
      <div className="mb-1">{icon}</div>
      <span className={`text-[7px] font-black uppercase tracking-widest ${active ? 'text-white' : 'opacity-40'}`}>{title}</span>
    </button>
  );
}

function StatCard({ title, value, icon, alert, color }: { title: string; value: any; icon: React.ReactNode; color: string; alert?: boolean }) {
  return (
    <div className={`bg-[#0a0d14] border border-slate-900 p-10 rounded-[48px] shadow-2xl relative overflow-hidden transition-all hover:scale-[1.02]`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 blur-[80px] rounded-full`}></div>
      <div className="flex items-center justify-between mb-10 relative z-10">
        <span className="text-slate-500 text-[10px] font-black uppercase tracking-[4px]">{title}</span>
        <div className={`w-12 h-12 rounded-2xl bg-${color}-500/10 flex items-center justify-center text-${color}-500`}>{icon}</div>
      </div>
      <div className="text-5xl font-black text-white relative z-10 tracking-tighter">{value}</div>
      {alert && <div className="mt-8 flex items-center gap-2 relative z-10 animate-pulse"><span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_orange]"></span><span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Attention Required</span></div>}
    </div>
  );
}

function FormField({ label, icon, children }: { label: string; icon: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black uppercase text-slate-500 tracking-[5px] ml-4 flex items-center gap-2">{icon} {label}</label>
      <div className="relative">
        {children}
      </div>
    </div>
  );
}

function ToggleRow({ active, onToggle, label, description, icon }: { active: boolean; onToggle: () => void; label: string; description: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer" onClick={(e) => { e.preventDefault(); onToggle(); }}>
      <div className="flex-1 pr-10">
         <div className="flex items-center gap-3">
            {icon && <div className={active ? 'text-emerald-500' : 'text-slate-700'}>{icon}</div>}
            <h4 className={`font-black text-xl transition-colors ${active ? 'text-white' : 'text-slate-800'} tracking-tighter`}>{label}</h4>
         </div>
         <p className="text-[10px] text-slate-700 font-bold mt-1 tracking-widest uppercase">{description}</p>
      </div>
      <div className={`w-20 h-10 rounded-full p-1.5 transition-all duration-500 relative border-2 shrink-0 ${active ? 'bg-emerald-600 border-emerald-400' : 'bg-slate-950 border-slate-900'}`}>
        <div className={`w-6 h-6 bg-white rounded-full transition-all duration-500 shadow-2xl relative z-10 ${active ? 'translate-x-10' : 'translate-x-0'}`}></div>
      </div>
    </div>
  );
}

const Dashboard: React.FC<{ stats: any }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
      <StatCard title="Total Revenue" value={`$${stats.todayRevenue.toFixed(2)}`} icon={<TrendingUp size={24}/>} color="emerald" />
      <StatCard title="Active Orders" value={stats.pendingOrders} icon={<ClipboardList size={24}/>} color="blue" alert={stats.pendingOrders > 0} />
      <StatCard title="Low Inventory" value={stats.lowStock} icon={<AlertTriangle size={24}/>} color="orange" alert={stats.lowStock > 0} />
      <StatCard title="Active SKUs" value={stats.activeProducts} icon={<Boxes size={24}/>} color="purple" />
    </div>
  );
};

const OrderManager: React.FC<{ orders: Order[]; updateOrderStatus: (id: string, status: OrderStatus) => void }> = ({ orders, updateOrderStatus }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {orders.length === 0 ? (
        <div className="py-40 text-center opacity-20 flex flex-col items-center">
          <ClipboardList size={80} className="mb-6" />
          <p className="font-black uppercase tracking-[8px]">Queue Empty</p>
        </div>
      ) : (
        orders.map(order => (
          <div key={order.id} className="bg-[#0a0d14] border border-slate-900 rounded-[48px] p-10 flex flex-col md:flex-row items-center justify-between gap-10 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-8">
               <div className="w-20 h-20 rounded-[32px] bg-slate-950 flex flex-col items-center justify-center border border-white/5">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">ID</span>
                  <span className="text-white font-black text-sm uppercase">#{order.id.slice(0, 4)}</span>
               </div>
               <div>
                  <h4 className="text-2xl font-black text-white tracking-tighter">{order.customerName}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Clock size={12}/> {order.pickupTime}</span>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{order.orderType}</span>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-8">
               <div className="text-right">
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Value</span>
                  <span className="text-3xl font-black text-white">${order.total.toFixed(2)}</span>
               </div>
               <div className="flex gap-3">
                  {Object.values(OrderStatus).map(status => (
                    <button 
                      key={status} 
                      onClick={() => updateOrderStatus(order.id, status)}
                      className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${order.status === status ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-slate-900 text-slate-600 hover:text-white'}`}
                    >
                      {status}
                    </button>
                  ))}
               </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const ProductManager: React.FC<{ products: Product[]; onEdit: (p: Product) => void; onAdd: () => void }> = ({ products, onEdit, onAdd }) => {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[6px]">Active Vault Inventory ({products.length})</h3>
        <button onClick={onAdd} className="bg-emerald-600 text-white px-10 py-5 rounded-[28px] font-black uppercase tracking-[4px] text-[11px] flex items-center gap-3 shadow-2xl active:scale-95 transition-all">
          <Plus size={18} /> New Product SKU
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {products.map(product => {
          const totalStock = product.weights.reduce((sum, w) => sum + w.stock, 0);
          return (
            <div key={product.id} onClick={() => onEdit(product)} className="bg-[#0a0d14] border border-slate-900 rounded-[56px] overflow-hidden group cursor-pointer hover:border-emerald-500/30 transition-all shadow-2xl relative">
              <div className="aspect-[4/3] relative bg-slate-950 overflow-hidden">
                <img src={product.image} className="w-full h-full object-contain p-8 group-hover:scale-110 duration-1000" />
                <div className="absolute top-6 left-6 flex gap-2">
                  <div className="bg-white/95 backdrop-blur-xl px-4 py-2 rounded-2xl text-[8px] font-black text-black flex items-center gap-2 border border-white/5 shadow-2xl"><img src={product.brandLogo} className="w-4 h-4 rounded-full" /> {product.brand}</div>
                  <div className={`px-4 py-2 rounded-2xl text-[8px] font-black text-white border border-white/5 shadow-2xl ${product.isPublished ? 'bg-emerald-600' : 'bg-rose-600'}`}>{product.isPublished ? 'LIVE' : 'HIDDEN'}</div>
                </div>
              </div>
              <div className="p-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-black text-white leading-tight tracking-tight">{product.name}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{product.category} • {product.type}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-500 font-black text-xl">${Math.min(...product.weights.map(w => w.price))}</span>
                  </div>
                </div>
                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${totalStock < 10 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-emerald-500'}`}></div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{totalStock} UNITS IN VAULT</span>
                   </div>
                   <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{product.thc}% THC</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AllInOneProductTool: React.FC<{ 
  product: Product; 
  categories: string[]; 
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  brands: string[]; 
  setBrands: React.Dispatch<React.SetStateAction<string[]>>;
  onClose: () => void; 
  onSave: (p: Product) => void; 
  onDelete?: () => void;
}> = ({ product, categories, setCategories, brands, setBrands, onClose, onSave, onDelete }) => {
  const [data, setData] = useState<Product>(product);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);
  const [showAddBrand, setShowAddBrand] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const brandLogoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onSave(data);
  }, [data, onSave]);

  const handleFileCapture = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'brandLogo') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        const base64Data = dataUrl.split(',')[1];
        const mimeType = file.type || 'image/jpeg';
        
        setData(prev => ({ ...prev, [field]: dataUrl }));

        if (field === 'image') {
          try {
            const cleaned = await removeImageBackground(base64Data, mimeType);
            if (cleaned) {
              setData(prev => ({ ...prev, image: cleaned }));
            }
          } catch (error) {
            console.error("BG removal error:", error);
          } finally {
            setIsProcessing(false);
          }
        } else {
          setIsProcessing(false);
        }
    };
    reader.readAsDataURL(file);
  };

  const handleAiDescription = async () => {
    if (!data.name || !data.brand) return alert("Flavor and Brand must be set for AI generation.");
    setIsAiGenerating(true);
    const result = await generateProductDescription(data.name, data.brand, data.category, data.type, data.thc);
    if (result) {
      setData(prev => ({
        ...prev,
        description: result.fullDescription || prev.description,
        shortDescription: result.shortDescription || prev.shortDescription,
        tags: result.tags || prev.tags
      }));
    }
    setIsAiGenerating(false);
  };

  const addCategory = () => {
    if (!newCat.trim()) return;
    if (!categories.includes(newCat)) setCategories(prev => [...prev, newCat]);
    setData(prev => ({ ...prev, category: newCat }));
    setNewCat('');
    setShowAddCat(false);
  };

  const addBrand = () => {
    if (!newBrand.trim()) return;
    if (!brands.includes(newBrand)) setBrands(prev => [...prev, newBrand]);
    setData(prev => ({ ...prev, brand: newBrand }));
    setNewBrand('');
    setShowAddBrand(false);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 sm:p-12 backdrop-blur-3xl animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/98" onClick={onClose}></div>
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-5xl bg-[#0a0d14] rounded-[64px] border border-white/5 overflow-hidden flex flex-col max-h-[96vh] shadow-[0_0_150px_rgba(0,0,0,0.8)]">
        <div className="p-10 border-b border-white/5 bg-[#0a0d14] flex justify-between items-center shrink-0 z-10">
           <div className="space-y-1">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Genetics Vault Entry Tool</h2>
              <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Integrated All-In-One System
              </p>
           </div>
           <button onClick={onClose} className="p-4 bg-slate-900/80 text-slate-500 rounded-full hover:text-rose-500 transition-all border border-white/5"><X size={28}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 sm:p-16 space-y-12 custom-scrollbar">
          {/* 1. Visual Capture & AI Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[5px] ml-4 flex items-center gap-2"><ImageIcon size={14}/> Product Photo (AI BG Strip)</h4>
              <div className="h-64 relative bg-slate-950 rounded-[40px] border border-white/5 group overflow-hidden">
                <img src={data.image} className="w-full h-full object-contain p-6 transition-transform duration-1000 group-hover:scale-110" />
                {isProcessing && (
                  <div className="absolute inset-0 bg-emerald-600/90 backdrop-blur-3xl flex flex-col items-center justify-center animate-in fade-in">
                    <RefreshCw className="animate-spin text-white mb-4" size={40}/>
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">AI Scrubbing...</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button onClick={() => fileInputRef.current?.click()} className="bg-white text-black px-6 py-3 rounded-full font-black uppercase text-[8px] tracking-[4px] shadow-2xl active:scale-95 transition-all">Select Image</button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileCapture(e, 'image')} />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[5px] ml-4 flex items-center gap-2"><LucideImage size={14}/> Brand Identity (Logo)</h4>
              <div className="h-64 relative bg-slate-950 rounded-[40px] border border-white/5 group overflow-hidden">
                <img src={data.brandLogo} className="w-full h-full object-contain p-12 transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button onClick={() => brandLogoInputRef.current?.click()} className="bg-white text-black px-6 py-3 rounded-full font-black uppercase text-[8px] tracking-[4px] shadow-2xl active:scale-95 transition-all">Upload Logo</button>
                </div>
                <input ref={brandLogoInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileCapture(e, 'brandLogo')} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Category */}
            <FormField label="Vault Section (Category)" icon={<Boxes size={16}/>}>
              <div className="flex gap-4">
                <select value={data.category} onChange={e => setData({...data, category: e.target.value})} className="form-input-premium flex-1">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={() => setShowAddCat(!showAddCat)} className="bg-slate-900 p-6 rounded-[28px] border border-white/10 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all">
                  <Plus size={24}/>
                </button>
              </div>
              {showAddCat && (
                <div className="mt-4 flex gap-3 animate-in slide-in-from-top-2">
                  <input value={newCat} onChange={e => setNewCat(e.target.value)} className="form-input-premium flex-1" placeholder="New Category Name..." />
                  <button onClick={addCategory} className="bg-emerald-600 px-8 rounded-[28px] font-black uppercase text-[10px] tracking-widest text-white">Save</button>
                </div>
              )}
            </FormField>

            {/* Brand */}
            <FormField label="Genetics Provider (Brand)" icon={<Zap size={16}/>}>
              <div className="flex gap-4">
                <select value={data.brand} onChange={e => setData({...data, brand: e.target.value})} className="form-input-premium flex-1">
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <button onClick={() => setShowAddBrand(!showAddBrand)} className="bg-slate-900 p-6 rounded-[28px] border border-white/10 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all">
                  <Plus size={24}/>
                </button>
              </div>
              {showAddBrand && (
                <div className="mt-4 flex gap-3 animate-in slide-in-from-top-2">
                  <input value={newBrand} onChange={e => setNewBrand(e.target.value)} className="form-input-premium flex-1" placeholder="New Brand Name..." />
                  <button onClick={addBrand} className="bg-emerald-600 px-8 rounded-[28px] font-black uppercase text-[10px] tracking-widest text-white">Save</button>
                </div>
              )}
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <FormField label="Flavor / Strain Name" icon={<Sparkles size={16}/>}>
              <input value={data.name} onChange={e => setData({...data, name: e.target.value})} className="form-input-premium text-2xl" placeholder="Ex. Purple Runtz..." />
            </FormField>
            <div className="grid grid-cols-2 gap-10">
              <FormField label="THC Level (%)" icon={<TrendingUp size={16}/>}>
                <input type="number" step="0.1" value={data.thc} onChange={e => setData({...data, thc: parseFloat(e.target.value) || 0})} className="form-input-premium" />
              </FormField>
              <FormField label="Strain Type" icon={<LayoutGrid size={16}/>}>
                <select value={data.type} onChange={e => setData({...data, type: e.target.value as StrainType})} className="form-input-premium">
                  {Object.values(StrainType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </FormField>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[5px] ml-4 flex items-center gap-2"><Package size={14}/> Variations & Stock Control</h4>
            <div className="space-y-4">
              {data.weights.map((w, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-4 bg-slate-950 p-6 rounded-[32px] border border-white/5">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-4">Weight Format</span>
                    <input value={w.weight} placeholder="e.g. 3.5g" onChange={e => setData({...data, weights: data.weights.map((wt, i) => i === idx ? {...wt, weight: e.target.value} : wt)})} className="bg-transparent border-none outline-none font-black text-white px-4 w-full" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-4">Current Stock</span>
                    <input type="number" placeholder="Units" value={w.stock} onChange={e => setData({...data, weights: data.weights.map((wt, i) => i === idx ? {...wt, stock: parseInt(e.target.value) || 0} : wt)})} className="bg-transparent border-none outline-none font-black text-white px-4 w-full" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-4">Price ($)</span>
                    <input type="number" step="0.01" placeholder="Valuation" value={w.price} onChange={e => setData({...data, weights: data.weights.map((wt, i) => i === idx ? {...wt, price: parseFloat(e.target.value) || 0} : wt)})} className="bg-transparent border-none outline-none font-black text-emerald-500 px-4 w-full" />
                  </div>
                </div>
              ))}
              <button onClick={() => setData({...data, weights: [...data.weights, { weight: '', price: 0, stock: 0 }]})} className="w-full py-4 border-2 border-dashed border-white/5 rounded-[28px] text-[9px] font-black uppercase tracking-[4px] text-slate-700 hover:text-emerald-500 hover:border-emerald-500 transition-all">+ Add Weight Profile</button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center ml-4">
               <label className="text-[10px] font-black uppercase text-slate-500 tracking-[5px] flex items-center gap-2"><MessageSquare size={14}/> AI Genetics Description</label>
               <button onClick={handleAiDescription} disabled={isAiGenerating} className="bg-emerald-600/10 text-emerald-500 px-6 py-3 rounded-2xl border border-emerald-500/20 text-[9px] font-black uppercase tracking-[3px] flex items-center gap-3 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50">
                {isAiGenerating ? <RefreshCw className="animate-spin" size={14}/> : <Wand2 size={14}/>} {isAiGenerating ? 'AI Synthesizing...' : 'Regenerate Narrative'}
               </button>
            </div>
            <textarea value={data.description} onChange={e => setData({...data, description: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-10 rounded-[48px] text-slate-400 font-medium text-lg min-h-[160px] outline-none focus:border-emerald-500 transition-all leading-relaxed custom-scrollbar" />
          </div>
        </div>

        <div className="p-12 border-t border-white/5 bg-[#0a0d14] flex gap-6 shrink-0 z-10">
          {onDelete && <button onClick={onDelete} className="p-8 rounded-[40px] bg-rose-950/20 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all active:scale-95"><Trash2 size={32}/></button>}
          <button onClick={onClose} className="flex-1 bg-emerald-600 text-white font-black py-8 rounded-[48px] uppercase tracking-[10px] text-[14px] shadow-2xl hover:bg-emerald-500 transition-all active:scale-[0.98]">AUTHORIZE & SAVE PRODUCT</button>
        </div>
      </div>
      <style>{`
        .form-input-premium { width: 100%; background: #05070a; border: 1px solid rgba(255,255,255,0.05); border-radius: 28px; padding: 20px 28px; font-weight: 900; color: white; outline: none; transition: all 0.3s; appearance: none; }
        .form-input-premium:focus { border-color: #10b981; box-shadow: 0 0 20px rgba(16,185,129,0.1); }
      `}</style>
    </div>
  );
};

const Settings: React.FC<{ settings: StoreSettings; setSettings: React.Dispatch<React.SetStateAction<StoreSettings>> }> = ({ settings, setSettings }) => {
  const updateMessaging = (updates: Partial<MessagingSettings>) => setSettings(prev => ({ ...prev, messaging: { ...prev.messaging, ...updates } }));
  const updateLoyalty = (updates: Partial<LoyaltySettings>) => setSettings(prev => ({ ...prev, loyalty: { ...prev.loyalty, ...updates } }));
  const updateGitHub = (updates: Partial<GitHubSettings>) => setSettings(prev => ({ ...prev, github: { ...prev.github, ...updates } }));
  const [isLinking, setIsLinking] = useState(false);
  const storeLogoInputRef = useRef<HTMLInputElement>(null);

  const handleGitHubLink = () => {
    setIsLinking(true);
    setTimeout(() => {
      updateGitHub({ connected: true, enabled: true, lastSync: new Date().toLocaleString() });
      setIsLinking(false);
    }, 2000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setSettings(prev => ({ ...prev, logoUrl: event.target?.result as string }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-5xl space-y-16 animate-in fade-in duration-500 pb-96">
      <div className="bg-[#0a0d14] border border-slate-900 p-14 rounded-[64px] shadow-2xl space-y-12">
        <h3 className="text-3xl font-black text-white flex items-center gap-6 uppercase tracking-tighter"><LucideImage className="text-emerald-500" size={32}/> Brand Identity</h3>
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-48 h-48 bg-slate-950 rounded-[48px] border border-white/5 flex items-center justify-center overflow-hidden relative group">
            <img src={settings.logoUrl} className="w-full h-full object-contain p-6" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => storeLogoInputRef.current?.click()}><Upload className="text-white" size={32}/></div>
            <input ref={storeLogoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </div>
          <div className="flex-1 space-y-4">
             <h4 className="text-xl font-black text-white uppercase tracking-tight">Vault Master Logo</h4>
             <p className="text-slate-500 text-sm font-medium leading-relaxed italic">Upload the primary branding for your dispensary vault.</p>
             <button onClick={() => storeLogoInputRef.current?.click()} className="bg-emerald-600/10 text-emerald-500 px-8 py-3 rounded-2xl border border-emerald-500/20 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 hover:text-white transition-all">Select Media</button>
          </div>
        </div>
      </div>

      <div className="bg-[#0a0d14] border border-slate-900 p-14 rounded-[64px] shadow-2xl space-y-12">
        <h3 className="text-3xl font-black text-white flex items-center gap-6 uppercase tracking-tighter"><Globe className="text-emerald-500" size={32}/> Operations Master</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <ToggleRow active={settings.pickupOn} onToggle={() => setSettings(s => ({...s, pickupOn: !s.pickupOn}))} label="Pickup Portal" description="Enable client pickup transmissions." icon={<Package size={20}/>} />
          <ToggleRow active={settings.deliveryOn} onToggle={() => setSettings(s => ({...s, deliveryOn: !s.deliveryOn}))} label="Delivery Protocol" description="Enable exotic delivery logistics." icon={<Truck size={20}/>} />
          <ToggleRow active={settings.locationRequirementOn} onToggle={() => setSettings(s => ({...s, locationRequirementOn: !s.locationRequirementOn}))} label="Proximity Check" description="GPS verification required." icon={<MapPin size={20}/>} />
          <ToggleRow active={settings.alarmSoundOn} onToggle={() => setSettings(s => ({...s, alarmSoundOn: !s.alarmSoundOn}))} label="Audible Alerts" description="Sonic notifications active." icon={<Volume2 size={20}/>} />
        </div>
      </div>
      
      <div className="bg-[#0a0d14] border border-slate-900 p-14 rounded-[64px] shadow-2xl space-y-12">
        <h3 className="text-3xl font-black text-white flex items-center gap-6 uppercase tracking-tighter"><Github className="text-slate-400" size={32}/> Cloud Sync</h3>
        {!settings.github.connected ? (
          <button onClick={handleGitHubLink} disabled={isLinking} className="w-full bg-white text-black py-8 rounded-[40px] font-black uppercase tracking-[8px] text-[13px] flex items-center justify-center gap-4 hover:bg-slate-100 transition-all active:scale-95">
            {isLinking ? <RefreshCw className="animate-spin" size={20}/> : <Link2 size={20}/>}
            {isLinking ? 'SYNCING...' : 'CONNECT GITHUB VAULT'}
          </button>
        ) : (
          <div className="flex items-center gap-4 text-emerald-500 font-black uppercase tracking-widest text-xs"><CloudCheck size={20}/> VAULT CONNECTED TO {settings.github.repoName}</div>
        )}
      </div>
    </div>
  );
};

const AdminApp: React.FC<AdminAppProps> = ({ 
  products, setProducts, orders, settings, setSettings, updateOrderStatus, categories, setCategories, brands, setBrands, onExit
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard'|'orders'|'inventory'|'settings'|'logs'>('dashboard');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const stats = {
    todayRevenue: orders.filter(o => o.status !== OrderStatus.Cancelled).reduce((sum, o) => sum + o.total, 0),
    pendingOrders: orders.filter(o => o.status === OrderStatus.Placed || o.status === OrderStatus.Accepted).length,
    lowStock: products.filter(p => p.weights.some(w => w.stock < 5)).length,
    activeProducts: products.filter(p => p.isPublished).length
  };

  const handleAddNewProduct = () => {
    const newProduct: Product = {
      id: Math.random().toString(36).substr(2,9).toUpperCase(),
      name: '', brand: brands[0] || 'Unknown', category: categories[0] || 'Uncategorized', type: StrainType.Hybrid, thc: 0,
      description: '', shortDescription: '', tags: [], image: 'https://picsum.photos/seed/sku/800/800',
      brandLogo: 'https://picsum.photos/seed/brand/200/200', weights: [{ weight: '3.5g', price: 0, stock: 0 }], isPublished: true
    };
    setProducts(prev => [newProduct, ...prev]);
    setEditingProduct(newProduct);
  };

  return (
    <div className="flex h-screen w-full bg-[#05070a] text-slate-100 overflow-hidden font-sans relative">
      <aside className="w-24 bg-[#0a0d14] border-r border-slate-900 flex flex-col items-center py-10 z-[100] shadow-2xl">
        <div className="mb-12">
          {settings.logoUrl ? <img src={settings.logoUrl} className="w-12 h-12 rounded-2xl object-cover shadow-2xl" /> : <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">R</div>}
        </div>
        <nav className="flex-1 flex flex-col gap-10 items-center">
          <SidebarIconButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutGrid size={24}/>} title="Stats" />
          <SidebarIconButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ClipboardList size={24}/>} title="Queue" />
          <SidebarIconButton active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package size={24}/>} title="SKUs" />
          <SidebarIconButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={24}/>} title="Tools" />
        </nav>
        <button onClick={onExit} className="mt-auto p-4 text-slate-700 hover:text-rose-500 transition-colors cursor-pointer group"><LogOut size={26}/><span className="text-[7px] font-black uppercase mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Exit</span></button>
      </aside>

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <header className="h-28 flex items-center justify-between px-14 border-b border-slate-900/50 bg-[#05070a] z-[90]">
          <h2 className="text-4xl font-black uppercase tracking-[4px] text-white leading-none">{activeTab.toUpperCase()}</h2>
          <button onClick={onExit} className="bg-slate-900 px-8 py-4 rounded-[20px] border border-slate-800 text-[10px] font-black uppercase tracking-[3px] hover:border-rose-500/50 hover:text-rose-500 transition-all">Vault Lock</button>
        </header>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar min-h-0">
          {activeTab === 'dashboard' && <Dashboard stats={stats} />}
          {activeTab === 'orders' && <OrderManager orders={orders} updateOrderStatus={updateOrderStatus} />}
          {activeTab === 'inventory' && <ProductManager products={products} onEdit={setEditingProduct} onAdd={handleAddNewProduct} />}
          {activeTab === 'settings' && <Settings settings={settings} setSettings={setSettings} />}
        </div>
      </main>

      {editingProduct && (
        <AllInOneProductTool 
          product={editingProduct} categories={categories} setCategories={setCategories}
          brands={brands} setBrands={setBrands} onClose={() => setEditingProduct(null)} 
          onSave={p => setProducts(prev => prev.map(old => old.id === p.id ? p : old))} 
          onDelete={() => { setProducts(prev => prev.filter(p => p.id !== editingProduct.id)); setEditingProduct(null); }} 
        />
      )}
    </div>
  );
};

export default AdminApp;
