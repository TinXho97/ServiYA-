import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Category } from '../types';
import { Search, MapPin, Star, Filter, Briefcase, ArrowRight, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function Marketplace() {
  const [searchParams] = useSearchParams();
  const [workers, setWorkers] = useState<UserProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedZone, setSelectedZone] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const cats = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(cats);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      try {
        let q = query(
          collection(db, 'users'),
          where('tipo_usuario', '==', 'trabajador'),
          where('aprobado', '==', true),
          orderBy('ranking_score', 'desc'),
          limit(50)
        );

        const querySnapshot = await getDocs(q);
        let workersList = querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));

        // Client-side filtering for search term and zone (Firestore doesn't support partial matches well without external tools)
        if (searchTerm) {
          workersList = workersList.filter(w => 
            w.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
            w.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        if (selectedCategory) {
          // In a real app, we'd query worker_services to find workers offering this category
          // For this demo, we'll assume workers have a 'categorias' array or similar, 
          // but let's just filter by description for simplicity if needed.
        }

        if (selectedZone) {
          workersList = workersList.filter(w => w.zona?.toLowerCase().includes(selectedZone.toLowerCase()));
        }

        setWorkers(workersList);
      } catch (error) {
        console.error("Error fetching workers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, [searchTerm, selectedCategory, selectedZone]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Encuentra Profesionales</h1>
          <p className="text-slate-500">Los mejores expertos de tu zona, calificados por la comunidad.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <Filter className="h-5 w-5 text-indigo-600" />
              <h2 className="font-bold text-slate-900">Filtros</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Búsqueda</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ej: Pintor, Plomero..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Categoría</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.nombre_categoria}>{cat.nombre_categoria}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Zona / Localidad</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ej: Palermo, CABA"
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedZone('');
              }}
              className="w-full mt-8 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </aside>

        {/* Workers Grid/List */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-slate-100"></div>
              ))}
            </div>
          ) : workers.length > 0 ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
              <AnimatePresence mode="popLayout">
                {workers.map((worker, idx) => (
                  <motion.div
                    key={worker.uid}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                  >
                    <Link
                      to={`/worker/${worker.uid}`}
                      className={`group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-indigo-100 transition-all flex ${viewMode === 'grid' ? 'flex-col' : 'flex-row items-center p-4'}`}
                    >
                      <div className={`${viewMode === 'grid' ? 'h-48 w-full' : 'h-24 w-24 rounded-xl'} bg-slate-100 relative overflow-hidden flex-shrink-0`}>
                        <img
                          src={worker.foto_perfil || `https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.nombre}`}
                          alt={worker.nombre}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        {worker.destacado && (
                          <div className="absolute top-3 left-3 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg uppercase tracking-wider">
                            Destacado
                          </div>
                        )}
                      </div>

                      <div className={`p-6 flex-grow flex flex-col ${viewMode === 'list' ? 'ml-4 py-0' : ''}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{worker.nombre}</h3>
                            <div className="flex items-center text-slate-500 text-sm gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{worker.zona || 'Zona no especificada'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-bold text-yellow-700">{worker.promedio_estrellas?.toFixed(1) || '0.0'}</span>
                          </div>
                        </div>

                        <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-grow">
                          {worker.descripcion || 'Sin descripción disponible.'}
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                          <div className="flex items-center gap-4">
                            <div className="text-xs text-slate-400">
                              <span className="font-bold text-slate-600">{worker.cantidad_trabajos || 0}</span> Trabajos
                            </div>
                            <div className="text-xs text-slate-400">
                              <span className="font-bold text-slate-600">{worker.cantidad_reseñas || 0}</span> Reseñas
                            </div>
                          </div>
                          <div className="text-indigo-600 font-semibold text-sm flex items-center group-hover:gap-1 transition-all">
                            Ver Perfil <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No encontramos resultados</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                Intenta ajustar tus filtros o buscar con términos diferentes.
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedZone('');
                }}
                className="mt-6 text-indigo-600 font-semibold"
              >
                Ver todos los trabajadores
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
