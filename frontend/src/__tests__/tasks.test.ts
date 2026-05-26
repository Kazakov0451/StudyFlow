import { 
  getTasks, 
  getTask, 
  createTask, 
  updateTask, 
  deleteTask 
} from '../api/tasks';
import { TaskStatus, TaskPriority } from '../types/task';

const STORAGE_KEY = 'studyflow_tasks';

describe('Tasks API', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getTasks', () => {
    it('should return initial demo tasks when localStorage is empty', async () => {
      const tasks = await getTasks();
      expect(tasks.length).toBe(5);
      expect(tasks[0].title).toBe('Подготовить реферат по экономике');
    });

    it('should return tasks from localStorage if they exist', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Test task',
          description: null,
          deadline: null,
          status: TaskStatus.PENDING,
          priority: TaskPriority.HIGH,
          created_at: new Date().toISOString(),
          updated_at: null,
        }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockTasks));
      
      const tasks = await getTasks();
      expect(tasks.length).toBe(1);
      expect(tasks[0].title).toBe('Test task');
    });

    it('should filter tasks by status', async () => {
      await getTasks(); // Initialize with demo data
      const completedTasks = await getTasks(TaskStatus.COMPLETED);
      expect(completedTasks.every(t => t.status === TaskStatus.COMPLETED)).toBe(true);
    });
  });

  describe('getTask', () => {
    it('should return a task by id', async () => {
      await getTasks(); // Initialize demo data
      const task = await getTask(1);
      expect(task.id).toBe(1);
      expect(task.title).toBe('Подготовить реферат по экономике');
    });

    it('should throw error for non-existent task', async () => {
      await expect(getTask(999)).rejects.toThrow('Задача не найдена');
    });
  });

  describe('createTask', () => {
    it('should create a new task with generated id', async () => {
      await getTasks(); // Initialize
      const newTask = await createTask({
        title: 'New test task',
        description: 'Test description',
        priority: TaskPriority.HIGH,
      });

      expect(newTask.id).toBe(6); // 5 demo tasks + 1
      expect(newTask.title).toBe('New test task');
      expect(newTask.status).toBe(TaskStatus.PENDING);
      expect(newTask.priority).toBe(TaskPriority.HIGH);
    });

    it('should handle task without optional fields', async () => {
      const newTask = await createTask({
        title: 'Minimal task',
      });

      expect(newTask.description).toBeNull();
      expect(newTask.deadline).toBeNull();
      expect(newTask.priority).toBe(TaskPriority.MEDIUM);
    });

    it('should persist task to localStorage', async () => {
      await createTask({ title: 'Persisted task' });
      
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      expect(stored.some((t: any) => t.title === 'Persisted task')).toBe(true);
    });
  });

  describe('updateTask', () => {
    it('should update task fields', async () => {
      await getTasks(); // Initialize demo data
      const updated = await updateTask(1, { 
        title: 'Updated title',
        status: TaskStatus.COMPLETED 
      });

      expect(updated.title).toBe('Updated title');
      expect(updated.status).toBe(TaskStatus.COMPLETED);
      expect(updated.updated_at).not.toBeNull();
    });

    it('should throw error for non-existent task', async () => {
      await expect(updateTask(999, { title: 'Test' })).rejects.toThrow('Задача не найдена');
    });
  });

  describe('deleteTask', () => {
    it('should remove task from storage', async () => {
      await getTasks(); // Initialize demo data
      await deleteTask(1);
      
      const tasks = await getTasks();
      expect(tasks.find(t => t.id === 1)).toBeUndefined();
    });

    it('should handle deleting non-existent task gracefully', async () => {
      await expect(deleteTask(999)).resolves.not.toThrow();
    });
  });
});
