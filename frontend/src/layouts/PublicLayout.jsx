import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import MobileNav from '../components/MobileNav';

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-void text-slate-100">
      <Header />
      <main className="flex-1 pb-24 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}

export default PublicLayout;
