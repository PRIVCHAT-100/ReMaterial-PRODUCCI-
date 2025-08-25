import * as React from "react";

type AuthContextType = {
  user: any;
  loading: boolean;
  signIn: (u: any) => void;
  signOut: () => void;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  const signIn = (u: any) => setUser(u);
  const signOut = () => setUser(null);

  const value = React.useMemo(() => ({ user, loading, signIn, signOut }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthProvider;
