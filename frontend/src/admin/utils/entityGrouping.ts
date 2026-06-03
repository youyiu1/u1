export interface EntityOwnerGroup<T> {
  id: string;
  name: string;
  avatar: string;
  tag: string;
  items: T[];
}

interface GroupItemsByOwnerOptions<T> {
  getId: (item: T) => string | undefined;
  getName: (item: T) => string | undefined;
  getAvatar: (item: T) => string;
  getTag: (item: T) => string | undefined;
  fallbackName: string;
  fallbackTag?: string;
}

export function groupItemsByOwner<T>(
  items: T[],
  options: GroupItemsByOwnerOptions<T>
): EntityOwnerGroup<T>[] {
  const {
    getId,
    getName,
    getAvatar,
    getTag,
    fallbackName,
    fallbackTag = '未设置身份标签',
  } = options;

  const map = new Map<string, EntityOwnerGroup<T>>();

  items.forEach((item, index) => {
    const name = getName(item) || fallbackName;
    const key = getId(item) || name || `unknown-${index}`;
    const existing = map.get(key);
    const avatar = getAvatar(item);
    const tag = getTag(item)?.trim();

    if (existing) {
      existing.items.push(item);
      if (!existing.avatar && avatar) {
        existing.avatar = avatar;
      }
      if (existing.tag === fallbackTag && tag) {
        existing.tag = tag;
      }
      return;
    }

    map.set(key, {
      id: key,
      name,
      avatar,
      tag: tag || fallbackTag,
      items: [item],
    });
  });

  return Array.from(map.values()).sort((left, right) => right.items.length - left.items.length);
}
