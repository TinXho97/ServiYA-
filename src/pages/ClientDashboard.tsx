import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, getDoc, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { UserProfile, WorkRequest, Review } from '../types';
import { LayoutDashboard, MessageSquare, Star, Clock, CheckCircle2, XCircle, AlertCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ClientDashboardProps {
  user: any;
  profile: UserProfile | null;
}

export default function ClientDashboard({ user, profile }: ClientDashboardProps) {
  const [requests, setRequests] = useState<WorkRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WorkRequest | null>(null);
  
  // Review form state
  const [reviewForm, setReviewForm] = useState({
    estrellas: 5,
    comentario: '',
    puntualidad: 5,
    calidad: 5,
    precio: 5
  });
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubRequests = onSnapshot(
      query(collection(db, 'requests'), where('cliente_id', '==', user.uid), orderBy('fecha', 'desc')),
      (snap) => {
        setRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkRequest)));
        setLoading(false);
      }
    );

    return () => unsubRequests();
  }, [user]);

  const handleCancelRequest = async (requestId: string) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar esta solicitud?')) {
      await updateDoc(doc(db, 'requests', requestId), { estado: 'cancelado' });
    }
  };

  const handleFinishRequest = async (requestId: string) => {
    await updateDoc(doc(db, 'requests', requestId), { estado: 'terminado' });
    const req = requests.find(r => r.id === requestId);
    if (req) {
      setSelectedRequest(req);
      setIsReviewModalOpen(true);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedRequest) return;

    setReviewLoading(true);
    try {
      // Add review
      await addDoc(collection(db, 'reviews'), {
        trabajador_id: selectedRequest.trabajador_id,
        cliente_id: user.uid,
        cliente_nombre: profile?.nombre || 'Cliente',
        ...reviewForm,
        fecha: new Date().toISOString()
      });

      // Update worker stats
      const workerRef = doc(db, 'users', selectedRequest.trabajador_id);
      const workerSnap = await getDoc(workerRef);
      if (workerSnap.exists()) {
        const workerData = workerSnap.data() as UserProfile;
        const newCount = (workerData.cantidad_reseñas || 0) + 1;
        const newAvg = ((workerData.promedio_estrellas || 0) * (workerData.cantidad_reseñas || 0) + reviewForm.estrellas) / newCount;
        
        await updateDoc(workerRef, {
          cantidad_reseñas: newCount,
          promedio_estrellas: newAvg
        });

        // Update ranking
        const score = (newAvg * 0.5) + ((workerData.cantidad_trabajos || 0) * 0.2) + (newCount * 0.2) + 0.5;
        await updateDoc(workerRef, { ranking_score: score });
      }

      setIsReviewModalOpen(false);
      setSelectedRequest(null);
      setReviewForm({ estrellas: 5, comentario: '', puntualidad: 5, calidad: 5, precio: 5 });
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Mi Panel</h1>
        <p className="text-slate-500">Gestiona tus solicitudes de servicio y deja reseñas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            Solicitudes Recientes
          </h2>

          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                      {req.trabajador_nombre.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900">{req.trabajador_nombre}</h4>
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
                      <button 
                        onClick={() => handleCancelRequest(req.id)}
                        className="w-full bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle className="h-4 w-4" /> Cancelar
                      </button>
                    )}
                    {req.estado === 'aceptado' && (
                      <button 
                        onClick={() => handleFinishRequest(req.id)}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Marcar Terminado
                      </button>
                    )}
                    {req.estado === 'terminado' && (
                      <button 
                        onClick={() => {
                          setSelectedRequest(req);
                          setIsReviewModalOpen(true);
                        }}
                        className="w-full bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                      >
                        <Star className="h-4 w-4" /> Dejar Reseña
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
              <MessageSquare className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400">Aún no has realizado ninguna solicitud.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-indigo-600 text-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-200 sticky top-24">
            <h3 className="text-2xl font-bold mb-6">Tu Perfil</h3>
            <div className="space-y-6">
              <div>
                <p className="text-indigo-200 text-xs uppercase tracking-widest font-bold mb-1">Nombre</p>
                <p className="text-lg font-bold">{profile?.nombre}</p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs uppercase tracking-widest font-bold mb-1">Email</p>
                <p className="text-lg font-bold">{profile?.email}</p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs uppercase tracking-widest font-bold mb-1">Zona</p>
                <p className="text-lg font-bold">{profile?.zona || 'No especificada'}</p>
              </div>
              <div className="pt-6 border-t border-white/10">
                <p className="text-sm text-indigo-100 italic">
                  "Gracias por ser parte de ServiYA&. Tu confianza nos ayuda a crecer."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900">Calificar Servicio</h3>
                  <button onClick={() => setIsReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 text-center">Calificación General</label>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, estrellas: star })}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star className={`h-10 w-10 ${star <= reviewForm.estrellas ? 'text-yellow-400 fill-current' : 'text-slate-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {['puntualidad', 'calidad', 'precio'].map((attr) => (
                      <div key={attr} className="text-center">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{attr}</label>
                        <div className="flex justify-center gap-1">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, [attr]: val })}
                              className={`w-2 h-2 rounded-full transition-all ${val <= (reviewForm as any)[attr] ? 'bg-indigo-600' : 'bg-slate-100'}`}
                            ></button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tu Comentario</label>
                    <textarea
                      required
                      value={reviewForm.comentario}
                      onChange={(e) => setReviewForm({ ...reviewForm, comentario: e.target.value })}
                      placeholder="Cuéntanos tu experiencia..."
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[120px] resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {reviewLoading ? 'Enviando...' : 'Publicar Reseña'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
