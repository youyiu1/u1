import { AnimatePresence, motion } from 'motion/react';
import { Outlet, useLocation } from 'react-router-dom';
import type { Dispatch, SetStateAction } from 'react';
import { useMemo, useState } from 'react';
import { AuthAnimationState, AuthHeroBadge, AuthSplitLayout } from './AuthSplitLayout';

export type AuthOutletContext = {
  setAnimationState: Dispatch<SetStateAction<AuthAnimationState>>;
  setHeroBadge: Dispatch<SetStateAction<AuthHeroBadge | undefined>>;
};

export function AuthShell() {
  const location = useLocation();
  const [animationState, setAnimationState] = useState<AuthAnimationState>({});
  const [heroBadge, setHeroBadge] = useState<AuthHeroBadge>();
  const isRegisterPage = location.pathname === '/register';
  const outletContext = useMemo<AuthOutletContext>(() => ({ setAnimationState, setHeroBadge }), []);

  return (
    <AuthSplitLayout sideAction={null} animationState={animationState} heroBadge={heroBadge}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: isRegisterPage ? 26 : -26, y: 10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: isRegisterPage ? -20 : 20, y: -6 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          className="w-full py-2 sm:py-3"
        >
          <Outlet context={outletContext} />
        </motion.div>
      </AnimatePresence>
    </AuthSplitLayout>
  );
}
