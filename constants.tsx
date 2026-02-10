
import React from 'react';
import { 
  Flower, 
  Wind, 
  ShoppingBag, 
  Candy, 
  Cookie, 
  Droplet, 
  Wine, 
  Settings, 
  Flame,
  Zap,
  Package
} from 'lucide-react';
import { CategoryEnum, StrainType, Product, StoreSettings } from './types';

export const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  ['Flowers']: <Flower className="w-6 h-6" />,
  ['Disposables']: <Wind className="w-6 h-6" />,
  ['Carts']: <Flame className="w-6 h-6" />,
  ['Pre-Rolls']: <Zap className="w-6 h-6" />,
  ['Gummies']: <Candy className="w-6 h-6" />,
  ['Edibles']: <Cookie className="w-6 h-6" />,
  ['Concentrates']: <ShoppingBag className="w-6 h-6" />,
  ['Tinctures']: <Droplet className="w-6 h-6" />,
  ['Drinks']: <Wine className="w-6 h-6" />,
  ['Accessories']: <Settings className="w-6 h-6" />,
};

export const getCategoryIcon = (category: string) => {
  return CATEGORY_ICONS[category] || <Package className="w-6 h-6" />;
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Ice Cream Cake',
    brand: 'Jungle Boys',
    category: 'Flowers',
    type: StrainType.Indica,
    thc: 28.5,
    description: 'A heavy-hitting indica cross of Wedding Cake and Gelato #33. Known for its creamy, doughy aroma and deeply relaxing effects.',
    shortDescription: 'Creamy, relaxing, and heavy-hitting.',
    tags: ['Relaxing', 'Creamy', 'Evening', 'Sweet'],
    image: 'https://picsum.photos/seed/icecreamcake/400/400',
    brandLogo: 'https://picsum.photos/seed/jungleboys/100/100',
    weights: [
      { weight: '3.5g', price: 45, stock: 12 },
      { weight: '7g', price: 85, stock: 5 },
      { weight: '14g', price: 160, stock: 2 }
    ],
    isPublished: true
  },
  {
    id: '2',
    name: 'Lemon Cherry Gelato',
    brand: 'Connected',
    category: 'Flowers',
    type: StrainType.Hybrid,
    thc: 31.2,
    description: 'An exotic hybrid with a fruity, cherry-forward flavor profile and a smooth creamy finish. Great for balanced social energy.',
    shortDescription: 'Fruity social hybrid with high potency.',
    tags: ['Euphoric', 'Fruity', 'Social', 'Daytime'],
    image: 'https://picsum.photos/seed/lemoncherry/400/400',
    brandLogo: 'https://picsum.photos/seed/connected/100/100',
    weights: [
      { weight: '3.5g', price: 50, stock: 8 },
      { weight: '7g', price: 95, stock: 3 }
    ],
    isPublished: true
  }
];

export const INITIAL_SETTINGS: StoreSettings = {
  logoUrl: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&q=80&w=200&h=200',
  pickupOn: true,
  deliveryOn: false,
  locationRequirementOn: true,
  bobbyProOn: true,
  notificationsOn: true,
  alarmSoundOn: true,
  storeHours: '9:00 AM - 10:00 PM',
  storeAddress: '123 Emerald Way, Green City, CA',
  prepTime: '15-30 min',
  adminPasswordEnabled: false,
  adminPassword: 'admin',
  customerPinEnabled: false,
  customerPin: '0000',
  autoLockTimeout: 60,
  isStoreOpen: false,
  aiScannerEnabled: true,
  onlinePaymentsEnabled: false,
  localVisibilityEnabled: true,
  customProtocols: [],
  messaging: {
    postPickupEnabled: false,
    channel: 'sms',
    delayMinutes: 0,
    style: 'friendly',
    aiPersonalization: true,
    smsTemplate: "Thanks for shopping with Premium Rambo! ✅ Pickup complete. Enjoy responsibly (21+). Want recommendations next time? Reply 'MENU'.",
    emailTemplate: "Thanks for your pickup at Premium Rambo! Your order is complete. We hope you enjoy your selection responsibly (21+). See you next time!"
  },
  loyalty: {
    enabled: true,
    pointsPerDollar: 1,
    rewardThreshold: 100,
    rewardDescription: 'Free Exotic 1g Pre-Roll'
  },
  github: {
    enabled: false,
    connected: false,
    repoName: 'premium-rambo-vault',
    lastSync: 'Never',
    autoCommit: true
  }
};
