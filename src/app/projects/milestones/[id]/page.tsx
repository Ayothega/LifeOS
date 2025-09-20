"use client";
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation' // ⬅ app router API
import { createClient } from '@/utils/supabase/client'
import { ChevronRight, Edit, MoreHorizontal, Plus, Check, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function ProjectDetail() {
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string // ⬅ grab dynamic route param

  const [project, setProject] = useState<any>(null)
  const [milestones, setMilestones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newMilestone, setNewMilestone] = useState({ title: '', due_date: '' })
  const [showAddMilestone, setShowAddMilestone] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<any>(null)
const [editForm, setEditForm] = useState({ title: "", due_date: "" })

  useEffect(() => {
    if (id) {
      fetchProjectDetails()
    }
  }, [id])

  const startEditMilestone = (milestone) => {
  setEditingMilestone(milestone.id)
  setEditForm({ title: milestone.title, due_date: milestone.due_date || "" })
}


const saveEditMilestone = async () => {
  try {
    const { error } = await supabase
      .from("project_milestones")
      .update({
        title: editForm.title,
        due_date: editForm.due_date || null,
      })
      .eq("id", editingMilestone)

    if (error) throw error

    setMilestones(prev =>
      prev.map(m =>
        m.id === editingMilestone
          ? { ...m, ...editForm }
          : m
      )
    )
    setEditingMilestone(null)
    toast.success("Milestone updated")
  } catch (err) {
    console.error(err)
    toast.error("Update failed")
  }
}

const deleteMilestone = async (milestoneId) => {
  if (!window.confirm("Delete this milestone?")) return

  try {
    const { error } = await supabase
      .from("project_milestones")
      .delete()
      .eq("id", milestoneId)

    if (error) throw error

    setMilestones(prev => prev.filter(m => m.id !== milestoneId))
    toast.success("Milestone deleted")
  } catch (err) {
    console.error(err)
    toast.error("Delete failed")
  }
}

  const fetchProjectDetails = async () => {
    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (projectError) throw projectError

      const { data: milestonesData, error: milestonesError } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('project_id', id)
        .order('due_date', { ascending: true })
      if (milestonesError) throw milestonesError

      setProject(projectData)
      setMilestones(milestonesData || [])
    } catch (error) {
      console.error('Error fetching project details:', error)
      toast.error('Failed to load project details')
    } finally {
      setLoading(false)
    }
  }

  const addMilestone = async () => {
  if (!newMilestone.title.trim()) return

  try {
    const { data, error } = await supabase
      .from('project_milestones')
      .insert([{
        title: newMilestone.title,
        due_date: newMilestone.due_date || null, // ✅ handle empty date
        project_id: id
      }])
      .select()
      .single()

    if (error) throw error

    setMilestones(prev => [...prev, data])
    setNewMilestone({ title: '', due_date: '' })
    setShowAddMilestone(false)
    toast.success('Milestone added successfully')
  } catch (error) {
    console.error('Error adding milestone:', error)
    toast.error('Failed to add milestone')
  }
}


  const toggleMilestoneComplete = async (milestoneId, completed) => {
    try {
      const { error } = await supabase
        .from('project_milestones')
        .update({ completed: !completed })
        .eq('id', milestoneId)

      if (error) throw error

      setMilestones(prev => prev.map(milestone => 
        milestone.id === milestoneId 
          ? { ...milestone, completed: !completed }
          : milestone
      ))
      
      toast.success('Milestone updated successfully')
    } catch (error) {
      console.error('Error updating milestone:', error)
      toast.error('Failed to update milestone')
    }
  }

  const getStatusBadge = (milestone) => {
    if (milestone.completed) {
      return { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Complete' }
    }
    
    if (milestone.due_date) {
      const dueDate = new Date(milestone.due_date)
      const today = new Date()
      const isOverdue = dueDate < today
      
      if (isOverdue) {
        return { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Overdue' }
      } else {
        return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'In Progress' }
      }
    }
    
    return { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Not Started' }
  }

  if (loading) {
    return (
      <div className="p-4 lg:p-8 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-4 lg:p-8 flex items-center justify-center">
        <div className="text-gray-400">Project not found</div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-12 min-h-screen bg-gray-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-400 mb-4">
            <Link href="/projects/create" className="hover:text-white transition-colors">
              Projects
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-white">{project.title}</span>
          </div>
          
          {/* Project Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-white text-2xl lg:text-4xl font-bold">{project.title}</h1>
              <p className="text-gray-400 max-w-2xl">{project.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center justify-center rounded-md h-9 w-9 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                <Edit size={16} />
              </button>
              <button className="flex items-center justify-center rounded-md h-9 w-9 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8 mb-10">
          <div className="bg-gray-800/50 p-6 rounded-lg">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Created</h3>
            <p className="text-white text-base font-semibold">
              {format(new Date(project.created_at), 'MMM dd, yyyy')}
            </p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-lg">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Status</h3>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${project.status === 'active' ? 'bg-green-400' : 'bg-gray-400'}`} />
              <p className="text-white text-base font-semibold capitalize">{project.status}</p>
            </div>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-lg">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Milestones</h3>
            <p className="text-white text-base font-semibold">
              {milestones.filter(m => m.completed).length} / {milestones.length} completed
            </p>
          </div>
        </div>

        {/* Milestones Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-white text-xl lg:text-2xl font-bold">Milestones</h2>
          <button
            onClick={() => setShowAddMilestone(true)}
            className="flex items-center gap-2 rounded-md h-10 px-4 bg-primary text-white text-sm font-bold hover:bg-blue-600 transition-colors"
          >
            <Plus size={16} />
            <span className="truncate">Add Milestone</span>
          </button>
        </div>

        {/* Add Milestone Form */}
        {showAddMilestone && (
          <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Milestone title..."
                value={newMilestone.title}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                className="bg-gray-700 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="date"
                value={newMilestone.due_date}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, due_date: e.target.value }))}
                className="bg-gray-700 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addMilestone}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Add Milestone
              </button>
              <button
                onClick={() => {
                  setShowAddMilestone(false)
                  setNewMilestone({ title: '', due_date: '' })
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Milestones Table */}
        <div className="bg-gray-800/50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            {/* Table Header */}
            <div className="hidden lg:grid grid-cols-12 px-6 py-4 border-b border-gray-700 text-gray-400 text-xs uppercase font-bold tracking-wider">
              <div className="col-span-1"></div>
              <div className="col-span-5">Milestone</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-3">Due Date</div>
            </div>
            
            {/* Table Body */}
            <div className="flex flex-col">
              {milestones.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  No milestones yet. Add your first milestone to get started!
                </div>
              ) : (
                milestones.map((milestone) => {
                  const status = getStatusBadge(milestone)
                  return (
                    <div key={milestone.id} className="grid grid-cols-1 lg:grid-cols-12 items-center px-6 py-4 border-b border-gray-700/50 hover:bg-gray-800 transition-colors group">
                     



                      {/* Mobile Layout */}
{/* Mobile Layout */}
<div className="lg:hidden space-y-3">
  {/* Show milestone info ONLY when not editing */}
  {editingMilestone !== milestone.id && (
    <>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleMilestoneComplete(milestone.id, milestone.completed)}
            className={`w-6 h-6 flex items-center justify-center rounded-full border-2 transition-colors ${
              milestone.completed
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-gray-500 hover:border-green-500'
            }`}
          >
            {milestone.completed && <Check size={12} />}
          </button>
          <span className="text-white font-medium">
            <Link
              href={`/projects/kaban/${id}`}
              className="hover:underline"
            >
              {milestone.title}
            </Link>
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => startEditMilestone(milestone)}
            className="text-gray-400 hover:text-white text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => deleteMilestone(milestone.id)}
            className="text-red-400 hover:text-red-600 text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="ml-9 flex items-center justify-between">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}
        >
          {status.label}
        </span>
        {milestone.due_date && (
          <span className="text-gray-400 text-sm">
            {format(new Date(milestone.due_date), 'MMM dd, yyyy')}
          </span>
        )}
      </div>
    </>
  )}

  {/* Show edit form ONLY when editing */}
  {editingMilestone === milestone.id && (
    <div className="bg-gray-800/50 p-4 rounded-lg mt-3">
      <div className="grid grid-cols-1 gap-4 mb-4">
        <input
          type="text"
          placeholder="Milestone title..."
          value={editForm.title}
          onChange={(e) =>
            setEditForm((prev) => ({ ...prev, title: e.target.value }))
          }
          className="bg-gray-700 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="date"
          value={editForm.due_date}
          onChange={(e) =>
            setEditForm((prev) => ({ ...prev, due_date: e.target.value }))
          }
          className="bg-gray-700 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={saveEditMilestone}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Save
        </button>
        <button
          onClick={() => setEditingMilestone(null)}
          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )}
</div>


                      {/* Desktop Layout */}
                      <div className="hidden lg:contents">
                        <div className="col-span-1">
                          <button
                            onClick={() => toggleMilestoneComplete(milestone.id, milestone.completed)}
                            className={`w-6 h-6 flex items-center justify-center rounded-full border-2 transition-colors ${
                              milestone.completed
                                ? 'border-green-500 bg-green-500 text-white'
                                : 'border-gray-500 hover:border-green-500'
                            }`}
                          >
                            {milestone.completed && <Check size={12} />}
                          </button>
                        </div>
                        <div className="col-span-5 text-white">
  <Link href={`/projects/kaban/${id}`} className="hover:underline">
    {milestone.title}
  </Link>
</div>
                        <div className="col-span-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="col-span-2 text-gray-400">
                          {milestone.due_date ? format(new Date(milestone.due_date), 'MMM dd, yyyy') : 'No due date'}
                        </div>
                        <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity relative">
   <div className="flex gap-2">
          <button
            onClick={() => startEditMilestone(milestone)}
            className="text-gray-400 hover:text-white text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => deleteMilestone(milestone.id)}
            className="text-red-400 hover:text-red-600 text-sm"
          >
            Delete
          </button>
        </div>
</div>



<div key={milestone.id} className="py-2">
  {/* Show milestone info ONLY when not editing */}

  {/* Show edit form ONLY when editing */}
  {editingMilestone === milestone.id && (
    <div className="mt-2 flex items-center gap-2">
      <input
        type="text"
        value={editForm.title}
        onChange={(e) =>
          setEditForm((prev) => ({ ...prev, title: e.target.value }))
        }
        className="bg-gray-700 text-white p-2 rounded"
      />
      <input
        type="date"
        value={editForm.due_date}
        onChange={(e) =>
          setEditForm((prev) => ({ ...prev, due_date: e.target.value }))
        }
        className="bg-gray-700 text-white p-2 rounded"
      />
      <button
        onClick={saveEditMilestone}
        className="px-2 py-1 bg-green-600 text-white rounded"
      >
        Save
      </button>
      <button
        onClick={() => setEditingMilestone(null)}
        className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
      >
        Cancel
      </button>
    </div>
  )}
</div>
                      </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}