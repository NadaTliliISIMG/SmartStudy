import { FaGraduationCap, FaMagic, FaQuestionCircle, FaChartLine } from 'react-icons/fa';
import ThemeToggle from '../common/ThemeToggle';

// Enveloppe visuelle des pages Login / Register (aucune logique)
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-card-split">
        <aside className="auth-aside">
          <div className="brand-tile brand-tile-light"><FaGraduationCap /></div>
          <h2>Smart Study</h2>
          <p>Transformez vos cours en résumés clairs et en quiz interactifs, en quelques secondes.</p>
          <ul className="auth-features">
            <li><FaMagic />Résumés automatiques</li>
            <li><FaQuestionCircle />Quiz générés par l&apos;IA</li>
            <li><FaChartLine />Suivi de votre progression</li>
          </ul>
        </aside>
        <section className="auth-main">
        <ThemeToggle className="auth-theme-toggle" />
          <div className="mb-4">
            <div className="brand-tile d-md-none mb-3"><FaGraduationCap /></div>
            <h1 className="h3 mb-1">{title}</h1>
            {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
          </div>
          {children}
          {footer}
        </section>
      </div>
    </div>
  );
}
