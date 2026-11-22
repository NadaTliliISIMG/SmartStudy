import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaGraduationCap, FaSignOutAlt } from 'react-icons/fa';
import { logout } from '../../features/auth/authSlice';
import { navItems } from './navItems';

export default function AppNavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Navbar bg="white" expand="md" className="border-bottom shadow-sm" sticky="top">
      <Container fluid>
        <Navbar.Brand as={NavLink} to="/dashboard" className="fw-bold text-primary">
          <FaGraduationCap className="me-2" />Smart Study
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav" className="justify-content-end">
          <Nav className="d-md-none">
            {navItems.map(({ to, label }) => (
              <Nav.Link as={NavLink} key={to} to={to}>{label}</Nav.Link>
            ))}
          </Nav>
          <span className="text-muted me-3">{user?.name}</span>
          <Button variant="outline-secondary" size="sm" onClick={handleLogout}>
            <FaSignOutAlt className="me-1" />Déconnexion
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}