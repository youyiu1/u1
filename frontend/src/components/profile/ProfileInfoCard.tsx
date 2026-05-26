import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, MessageCircle, MapPin, Calendar } from 'lucide-react';
import { FollowButton } from '../common/FollowButton';
import { useChat } from '../../context/ChatContext';

interface ProfileInfoCardProps {
  userData: any;
  username: string;
  stats: {
    followers: number;
    isFollowing: boolean;
  };
  handleFollowChange: (isFollowing: boolean) => void;
  isOwnProfile?: boolean;
}

export const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  userData,
  username,
  stats,
  handleFollowChange,
  isOwnProfile = false
}) => {
  const { openChat } = useChat();

  return (
    <div className="md:w-[320px] space-y-4 md:space-y-6">
      <div className="bg-white rounded-[32px] md:rounded-3xl p-6 md:p-8 shadow-xl border border-hairline relative">
        <div className="text-center">
          <div className="relative inline-block mb-4 md:mb-6">
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={userData.avatar || undefined}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg mx-auto object-cover"
              alt=""
            />
            {(userData.verified || userData.isVerified) && (
              <div className="absolute bottom-1 right-1 bg-primary text-white rounded-full p-1.5 border-2 border-white shadow-sm">
                <ShieldCheck className="w-3 md:w-4 h-3 md:h-4" />
              </div>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-black text-ink mb-1">{userData.name}</h1>
          <p className="text-[10px] md:text-xs font-black text-primary px-3 py-1 bg-primary/5 rounded-full inline-block mb-6 uppercase tracking-widest leading-none">
             {userData.tag}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-2 md:mb-6">
            {!isOwnProfile && (
              <>
                <FollowButton
                  targetId={userData.id}
                  isFollowingInitial={stats.isFollowing}
                  onFollowChange={handleFollowChange}
                  variant="primary"
                  className="w-full text-[11px] h-11 rounded-xl"
                />
                <button
                  onClick={() => openChat({
                    id: userData.id,
                    name: userData.name,
                    avatar: userData.avatar,
                    isOnline: true
                  })}
                  className="h-11 bg-surface-soft text-ink rounded-xl text-[11px] font-black border border-hairline hover:bg-hairline transition-colors flex items-center justify-center gap-1.5 uppercase tracking-widest"
                >
                  <MessageCircle className="w-4 h-4" />
                  发消息
                </button>
              </>
            )}
            {isOwnProfile && (
              <button
                onClick={() => {}}
                className="col-span-2 h-11 bg-primary text-white rounded-xl text-[11px] font-black hover:bg-primary-hover transition-colors flex items-center justify-center gap-1.5 uppercase tracking-widest"
              >
                编辑个人资料
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-hairline rounded-[24px] md:rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
         <h3 className="text-[10px] font-black uppercase tracking-widest text-muted border-b border-hairline pb-3 mb-2">个人资料</h3>
         <div className="flex items-center gap-3 text-xs text-secondary font-bold">
            <div className="w-8 h-8 rounded-lg bg-surface-soft flex items-center justify-center text-muted">
              <MapPin className="w-4 h-4" />
            </div>
            <span>滨江区 · 金地格林世界</span>
         </div>
         <div className="flex items-center gap-3 text-xs text-secondary font-bold">
            <div className="w-8 h-8 rounded-lg bg-surface-soft flex items-center justify-center text-muted">
              <Calendar className="w-4 h-4" />
            </div>
            <span>加入于 2024年3月</span>
         </div>
      </div>
    </div>
  );
};
