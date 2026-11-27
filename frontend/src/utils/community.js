export const COMMUNITY_CATEGORIES = [
  { key: 'SETUPS', label: 'Setups', description: 'Estações, battlestations e rigs.' },
  { key: 'PROJECTS', label: 'Projetos', description: 'DIY, automação, eletrônica e builds.' },
  { key: 'MODDING', label: 'Modding', description: 'Customizações, mods e melhorias.' },
  { key: 'RETRO_TECH', label: 'Retro Tech', description: 'Hardware clássico, restauração e nostalgia.' },
  { key: 'SHOWCASE', label: 'Showcase', description: 'Fotos, resultado final e conquistas.' },
  { key: 'DISCUSSION', label: 'Discussão', description: 'Perguntas, ideias e troca técnica.' },
];

export const COMMUNITY_CATEGORY_LABELS = Object.fromEntries(COMMUNITY_CATEGORIES.map((c) => [c.key, c.label]));
