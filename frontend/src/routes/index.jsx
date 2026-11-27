import { Navigate, Route, Routes } from 'react-router-dom';
import AdminRoute from '../components/AdminRoute';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';
import PublicLayout from '../layouts/PublicLayout';
import AccountLayout from '../components/account/AccountLayout';
import AccountOverviewPage from '../pages/account/AccountOverviewPage';
import TerminalPage from '../pages/TerminalPage';
import AccountOrdersPage from '../pages/account/AccountOrdersPage';
import AccountWishlistPage from '../pages/account/AccountWishlistPage';
import AccountRecentlyViewedPage from '../pages/account/AccountRecentlyViewedPage';
import AccountMembershipPage from '../pages/account/AccountMembershipPage';
import AccountAchievementsPage from '../pages/account/AccountAchievementsPage';
import AccountSettingsPage from '../pages/account/AccountSettingsPage';
import AccountCommunitySavedPage from '../pages/account/AccountCommunitySavedPage';
import CartPage from '../pages/CartPage';
import CatalogPage from '../pages/CatalogPage';
import CheckoutPage from '../pages/CheckoutPage';
import ComparePage from '../pages/ComparePage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import HomePage from '../pages/HomePage';
import JournalArticlePage from '../pages/JournalArticlePage';
import JournalPage from '../pages/JournalPage';
import CommunityPage from '../pages/CommunityPage';
import CommunityPostPage from '../pages/CommunityPostPage';
import CommunityProfilePage from '../pages/CommunityProfilePage';
import LoginPage from '../pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';
import OrderPage from '../pages/OrderPage';
import OrdersPage from '../pages/OrdersPage';
import ProductPage from '../pages/ProductPage';
import RegisterPage from '../pages/RegisterPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import RootAccessPage from '../pages/RootAccessPage';
import WishlistPage from '../pages/WishlistPage';
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage';
import AdminCustomersPage from '../pages/admin/AdminCustomersPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminFeaturedPage from '../pages/admin/AdminFeaturedPage';
import AdminJournalPage from '../pages/admin/AdminJournalPage';
import AdminCommunityPage from '../pages/admin/AdminCommunityPage';
import AdminMediaPage from '../pages/admin/AdminMediaPage';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';
import AdminProductsPage from '../pages/admin/AdminProductsPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';
import AdminStockPage from '../pages/admin/AdminStockPage';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/categoria/:slug" element={<CatalogPage />} />
        <Route path="/produto/:slug" element={<ProductPage />} />
        <Route path="/comparar" element={<ComparePage />} />
        <Route path="/favoritos" element={<WishlistPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/journal/:slug" element={<JournalArticlePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/community/user/:username" element={<CommunityProfilePage />} />
        <Route path="/community/:slug" element={<CommunityPostPage />} />
        <Route path="/carrinho" element={<CartPage />} />
        <Route path="/root-access" element={<RootAccessPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
        <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/conta" element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}>
          <Route index element={<AccountOverviewPage />} />
          <Route path="pedidos" element={<AccountOrdersPage />} />
          <Route path="favoritos" element={<AccountWishlistPage />} />
          <Route path="recentes" element={<AccountRecentlyViewedPage />} />
          <Route path="assinatura" element={<AccountMembershipPage />} />
          <Route path="conquistas" element={<AccountAchievementsPage />} />
          <Route path="comunidade-salvos" element={<AccountCommunitySavedPage />} />
          <Route path="configuracoes" element={<AccountSettingsPage />} />
        </Route>
        <Route path="/account" element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}>
          <Route index element={<AccountOverviewPage />} />
          <Route path="*" element={<Navigate to="/conta" replace />} />
        </Route>
        <Route path="/pedidos" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/pedido/:code" element={<ProtectedRoute><OrderPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="/terminal" element={<TerminalPage />} />
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="produtos" element={<AdminProductsPage />} />
        <Route path="categorias" element={<AdminCategoriesPage />} />
        <Route path="destaques" element={<AdminFeaturedPage />} />
        <Route path="midia" element={<AdminMediaPage />} />
        <Route path="estoque" element={<AdminStockPage />} />
        <Route path="pedidos" element={<AdminOrdersPage />} />
        <Route path="clientes" element={<AdminCustomersPage />} />
        <Route path="journal" element={<AdminJournalPage />} />
        <Route path="comunidade" element={<AdminCommunityPage />} />
        <Route path="configuracoes" element={<AdminSettingsPage />} />
        <Route path="*" element={<AdminDashboardPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
