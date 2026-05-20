/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  MessageSquare,
  HandHelping,
  Camera,
  X,
  ArrowRight,
  ChevronLeft,
  Send,
  CheckCircle2
} from 'lucide-react';
import { newsApi, marketApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PUBLISH_OPTIONS = [
  {
    id: 'market',
    title: '闲置交易',
    desc: '转让好物，让闲置变现',
    icon: <ShoppingBag className="w-8 h-8" />,
    color: 'bg-accent-gold',
    lightColor: 'bg-accent-gold/10',
  },
  {
    id: 'news',
    title: '同城动态',
    desc: '分享生活点滴与见闻',
    icon: <MessageSquare className="w-8 h-8" />,
    color: 'bg-accent-blue',
    lightColor: 'bg-accent-blue/10',
  },
  {
    id: 'help',
    title: '寻求帮助',
    desc: '互助邻里，共同解决',
    icon: <HandHelping className="w-8 h-8" />,
    color: 'bg-accent-green',
    lightColor: 'bg-accent-green/10',
  },
  {
    id: 'snap',
    title: '随手拍',
    desc: '即刻分享眼前的精彩',
    icon: <Camera className="w-8 h-8" />,
    color: 'bg-accent-purple',
    lightColor: 'bg-accent-purple/10',
  }
];

interface PublishOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSelectedId?: string;
}

export const PublishOverlay: React.FC<PublishOverlayProps> = ({ isOpen, onClose, defaultSelectedId }) => {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(defaultSelectedId || null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');
  const [condition, setCondition] = useState('全新');
  const [newsType, setNewsType] = useState('生活记录');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedOption = PUBLISH_OPTIONS.find(o => o.id === selectedId);

  const handlePublish = async () => {
    if (!selectedId || !canSubmit || !user) return;

    setIsSubmitting(true);
    try {
      if (selectedId === 'news') {
        await newsApi.create({
          title: title || content.substring(0, 30),
          content: content,
          category: newsType,
        });
      } else if (selectedId === 'market') {
        await marketApi.create({
          title,
          price: Number(price),
          itemCondition: condition,
          description: content,
        } as any);
      } else if (selectedId === 'help') {
        // 寻求帮助 - 作为同城动态发布
        await newsApi.create({
          title: title || content.substring(0, 30),
          content: content,
          category: '寻求帮助',
        });
      } else if (selectedId === 'snap') {
        // 随手拍 - 作为同城动态发布
        await newsApi.create({
          title: title || content.substring(0, 30),
          content: content,
          category: '随手拍',
        });
      }
      setIsSuccess(true);
      setTimeout(() => {
        handleReset();
        onClose();
      }, 2000);
    } catch (err) {
      console.error('发布失败', err);
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedId(null);
    setTitle('');
    setPrice('');
    setUrgency('normal');
    setCondition('全新');
    setNewsType('生活记录');
    setContent('');
    setIsSuccess(false);
  };

  const canSubmit = useMemo(() => {
    if (!selectedId) return false;
    if (selectedId === 'market') return title.trim() && price.trim() && content.trim();
    if (selectedId === 'help') return title.trim() && content.trim();
    if (selectedId === 'news') return title.trim() && content.trim();
    return content.trim();
  }, [selectedId, title, price, content]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/60 backdrop-blur-xl pointer-events-auto"
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl my-auto z-10"
          >
            <div className="bg-white rounded-[48px] overflow-hidden shadow-2xl p-8 md:p-16 relative min-h-[600px] flex flex-col justify-center">
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 p-4 hover:bg-stone-100 rounded-full transition-all group z-20"
              >
                <X className="w-6 h-6 text-ink group-hover:rotate-90 transition-transform duration-300" />
              </button>

              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20"
                  >
                    <div className="w-24 h-24 bg-accent-green/10 text-accent-green rounded-full flex items-center justify-center mx-auto mb-8">
                       <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h3 className="text-3xl font-black text-ink mb-4">发布成功！</h3>
                    <p className="text-secondary font-bold">邻里们很快就能看到你的动态了</p>
                  </motion.div>
                ) : !selectedId ? (
                  <motion.div 
                    key="selection"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div className="text-center mb-16">
                      <span className="text-[10px] font-black tracking-[0.4em] text-primary uppercase mb-4 block">Create Something New</span>
                      <h2 className="text-4xl md:text-5xl font-black text-ink tracking-tight">你想分享什么？</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {PUBLISH_OPTIONS.map((option, idx) => (
                        <motion.div
                          key={option.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          whileHover={{ y: -8 }}
                          onClick={() => setSelectedId(option.id)}
                          className="group"
                        >
                          <div className="bg-stone-50 p-8 rounded-[40px] border border-hairline hover:bg-white hover:shadow-premium transition-all duration-500 h-full flex flex-col items-center text-center cursor-pointer">
                            <div className={`w-16 h-16 ${option.lightColor} text-white rounded-3xl flex items-center justify-center mb-8`}>
                              <div className={`${option.color} p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                {React.cloneElement(option.icon as React.ReactElement, { className: 'w-6 h-6' })}
                              </div>
                            </div>
                            <h3 className="text-xl font-black text-ink mb-3 tracking-tight">{option.title}</h3>
                            <p className="text-secondary text-sm font-medium mb-8 leading-relaxed opacity-70">{option.desc}</p>
                            <div className="mt-auto p-4 rounded-full bg-white border border-hairline text-ink group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500">
                              <ArrowRight className="w-5 h-5" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="max-w-2xl mx-auto w-full"
                  >
                    <button 
                      onClick={() => handleReset()}
                      className="flex items-center gap-2 text-muted hover:text-ink transition-colors mb-8 font-black uppercase tracking-widest text-[10px]"
                    >
                      <ChevronLeft className="w-4 h-4" /> 返回重选
                    </button>

                    <div className="flex items-start gap-6 mb-10">
                       <div className={`w-20 h-20 ${selectedOption?.lightColor} rounded-[32px] flex items-center justify-center shrink-0`}>
                          <div className={`${selectedOption?.color} p-4 rounded-2xl text-white shadow-lg`}>
                             {React.cloneElement(selectedOption?.icon as React.ReactElement, { className: 'w-8 h-8' })}
                          </div>
                       </div>
                       <div>
                          <h2 className="text-3xl font-black text-ink mb-2">发布{selectedOption?.title}</h2>
                          <p className="text-secondary font-medium tracking-tight text-sm">{selectedOption?.desc}</p>
                       </div>
                    </div>

                    <div className="space-y-6">
                       {/* Contextual Fields */}
                       <div className="bg-stone-50 rounded-[32px] p-8 border border-hairline focus-within:bg-white focus-within:shadow-premium focus-within:border-primary/20 transition-all space-y-6">
                          {(selectedId === 'market' || selectedId === 'help' || selectedId === 'news') && (
                            <div className="border-b border-hairline pb-4">
                              <input 
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={selectedId === 'market' ? '物品名称 (如: 富士自拍相机)' : '标题'}
                                className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl font-black placeholder:text-muted/30"
                              />
                            </div>
                          )}

                          {selectedId === 'market' && (
                            <div className="flex flex-wrap gap-4 border-b border-hairline pb-4">
                               <div className="flex items-center gap-2 pr-4 border-r border-hairline">
                                  <span className="text-lg font-black text-ink">¥</span>
                                  <input 
                                   type="number"
                                   value={price}
                                   onChange={(e) => setPrice(e.target.value)}
                                   placeholder="价格"
                                   className="w-24 bg-transparent border-none p-0 focus:ring-0 text-lg font-bold placeholder:text-muted/30"
                                 />
                               </div>
                               <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black text-muted uppercase tracking-widest">成色:</span>
                                  <div className="flex gap-2">
                                     {['全新', '几乎全新', '九成新', '七成新', '坏件/拆解'].map(c => (
                                       <button 
                                         key={c}
                                         onClick={() => setCondition(c)}
                                         className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                           condition === c ? 'bg-accent-gold text-white shadow-md' : 'bg-white text-muted border border-hairline'
                                         }`}
                                       >
                                         {c}
                                       </button>
                                     ))}
                                  </div>
                               </div>
                            </div>
                          )}

                          {selectedId === 'news' && (
                            <div className="flex items-center gap-4 border-b border-hairline pb-4 overflow-x-auto no-scrollbar py-1">
                               <span className="text-[10px] font-black text-muted uppercase tracking-widest whitespace-nowrap">分类标签:</span>
                               <div className="flex gap-2">
                                  {['生活记录', '同城发现', '探店动态', '邻里闲情', '物业反馈'].map(t => (
                                    <button 
                                      key={t}
                                      onClick={() => setNewsType(t)}
                                      className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                                        newsType === t ? 'bg-accent-blue text-white shadow-md' : 'bg-white text-muted border border-hairline'
                                      }`}
                                    >
                                      {t}
                                    </button>
                                  ))}
                               </div>
                            </div>
                          )}

                          {selectedId === 'help' && (
                            <div className="flex items-center gap-4">
                               <span className="text-[10px] font-black text-muted uppercase tracking-widest">紧急程度:</span>
                               <div className="flex gap-2">
                                  {['normal', 'urgent'].map(t => (
                                    <button 
                                      key={t}
                                      onClick={() => setUrgency(t as any)}
                                      className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        urgency === t 
                                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' 
                                          : 'bg-white text-muted border border-hairline'
                                      }`}
                                    >
                                      {t === 'normal' ? '普通' : '紧急 🔥'}
                                    </button>
                                  ))}
                               </div>
                            </div>
                          )}

                          <textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={
                              selectedId === 'market' ? '详细描述物品的新旧程度、转让原因等...' :
                              selectedId === 'help' ? '简单描述你遇到的问题，或需要的帮助...' :
                              '写点什么，让邻里感受到你的温度...'
                            }
                            className={`w-full bg-transparent border-none p-0 focus:ring-0 text-lg font-medium placeholder:text-muted/40 resize-none ${selectedId === 'snap' ? 'min-h-[150px]' : 'min-h-[120px]'}`}
                          />
                       </div>

                       <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                             <button className="p-4 bg-stone-50 rounded-2xl border border-hairline hover:bg-stone-100 transition-colors text-secondary">
                                <Camera className="w-5 h-5" />
                             </button>
                             <div className="flex flex-col">
                               <span className="text-[10px] font-black text-muted uppercase tracking-widest">添加图片</span>
                               <span className="text-[9px] text-muted opacity-50 font-bold">最多 9 张</span>
                             </div>
                          </div>

                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handlePublish}
                            disabled={!canSubmit || isSubmitting}
                            className={`h-16 px-12 rounded-[24px] font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3 transition-all ${
                              canSubmit && !isSubmitting
                                ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                                : 'bg-hairline text-muted cursor-not-allowed'
                            }`}
                          >
                            {isSubmitting ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                立即发布
                                <Send className="w-4 h-4" />
                              </>
                            )}
                          </motion.button>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-16 text-center">
                <p className="text-[10px] text-muted font-black uppercase tracking-[0.3em] opacity-40">
                  在同城生活，每一次发布都是在连接更有温度的邻里关系。
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
