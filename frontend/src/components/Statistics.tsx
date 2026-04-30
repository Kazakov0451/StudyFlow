import React from 'react';
import { Task, TaskStatus, TaskPriority } from '../types/task';
import './Statistics.css';

interface StatisticsProps {
  tasks: Task[];
}

const Statistics: React.FC<StatisticsProps> = ({ tasks }) => {
  const total = tasks.length;
  const pending = tasks.filter(t => t.status === TaskStatus.PENDING).length;
  const inProgress = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const overdue = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== TaskStatus.COMPLETED).length;

  const highPriority = tasks.filter(t => t.priority === TaskPriority.HIGH).length;
  const mediumPriority = tasks.filter(t => t.priority === TaskPriority.MEDIUM).length;
  const lowPriority = tasks.filter(t => t.priority === TaskPriority.LOW).length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    { label: 'Всего задач', value: total, color: '#667eea', icon: '📋' },
    { label: 'К выполнению', value: pending, color: '#f6ad55', icon: '⏳' },
    { label: 'В процессе', value: inProgress, color: '#63b3ed', icon: '🔄' },
    { label: 'Выполнено', value: completed, color: '#48bb78', icon: '✅' },
    { label: 'Просрочено', value: overdue, color: '#fc8181', icon: '⚠️' },
    { label: 'Выполнение', value: `${completionRate}%`, color: '#9f7aea', icon: '📊' },
  ];

  const priorityStats = [
    { label: 'Высокий', value: highPriority, color: '#fc8181' },
    { label: 'Средний', value: mediumPriority, color: '#f6ad55' },
    { label: 'Низкий', value: lowPriority, color: '#68d391' },
  ];

  return (
    <div className="statistics">
      <h2>Статистика</h2>
      <div className="stats-grid">
        {stats.map(stat => (
          <div key={stat.label} className="stat-card" style={{ borderTopColor: stat.color }}>
            <span className="stat-icon">{stat.icon}</span>
            <div className="stat-info">
              <span className="stat-value" style={{ color: stat.color }}>{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div className="priority-breakdown">
          <h3>По приоритетам</h3>
          <div className="priority-bars">
            {priorityStats.map(p => (
              <div key={p.label} className="priority-item">
                <span className="priority-label">{p.label}</span>
                <div className="priority-bar-bg">
                  <div
                    className="priority-bar-fill"
                    style={{
                      width: total > 0 ? `${(p.value / total) * 100}%` : '0%',
                      backgroundColor: p.color,
                    }}
                  />
                </div>
                <span className="priority-value">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;
