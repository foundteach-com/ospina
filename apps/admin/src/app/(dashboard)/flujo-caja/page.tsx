'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [editingRecord, setEditingRecord] = useState<CashFlowRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Filter & Sort state
  const [filters, setFilters] = useState({
    type: '',
    search: '',
    startDate: '',
    endDate: '',
  });

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'date',
    direction: 'desc',
  });
  
  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    receiptNumber: '',
    provider: '',
    description: '',
    type: 'INCOME',
    amount: '',
  });

  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserRole(user.role);
    }
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
      };

      // Build query params from filters and sort
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.search) params.append('search', filters.search);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      // Add sort params
      params.append('sortBy', sortConfig.key);
      params.append('order', sortConfig.direction);

      const [recordsRes, summaryRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/cash-flow?${params}`, { headers }),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-30"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
      );
    }
    return sortConfig.direction === 'asc' ? (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="m7 9 5-5 5 5"/></svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="m7 15 5 5 5-5"/></svg>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const url = editingRecord 
        ? `${process.env.NEXT_PUBLIC_API_URL}/cash-flow/${editingRecord.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/cash-flow`;
      
      const method = editingRecord ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
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
        setEditingRecord(null);
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

  // Error handler removed


  const handleEdit = (record: CashFlowRecord) => {
    setEditingRecord(record);
    setFormData({
      date: new Date(record.date).toISOString().split('T')[0],
      receiptNumber: record.receiptNumber,
      provider: record.provider,
      description: record.description,
      type: record.type,
      amount: record.amount.toString(),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cash-flow/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchData();
        setDeletingId(null);
      } else {
        alert('Error al eliminar el registro');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Error de conexión al eliminar el registro');
    }
  };

  const getFormattedDataForExport = () => {
    return records.map(r => ({
      Fecha: new Date(r.date).toLocaleDateString('es-CO'),
      'N° Recibo': r.receiptNumber,
      Proveedor: r.provider,
      Descripción: r.description,
      Tipo: r.type === 'INCOME' ? 'Ingreso' : 'Egreso',
      Monto: r.amount
    }));
  };

  const exportCSV = () => {
    if (records.length === 0) return alert('No hay registros para exportar');
    
    const ws = XLSX.utils.json_to_sheet(getFormattedDataForExport());
    const csv = XLSX.utils.sheet_to_csv(ws);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flujo-caja-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportExcel = () => {
    if (records.length === 0) return alert('No hay registros para exportar');

    const ws = XLSX.utils.json_to_sheet(getFormattedDataForExport());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Flujo de Caja");
    
    // Auto-width columns

    const colWidths = [
        { wch: 15 }, // Date
        { wch: 20 }, // Receipt
        { wch: 30 }, // Provider
        { wch: 40 }, // Description
        { wch: 15 }, // Type
        { wch: 15 }  // Amount
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `flujo-caja-${new Date().toISOString().split('T')[0]}.xlsx`);
    setShowExportMenu(false);
  };

  const exportPDF = () => {
     if (records.length === 0) return alert('No hay registros para exportar');

     const doc = new jsPDF();
     
     // Title
     doc.setFontSize(18);
     doc.text('Reporte de Flujo de Caja', 14, 22);
     doc.setFontSize(11);
     doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, 14, 30);
     
     // Summary
     doc.text(`Ingresos: $${summary.totalIncome.toLocaleString()}`, 14, 40);
     doc.text(`Gastos: $${summary.totalExpense.toLocaleString()}`, 80, 40);
     doc.text(`Balance: $${summary.balance.toLocaleString()}`, 140, 40);

     const tableColumn = ["Fecha", "N° Recibo", "Proveedor", "Descripción", "Tipo", "Monto"];
     const tableRows = records.map(record => [
       new Date(record.date).toLocaleDateString('es-CO'),
       record.receiptNumber,
       record.provider,
       record.description,
       record.type === 'INCOME' ? 'Ingreso' : 'Egreso',
       `$${record.amount.toLocaleString()}`
     ]);

     autoTable(doc, {
       head: [tableColumn],
       body: tableRows,
       startY: 50,
       theme: 'grid',
       styles: { fontSize: 8 },
       headStyles: { fillColor: [22, 163, 74] } // Green-600
     });

     doc.save(`flujo-caja-${new Date().toISOString().split('T')[0]}.pdf`);
     setShowExportMenu(false);
  };

  const handleNewRecord = () => {
    setEditingRecord(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      receiptNumber: '',
      provider: '',
      description: '',
      type: 'INCOME',
      amount: '',
    });
    setShowModal(true);
  };

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Flujo de Caja</h1>
          <p className="text-gray-500">Control de ingresos y egresos de la empresa.</p>
        </div>
        {userRole !== 'VIEWER' && (
          <button
            onClick={handleNewRecord}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Nuevo Registro
          </button>
        )}
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <h3 className="text-gray-500 font-medium mb-1">Total Ingresos</h3>
          <p className="text-3xl font-bold text-green-600">${summary.totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <h3 className="text-gray-500 font-medium mb-1">Total Gastos</h3>
          <p className="text-3xl font-bold text-red-600">${summary.totalExpense.toLocaleString()}</p>
        </div>
        <div className={`p-6 rounded-2xl border shadow-sm ${summary.balance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <h3 className="text-gray-500 font-medium mb-1">Diferencia</h3>
          <p className={`text-3xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${summary.balance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Tipo</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Todos</option>
              <option value="INCOME">Ingresos</option>
              <option value="EXPENSE">Egresos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Buscar</label>
            <input
              type="text"
              placeholder="Proveedor, recibo..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Desde</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Hasta</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-end relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              title="Exportar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transform transition-transform ${showExportMenu ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            
            {showExportMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <button onClick={exportCSV} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 flex items-center gap-2 transition-colors">
                  <span className="bg-green-100 text-green-700 p-1 rounded font-bold text-xs">CSV</span>
                  <span>Archivo CSV</span>
                </button>
                <button onClick={exportExcel} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 flex items-center gap-2 transition-colors">
                  <span className="bg-green-100 text-green-700 p-1 rounded font-bold text-xs">XLS</span>
                  <span>Excel (XLSX)</span>
                </button>
                <button onClick={exportPDF} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 flex items-center gap-2 transition-colors border-t border-gray-200">
                  <span className="bg-red-100 text-red-700 p-1 rounded font-bold text-xs">PDF</span>
                  <span>Documento PDF</span>
                </button>
              </div>
            )}
            
            {/* Click outside closer overlay */}
            {showExportMenu && (
              <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)}></div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th 
                  className="px-6 py-4 text-sm font-semibold text-gray-500 cursor-pointer hover:bg-gray-100 hover:text-gray-900 transition-colors select-none"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1">Fecha {getSortIcon('date')}</div>
                </th>
                <th 
                  className="px-6 py-4 text-sm font-semibold text-gray-500 cursor-pointer hover:bg-gray-100 hover:text-gray-900 transition-colors select-none"
                  onClick={() => handleSort('receiptNumber')}
                >
                  <div className="flex items-center gap-1">N° Recibo {getSortIcon('receiptNumber')}</div>
                </th>
                <th 
                  className="px-6 py-4 text-sm font-semibold text-gray-500 cursor-pointer hover:bg-gray-100 hover:text-gray-900 transition-colors select-none"
                  onClick={() => handleSort('provider')}
                >
                  <div className="flex items-center gap-1">Proveedor {getSortIcon('provider')}</div>
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500">Descripción</th>
                <th 
                  className="px-6 py-4 text-sm font-semibold text-gray-500 text-right cursor-pointer hover:bg-gray-100 hover:text-gray-900 transition-colors select-none"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end gap-1">Monto {getSortIcon('amount')}</div>
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {loading ? 'Cargando registros...' : 'No hay registros contables todavía.'}
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr 
                    key={record.id} 
                    className={`${
                      record.type === 'INCOME' 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-red-50 text-red-700'
                    } transition-colors hover:bg-opacity-80`}
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
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(record)}
                          className={`p-2 hover:bg-blue-50 rounded-lg transition-colors ${userRole === 'VIEWER' ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`}
                          title={userRole === 'VIEWER' ? 'No tienes permisos para editar' : 'Editar'}
                          disabled={userRole === 'VIEWER'}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button
                          onClick={() => setDeletingId(record.id)}
                          className={`p-2 hover:bg-red-50 rounded-lg transition-colors ${userRole === 'VIEWER' ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-800'}`}
                          title={userRole === 'VIEWER' ? 'No tienes permisos para eliminar' : 'Eliminar'}
                          disabled={userRole === 'VIEWER'}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">
                {editingRecord ? 'Editar Registro' : 'Nuevo Registro Contable'}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingRecord(null); }} className="text-gray-500 hover:text-gray-900">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="INCOME">Ingreso</option>
                    <option value="EXPENSE">Gasto</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">N° Recibo</label>
                  <input
                    type="text"
                    required
                    placeholder="FE-001"
                    value={formData.receiptNumber}
                    onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Monto</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Proveedor / Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Nombre de la empresa o persona"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Descripción</label>
                <textarea
                  required
                  placeholder="Detalles del registro..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingRecord(null); }}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-600/20"
                >
                  {editingRecord ? 'Actualizar' : 'Guardar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Confirmar Eliminación</h3>
                <p className="text-gray-500 text-sm mt-1">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar este registro? Los totales se actualizarán automáticamente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
