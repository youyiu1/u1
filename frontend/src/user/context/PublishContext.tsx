/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

interface PublishContextValue {
  isPublishOpen: boolean;
  openPublish: () => void;
  closePublish: () => void;
}

const PublishContext = createContext<PublishContextValue>({
  isPublishOpen: false,
  openPublish: () => {},
  closePublish: () => {},
});

export function PublishProvider({ children }: { children: React.ReactNode }) {
  const [isPublishOpen, setIsPublishOpen] = useState(false);

  const openPublish = useCallback(() => setIsPublishOpen(true), []);
  const closePublish = useCallback(() => setIsPublishOpen(false), []);

  return (
    <PublishContext.Provider value={{ isPublishOpen, openPublish, closePublish }}>
      {children}
    </PublishContext.Provider>
  );
}

export function usePublish() {
  return useContext(PublishContext);
}
