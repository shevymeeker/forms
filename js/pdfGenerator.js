/**
 * PDF Generator
 * Generates PDFs from form templates and responses
 * Supports both blank forms and filled responses
 */

class PDFGenerator {
  constructor() {
    this.branding = null;
  }

  async init() {
    this.branding = await window.DB.getBranding();
  }

  /**
   * Generate a blank form PDF (for printing and hand-filling)
   */
  async generateBlankForm(template) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    await this.addHeader(doc, template.name);

    let currentY = 50;
    const leftMargin = 15;
    const pageWidth = doc.internal.pageSize.getWidth() - (leftMargin * 2);
    const lineHeight = 7;

    // Iterate through sections and questions
    for (const section of template.sections) {
      // Check if we need a new page
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      // Add section title
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      const sectionLines = doc.splitTextToSize(section.title, pageWidth);
      doc.text(sectionLines, leftMargin, currentY);
      currentY += (sectionLines.length * lineHeight) + 5;

      // Add section description if exists
      if (section.description) {
        doc.setFontSize(10);
        doc.setFont(undefined, 'italic');
        doc.setTextColor(100, 100, 100);
        const descLines = doc.splitTextToSize(section.description, pageWidth);
        doc.text(descLines, leftMargin, currentY);
        currentY += (descLines.length * 6) + 5;
        doc.setTextColor(0, 0, 0);
      }

      // Add questions
      doc.setFontSize(11);
      for (const question of section.questions) {
        // Check if we need a new page
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }

        // Add question text
        doc.setFont(undefined, 'bold');
        const questionLines = doc.splitTextToSize(question.label, pageWidth - 10);
        doc.text(questionLines, leftMargin + 5, currentY);
        currentY += (questionLines.length * lineHeight);

        // Add answer space based on question type
        doc.setFont(undefined, 'normal');
        doc.setDrawColor(200, 200, 200);

        switch (question.type) {
          case 'textarea':
            // Draw multiple lines for textarea
            for (let i = 0; i < 4; i++) {
              doc.line(leftMargin + 5, currentY + (i * 8), pageWidth + leftMargin - 5, currentY + (i * 8));
            }
            currentY += 35;
            break;

          case 'text':
            // Draw single line for text input
            doc.line(leftMargin + 5, currentY, pageWidth + leftMargin - 5, currentY);
            currentY += 12;
            break;

          case 'checkbox':
            // Draw checkboxes
            if (question.options) {
              question.options.forEach((option) => {
                doc.rect(leftMargin + 10, currentY - 4, 4, 4);
                doc.text(option, leftMargin + 18, currentY);
                currentY += 8;
              });
            }
            currentY += 5;
            break;

          case 'radio':
            // Draw radio buttons
            if (question.options) {
              question.options.forEach((option) => {
                doc.circle(leftMargin + 12, currentY - 2, 2);
                doc.text(option, leftMargin + 18, currentY);
                currentY += 8;
              });
            }
            currentY += 5;
            break;

          case 'signature':
            // Draw signature box
            doc.rect(leftMargin + 5, currentY, 80, 20);
            doc.setFontSize(9);
            doc.text('Signature', leftMargin + 7, currentY + 25);
            doc.setFontSize(11);
            currentY += 30;
            break;

          default:
            doc.line(leftMargin + 5, currentY, pageWidth + leftMargin - 5, currentY);
            currentY += 12;
        }

        currentY += 3; // Space between questions
      }

      currentY += 8; // Space between sections
    }

    await this.addFooter(doc);

    return doc;
  }

  /**
   * Generate a filled form PDF (from client response)
   */
  async generateFilledForm(template, response) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    await this.addHeader(doc, template.name);

    // Add client info if available
    if (response.clientName) {
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`Client: ${response.clientName}`, 15, 45);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.text(`Submitted: ${new Date(response.submittedAt).toLocaleString()}`, 15, 50);
    }

    let currentY = response.clientName ? 60 : 50;
    const leftMargin = 15;
    const pageWidth = doc.internal.pageSize.getWidth() - (leftMargin * 2);
    const lineHeight = 7;

    // Iterate through sections and questions with answers
    for (const section of template.sections) {
      // Check if we need a new page
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      // Add section title
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(63, 81, 181); // Blue color
      const sectionLines = doc.splitTextToSize(section.title, pageWidth);
      doc.text(sectionLines, leftMargin, currentY);
      currentY += (sectionLines.length * lineHeight) + 5;
      doc.setTextColor(0, 0, 0);

      // Add section description if exists
      if (section.description) {
        doc.setFontSize(10);
        doc.setFont(undefined, 'italic');
        doc.setTextColor(100, 100, 100);
        const descLines = doc.splitTextToSize(section.description, pageWidth);
        doc.text(descLines, leftMargin, currentY);
        currentY += (descLines.length * 6) + 5;
        doc.setTextColor(0, 0, 0);
      }

      // Add questions with answers
      doc.setFontSize(11);
      for (const question of section.questions) {
        // Check if we need a new page
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }

        // Add question text
        doc.setFont(undefined, 'bold');
        const questionLines = doc.splitTextToSize(question.label, pageWidth - 10);
        doc.text(questionLines, leftMargin + 5, currentY);
        currentY += (questionLines.length * lineHeight) + 2;

        // Add answer
        doc.setFont(undefined, 'normal');
        const answer = response.answers[question.id] || 'No answer provided';

        if (question.type === 'signature' && answer && answer.startsWith('data:image')) {
          // Add signature image
          try {
            doc.addImage(answer, 'PNG', leftMargin + 5, currentY, 60, 20);
            currentY += 25;
          } catch (error) {
            console.error('[PDF] Failed to add signature:', error);
            doc.text('Signature not available', leftMargin + 5, currentY);
            currentY += 10;
          }
        } else {
          // Add text answer
          const answerLines = doc.splitTextToSize(String(answer), pageWidth - 10);
          doc.setTextColor(80, 80, 80);
          doc.text(answerLines, leftMargin + 5, currentY);
          doc.setTextColor(0, 0, 0);
          currentY += (answerLines.length * lineHeight) + 5;
        }

        currentY += 3; // Space between questions
      }

      currentY += 8; // Space between sections
    }

    await this.addFooter(doc);

    return doc;
  }

  /**
   * Add branded header to PDF
   */
  async addHeader(doc, formTitle) {
    const branding = this.branding;

    // Add company name
    if (branding && branding.companyName) {
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(63, 81, 181); // Brand color
      doc.text(branding.companyName, 15, 15);
      doc.setTextColor(0, 0, 0);

      // Add company contact info
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      let contactY = 21;
      if (branding.email) {
        doc.text(branding.email, 15, contactY);
        contactY += 4;
      }
      if (branding.phone) {
        doc.text(branding.phone, 15, contactY);
        contactY += 4;
      }
      if (branding.website) {
        doc.text(branding.website, 15, contactY);
      }
    }

    // Add form title
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(formTitle, 15, 35);

    // Add line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 38, doc.internal.pageSize.getWidth() - 15, 38);
  }

  /**
   * Add footer to PDF
   */
  async addFooter(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Add page number
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );

      // Add timestamp
      doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        pageWidth - 15,
        pageHeight - 10,
        { align: 'right' }
      );
    }

    doc.setTextColor(0, 0, 0);
  }

  /**
   * Download a PDF
   */
  download(doc, filename) {
    doc.save(filename);
  }
}

// Create singleton instance
const pdfGenerator = new PDFGenerator();

// Export for use in other modules
window.PDFGenerator = pdfGenerator;
