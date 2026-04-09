import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from './types';
import { LogOut, User as UserIcon, Search, Briefcase, LayoutDashboard, Star, Menu, X, Hammer, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Pages (to be created)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import WorkerProfile from './pages/WorkerProfile';
import ClientDashboard from './pages/ClientDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';

import { BrandLogo } from './components/Logo';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const unsubscribeProfile = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          }
          setLoading(false);
        });
        return () => unsubscribeProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center">
                  <BrandLogo />
                </Link>
                <div className="hidden md:ml-8 md:flex md:space-x-8">
                  <Link to="/marketplace" className="text-slate-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors">
                    Buscar Servicios
                  </Link>
                </div>
              </div>

              <div className="hidden md:flex items-center space-x-4">
                {user ? (
                  <>
                    {profile?.tipo_usuario === 'admin' && (
                      <Link to="/admin" className="text-slate-600 hover:text-indigo-600 p-2 rounded-full hover:bg-slate-100 transition-all">
                        <ShieldCheck className="h-5 w-5" />
                      </Link>
                    )}
                    <Link 
                      to={profile?.tipo_usuario === 'trabajador' ? '/worker-dashboard' : '/client-dashboard'} 
                      className="text-slate-600 hover:text-indigo-600 p-2 rounded-full hover:bg-slate-100 transition-all"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                    </Link>
                    <div className="flex items-center space-x-3 ml-4 border-l pl-4 border-slate-200">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold text-slate-900">{profile?.nombre}</span>
                        <span className="text-xs text-slate-500 capitalize">{profile?.tipo_usuario}</span>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all"
                      >
                        <LogOut className="h-5 w-5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-slate-600 hover:text-indigo-600 px-4 py-2 text-sm font-medium">
                      Iniciar Sesión
                    </Link>
                    <Link 
                      to="/register" 
                      className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
                    >
                      Registrarse
                    </Link>
                  </>
                )}
              </div>

              <div className="flex items-center md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-slate-600 p-2"
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
              >
                <div className="px-4 pt-2 pb-6 space-y-1">
                  <Link 
                    to="/marketplace" 
                    className="block px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Buscar Servicios
                  </Link>
                  {user ? (
                    <>
                      <Link 
                        to={profile?.tipo_usuario === 'trabajador' ? '/worker-dashboard' : '/client-dashboard'}
                        className="block px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Mi Panel
                      </Link>
                      {profile?.tipo_usuario === 'admin' && (
                        <Link 
                          to="/admin"
                          className="block px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Administración
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <div className="pt-4 space-y-2">
                      <Link 
                        to="/login" 
                        className="block w-full text-center px-4 py-3 text-base font-medium text-slate-700 bg-slate-100 rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Iniciar Sesión
                      </Link>
                      <Link 
                        to="/register" 
                        className="block w-full text-center px-4 py-3 text-base font-medium text-white bg-indigo-600 rounded-lg shadow-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Registrarse
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/worker/:id" element={<WorkerProfile />} />
            <Route path="/client-dashboard" element={<ClientDashboard user={user} profile={profile} />} />
            <Route path="/worker-dashboard" element={<WorkerDashboard user={user} profile={profile} />} />
            <Route path="/admin" element={<AdminDashboard user={user} profile={profile} />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-slate-200 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center">
                  <BrandLogo />
                </div>
                <p className="text-slate-500 max-w-sm">
                  La plataforma líder para encontrar profesionales de confianza en tu zona. 
                  Desde reparaciones del hogar hasta servicios técnicos especializados.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Plataforma</h3>
                <ul className="space-y-2">
                  <li><Link to="/marketplace" className="text-slate-500 hover:text-indigo-600 text-sm">Explorar Servicios</Link></li>
                  <li><Link to="/register" className="text-slate-500 hover:text-indigo-600 text-sm">Ser un Prestador</Link></li>
                  <li><Link to="/login" className="text-slate-500 hover:text-indigo-600 text-sm">Iniciar Sesión</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Soporte</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-slate-500 hover:text-indigo-600 text-sm">Centro de Ayuda</a></li>
                  <li><a href="#" className="text-slate-500 hover:text-indigo-600 text-sm">Términos y Condiciones</a></li>
                  <li><a href="#" className="text-slate-500 hover:text-indigo-600 text-sm">Privacidad</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-slate-100 text-center">
              <p className="text-slate-400 text-sm">© 2026 ServiYA&. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
