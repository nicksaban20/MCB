export type OrderRow = {
  id: string
  user_id: string
  sample_type: string | null
  status: string | null
  plate_name: string | null
  primer_details: string | null
  internal_notes?: string | null
  created_at: string
  customer_label?: string
}

export type StatusEvent = {
  id: string
  created_at: string
  old_status: string | null
  new_status: string
  dna_orders?: { sample_type?: string; plate_name?: string }
}

export type SampleRow = {
  id: string
  name: string | null
  notes: string | null
  status: string | null
  flag_for_review: boolean | null
  plate_id: string | null
  well_index: number | null
  dna_order_id: string
  customer_label?: string
  dna_orders?: {
    id: string
    sample_type: string | null
    status: string | null
    plate_name: string | null
  }
}

export type Plate = {
  id: string
  name: string
  status: string
  created_at: string
}

export type ResultRow = {
  id: string
  file_name: string
  storage_path: string
  mime_type: string | null
  dna_order_id: string
  signedUrl?: string | null
  customer_label?: string
  dna_orders?: { sample_type?: string; plate_name?: string }
}
