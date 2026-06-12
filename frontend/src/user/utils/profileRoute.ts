import { User } from '../types';

export type ProfileRouteState = {
  profilePreview?: Partial<User>;
};

export function buildProfilePath(userId?: string, username?: string): string {
  const target = userId || username;
  return target ? `/profile/${encodeURIComponent(target)}` : '/profile';
}

export function decodeProfilePathParam(value?: string): string {
  if (!value) {
    return '';
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function buildProfileRouteState(preview?: Partial<User> | null): ProfileRouteState | undefined {
  if (!preview) {
    return undefined;
  }

  return {
    profilePreview: {
      id: preview.id,
      name: preview.name,
      avatar: preview.avatar,
      tag: preview.tag,
      bio: preview.bio,
      region: preview.region,
      createdAt: preview.createdAt,
      isVerified: preview.isVerified,
      followersCount: preview.followersCount,
      followingCount: preview.followingCount,
    },
  };
}
