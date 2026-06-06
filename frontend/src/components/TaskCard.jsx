import React from 'react';
import { Calendar, Clock, Edit2, Trash2, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'LOW':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/25';
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'DONE':
        return 'border-emerald-500/20 bg-slate-900/40 text-slate-400';
      case 'IN_PROGRESS':
        return 'border-indigo-500/30 bg-indigo-950/10 hover:border-indigo-500/50';
      default:
        return 'border-slate-800 bg-slate-850 hover:border-slate-700';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = (dateString, status) => {
    if (!dateString || status === 'DONE') return false;
    return new Date(dateString) < new Date();
  };

  return (
    <div
      className={`group border rounded-xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:shadow-indigo-950/10 ${getStatusStyles(
        task.status
      )}`}
    >
      <div>
        {/* Header: Priority & Status Action */}
        <div className="flex items-center justify-between mb-3.5">
          <span
            className={`text-xs font-bold px-2.5 py-0.5 border rounded-full uppercase tracking-wider ${getPriorityStyles(
              task.priority
            )}`}
          >
            {task.priority}
          </span>

          {/* Quick Status Toggles */}
          <div className="flex items-center gap-1.5">
            {task.status !== 'TODO' && (
              <button
                onClick={() => onStatusChange(task.id, task.status === 'DONE' ? 'IN_PROGRESS' : 'TODO')}
                className="text-[10px] font-semibold text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60 transition-colors"
                title="Move Back"
              >
                &larr; Back
              </button>
            )}
            {task.status !== 'DONE' && (
              <button
                onClick={() => onStatusChange(task.id, task.status === 'TODO' ? 'IN_PROGRESS' : 'DONE')}
                className="text-[10px] font-semibold text-indigo-400 hover:text-white px-2 py-0.5 rounded bg-indigo-950/30 hover:bg-indigo-600 border border-indigo-500/20 hover:border-indigo-500 transition-all"
                title="Advance Status"
              >
                Next &rarr;
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h3
          className={`font-bold text-lg mb-2 line-clamp-1 transition-all duration-300 ${
            task.status === 'DONE' ? 'text-slate-500 line-through' : 'text-white'
          }`}
          title={task.title}
        >
          {task.title}
        </h3>

        {/* Description */}
        <p
          className={`text-sm mb-4 line-clamp-3 whitespace-pre-wrap ${
            task.status === 'DONE' ? 'text-slate-600' : 'text-slate-400'
          }`}
        >
          {task.description || 'No description provided.'}
        </p>
      </div>

      {/* Footer Details */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2.5 text-xs">
        <div className="flex items-center justify-between text-slate-400">
          
          {/* Due date */}
          <div className="flex items-center gap-1.5">
            <Calendar className={`h-4 w-4 ${isOverdue(task.dueDate, task.status) ? 'text-rose-400' : 'text-slate-500'}`} />
            <span className={isOverdue(task.dueDate, task.status) ? 'text-rose-400 font-semibold flex items-center gap-1' : ''}>
              {formatDate(task.dueDate)}
              {isOverdue(task.dueDate, task.status) && (
                <AlertCircle className="h-3 w-3" title="Overdue!" />
              )}
            </span>
          </div>

          {/* AI Estimated Time */}
          {task.estimatedTime && (
            <div className="flex items-center gap-1.5 bg-indigo-500/5 text-indigo-300 border border-indigo-500/10 px-2 py-0.5 rounded-md">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              <span className="font-medium">{task.estimatedTime}</span>
            </div>
          )}
        </div>

        {/* Card Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5 rounded-md border border-transparent hover:border-indigo-500/15 transition-all"
            title="Edit Task"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-md border border-transparent hover:border-rose-500/15 transition-all"
            title="Delete Task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
