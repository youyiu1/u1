import { useEffect, useState, type DependencyList } from 'react';

export function useDelayedBusy(deps: DependencyList, delayMs = 300) {
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    setIsBusy(true);
    const timer = window.setTimeout(() => {
      setIsBusy(false);
    }, delayMs);
    return () => window.clearTimeout(timer);
  }, deps);

  return isBusy;
}