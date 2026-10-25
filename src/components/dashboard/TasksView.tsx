import React, { useState, useEffect } from 'react';
import {
  ListTodo,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  User,
  Search,
  Calendar,
  X,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Task, PriorityLevel } from '../../types';
import { api } from '../../api/client';

export const TasksView: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'today' | 'overdue' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Task Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formRelatedTo, setFormRelatedTo] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formPriority, setFormPriority] = useState<PriorityLevel>('Medium');
  const [formAssignee, setFormAssignee] = useState('Automation Specialist');
  const [formNotes, setFormNotes] = useState('');
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.getTasks({
        priority: priorityFilter,
      });
      setTasks(res.tasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [priorityFilter]);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.relatedTo.toLowerCase().includes(search.toLowerCase()) ||
      t.notes.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'today') {
      return t.status !== 'Completed' && t.dueDate === todayStr;
    }
    if (filterTab === 'overdue') {
      return t.status !== 'Completed' && t.dueDate < todayStr;
    }
    if (filterTab === 'completed') {
      return t.status === 'Completed';
    }
    return true;
  });

  const handleToggleComplete = async (task: Task) => {
    try {
      const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      const updated = await api.updateTask(task.id, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated.task : t)));
    } catch (err) {
      console.error('Toggle complete failed:', err);
    }
  };

  const openAddModal = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormRelatedTo('');
    setFormDueDate(todayStr);
    setFormPriority('Medium');
    setFormAssignee('Automation Specialist');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormRelatedTo(task.relatedTo);
    setFormDueDate(task.dueDate);
    setFormPriority(task.priority);
    setFormAssignee(task.assignedUser);
    setFormNotes(task.notes);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    try {
      if (editingTask) {
        const res = await api.updateTask(editingTask.id, {
          title: formTitle.trim(),
          relatedTo: formRelatedTo.trim() || 'General Task',
          dueDate: formDueDate,
          priority: formPriority,
          assignedUser: formAssignee,
          notes: formNotes.trim(),
        });
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? res.task : t)));
      } else {
        const res = await api.createTask({
          title: formTitle.trim(),
          relatedTo: formRelatedTo.trim() || 'General Task',
          dueDate: formDueDate,
          priority: formPriority,
          assignedUser: formAssignee,
          notes: formNotes.trim(),
        });
        setTasks((prev) => [res.task, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Save task error:', err);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await api.deleteTask(taskToDelete.id);
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      setTaskToDelete(null);
    } catch (err) {
      console.error('Delete task error:', err);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Task & Follow-up Queue</h2>
          <div className="text-xs text-slate-400 mt-0.5">
            Operational action items linked directly to customer inquiries and automated workflows.
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm shadow-blue-600/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Follow-up Task</span>
        </button>
      </div>

      {/* Filter and Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterTab === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setFilterTab('today')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterTab === 'today' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Today's Follow-ups
          </button>
          <button
            onClick={() => setFilterTab('overdue')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterTab === 'overdue' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Overdue
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterTab === 'completed' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed
          </button>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Task List Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">Status</th>
                <th className="py-3 px-4">Task Title</th>
                <th className="py-3 px-4">Related Subject / Lead</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Loading task queue...
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No matching tasks found.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isCompleted = task.status === 'Completed';
                  const isOverdue = !isCompleted && task.dueDate < todayStr;
                  const isDueToday = !isCompleted && task.dueDate === todayStr;

                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isCompleted ? 'opacity-60' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleComplete(task)}
                          className="text-slate-400 hover:text-blue-400 transition-colors"
                        >
                          {isCompleted ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Title & Notes */}
                      <td className="py-3.5 px-4">
                        <div
                          className={`font-semibold ${
                            isCompleted ? 'line-through text-slate-400' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </div>
                        {task.notes && (
                          <div className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">
                            {task.notes}
                          </div>
                        )}
                      </td>

                      {/* Related */}
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {task.relatedTo}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 font-mono tabular-nums">
                        <span
                          className={
                            isOverdue
                              ? 'text-rose-400 font-bold'
                              : isDueToday
                              ? 'text-amber-400 font-semibold'
                              : 'text-slate-400'
                          }
                        >
                          {task.dueDate}
                          {isOverdue && ' (Overdue)'}
                          {isDueToday && ' (Today)'}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold ${
                            task.priority === 'High'
                              ? 'text-rose-400'
                              : task.priority === 'Medium'
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      {/* Assignee */}
                      <td className="py-3.5 px-4 text-slate-300">{task.assignedUser}</td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(task)}
                            className="p-1.5 text-slate-400 hover:text-white rounded transition-colors"
                            title="Edit task"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setTaskToDelete(task)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white">
                {editingTask ? 'Edit Task' : 'Create New Follow-up Task'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Call client regarding custom n8n integration"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Related Subject / Lead
                  </label>
                  <input
                    type="text"
                    value={formRelatedTo}
                    onChange={(e) => setFormRelatedTo(e.target.value)}
                    placeholder="e.g. Sophia Martinez"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Assignee
                  </label>
                  <input
                    type="text"
                    value={formAssignee}
                    onChange={(e) => setFormAssignee(e.target.value)}
                    placeholder="Automation Specialist"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Task Context & Notes
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Details for the assignee..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Delete Task</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to delete <span className="text-white font-semibold">{taskToDelete.title}</span>?
            </p>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button onClick={() => setTaskToDelete(null)} className="px-4 py-2 text-xs text-slate-400 hover:text-white">
                Cancel
              </button>
              <button
                onClick={handleDeleteTask}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
