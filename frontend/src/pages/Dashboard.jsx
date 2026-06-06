import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import TaskFilter from '../components/TaskFilter';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import { getAllTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import { Plus, ClipboardList, Sparkles, AlertCircle, X, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Views
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');
  const [viewMode, setViewMode] = useState('KANBAN'); // KANBAN or GRID

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null); // Null for create, Task object for edit

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch tasks. Please verify your connection to the database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // CRUD Handlers
  const handleOpenCreateModal = () => {
    setCurrentTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (taskData) => {
    try {
      if (currentTask) {
        // Edit flow
        const updated = await updateTask(currentTask.id, taskData);
        setTasks((prev) => prev.map((t) => (t.id === currentTask.id ? updated : t)));
      } else {
        // Create flow
        const created = await createTask(taskData);
        setTasks((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Error saving task. Please try again.');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
      alert('Error deleting task.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const targetTask = tasks.find((t) => t.id === id);
    if (!targetTask) return;

    // Optimistic UI update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );

    try {
      await updateTask(id, {
        title: targetTask.title,
        description: targetTask.description,
        priority: targetTask.priority,
        status: newStatus,
        dueDate: targetTask.dueDate,
        estimatedTime: targetTask.estimatedTime,
      });
    } catch (err) {
      console.error(err);
      // Revert if API fails
      setTasks(previousTasks);
      alert('Failed to update task status.');
    }
  };

  // Filter & Sort Logic
  const getFilteredTasks = () => {
    return tasks
      .filter((task) => {
        const matchesSearch =
          task.title.toLowerCase().includes(search.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(search.toLowerCase()));

        const matchesPriority =
          priorityFilter === 'ALL' || task.priority === priorityFilter;

        return matchesSearch && matchesPriority;
      })
      .sort((a, b) => {
        if (sortBy === 'NEWEST') {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (sortBy === 'OLDEST') {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
        if (sortBy === 'DUE_ASC') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        if (sortBy === 'DUE_DESC') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(b.dueDate) - new Date(a.dueDate);
        }
        return 0;
      });
  };

  const filteredTasks = getFilteredTasks();

  // Tasks grouped by status (for Kanban Board)
  const todoTasks = filteredTasks.filter((t) => t.status === 'TODO');
  const progressTasks = filteredTasks.filter((t) => t.status === 'IN_PROGRESS');
  const doneTasks = filteredTasks.filter((t) => t.status === 'DONE');

  return (
    <Layout>
      {/* Upper Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Workspace
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Organize tasks, track status, and generate subtasks with AI helpers.
          </p>
        </div>
        
        {/* Create Task Button */}
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filters & Control bar */}
      <TaskFilter
        search={search}
        setSearch={setSearch}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Core Panels: Loading, Error, Empty, Dashboard */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <span className="font-semibold text-sm">Loading task workspace...</span>
        </div>
      ) : error ? (
        <div className="bg-rose-500/5 border border-rose-500/15 rounded-2xl p-6 text-center max-w-lg mx-auto my-10 flex flex-col items-center gap-3">
          <AlertCircle className="h-10 w-10 text-rose-400" />
          <h3 className="font-bold text-white text-lg">Failed to load</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
          <button
            onClick={fetchTasks}
            className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg border border-slate-700 text-xs transition-colors"
          >
            Retry Connection
          </button>
        </div>
      ) : tasks.length === 0 ? (
        /* Entirely Empty Workspace */
        <div className="border border-dashed border-slate-800 rounded-2xl py-24 text-center max-w-xl mx-auto flex flex-col items-center gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-full text-slate-500">
            <ClipboardList className="h-10 w-10" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg mb-1">Your board is empty</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
              Create your first task or use the AI generation helpers to pre-fill detailed specs instantly.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add Task</span>
          </button>
        </div>
      ) : (
        /* Active Board Container */
        <>
          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No tasks matched your search or filters.
            </div>
          )}

          {viewMode === 'KANBAN' ? (
            /* Kanban Board View */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              
              {/* Column 1: TODO */}
              <div className="bg-slate-950/40 border border-slate-850/60 rounded-2xl p-4 flex flex-col min-h-[500px]">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-850">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                    <h2 className="font-bold text-slate-200">To Do</h2>
                  </div>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                    {todoTasks.length}
                  </span>
                </div>
                <div className="space-y-4 flex-1">
                  {todoTasks.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onEdit={handleOpenEditModal}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                  {todoTasks.length === 0 && (
                    <div className="h-32 border border-dashed border-slate-850 rounded-xl flex items-center justify-center text-xs text-slate-600 italic">
                      No tasks
                    </div>
                  )}
                </div>
              </div>

              {/* Column 2: IN_PROGRESS */}
              <div className="bg-slate-950/40 border border-slate-850/60 rounded-2xl p-4 flex flex-col min-h-[500px]">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-850">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                    <h2 className="font-bold text-slate-200">In Progress</h2>
                  </div>
                  <span className="text-xs bg-indigo-950/60 text-indigo-400 border border-indigo-900/30 px-2 py-0.5 rounded-full font-bold">
                    {progressTasks.length}
                  </span>
                </div>
                <div className="space-y-4 flex-1">
                  {progressTasks.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onEdit={handleOpenEditModal}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                  {progressTasks.length === 0 && (
                    <div className="h-32 border border-dashed border-slate-850 rounded-xl flex items-center justify-center text-xs text-slate-600 italic">
                      No tasks
                    </div>
                  )}
                </div>
              </div>

              {/* Column 3: DONE */}
              <div className="bg-slate-950/40 border border-slate-850/60 rounded-2xl p-4 flex flex-col min-h-[500px]">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-850">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <h2 className="font-bold text-slate-200">Completed</h2>
                  </div>
                  <span className="text-xs bg-emerald-950/60 text-emerald-400 border border-emerald-900/30 px-2 py-0.5 rounded-full font-bold">
                    {doneTasks.length}
                  </span>
                </div>
                <div className="space-y-4 flex-1">
                  {doneTasks.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onEdit={handleOpenEditModal}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                  {doneTasks.length === 0 && (
                    <div className="h-32 border border-dashed border-slate-850 rounded-xl flex items-center justify-center text-xs text-slate-600 italic">
                      No tasks
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            /* Grid Layout View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Task Creation/Editing Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl relative overflow-hidden animate-zoom-in">
            
            {/* Modal Glow Accent */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-850">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {currentTask ? 'Edit Task Details' : 'Create New Task'}
                {!currentTask && (
                  <span className="flex items-center gap-1 text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-2 py-0.5 rounded-full font-semibold">
                    <Sparkles className="h-3 w-3" />
                    AI Ready
                  </span>
                )}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <TaskForm
                task={currentTask}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsModalOpen(false)}
              />
            </div>

          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
