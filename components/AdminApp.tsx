
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
  Upload,
  Ticket,
  MessagesSquare,
  Activity,
  PlusSquare,
  Smartphone,
  Mail,
  Gift,
  Camera,
  Scan,
  CircleDashed,
  Crosshair,
  Cpu,
  Mic,
  BrainCircuit,
  Binary
} from 'lucide-react';
import { Product, Order, StoreSettings, OrderStatus, StrainType, WeightPrice, MessagingSettings, LoyaltySettings, GitHubSettings, CustomProtocol } from '../types';
import { generateProductDescription, removeImageBackground, aiInventoryWizard } from '../services/geminiService';

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

const ProductManager: React.FC<{ products: Product[]; onEdit: (p: Product) => void; onAdd: () => void; onAiAdd: () => void }> = ({ products, onEdit, onAdd, onAiAdd }) => {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[6px]">Active Vault Inventory ({products.length})</h3>
        <div className="flex gap-4">
           <button onClick={onAiAdd} className="bg-slate-900 text-emerald-400 px-8 py-5 rounded-[28px] font-black uppercase tracking-[4px] text-[11px] flex items-center gap-3 border border-emerald-500/20 shadow-xl hover:bg-emerald-600 hover:text-white transition-all group">
            <BrainCircuit size={18} className="group-hover:animate-pulse" /> AI VAULT GENETICIST
          </button>
          <button onClick={onAdd} className="bg-slate-900 text-white px-8 py-5 rounded-[28px] font-black uppercase tracking-[4px] text-[11px] flex items-center gap-3 border border-slate-800 shadow-xl transition-all">
            <Plus size={18} /> Manual SKU
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {products.map(product => {
          const totalStock = product.weights.reduce((sum, w) => sum + w.stock, 0);
          return (
            <div key={product.id} onClick={() => onEdit(product)} className="bg-[#0a0d14] border border-slate-900 rounded-[56px] overflow-hidden group cursor-pointer hover:border-emerald-500/30 transition-all shadow-2xl relative">
              <div className="aspect-[4/3] relative bg-slate-950 overflow-hidden">
                {product.image ? (
                  <img src={product.image} className="w-full h-full object-contain p-8 group-hover:scale-110 duration-1000" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-800 gap-4">
                     <ImageIcon size={64}/>
                     <span className="text-[8px] font-black uppercase tracking-widest">No Genetics Image</span>
                  </div>
                )}
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

const AiVaultWizard: React.FC<{ 
  onSave: (p: Product) => void; 
  onClose: () => void;
  brands: string[];
  categories: string[];
}> = ({ onSave, onClose, brands, categories }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputMethod, setInputMethod] = useState<'text' | 'image'>('text');
  const [textInput, setTextInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<Partial<Product> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcess = async () => {
    setIsProcessing(true);
    let result;
    if (inputMethod === 'image' && imagePreview) {
      const base64 = imagePreview.split(',')[1];
      result = await aiInventoryWizard({ image: { data: base64, mimeType: 'image/jpeg' } });
    } else {
      result = await aiInventoryWizard({ text: textInput });
    }

    if (result) {
      setExtractedData(result);
    }
    setIsProcessing(false);
  };

  const handleConfirm = () => {
    if (!extractedData) return;
    const finalProduct: Product = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      name: extractedData.name || 'Unknown Genetics',
      brand: extractedData.brand || 'Unknown',
      category: extractedData.category || categories[0],
      type: (extractedData.type as StrainType) || StrainType.Hybrid,
      thc: extractedData.thc || 0,
      description: extractedData.description || '',
      shortDescription: extractedData.description?.slice(0, 50) + '...' || '',
      tags: [],
      image: imagePreview || '',
      brandLogo: 'https://picsum.photos/seed/brand/200/200',
      weights: extractedData.weights || [{ weight: '3.5g', price: 0, stock: 0 }],
      isPublished: true
    };
    onSave(finalProduct);
    onClose();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      setInputMethod('image');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[#05070a]/98 backdrop-blur-3xl" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-[#0a0d14] rounded-[64px] border border-white/5 overflow-hidden flex flex-col shadow-[0_0_120px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-500">
        
        {/* Animated Scanner Grid Backdrop */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <div className="w-full h-full bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:40px_40px]"></div>
        </div>

        <div className="p-12 pb-8 border-b border-white/5 relative z-10">
           <div className="flex justify-between items-start">
              <div className="space-y-4">
                 <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-tight">AI VAULT<br/>GENETICIST</h2>
                 <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[5px] flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    AUTONOMOUS SYSTEM ONLINE
                 </p>
              </div>
              <button onClick={onClose} className="p-4 bg-slate-900 text-slate-500 rounded-full hover:text-white transition-all"><X size={28}/></button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-12 relative z-10 custom-scrollbar no-scrollbar">
          {!extractedData ? (
            <div className="space-y-10">
               <div className="grid grid-cols-2 gap-6">
                  <button onClick={() => setInputMethod('text')} className={`p-8 rounded-[40px] border transition-all flex flex-col items-center gap-4 ${inputMethod === 'text' ? 'bg-emerald-600/10 border-emerald-500/50 text-emerald-500' : 'bg-slate-950 border-white/5 text-slate-600'}`}>
                     <MessageSquare size={32}/>
                     <span className="text-[10px] font-black uppercase tracking-widest">Text Logic</span>
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className={`p-8 rounded-[40px] border transition-all flex flex-col items-center gap-4 ${inputMethod === 'image' ? 'bg-emerald-600/10 border-emerald-500/50 text-emerald-500' : 'bg-slate-950 border-white/5 text-slate-600'}`}>
                     <Camera size={32}/>
                     <span className="text-[10px] font-black uppercase tracking-widest">Visual DNA</span>
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
               </div>

               {inputMethod === 'text' ? (
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[5px] ml-4">Product Transmission Narrative</label>
                    <textarea 
                      value={textInput}
                      onChange={e => setTextInput(e.target.value)}
                      placeholder="Ex: 'Add 5 units of Connected Gushers, Hybrid, 28% THC, $60 per 3.5g'"
                      className="w-full bg-slate-950 border border-white/5 p-10 rounded-[48px] text-white font-medium text-lg min-h-[160px] outline-none focus:border-emerald-500 transition-all leading-relaxed" 
                    />
                 </div>
               ) : (
                 <div className="aspect-video relative bg-slate-950 rounded-[48px] border border-white/5 overflow-hidden flex items-center justify-center">
                    {imagePreview ? (
                      <img src={imagePreview} className="w-full h-full object-contain p-8" />
                    ) : (
                      <div className="flex flex-col items-center gap-4 text-slate-700">
                        <ImageIcon size={64}/>
                        <span className="text-[10px] font-black uppercase tracking-widest">Capture DNA Packaging</span>
                      </div>
                    )}
                    {isProcessing && <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm animate-pulse"></div>}
                 </div>
               )}

               <button 
                onClick={handleProcess} 
                disabled={isProcessing || (inputMethod === 'text' ? !textInput : !imagePreview)}
                className="w-full bg-emerald-600 text-white py-8 rounded-[48px] font-black uppercase tracking-[8px] text-[13px] shadow-2xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-4"
               >
                 {isProcessing ? <RefreshCw className="animate-spin" size={20}/> : <Cpu size={20}/>}
                 {isProcessing ? 'DECODING GENETICS...' : 'AUTHORIZE AI ANALYSIS'}
               </button>
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in duration-500">
               <div className="flex items-center gap-6 p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-[40px]">
                  <div className="w-16 h-16 bg-emerald-500 rounded-[28px] flex items-center justify-center text-white"><Check size={32}/></div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight uppercase">Genetics Decoded</h3>
                    <p className="text-[9px] text-emerald-500 font-black uppercase tracking-[4px]">High Confidence Match</p>
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-4">Strain Name</span>
                       <div className="bg-slate-950 p-6 rounded-[28px] border border-white/5 text-white font-black">{extractedData.name}</div>
                    </div>
                    <div className="space-y-2">
                       <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-4">Brand Owner</span>
                       <div className="bg-slate-950 p-6 rounded-[28px] border border-white/5 text-white font-black">{extractedData.brand}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                       <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-4">THC %</span>
                       <div className="bg-slate-950 p-6 rounded-[28px] border border-white/5 text-emerald-500 font-black">{extractedData.thc}%</div>
                    </div>
                    <div className="space-y-2">
                       <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-4">Type</span>
                       <div className="bg-slate-950 p-6 rounded-[28px] border border-white/5 text-white font-black">{extractedData.type}</div>
                    </div>
                    <div className="space-y-2">
                       <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-4">Price Est.</span>
                       <div className="bg-slate-950 p-6 rounded-[28px] border border-white/5 text-white font-black">${extractedData.weights?.[0]?.price}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-4">Narrative DNA</span>
                    <div className="bg-slate-950 p-8 rounded-[36px] border border-white/5 text-slate-400 text-sm italic font-medium">"{extractedData.description}"</div>
                  </div>
               </div>

               <div className="flex gap-4">
                  <button onClick={() => setExtractedData(null)} className="flex-1 py-7 bg-slate-900 text-slate-500 rounded-[40px] font-black uppercase tracking-[4px] text-[10px]">Re-Analyze</button>
                  <button onClick={handleConfirm} className="flex-[2] py-7 bg-emerald-600 text-white rounded-[40px] font-black uppercase tracking-[6px] text-[11px] shadow-2xl">Confirm Vault Entry</button>
               </div>
            </div>
          )}
        </div>
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
  const [isScanning, setIsScanning] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);
  const [newCat, setNewCat] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);
  const [showAddBrand, setShowAddBrand] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);
  const brandLogoInputRef = useRef<HTMLInputElement>(null);
  const initialLoad = useRef(true);

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    setSaveStatus('unsaved');
    const timer = setTimeout(() => {
      setSaveStatus('saving');
      onSave(data);
      setTimeout(() => setSaveStatus('saved'), 600);
    }, 2000);
    return () => clearTimeout(timer);
  }, [data, onSave]);

  const handleFileCapture = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'brandLogo' | 'scan') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === 'scan') {
      setIsScanning(true);
      setScanFeedback(null);
    } else {
      setIsProcessing(true);
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        const base64Data = dataUrl.split(',')[1];
        const mimeType = file.type || 'image/jpeg';
        
        if (field === 'scan') {
          try {
            const scannedData = await aiInventoryWizard({ image: { data: base64Data, mimeType } });
            if (scannedData) {
              const normalizedType = scannedData.type ? (scannedData.type.charAt(0).toUpperCase() + scannedData.type.slice(1).toLowerCase()) : data.type;
              
              setData(prev => ({
                ...prev,
                name: scannedData.name || prev.name,
                brand: scannedData.brand || prev.brand,
                thc: scannedData.thc || prev.thc,
                category: scannedData.category || prev.category,
                type: normalizedType as StrainType,
                image: dataUrl 
              }));
              setScanFeedback("GENETICS IDENTIFIED");
              setTimeout(() => setScanFeedback(null), 3000);
            }
          } catch (error) {
            console.error("Lens Scan failed:", error);
            setScanFeedback("IDENTIFICATION FAILED");
            setTimeout(() => setScanFeedback(null), 3000);
          } finally {
            setIsScanning(false);
          }
        } else {
          setData(prev => ({ ...prev, [field as any]: dataUrl }));
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

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-3xl animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-[#05070a]/95" onClick={onClose}></div>
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-lg bg-[#0a0d14] rounded-[64px] border border-white/5 overflow-hidden flex flex-col max-h-[92vh] shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        
        {/* Header */}
        <div className="p-12 pb-8 bg-[#0a0d14] relative z-10">
           <div className="flex justify-between items-start">
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-tight">GENETICS VAULT ENTRY<br/>TOOL</h2>
                <div className="flex items-center gap-8">
                  <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[3px] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    INTEGRATED SYSTEM
                  </p>
                  <div className="flex items-center gap-2">
                    <CloudCheck size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black uppercase text-emerald-500 tracking-[3px]">VAULT SYNCED</span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="w-16 h-16 bg-slate-900/50 text-slate-400 rounded-full flex items-center justify-center hover:text-white transition-all border border-white/5 shadow-2xl"><X size={32}/></button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 pt-0 space-y-12 custom-scrollbar no-scrollbar">
          {/* Lens Visual */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-[5px] flex items-center gap-4">
                < LucideImage size={14}/> PRODUCT PHOTO
              </h4>
              <button 
                onClick={() => scanInputRef.current?.click()}
                className="bg-[#10b981]/10 border border-[#10b981]/50 px-6 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[3px] flex items-center gap-3 text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <Camera size={16} className="group-hover:scale-110 transition-transform"/> GENETICS LENS AI
              </button>
            </div>
            
            <div className="aspect-square relative bg-slate-950 rounded-[64px] border border-white/5 group overflow-hidden shadow-inner flex items-center justify-center">
              {data.image ? (
                <img src={data.image} className="w-full h-full object-contain p-10 transition-transform duration-1000 group-hover:scale-105" />
              ) : (
                <div className="flex flex-col items-center gap-4 text-slate-800">
                  <div className="relative">
                    <Camera size={64}/>
                    <div className="absolute -inset-4 border-2 border-emerald-500/20 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[4px]">Awaiting Genetics...</span>
                </div>
              )}

              {isScanning && (
                <div className="absolute inset-0 z-20 pointer-events-none">
                  <div className="absolute left-0 right-0 h-[2px] bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,1)] animate-scan z-30"></div>
                  <div className="absolute inset-0 bg-emerald-900/10 backdrop-blur-[2px] animate-pulse"></div>
                  <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-emerald-400 rounded-full shadow-lg animate-ping"></div>
                  <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-emerald-400 rounded-full shadow-lg animate-ping delay-300"></div>
                  <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-emerald-400 rounded-full shadow-lg animate-ping delay-700"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-[11px] font-black text-white uppercase tracking-[10px] mt-20 animate-bounce">ANALYZING DNA</span>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="absolute inset-0 bg-[#0a0d14]/80 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in z-20">
                  <div className="relative"><RefreshCw className="animate-spin text-emerald-500 mb-6" size={48}/><div className="absolute inset-0 blur-xl bg-emerald-500/20"></div></div>
                  <span className="text-[10px] font-black text-white uppercase tracking-[5px]">POLISHING IMAGE...</span>
                </div>
              )}
              
              {scanFeedback && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-8 py-4 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.4)] border border-white/10 animate-in zoom-in-95 z-40">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-3 whitespace-nowrap"><Check size={16}/> {scanFeedback}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                <button onClick={() => fileInputRef.current?.click()} className="bg-white text-black px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-[5px] shadow-2xl active:scale-95 transition-all">Manual Photo</button>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileCapture(e, 'image')} />
            <input ref={scanInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFileCapture(e, 'scan')} />
          </div>

          <div className="space-y-10">
            <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-[5px] flex items-center gap-4"><LucideImage size={14}/> BRAND IDENTITY (LOGO)</h4>
            <div className="h-48 relative bg-slate-950 rounded-[48px] border border-white/5 group overflow-hidden shadow-inner flex items-center justify-center">
              <img src={data.brandLogo} className="w-full h-full object-contain p-12 transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <button onClick={() => brandLogoInputRef.current?.click()} className="bg-white text-black px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-[4px] shadow-2xl active:scale-95 transition-all">Upload Logo</button>
              </div>
              <input ref={brandLogoInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileCapture(e, 'brandLogo')} />
            </div>

            <div className="grid grid-cols-1 gap-8">
              <FormField label="FLAVOR / STRAIN NAME" icon={<Sparkles size={16}/>}>
                <input value={data.name} onChange={e => setData({...data, name: e.target.value})} className="form-input-premium text-2xl py-8" placeholder="Ex. Purple Runtz..." />
              </FormField>
              <div className="grid grid-cols-2 gap-8">
                <FormField label="THC LEVEL (%)" icon={<TrendingUp size={16}/>}>
                  <input type="number" step="0.1" value={data.thc} onChange={e => setData({...data, thc: parseFloat(e.target.value) || 0})} className="form-input-premium py-6" />
                </FormField>
                <FormField label="STRAIN TYPE" icon={<LayoutGrid size={16}/>}>
                  <select value={data.type} onChange={e => setData({...data, type: e.target.value as StrainType})} className="form-input-premium py-6">
                    {Object.values(StrainType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FormField>
              </div>
            </div>

            <FormField label="VAULT SECTION" icon={<Boxes size={16}/>}>
              <select value={data.category} onChange={e => setData({...data, category: e.target.value})} className="form-input-premium">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
          </div>
        </div>

        <div className="p-12 pt-8 border-t border-white/5 bg-[#0a0d14] flex gap-8 shrink-0 z-10">
          <button onClick={onDelete} className="w-24 h-24 rounded-[32px] bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all active:scale-90 flex items-center justify-center"><Trash2 size={40}/></button>
          <button onClick={onClose} className="flex-1 bg-emerald-600 text-white font-black rounded-[48px] uppercase tracking-[8px] text-[14px] shadow-[0_20px_60px_rgba(16,185,129,0.3)] hover:bg-emerald-500 transition-all active:scale-[0.98] flex flex-col items-center justify-center leading-none">
            <div className="mb-1 text-xs">AUTHORIZE</div>
            <div className="flex items-center gap-3"><span className="opacity-50 text-[10px]">&</span><span>SAVE PRODUCT</span></div>
          </button>
        </div>
      </div>
      <style>{`
        .form-input-premium { width: 100%; background: #05070a; border: 1px solid rgba(255,255,255,0.05); border-radius: 32px; padding: 24px; font-weight: 900; color: white; outline: none; transition: all 0.3s; appearance: none; }
        .form-input-premium:focus { border-color: #10b981; box-shadow: 0 0 20px rgba(16,185,129,0.1); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes scan { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .animate-scan { position: absolute; animation: scan 2s linear infinite; }
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

  const toggleProtocol = (id: string) => {
    setSettings(prev => ({
      ...prev,
      customProtocols: prev.customProtocols.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p)
    }));
  };

  const addProtocol = () => {
    const newProtocol: CustomProtocol = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      label: 'New Protocol',
      description: 'Define operational logic...',
      enabled: false
    };
    setSettings(prev => ({ ...prev, customProtocols: [...prev.customProtocols, newProtocol] }));
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
             <p className="text-slate-500 text-sm font-medium leading-relaxed italic">Upload branding.</p>
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
        <div className="flex items-center justify-between">
           <h3 className="text-3xl font-black text-white flex items-center gap-6 uppercase tracking-tighter"><MessagesSquare className="text-emerald-500" size={32}/> Messaging Engine</h3>
           <ToggleRow active={settings.messaging.postPickupEnabled} onToggle={() => updateMessaging({ postPickupEnabled: !settings.messaging.postPickupEnabled })} label="" description="" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           <FormField label="Preferred Channel" icon={<Activity size={16}/>}>
              <select value={settings.messaging.channel} onChange={e => updateMessaging({ channel: e.target.value as any })} className="form-input-premium-settings">
                 <option value="sms">SMS Protocol</option>
                 <option value="email">Email Protocol</option>
                 <option value="both">Hybrid Sync (Both)</option>
              </select>
           </FormField>
           <FormField label="Message Style" icon={<Zap size={16}/>}>
              <select value={settings.messaging.style} onChange={e => updateMessaging({ style: e.target.value as any })} className="form-input-premium-settings">
                 <option value="friendly">Friendly Budtender</option>
                 <option value="premium">Executive Exotic</option>
              </select>
           </FormField>
        </div>
        <div className="space-y-8">
           <FormField label="SMS Template" icon={<Smartphone size={16}/>}>
              <textarea value={settings.messaging.smsTemplate} onChange={e => updateMessaging({ smsTemplate: e.target.value })} className="w-full bg-slate-950 border border-white/5 p-8 rounded-[32px] text-slate-400 font-medium text-sm min-h-[100px] outline-none focus:border-emerald-500 transition-all leading-relaxed" />
           </FormField>
           <FormField label="Email Template" icon={<Mail size={16}/>}>
              <textarea value={settings.messaging.emailTemplate} onChange={e => updateMessaging({ emailTemplate: e.target.value })} className="w-full bg-slate-950 border border-white/5 p-8 rounded-[32px] text-slate-400 font-medium text-sm min-h-[100px] outline-none focus:border-emerald-500 transition-all leading-relaxed" />
           </FormField>
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

      <style>{`
        .form-input-premium-settings { width: 100%; background: #05070a; border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 18px 24px; font-weight: 800; color: white; outline: none; transition: all 0.3s; appearance: none; font-size: 14px; }
        .form-input-premium-settings:focus { border-color: #10b981; box-shadow: 0 0 20px rgba(16,185,129,0.1); }
      `}</style>
    </div>
  );
};

const AdminApp: React.FC<AdminAppProps> = ({ 
  products, setProducts, orders, settings, setSettings, updateOrderStatus, categories, setCategories, brands, setBrands, onExit
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard'|'orders'|'inventory'|'settings'|'logs'>('dashboard');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAiWizardOpen, setIsAiWizardOpen] = useState(false);

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
      description: '', shortDescription: '', tags: [], image: '',
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
          {activeTab === 'inventory' && <ProductManager products={products} onEdit={setEditingProduct} onAdd={handleAddNewProduct} onAiAdd={() => setIsAiWizardOpen(true)} />}
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

      {isAiWizardOpen && (
        <AiVaultWizard 
          brands={brands} 
          categories={categories}
          onClose={() => setIsAiWizardOpen(false)} 
          onSave={p => setProducts(prev => [p, ...prev])}
        />
      )}
    </div>
  );
};

export default AdminApp;
