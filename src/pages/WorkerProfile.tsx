import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { UserProfile, WorkerService, WorkPhoto, Review, WorkRequest } from '../types';
import { Star, MapPin, Calendar, Phone, Mail, MessageSquare, Image as ImageIcon, Briefcase, ChevronRight, CheckCircle2, AlertCircle, X, Send, Clock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function WorkerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [worker, setWorker] = useState<UserProfile | null>(null);
  const [services, setServices] = useState<WorkerService[]>([]);
  const [photos, setPhotos] = useState<WorkPhoto[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'servicios' | 'portafolio' | 'reseñas'>('servicios');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestDescription, setRequestDescription] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const workerDoc = await getDoc(doc(db, 'users', id));
        if (workerDoc.exists()) {
          setWorker({ uid: workerDoc.id, ...workerDoc.data() } as UserProfile);
        } else {
          navigate('/marketplace');
          return;
        }

        // Fetch services
        const servicesQuery = query(collection(db, 'worker_services'), where('trabajador_id', '==', id));
        const servicesSnap = await getDocs(servicesQuery);
        setServices(servicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkerService)));

        // Fetch photos
        const photosQuery = query(collection(db, 'work_photos'), where('trabajador_id', '==', id), orderBy('fecha', 'desc'));
        const photosSnap = await getDocs(photosQuery);
        setPhotos(photosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkPhoto)));

        // Fetch reviews
        const reviewsQuery = query(collection(db, 'reviews'), where('trabajador_id', '==', id), orderBy('fecha', 'desc'));
        const reviewsSnap = await getDocs(reviewsQuery);
        setReviews(reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));

      } catch (error) {
        console.error("Error fetching worker data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleRequestJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !worker || !id) return;

    setRequestLoading(true);
    try {
      const clientDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const clientData = clientDoc.data() as UserProfile;

      await addDoc(collection(db, 'requests'), {
        cliente_id: auth.currentUser.uid,
        cliente_nombre: clientData.nombre,
        trabajador_id: id,
        trabajador_nombre: worker.nombre,
        descripcion: requestDescription,
        estado: 'pendiente',
        fecha: new Date().toISOString()
      });

      setRequestSuccess(true);
      setTimeout(() => {
        setIsRequestModalOpen(false);
        setRequestSuccess(false);
        setRequestDescription('');
      }, 2000);
    } catch (error) {
      console.error("Error creating request:", error);
    } finally {
      setRequestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!worker) return null;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header / Cover */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-indigo-600 to-violet-600 relative">
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-white shadow-xl overflow-hidden bg-white">
            <img
              src={worker.foto_perfil || `https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.nombre}`}
              alt={worker.nombre}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 md:mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{worker.nombre}</h1>
                  <div className="flex items-center text-slate-500 text-sm gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{worker.zona || 'Zona no especificada'}</span>
                  </div>
                </div>
                {worker.aprobado && (
                  <div className="bg-green-50 text-green-600 p-1 rounded-full" title="Verificado">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-bold text-yellow-700">{worker.promedio_estrellas?.toFixed(1) || '0.0'}</span>
                </div>
                <span className="text-slate-400 text-sm">•</span>
                <span className="text-slate-500 text-sm font-medium">{worker.cantidad_reseñas || 0} Reseñas</span>
                <span className="text-slate-400 text-sm">•</span>
                <span className="text-slate-500 text-sm font-medium">{worker.cantidad_trabajos || 0} Trabajos</span>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed mb-8">
                {worker.descripcion || 'Este trabajador aún no ha agregado una descripción a su perfil.'}
              </p>

              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  <span className="text-sm">{worker.telefono || 'No disponible'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <span className="text-sm">{worker.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-slate-400" />
                  </div>
                  <span className="text-sm">Miembro desde {format(new Date(worker.fecha_registro), 'MMMM yyyy', { locale: es })}</span>
                </div>
              </div>

              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="w-full mt-8 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 flex items-center justify-center gap-2"
              >
                <MessageSquare className="h-5 w-5" />
                Solicitar Trabajo
              </button>
            </div>

            {/* Ranking Stats Card */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                Estadísticas de Ranking
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Puntuación Total</span>
                  <span className="text-2xl font-bold text-indigo-400">{worker.ranking_score?.toFixed(1) || '0.0'}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full" 
                    style={{ width: `${Math.min((worker.ranking_score || 0) * 10, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 italic">
                  El ranking se basa en estrellas, trabajos realizados y actividad reciente.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Tabs and Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex border-b border-slate-100">
                <button
                  onClick={() => setActiveTab('servicios')}
                  className={`flex-1 py-4 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'servicios' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Briefcase className="h-4 w-4" />
                  Servicios
                </button>
                <button
                  onClick={() => setActiveTab('portafolio')}
                  className={`flex-1 py-4 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'portafolio' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <ImageIcon className="h-4 w-4" />
                  Portafolio
                </button>
                <button
                  onClick={() => setActiveTab('reseñas')}
                  className={`flex-1 py-4 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'reseñas' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Star className="h-4 w-4" />
                  Reseñas
                </button>
              </div>

              <div className="p-6 md:p-8">
                {activeTab === 'servicios' && (
                  <div className="space-y-6">
                    {services.length > 0 ? (
                      services.map((service) => (
                        <div key={service.id} className="group p-6 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-slate-50 transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-bold text-slate-900">{service.nombre_servicio}</h4>
                            <span className="text-indigo-600 font-bold">Desde ${service.precio_base}</span>
                          </div>
                          <p className="text-slate-500 text-sm leading-relaxed">
                            {service.descripcion || 'Sin descripción detallada.'}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Briefcase className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400">Este trabajador aún no ha listado sus servicios.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'portafolio' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {photos.length > 0 ? (
                      photos.map((photo) => (
                        <div key={photo.id} className="group relative rounded-2xl overflow-hidden aspect-video bg-slate-100 border border-slate-100 shadow-sm">
                          <img
                            src={photo.url_foto}
                            alt={photo.descripcion}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                            <p className="text-white text-sm font-medium line-clamp-2">{photo.descripcion}</p>
                            <p className="text-white/60 text-[10px] mt-1">{format(new Date(photo.fecha), 'dd MMM yyyy', { locale: es })}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <ImageIcon className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400">Aún no hay fotos en el portafolio.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reseñas' && (
                  <div className="space-y-8">
                    {reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div key={review.id} className="pb-8 border-b border-slate-100 last:border-0">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                {review.cliente_nombre.charAt(0)}
                              </div>
                              <div>
                                <h5 className="font-bold text-slate-900">{review.cliente_nombre}</h5>
                                <p className="text-xs text-slate-400">{format(new Date(review.fecha), 'dd MMMM yyyy', { locale: es })}</p>
                              </div>
                            </div>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < review.estrellas ? 'text-yellow-400 fill-current' : 'text-slate-200'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed italic mb-4">
                            "{review.comentario}"
                          </p>
                          <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Puntualidad</span>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i < review.puntualidad ? 'bg-indigo-400' : 'bg-slate-100'}`}></div>)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Calidad</span>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i < review.calidad ? 'bg-indigo-400' : 'bg-slate-100'}`}></div>)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Precio</span>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i < review.precio ? 'bg-indigo-400' : 'bg-slate-100'}`}></div>)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Star className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400">Este trabajador aún no tiene reseñas.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      <AnimatePresence>
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRequestModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900">Solicitar Trabajo</h3>
                  <button onClick={() => setIsRequestModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {requestSuccess ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">¡Solicitud Enviada!</h4>
                    <p className="text-slate-500">El trabajador recibirá tu solicitud y te contactará pronto.</p>
                  </div>
                ) : (
                  <form onSubmit={handleRequestJob}>
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Describe lo que necesitas
                      </label>
                      <textarea
                        required
                        value={requestDescription}
                        onChange={(e) => setRequestDescription(e.target.value)}
                        placeholder="Ej: Necesito arreglar una pérdida en el baño y cambiar un grifo..."
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[150px] resize-none"
                      ></textarea>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-2xl flex gap-3 mb-8">
                      <Clock className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                      <p className="text-xs text-indigo-700 leading-relaxed">
                        Al enviar esta solicitud, el trabajador podrá ver tu nombre y perfil para evaluar el trabajo. 
                        Te recomendamos ser lo más descriptivo posible.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={requestLoading || !auth.currentUser}
                      className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {requestLoading ? 'Enviando...' : (auth.currentUser ? 'Enviar Solicitud' : 'Inicia sesión para solicitar')}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
