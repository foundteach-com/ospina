'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
}

interface TaskData {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: string;
  assignedTo: string | null;
  checklists: ChecklistItem[];
}

interface ProjectData {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  tasks: TaskData[];
}

const columns = [
  { key: 'TODO', label: 'Por Hacer', color: '#94a3b8', bg: '#f8fafc', accent: '#e2e8f0' },
  { key: 'IN_PROGRESS', label: 'En Progreso', color: '#f59e0b', bg: '#fffbeb', accent: '#fde68a' },
  { key: 'DONE', label: 'Completado', color: '#22c55e', bg: '#f0fdf4', accent: '#bbf7d0' },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '', status: 'TODO', assignedTo: '' });
  const [saving, setSaving] = useState(false);
  const [checklistInput, setChecklistInput] = useState('');
  const [activeChecklistTaskId, setActiveChecklistTaskId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colKey) setDragOverCol(colKey);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverCol(null);
  };

  const handleDrop = async (e: React.DragEvent, colKey: string) => {
    e.preventDefault();
    setDragOverCol(null);
    if (!draggedTaskId) return;
    const task = project?.tasks.find(t => t.id === draggedTaskId);
    if (task && task.status !== colKey) {
      await handleMoveTask(draggedTaskId, colKey);
    }
    setDraggedTaskId(null);
  };

  const handleSaveTask = async () => {
    if (!taskForm.title.trim()) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      const url = editingTask
        ? `${process.env.NEXT_PUBLIC_API_URL}/operations/tasks/${editingTask.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/operations/tasks`;
      const method = editingTask ? 'PATCH' : 'POST';

      const body: Record<string, unknown> = {
        title: taskForm.title,
        description: taskForm.description || undefined,
        dueDate: taskForm.dueDate || undefined,
        status: taskForm.status,
        assignedTo: taskForm.assignedTo || undefined,
      };
      if (!editingTask) body.projectId = projectId;

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      setShowTaskModal(false);
      setEditingTask(null);
      setTaskForm({ title: '', description: '', dueDate: '', status: 'TODO', assignedTo: '' });
      fetchProject();
    } catch (err) {
      console.error('Error saving task:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleMoveTask = async (taskId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchProject();
    } catch (err) {
      console.error('Error moving task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProject();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const openEditTask = (task: TaskData) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      status: task.status,
      assignedTo: task.assignedTo || '',
    });
    setShowTaskModal(true);
  };

  const openNewTask = (status: string = 'TODO') => {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', dueDate: '', status, assignedTo: '' });
    setShowTaskModal(true);
  };

  const handleAddChecklist = async (taskId: string) => {
    if (!checklistInput.trim()) return;
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/checklists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: checklistInput, taskId }),
      });
      setChecklistInput('');
      setActiveChecklistTaskId(null);
      fetchProject();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleToggleChecklist = async (checklistId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/checklists/${checklistId}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProject();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleDeleteChecklist = async (checklistId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operations/checklists/${checklistId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProject();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: '#94a3b8' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px', animation: 'pulse 2s infinite' }}>⏳</div>
          Cargando proyecto...
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
        <p>Proyecto no encontrado</p>
        <Link href="/operaciones" style={{ color: '#6366f1' }}>Volver a Operaciones</Link>
      </div>
    );
  }

  const totalTasks = project.tasks.length;
  const doneTasks = project.tasks.filter(t => t.status === 'DONE').length;
  const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  return (
    <div style={{ padding: '32px', minHeight: '100vh' }}>
      {/* Breadcrumb & Header */}
      <div style={{ marginBottom: '28px' }}>
        <Link href="/operaciones" style={{
          color: '#6366f1', textDecoration: 'none', fontSize: '13px', fontWeight: '500',
          display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '16px',
        }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
          Volver a Operaciones
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#1e293b', margin: '0 0 6px' }}>{project.name}</h1>
            {project.description && <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{project.description}</p>}
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Progress Circle */}
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', position: 'relative',
              background: `conic-gradient(#6366f1 ${progress * 3.6}deg, #f1f5f9 0deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%', background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: '700', color: '#6366f1',
              }}>{progress}%</div>
            </div>

            <button onClick={() => openNewTask()} style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white', border: 'none', borderRadius: '12px', padding: '10px 20px',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nueva Tarea
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', minHeight: '400px' }}>
        {columns.map(col => {
          const colTasks = project.tasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} 
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.key)}
              style={{
              background: dragOverCol === col.key ? col.accent : col.bg, 
              borderRadius: '16px', padding: '16px',
              border: `2px ${dragOverCol === col.key ? 'dashed' : 'solid'} ${col.accent}`, minHeight: '300px',
              transition: 'all 0.2s ease',
            }}>
              {/* Column Header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '16px', padding: '0 4px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '10px', height: '10px', borderRadius: '50%', background: col.color,
                  }} />
                  <span style={{ fontSize: '14px', fontWeight: '650', color: '#334155' }}>{col.label}</span>
                  <span style={{
                    background: col.accent, color: col.color, fontSize: '11px', fontWeight: '700',
                    padding: '2px 8px', borderRadius: '10px',
                  }}>{colTasks.length}</span>
                </div>
                <button onClick={() => openNewTask(col.key)} style={{
                  width: '26px', height: '26px', borderRadius: '8px', border: `1px solid ${col.accent}`,
                  background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: col.color, fontSize: '16px', lineHeight: 1,
                }}>+</button>
              </div>

              {/* Task Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {colTasks.map(task => {
                  const checklistTotal = task.checklists.length;
                  const checklistDone = task.checklists.filter(c => c.isCompleted).length;
                  
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0)) && task.status !== 'DONE';
                  const isToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString() && task.status !== 'DONE';
                  const dateColor = isOverdue ? '#ef4444' : isToday ? '#f59e0b' : '#94a3b8';
                  
                  const assignedUser = users.find(u => u.id === task.assignedTo);
                  const isDragging = draggedTaskId === task.id;

                  return (
                    <div key={task.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={() => setDraggedTaskId(null)}
                      style={{
                      opacity: isDragging ? 0.5 : 1,
                      background: 'white', borderRadius: '12px', padding: '14px 16px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      border: '1px solid #f1f5f9', transition: 'all 0.2s ease',
                      cursor: 'default',
                    }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: 0, flex: 1 }}>{task.title}</h4>
                        <div style={{ display: 'flex', gap: '2px', marginLeft: '8px' }}>
                          <button onClick={() => openEditTask(task)} style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                            color: '#94a3b8', transition: 'color 0.15s',
                          }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#6366f1'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#94a3b8'}
                          >
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button onClick={() => handleDeleteTask(task.id)} style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                            color: '#94a3b8', transition: 'color 0.15s',
                          }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ef4444'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#94a3b8'}
                          >
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </div>

                      {task.description && (
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 8px', lineHeight: '1.4' }}>{task.description}</p>
                      )}

                      {/* Checklists */}
                      {task.checklists.length > 0 && (
                        <div style={{ marginBottom: '8px' }}>
                          {task.checklists.map(cl => (
                            <div key={cl.id} style={{
                              display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 0',
                              fontSize: '12px', color: cl.isCompleted ? '#94a3b8' : '#475569',
                            }}>
                              <input type="checkbox" checked={cl.isCompleted}
                                onChange={() => handleToggleChecklist(cl.id)}
                                style={{ cursor: 'pointer', accentColor: '#6366f1' }} />
                              <span style={{ textDecoration: cl.isCompleted ? 'line-through' : 'none', flex: 1 }}>{cl.title}</span>
                              <button onClick={() => handleDeleteChecklist(cl.id)} style={{
                                background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1',
                                padding: '0', fontSize: '10px', lineHeight: 1,
                              }}>✕</button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Checklist */}
                      {activeChecklistTaskId === task.id ? (
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                          <input
                            type="text"
                            value={checklistInput}
                            onChange={e => setChecklistInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddChecklist(task.id)}
                            placeholder="Nuevo ítem..."
                            autoFocus
                            style={{
                              flex: 1, padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0',
                              fontSize: '12px', outline: 'none',
                            }}
                          />
                          <button onClick={() => handleAddChecklist(task.id)} style={{
                            background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px',
                            padding: '4px 8px', fontSize: '11px', cursor: 'pointer',
                          }}>✓</button>
                          <button onClick={() => { setActiveChecklistTaskId(null); setChecklistInput(''); }} style={{
                            background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '6px',
                            padding: '4px 8px', fontSize: '11px', cursor: 'pointer',
                          }}>✕</button>
                        </div>
                      ) : (
                        <button onClick={() => setActiveChecklistTaskId(task.id)} style={{
                          background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                          fontSize: '11px', padding: '0', marginBottom: '6px',
                          display: 'flex', alignItems: 'center', gap: '4px',
                        }}>
                          <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          Agregar checklist
                        </button>
                      )}

                      {/* Footer: date, checklist count, move buttons */}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        borderTop: '1px solid #f8fafc', paddingTop: '8px', marginTop: '4px',
                      }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {task.dueDate && (
                            <span style={{ fontSize: '11px', color: dateColor, fontWeight: isOverdue || isToday ? '600' : 'normal', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              📅 {new Date(task.dueDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                            </span>
                          )}
                          {checklistTotal > 0 && (
                            <span style={{ fontSize: '11px', color: checklistDone === checklistTotal ? '#22c55e' : '#94a3b8' }}>
                              ☑ {checklistDone}/{checklistTotal}
                            </span>
                          )}
                        </div>

                        {/* Right side: User Avatar and Move Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {assignedUser && (
                            <div title={assignedUser.name || assignedUser.email} style={{
                              width: '24px', height: '24px', borderRadius: '50%', background: '#e2e8f0',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                              fontSize: '10px', fontWeight: 'bold', color: '#475569', border: '1px solid white',
                              boxShadow: '0 0 0 1px #e2e8f0'
                            }}>
                              {assignedUser.avatarUrl ? (
                                <img src={assignedUser.avatarUrl} alt={assignedUser.name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                (assignedUser.name || assignedUser.email).substring(0, 2).toUpperCase()
                              )}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '2px' }}>
                          {col.key !== 'TODO' && (
                            <button
                              onClick={() => handleMoveTask(task.id, columns[columns.findIndex(c => c.key === col.key) - 1].key)}
                              title="Mover atrás"
                              style={{
                                width: '22px', height: '22px', borderRadius: '6px', border: '1px solid #e2e8f0',
                                background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#94a3b8', fontSize: '10px',
                              }}
                            >◀</button>
                          )}
                          {col.key !== 'DONE' && (
                            <button
                              onClick={() => handleMoveTask(task.id, columns[columns.findIndex(c => c.key === col.key) + 1].key)}
                              title="Mover adelante"
                              style={{
                                width: '22px', height: '22px', borderRadius: '6px', border: '1px solid #e2e8f0',
                                background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#94a3b8', fontSize: '10px',
                              }}
                            >▶</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty state per column */}
                {colTasks.length === 0 && (
                  <div style={{
                    textAlign: 'center', padding: '32px 16px', color: '#cbd5e1',
                    border: '2px dashed #e2e8f0', borderRadius: '12px', fontSize: '13px',
                  }}>
                    Sin tareas
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setShowTaskModal(false)}>
          <div style={{
            background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '480px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)', animation: 'slideUp 0.3s ease',
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: '0 0 24px' }}>
              {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Título *</label>
                <input type="text" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="¿Qué hay que hacer?"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0',
                    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Descripción</label>
                <textarea value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Detalles de la tarea" rows={2}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0',
                    fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Fecha Límite</label>
                  <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Estado</label>
                  <select value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}>
                    <option value="TODO">Por Hacer</option>
                    <option value="IN_PROGRESS">En Progreso</option>
                    <option value="DONE">Completado</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px', marginTop: '12px' }}>Responsable</label>
                <select value={taskForm.assignedTo} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}>
                  <option value="">Sin asignar</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
              <button onClick={() => setShowTaskModal(false)} style={{
                padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0',
                background: 'white', color: '#64748b', fontSize: '14px', fontWeight: '500', cursor: 'pointer',
              }}>Cancelar</button>
              <button onClick={handleSaveTask} disabled={saving || !taskForm.title.trim()} style={{
                padding: '10px 24px', borderRadius: '10px', border: 'none',
                background: saving || !taskForm.title.trim() ? '#cbd5e1' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white', fontSize: '14px', fontWeight: '600', cursor: saving ? 'default' : 'pointer',
                boxShadow: saving || !taskForm.title.trim() ? 'none' : '0 4px 12px rgba(99,102,241,0.3)',
              }}>
                {saving ? 'Guardando...' : editingTask ? 'Actualizar' : 'Crear Tarea'}
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
