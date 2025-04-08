'use server';

import { createClient as createSupabaseServerClient } from '../../utils/supabase/server';

export async function submitForm(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  // Extract form data
  const sample_type = formData.get('sampleTypeStep1') as string;
  const dna_type = formData.get('dnaTypeFull') as string;
  const dna_quanity = formData.get('dnaQuantity') as string;
  const primer_details = formData.get('primerDetails') as string;
  const plate_name = formData.get('plateNameFull') as string;

  // Timestamp for created_at (timestamptz format)
  const created_at = new Date().toISOString();

  const { data, error } = await supabase.from('dna_orders').insert([
    {
      user_id: user.id, // ✅ associate with logged-in user
      sample_type,
      dna_type,
      dna_quanity,
      primer_details,
      plate_name,
      created_at,
    },
  ]);

  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to insert data');
  }

  return { success: true };
}
