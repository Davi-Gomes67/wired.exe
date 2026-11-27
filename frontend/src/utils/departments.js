import { Cpu, Gamepad2, Headphones, Keyboard, MemoryStick, Package, Shirt } from 'lucide-react';

export const DEPARTMENTS = [
  { name: 'HARDWARE LAB', slug: 'hardware-lab', icon: Cpu, description: 'Workstations, placas e máquinas para montar setups de verdade.' },
  { name: 'COMPONENTS', slug: 'components', icon: MemoryStick, description: 'Peças, módulos e upgrades para builds e experimentos.' },
  { name: 'PERIPHERALS', slug: 'peripherals', icon: Keyboard, description: 'Teclados, mouses, áudio e controle para seu setup.' },
  { name: 'RETRO COMPUTING', slug: 'retro-computing', icon: Gamepad2, description: 'Hardware clássico, nostalgia e cultura de máquina antiga.' },
  { name: 'GEEK WEAR', slug: 'geek-wear', icon: Shirt, description: 'Vestuário e identidade para quem vive a cultura digital.' },
  { name: 'DIGITAL CULTURE', slug: 'digital-culture', icon: Headphones, description: 'Colecionáveis, mídia e artefatos da internet.' },
  { name: 'STARTER PACKS', slug: 'starter-packs', icon: Package, description: 'Kits prontos para começar com estilo e funcionalidade.' },
];

export const PROMO_AREAS = ['FIRST BOOT', '404 PRICE NOT FOUND', 'MAKER COMBO', 'GEEK COLLECTION', 'SYSTEM UPGRADE'];