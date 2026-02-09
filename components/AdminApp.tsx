
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
  Timer,
  ImageIcon,
  Boxes,
  MessageSquare,
  Globe,
  Bell,
  Volume2,
  Coins,
  Wand2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Lock,
  CloudCheck,
  Truck,
  Mail,
  Smartphone,
  Gift,
  Search,
  Bot,
  Layers,
  Check,
  Star,
  Activity,
  PlusCircle,
  Github,
  CloudUpload,
  Link2
} from 'lucide-react';
import { Product, Order, StoreSettings, OrderStatus, StrainType, WeightPrice, MessageLog, MessagingSettings, LoyaltySettings, GitHubSettings } from '../types';
import { getCategoryIcon } from '../constants';
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

// --- HELPER COMPONENTS ---

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

const Dashboard: React.FC<{ stats: any }> = ({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <StatCard title="Total Transmission Value" value={`$${stats.todayRevenue.toLocaleString()}`} icon={<TrendingUp size={24} />} color="emerald" />
    <StatCard title="Active Queue" value={stats.pendingOrders} icon={<Clock size={24} />} color="blue" alert={stats.pendingOrders > 0} />
    <StatCard title="Genetics Shortage" value={stats.lowStock} icon={<AlertTriangle size={24} />} color="orange" alert={stats.lowStock > 0} />
    <StatCard title="Total Vault SKUs" value={stats.activeProducts} icon={<Boxes size={24} />} color="purple" />
  </div>
);

const OrderManager: React.FC<{ orders: Order[]; updateOrderStatus: (id: string, status: OrderStatus) => void }> = ({ orders, updateOrderStatus }) => (
  <div className="bg-[#0a0d14] border border-slate-900 rounded-[56px] overflow-hidden shadow-2xl animate-in fade-in duration-500">
    <table className="w-full text-left">
      <thead className="text-[10px] text-slate-600 font-black uppercase tracking-[4px] border-b border-slate-900/50 bg-slate-950/30">
        <tr><th className="p-10">Vault ID</th><th className="p-10">Client Identity</th><th className="p-10 text-center">Protocol Status</th><th className="p-10 text-right">Value</th></tr>
      </thead>
      <tbody className="divide-y divide-slate-900/30">
        {orders.map(o => (
          <tr key={o.id} className="hover:bg-white/[0.01] transition-all group">
            <td className="p-10 font-black text-white uppercase text-xs tracking-widest">#{o.id}</td>
            <td className="p-10 font-bold text-white text-lg">{o.customerName}</td>
            <td className="p-10 text-center">
              <select 
                value={o.status} 
                onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                className="bg-slate-950 text-[10px] font-black uppercase tracking-widest border border-slate-800 rounded-xl p-3 text-emerald-500 focus:border-emerald-500 outline-none"
              >
                {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </td>
            <td className="p-10 text-right font-black text-emerald-400 text-2xl tracking-tighter">${o.total.toFixed(2)}</td>
          </tr>
        ))}
        {orders.length === 0 && <tr><td colSpan={4} className="p-40 text-center opacity-10 text-slate-500 font-black uppercase tracking-[10px]">Queue Clear</td></tr>}
      </tbody>
    </table>
  </div>
);

const ProductManager: React.FC<{ products: Product[]; onEdit: (p: Product) => void; onAdd: () => void }> = ({ products, onEdit, onAdd }) => (
  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-500 pb-40">
    <div className="flex justify-between items-center bg-[#0a0d14] p-12 rounded-[56px] border border-slate-900 shadow-2xl">
       <div className="space-y-3">
          <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Genetics Vault</h3>
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[4px]">{products.length} AUTHORIZED SKUs</p>
       </div>
       <button onClick={onAdd} className="bg-emerald-600 text-white px-14 py-7 rounded-[32px] font-black uppercase tracking-[6px] text-[11px] hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-600/20 active:scale-95">+ NEW EXOTIC DROP</button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {products.map(p => (
        <div key={p.id} onClick={() => onEdit(p)} className="bg-[#0a0d14] border border-slate-900 rounded-[48px] overflow-hidden group shadow-2xl transition-all hover:scale-[1.03] cursor-pointer">
           <div className="aspect-[4/5] relative overflow-hidden bg-slate-950">
              <img src={p.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <div className="bg-white text-black p-5 rounded-3xl shadow-2xl scale-50 group-hover:scale-100 transition-transform"><SettingsIcon size={28}/></div>
              </div>
           </div>
           <div className="p-8 space-y-2">
              <h4 className="text-xl font-black text-white tracking-tighter truncate">{p.name}</h4>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{p.category}</p>
                <span className="text-emerald-500 font-black text-xs">${Math.min(...p.weights.map(w => w.price))}</span>
              </div>
           </div>
        </div>
      ))}
    </div>
  </div>
);

const PerfectFlowProductModal: React.FC<{ 
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
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [newCat, setNewCat] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);
  const [showAddBrand, setShowAddBrand] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onSave(data);
    setLastSync(new Date());
  }, [data, onSave]);

  const handleFileCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        const base64Data = dataUrl.split(',')[1];
        const mimeType = file.type || 'image/jpeg';
        
        setData(prev => ({ ...prev, image: dataUrl }));

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
    if (!categories.includes(newCat)) {
      setCategories(prev => [...prev, newCat]);
      setData(prev => ({ ...prev, category: newCat }));
    }
    setNewCat('');
    setShowAddCat(false);
  };

  const addBrand = () => {
    if (!newBrand.trim()) return;
    if (!brands.includes(newBrand)) {
      setBrands(prev => [...prev, newBrand]);
      setData(prev => ({ ...prev, brand: newBrand }));
    }
    setNewBrand('');
    setShowAddBrand(false);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 sm:p-12 backdrop-blur-3xl animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/98" onClick={onClose}></div>
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-4xl bg-[#0a0d14] rounded-[64px] border border-white/5 overflow-hidden flex flex-col max-h-[96vh] shadow-[0_0_150px_rgba(0,0,0,0.8)]">
        
        <div className="p-10 border-b border-white/5 bg-[#0a0d14] flex justify-between items-center shrink-0 z-10">
           <div className="space-y-1">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Genetics Entry</h2>
              <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Vault Live • Autosaving</p>
              </div>
           </div>
           <button onClick={onClose} className="p-4 bg-slate-900/80 text-slate-500 rounded-full hover:text-rose-500 transition-all border border-white/5"><X size={28}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 sm:p-20 space-y-16 custom-scrollbar">
          
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[5px] ml-4 flex items-center gap-2"><ImageIcon size={14}/> 1. Visual Capture</h4>
            <div className="h-96 relative bg-slate-950 rounded-[56px] border border-white/5 group overflow-hidden">
              <img src={data.image} className="w-full h-full object-contain p-10 transition-transform duration-1000 group-hover:scale-110" />
              {isProcessing && (
                <div className="absolute inset-0 bg-emerald-600/90 backdrop-blur-3xl flex flex-col items-center justify-center animate-in fade-in">
                  <RefreshCw className="animate-spin text-white mb-6" size={60}/>
                  <h4 className="font-black uppercase text-[15px] tracking-[8px] text-white">Stripping Background...</h4>
                </div>
              )}
              <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <button onClick={() => fileInputRef.current?.click()} className="bg-white text-black px-10 py-5 rounded-full font-black uppercase text-[10px] tracking-[5px] shadow-2xl active:scale-95 transition-all">Replace Media</button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileCapture} />
            </div>
            {!data.image.includes('picsum') && !isProcessing && (
              <p className="text-center text-[9px] font-black uppercase text-emerald-500 tracking-widest">AI Background Stripped & Sanitized</p>
            )}
          </div>

          <FormField label="2. Product Category" icon={<Boxes size={16}/>}>
            <div className="flex gap-4">
              <select value={data.category} onChange={e => setData({...data, category: e.target.value})} className="form-input-premium flex-1">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={() => setShowAddCat(!showAddCat)} className="bg-slate-900 p-6 rounded-[32px] border border-white/10 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all">
                <Plus size={24}/>
              </button>
            </div>
            {showAddCat && (
              <div className="mt-4 flex gap-4 animate-in slide-in-from-top-2">
                <input value={newCat} onChange={e => setNewCat(e.target.value)} className="form-input-premium flex-1" placeholder="Type new category..." onKeyDown={e => e.key === 'Enter' && addCategory()} />
                <button onClick={addCategory} className="bg-emerald-600 px-8 rounded-[32px] font-black uppercase text-[10px] tracking-widest text-white">Save</button>
              </div>
            )}
          </FormField>

          <FormField label="3. Genetics Brand" icon={<Zap size={16}/>}>
            <div className="flex gap-4">
              <select value={data.brand} onChange={e => setData({...data, brand: e.target.value})} className="form-input-premium flex-1">
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <button onClick={() => setShowAddBrand(!showAddBrand)} className="bg-slate-900 p-6 rounded-[32px] border border-white/10 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all">
                <Plus size={24}/>
              </button>
            </div>
            {showAddBrand && (
              <div className="mt-4 flex gap-4 animate-in slide-in-from-top-2">
                <input value={newBrand} onChange={e => setNewBrand(e.target.value)} className="form-input-premium flex-1" placeholder="Type new brand..." onKeyDown={e => e.key === 'Enter' && addBrand()} />
                <button onClick={addBrand} className="bg-emerald-600 px-8 rounded-[32px] font-black uppercase text-[10px] tracking-widest text-white">Save</button>
              </div>
            )}
          </FormField>

          <FormField label="4. Flavor / Strain Name" icon={<Sparkles size={16}/>}>
            <input value={data.name} onChange={e => setData({...data, name: e.target.value})} className="form-input-premium text-3xl" placeholder="Ex. Purple Runtz..." />
          </FormField>

          <FormField label="5. THC Concentration (%)" icon={<TrendingUp size={16}/>}>
            <input type="number" step="0.1" value={data.thc} onChange={e => setData({...data, thc: parseFloat(e.target.value) || 0})} className="form-input-premium text-2xl" placeholder="0.0" />
          </FormField>

          <div className="space-y-8">
            <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[5px] ml-4 flex items-center gap-2"><Package size={14}/> 6 & 7. Logistics (Quantity & Price)</h4>
            <div className="bg-slate-950 p-10 rounded-[48px] border border-white/5 space-y-8">
              {data.weights.map((w, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest ml-4">Format (e.g. 3.5g)</span>
                    <input value={w.weight} onChange={e => setData({...data, weights: data.weights.map((wt, i) => i === idx ? {...wt, weight: e.target.value} : wt)})} className="form-input-premium text-center" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest ml-4">Stock Quantity</span>
                    <input type="number" value={w.stock} onChange={e => setData({...data, weights: data.weights.map((wt, i) => i === idx ? {...wt, stock: parseInt(e.target.value) || 0} : wt)})} className="form-input-premium text-center" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest ml-4">Price ($)</span>
                    <input type="number" step="0.01" value={w.price} onChange={e => setData({...data, weights: data.weights.map((wt, i) => i === idx ? {...wt, price: parseFloat(e.target.value) || 0} : wt)})} className="form-input-premium text-center text-emerald-500" />
                  </div>
                </div>
              ))}
              <button onClick={() => setData({...data, weights: [...data.weights, { weight: '', price: 0, stock: 0 }]})} className="w-full py-4 border-2 border-dashed border-white/5 rounded-[24px] text-[9px] font-black uppercase tracking-[4px] text-slate-700 hover:text-emerald-500 hover:border-emerald-500 transition-all">+ Add Weight Format</button>
            </div>
          </div>

          <FormField label="8. Strain Classification" icon={<LayoutGrid size={16}/>}>
            <div className="grid grid-cols-3 gap-4">
              {Object.values(StrainType).map(t => (
                <button key={t} onClick={() => setData({...data, type: t as StrainType})} className={`py-6 rounded-[32px] font-black uppercase text-[10px] tracking-[4px] border transition-all ${data.type === t ? 'bg-emerald-600 border-emerald-400 text-white shadow-xl' : 'bg-slate-900 border-white/5 text-slate-600 hover:border-emerald-500'}`}>
                  {t}
                </button>
              ))}
            </div>
          </FormField>

          <div className="space-y-6">
            <div className="flex justify-between items-center ml-4">
               <label className="text-[10px] font-black uppercase text-slate-500 tracking-[5px] flex items-center gap-2"><MessageSquare size={14}/> 9. AI Genetics Profile</label>
               <button onClick={handleAiDescription} disabled={isAiGenerating} className="bg-emerald-600/10 text-emerald-500 px-6 py-3 rounded-2xl border border-emerald-500/20 text-[9px] font-black uppercase tracking-[3px] flex items-center gap-3 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50">
                {isAiGenerating ? <RefreshCw className="animate-spin" size={14}/> : <Wand2 size={14}/>} {isAiGenerating ? 'Analyzing...' : 'Generate Neural Profile'}
               </button>
            </div>
            <textarea value={data.description} onChange={e => setData({...data, description: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-10 rounded-[48px] text-slate-400 font-medium text-lg min-h-[300px] outline-none focus:border-emerald-500 transition-all leading-relaxed custom-scrollbar" placeholder="Detailed strain experience profile..." />
          </div>

          <div className="h-20 shrink-0"></div>
        </div>

        <div className="p-12 border-t border-slate-900/50 bg-[#0a0d14] flex gap-8 shrink-0 z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
          {onDelete && <button onClick={onDelete} className="p-8 rounded-[32px] bg-rose-950/20 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all active:scale-95"><Trash2 size={32}/></button>}
          <button onClick={onClose} className="flex-1 bg-emerald-600 text-white font-black py-8 rounded-[40px] uppercase tracking-[10px] text-[14px] shadow-2xl hover:bg-emerald-500 active:scale-[0.98] transition-all flex items-center justify-center gap-4">
             FINALIZE & PUBLISH SKU
          </button>
        </div>
      </div>
      <style>{`
        .form-input-premium {
          width: 100%;
          background: #05070a;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 32px;
          padding: 24px 32px;
          font-weight: 900;
          color: white;
          outline: none;
          transition: all 0.3s;
          appearance: none;
        }
        .form-input-premium:focus {
          border-color: #10b981;
          background: #000;
          box-shadow: 0 0 30px rgba(16,185,129,0.1);
        }
      `}</style>
    </div>
  );
};

const Settings: React.FC<{ settings: StoreSettings; setSettings: React.Dispatch<React.SetStateAction<StoreSettings>> }> = ({ settings, setSettings }) => {
  const updateMessaging = (updates: Partial<MessagingSettings>) => {
    setSettings(prev => ({ ...prev, messaging: { ...prev.messaging, ...updates } }));
  };

  const updateLoyalty = (updates: Partial<LoyaltySettings>) => {
    setSettings(prev => ({ ...prev, loyalty: { ...prev.loyalty, ...updates } }));
  };

  const updateGitHub = (updates: Partial<GitHubSettings>) => {
    setSettings(prev => ({ ...prev, github: { ...prev.github, ...updates } }));
  };

  const [isLinking, setIsLinking] = useState(false);

  const handleGitHubLink = () => {
    setIsLinking(true);
    // Simulate automated linking flow
    setTimeout(() => {
      updateGitHub({ connected: true, enabled: true, lastSync: new Date().toLocaleString() });
      setIsLinking(false);
    }, 2000);
  };

  return (
    <div className="max-w-5xl space-y-16 animate-in fade-in duration-500 pb-96">
      
      {/* GITHUB SYNC ENGINE */}
      <div className="bg-[#0a0d14] border border-slate-900 p-14 rounded-[64px] shadow-2xl space-y-12">
        <div className="flex justify-between items-start">
           <h3 className="text-3xl font-black text-white flex items-center gap-6 uppercase tracking-tighter"><Github className="text-slate-400" size={32}/> Cloud Sync (GitHub)</h3>
           {settings.github.connected && (
             <div className="bg-emerald-500/10 border border-emerald-500/30 px-6 py-2 rounded-full flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Authorized Link</span>
             </div>
           )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <ToggleRow active={settings.github.enabled} onToggle={() => updateGitHub({enabled: !settings.github.enabled})} label="Vault Versioning" description="Automated commits for every drop." icon={<CloudUpload size={20}/>} />
          <ToggleRow active={settings.github.autoCommit} onToggle={() => updateGitHub({autoCommit: !settings.github.autoCommit})} label="Zero-Touch Sync" description="Automatic push on SKU changes." icon={<Zap size={20}/>} />
        </div>

        <div className="pt-8 border-t border-slate-900/50 space-y-10">
           {!settings.github.connected ? (
             <button 
              onClick={handleGitHubLink}
              disabled={isLinking}
              className="w-full bg-white text-black py-8 rounded-[40px] font-black uppercase tracking-[8px] text-[13px] flex items-center justify-center gap-4 hover:bg-slate-100 transition-all active:scale-95"
             >
               {isLinking ? <RefreshCw className="animate-spin" size={20}/> : <Link2 size={20}/>}
               {isLinking ? 'ESTABLISHING AUTH...' : 'CONNECT GITHUB REPOSITORY AUTOMATICALLY'}
             </button>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-[5px] ml-4 flex items-center gap-2"><Github size={14}/> Repository Name</label>
                  <input type="text" value={settings.github.repoName} onChange={e => updateGitHub({repoName: e.target.value})} className="form-input-premium" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-[5px] ml-4 flex items-center gap-2"><Clock size={14}/> Last Cloud Sync</label>
                  <div className="form-input-premium flex items-center justify-between opacity-50 cursor-not-allowed">
                     <span>{settings.github.lastSync}</span>
                     <CloudCheck size={16} className="text-emerald-500"/>
                  </div>
                </div>
             </div>
           )}
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
        <h3 className="text-3xl font-black text-white flex items-center gap-6 uppercase tracking-tighter"><Bot className="text-blue-500" size={32}/> AI Genetics Engine</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <ToggleRow active={settings.bobbyProOn} onToggle={() => setSettings(s => ({...s, bobbyProOn: !s.bobbyProOn}))} label="Bobby Pro AI" description="Neural budtender assistant." icon={<Zap size={20}/>} />
          <ToggleRow active={settings.aiScannerEnabled} onToggle={() => setSettings(s => ({...s, aiScannerEnabled: !s.aiScannerEnabled}))} label="Vision Scanner" description="Automatic SKU detection." icon={<Search size={20}/>} />
          <ToggleRow active={true} onToggle={() => {}} label="BG Removal" description="Automatic studio white rendering." icon={<Sparkles size={20}/>} />
          <ToggleRow active={true} onToggle={() => {}} label="Semantic Match" description="Dynamic related genetics suggestions." icon={<Layers size={20}/>} />
        </div>
      </div>

      <div className="bg-[#0a0d14] border border-slate-900 p-14 rounded-[64px] shadow-2xl space-y-12">
        <h3 className="text-3xl font-black text-white flex items-center gap-6 uppercase tracking-tighter"><MessageSquare className="text-purple-500" size={32}/> Client Outreach</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <ToggleRow active={settings.messaging.postPickupEnabled} onToggle={() => updateMessaging({postPickupEnabled: !settings.messaging.postPickupEnabled})} label="Post-Pickup Comms" description="Automated follow-up messages." icon={<Check size={20}/>} />
          <ToggleRow active={settings.messaging.aiPersonalization} onToggle={() => updateMessaging({aiPersonalization: !settings.messaging.aiPersonalization})} label="AI Personalization" description="Tailored outreach content." icon={<Wand2 size={20}/>} />
        </div>
      </div>

      <div className="bg-[#0a0d14] border border-slate-900 p-14 rounded-[64px] shadow-2xl space-y-12">
        <h3 className="text-3xl font-black text-white flex items-center gap-6 uppercase tracking-tighter"><Coins className="text-yellow-500" size={32}/> Loyalty Stash</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <ToggleRow active={settings.loyalty.enabled} onToggle={() => updateLoyalty({enabled: !settings.loyalty.enabled})} label="Stash Program" description="Enable points accumulation." icon={<Gift size={20}/>} />
        </div>
      </div>

      <div className="bg-[#0a0d14] border border-slate-900 p-14 rounded-[64px] shadow-2xl space-y-12">
        <h3 className="text-3xl font-black text-white flex items-center gap-6 uppercase tracking-tighter"><ShieldCheck className="text-red-500" size={32}/> Security & Auth</h3>
        <div className="space-y-10">
          <FormField label="Staff Password" icon={<Lock size={14}/>}>
            <input type="text" value={settings.adminPassword} onChange={e => setSettings(s => ({...s, adminPassword: e.target.value}))} className="form-input-premium tracking-[8px]" />
          </FormField>
          <ToggleRow active={settings.customerPinEnabled} onToggle={() => setSettings(s => ({...s, customerPinEnabled: !s.customerPinEnabled}))} label="Menu Entry PIN" description="Require PIN for customer access." icon={<Lock size={20}/>} />
          {settings.customerPinEnabled && <input type="text" value={settings.customerPin} onChange={e => setSettings(s => ({...s, customerPin: e.target.value}))} className="form-input-premium tracking-[15px] text-center" />}
        </div>
      </div>
      <style>{`
        .form-input-premium { width: 100%; background: #05070a; border: 1px solid rgba(255,255,255,0.05); border-radius: 32px; padding: 24px 32px; font-weight: 900; color: white; outline: none; transition: all 0.3s; appearance: none; }
        .form-input-premium:focus { border-color: #10b981; background: #000; box-shadow: 0 0 30px rgba(16,185,129,0.1); }
      `}</style>
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
      name: '', brand: brands[0], category: categories[0], type: StrainType.Hybrid, thc: 0,
      description: '', shortDescription: '', tags: [], image: 'https://picsum.photos/seed/sku/800/800',
      brandLogo: 'https://picsum.photos/seed/brand/200/200', weights: [{ weight: '3.5g', price: 0, stock: 0 }], isPublished: true
    };
    setProducts(prev => [newProduct, ...prev]);
    setEditingProduct(newProduct);
  };

  return (
    <div className="flex h-screen w-full bg-[#05070a] text-slate-100 overflow-hidden font-sans relative">
      <aside className="w-24 bg-[#0a0d14] border-r border-slate-900 flex flex-col items-center py-10 z-[100] shadow-2xl">
        <div className="mb-12"><div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">R</div></div>
        <nav className="flex-1 flex flex-col gap-10 items-center">
          <SidebarIconButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutGrid size={24}/>} title="Stats" />
          <SidebarIconButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ClipboardList size={24}/>} title="Queue" />
          <SidebarIconButton active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package size={24}/>} title="SKUs" />
          <SidebarIconButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={24}/>} title="Tools" />
        </nav>
        <button onClick={onExit} className="mt-auto p-4 text-slate-700 hover:text-rose-500 transition-colors cursor-pointer group">
          <LogOut size={26}/><span className="text-[7px] font-black uppercase mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Exit</span>
        </button>
      </aside>

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <header className="h-28 flex items-center justify-between px-14 border-b border-slate-900/50 bg-[#05070a] z-[90]">
          <div className="flex items-center gap-10">
            <h2 className="text-4xl font-black uppercase tracking-[4px] text-white leading-none">{activeTab.toUpperCase()}</h2>
            <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl border font-black uppercase tracking-widest text-[9px] ${settings.isStoreOpen ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-rose-500/10 border-rose-500/50 text-rose-500'}`}>
              <div className={`w-2 h-2 rounded-full ${settings.isStoreOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
              {settings.isStoreOpen ? 'Menu: Live' : 'Menu: Sleep'}
            </div>
          </div>
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
        <PerfectFlowProductModal 
          product={editingProduct} 
          categories={categories} 
          setCategories={setCategories}
          brands={brands} 
          setBrands={setBrands}
          onClose={() => setEditingProduct(null)} 
          onSave={p => setProducts(prev => prev.map(old => old.id === p.id ? p : old))} 
          onDelete={() => { setProducts(prev => prev.filter(p => p.id !== editingProduct.id)); setEditingProduct(null); }} 
        />
      )}
    </div>
  );
};

export default AdminApp;
