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

  // Extract form data for dna_orders
  const sample_type = formData.get('sampleTypeStep1') as string;
  const dna_type = formData.get('dnaTypeFull') as string; // Assuming this holds the relevant DNA type
  const dna_quantity = formData.get('dnaQuantity') as string;
  const primer_details = formData.get('primerDetails') as string;
  const plate_name = formData.get('plateNameFull') as string; // Assuming this holds the relevant plate name

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
        dna_quanity: dna_quantity,
        primer_details,
        plate_name,
        created_at,
      },
    ])
    .select('id') // Only select the id
    .single(); // Expecting a single row back

  if (insertError || !orderInsertData) {
    console.error('Supabase dna_orders insert error:', insertError);
    throw new Error(
      `Failed to insert into dna_orders: ${insertError?.message}`
    );
  }

  const orderId = orderInsertData.id;
  if (!orderId) {
    // This check might be redundant due to .single() throwing an error if no row is returned
    throw new Error('Could not retrieve inserted dna_order id');
  }

  // --- Begin Sample Insertion ---

  // Extract samples (assuming it's passed as a JSON string under the key 'samples')
  const samplesJSON = formData.get('samples') as string | null;
  let samples: { sampleNo: string; name: string; notes: string }[] = [];

  if (samplesJSON) {
    try {
      samples = JSON.parse(samplesJSON);
      // Basic validation to ensure it's an array
      if (!Array.isArray(samples)) {
        console.error('Parsed samples is not an array:', samples);
        throw new Error('Invalid samples format received.');
      }
    } catch (error) {
      console.error('Failed to parse samples JSON:', error);
      // Decide if you want to proceed without samples or throw an error
      throw new Error('Failed to parse samples data');
    }
  } else {
    console.warn("No 'samples' data found in FormData. Proceeding without sample insertion.");
    // If samples are mandatory, you might want to throw an error here instead
    // throw new Error("Samples data is missing.");
  }

  // Prepare dna_samples data for insertion if samples exist
  if (samples.length > 0) {
    const samplesToInsert = samples
      .filter(sample => sample.sampleNo || sample.name || sample.notes) // Avoid inserting completely empty rows if needed
      .map((sample) => ({
        dna_order_id: orderId,
        sample_no: sample.sampleNo, // Matches the field in your page.tsx state
        name: sample.name,          // Matches the field in your page.tsx state
        notes: sample.notes,        // Matches the field in your page.tsx state
      }));

    if (samplesToInsert.length > 0) {
        const { error: sampleInsertError } = await supabase
          .from('dna_samples')
          .insert(samplesToInsert);

        if (sampleInsertError) {
          console.error('Supabase dna_samples insert error:', sampleInsertError);
          // Depending on requirements, you might want to attempt to delete the dna_orders entry
          // or simply report the failure.
          throw new Error(
            `Failed to insert into dna_samples: ${sampleInsertError.message}`
          );
        }
    } else {
        console.log("No valid samples provided to insert after filtering.");
    }

  } else {
    console.log("No samples provided or parsed, skipping dna_samples insertion.");
  }

  // --- End Sample Insertion ---

  // Return success with the order ID
  return { success: true, orderId };
}