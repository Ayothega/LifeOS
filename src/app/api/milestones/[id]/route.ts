// app/api/milestones/[id]/route.ts

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { id } = params

  const { data, error } = await supabase
    .from('project_milestones')
    .select('*')
    .eq('project_id', id)
    .order('due_date', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 })
  }

  return NextResponse.json({ milestones: data })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { id } = params
  const body = await request.json()
  const { title, due_date } = body

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('project_milestones')
    .insert([{ title, due_date, project_id: id }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 })
  }

  return NextResponse.json({ milestone: data }, { status: 201 })
}
