import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext.jsx'
import Landing from './pages/Landing.jsx'
import Signup from './pages/Signup.jsx'
import Login from './pages/Login.jsx'
import Welcome from './pages/Welcome.jsx'
import ClientSignup from './pages/ClientSignup.jsx'
import ClientCard from './pages/ClientCard.jsx'
import DashboardLayout from './components/DashboardLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Encaisser from './pages/Encaisser.jsx'
import MesClients from './pages/MesClients.jsx'
import SystemePoints from './pages/SystemePoints.jsx'
import MonCompte from './pages/MonCompte.jsx'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      color: '#64748B',
      fontSize: 14
    }}>
      Chargement...
    </div>
  )
  return user ? children : <Navigate to="/connexion" />
}

export default function App() {
  return (
    <Routes>

      {/* ── PAGES PUBLIQUES COMMERÇANT ── */}
      <Route path="/" element={<Landing />} />
      <Route path="/inscription" element={<Signup />} />
      <Route path="/connexion" element={<Login />} />
      <Route path="/bienvenue" element={<Welcome />} />

      {/* ── ESPACE CLIENT MOBILE ── */}
      {/* Le client scanne le QR code → arrive ici */}
      <Route path="/rejoindre/:slug" element={<ClientSignup />} />
      <Route path="/rejoindre" element={<ClientSignup />} />
      {/* Après inscription → sa carte de fidélité */}
      <Route path="/ma-carte" element={<ClientCard />} />

      {/* ── DASHBOARD COMMERÇANT (protégé) ── */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="encaisser" element={<Encaisser />} />
        <Route path="clients" element={<MesClients />} />
        <Route path="points" element={<SystemePoints />} />
        <Route path="compte" element={<MonCompte />} />
      </Route>

      {/* Toute autre URL → accueil */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  )
}
