/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import ServiceList from './pages/ServiceList';
import MarketList from './pages/MarketList';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Profile from './pages/Profile';
import ServiceDetail from './pages/ServiceDetail';
import ItemDetail from './pages/ItemDetail';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <BrowserRouter>
          <Routes>
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
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              {/* Default to home for other routes for now */}
              <Route path="*" element={<Home />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ChatProvider>
    </AuthProvider>
  );
}
