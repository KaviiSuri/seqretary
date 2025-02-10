import React, { useEffect } from "react";

interface LogseqReadyContextType {
  ready: boolean;
}

const LogseqReadyContext = React.createContext<LogseqReadyContextType | undefined>(
  undefined
);

export function LogseqReadyProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    logseq.ready().then(() => setReady(true));
  }, []);

  useEffect(() => {
    console.log('Logseq ready:', ready);
  }, [ready])

  return (
    <LogseqReadyContext.Provider value={{ ready }}>
      {children}
    </LogseqReadyContext.Provider>
  );
}

export function useLogseqReady() {
  const context = React.useContext(LogseqReadyContext);
  if (context === undefined) {
    throw new Error("useLogseqReady must be used within a LogseqReadyProvider");
  }
  return context;
} 
