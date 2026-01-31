export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <div className="w-64 bg-slate-800 text-white p-6">
          <h2 className="text-2xl font-bold mb-8">Ospina Admin</h2>
          <nav>
            <ul className="space-y-4">
              <li className="font-medium text-slate-300 hover:text-white cursor-pointer">Dashboard</li>
              <li className="font-medium text-slate-300 hover:text-white cursor-pointer">Productos</li>
              <li className="font-medium text-slate-300 hover:text-white cursor-pointer">Pedidos</li>
              <li className="font-medium text-slate-300 hover:text-white cursor-pointer">Usuarios</li>
            </ul>
          </nav>
        </div>
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Ventas Hoy</h3>
              <p className="text-3xl font-bold text-green-600">$0</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Pedidos Pendientes</h3>
              <p className="text-3xl font-bold text-orange-600">0</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Usuarios Activos</h3>
              <p className="text-3xl font-bold text-blue-600">0</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
