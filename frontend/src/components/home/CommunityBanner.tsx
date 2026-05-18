import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

export const CommunityBanner: React.FC = () => {
  const navigate = useNavigate();
  const images = [
    "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80&w=400"
  ];

  return (
    <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-12">
      <div className="bg-ink rounded-[48px] p-10 md:p-16 relative overflow-hidden flex flex-col md:flex-row gap-16 items-center shadow-2xl">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 blur-[120px] rounded-full" />
        
        <div className="flex-1 space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-primary">
            <MessageCircle className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Live Community</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
            让邻里生活<br /><span className="text-primary italic">不再孤单</span>
          </h2>
          <p className="text-lg text-white/50 font-medium leading-relaxed max-w-lg">
            不仅仅是服务的连接，更是情感的共鸣。在这里，每个互助和分享都在温暖着这座城市的角落。
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/news')}
              className="px-10 py-4 bg-primary text-white rounded-2xl font-black hover:bg-white hover:text-ink transition-all active:scale-95 shadow-2xl shadow-primary/20"
            >
              立即加入动态圈
            </button>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-4 relative z-10 w-full md:w-auto">
          {images.map((img, i) => (
            <motion.div 
              key={i} 
              whileHover={{ scale: 1.05 }}
              className="rounded-3xl overflow-hidden aspect-square border-4 border-white/10 shadow-2xl"
            >
              <img src={img} className="w-full h-full object-cover" alt="Community" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
