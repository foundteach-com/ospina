import Link from 'next/link';

const productLines = [
  {
    id: 'aseo',
    name: 'Aseo Institucional',
    description: 'Jabones, detergentes, desinfectantes, papel higiénico jumbo, servilletas y todos los implementos para mantener la higiene.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 22v-2c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v2"/>
        <path d="M8 14v-1a2 2 0 1 0-4 0v1"/>
        <path d="M6 14v-1a4 4 0 1 1 8 0v1"/>
        <path d="M16 6V2a2 2 0 1 1 4 0v4"/>
        <path d="M22 6H14a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z"/>
      </svg>
    ),
    color: 'from-cyan-500 to-blue-500',
    bgLight: 'bg-cyan-50',
  },
  {
    id: 'seguridad',
    name: 'Seguridad Industrial',
    description: 'EPP completos: guantes, tapabocas, botas de seguridad, chalecos, señalización, extintores y más.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    ),
    color: 'from-orange-500 to-red-500',
    bgLight: 'bg-orange-50',
  },
  {
    id: 'cafeteria',
    name: 'Cafetería y Alimentos',
    description: 'Cafeteras, grecas, termos, neveras, dispensadores, café, aromáticas y todo para el servicio de alimentación.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
        <line x1="6" x2="6" y1="2" y2="4"/>
        <line x1="10" x2="10" y1="2" y2="4"/>
        <line x1="14" x2="14" y1="2" y2="4"/>
      </svg>
    ),
    color: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-50',
  },
  {
    id: 'papeleria',
    name: 'Papelería y Oficina',
    description: 'Resmas, cuadernos, carpetas, bolígrafos, marcadores, libros contables y consumibles de oficina.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
        <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
        <path d="M10 9H8"/>
        <path d="M16 13H8"/>
        <path d="M16 17H8"/>
      </svg>
    ),
    color: 'from-green-500 to-emerald-500',
    bgLight: 'bg-green-50',
  },
  {
    id: 'tecnologia',
    name: 'Tecnología',
    description: 'Impresoras, tintas, computadores, tablets, proyectores, periféricos y soluciones tecnológicas.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="12" x="3" y="4" rx="2" ry="2"/>
        <line x1="2" x2="22" y1="20" y2="20"/>
        <line x1="12" x2="12" y1="16" y2="20"/>
      </svg>
    ),
    color: 'from-violet-500 to-purple-500',
    bgLight: 'bg-violet-50',
  },
  {
    id: 'mobiliario',
    name: 'Mobiliario de Oficina',
    description: 'Sillas ejecutivas, escritorios, archivadores, lockers, estanterías y muebles ergonómicos.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2"/>
        <path d="M3 9h18"/>
        <path d="M9 21V9"/>
      </svg>
    ),
    color: 'from-pink-500 to-rose-500',
    bgLight: 'bg-pink-50',
  },
  {
    id: 'motos',
    name: 'Repuestos y Motos',
    description: 'Repuestos esenciales, frenos, baterías, bujías y servicio técnico especializado para motocicletas.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5.5" cy="17.5" r="3.5"/>
        <circle cx="18.5" cy="17.5" r="3.5"/>
        <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h3"/>
      </svg>
    ),
    color: 'from-slate-600 to-gray-700',
    bgLight: 'bg-slate-50',
  },
  {
    id: 'ferreteria',
    name: 'Ferretería',
    description: 'Cementos, tuberías, láminas, pinturas, herramientas y materiales para construcción.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8"/>
        <path d="m16 16 6-6"/>
        <path d="m8 8 6-6"/>
        <path d="m9 7 8 8"/>
      </svg>
    ),
    color: 'from-yellow-500 to-amber-600',
    bgLight: 'bg-yellow-50',
  },
];

const benefits = [
  {
    title: 'Portafolio Integral',
    description: '8 líneas de productos para cubrir todas tus necesidades en un solo proveedor.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m7.5 4.27 9 5.15"/>
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
        <path d="m3.3 7 8.7 5 8.7-5"/>
        <path d="M12 22V12"/>
      </svg>
    ),
  },
  {
    title: 'Calidad Garantizada',
    description: 'Trabajamos con marcas reconocidas que respaldan cada producto.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    ),
  },
  {
    title: 'Entrega Oportuna',
    description: 'Garantizamos continuidad en el suministro para mantener tu operación activa.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/>
        <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/>
        <circle cx="7" cy="18" r="2"/>
        <path d="M15 18H9"/>
        <circle cx="17" cy="18" r="2"/>
      </svg>
    ),
  },
  {
    title: 'Atención Personalizada',
    description: 'Asesoría especializada para encontrar las mejores soluciones.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2"/>
        <rect width="18" height="18" x="3" y="4" rx="2"/>
        <circle cx="12" cy="10" r="2"/>
        <line x1="8" x2="8" y1="2" y2="4"/>
        <line x1="16" x2="16" y1="2" y2="4"/>
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-hero overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium">Tu proveedor de confianza en Yopal</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Soluciones Integrales para tu
                <span className="block text-amber-400">Empresa e Institución</span>
              </h1>
              
              <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-xl leading-relaxed">
                Somos tu aliado estratégico en abastecimiento. Ofrecemos calidad, variedad y servicio personalizado en más de 8 líneas de productos.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/productos" className="btn-accent inline-flex items-center justify-center gap-2">
                  Ver Catálogo
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/>
                    <path d="m12 5 7 7-7 7"/>
                  </svg>
                </Link>
                <Link href="/contacto" className="btn-secondary !bg-transparent !text-white !border-white hover:!bg-white/10 inline-flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  Contáctanos
                </Link>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/20">
                <div>
                  <div className="text-3xl md:text-4xl font-bold">8+</div>
                  <div className="text-blue-200 text-sm">Líneas de Productos</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold">500+</div>
                  <div className="text-blue-200 text-sm">Productos</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold">15+</div>
                  <div className="text-blue-200 text-sm">Años de Experiencia</div>
                </div>
              </div>
            </div>
            
            {/* Hero Image Placeholder */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="w-full h-96 bg-white/10 backdrop-blur rounded-3xl border border-white/20 flex items-center justify-center animate-float">
                  <div className="text-center text-white/80">
                    <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-5xl font-bold">O</span>
                    </div>
                    <p className="text-lg font-medium">OSPINA</p>
                    <p className="text-sm">Comercializadora & Suministros</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Lines Section */}
      <section className="section-padding bg-gradient-section">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
              Nuestro Portafolio
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Líneas de Productos
            </h2>
            <p className="text-lg text-gray-600">
              Ofrecemos un catálogo completo para atender todas las necesidades de oficinas, industrias, entidades públicas y comercios.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productLines.map((line, index) => (
              <Link 
                href="/productos" 
                key={line.id}
                className="product-card group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`icon-container bg-gradient-to-br ${line.color} text-white mb-6`}>
                  {line.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                  {line.name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {line.description}
                </p>
                <div className="mt-4 flex items-center text-blue-700 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver productos
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <path d="M5 12h14"/>
                    <path d="m12 5 7 7-7 7"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="section-padding bg-gray-900 text-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold mb-4">
                ¿Por qué elegirnos?
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Tu Aliado Estratégico en
                <span className="text-amber-400"> Abastecimiento</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Con más de 15 años de experiencia, nos hemos consolidado como el proveedor de confianza para empresas, instituciones y comercios en Yopal, Casanare y toda la región.
              </p>
              
              <Link href="/nosotros" className="btn-primary inline-flex items-center gap-2">
                Conocer Más
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"/>
                  <path d="m12 5 7 7-7 7"/>
                </svg>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div 
                  key={benefit.title}
                  className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white rounded-full"></div>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              ¿Listo para optimizar tu abastecimiento?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Contáctanos hoy y descubre cómo podemos ayudarte a reducir costos y mejorar la eficiencia de tu operación.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contacto" className="btn-accent inline-flex items-center justify-center gap-2">
                Solicitar Cotización
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"/>
                  <path d="m12 5 7 7-7 7"/>
                </svg>
              </Link>
              <a href="tel:+573001234567" className="btn-secondary !bg-transparent !text-white !border-white hover:!bg-white/10 inline-flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Llamar Ahora
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
