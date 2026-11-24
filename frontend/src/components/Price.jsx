export default function Price({ cents, className = '', size = 'base' }) {
  const sizes = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl sm:text-3xl',
  };

  return (
    <span className={`font-mono font-semibold tracking-tight ${sizes[size]} ${className}`}>
      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)}
    </span>
  );
}
