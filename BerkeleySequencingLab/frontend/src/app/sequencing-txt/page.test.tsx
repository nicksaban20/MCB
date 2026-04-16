import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SequencingTxtProcessor from './page';

describe('SequencingTxtProcessor', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    global.fetch = jest.fn();
  });

  it('uploads the selected file through the sequencing API', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        sequencingId: 'seq-123',
        sampleCount: 3,
      }),
    });

    render(<SequencingTxtProcessor />);

    const input = screen.getByLabelText(/select a sequencing text file/i);
    const file = new File(
      ['Container Name\tPlate ID\nTest\tPlate-1'],
      'sample-sequencing-upload.txt',
      { type: 'text/plain' }
    );
    Object.defineProperty(file, 'text', {
      value: async () => 'Container Name\tPlate ID\nTest\tPlate-1',
    });

    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: /process and upload/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/sequencing', expect.objectContaining({
        method: 'POST',
      }));
    });

    expect(await screen.findByText(/successfully processed and uploaded sequencing data/i)).toBeInTheDocument();
    expect(screen.getByText(/samples processed: 3/i)).toBeInTheDocument();
    expect(screen.getByText(/sequencing id: seq-123/i)).toBeInTheDocument();
  });
});
