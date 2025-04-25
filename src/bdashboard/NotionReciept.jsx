import React from 'react';
import html2pdf from 'html2pdf.js';

export default function NotionReceipt() {
  const generatePDF = async () => {
    try {
      // 1. Fetch structured HTML from Cloudflare
      const response = await fetch('https://notion.sppathak1428.workers.dev/');
      const html = await response.text();
      
      // 2. Create temporary container with proper scaling
      const element = document.createElement('div');
      element.style.width = '210mm'; // A4 width
      element.style.margin = '0 auto';
      element.innerHTML = html;

      // 3. Configure PDF with proper rendering delays
      const options = {
        margin: 10,
        filename: 'receipt.pdf',
        html2canvas: { 
          scale: 2,
          logging: true,
          useCORS: true,
          letterRendering: true,
          async: true,
          onclone: (clonedDoc) => {
            clonedDoc.body.style.visibility = 'visible';
          }
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
      };

      // 4. Add loading state and delay
      const loading = document.createElement('div');
      loading.textContent = 'Generating PDF...';
      document.body.appendChild(loading);

      setTimeout(async () => {
        await html2pdf().set(options).from(element).save();
        document.body.removeChild(loading);
      }, 2000);

    } catch (error) {
      console.error('PDF Error:', error);
      alert('Failed to generate. Check console for details.');
    }
  };

  return (
    <button 
      onClick={generatePDF}
      style={{
        padding: '12px 24px',
        fontSize: '16px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Generate Receipt PDF
    </button>
  );
}