/**
 * MGR CLUB - Official Document Downloader Utility
 * 
 * Guarantees distinct, non-cached downloads for every official document,
 * constitutional clause, and policy instrument.
 * 
 * Uses direct fetch with cache: 'no-store' and Blob creation to prevent
 * browser download manager caching or repeating previously downloaded files.
 */

import { recordAuditEvent } from './telemetry';

export async function downloadDocumentPdf(pdfUrl, defaultFilename) {
  if (!pdfUrl) {
    console.error('downloadDocumentPdf: No pdfUrl provided');
    return;
  }

  const cleanFilename = defaultFilename || pdfUrl.split('/').pop().split('?')[0];

  // Record audit log event for compliance and fiduciary monitoring
  recordAuditEvent({
    actionType: 'download',
    actionSummary: `Downloaded official PDF: ${cleanFilename}`,
    targetResource: cleanFilename
  });

  try {
    const res = await fetch(`${pdfUrl}?_v=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch PDF: ${res.status} ${res.statusText}`);
    }

    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = cleanFilename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();

    setTimeout(() => {
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(blobUrl);
    }, 300);
  } catch (err) {
    console.warn('Blob download fallback to direct anchor link:', err);
    const anchor = document.createElement('a');
    anchor.href = `${pdfUrl}?_v=${Date.now()}`;
    anchor.download = cleanFilename;
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('rel', 'noopener noreferrer');
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();

    setTimeout(() => {
      document.body.removeChild(anchor);
    }, 300);
  }
}

