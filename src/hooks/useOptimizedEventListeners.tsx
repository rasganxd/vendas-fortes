
import { useEffect, useRef } from 'react';

interface EventConfig {
  event: string;
  handler: (event: CustomEvent) => void;
  options?: AddEventListenerOptions;
}

export const useOptimizedEventListeners = (events: EventConfig[]) => {
  const listenersRef = useRef<Map<string, (event: CustomEvent) => void>>(new Map());

  useEffect(() => {
    const currentListeners = listenersRef.current;

    // Remove existing listeners to prevent duplicates
    currentListeners.forEach((handler, event) => {
      window.removeEventListener(event, handler as EventListener);
    });
    currentListeners.clear();

    // Add new listeners
    events.forEach(({ event, handler, options }) => {
      const wrappedHandler = (e: Event) => {
        if (e instanceof CustomEvent) {
          handler(e);
        }
      };

      window.addEventListener(event, wrappedHandler, options);
      currentListeners.set(event, wrappedHandler as (event: CustomEvent) => void);
    });

    // Cleanup function
    return () => {
      currentListeners.forEach((handler, event) => {
        window.removeEventListener(event, handler as EventListener);
      });
      currentListeners.clear();
    };
  }, [events]);
};
