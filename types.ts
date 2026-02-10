
export enum CategoryEnum {
  Flowers = 'Flowers',
  Disposables = 'Disposables',
  Carts = 'Carts',
  PreRolls = 'Pre-Rolls',
  Gummies = 'Gummies',
  Edibles = 'Edibles',
  Concentrates = 'Concentrates',
  Tinctures = 'Tinctures',
  Drinks = 'Drinks',
  Accessories = 'Accessories'
}

export enum StrainType {
  Sativa = 'Sativa',
  Indica = 'Indica',
  Hybrid = 'Hybrid'
}

export enum OrderStatus {
  Placed = 'Placed',
  Accepted = 'Accepted',
  Preparing = 'Preparing',
  Ready = 'Ready',
  PickedUp = 'Picked Up',
  Cancelled = 'Cancelled'
}

export enum PaymentMethod {
  Cash = 'Cash',
  Online = 'Online',
  InStore = 'In-Store'
}

export enum PaymentStatus {
  Unpaid = 'Unpaid',
  Pending = 'Pending',
  Paid = 'Paid',
  Failed = 'Failed'
}

export interface WeightPrice {
  weight: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  type: StrainType;
  thc: number;
  cbd?: number;
  description: string;
  shortDescription: string;
  tags: string[];
  image: string;
  brandLogo: string;
  weights: WeightPrice[];
  isPublished: boolean;
  notes?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  brand: string;
  weight: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderType = 'pickup' | 'delivery';

export interface Address {
  id: string;
  label: string; // e.g., "Home", "Work"
  address: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  addresses: Address[];
  points: number;
  favorites?: string[];
  createdAt: Date;
}

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  marketingOptIn: boolean;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  timestamp: Date;
  pickupTime: string; 
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderType: OrderType;
  deliveryAddress?: string;
  notes?: string;
}

export interface CustomProtocol {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface MessagingSettings {
  postPickupEnabled: boolean;
  channel: 'sms' | 'email' | 'both';
  delayMinutes: number;
  style: 'friendly' | 'premium';
  aiPersonalization: boolean;
  smsTemplate: string;
  emailTemplate: string;
}

export interface LoyaltySettings {
  enabled: boolean;
  pointsPerDollar: number;
  rewardThreshold: number;
  rewardDescription: string;
}

export interface GitHubSettings {
  enabled: boolean;
  connected: boolean;
  repoName: string;
  lastSync: string;
  autoCommit: boolean;
  token?: string;
}

export interface MessageLog {
  id: string;
  customerName: string;
  orderId: string;
  channel: 'sms' | 'email';
  status: 'sent' | 'failed' | 'pending';
  timestamp: Date;
  content: string;
  error?: string;
}

export interface StoreSettings {
  logoUrl?: string;
  pickupOn: boolean;
  deliveryOn: boolean;
  locationRequirementOn: boolean;
  bobbyProOn: boolean;
  notificationsOn: boolean;
  alarmSoundOn: boolean;
  storeHours: string;
  storeAddress: string;
  prepTime: string;
  adminPasswordEnabled: boolean;
  adminPassword?: string;
  customerPinEnabled: boolean;
  customerPin?: string;
  autoLockTimeout: number; 
  isStoreOpen: boolean;
  aiScannerEnabled: boolean;
  onlinePaymentsEnabled: boolean;
  localVisibilityEnabled: boolean;
  customProtocols: CustomProtocol[];
  messaging: MessagingSettings;
  loyalty: LoyaltySettings;
  github: GitHubSettings;
}
