import { generatePdf } from '../../src/skills/pdf/pdfGenerator';
import * as print from 'expo-print';

describe('generatePdf()', () => {
  it('converts markdown to HTML, injects stylesheet, and calls expo-print', async () => {
    const mdText = '# Test Heading\nSome **bold** text.';

    const mockPrintToFile = print.printToFileAsync as jest.Mock;
    mockPrintToFile.mockResolvedValueOnce({ uri: 'file://path/to/mocked.pdf' });

    const pdfUri = await generatePdf(mdText);

    expect(pdfUri).toBe('file://path/to/mocked.pdf');
    expect(mockPrintToFile).toHaveBeenCalledTimes(1);

    const [options] = mockPrintToFile.mock.calls[0];
    expect(options.html).toContain('Test Heading');
    expect(options.html).toContain('<strong>bold</strong>');
    expect(options.html).toContain('Outfit');
    expect(options.html).toContain('--md-sys-color-primary');
  });

  it('throws on print service failure', async () => {
    const mockPrintToFile = print.printToFileAsync as jest.Mock;
    mockPrintToFile.mockRejectedValueOnce(new Error('Printer spooler crashed'));

    await expect(generatePdf('Simple doc')).rejects.toThrow('Printer spooler crashed');
  });
});
