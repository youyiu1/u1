/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { PublishProvider } from './context/PublishContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import ServiceList from './pages/ServiceList';
import MarketList from './pages/MarketList';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Profile from './pages/Profile';
import ServiceDetail from './pages/ServiceDetail';
import ItemDetail from './pages/ItemDetail';
import Search from './pages/Search';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminApp from './admin/AdminApp';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationProvider>
          <ChatProvider>
          <PublishProvider>
          <BrowserRouter>
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
          </BrowserRouter>
          </PublishProvider>
        </ChatProvider>
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
