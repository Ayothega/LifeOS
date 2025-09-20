"use client";
import { useState, useEffect } from 'react'
import { Flame } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function Dashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState({
    projects: 0,
    habits: 0,
    goals: 0,
    streak: 7
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('status', 'active')

      // For now, we'll use mock data for habits and goals
      setStats({
        projects: projects?.length || 0,
        goals: 0,
        streak: 7
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const lifeAreas = [
    {
      name: 'Projects',
      count: `${stats.projects} active projects`,
      image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop'
    },
    {
      name: 'Goals',
      count: `${stats.goals} goals in progress`,
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=300&fit=crop'
    },
    {
      name: 'Art',
      count: 'Creative projects',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop'
    }
  ]

  return (
    <div className="p-4 lg:p-4">
      <header className="mb-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-100 tracking-tight pt-8">
          Dashboard
        </h2>
        <p className="text-gray-400 mt-1">
          Welcome back! Here's your life at a glance.
        </p>
      </header>

      <section className="mb-10">
        <h3 className="text-xl lg:text-2xl font-semibold text-gray-100 mb-4">
          System Areas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
          {lifeAreas.map((area) => (
            <div key={area.name} className="group flex flex-col gap-3 transform transition-transform duration-300 hover:-translate-y-1">
              <div 
                className="w-full h-32 lg:h-40 bg-center bg-no-repeat bg-cover rounded-lg shadow-lg"
                style={{ backgroundImage: `url(${area.image})` }}
              />
              <div>
                <p className="text-gray-100 text-base font-semibold">{area.name}</p>
                <p className="text-gray-400 text-sm">{area.count}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
    <div className="lg:col-span-2 bg-slate-900/70 p-6 rounded-lg">
      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
        Weekly Progress
      </h3>
      <div className="h-64">
        <div className="h-full w-full flex items-end justify-between gap-4">
          {/* Mon */}
          <div className="flex flex-col items-center h-full justify-end w-1/6">
            <div
              className="w-full bg-[var(--primary-color)] rounded-t-md"
              style={{ height: "60%" }}
            />
            <p className="text-xs text-[var(--text-secondary)] mt-2">Mon</p>
          </div>

          {/* Tue */}
          <div className="flex flex-col items-center h-full justify-end w-1/6">
            <div
              className="w-full bg-[var(--primary-color)] rounded-t-md"
              style={{ height: "75%" }}
            />
            <p className="text-xs text-[var(--text-secondary)] mt-2">Tue</p>
          </div>

          {/* Wed */}
          <div className="flex flex-col items-center h-full justify-end w-1/6">
            <div
              className="w-full bg-[var(--primary-color)] rounded-t-md"
              style={{ height: "40%" }}
            />
            <p className="text-xs text-[var(--text-secondary)] mt-2">Wed</p>
          </div>

          {/* Thu */}
          <div className="flex flex-col items-center h-full justify-end w-1/6">
            <div
              className="w-full bg-[var(--primary-color)] rounded-t-md"
              style={{ height: "85%" }}
            />
            <p className="text-xs text-[var(--text-secondary)] mt-2">Thu</p>
          </div>

          {/* Fri */}
          <div className="flex flex-col items-center h-full justify-end w-1/6">
            <div
              className="w-full bg-[var(--primary-color)] rounded-t-md"
              style={{ height: "55%" }}
            />
            <p className="text-xs text-[var(--text-secondary)] mt-2">Fri</p>
          </div>

          {/* Sat */}
          <div className="flex flex-col items-center h-full justify-end w-1/6">
            <div
              className="w-full bg-[var(--accent-color)] rounded-t-md"
              style={{ height: "20%" }}
            />
            <p className="text-xs text-[var(--text-secondary)] mt-2">Sat</p>
          </div>

          {/* Sun */}
          <div className="flex flex-col items-center h-full justify-end w-1/6">
            <div
              className="w-full bg-[var(--accent-color)] rounded-t-md"
              style={{ height: "30%" }}
            />
            <p className="text-xs text-[var(--text-secondary)] mt-2">Sun</p>
          </div>
        </div>
      </div>
    </div>


        <div className="bg-slate-900/70 p-6 rounded-lg flex flex-col items-center justify-center text-center">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-100">
            Current Streak
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <Flame className="text-yellow-400 w-8 h-8 lg:w-10 lg:h-10" />
            <p className="text-3xl lg:text-4xl font-bold text-white">{stats.streak}</p>
          </div>
          <p className="text-sm text-gray-400">days</p>
        </div>
      </section>
    </div>
  )
}