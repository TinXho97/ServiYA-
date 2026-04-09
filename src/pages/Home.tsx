import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Star, Clock, MapPin, Hammer, ArrowRight, CheckCircle2, Users, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';
import { BrandLogo } from '../components/Logo';

const categories = [
  { name: 'Albañilería', icon: '🏗️', color: 'bg-orange-100 text-orange-600' },
  { name: 'Plomería', icon: '🚰', color: 'bg-blue-100 text-blue-600' },
  { name: 'Electricidad', icon: '⚡', color: 'bg-yellow-100 text-yellow-600' },
  { name: 'Limpieza', icon: '🧹', color: 'bg-teal-100 text-teal-600' },
  { name: 'Jardinería', icon: '🌿', color: 'bg-green-100 text-green-600' },
  { name: 'Carpintería', icon: '🪚', color: 'bg-amber-100 text-amber-600' },
  { name: 'Mecánica', icon: '🔧', color: 'bg-red-100 text-red-600' },
  { name: 'Fletes', icon: '🚚', color: 'bg-purple-100 text-purple-600' },
];

const features = [
  {
    title: 'Profesionales Verificados',
    description: 'Validamos la identidad y antecedentes de cada prestador para tu tranquilidad.',
    icon: <ShieldCheck className="h-6 w-6 text-indigo-600" />,
  },
  {
    title: 'Reseñas Reales',
    description: 'Sistema de calificaciones basado en experiencias reales de otros clientes.',
    icon: <Star className="h-6 w-6 text-indigo-600" />,
  },
  {
    title: 'Respuesta Rápida',
    description: 'Conecta con trabajadores en tu zona listos para ayudarte hoy mismo.',
    icon: <Clock className="h-6 w-6 text-indigo-600" />,
  },
];

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-center mb-8">
                <BrandLogo className="scale-150" />
              </div>
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-indigo-50 text-indigo-700 mb-6 border border-indigo-100">
                🚀 El marketplace de servicios #1 en tu zona
              </span>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
                Encuentra al profesional <span className="text-indigo-600">ideal</span> para tu hogar
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                Conectamos a personas que necesitan un servicio con los mejores trabajadores locales. 
                Rápido, seguro y con garantía de calidad.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/marketplace"
                  className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  <Search className="h-5 w-5" />
                  Buscar Servicios
                </Link>
                <Link
                  to="/register"
                  className="w-full sm:w-auto bg-white text-slate-700 border-2 border-slate-200 px-8 py-4 rounded-2xl text-lg font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                >
                  <Briefcase className="h-5 w-5" />
                  Quiero Ofrecer Servicios
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Categorías Populares</h2>
              <p className="text-slate-500">Explora los servicios más solicitados por nuestra comunidad.</p>
            </div>
            <Link to="/marketplace" className="hidden sm:flex items-center text-indigo-600 font-semibold hover:gap-2 transition-all">
              Ver todas <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link
                  to={`/marketplace?category=${cat.name}`}
                  className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col items-center text-center"
                >
                  <div className={`w-16 h-16 ${cat.color} rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                    {cat.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{cat.name}</h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-8 leading-tight">
                ¿Por qué elegir <span className="text-indigo-600">ServiYA&</span>?
              </h2>
              <div className="space-y-8">
                {features.map((feature) => (
                  <div key={feature.title} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                      <p className="text-slate-500 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-12">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all"
                >
                  Comenzar ahora <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-indigo-600 rounded-3xl overflow-hidden shadow-2xl rotate-3">
                <img
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=1000"
                  alt="Worker"
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-xs -rotate-3">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Servicio Completado</p>
                    <p className="text-xs text-slate-500">Hace 5 minutos</p>
                  </div>
                </div>
                <div className="flex gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">5k+</div>
              <div className="text-indigo-100">Trabajadores</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">12k+</div>
              <div className="text-indigo-100">Trabajos Realizados</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.8</div>
              <div className="text-indigo-100">Calificación Promedio</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-indigo-100">Soporte</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[120px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
                ¿Listo para transformar tu hogar?
              </h2>
              <div className="flex justify-center mb-8">
                <BrandLogo className="scale-125" />
              </div>
              <p className="text-slate-400 text-xl mb-12 max-w-2xl mx-auto">
                Únete a miles de personas que ya confían en nosotros para encontrar a los mejores profesionales.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto bg-white text-slate-900 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-slate-100 transition-all"
                >
                  Registrarse Gratis
                </Link>
                <Link
                  to="/marketplace"
                  className="w-full sm:w-auto bg-transparent text-white border-2 border-white/20 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-white/10 transition-all"
                >
                  Ver Servicios
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
