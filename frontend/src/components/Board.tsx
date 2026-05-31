import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types/task';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useToast } from './Toast';
import Statistics from './Statistics';
import './Board.css';

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: TaskStatus.PENDING, title: 'К выполнению' },
  { status: TaskStatus.IN_PROGRESS, title: 'В процессе' },
  { status: TaskStatus.COMPLETED, title: 'Выполнено' },
];

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.HIGH]: 'Высокий',
  [TaskPriority.MEDIUM]: 'Средний',
  [TaskPriority.LOW]: 'Низкий',
};

type SortOption = 'deadline' | 'created_at' | 'priority';

const DroppableColumn: React.FC<{ status: TaskStatus; children: React.ReactNode }> = ({ status, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div ref={setNodeRef} className={`column ${isOver ? 'column-over' : ''}`} data-status={status}>
      {children}
    </div>
  );
};

const Board: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('created_at');
  const [showStats, setShowStats] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  const { addToast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Handle Escape key to close modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowForm(false);
        setEditingTask(null);
        setSelectedTask(null);
        setDeletingTask(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки задач');
      addToast('Не удалось загрузить задачи', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)));
    }
    if (filterStatus !== 'all') result = result.filter(t => t.status === filterStatus);
    if (filterPriority !== 'all') result = result.filter(t => t.priority === filterPriority);
    result.sort((a, b) => {
      if (sortBy === 'deadline') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === 'priority') {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return result;
  }, [tasks, searchQuery, filterStatus, filterPriority, sortBy]);

  const handleCreate = async (taskData: { title: string; description?: string; deadline?: string; priority: TaskPriority }) => {
    await createTask(taskData);
    setShowForm(false);
    fetchTasks();
    addToast('Задача создана', 'success');
  };

  const handleUpdate = async (taskData: { title: string; description?: string; deadline?: string; priority: TaskPriority }) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
      setEditingTask(null);
      fetchTasks();
      addToast('Задача обновлена', 'success');
    }
  };

  const handleDelete = async (id: number) => {
    await deleteTask(id);
    setDeletingTask(null);
    fetchTasks();
    if (selectedTask?.id === id) setSelectedTask(null);
    addToast('Задача удалена', 'info');
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const taskId = Number(active.id);
    const newStatus = over.id as TaskStatus;
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      await updateTask(taskId, { status: newStatus });
      fetchTasks();
      addToast(`Задача перемещена в "${COLUMNS.find(c => c.status === newStatus)?.title}"`, 'success');
      if (selectedTask?.id === taskId) setSelectedTask({ ...task, status: newStatus });
    }
  };

  const hasActiveFilters = searchQuery || filterStatus !== 'all' || filterPriority !== 'all';

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Загрузка задач...</p>
    </div>
  );
  if (error) return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <p>{error}</p>
      <button className="btn-primary" onClick={fetchTasks}>Попробовать снова</button>
    </div>
  );

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className={`board ${darkMode ? 'dark' : ''}`}>
        <div className="board-header">
          <div className="header-left">
            <h1>StudyFlow</h1>
            <button className="btn-icon theme-toggle" onClick={() => setDarkMode(!darkMode)} title={darkMode ? 'Светлая тема' : 'Тёмная тема'}>
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
          <div className="header-actions">
            <button className={`btn-secondary ${showStats ? 'active' : ''}`} onClick={() => setShowStats(!showStats)} aria-label="Показать/скрыть статистику">📊 Статистика</button>
            <button className="btn-primary" onClick={() => setShowForm(true)} aria-label="Создать новую задачу">+ Новая задача</button>
          </div>
        </div>

        {showStats && <Statistics tasks={tasks} />}

        <div className="toolbar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Поиск задач..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="filters">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as TaskStatus | 'all')} className="filter-select">
              <option value="all">Все статусы</option>
              <option value={TaskStatus.PENDING}>К выполнению</option>
              <option value={TaskStatus.IN_PROGRESS}>В процессе</option>
              <option value={TaskStatus.COMPLETED}>Выполнено</option>
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value as TaskPriority | 'all')} className="filter-select">
              <option value="all">Все приоритеты</option>
              <option value={TaskPriority.HIGH}>Высокий</option>
              <option value={TaskPriority.MEDIUM}>Средний</option>
              <option value={TaskPriority.LOW}>Низкий</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)} className="filter-select">
              <option value="created_at">По дате создания</option>
              <option value="deadline">По дедлайну</option>
              <option value="priority">По приоритету</option>
            </select>
            {hasActiveFilters && (
              <button className="btn-clear-filters" onClick={() => { setSearchQuery(''); setFilterStatus('all'); setFilterPriority('all'); }}>Сбросить</button>
            )}
          </div>
        </div>

        {showForm && <TaskForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}
        {editingTask && <TaskForm task={editingTask} onSubmit={handleUpdate} onCancel={() => setEditingTask(null)} />}
        {selectedTask && (
          <TaskDetail
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onEdit={() => { setEditingTask(selectedTask); setSelectedTask(null); }}
            onDelete={() => { setDeletingTask(selectedTask); setSelectedTask(null); }}
          />
        )}
        {deletingTask && (
          <ConfirmModal
            title="Удалить задачу?"
            message={`Задача "${deletingTask.title}" будет удалена безвозвратно.`}
            onConfirm={() => handleDelete(deletingTask.id)}
            onCancel={() => setDeletingTask(null)}
            confirmText="Удалить"
            confirmClass="btn-danger"
          />
        )}

        {filteredTasks.length === 0 && tasks.length === 0 ? (
          <EmptyState onCreateTask={() => setShowForm(true)} />
        ) : filteredTasks.length === 0 ? (
          <div className="no-results">
            <span className="no-results-icon">🔍</span>
            <p>Ничего не найдено</p>
            <button className="btn-clear-filters" onClick={() => { setSearchQuery(''); setFilterStatus('all'); setFilterPriority('all'); }}>Сбросить фильтры</button>
          </div>
        ) : (
          <div className="columns">
            {COLUMNS.map(col => {
              const columnTasks = filteredTasks.filter(t => t.status === col.status);
              return (
                <DroppableColumn key={col.status} status={col.status}>
                  <div className="column-header">
                    <h2>{col.title}</h2>
                    <span className="count">{columnTasks.length}</span>
                  </div>
                  <SortableContext items={columnTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    <div className="column-tasks">
                      {columnTasks.map(task => (
                        <TaskCard key={task.id} task={task} onSelect={() => setSelectedTask(task)} onEdit={() => setEditingTask(task)} onDelete={() => setDeletingTask(task)} />
                      ))}
                    </div>
                  </SortableContext>
                </DroppableColumn>
              );
            })}
          </div>
        )}
      </div>
    </DndContext>
  );
};

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: { title: string; description?: string; deadline?: string; priority: TaskPriority }) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [deadline, setDeadline] = useState(task?.deadline ? task.deadline.slice(0, 16) : '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || TaskPriority.MEDIUM);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description: description || undefined, deadline: deadline || undefined, priority });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{task ? 'Редактировать задачу' : 'Новая задача'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Название</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Введите название задачи" /></div>
          <div className="form-group"><label>Описание</label><textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Описание задачи (необязательно)" rows={3} /></div>
          <div className="form-group"><label>Дедлайн</label><input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} /></div>
          <div className="form-group">
            <label>Приоритет</label>
            <div className="priority-options">
              {Object.values(TaskPriority).map(p => (
                <button key={p} type="button" className={`priority-option ${priority === p ? `active ${p}` : ''}`} onClick={() => setPriority(p)}>{PRIORITY_LABELS[p]}</button>
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>Отмена</button>
            <button type="submit" className="btn-primary">{task ? 'Сохранить' : 'Создать'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface TaskCardProps {
  task: Task;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onSelect, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== TaskStatus.COMPLETED;
  const priorityColors: Record<TaskPriority, string> = { high: '#fc8181', medium: '#f6ad55', low: '#68d391' };

  return (
    <div ref={setNodeRef} style={style} className={`task-card ${isOverdue ? 'overdue' : ''} ${isDragging ? 'dragging' : ''}`}>
      <div className="task-card-header">
        <h3 {...attributes} {...listeners} onClick={onSelect} className="task-title-clickable">{task.title}</h3>
        <div className="task-actions">
          <button className="btn-icon" onClick={(e) => { e.stopPropagation(); onEdit(); }} title="Редактировать">✎</button>
          <button className="btn-icon delete" onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Удалить">✕</button>
        </div>
      </div>
      <div className="task-card-priority" style={{ backgroundColor: priorityColors[task.priority] }} />
      {task.description && <p className="task-description">{task.description}</p>}
      <div className="task-footer">
        <div className="task-meta">
          {task.deadline && <span className={`deadline ${isOverdue ? 'overdue' : ''}`}>⏰ {formatDate(task.deadline)}</span>}
          <span className={`priority-badge ${task.priority}`}>{PRIORITY_LABELS[task.priority]}</span>
        </div>
      </div>
      <div className="drag-handle" {...attributes} {...listeners}>⋮⋮</div>
    </div>
  );
};

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ task, onClose, onEdit, onDelete }) => {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== TaskStatus.COMPLETED;
  const statusLabels: Record<TaskStatus, string> = { [TaskStatus.PENDING]: 'К выполнению', [TaskStatus.IN_PROGRESS]: 'В процессе', [TaskStatus.COMPLETED]: 'Выполнено' };
  const priorityColors: Record<TaskPriority, string> = { high: '#fc8181', medium: '#f6ad55', low: '#68d391' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal task-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="task-detail-header">
          <div className="task-detail-title-row">
            <div className="priority-dot" style={{ backgroundColor: priorityColors[task.priority] }} />
            <h2>{task.title}</h2>
          </div>
          <button className="btn-icon close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="task-detail-meta">
          <div className="meta-item"><span className="meta-label">Статус</span><span className={`status-badge ${task.status}`}>{statusLabels[task.status]}</span></div>
          <div className="meta-item"><span className="meta-label">Приоритет</span><span className={`priority-badge ${task.priority}`}>{PRIORITY_LABELS[task.priority]}</span></div>
          {task.deadline && <div className="meta-item"><span className="meta-label">Дедлайн</span><span className={`deadline ${isOverdue ? 'overdue' : ''}`}>{formatDate(task.deadline)}</span></div>}
          <div className="meta-item"><span className="meta-label">Создано</span><span className="date">{formatDate(task.created_at)}</span></div>
        </div>
        {task.description && <div className="task-detail-description"><h3>Описание</h3><p>{task.description}</p></div>}
        <div className="task-detail-actions">
          <button className="btn-secondary" onClick={onEdit}>Редактировать</button>
          <button className="btn-danger" onClick={onDelete}>Удалить</button>
        </div>
      </div>
    </div>
  );
};

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  confirmClass?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ title, message, onConfirm, onCancel, confirmText = 'Подтвердить', confirmClass = 'btn-primary' }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
      <h2>{title}</h2>
      <p className="confirm-message">{message}</p>
      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>Отмена</button>
        <button className={confirmClass} onClick={onConfirm}>{confirmText}</button>
      </div>
    </div>
  </div>
);

const EmptyState: React.FC<{ onCreateTask: () => void }> = ({ onCreateTask }) => (
  <div className="empty-state">
    <div className="empty-state-icon">📝</div>
    <h2>Пока нет задач</h2>
    <p>Создайте свою первую задачу, чтобы начать планирование учёбы</p>
    <button className="btn-primary" onClick={onCreateTask}>+ Создать задачу</button>
  </div>
);

export default Board;
