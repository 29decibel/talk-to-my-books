// GlobalContext.tsx
import React, { useState, useMemo, ReactNode } from 'react';

export interface GlobalContext {
  showSettings: boolean;
  toggleSettings: () => void;
  setShowSettings: (show: boolean) => void;
}

interface GlobalProviderProps {
  children: ReactNode;
}

const AppGlobalContext = React.createContext<GlobalContext | undefined>(
  undefined
);

function GlobalProvider({ children }: GlobalProviderProps) {
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const toggleSettings = () => {
    setShowSettings((prev) => !prev);
  };

  const value = useMemo(
    () => ({
      showSettings,
      toggleSettings,
      setShowSettings,
    }),
    [showSettings]
  );

  return (
    <AppGlobalContext.Provider value={value}>
      {children}
    </AppGlobalContext.Provider>
  );
}

export { GlobalProvider, AppGlobalContext };
