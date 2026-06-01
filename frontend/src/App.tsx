/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { PublishProvider } from './context/PublishContext';
import Layout from './components/layout/Layout';

const Home = lazy(() => import('./pages/Home'));
const ServiceList = lazy(() => import('./pages/ServiceList'));
const MarketList = lazy(() => import('./pages/MarketList'));
const News = lazy(() => import('./pages/News'));
const NewsDetail = lazy(() => import('./pages/NewsDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const ItemDetail = lazy(() => import('./pages/ItemDetail'));
const Search = lazy(() => import('./pages/Search'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AdminApp = lazy(() => import('./admin/AdminApp'));

function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
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
  );
}
