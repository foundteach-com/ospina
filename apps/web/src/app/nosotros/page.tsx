import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nosotros | OSPINA Comercializadora y Suministros',
  description: 'Conoce nuestra historia, misión, visión y valores. Más de 15 años siendo el proveedor de confianza en Yopal, Casanare.',
};

const values = [
  {
    title: 'Calidad',
    description: 'Ofrecemos productos de marcas reconocidas que garantizan satisfacción.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
  },
  {
    title: 'Compromiso',
    description: 'Cumplimos con nuestras promesas y garantizamos entregas oportunas.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    ),
  },
  {
    title: 'Servicio',
    description: 'Asesoría personalizada para encontrar las mejores soluciones.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2"/>
        <rect width="18" height="18" x="3" y="4" rx="2"/>
        <circle cx="12" cy="10" r="2"/>
      </svg>
    ),
  },
  {
    title: 'Innovación',
    description: 'Constantemente ampliamos nuestro portafolio con nuevos productos.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h5"/>
        <path d="M17 12h5"/>
        <path d="M12 2v5"/>
        <path d="M12 17v5"/>
        <circle cx="12" cy="12" r="4"/>
      </svg>
    ),
  },
];

const timeline = [
  { year: '2010', event: 'Fundación de OSPINA Comercializadora' },
  { year: '2013', event: 'Expansión a Seguridad Industrial' },
  { year: '2016', event: 'Apertura de línea de Tecnología' },
  { year: '2019', event: 'Incorporación de Mobiliario de Oficina' },
  { year: '2022', event: 'Lanzamiento de Servicio Técnico de Motos' },
  { year: '2025', event: 'Consolidación como proveedor líder regional' },
];

export default function NosotrosPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="container-custom relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Sobre Nosotros
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Más de 15 años siendo el aliado estratégico de empresas e instituciones en Casanare
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
                Nuestra Historia
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                De una idea a ser el proveedor de confianza de la región
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-900">OSPINA Comercializadora y Suministros</strong> nació en Yopal, Casanare, con la visión de ofrecer soluciones integrales de abastecimiento para el sector empresarial e institucional de la región.
                </p>
                <p>
                  A lo largo de los años, hemos expandido nuestro portafolio para incluir más de 8 líneas de productos que cubren desde aseo institucional hasta tecnología, mobiliario y ferretería.
                </p>
                <p>
                  Hoy, somos reconocidos como un <strong className="text-gray-900">proveedor multisolución</strong> que atiende a oficinas, industrias, entidades públicas, establecimientos comerciales y clientes particulares con calidad, respaldo de marca y continuidad en el suministro.
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 lg:p-12">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Nuestra Trayectoria</h3>
              <div className="space-y-6">
                {timeline.map((item, index) => (
                  <div key={item.year} className="flex gap-4 items-start">
                    <div className="w-16 h-16 bg-blue-700 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                      {item.year}
                    </div>
                    <div className="pt-3">
                      <p className="text-gray-700">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="6"/>
                  <circle cx="12" cy="12" r="2"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Misión</h3>
              <p className="text-gray-600 leading-relaxed">
                Proveer soluciones integrales de abastecimiento con productos de alta calidad, garantizando el cumplimiento oportuno, precios competitivos y un servicio personalizado que supere las expectativas de nuestros clientes.
              </p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Visión</h3>
              <p className="text-gray-600 leading-relaxed">
                Ser el proveedor líder y referente en abastecimiento integral de la región, reconocidos por nuestra diversidad de productos, excelencia en el servicio y compromiso con el desarrollo de nuestros clientes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
              Lo que nos define
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nuestros Valores
            </h2>
            <p className="text-lg text-gray-600">
              Los principios que guían cada decisión y acción en OSPINA
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 mx-auto mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-gray-900 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Quieres trabajar con nosotros?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Descubre cómo podemos convertirnos en tu aliado estratégico de abastecimiento
          </p>
          <Link href="/contacto" className="btn-primary inline-flex items-center gap-2">
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
