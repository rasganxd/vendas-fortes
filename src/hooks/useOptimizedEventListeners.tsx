
import { useEffect, useCallback } from 'react';

interface EventConfig {
  event: string;
  handler: () => void;
}

export const useOptimizedEventListeners = (events: EventConfig[]) => {
  const setupListeners = useCallback(() => {
    const listeners: Array<{ event: string; handler: EventListener }> = [];

    events.forEach(({ event, handler }) => {
      const wrappedHandler = () => {
        // Debounce rapid events
        setTimeout(handler, 100);
      };

      window.addEventListener(event, wrappedHandler);
      listeners.push({ event, handler: wrappedHandler });
    });

    return () => {
      listeners.forEach(({ event, handler }) => {
        window.removeEventListener(event, handler);
      });
    };
  }, [events]);

  useEffect(() => {
    return setupListeners();
  }, [setupListeners]);
};
