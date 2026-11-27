import { Outlet } from 'react-router-dom';
import CompareBar from '../components/CompareBar';
import Footer from '../components/Footer';
import Header from '../components/Header';
import MobileNav from '../components/MobileNav';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <CompareBar />
      <MobileNav />
    </div>
  );
}
