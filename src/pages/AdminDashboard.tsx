import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, addDoc, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Category, Review } from '../types';
import { ShieldCheck, Users, Briefcase, Star, Trash2, CheckCircle2, XCircle, Plus, LayoutDashboard, TrendingUp, Search, Filter, Award, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AdminDashboardProps {
  user: any;
  profile: UserProfile | null;
}

export default function AdminDashboard({ user, profile }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'categories' | 'reviews' | 'stats'>('stats');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || profile?.tipo_usuario !== 'admin') return;

    const unsubUsers = onSnapshot(query(collection(db, 'users'), orderBy('fecha_registro', 'desc')), (snap) => {
      setUsers(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
    });

    const unsubCategories = onSnapshot(query(collection(db, 'categories'), orderBy('nombre_categoria', 'asc')), (snap) => {
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    });

    const unsubReviews = onSnapshot(query(collection(db, 'reviews'), orderBy('fecha', 'desc')), (snap) => {
      setReviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
    });

    setLoading(false);

    return () => {
      unsubUsers();
      unsubCategories();
      unsubReviews();
    };
  }, [user, profile]);

  const handleApproveWorker = async (userId: string, approved: boolean) => {
    await updateDoc(doc(db, 'users', userId), { aprobado: approved });
  };

  const handleFeatureWorker = async (userId: string, featured: boolean) => {
    await updateDoc(doc(db, 'users', userId), { destacado: featured });
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción es irreversible.')) {
      await deleteDoc(doc(db, 'users', userId));
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    await addDoc(collection(db, 'categories'), { nombre_categoria: newCategory });
    setNewCategory('');
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('¿Eliminar categoría?')) {
      await deleteDoc(doc(db, 'categories', id));
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (profile?.tipo_usuario !== 'admin') return <div className="p-20 text-center">Acceso denegado.</div>;

  const filteredUsers = users.filter(u => 
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <ShieldCheck className="h-10 w-10 text-indigo-600" />
            Panel de Administración
          </h1>
          <p className="text-slate-500">Gestión global de usuarios, categorías y calidad del servicio.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          {[
            { id: 'stats', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'users', label: 'Usuarios', icon: Users },
            { id: 'categories', label: 'Categorías', icon: Briefcase },
            { id: 'reviews', label: 'Reseñas', icon: Star },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="p-3 bg-indigo-50 rounded-2xl w-fit mb-4">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <h4 className="text-slate-500 text-sm font-medium">Total Usuarios</h4>
                <p className="text-3xl font-bold text-slate-900 mt-1">{users.length}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="p-3 bg-blue-50 rounded-2xl w-fit mb-4">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="text-slate-500 text-sm font-medium">Trabajadores</h4>
                <p className="text-3xl font-bold text-slate-900 mt-1">{users.filter(u => u.tipo_usuario === 'trabajador').length}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="p-3 bg-yellow-50 rounded-2xl w-fit mb-4">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
                <h4 className="text-slate-500 text-sm font-medium">Reseñas Totales</h4>
                <p className="text-3xl font-bold text-slate-900 mt-1">{reviews.length}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="p-3 bg-green-50 rounded-2xl w-fit mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="text-slate-500 text-sm font-medium">Nuevos Hoy</h4>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {users.filter(u => new Date(u.fecha_registro).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Usuarios Recientes</h3>
                <div className="space-y-4">
                  {users.slice(0, 5).map(u => (
                    <div key={u.uid} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                          {u.nombre.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{u.nombre}</p>
                          <p className="text-xs text-slate-500 capitalize">{u.tipo_usuario}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">{format(new Date(u.fecha_registro), 'dd MMM')}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Reseñas Recientes</h3>
                <div className="space-y-4">
                  {reviews.slice(0, 5).map(r => (
                    <div key={r.id} className="p-4 bg-slate-50 rounded-2xl">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-sm text-slate-900">{r.cliente_nombre}</p>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => <Star key={i} className={`h-3 w-3 ${i < r.estrellas ? 'text-yellow-400 fill-current' : 'text-slate-200'}`} />)}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 italic">"{r.comentario}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredUsers.map((u) => (
                      <tr key={u.uid} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                              {u.nombre.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{u.nombre}</p>
                              <p className="text-xs text-slate-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.tipo_usuario === 'admin' ? 'bg-purple-100 text-purple-700' :
                            u.tipo_usuario === 'trabajador' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {u.tipo_usuario}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {u.tipo_usuario === 'trabajador' && (
                            <div className="flex items-center gap-2">
                              {u.aprobado ? (
                                <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                                  <CheckCircle2 className="h-4 w-4" /> Aprobado
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-yellow-600 text-xs font-bold">
                                  <Clock className="h-4 w-4" /> Pendiente
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {u.tipo_usuario === 'trabajador' && (
                              <>
                                <button 
                                  onClick={() => handleApproveWorker(u.uid, !u.aprobado)}
                                  className={`p-2 rounded-xl transition-all ${u.aprobado ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}
                                  title={u.aprobado ? "Desaprobar" : "Aprobar"}
                                >
                                  {u.aprobado ? <XCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                                </button>
                                <button 
                                  onClick={() => handleFeatureWorker(u.uid, !u.destacado)}
                                  className={`p-2 rounded-xl transition-all ${u.destacado ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:bg-slate-100'}`}
                                  title="Destacar"
                                >
                                  <Award className="h-5 w-5" />
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => handleDeleteUser(u.uid)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                              title="Eliminar"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'categories' && (
          <motion.div
            key="categories"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-24">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Nueva Categoría</h3>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre</label>
                    <input 
                      type="text" 
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Ej: Pintura"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
                    <Plus className="h-5 w-5" /> Agregar
                  </button>
                </form>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map(cat => (
                  <div key={cat.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-indigo-100 transition-all">
                    <span className="font-bold text-slate-900">{cat.nombre_categoria}</span>
                    <button 
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'reviews' && (
          <motion.div
            key="reviews"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map(review => (
                <div key={review.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                        {review.cliente_nombre.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{review.cliente_nombre}</p>
                        <p className="text-xs text-slate-400">{format(new Date(review.fecha), 'dd MMM yyyy')}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < review.estrellas ? 'text-yellow-400 fill-current' : 'text-slate-200'}`} />)}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm italic mb-4">"{review.comentario}"</p>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">ID Trabajador: {review.trabajador_id.slice(0, 8)}...</span>
                    <button 
                      onClick={() => deleteDoc(doc(db, 'reviews', review.id))}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
