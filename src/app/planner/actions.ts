'use server'

import { revalidatePath } from 'next/cache'
import { getDb } from '@/db/client'
import { addStudyTask, setTaskDone } from '@/db/records'

const SKILLS = ['listening', 'reading', 'writing', 'speaking', 'vocabulary', 'review']

export async function createTask(formData: FormData): Promise<void> {
  const title = String(formData.get('title') ?? '').trim()
  const skill = String(formData.get('skill') ?? '')
  const minutes = Number(formData.get('minutes') ?? 0)
  const date = String(formData.get('date') ?? '')
  if (!title || title.length > 200) return
  if (!SKILLS.includes(skill)) return
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return
  if (!Number.isInteger(minutes) || minutes <= 0 || minutes > 600) return
  await addStudyTask(getDb(), { date, title, skill, minutes })
  revalidatePath('/planner')
  revalidatePath('/')
}

export async function toggleTask(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'))
  const done = String(formData.get('done')) === 'true'
  if (!Number.isInteger(id)) return
  await setTaskDone(getDb(), id, done)
  revalidatePath('/planner')
  revalidatePath('/')
}
