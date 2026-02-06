import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Productos | OSPINA Comercializadora y Suministros',
  description: 'Explora nuestro catálogo completo: aseo institucional, seguridad industrial, cafetería, papelería, tecnología, mobiliario, repuestos y ferretería.',
};

const categories = [
  {
    id: 'aseo',
    name: 'Aseo Institucional',
    description: 'Productos para el cuidado del hogar, higiene personal y limpieza profesional.',
    products: ['Jabones líquidos y en espuma', 'Detergentes y desinfectantes', 'Blanqueadores y suavizantes', 'Ambientadores y alcoholes', 'Papel higiénico jumbo', 'Servilletas y dispensadores', 'Bolsas para residuos', 'Implementos de limpieza'],
    color: 'from-cyan-500 to-blue-500',
    bgLight: 'bg-cyan-50',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 22v-2c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v2"/>
        <path d="M8 14v-1a2 2 0 1 0-4 0v1"/>
        <path d="M6 14v-1a4 4 0 1 1 8 0v1"/>
        <path d="M16 6V2a2 2 0 1 1 4 0v4"/>
        <path d="M22 6H14a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z"/>
      </svg>
    ),
  },
  {
    id: 'seguridad',
    name: 'Seguridad Industrial',
    description: 'Soluciones para prevención de riesgos laborales y cumplimiento de normativas.',
    products: ['Guantes industriales y médicos', 'Tapabocas y respiradores', 'Botas de seguridad', 'Chalecos reflectivos', 'Señalización vial', 'Extintores', 'Camillas de emergencia', 'Cascos y gafas'],
    color: 'from-orange-500 to-red-500',
    bgLight: 'bg-orange-50',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    ),
  },
  {
    id: 'cafeteria',
    name: 'Cafetería y Alimentos',
    description: 'Todo para el servicio de alimentación y bienestar en oficinas e instituciones.',
    products: ['Cafeteras y grecas', 'Termos y neveras', 'Dispensadores de agua', 'Desechables', 'Café en distintas presentaciones', 'Azúcar y cremas', 'Aromáticas y bebidas', 'Productos de consumo rápido'],
    color: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-50',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
        <line x1="6" x2="6" y1="2" y2="4"/>
        <line x1="10" x2="10" y1="2" y2="4"/>
        <line x1="14" x2="14" y1="2" y2="4"/>
      </svg>
    ),
  },
  {
    id: 'papeleria',
    name: 'Papelería y Oficina',
    description: 'Portafolio completo de artículos escolares y corporativos.',
    products: ['Resmas de papel', 'Cuadernos y carpetas', 'Bolígrafos y marcadores', 'Correctores', 'Libros contables', 'Cintas y pegantes', 'Calculadoras', 'Consumibles generales'],
    color: 'from-green-500 to-emerald-500',
    bgLight: 'bg-green-50',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
        <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
        <path d="M10 9H8"/>
        <path d="M16 13H8"/>
        <path d="M16 17H8"/>
      </svg>
    ),
  },
  {
    id: 'tecnologia',
    name: 'Tecnología y Consumibles',
    description: 'Equipos y soluciones para el soporte tecnológico de las organizaciones.',
    products: ['Impresoras de tinta continua', 'Tintas y cartuchos originales', 'Proyectores', 'Computadores portátiles', 'Tablets', 'Periféricos (teclados, mouse)', 'Audífonos y cámaras web', 'Dispositivos tecnológicos'],
    color: 'from-violet-500 to-purple-500',
    bgLight: 'bg-violet-50',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="12" x="3" y="4" rx="2" ry="2"/>
        <line x1="2" x2="22" y1="20" y2="20"/>
        <line x1="12" x2="12" y1="16" y2="20"/>
      </svg>
    ),
  },
  {
    id: 'mobiliario',
    name: 'Mobiliario de Oficina',
    description: 'Muebles diseñados para optimizar espacios y mejorar la comodidad.',
    products: ['Sillas operativas', 'Sillas ejecutivas', 'Escritorios', 'Archivadores', 'Lockers', 'Estanterías', 'Mesas auxiliares', 'Accesorios ergonómicos'],
    color: 'from-pink-500 to-rose-500',
    bgLight: 'bg-pink-50',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2"/>
        <path d="M3 9h18"/>
        <path d="M9 21V9"/>
      </svg>
    ),
  },
  {
    id: 'motos',
    name: 'Repuestos y Servicio de Motos',
    description: 'Repuestos esenciales y servicios de mantenimiento especializado.',
    products: ['Frenos', 'Kits de arrastre', 'Baterías', 'Bujías', 'Filtros', 'Mantenimiento preventivo', 'Diagnóstico técnico', 'Instalación de componentes'],
    color: 'from-slate-600 to-gray-700',
    bgLight: 'bg-slate-50',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5.5" cy="17.5" r="3.5"/>
        <circle cx="18.5" cy="17.5" r="3.5"/>
        <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h3"/>
      </svg>
    ),
  },
  {
    id: 'ferreteria',
    name: 'Ferretería',
    description: 'Materiales y suministros para construcción, mantenimiento e infraestructura.',
    products: ['Cementos', 'Tuberías', 'Láminas y vigas', 'Alambres', 'Pinturas', 'Herramientas manuales', 'Herramientas eléctricas', 'Tanques'],
    color: 'from-yellow-500 to-amber-600',
    bgLight: 'bg-yellow-50',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8"/>
        <path d="m16 16 6-6"/>
        <path d="m8 8 6-6"/>
        <path d="m9 7 8 8"/>
      </svg>
    ),
  },
];

export default function ProductosPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="container-custom relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Nuestros Productos
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Más de 500 productos en 8 líneas para satisfacer todas las necesidades de tu empresa
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="space-y-12">
            {categories.map((category, index) => (
              <div 
                key={category.id}
                id={category.id}
                className={`rounded-3xl p-8 lg:p-12 ${category.bgLight} border border-gray-100`}
              >
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                  <div className="lg:col-span-1">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${category.color} text-white flex items-center justify-center mb-6`}>
                      {category.icon}
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                      {category.name}
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {category.description}
                    </p>
                    <Link 
                      href="/contacto" 
                      className="inline-flex items-center gap-2 text-blue-700 font-semibold hover:text-blue-800 transition-colors"
                    >
                      Solicitar Cotización
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14"/>
                        <path d="m12 5 7 7-7 7"/>
                      </svg>
                    </Link>
                  </div>
                  
                  <div className="lg:col-span-2">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                      Productos Destacados
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {category.products.map((product) => (
                        <div 
                          key={product}
                          className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                        >
                          <p className="text-gray-700 font-medium text-sm">{product}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿No encuentras lo que buscas?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Contáctanos y te ayudaremos a encontrar el producto que necesitas
          </p>
          <Link href="/contacto" className="btn-accent inline-flex items-center gap-2">
            Contáctanos
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/>
              <path d="m12 5 7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
