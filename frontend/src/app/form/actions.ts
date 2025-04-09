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

  // Insert into dna_orders and get back the ID
  const { data: orderInsertData, error: insertError } = await supabase
    .from('dna_orders')
    .insert([
      {
        user_id: user.id,
        sample_type,
        dna_type,
        dna_quanity,
        primer_details,
        plate_name,
        created_at,
      },
    ])
    .select(); // Returns inserted row

  if (insertError) {
    console.error('Supabase error:', insertError);
    throw new Error('Failed to insert into dna_orders');
  }

//   const orderId = orderInsertData?.[0]?.id;
//   if (!orderId) {
//     throw new Error('Could not retrieve inserted dna_order id');
//   }

//   const sample_no = formData.get('sampleTypeStep1') as string;
//   const name = formData.get('dnaTypeFull') as string;
//   const notes = formData.get('dnaQuantity') as string;

//   const { error: sampleInsertError } = await supabase
//     .from('dna_samples')
//     .insert([
//       {
//         dna_order_id: orderId,
//         sample_no: 'Sample #1',
//         name: 'Sample Name',
//         notes: 'Any notes here',
//       },
//     ]);

//   if (sampleInsertError) {
//     console.error('Sample insert error:', sampleInsertError);
//     throw new Error('Failed to insert into dna_samples');
//   }

//   return { success: true, orderId };
}
