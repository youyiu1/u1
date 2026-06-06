/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Service, Item } from '../../types';
import { getItemPrimaryImage, getServicePrimaryImage } from '../../utils/images';

import { LikeButton } from './LikeButton';

interface CardProps {
  type: 'service' | 'item';
  data: any; // Using any temporarily to bypass strict union issues
  size?: 'default' | 'homeCompact';
}

export const GlobalCard: React.FC<CardProps> = ({ type, data, size = 'default' }) => {
  const navigate = useNavigate();
  const isService = type === 'service';
  const service = data as Service;
  const item = data as Item;
  const primaryImage = isService ? getServicePrimaryImage(service) : getItemPrimaryImage(item);
  const isHomeCompact = size === 'homeCompact';

  return (
    <div className="group cursor-pointer content-visibility-auto">
      <div onClick={() => navigate(`/${isService ? 'service' : 'item'}/${data.id}`, { state: { from: '/' } })}>
        <div
          className={`relative aspect-[4/5] overflow-hidden bg-stone-100 shadow-inner transition-shadow duration-300 ease-out ${
            isHomeCompact ? 'mb-4 rounded-[24px]' : 'mb-6 rounded-[32px]'
          }`}
        >
          <img
            src={primaryImage || undefined}
            alt={data.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-ink opacity-0 transition-opacity duration-200 group-hover:opacity-5" />

          <div
            className={`pointer-events-none absolute inset-0 flex items-end justify-start opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
              isHomeCompact ? 'p-4' : 'p-6'
            }`}
          >
            <div
              className={`rounded-full bg-white/80 backdrop-blur-md font-black uppercase tracking-widest text-ink shadow-sm ${
                isHomeCompact ? 'px-3 py-1.5 text-[9px]' : 'px-4 py-2 text-[10px]'
              }`}
            >
              View Details
            </div>
          </div>

          <div
            className={`absolute rounded-full bg-white/80 shadow-lg opacity-0 transition-opacity duration-200 hover:bg-white group-hover:opacity-100 ${
              isHomeCompact ? 'right-4 top-4 p-3' : 'right-6 top-6 p-4'
            }`}
          >
            <LikeButton showCount={false} size="sm" />
          </div>
        </div>

        <div className={isHomeCompact ? 'space-y-2 px-1' : 'space-y-3 px-2'}>
          <div className="flex items-start justify-between gap-4">
            <h3
              className={`font-black leading-[1.1] tracking-tight text-ink transition-colors duration-500 group-hover:text-primary ${
                isHomeCompact ? 'text-base' : 'text-lg'
              }`}
            >
              {data.title}
            </h3>
            {isService ? (
              <div
                className={`flex shrink-0 items-center bg-primary/5 ${
                  isHomeCompact ? 'gap-1 rounded-md px-1.5 py-0.5 pt-0.5' : 'gap-1.5 rounded-lg px-2 py-1 pt-1'
                }`}
              >
                <Star className="h-3 w-3 fill-current text-primary" />
                <span className="text-[10px] font-black tracking-tight text-ink">{service.rating}</span>
              </div>
            ) : null}
          </div>

          <div className={`flex items-baseline ${isHomeCompact ? 'gap-1.5' : 'gap-2'}`}>
            <span className={`${isHomeCompact ? 'text-lg' : 'text-xl'} tabular-nums font-black tracking-tighter text-ink`}>
              ￥{data.price}
            </span>
            {isService ? (
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">/{service.unit}</span>
            ) : (
              item.originalPrice ? (
                <span className="text-[10px] font-medium text-muted line-through decoration-primary/30">￥{item.originalPrice}</span>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
