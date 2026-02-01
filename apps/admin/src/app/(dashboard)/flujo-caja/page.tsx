'use client';

import { useState, useEffect } from 'react';

interface CashFlowRecord {
  id: string;
  date: string;
  receiptNumber: string;
  provider: string;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
}

interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export default function CashFlowPage() {
  const [records, setRecords] = useState<CashFlowRecord[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    receiptNumber: '',
    provider: '',
    description: '',
    type: 'INCOME',
    amount: '',
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
      };

      const [recordsRes, summaryRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/cash-flow`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/cash-flow/summary`, { headers })
      ]);

      if (recordsRes.ok && summaryRes.ok) {
        const recordsData = await recordsRes.json();
        const summaryData = await summaryRes.json();
        setRecords(recordsData);
        setSummary(summaryData);
      }
    } catch (error) {
      console.error('Error fetching cash flow data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cash-flow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({
            date: new Date().toISOString().split('T')[0],
            receiptNumber: '',
            provider: '',
            description: '',
            type: 'INCOME',
            amount: '',
        });
        fetchData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to save record:', errorData);
        alert(`Error al guardar el registro: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Error de conexión o al guardar el registro.');
    }
  };

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Flujo de Caja</h1>
          <p className="text-gray-400">Control de ingresos y egresos de la empresa.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Nuevo Registro
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <h3 className="text-gray-400 font-medium mb-1">Total Ingresos</h3>
          <p className="text-3xl font-bold text-green-500">${summary.totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <h3 className="text-gray-400 font-medium mb-1">Total Gastos</h3>
          <p className="text-3xl font-bold text-red-500">${summary.totalExpense.toLocaleString()}</p>
        </div>
        <div className={`p-6 rounded-2xl border ${summary.balance >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <h3 className="text-gray-400 font-medium mb-1">Diferencia</h3>
          <p className={`text-3xl font-bold ${summary.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${summary.balance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-800/50 border-b border-gray-800">
                <th className="px-6 py-4 text-sm font-semibold text-gray-300">Fecha</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-300">N° Recibo</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-300">Proveedor</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-300">Descripción</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-300 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {loading ? 'Cargando registros...' : 'No hay registros contables todavía.'}
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr 
                    key={record.id} 
                    className={`${
                      record.type === 'INCOME' 
                        ? 'bg-green-900/10 text-green-400' 
                        : 'bg-red-900/10 text-red-400'
                    } transition-colors hover:bg-opacity-20`}
                  >
                    <td className="px-6 py-4 text-sm">
                      {new Date(record.date).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono">{record.receiptNumber}</td>
                    <td className="px-6 py-4 text-sm font-medium">{record.provider}</td>
                    <td className="px-6 py-4 text-sm opacity-80">{record.description}</td>
                    <td className="px-6 py-4 text-sm font-bold text-right">
                      {record.type === 'INCOME' ? '+' : '-'}${record.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Nuevo Registro Contable</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="INCOME">Ingreso</option>
                    <option value="EXPENSE">Gasto</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">N° Recibo</label>
                  <input
                    type="text"
                    required
                    placeholder="FE-001"
                    value={formData.receiptNumber}
                    onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Monto</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Proveedor / Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Nombre de la empresa o persona"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Descripción</label>
                <textarea
                  required
                  placeholder="Detalles del registro..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-600/20"
                >
                  Guardar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
