import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Clock, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { generateTaskDetails } from '../services/aiService';

const TaskForm = ({ task, onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('TODO');
  const [dueDate, setDueDate] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiMessage, setAiMessage] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'MEDIUM');
      setStatus(task.status || 'TODO');
      setDueDate(task.dueDate ? task.dueDate.substring(0, 16) : '');
      setEstimatedTime(task.estimatedTime || '');
    } else {
      // Set defaults for new task
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setStatus('TODO');
      setDueDate('');
      setEstimatedTime('');
    }
    setAiMessage(null);
    setErrors({});
  }, [task]);

  const handleAiGenerate = async () => {
    if (!title.trim()) {
      setErrors((prev) => ({ ...prev, title: 'Title is required to use AI generation' }));
      return;
    }

    setErrors((prev) => ({ ...prev, title: null }));
    setIsGenerating(true);
    setAiMessage(null);

    try {
      const result = await generateTaskDetails(title);
      
      setDescription(result.description || `Task details for: ${title}.`);
      setPriority(result.suggestedPriority || 'MEDIUM');
      setEstimatedTime(result.estimatedTime || '1 hour');

      setAiMessage({
        type: 'success',
        text: 'AI successfully populated description, priority, and estimated completion time!',
      });
    } catch (err) {
      console.error(err);
      // Fallback: Populate mock values directly in the frontend on failure!
      setDescription(`Task Description for "${title}":\n- Plan and prototype the task requirements.\n- Core implementation and styling tweaks.\n- Verification and testing.`);
      setPriority('HIGH');
      setEstimatedTime('2 hours');

      setAiMessage({
        type: 'error',
        text: 'Failed to connect to Gemini API. Using locally generated task framework.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      title,
      description,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      estimatedTime,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      
      {/* Title + AI Generator */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-1.5" htmlFor="title">
          Task Title *
        </label>
        <div className="flex gap-2">
          <input
            id="title"
            type="text"
            placeholder="e.g. Set up OAuth Authentication"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`flex-1 px-4 py-2.5 bg-slate-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-slate-500 transition-all ${
              errors.title ? 'border-rose-500 ring-rose-500/25 ring-2' : 'border-slate-700'
            }`}
          />
          <button
            type="button"
            onClick={handleAiGenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/10 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            title="Generate details with Gemini AI"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">AI Auto-Fill</span>
              </>
            )}
          </button>
        </div>
        {errors.title && <p className="text-rose-400 text-xs mt-1.5 font-medium">{errors.title}</p>}
      </div>

      {/* AI Success / Error Banner */}
      {aiMessage && (
        <div
          className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs leading-relaxed animate-fade-in ${
            aiMessage.type === 'success'
              ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/5 text-amber-400 border-amber-500/20'
          }`}
        >
          {aiMessage.type === 'success' ? (
            <Check className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
          )}
          <span>{aiMessage.text}</span>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-1.5" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          rows="5"
          placeholder="Describe the task parameters, instructions, and objectives..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-slate-500 transition-all font-mono text-sm leading-relaxed"
        />
      </div>

      {/* Priority, Status, Due Date Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Status */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5" htmlFor="priority">
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5" htmlFor="dueDate">
            Due Date & Time
          </label>
          <div className="relative">
            <input
              id="dueDate"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white appearance-none"
            />
          </div>
        </div>

      </div>

      {/* Estimated Effort (from AI or manual) */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-1.5" htmlFor="estimatedTime">
          Estimated Effort / Duration
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <Clock className="h-4 w-4" />
          </span>
          <input
            id="estimatedTime"
            type="text"
            placeholder="e.g. 3 hours, 2 days, 1 week"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-slate-500 transition-all"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-850">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border border-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-800 hover:text-white transition-all active:scale-95 text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/10 transition-all active:scale-95 text-sm"
        >
          {task ? 'Update Task' : 'Create Task'}
        </button>
      </div>

    </form>
  );
};

export default TaskForm;
