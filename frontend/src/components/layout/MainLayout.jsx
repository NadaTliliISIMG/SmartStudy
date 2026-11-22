import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import AppNavbar from './AppNavbar';
import Sidebar from './Sidebar';

export default function MainLayout() {
  return (
    <>
      <AppNavbar />
      <div className="d-flex">
        <aside className="app-sidebar d-none d-md-block border-end bg-white">
          <Sidebar />
        </aside>
        <main className="flex-grow-1 bg-light app-main">
          <Container fluid className="p-4">
            <Outlet />
          </Container>
        </main>
      </div>
    </>
  );
}