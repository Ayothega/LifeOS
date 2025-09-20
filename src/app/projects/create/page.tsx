"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import toast from "react-hot-toast"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

interface Project {
  id: string
  title: string
  description: string
  status: string
  created_at: string
}

export default function ProjectsPage() {
  const supabase = createClient()
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false })
    if (error) {
      console.error(error)
      toast.error("Failed to load projects")
    } else {
      setProjects(data || [])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleCreateProject = async () => {
    if (!title.trim()) {
      toast.error("Project title is required")
      return
    }

    const { data, error } = await supabase
      .from("projects")
      .insert([{ title, description }])
      .select()
      .single()

    if (error) {
      console.error(error)
      toast.error("Failed to create project")
      return
    }

    toast.success("Project created!")
    setTitle("")
    setDescription("")
    fetchProjects() // refresh list
    router.push(`/projects/milestones/${data.id}`) // go to milestones for that project
  }

  const handleDeleteProject = async (projectId: string) => {
  if (!confirm("Are you sure you want to delete this project and all its data?")) return;

  try {
    // First, fetch milestones under this project
    const { data: milestones, error: milestonesError } = await supabase
      .from("project_milestones")
      .select("id")
      .eq("project_id", projectId);

    if (milestonesError) throw milestonesError;

    // Delete tasks for each milestone
    if (milestones && milestones.length > 0) {
      const milestoneIds = milestones.map((m) => m.id);

      const { error: tasksError } = await supabase
        .from("kanban_tasks")
        .delete()
        .in("milestone_id", milestoneIds);

      if (tasksError) throw tasksError;

      // Delete milestones
      const { error: delMilestonesError } = await supabase
        .from("milestones")
        .delete()
        .in("id", milestoneIds);

      if (delMilestonesError) throw delMilestonesError;
    }

    // Finally, delete the project itself
    const { error: delProjectError } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (delProjectError) throw delProjectError;

    toast.success("Project deleted successfully");
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  } catch (err) {
    console.error("Error deleting project:", err);
    toast.error("Failed to delete project");
  }
};


  return (
    <div className="p-6 lg:p-10 bg-gray-950 min-h-screen space-y-10">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Projects</h1>
      </header>

      {/* Create Project Form */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-md">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <PlusCircle size={18} /> Create New Project
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Project title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-primary outline-none"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-primary outline-none"
          />
          <button
            onClick={handleCreateProject}
            className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-blue-600 transition-colors"
          >
            Create Project
          </button>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Your Projects</h2>
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="text-gray-500">No projects created yet.</div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
             <li
  key={project.id}
  className="bg-gray-900 p-5 rounded-xl border border-gray-800 hover:border-gray-700 transition"
>
  <h3 className="text-lg font-semibold text-white">{project.title}</h3>
  <p className="text-gray-400 text-sm mt-1">{project.description || "No description"}</p>
  <div className="flex items-center gap-4 mt-3">
    <Link
      href={`/projects/milestones/${project.id}`}
      className="text-sm text-primary hover:underline"
    >
      View Milestones →
    </Link>
    <button
      onClick={() => handleDeleteProject(project.id)}
      className="text-sm text-red-400 hover:underline"
    >
      Delete
    </button>
  </div>
</li>

            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
