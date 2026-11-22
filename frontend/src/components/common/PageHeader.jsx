export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
      <div>
        <h2 className="h3 mb-0">{title}</h2>
        {subtitle && <div className="text-muted">{subtitle}</div>}
      </div>
      <div className="d-flex gap-2">{children}</div>
    </div>
  );
}