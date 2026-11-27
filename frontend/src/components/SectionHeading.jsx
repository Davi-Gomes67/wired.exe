import { Link } from 'react-router-dom';

export default function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="section-title mt-3">{title}</h2>
        {description && <p className="section-desc">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionAction({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex min-h-10 shrink-0 items-center gap-1.5 self-start text-sm font-medium text-electric-light transition hover:text-base"
    >
      {children}
    </Link>
  );
}

