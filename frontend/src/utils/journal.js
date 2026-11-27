export const JOURNAL_CATEGORIES = [
  { value: 'HARDWARE', label: 'HARDWARE' },
  { value: 'SOFTWARE', label: 'SOFTWARE' },
  { value: 'RETRO_COMPUTING', label: 'RETRO COMPUTING' },
  { value: 'DIGITAL_CULTURE', label: 'DIGITAL CULTURE' },
  { value: 'DIY_PROJECTS', label: 'DIY & PROJECTS' },
  { value: 'GEEK_CULTURE', label: 'GEEK CULTURE' },
];

export const JOURNAL_CATEGORY_LABELS = Object.fromEntries(JOURNAL_CATEGORIES.map((c) => [c.value, c.label]));

export const formatJournalDate = (value) => {
  if (!value) return 'Sem data';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Sem data';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const readingTimeLabel = (minutes) => `${Math.max(1, Number(minutes) || 1)} min de leitura`;