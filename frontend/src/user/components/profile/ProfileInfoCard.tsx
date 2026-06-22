import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, MessageCircle, MapPin, Calendar } from 'lucide-react';
import { FollowButton } from '../common/FollowButton';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useAuthCheck } from '../../context/useAuthCheck';
import { useToast } from '../../context/ToastContext';
import { EditProfileOverlay } from './EditProfileOverlay';
import { formatDateTime } from '../../utils/dateTime';

interface ProfileInfoCardProps {
  userData: any;
  username: string;
  stats: {
    followers: number;
    isFollowing: boolean;
  };
  handleFollowChange: (isFollowing: boolean) => void;
  isOwnProfile?: boolean;
  onProfileUpdated?: (user: Partial<any>) => void;
}

export const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  userData,
  username,
  stats,
  handleFollowChange,
  isOwnProfile = false,
  onProfileUpdated
}) => {
  const { openChat } = useChat();
  const { user } = useAuth();
  const { requireAuth } = useAuthCheck();
  const { showToast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [userData.avatar]);

  const locationText = userData.region || userData.tag || '未设置地区';
  const joinText = userData.createdAt ? formatDateTime(userData.createdAt).split(' ')[0] : '未知';
  const followingCount = userData.followingCount || 0;
  const followersCount = stats.followers || userData.followersCount || 0;

  const handleOpenChat = () => {
    if (!userData?.id) return;
    if (user?.id && user.id === userData.id) {
      showToast('不能给自己发送消息', 'warning');
      return;
    }
    requireAuth(() => openChat({
      id: userData.id,
      name: userData.name || username,
      avatar: userData.avatar || '',
      isOnline: userData.isOnline
    }));
  };

  return (
    <div className="md:w-[320px] space-y-4 md:space-y-6">
      <div className="theme-card relative rounded-[32px] p-6 shadow-xl md:rounded-3xl md:p-8">
        <div className="text-center">
          <div className="relative inline-block mb-4 md:mb-6">
            {userData.avatar && !imageError ? (
              <motion.img
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={userData.avatar}
                onError={() => setImageError(true)}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg mx-auto object-cover"
                alt={userData.name}
              />
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg mx-auto object-cover bg-surface-soft flex items-center justify-center text-2xl font-black text-primary">
                {(userData.name || 'U').slice(0, 1).toUpperCase()}
              </div>
            )}
            {(userData.verified || userData.isVerified) && (
              <div className="absolute bottom-1 right-1 bg-primary text-white rounded-full p-1.5 border-2 border-white shadow-sm">
                <ShieldCheck className="w-3 md:w-4 h-3 md:h-4" />
              </div>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-black text-ink mb-1">{userData.name}</h1>
          <p className="text-[10px] md:text-xs font-black text-primary px-3 py-1 bg-primary/5 rounded-full inline-block mb-3 uppercase tracking-widest leading-none">
            {userData.tag || '个人主页'}
          </p>
          {userData.bio && (
            <p className="text-xs text-secondary leading-5 mb-6 line-clamp-3">{userData.bio}</p>
          )}

          <div className="mb-5 grid grid-cols-2 gap-3 rounded-2xl bg-surface-soft/70 px-4 py-3">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted">关注</p>
              <p className="mt-1 text-lg font-black text-ink">{followingCount}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted">粉丝</p>
              <p className="mt-1 text-lg font-black text-ink">{followersCount}</p>
            </div>
          </div>

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
                  onClick={handleOpenChat}
                  className="h-11 bg-surface-soft text-ink rounded-xl text-[11px] font-black border border-hairline hover:bg-hairline transition-colors flex items-center justify-center gap-1.5 uppercase tracking-widest"
                >
                  <MessageCircle className="w-4 h-4" />
                  发消息
                </button>
              </>
            )}
            {isOwnProfile && (
              <button
                onClick={() => setIsEditOpen(true)}
                className="col-span-2 h-11 bg-primary text-white rounded-xl text-[11px] font-black hover:bg-primary-hover transition-colors flex items-center justify-center gap-1.5 uppercase tracking-widest"
              >
                编辑个人资料
              </button>
            )}
          </div>
        </div>
      </div>

      {isEditOpen && (
        <EditProfileOverlay
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSuccess={onProfileUpdated}
        />
      )}

      <div className="theme-card space-y-4 rounded-[24px] p-5 shadow-sm md:rounded-2xl md:p-6">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted border-b border-hairline pb-3 mb-2">个人资料</h3>
        <div className="flex items-center gap-3 text-xs text-secondary font-bold">
          <div className="w-8 h-8 rounded-lg bg-surface-soft flex items-center justify-center text-muted">
            <MapPin className="w-4 h-4" />
          </div>
          <span>{locationText}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-secondary font-bold">
          <div className="w-8 h-8 rounded-lg bg-surface-soft flex items-center justify-center text-muted">
            <Calendar className="w-4 h-4" />
          </div>
          <span>加入于 {joinText}</span>
        </div>
        {userData.email && (
          <div className="flex items-center gap-3 text-xs text-secondary font-bold">
            <div className="w-8 h-8 rounded-lg bg-surface-soft flex items-center justify-center text-muted">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span>{userData.email}</span>
          </div>
        )}
      </div>
    </div>
  );
};
