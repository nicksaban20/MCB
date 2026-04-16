import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/app/api/_lib/auth';
import { parseSequencingTxtFile } from '@/app/api/_lib/sequencing';

type SequencingUploadRequest = {
  fileContent?: string;
};

export async function POST(request: Request) {
  try {
    const authResult = await requireAuthenticatedUser();

    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { supabase, user } = authResult.context;
    const body = (await request.json()) as SequencingUploadRequest;
    const fileContent = typeof body.fileContent === 'string' ? body.fileContent : '';

    const parseResult = parseSequencingTxtFile(fileContent);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error },
        { status: 400 }
      );
    }

    const { sequencingData, samples } = parseResult.payload;

    const { data: sequencingRow, error: sequencingError } = await supabase
      .from('sequencing_data')
      .insert([
        {
          ...sequencingData,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (sequencingError) {
      return NextResponse.json(
        { error: 'Failed to create sequencing data', details: sequencingError.message },
        { status: 500 }
      );
    }

    const sequencingSamples = samples.map((sample) => ({
      ...sample,
      sequencing_id: sequencingRow.id,
    }));

    const { error: sampleError } = await supabase
      .from('sequencing_samples')
      .insert(sequencingSamples);

    if (sampleError) {
      return NextResponse.json(
        {
          error: 'Sequencing data created but sample upload failed',
          details: sampleError.message,
          sequencingId: sequencingRow.id,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        sequencingId: sequencingRow.id,
        sampleCount: sequencingSamples.length,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
