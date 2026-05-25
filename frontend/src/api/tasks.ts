import { Task, TaskCreate, TaskUpdate, TaskPriority, TaskStatus } from '../types/task';

const STORAGE_KEY = 'studyflow_tasks';

// Demo data for development & testing. Stored in localStorage to simulate a working backend before the real API is connected.
const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Подготовить реферат по экономике',
    description: 'Найти 5 источников, написать введение и 2 главы',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
  },
  {
    id: 2,
    title: 'Сделать лабораторную работу №3',
    description: 'Реализовать сортировку массива и сделать отчет',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
  },
  {
    id: 3,
    title: 'Подготовиться к коллоквиуму по матанализу',
    description: 'Повторить пределы, производные, интегралы',
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
  },
  {
    id: 4,
    title: 'Написать конспект лекций по философии',
    description: 'Лекции 5–8, оформить в тетради',
    deadline: null,
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.LOW,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    title: 'Сдать курсовую работу',
    description: 'Проверить оформление, распечатать, сшить',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
  },
];

const getStoredTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Task[];
  } catch {
    // ignore
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTasks));
  return initialTasks;
};

const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getTasks = async (status?: string): Promise<Task[]> => {
  await delay(300);
  let tasks = getStoredTasks();
  if (status) {
    tasks = tasks.filter(t => t.status === status);
  }
  return tasks;
};

export const getTask = async (id: number): Promise<Task> => {
  await delay(200);
  const task = getStoredTasks().find(t => t.id === id);
  if (!task) throw new Error('Задача не найдена');
  return task;
};

export const createTask = async (task: TaskCreate): Promise<Task> => {
  await delay(200);
  const tasks = getStoredTasks();
  const newTask: Task = {
    id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
    title: task.title,
    description: task.description || null,
    deadline: task.deadline || null,
    status: task.status || TaskStatus.PENDING,
    priority: task.priority || TaskPriority.MEDIUM,
    created_at: new Date().toISOString(),
    updated_at: null,
  };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
};

export const updateTask = async (id: number, task: TaskUpdate): Promise<Task> => {
  await delay(200);
  const tasks = getStoredTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) throw new Error('Задача не найдена');
  tasks[idx] = { ...tasks[idx], ...task, updated_at: new Date().toISOString() };
  saveTasks(tasks);
  return tasks[idx];
};

export const deleteTask = async (id: number): Promise<void> => {
  await delay(200);
  const tasks = getStoredTasks().filter(t => t.id !== id);
  saveTasks(tasks);
};
