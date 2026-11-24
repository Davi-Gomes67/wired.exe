import { Link } from 'react-router-dom';

export default function EmptyState({ icon: Icon, title, description, actionTo, actionLabel }) {
  return (
    <div className="surface flex flex-col items-center px-6 py-14 text-center">
      {Icon && (
        <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-electric/10 text-electric-light ring-1 ring-electric/25">
          <Icon size={26} strokeWidth={1.7} />
        </span>
      )}
      <h3 className="text-lg font-semibold text-[#D7EBDD]">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{description}</p>}
      {actionTo && actionLabel && (
        <Link to={actionTo} className="btn-primary mt-6">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
