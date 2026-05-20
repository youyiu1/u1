import React from 'react';
import { motion } from 'motion/react';
import { Post } from '../../types';
import { LikeButton } from '../common/LikeButton';

interface HomePostCardProps {
  post: Post;
  idx: number;
}

export const HomePostCard: React.FC<HomePostCardProps> = ({ post, idx }) => {
  const author = post.author || { name: '匿名用户', avatar: '', verified: false };
  const avatarSrc = author.avatar || null;
  const commentAvatars = post.comments?.slice(0, 3).map(c => c.avatar).filter(Boolean) || [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col bg-white border border-hairline rounded-[48px] p-10 hover:shadow-premium transition-all duration-700 group h-full"
    >
      <div className="flex items-center gap-6 mb-10">
        <div className="relative">
          {avatarSrc ? (
            <img src={avatarSrc} alt={author.name} className="w-16 h-16 rounded-full object-cover ring-2 ring-hairline ring-offset-4 group-hover:ring-primary/30 transition-all duration-700" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-stone-200 flex items-center justify-center text-stone-400 font-bold text-xl">
              {author.name.charAt(0)}
            </div>
          )}
          {author.verified && <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary border-4 border-white rounded-full shadow-sm" />}
        </div>
        <div>
          <h4 className="text-lg font-black text-ink group-hover:text-primary transition-colors">{author.name}</h4>
          <p className="text-[10px] font-black text-secondary tracking-widest uppercase opacity-40">{post.time} • {post.location}</p>
        </div>
      </div>

      <p className="text-ink font-medium leading-relaxed mb-10 text-xl group-hover:text-ink/80 transition-colors line-clamp-3">
        {post.content}
      </p>

      {(post.images?.length ?? 0) > 0 && post.images[0] && (
        <div className="aspect-[16/9] rounded-[32px] overflow-hidden mb-10 shadow-inner bg-stone-100">
          <img src={post.images[0]} alt="Post content" className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-[0.16,1,0.3,1]" />
        </div>
      )}

      <div className="mt-auto flex items-center justify-between pt-10 border-t border-hairline">
        <div className="flex items-center gap-8">
          <LikeButton initialLikes={post.likes} isLikedInitial={post.likes > 100} />
          <button className="flex items-center gap-2.5 group/btn">
             <div className="text-[10px] font-black text-muted group-hover/btn:text-ink uppercase tracking-widest leading-none underline decoration-hairline underline-offset-4">评论 {post.commentsCount}</div>
          </button>
        </div>
        {commentAvatars.length > 0 && (
          <div className="flex -space-x-3 group-hover:-space-x-1 transition-all duration-500">
            {commentAvatars.map((avatar, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-stone-100 overflow-hidden">
                <img src={avatar} alt="commenter" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};