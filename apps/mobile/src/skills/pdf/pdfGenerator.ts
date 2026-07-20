import MarkdownIt from 'markdown-it';
import * as print from 'expo-print';
import { material3Stylesheet } from './styles';

export async function generatePdf(markdownText: string): Promise<string> {
  const md = new MarkdownIt();
  const htmlContent = md.render(markdownText);

  const fullHtmlString = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          ${material3Stylesheet}
        </style>
      </head>
      <body>
        ${htmlContent}
        <div class="footer">
          Generated automatically by Quick_yt.
        </div>
      </body>
    </html>
  `;

  try {
    const result = await print.printToFileAsync({
      html: fullHtmlString,
    });
    return result.uri;
  } catch (error) {
    throw new Error(`PDF generation failed: ${(error as Error).message}`);
  }
}
