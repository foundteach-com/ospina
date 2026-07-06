'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ProjectWithTasks {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  createdAt: string;
  tasks: { id: string; status: string }[];
}

const statusColors: Record<string, string> = {
  PLANNED: 'background: rgba(139,92,246,0.1); color: #8b5cf6; border: 1px solid rgba(139,92,246,0.25)',
  ACTIVE: 'background: rgba(34,197,94,0.1); color: #22c55e; border: 1px solid rgba(34,197,94,0.25)',
  COMPLETED: 'background: rgba(59,130,246,0.1); color: #3b82f6; border: 1px solid rgba(59,130,246,0.25)',
  ON_HOLD: 'background: rgba(245,158,11,0.1); color: #f59e0b; border: 1px solid rgba(245,158,11,0.25)',
};

const statusLabels: Record<string, string> = {
  PLANNED: 'Planificado',
  ACTIVE: 'Activo',
  COMPLETED: 'Completado',
  ON_HOLD: 'En Pausa',
};

export default function OperacionesPage() {
  const [projects, setProjects] = useState<ProjectWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithTasks | null>(null);
  const [form, setForm] = useState({ name: '', description: '', startDate: '', endDate: '', status: 'PLANNED' });
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      const url = editingProject
        ? `${process.env.NEXT_PUBLIC_API_URL}/operations/projects/${editingProject.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/operations/projects`;
      const method = editingProject ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingProject(null);
        setForm({ name: '', description: '', startDate: '', endDate: '', status: 'PLANNED' });
        fetchProjects();
      }
    } catch (err) {
      console.error('Error saving project:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este proyecto y todas sus tareas?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const openEdit = (project: ProjectWithTasks) => {
    setEditingProject(project);
    setForm({
      name: project.name,
      description: project.description || '',
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      endDate: project.endDate ? project.endDate.split('T')[0] : '',
      status: project.status,
    });
    setShowModal(true);
  };

  const openNew = () => {
    setEditingProject(null);
    setForm({ name: '', description: '', startDate: '', endDate: '', status: 'PLANNED' });
    setShowModal(true);
  };

  const getProgress = (tasks: { id: string; status: string }[]) => {
    if (tasks.length === 0) return 0;
    const done = tasks.filter(t => t.status === 'DONE').length;
    return Math.round((done / tasks.length) * 100);
  };

  const filtered = filterStatus === 'ALL' ? projects : projects.filter(p => p.status === filterStatus);

  // Summary metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'ACTIVE').length;
  const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
  const totalTasks = projects.reduce((sum, p) => sum + p.tasks.length, 0);

  return (
    <div style={{ padding: '32px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Operaciones</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px' }}>Gestiona tus proyectos, tareas y flujos de trabajo</p>
        </div>
        <button
          onClick={openNew}
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
            transition: 'all 0.2s ease',
          }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo Proyecto
        </button>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total Proyectos', value: totalProjects, icon: '📋', color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
          { label: 'Activos', value: activeProjects, icon: '🚀', color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
          { label: 'Completados', value: completedProjects, icon: '✅', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
          { label: 'Total Tareas', value: totalTasks, icon: '📝', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
        ].map((m, i) => (
          <div key={i} style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px 24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
            border: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px',
            }}>{m.icon}</div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: m.color }}>{m.value}</div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['ALL', 'PLANNED', 'ACTIVE', 'COMPLETED', 'ON_HOLD'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{
            padding: '8px 18px', borderRadius: '20px', border: '1px solid',
            borderColor: filterStatus === s ? '#6366f1' : '#e2e8f0',
            background: filterStatus === s ? 'rgba(99,102,241,0.08)' : 'white',
            color: filterStatus === s ? '#6366f1' : '#64748b',
            fontSize: '13px', fontWeight: '500', cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}>
            {s === 'ALL' ? 'Todos' : statusLabels[s]}
          </button>
        ))}
      </div>

      {/* Project Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px', color: '#94a3b8' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px', animation: 'pulse 2s infinite' }}>⏳</div>
          Cargando proyectos...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 32px',
          background: 'white', borderRadius: '20px', border: '2px dashed #e2e8f0',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏗️</div>
          <h3 style={{ color: '#475569', fontSize: '18px', marginBottom: '8px' }}>No hay proyectos aún</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>Crea tu primer proyecto para comenzar a gestionar operaciones</p>
          <button onClick={openNew} style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px',
            fontSize: '14px', fontWeight: '600', cursor: 'pointer',
          }}>
            Crear Primer Proyecto
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filtered.map(project => {
            const progress = getProgress(project.tasks);
            const todoCount = project.tasks.filter(t => t.status === 'TODO').length;
            const inProgressCount = project.tasks.filter(t => t.status === 'IN_PROGRESS').length;
            const doneCount = project.tasks.filter(t => t.status === 'DONE').length;

            return (
              <div key={project.id} style={{
                background: 'white', borderRadius: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                border: '1px solid #f1f5f9', overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
                }}
              >
                {/* Card Header with gradient accent */}
                <div style={{
                  height: '4px',
                  background: project.status === 'ACTIVE' ? 'linear-gradient(90deg, #22c55e, #16a34a)' :
                    project.status === 'COMPLETED' ? 'linear-gradient(90deg, #3b82f6, #2563eb)' :
                    project.status === 'ON_HOLD' ? 'linear-gradient(90deg, #f59e0b, #d97706)' :
                    'linear-gradient(90deg, #8b5cf6, #6366f1)',
                }} />

                <div style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <Link href={`/operaciones/proyectos/${project.id}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '650', color: '#1e293b', margin: 0, lineHeight: '1.4' }}>{project.name}</h3>
                    </Link>
                    <span style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                      whiteSpace: 'nowrap', ...(statusColors[project.status]
                        ? Object.fromEntries(statusColors[project.status].split('; ').map(s => { const [k, v] = s.split(': '); return [k, v]; }))
                        : {}),
                    }}>
                      {statusLabels[project.status] || project.status}
                    </span>
                  </div>

                  {project.description && (
                    <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 16px', lineHeight: '1.5',
                      overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {project.description}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>Progreso</span>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>{progress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${progress}%`, height: '100%', borderRadius: '3px',
                        background: progress === 100 ? 'linear-gradient(90deg, #22c55e, #16a34a)' : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>

                  {/* Task Summary */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8', display: 'inline-block' }} />
                      {todoCount} Por hacer
                    </div>
                    <div style={{ fontSize: '12px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                      {inProgressCount} En curso
                    </div>
                    <div style={{ fontSize: '12px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                      {doneCount} Listas
                    </div>
                  </div>

                  {/* Dates & Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {project.startDate && <>📅 {new Date(project.startDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}</>}
                      {project.endDate && <> → {new Date(project.endDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}</>}
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <Link href={`/operaciones/proyectos/${project.id}`} style={{
                        width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'white', cursor: 'pointer', textDecoration: 'none', color: '#64748b',
                        transition: 'all 0.15s ease',
                      }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/></svg>
                      </Link>
                      <button onClick={(e) => { e.stopPropagation(); openEdit(project); }} style={{
                        width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'white', cursor: 'pointer', color: '#64748b',
                        transition: 'all 0.15s ease',
                      }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }} style={{
                        width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #fee2e2',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'white', cursor: 'pointer', color: '#ef4444',
                        transition: 'all 0.15s ease',
                      }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '520px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)', animation: 'slideUp 0.3s ease',
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: '0 0 24px' }}>
              {editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Nombre *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Nombre del proyecto"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0',
                    fontSize: '14px', outline: 'none', transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Descripción</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Descripción del proyecto"
                  rows={3}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0',
                    fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Fecha Inicio</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Fecha Fin</label>
                  <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              {editingProject && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Estado</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}>
                    <option value="PLANNED">Planificado</option>
                    <option value="ACTIVE">Activo</option>
                    <option value="COMPLETED">Completado</option>
                    <option value="ON_HOLD">En Pausa</option>
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
              <button onClick={() => setShowModal(false)} style={{
                padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0',
                background: 'white', color: '#64748b', fontSize: '14px', fontWeight: '500', cursor: 'pointer',
              }}>Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.name.trim()} style={{
                padding: '10px 24px', borderRadius: '10px', border: 'none',
                background: saving || !form.name.trim() ? '#cbd5e1' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white', fontSize: '14px', fontWeight: '600', cursor: saving ? 'default' : 'pointer',
                boxShadow: saving || !form.name.trim() ? 'none' : '0 4px 12px rgba(99,102,241,0.3)',
              }}>
                {saving ? 'Guardando...' : editingProject ? 'Actualizar' : 'Crear Proyecto'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
