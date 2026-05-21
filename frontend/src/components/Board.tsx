import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../types/task';
import './Board.css';

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: TaskStatus.PENDING, title: 'К выполнению' },
  { status: TaskStatus.IN_PROGRESS, title: 'В процессе' },
  { status: TaskStatus.COMPLETED, title: 'Выполнено' },
];

const Board: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Заглушка: в следующем спринте здесь будет API-запрос к бэкенду
    const fetchTasks = async () => {
      try {
        setLoading(true);
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Бэкенд ещё не реализован — показываем ошибку
        setError('Ошибка загрузки задач');
        setTasks([]);
      } catch (err) {
        setError('Ошибка загрузки задач');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="board">
      <div className="board-header">
        <h1>StudyFlow</h1>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="columns">
        {COLUMNS.map(col => (
          <div key={col.status} className="column">
            <div className="column-header">
              <h2>{col.title}</h2>
              <span className="count">
                {tasks.filter(t => t.status === col.status).length}
              </span>
            </div>
            <div className="column-tasks">
              {tasks
                .filter(t => t.status === col.status)
                .map(task => (
                  <div key={task.id} className="task-card">
                    <h3>{task.title}</h3>
                    {task.deadline && (
                      <span className="deadline">
                        ⏰ {new Date(task.deadline).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;
