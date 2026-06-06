import React from 'react';
import { Search, SlidersHorizontal, LayoutGrid, Kanban } from 'lucide-react';

const TaskFilter = ({
  search,
  setSearch,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between shadow-xl">
      
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
          <Search className="h-5 w-5" />
        </span>
        <input
          type="text"
          placeholder="Search by task title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-slate-500 transition-all text-sm"
        />
      </div>

      {/* Select Filters */}
      <div className="flex flex-wrap items-center gap-3.5 sm:gap-5">
        
        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-400" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white text-sm"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>

        {/* Sorting */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white text-sm"
          >
            <option value="NEWEST">Created: Newest First</option>
            <option value="OLDEST">Created: Oldest First</option>
            <option value="DUE_ASC">Due: Soonest First</option>
            <option value="DUE_DESC">Due: Latest First</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>
        <div className="flex items-center bg-slate-850 p-1 border border-slate-800 rounded-lg">
          <button
            onClick={() => setViewMode('KANBAN')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'KANBAN'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Kanban Board View"
          >
            <Kanban className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('GRID')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'GRID'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="List Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>

      </div>

    </div>
  );
};

export default TaskFilter;
