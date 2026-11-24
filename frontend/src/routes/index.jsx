import { Route, Routes } from 'react-router-dom';
import AdminRoute from '../components/AdminRoute';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';
import PublicLayout from '../layouts/PublicLayout';
import AccountPage from '../pages/AccountPage';
import CartPage from '../pages/CartPage';
import CatalogPage from '../pages/CatalogPage';
import CheckoutPage from '../pages/CheckoutPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';
import OrderPage from '../pages/OrderPage';
import OrdersPage from '../pages/OrdersPage';
import ProductPage from '../pages/ProductPage';
import RegisterPage from '../pages/RegisterPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage';
import AdminCustomersPage from '../pages/admin/AdminCustomersPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';
import AdminProductsPage from '../pages/admin/AdminProductsPage';
import AdminStockPage from '../pages/admin/AdminStockPage';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/categoria/:slug" element={<CatalogPage />} />
        <Route path="/produto/:slug" element={<ProductPage />} />
        <Route path="/carrinho" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
        <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/conta" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        <Route path="/pedidos" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/pedido/:code" element={<ProtectedRoute><OrderPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="produtos" element={<AdminProductsPage />} />
        <Route path="categorias" element={<AdminCategoriesPage />} />
        <Route path="estoque" element={<AdminStockPage />} />
        <Route path="pedidos" element={<AdminOrdersPage />} />
        <Route path="clientes" element={<AdminCustomersPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
