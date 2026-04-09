export type UserType = 'cliente' | 'trabajador' | 'admin';

export interface UserProfile {
  uid: string;
  nombre: string;
  email: string;
  telefono: string;
  tipo_usuario: UserType;
  foto_perfil?: string;
  descripcion?: string;
  zona?: string;
  fecha_registro: string;
  aprobado?: boolean;
  destacado?: boolean;
  ranking_score?: number;
  promedio_estrellas?: number;
  cantidad_trabajos?: number;
  cantidad_reseñas?: number;
}

export interface Category {
  id: string;
  nombre_categoria: string;
}

export interface Service {
  id: string;
  nombre_servicio: string;
  categoria_id: string;
}

export interface WorkerService {
  id: string;
  trabajador_id: string;
  servicio_id: string;
  nombre_servicio: string;
  descripcion: string;
  precio_base: number;
}

export interface WorkPhoto {
  id: string;
  trabajador_id: string;
  url_foto: string;
  descripcion: string;
  fecha: string;
}

export type RequestStatus = 'pendiente' | 'aceptado' | 'terminado' | 'cancelado';

export interface WorkRequest {
  id: string;
  cliente_id: string;
  cliente_nombre: string;
  trabajador_id: string;
  trabajador_nombre: string;
  descripcion: string;
  estado: RequestStatus;
  fecha: string;
}

export interface Review {
  id: string;
  trabajador_id: string;
  cliente_id: string;
  cliente_nombre: string;
  estrellas: number;
  comentario: string;
  puntualidad: number;
  calidad: number;
  precio: number;
  fecha: string;
}
