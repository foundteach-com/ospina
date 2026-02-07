export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">Sobre Ospina Comercializadora</h1>
          <p className="text-xl text-gray-400">Más de 15 años brindando soluciones integrales para empresas de toda Colombia.</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16 space-y-16">
        {/* Quiénes somos */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-blue-600 font-semibold uppercase tracking-wider text-sm">Quiénes Somos</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">Una empresa comprometida con la calidad</h2>
            <p className="text-gray-600 leading-relaxed">
              Ospina Comercializadora y Suministros es una empresa colombiana dedicada a la distribución de productos 
              de alta calidad para el sector empresarial. Nos especializamos en ofrecer soluciones integrales que 
              satisfacen las necesidades de nuestros clientes.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl p-8 aspect-video flex items-center justify-center">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-blue-600 text-4xl font-bold">O</span>
            </div>
          </div>
        </div>

        {/* Valores */}
        <div>
          <div className="text-center mb-12">
            <span className="text-blue-600 font-semibold uppercase tracking-wider text-sm">Nuestros Valores</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Lo que nos define</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { title: 'Calidad', desc: 'Productos que cumplen los más altos estándares.' },
              { title: 'Compromiso', desc: 'Trabajamos para superar las expectativas.' },
              { title: 'Confianza', desc: 'Relaciones duraderas con nuestros clientes.' },
            ].map((v, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
