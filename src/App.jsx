import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import BuscarCargas from './pages/BuscarCargas';
import CargaDetalhe from './pages/CargaDetalhe';
import PublicarCarga from './pages/PublicarCarga';
import ComoFunciona from './pages/ComoFunciona';
import Planos from './pages/Planos';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Perfil from './pages/Perfil';
import EsqueciSenha from './pages/EsqueciSenha';
import RedefinirSenha from './pages/RedefinirSenha';

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 'var(--navbar-height)' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}

function AuthLayout({ children }) {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 'var(--navbar-height)' }}>
        {children}
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/buscar-cargas" element={<Layout><BuscarCargas /></Layout>} />
          <Route path="/cargas/:id" element={<Layout><CargaDetalhe /></Layout>} />
          <Route path="/como-funciona" element={<Layout><ComoFunciona /></Layout>} />
          <Route path="/planos" element={<Layout><Planos /></Layout>} />

          {/* Auth route (no footer on auth page) */}
          <Route path="/auth" element={<AuthLayout><Auth /></AuthLayout>} />
          <Route path="/esqueci-senha" element={<AuthLayout><EsqueciSenha /></AuthLayout>} />
          <Route path="/redefinir-senha" element={<AuthLayout><RedefinirSenha /></AuthLayout>} />

          {/* Protected routes */}
          <Route
            path="/publicar-carga"
            element={
              <ProtectedRoute>
                <Layout><PublicarCarga /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cargas/:id/editar"
            element={
              <ProtectedRoute>
                <Layout><PublicarCarga /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Layout><Perfil /></Layout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
