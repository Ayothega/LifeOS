import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"
import { Plus, Paperclip, GripVertical } from "lucide-react"
import toast from "react-hot-toast"

interface Task {
  id: string
  title: string
  status: "todo" | "doing" | "done"
  project_id?: string
  milestone_id?: string
  created_at?: string
}

interface Tasks {
  todo: Task[]
  doing: Task[]
  done: Task[]
}

export default function DragDropKanban() {
  const supabase = createClient()
  const [tasks, setTasks] = useState<Tasks>({ todo: [], doing: [], done: [] })
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("kanban_tasks")
        .select("*")
        .order("created_at", { ascending: true })

      if (error) throw error

      const groupedTasks: Tasks = {
        todo: data?.filter((t: Task) => t.status === "todo") || [],
        doing: data?.filter((t: Task) => t.status === "doing") || [],
        done: data?.filter((t: Task) => t.status === "done") || [],
      }

      setTasks(groupedTasks)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast.error("Failed to load tasks")
    }
  }, [supabase])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDragLeave = () => {
    // Handle drag leave if needed
  }

  const handleDrop = async (e: React.DragEvent, newStatus: "todo" | "doing" | "done") => {
    e.preventDefault()
    
    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null)
      return
    }

    try {
      const { error } = await supabase
        .from("kanban_tasks")
        .update({ status: newStatus })
        .eq("id", draggedTask.id)

      if (error) throw error

      const oldStatus = draggedTask.status
      setTasks(prev => ({
        ...prev,
        [oldStatus]: prev[oldStatus].filter(t => t.id !== draggedTask.id),
        [newStatus]: [...prev[newStatus], { ...draggedTask, status: newStatus }]
      }))

      toast.success("Task moved successfully")
    } catch (error) {
      console.error("Error moving task:", error)
      toast.error("Failed to move task")
    } finally {
      setDraggedTask(null)
    }
  }

  const getTaskCategory = (title: string) => {
    const lowerTitle = title.toLowerCase()
    if (lowerTitle.includes("design")) return { bg: "bg-yellow-500/20", text: "text-yellow-300", label: "Design" }
    if (lowerTitle.includes("develop") || lowerTitle.includes("code")) return { bg: "bg-blue-500/20", text: "text-blue-300", label: "Development" }
    if (lowerTitle.includes("market")) return { bg: "bg-pink-500/20", text: "text-pink-300", label: "Marketing" }
    if (lowerTitle.includes("setup") || lowerTitle.includes("infra")) return { bg: "bg-gray-500/20", text: "text-gray-300", label: "Infra" }
    return { bg: "bg-purple-500/20", text: "text-purple-300", label: "General" }
  }

  const TaskCard = ({ task, columnId }: { task: Task; columnId: string }) => {
    const category = getTaskCategory(task.title)
    
    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, task)}
        className={`
          bg-gray-900 p-4 rounded-lg border cursor-grab active:cursor-grabbing transition-all duration-200
          ${draggedTask?.id === task.id ? "opacity-50" : ""}
          ${columnId === "doing" && task.title.toLowerCase().includes("core") 
            ? "border-primary shadow-lg shadow-blue-500/10" 
            : "border-gray-700 hover:border-gray-600"
          }
          ${columnId === "done" ? "opacity-60" : ""}
        `}
      >
        <div className="flex items-start justify-between mb-2">
          <p className={`font-semibold ${columnId === "done" ? "line-through" : ""}`}>
            {task.title}
          </p>
          <GripVertical size={16} className="text-gray-500 flex-shrink-0 ml-2" />
        </div>
        
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
        
        {columnId === "doing" && task.title.toLowerCase().includes("core") && (
          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
            <div className="bg-primary h-2 rounded-full" style={{ width: "60%" }} />
          </div>
        )}
        
        {columnId === "done" && (
          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: "100%" }} />
          </div>
        )}
      </div>
    )
  }

  const columns = [
    { id: "todo", title: "Todo", count: tasks.todo.length },
    { id: "doing", title: "In Progress", count: tasks.doing.length },
    { id: "done", title: "Done", count: tasks.done.length }
  ]

  return (
    <div className="p-4 lg:p-8 bg-gray-950/50 min-h-screen">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-white">Kanban Board</h2>
        <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white font-semibold hover:bg-blue-600 transition-colors">
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
            
            <div 
              className="p-4 space-y-4 flex-grow overflow-y-auto"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id as "todo" | "doing" | "done")}
            >
              {tasks[column.id as keyof Tasks].map((task) => (
                <TaskCard key={task.id} task={task} columnId={column.id} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
