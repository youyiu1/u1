import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bot,
  LoaderCircle,
  MessageCircleMore,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { aiApi } from '../../services/api';
import { getErrorMessage } from '../../utils/error';

type AiMessageRole = 'assistant' | 'user';

type AiMessage = {
  id: string;
  role: AiMessageRole;
  content: string;
};

const STORAGE_KEY = 'ai_assistant_messages';
const MAX_MESSAGES = 24;
const DEFAULT_SYSTEM_PROMPT =
  '你是同城生活社区平台的 AI 助手，请结合本项目的生活服务、闲置交易、同城动态、消息通知、用户主页等场景，用简洁、友好、实用的中文回答。';
const QUICK_QUESTIONS = [
  '帮我写一段闲置商品介绍',
  '帮我润色生活服务发布文案',
  '给我想一个同城动态标题',
];
const DEFAULT_MESSAGES: AiMessage[] = [
  {
    id: 'assistant-welcome',
    role: 'assistant',
    content: '你好，我是同城生活 AI 小助手，可以帮你写服务文案、闲置卖点、动态标题，也会尽量按当前项目场景来回答。',
  },
];

function readStoredMessages(): AiMessage[] {
  if (typeof window === 'undefined') {
    return DEFAULT_MESSAGES;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_MESSAGES;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_MESSAGES;
    }

    const validMessages = parsed.filter(
      (item): item is AiMessage =>
        !!item &&
        typeof item.id === 'string' &&
        (item.role === 'assistant' || item.role === 'user') &&
        typeof item.content === 'string'
    );

    return validMessages.length > 0 ? validMessages.slice(-MAX_MESSAGES) : DEFAULT_MESSAGES;
  } catch {
    return DEFAULT_MESSAGES;
  }
}

function AssistantBubble({ content }: { content: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary via-[#ff7b5f] to-[#ffb457] text-white shadow-lg shadow-primary/20">
        <Bot className="h-4 w-4" />
      </div>
      <div className="max-w-[88%] rounded-[20px] rounded-tl-md border border-white/75 bg-white px-3.5 py-2.5 text-[13px] leading-6 text-ink shadow-sm shadow-stone-900/5">
        {content}
      </div>
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[84%] rounded-[20px] rounded-tr-md bg-linear-to-br from-primary to-[#ff7b5f] px-3.5 py-2.5 text-[13px] leading-6 text-white shadow-lg shadow-primary/15">
        {content}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary via-[#ff7b5f] to-[#ffb457] text-white shadow-lg shadow-primary/20">
        <Bot className="h-4 w-4" />
      </div>
      <div className="inline-flex items-center gap-2 rounded-[20px] rounded-tl-md border border-white/75 bg-white px-3.5 py-2.5 text-[13px] text-muted shadow-sm shadow-stone-900/5">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        正在整理回复...
      </div>
    </div>
  );
}

export function AiAssistantWidget() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, authReady } = useAuth();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>(() => readStoredMessages());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_MESSAGES)));
  }, [messages]);

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen, isSending]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const canSend = input.trim().length > 0 && !isSending;
  const panelTitle = isAuthenticated ? 'AI 助手在线' : '登录后可用';

  const appendMessage = (role: AiMessageRole, content: string) => {
    const nextMessage: AiMessage = {
      id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      role,
      content,
    };
    setMessages((current) => [...current, nextMessage].slice(-MAX_MESSAGES));
  };

  const clearMessages = () => {
    setMessages(DEFAULT_MESSAGES);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    showToast('已清空 AI 对话记录', 'success');
  };

  const handleLoginRedirect = () => {
    navigate('/login', {
      state: {
        from: `${location.pathname}${location.search}${location.hash}` || '/',
      },
    });
  };

  const handleSend = async (preset?: string) => {
    const message = (preset ?? input).trim();
    if (!message || isSending) {
      return;
    }

    if (!authReady || !isAuthenticated) {
      showToast('请先登录后再使用 AI 助手', 'warning');
      handleLoginRedirect();
      return;
    }

    appendMessage('user', message);
    setInput('');
    setIsSending(true);

    try {
      const reply = await aiApi.chat(message, DEFAULT_SYSTEM_PROMPT);
      appendMessage('assistant', reply);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'AI 助手暂时不可用，请稍后再试');
      appendMessage('assistant', errorMessage);
      showToast(errorMessage, 'warning');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        initial={false}
        animate={{ x: isOpen ? 0 : 82 }}
        whileHover={{ x: isOpen ? 0 : 60 }}
        whileTap={{ scale: 0.98 }}
        aria-label={isOpen ? '关闭 AI 助手' : '打开 AI 助手'}
        className="fixed bottom-28 right-0 z-[55] flex items-center gap-3 rounded-l-[26px] rounded-r-none border border-r-0 border-primary/15 bg-white/96 px-3.5 py-3 text-left shadow-[0_18px_40px_rgba(15,23,42,0.14)] backdrop-blur md:bottom-auto md:top-[68%] md:-translate-y-1/2"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary via-[#ff7b5f] to-[#ffb457] text-white shadow-lg shadow-primary/20">
          <Bot className="h-5 w-5" />
        </div>
        <div className="hidden min-w-0 pr-1 sm:block">
          <p className="text-sm font-black text-ink">AI 小助手</p>
          <p className="text-[11px] font-medium text-muted">服务 / 交易 / 动态</p>
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen ? (
          <motion.aside
            initial={{ opacity: 0, x: 24, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-3 z-[55] flex h-[min(72vh,40rem)] w-[calc(100vw-1rem)] max-w-[22rem] flex-col overflow-hidden rounded-[28px] border border-white/75 bg-[#fcfaf7] shadow-[0_28px_72px_rgba(15,23,42,0.16)] sm:right-5 md:right-6"
          >
            <div className="border-b border-stone-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.2),_transparent_34%),linear-gradient(135deg,#16100a_0%,#2d2015_45%,#53331d_100%)] px-4 py-3 text-white">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1.5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/90">
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    {panelTitle}
                  </div>
                  <h3 className="text-base font-black tracking-tight">更懂当前项目的内容助手</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={clearMessages}
                    className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    title="清空记录"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    title="关闭"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto bg-[linear-gradient(180deg,rgba(248,245,240,0.82),rgba(255,255,255,0.96))] px-3.5 py-3"
            >
              {messages.map((message) => (
                <div key={message.id}>
                  {message.role === 'assistant' ? (
                    <AssistantBubble content={message.content} />
                  ) : (
                    <UserBubble content={message.content} />
                  )}
                </div>
              ))}
              {isSending ? <TypingBubble /> : null}
            </div>

            <div className="border-t border-stone-200/80 bg-white/95 px-3.5 py-2.5 backdrop-blur">
              {!isAuthenticated ? (
                <div className="rounded-[22px] border border-dashed border-primary/20 bg-primary/5 px-3.5 py-3">
                  <p className="text-sm font-black text-ink">登录后才能直接对话</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    登录后它会按你当前项目里的服务、交易、动态场景来给建议。
                  </p>
                  <button
                    type="button"
                    onClick={handleLoginRedirect}
                    className="mt-3 inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
                  >
                    去登录
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {QUICK_QUESTIONS.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => void handleSend(question)}
                        disabled={isSending}
                        className="shrink-0 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-bold text-stone-600 transition-colors hover:border-primary/20 hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {question}
                      </button>
                    ))}
                  </div>

                  <div className="rounded-[24px] border border-stone-200 bg-stone-50/90 p-2.5 shadow-inner shadow-stone-100/70 focus-within:border-primary/25 focus-within:bg-white">
                    <div className="mb-1.5 flex items-center gap-2 px-1 text-[11px] font-bold text-muted">
                      <MessageCircleMore className="h-4 w-4" />
                      直接说需求，按回车发送
                    </div>
                    <div className="flex items-end gap-2.5">
                      <textarea
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            void handleSend();
                          }
                        }}
                        placeholder="比如：帮我写一个更像本地社区平台的服务介绍"
                        className="min-h-[46px] max-h-24 flex-1 resize-none bg-transparent px-1 py-1 text-sm text-ink outline-none placeholder:text-muted/55"
                      />
                      <button
                        type="button"
                        onClick={() => void handleSend()}
                        disabled={!canSend}
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${
                          canSend
                            ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-hover'
                            : 'bg-stone-200 text-stone-400'
                        }`}
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}
