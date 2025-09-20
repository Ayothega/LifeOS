"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, Paperclip } from "lucide-react";

export default function KanbanPage() {
  const supabase = createClient();
  const { id: projectId } = useParams(); // <-- dynamic route param

  const [tasks, setTasks] = useState({ todo: [], doing: [], done: [] });
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [activeColumn, setActiveColumn] = useState(null);

  useEffect(() => {
    if (projectId) fetchTasks();
  }, [projectId]);

  // ⬇️ Scoped fetch
  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("kanban_tasks")
        .select("*")
        .eq("project_id", projectId) // only tasks for this project
        .order("created_at", { ascending: true });

      if (error) throw error;

      const groupedTasks = {
        todo: data?.filter((t) => t.status === "todo") || [],
        doing: data?.filter((t) => t.status === "doing") || [],
        done: data?.filter((t) => t.status === "done") || [],
      };

      setTasks(groupedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  // ⬇️ Scoped insert
  const addTask = async (status) => {
    if (!newTaskTitle.trim()) return;

    try {
      const { data, error } = await supabase
        .from("kanban_tasks")
        .insert([
          {
            title: newTaskTitle,
            status,
            project_id: projectId, // link task to current project
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setTasks((prev) => ({
        ...prev,
        [status]: [...prev[status], data],
      }));

      setNewTaskTitle("");
      setActiveColumn(null);
      toast.success("Task added successfully");
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task");
    }
  };

  const moveTask = async (taskId, newStatus) => {
    try {
      const { error } = await supabase
        .from('kanban_tasks')
        .update({ status: newStatus })
        .eq('id', taskId)

      if (error) throw error

      // Update local state
      const task = Object.values(tasks).flat().find(t => t.id === taskId)
      if (task) {
        const oldStatus = task.status
        setTasks(prev => ({
          ...prev,
          [oldStatus]: prev[oldStatus].filter(t => t.id !== taskId),
          [newStatus]: [...prev[newStatus], { ...task, status: newStatus }]
        }))
      }

      toast.success('Task moved successfully')
    } catch (error) {
      console.error('Error moving task:', error)
      toast.error('Failed to move task')
    }
  }

  const getTaskCategory = (title) => {
    const lowerTitle = title.toLowerCase()
    if (lowerTitle.includes('design')) return { bg: 'bg-yellow-500/20', text: 'text-yellow-300', label: 'Design' }
    if (lowerTitle.includes('develop') || lowerTitle.includes('code')) return { bg: 'bg-blue-500/20', text: 'text-blue-300', label: 'Development' }
    if (lowerTitle.includes('market')) return { bg: 'bg-pink-500/20', text: 'text-pink-300', label: 'Marketing' }
    if (lowerTitle.includes('setup') || lowerTitle.includes('infra')) return { bg: 'bg-gray-500/20', text: 'text-gray-300', label: 'Infra' }
    return { bg: 'bg-purple-500/20', text: 'text-purple-300', label: 'General' }
  }

  const columns = [
    { id: 'todo', title: 'Todo', count: tasks.todo.length },
    { id: 'doing', title: 'In Progress', count: tasks.doing.length },
    { id: 'done', title: 'Done', count: tasks.done.length }
  ]

  if (loading) {
    return (
      <div className="p-4 lg:p-8 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 bg-gray-950/50 min-h-screen">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-white">Projects</h2>
        <button
          onClick={() => {
            setActiveColumn('todo')
            setNewTaskTitle('')
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white font-semibold hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
          <span>New Task</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 h-full">
        {columns.map((column) => (
          <div key={column.id} className="bg-gray-800/50 rounded-xl flex flex-col min-h-[600px]">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-200">{column.title}</h3>
              <span className="text-sm font-medium text-gray-400">{column.count}</span>
            </div>
            
            <div className="p-4 space-y-4 flex-grow overflow-y-auto">
              {tasks[column.id].map((task) => {
                const category = getTaskCategory(task.title)
                return (
                  <div
                    key={task.id}
                    className={`
                      bg-gray-900 p-4 rounded-lg border cursor-pointer transition-all duration-200
                      ${column.id === 'doing' && task.title.toLowerCase().includes('core') 
                        ? 'border-primary shadow-lg shadow-blue-500/10' 
                        : 'border-gray-700 hover:border-gray-600'
                      }
                      ${column.id === 'done' ? 'opacity-60' : ''}
                    `}
                    onClick={() => {
                      // Add drag and drop or click to move functionality here
                      if (column.id === 'todo') moveTask(task.id, 'doing')
                      else if (column.id === 'doing') moveTask(task.id, 'done')
                    }}
                  >
                    <p className={`font-semibold mb-2 ${column.id === 'done' ? 'line-through' : ''}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span className={`${category.bg} ${category.text} px-2 py-1 rounded-md text-xs`}>
                        {category.label}
                      </span>
                      {Math.random() > 0.5 && (
                        <span className="flex items-center gap-1">
                          <Paperclip size={14} />
                          {Math.floor(Math.random() * 5) + 1}
                        </span>
                      )}
                    </div>
                    
                    {/* Progress bar for in-progress tasks */}
                    {column.id === 'doing' && task.title.toLowerCase().includes('core') && (
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }} />
                      </div>
                    )}
                    
                    {/* Progress bar for completed tasks */}
                    {column.id === 'done' && (
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }} />
                      </div>
                    )}
                  </div>
                )
              })}
              
              {/* Add task button or form */}
              {activeColumn === column.id ? (
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Enter task title..."
                    className="w-full bg-gray-800 text-white p-2 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addTask(column.id)
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => addTask(column.id)}
                      className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-blue-600"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setActiveColumn(null)
                        setNewTaskTitle('')
                      }}
                      className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setActiveColumn(column.id)
                    setNewTaskTitle('')
                  }}
                  className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white py-3 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <Plus size={16} />
                  Add task
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}