import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface OpProcess {
  id: string;
  name: string;
  code: string;
  color?: string;
}

interface OpTask {
  id: string;
  name: string;
  status: string;
  priority: string;
  scheduledDate: string | null;
  dueDate: string | null;
  processId?: string;
  process?: OpProcess;
  [key: string]: any;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingTask?: OpTask | null;
  processes: OpProcess[];
}

function formatDateInput(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
}

export default function TaskModal({ isOpen, onClose, onSaved, editingTask, processes }: TaskModalProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    processId: '',
    priority: 'MEDIUM',
    frequency: 'CUSTOM',
    scheduledDate: '',
    dueDate: '',
    time: '',
    observations: '',
    recurrenceInterval: 1,
    daysOfWeek: '',
    monthlyType: 'DAY_OF_MONTH',
    monthDay: 15,
    weekOfMonth: 1,
    recurrenceEndType: 'NEVER',
    recurrenceEndDate: '',
    recurrenceCount: 10,
  });

  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        setForm({
          name: editingTask.name || '',
          description: editingTask.description || '',
          processId: editingTask.processId || '',
          priority: editingTask.priority || 'MEDIUM',
          frequency: editingTask.frequency || 'CUSTOM',
          scheduledDate: formatDateInput(editingTask.scheduledDate),
          dueDate: formatDateInput(editingTask.dueDate),
          time: editingTask.time || '',
          observations: editingTask.observations || '',
          recurrenceInterval: editingTask.recurrenceInterval || 1,
          daysOfWeek: editingTask.daysOfWeek || '',
          monthlyType: editingTask.monthlyType || 'DAY_OF_MONTH',
          monthDay: editingTask.monthDay || 15,
          weekOfMonth: editingTask.weekOfMonth || 1,
          recurrenceEndType: editingTask.recurrenceEndType || 'NEVER',
          recurrenceEndDate: formatDateInput(editingTask.recurrenceEndDate),
          recurrenceCount: editingTask.recurrenceCount || 10,
        });
      } else {
        setForm({
          name: '',
          description: '',
          processId: '',
          priority: 'MEDIUM',
          frequency: 'CUSTOM',
          scheduledDate: '',
          dueDate: '',
          time: '',
          observations: '',
          recurrenceInterval: 1,
          daysOfWeek: '',
          monthlyType: 'DAY_OF_MONTH',
          monthDay: 15,
          weekOfMonth: 1,
          recurrenceEndType: 'NEVER',
          recurrenceEndDate: '',
          recurrenceCount: 10,
        });
      }
    }
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.processId) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      
      const payload: Record<string, any> = {
        ...form,
        // Only include dates if they were entered
        scheduledDate: form.scheduledDate ? `${form.scheduledDate}T12:00:00.000Z` : null,
        dueDate: form.dueDate ? `${form.dueDate}T12:00:00.000Z` : null,
        recurrenceEndDate: form.recurrenceEndDate ? `${form.recurrenceEndDate}T12:00:00.000Z` : null,
      };

      if (payload.frequency === 'MONTHLY' && payload.monthlyType === 'DAY_OF_WEEK' && !payload.daysOfWeek) {
        payload.daysOfWeek = 'MON';
      }

      if (payload.frequency === 'ANNUAL' && !payload.daysOfWeek) {
        payload.daysOfWeek = 'MON';
      }

      const isEdit = !!editingTask;
      const url = isEdit 
        ? `${process.env.NEXT_PUBLIC_API_URL}/operations/tasks/${editingTask.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/operations/tasks`;
      
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        onSaved();
        onClose();
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error('Error response:', errData);
      }
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">
            {editingTask ? 'Editar Tarea' : 'Programar Tarea'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSaveTask} className="p-6 overflow-y-auto space-y-6">
          
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Información Básica</h3>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Nombre de la Tarea <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                placeholder="Ej. Revisión de inventario físico"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Proceso Relacionado <span className="text-red-500">*</span></label>
              <select
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                value={form.processId}
                onChange={(e) => setForm({ ...form, processId: e.target.value })}
              >
                <option value="" disabled>Seleccione un proceso...</option>
                {processes.map(p => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Descripción detallada</label>
              <textarea
                rows={3}
                placeholder="Instrucciones o detalles de la tarea..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Configuración y Programación Avanzada */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Programación y Recurrencia</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Prioridad</label>
                <select
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  <option value="LOW">Baja (Rutina)</option>
                  <option value="MEDIUM">Media (Normal)</option>
                  <option value="HIGH">Alta (Urgente)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Frecuencia de Recurrencia</label>
                <select
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-blue-700 bg-blue-50/50"
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                >
                  <option value="CUSTOM">Única vez (No se repite)</option>
                  <option value="DAILY">Diaria (Todos los días / Intervalo)</option>
                  <option value="WEEKLY">Semanal (Días específicos)</option>
                  <option value="MONTHLY">Mensual (Día del mes)</option>
                  <option value="ANNUAL">Anual (Cada año)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Fecha de Inicio / Programada
                  <span className="ml-1 text-xs font-normal text-gray-400">(opcional)</span>
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={form.scheduledDate}
                  onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Fecha Límite Primera Ejecución
                  <span className="ml-1 text-xs font-normal text-gray-400">(opcional)</span>
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
            </div>

            {/* OPCIONES DE RECURRENCIA DINÁMICAS */}
            {form.frequency !== 'CUSTOM' && (
              <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 space-y-4">
                
                {/* Intervalo de repetición */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700">Repetir cada:</span>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    className="w-20 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-center font-bold outline-none"
                    value={form.recurrenceInterval}
                    onChange={(e) => setForm({ ...form, recurrenceInterval: parseInt(e.target.value) || 1 })}
                  />
                  <span className="text-sm text-gray-600 font-medium">
                    {form.frequency === 'DAILY' && 'día(s)'}
                    {form.frequency === 'WEEKLY' && 'semana(s)'}
                    {form.frequency === 'MONTHLY' && 'mes(es)'}
                    {form.frequency === 'ANNUAL' && 'año(s)'}
                  </span>
                </div>

                {/* Días de la semana para frecuencia SEMANAL */}
                {form.frequency === 'WEEKLY' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Repetir en estos días:</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { code: 'MON', label: 'Lun' },
                        { code: 'TUE', label: 'Mar' },
                        { code: 'WED', label: 'Mié' },
                        { code: 'THU', label: 'Jue' },
                        { code: 'FRI', label: 'Vie' },
                        { code: 'SAT', label: 'Sáb' },
                        { code: 'SUN', label: 'Dom' },
                      ].map(d => {
                        const isSelected = form.daysOfWeek.includes(d.code);
                        return (
                          <button
                            type="button"
                            key={d.code}
                            onClick={() => {
                              let current = form.daysOfWeek ? form.daysOfWeek.split(',') : [];
                              if (isSelected) {
                                current = current.filter(c => c !== d.code);
                              } else {
                                current.push(d.code);
                              }
                              setForm({ ...form, daysOfWeek: current.join(',') });
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              isSelected 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Opciones para frecuencia MENSUAL */}
                {form.frequency === 'MONTHLY' && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Modo de repetición mensual:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-blue-300">
                        <input
                          type="radio"
                          name="monthlyType"
                          value="DAY_OF_MONTH"
                          checked={form.monthlyType === 'DAY_OF_MONTH'}
                          onChange={() => setForm({ ...form, monthlyType: 'DAY_OF_MONTH' })}
                        />
                        <span className="text-xs font-semibold text-gray-700">Día fijo del mes (ej: día 15)</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-blue-300">
                        <input
                          type="radio"
                          name="monthlyType"
                          value="DAY_OF_WEEK"
                          checked={form.monthlyType === 'DAY_OF_WEEK'}
                          onChange={() => setForm({ ...form, monthlyType: 'DAY_OF_WEEK' })}
                        />
                        <span className="text-xs font-semibold text-gray-700">Día relativo (ej: primer Lunes)</span>
                      </label>
                    </div>
                    {form.monthlyType === 'DAY_OF_MONTH' && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-medium text-gray-600">Día del mes (1 - 31):</span>
                        <input
                          type="number"
                          min={1}
                          max={31}
                          className="w-20 px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold outline-none"
                          value={form.monthDay}
                          onChange={(e) => setForm({ ...form, monthDay: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                    )}
                    {form.monthlyType === 'DAY_OF_WEEK' && (
                      <div className="flex flex-col gap-2 mt-2 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                        <span className="text-xs font-medium text-gray-600">Configurar día relativo:</span>
                        <div className="flex gap-2">
                          <select
                            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:ring-1 focus:ring-blue-500/50"
                            value={form.weekOfMonth}
                            onChange={(e) => setForm({ ...form, weekOfMonth: parseInt(e.target.value) || 1 })}
                          >
                            <option value={1}>Primer</option>
                            <option value={2}>Segundo</option>
                            <option value={3}>Tercer</option>
                            <option value={4}>Cuarto</option>
                            <option value={-1}>Último</option>
                          </select>
                          
                          <select
                            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:ring-1 focus:ring-blue-500/50"
                            value={form.daysOfWeek || 'MON'}
                            onChange={(e) => setForm({ ...form, daysOfWeek: e.target.value })}
                          >
                            <option value="MON">Lunes</option>
                            <option value="TUE">Martes</option>
                            <option value="WED">Miércoles</option>
                            <option value="THU">Jueves</option>
                            <option value="FRI">Viernes</option>
                            <option value="SAT">Sábado</option>
                            <option value="SUN">Domingo</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Opciones para frecuencia ANUAL */}
                {form.frequency === 'ANNUAL' && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Configuración anual (Opcional):</label>
                    <div className="flex flex-col gap-2 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                      <span className="text-xs font-medium text-gray-600">Semana del año para ejecutar la tarea:</span>
                      <div className="flex gap-2">
                        <select
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:ring-1 focus:ring-blue-500/50"
                          value={form.weekOfMonth}
                          onChange={(e) => setForm({ ...form, weekOfMonth: parseInt(e.target.value) || 1 })}
                        >
                          <option value={1}>Primera semana del año</option>
                          <option value={2}>Segunda semana del año</option>
                          <option value={3}>Tercera semana del año</option>
                          <option value={4}>Cuarta semana del año</option>
                          <option value={-1}>Última semana del año</option>
                          <option value={-2}>Penúltima semana del año</option>
                          <optgroup label="Semanas específicas">
                            {[...Array(48)].map((_, i) => (
                              <option key={i+5} value={i+5}>Semana {i+5}</option>
                            ))}
                          </optgroup>
                        </select>
                        
                        <select
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:ring-1 focus:ring-blue-500/50"
                          value={form.daysOfWeek || 'MON'}
                          onChange={(e) => setForm({ ...form, daysOfWeek: e.target.value })}
                        >
                          <option value="MON">Lunes</option>
                          <option value="TUE">Martes</option>
                          <option value="WED">Miércoles</option>
                          <option value="THU">Jueves</option>
                          <option value="FRI">Viernes</option>
                          <option value="SAT">Sábado</option>
                          <option value="SUN">Domingo</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* CONDICIONES DE FINALIZACIÓN */}
                <div className="pt-3 border-t border-blue-100 space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Finaliza la recurrencia:</label>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer">
                      <input
                        type="radio"
                        name="recurrenceEndType"
                        value="NEVER"
                        checked={form.recurrenceEndType === 'NEVER'}
                        onChange={() => setForm({ ...form, recurrenceEndType: 'NEVER' })}
                      />
                      <span className="font-semibold">Nunca (Tarea operativa continua sin fin)</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="recurrenceEndType"
                        value="ON_DATE"
                        checked={form.recurrenceEndType === 'ON_DATE'}
                        onChange={() => setForm({ ...form, recurrenceEndType: 'ON_DATE' })}
                      />
                      <span className="text-xs text-gray-700 font-semibold">En una fecha determinada:</span>
                      {form.recurrenceEndType === 'ON_DATE' && (
                        <input
                          type="date"
                          className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium outline-none"
                          value={form.recurrenceEndDate}
                          onChange={(e) => setForm({ ...form, recurrenceEndDate: e.target.value })}
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="recurrenceEndType"
                        value="AFTER_COUNT"
                        checked={form.recurrenceEndType === 'AFTER_COUNT'}
                        onChange={() => setForm({ ...form, recurrenceEndType: 'AFTER_COUNT' })}
                      />
                      <span className="text-xs text-gray-700 font-semibold">Después de:</span>
                      {form.recurrenceEndType === 'AFTER_COUNT' && (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={1}
                            max={999}
                            className="w-16 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-center outline-none"
                            value={form.recurrenceCount}
                            onChange={(e) => setForm({ ...form, recurrenceCount: parseInt(e.target.value) || 1 })}
                          />
                          <span className="text-xs text-gray-600">repeticiones</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              {saving ? 'Guardando...' : (
                <>
                  <Save size={18} />
                  {editingTask ? 'Guardar Cambios' : 'Crear Tarea'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
