import { Client, type IMessage } from '@stomp/stompjs';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { useChat } from './ChatContext';
import { useNotification } from './NotificationContext';
import { getToken } from '../services/api';
import type { Message, Notification } from '../types';

type RealtimeEvent<T> = {
  type: string;
  payload: T;
  time?: string;
};

type RealtimeContextValue = {
  connected: boolean;
};

const RealtimeContext = createContext<RealtimeContextValue>({ connected: false });

function createWebSocketUrl(token: string): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws?token=${encodeURIComponent(token)}`;
}

function parseMessage<T>(frame: IMessage): RealtimeEvent<T> | null {
  try {
    return JSON.parse(frame.body) as RealtimeEvent<T>;
  } catch {
    return null;
  }
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { authReady, isAuthenticated, user } = useAuth();
  const { receiveMessage } = useChat();
  const { receiveNotification } = useNotification();
  const queryClient = useQueryClient();
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!authReady || !isAuthenticated || !user?.id) {
      clientRef.current?.deactivate();
      clientRef.current = null;
      setConnected(false);
      return;
    }

    const token = getToken();
    if (!token) {
      return;
    }

    const client = new Client({
      brokerURL: createWebSocketUrl(token),
      reconnectDelay: 5000,
      heartbeatIncoming: 15000,
      heartbeatOutgoing: 15000,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        setConnected(true);

        client.subscribe('/user/queue/messages', (frame) => {
          const event = parseMessage<Message>(frame);
          if (!event?.payload) {
            return;
          }
          receiveMessage(event.payload);
        });

        client.subscribe('/user/queue/notifications', (frame) => {
          const event = parseMessage<Notification>(frame);
          if (!event?.payload) {
            return;
          }
          receiveNotification();
          void queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
        });
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onWebSocketClose: () => {
        setConnected(false);
      },
      onStompError: () => {
        setConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      setConnected(false);
      client.deactivate();
      if (clientRef.current === client) {
        clientRef.current = null;
      }
    };
  }, [authReady, isAuthenticated, queryClient, receiveMessage, receiveNotification, user?.id]);

  const value = useMemo(() => ({ connected }), [connected]);

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
