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
  data: any;
  size?: 'default' | 'homeCompact';
}

export const GlobalCard: React.FC<CardProps> = ({ type, data, size = 'default' }) => {
  const navigate = useNavigate();
  const isService = type === 'service';
  const service = data as Service;
  const item = data as Item;
  const primaryImage = isService ? getServicePrimaryImage(service) : getItemPrimaryImage(item);
  const isHomeCompact = size === 'homeCompact';
  const priceText = `¥${data.price}`;
  const originalPriceText = item.originalPrice ? `¥${item.originalPrice}` : null;

  return (
    <div className="group h-full cursor-pointer content-visibility-auto">
      <div className="flex h-full flex-col" onClick={() => navigate(`/${isService ? 'service' : 'item'}/${data.id}`, { state: { from: '/' } })}>
        <div
          className={`theme-surface-panel-muted relative aspect-[4/5] overflow-hidden rounded-[16px] transition-shadow duration-300 ease-out ${
            isHomeCompact ? 'mb-2.5 shadow-[0_8px_18px_rgba(15,23,42,0.06)]' : 'mb-6 rounded-[32px] shadow-inner'
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
              isHomeCompact ? 'p-2' : 'p-6'
            }`}
          >
            <div
              className={`theme-card-soft rounded-full backdrop-blur-md font-black uppercase tracking-widest text-ink shadow-sm ${
                isHomeCompact ? 'px-2 py-0.5 text-[6px]' : 'px-4 py-2 text-[10px]'
              }`}
            >
              View Details
            </div>
          </div>

          <div
            className={`theme-card-soft absolute rounded-full shadow-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
              isHomeCompact ? 'right-2 top-2 p-1.5' : 'right-6 top-6 p-4'
            }`}
          >
            <LikeButton showCount={false} size="sm" />
          </div>
        </div>

        <div className={`${isHomeCompact ? 'flex min-h-[52px] flex-1 flex-col gap-1 px-0.5' : 'space-y-3 px-2'}`}>
          <div className="flex min-h-[26px] items-start justify-between gap-1.5">
            <h3
              className={`line-clamp-2 text-left font-black leading-[1.12] tracking-tight text-ink transition-colors duration-500 group-hover:text-primary ${
                isHomeCompact ? 'text-[11px]' : 'text-lg'
              }`}
            >
              {data.title}
            </h3>
            {isService ? (
              <div
                className={`flex shrink-0 items-center bg-primary/5 ${
                  isHomeCompact ? 'gap-0.5 rounded-md px-1 py-0.5' : 'gap-1.5 rounded-lg px-2 py-1 pt-1'
                }`}
              >
                <Star className="h-2 w-2 fill-current text-primary" />
                <span className="text-[7px] font-black tracking-tight text-ink">{service.rating}</span>
              </div>
            ) : null}
          </div>

          <div className={`mt-auto flex min-h-[18px] items-baseline text-left ${isHomeCompact ? 'gap-1' : 'gap-2'}`}>
            <span className={`${isHomeCompact ? 'text-[13px]' : 'text-xl'} tabular-nums font-black tracking-tighter text-ink`}>
              {priceText}
            </span>
            {isService ? (
              <span className="text-[6px] font-black uppercase tracking-[0.1em] text-secondary">/{service.unit}</span>
            ) : (
              originalPriceText ? (
                <span className="text-[6px] font-medium text-muted line-through decoration-primary/30">{originalPriceText}</span>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
