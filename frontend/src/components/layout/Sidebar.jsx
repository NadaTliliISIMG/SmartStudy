import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { navItems } from './navItems';

export default function Sidebar() {
  return (
    <>
      <div className="sidebar-title">Menu</div>
      <Nav className="flex-column p-3 pt-2 gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Nav.Link as={NavLink} key={to} to={to} className="sidebar-link rounded">
            <Icon className="me-2" />{label}
          </Nav.Link>
        ))}
      </Nav>
    </>
  );
}
