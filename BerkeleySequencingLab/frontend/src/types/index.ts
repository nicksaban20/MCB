import { User } from '@supabase/supabase-js'

export type AppUser = User | null

export interface FAQEntry {
  id: string
  question: string
  answer: string
  category: string
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  type: 'deadline' | 'event' | 'closure' | 'general'
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CalendarEvent {
  id: string
  title: string
  description: string
  event_type: 'closure' | 'holiday' | 'deadline' | 'cutoff' | 'event'
  start_date: string
  end_date: string
  all_day: boolean
  location: string
  created_at: string
  updated_at: string
}

export interface SearchResult {
  type: 'page' | 'faq' | 'order' | 'sample'
  title: string
  description: string
  url: string
  category: string
}

export interface ContactFormData {
  name: string
  email: string
  issueType: string
  message: string
}

export interface FormData {
  sampleTypeStep1: string
  samples: SampleRow[]
  dnaType: string
  dnaQuantity: string
  primerDetails: string
  plateName: string
  dropOffLocation: string
  dropOffDate: string
  dropOffTime: string
  dropOffMeridiem: string
  firstName: string
  lastName: string
  email: string
  phone: string
  streetAddress: string
  city: string
  state: string
  zipCode: string
  department: string
  pi: string
  chartstring: string
  [key: string]: unknown
}

export interface SampleRow {
  hash: string
  sampleName: string
  plasmidProtocol: string
  pcrProtocol: string
  specialInstruction: string
}

export interface SangerSampleRow {
  no: string
  name: string
  notes: string
  tubeType: string
}

export interface DnaOrder {
  id: string
  user_id: string
  sample_type: string
  dna_type: string
  dna_quantity: string
  primer_details: string
  plate_name: string
  status: string
  created_at: string
  updated_at: string
}
