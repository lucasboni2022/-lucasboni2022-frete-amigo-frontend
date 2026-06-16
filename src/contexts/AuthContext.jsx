import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inicializa do localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('frete_token');
    const storedUser = localStorage.getItem('frete_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, senha) => {
    const res = await authAPI.login({ email, senha });
    const data = res.data;
    const receivedToken = data.token || data.access_token || data.data?.token;
    const receivedUser = data.user || data.data?.user || data.data || {};
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('frete_token', receivedToken);
    localStorage.setItem('frete_user', JSON.stringify(receivedUser));
    return data;
  };

  const register = async (payload) => {
    const res = await authAPI.register(payload);
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('frete_token');
    localStorage.removeItem('frete_user');
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('frete_user', JSON.stringify(newUser));
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
