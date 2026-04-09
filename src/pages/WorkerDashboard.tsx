import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, deleteDoc, getDoc, orderBy, limit, writeBatch } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { UserProfile, WorkerService, WorkPhoto, WorkRequest, Review } from '../types';
import { LayoutDashboard, Briefcase, ImageIcon, Star, Settings, MessageSquare, CheckCircle2, XCircle, Clock, Plus, Trash2, Save, TrendingUp, Users, Award, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface WorkerDashboardProps {
  user: any;
  profile: UserProfile | null;
}

export default function WorkerDashboard({ user, profile }: WorkerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'requests' | 'services' | 'portfolio' | 'profile'>('stats');
  const [requests, setRequests] = useState<WorkRequest[]>([]);
  const [services, setServices] = useState<WorkerService[]>([]);
  const [photos, setPhotos] = useState<WorkPhoto[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newService, setNewService] = useState({ nombre: '', descripcion: '', precio: 0 });
  const [newPhoto, setNewPhoto] = useState({ url: '', descripcion: '' });
  const [editProfile, setEditProfile] = useState({ nombre: '', descripcion: '', zona: '', telefono: '' });

  useEffect(() => {
    if (!user) return;

    setEditProfile({
      nombre: profile?.nombre || '',
      descripcion: profile?.descripcion || '',
      zona: profile?.zona || '',
      telefono: profile?.telefono || ''
    });

    const unsubRequests = onSnapshot(
      query(collection(db, 'requests'), where('trabajador_id', '==', user.uid), orderBy('fecha', 'desc')),
      (snap) => setRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkRequest)))
    );

    const unsubServices = onSnapshot(
      query(collection(db, 'worker_services'), where('trabajador_id', '==', user.uid)),
      (snap) => setServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkerService)))
    );

    const unsubPhotos = onSnapshot(
      query(collection(db, 'work_photos'), where('trabajador_id', '==', user.uid), orderBy('fecha', 'desc')),
      (snap) => setPhotos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkPhoto)))
    );

    const unsubReviews = onSnapshot(
      query(collection(db, 'reviews'), where('trabajador_id', '==', user.uid), orderBy('fecha', 'desc')),
      (snap) => setReviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)))
    );

    setLoading(false);

    return () => {
      unsubRequests();
      unsubServices();
      unsubPhotos();
      unsubReviews();
    };
  }, [user, profile]);

  const updateRanking = async (workerId: string) => {
    const workerRef = doc(db, 'users', workerId);
    const workerSnap = await getDoc(workerRef);
    if (!workerSnap.exists()) return;

    const data = workerSnap.data() as UserProfile;
    const stars = data.promedio_estrellas || 0;
    const jobs = data.cantidad_trabajos || 0;
    const reviewsCount = data.cantidad_reseñas || 0;
    
    // Simple ranking formula
    const score = (stars * 0.5) + (jobs * 0.2) + (reviewsCount * 0.2) + 0.5; // 0.5 base activity
    await updateDoc(workerRef, { ranking_score: score });
  };

  const handleRequestAction = async (requestId: string, status: 'aceptado' | 'cancelado' | 'terminado') => {
    await updateDoc(doc(db, 'requests', requestId), { estado: status });
    
    if (status === 'terminado' && user) {
      const workerRef = doc(db, 'users', user.uid);
      await updateDoc(workerRef, { 
        cantidad_trabajos: (profile?.cantidad_trabajos || 0) + 1 
      });
      updateRanking(user.uid);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await addDoc(collection(db, 'worker_services'), {
      trabajador_id: user.uid,
      nombre_servicio: newService.nombre,
      descripcion: newService.descripcion,
      precio_base: Number(newService.precio),
      servicio_id: 'custom'
    });
    setNewService({ nombre: '', descripcion: '', precio: 0 });
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await addDoc(collection(db, 'work_photos'), {
      trabajador_id: user.uid,
      url_foto: newPhoto.url,
      descripcion: newPhoto.descripcion,
      fecha: new Date().toISOString()
    });
    setNewPhoto({ url: '', descripcion: '' });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), editProfile);
    alert('Perfil actualizado con éxito');
  };

  if (loading) return <div>Cargando...</div>;

  const statsData = [
    { name: 'Ene', trabajos: 4 },
    { name: 'Feb', trabajos: 7 },
    { name: 'Mar', trabajos: 5 },
    { name: 'Abr', trabajos: 12 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100">
                  <img 
                    src={profile?.foto_perfil || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.nombre}`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{profile?.nombre}</h3>
                  <p className="text-xs text-slate-500">Panel de Trabajador</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-indigo-50 px-3 py-2 rounded-xl">
                <Award className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-700">Ranking: {profile?.ranking_score?.toFixed(1) || '0.0'}</span>
              </div>
            </div>
            <nav className="p-2">
              {[
                { id: 'stats', label: 'Estadísticas', icon: LayoutDashboard },
                { id: 'requests', label: 'Solicitudes', icon: MessageSquare, count: requests.filter(r => r.estado === 'pendiente').length },
                { id: 'services', label: 'Mis Servicios', icon: Briefcase },
                { id: 'portfolio', label: 'Portafolio', icon: ImageIcon },
                { id: 'profile', label: 'Ajustes Perfil', icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.count ? (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === item.id ? 'bg-white text-indigo-600' : 'bg-red-500 text-white'}`}>
                      {item.count}
                    </span>
                  ) : null}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow">
          {activeTab === 'stats' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-50 rounded-2xl">
                      <TrendingUp className="h-6 w-6 text-indigo-600" />
                    </div>
                    <span className="text-xs font-bold text-green-500">+12%</span>
                  </div>
                  <h4 className="text-slate-500 text-sm font-medium">Trabajos Realizados</h4>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{profile?.cantidad_trabajos || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-yellow-50 rounded-2xl">
                      <Star className="h-6 w-6 text-yellow-500" />
                    </div>
                    <span className="text-xs font-bold text-yellow-600">Top 5%</span>
                  </div>
                  <h4 className="text-slate-500 text-sm font-medium">Calificación Promedio</h4>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{profile?.promedio_estrellas?.toFixed(1) || '0.0'}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 rounded-2xl">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-xs font-bold text-blue-600">Activo</span>
                  </div>
                  <h4 className="text-slate-500 text-sm font-medium">Total Reseñas</h4>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{profile?.cantidad_reseñas || 0}</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-8">Rendimiento Mensual</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Bar dataKey="trabajos" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Solicitudes de Trabajo</h2>
              {requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div key={req.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                          {req.cliente_nombre.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-slate-900">{req.cliente_nombre}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              req.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                              req.estado === 'aceptado' ? 'bg-blue-100 text-blue-700' :
                              req.estado === 'terminado' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {req.estado}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mb-3">{req.descripcion}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Clock className="h-3 w-3" />
                            <span>{format(new Date(req.fecha), 'dd MMM yyyy, HH:mm', { locale: es })}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 md:flex-col md:justify-center">
                        {req.estado === 'pendiente' && (
                          <>
                            <button 
                              onClick={() => handleRequestAction(req.id, 'aceptado')}
                              className="flex-1 md:w-full bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                            >
                              <CheckCircle2 className="h-4 w-4" /> Aceptar
                            </button>
                            <button 
                              onClick={() => handleRequestAction(req.id, 'cancelado')}
                              className="flex-1 md:w-full bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                            >
                              <XCircle className="h-4 w-4" /> Rechazar
                            </button>
                          </>
                        )}
                        {req.estado === 'aceptado' && (
                          <button 
                            onClick={() => handleRequestAction(req.id, 'terminado')}
                            className="w-full bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="h-4 w-4" /> Finalizar Trabajo
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
                  <MessageSquare className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400">No tienes solicitudes de trabajo aún.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Agregar Nuevo Servicio</h3>
                <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre del Servicio</label>
                    <input 
                      type="text" 
                      required
                      value={newService.nombre}
                      onChange={(e) => setNewService({...newService, nombre: e.target.value})}
                      placeholder="Ej: Instalación de Aire Acondicionado"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Precio Base ($)</label>
                    <input 
                      type="number" 
                      required
                      value={newService.precio}
                      onChange={(e) => setNewService({...newService, precio: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
                    <textarea 
                      required
                      value={newService.descripcion}
                      onChange={(e) => setNewService({...newService, descripcion: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[100px] resize-none"
                    ></textarea>
                  </div>
                  <div className="col-span-2">
                    <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2">
                      <Plus className="h-5 w-5" /> Agregar Servicio
                    </button>
                  </div>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map(service => (
                  <div key={service.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900">{service.nombre_servicio}</h4>
                      <p className="text-xs text-slate-500 mt-1">{service.descripcion}</p>
                      <p className="text-indigo-600 font-bold mt-2">${service.precio_base}</p>
                    </div>
                    <button 
                      onClick={() => deleteDoc(doc(db, 'worker_services', service.id))}
                      className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Agregar Foto al Portafolio</h3>
                <form onSubmit={handleAddPhoto} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">URL de la Foto</label>
                    <input 
                      type="url" 
                      required
                      value={newPhoto.url}
                      onChange={(e) => setNewPhoto({...newPhoto, url: e.target.value})}
                      placeholder="https://ejemplo.com/foto.jpg"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción del Trabajo</label>
                    <input 
                      type="text" 
                      required
                      value={newPhoto.descripcion}
                      onChange={(e) => setNewPhoto({...newPhoto, descripcion: e.target.value})}
                      placeholder="Ej: Remodelación de cocina terminada"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2">
                    <Plus className="h-5 w-5" /> Subir Foto
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {photos.map(photo => (
                  <div key={photo.id} className="group relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-100 shadow-sm">
                    <img src={photo.url_foto} alt={photo.descripcion} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      <p className="text-white text-xs font-medium line-clamp-2 mb-2">{photo.descripcion}</p>
                      <button 
                        onClick={() => deleteDoc(doc(db, 'work_photos', photo.id))}
                        className="bg-red-500 text-white p-2 rounded-xl self-end hover:bg-red-600 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-8">Configuración del Perfil Público</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre Público</label>
                    <input 
                      type="text" 
                      value={editProfile.nombre}
                      onChange={(e) => setEditProfile({...editProfile, nombre: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Teléfono de Contacto</label>
                    <input 
                      type="tel" 
                      value={editProfile.telefono}
                      onChange={(e) => setEditProfile({...editProfile, telefono: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Zona de Trabajo</label>
                    <input 
                      type="text" 
                      value={editProfile.zona}
                      onChange={(e) => setEditProfile({...editProfile, zona: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción / Bio</label>
                    <textarea 
                      value={editProfile.descripcion}
                      onChange={(e) => setEditProfile({...editProfile, descripcion: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[150px] resize-none"
                    ></textarea>
                  </div>
                </div>
                <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200">
                  <Save className="h-5 w-5" /> Guardar Cambios
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
