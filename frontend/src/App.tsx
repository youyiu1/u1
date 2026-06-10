/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './user/context/AuthContext';
import { ChatProvider } from './user/context/ChatContext';
import { NotificationProvider } from './user/context/NotificationContext';
import { PublishProvider } from './user/context/PublishContext';
import { ThemeProvider } from './user/context/ThemeContext';
import { ToastProvider } from './user/context/ToastContext';
import Layout from './user/components/layout/Layout';
import Login from './user/pages/auth/LoginPage';
import Register from './user/pages/auth/RegisterPage';

const Home = lazy(() => import('./user/pages/home/HomePage'));
const ServiceList = lazy(() => import('./user/pages/service/ServiceListPage'));
const MarketList = lazy(() => import('./user/pages/market/MarketListPage'));
const News = lazy(() => import('./user/pages/news/NewsListPage'));
const NewsDetail = lazy(() => import('./user/pages/news/NewsDetailPage'));
const Profile = lazy(() => import('./user/pages/profile/ProfilePage'));
const ServiceDetail = lazy(() => import('./user/pages/service/ServiceDetailPage'));
const ItemDetail = lazy(() => import('./user/pages/market/ItemDetailPage'));
const Search = lazy(() => import('./user/pages/search/SearchPage'));
const Terms = lazy(() => import('./user/pages/legal/TermsPage'));
const Privacy = lazy(() => import('./user/pages/legal/PrivacyPage'));
const AdminApp = lazy(() => import('./admin/AdminApp'));

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <NotificationProvider>
            <ChatProvider>
              <PublishProvider>
                <BrowserRouter>
                  <Suspense fallback={<PageFallback />}>
                    <Routes>
                      <Route path="/admin/*" element={<AdminApp />} />
                      <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="service" element={<ServiceList />} />
                        <Route path="service/:id" element={<ServiceDetail />} />
                        <Route path="market" element={<MarketList />} />
                        <Route path="item/:id" element={<ItemDetail />} />
                        <Route path="news" element={<News />} />
                        <Route path="news/:id" element={<NewsDetail />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="profile/:username" element={<Profile />} />
                        <Route path="search" element={<Search />} />
                        <Route path="login" element={<Login />} />
                        <Route path="register" element={<Register />} />
                        <Route path="terms" element={<Terms />} />
                        <Route path="privacy" element={<Privacy />} />
                        <Route path="*" element={<Home />} />
                      </Route>
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </PublishProvider>
            </ChatProvider>
          </NotificationProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
