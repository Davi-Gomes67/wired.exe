import { Cpu, Gamepad2, Headphones, Keyboard, MemoryStick, Package, Shirt } from 'lucide-react';

export const DEPARTMENTS = [
  { name: 'HARDWARE LAB', slug: 'hardware-lab', icon: Cpu },
  { name: 'COMPONENTS', slug: 'components', icon: MemoryStick },
  { name: 'PERIPHERALS', slug: 'peripherals', icon: Keyboard },
  { name: 'RETRO COMPUTING', slug: 'retro-computing', icon: Gamepad2 },
  { name: 'GEEK WEAR', slug: 'geek-wear', icon: Shirt },
  { name: 'DIGITAL CULTURE', slug: 'digital-culture', icon: Headphones },
  { name: 'STARTER PACKS', slug: 'starter-packs', icon: Package },
];

export const PROMO_AREAS = ['FIRST BOOT', '404 PRICE NOT FOUND', 'MAKER COMBO', 'GEEK COLLECTION', 'SYSTEM UPGRADE'];