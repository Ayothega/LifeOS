import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Paperclip, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DragDropKanban() {
  const [tasks, setTasks] = useState({ todo: [], doing: [], done: [] })
  const [draggedTask, setDraggedTask] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)

  // ... (previous fetch logic remains the same)

  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, columnId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = async (e, newStatus) => {
    e.preventDefault()
    setDragOverColumn(null)
    
    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null)
      return
    }

    try {
      const { error } = await supabase
        .from('kanban_tasks')
        .update({ status: newStatus })
        .eq('id', draggedTask.id)

      if (error) throw error

      const oldStatus = draggedTask.status
      setTasks(prev => ({
        ...prev,
        [oldStatus]: prev[oldStatus].filter(t => t.id !== draggedTask.id),
        [newStatus]: [...prev[newStatus], { ...draggedTask, status: newStatus }]
      }))

      toast.success('Task moved successfully')
    } catch (error) {
      console.error('Error moving task:', error)
      toast.error('Failed to move task')
    } finally {
      setDraggedTask(null)
    }
  }

  const TaskCard = ({ task, columnId }) => {
    const category = getTaskCategory(task.title)
    
    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, task)}
        className={`
          bg-gray-900 p-4 rounded-lg border cursor-grab active:cursor-grabbing transition-all duration-200
          ${draggedTask?.id === task.id ? 'opacity-50' : ''}
          ${columnId === 'doing' && task.title.toLowerCase().includes('core') 
            ? 'border-primary shadow-lg shadow-blue-500/10' 
            : 'border-gray-700 hover:border-gray-600'
          }
          ${columnId === 'done' ? 'opacity-60' : ''}
        `}
      >
        <div className="flex items-start justify-between mb-2">
          <p className={`font-semibold ${columnId === 'done' ? 'line-through' : ''}`}>
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
        
        {/* Progress bars */}
        {columnId === 'doing' && task.title.toLowerCase().includes('core') && (
          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
            <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }} />
          </div>
        )}
        
        {columnId === 'done' && (
          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }} />
          </div>
        )}
      </div>
    )
  }