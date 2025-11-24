/**
 * PDF Generator
 * Generates professional PDFs from form templates and responses
 * Supports both blank forms and filled responses with company branding
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

    const colors = this.branding?.brandColors || { primary: '#3f51b5', accent: '#4caf50' };
    const primaryRGB = this.hexToRGB(colors.primary);
    const accentRGB = this.hexToRGB(colors.accent);

    let currentY = await this.addProfessionalHeader(doc, template.name, primaryRGB);

    const leftMargin = 20;
    const rightMargin = 20;
    const pageWidth = doc.internal.pageSize.getWidth() - leftMargin - rightMargin;
    const lineHeight = 6;

    // Iterate through sections and questions
    for (const section of template.sections) {
      // Check if we need a new page
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }

      // Add section header with background
      doc.setFillColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
      doc.rect(leftMargin, currentY - 6, pageWidth, 10, 'F');

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(section.title, leftMargin + 3, currentY);
      doc.setTextColor(0, 0, 0);
      currentY += 8;

      // Add section description if exists (but filter out the branding header)
      if (section.description) {
        const cleanDescription = this.cleanDescription(section.description);
        if (cleanDescription) {
          doc.setFontSize(9);
          doc.setFont(undefined, 'italic');
          doc.setTextColor(80, 80, 80);
          const descLines = doc.splitTextToSize(cleanDescription, pageWidth - 6);
          doc.text(descLines, leftMargin + 3, currentY);
          currentY += (descLines.length * 5) + 4;
          doc.setTextColor(0, 0, 0);
        }
      }

      // Add questions
      doc.setFontSize(10);
      for (const question of section.questions) {
        // Check if we need a new page
        if (currentY > 260) {
          doc.addPage();
          currentY = 20;
        }

        // Question number and label
        doc.setFont(undefined, 'bold');
        const questionText = `${question.required ? '* ' : ''}${question.label}`;
        const questionLines = doc.splitTextToSize(questionText, pageWidth - 10);
        doc.text(questionLines, leftMargin + 3, currentY);
        currentY += (questionLines.length * lineHeight) + 2;

        // Add answer space based on question type
        doc.setFont(undefined, 'normal');
        doc.setDrawColor(180, 180, 180);
        doc.setFillColor(250, 250, 250);

        switch (question.type) {
          case 'textarea':
            // Draw bordered box for textarea
            doc.roundedRect(leftMargin + 3, currentY, pageWidth - 6, 30, 2, 2);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('(Long text response)', leftMargin + 6, currentY + 5);
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            currentY += 34;
            break;

          case 'text':
            // Draw single bordered line
            doc.roundedRect(leftMargin + 3, currentY, pageWidth - 6, 8, 1, 1);
            currentY += 12;
            break;

          case 'checkbox':
            // Draw checkboxes with borders
            if (question.options) {
              question.options.forEach((option) => {
                doc.roundedRect(leftMargin + 6, currentY - 3, 4, 4, 0.5, 0.5);
                doc.setFontSize(9);
                doc.text(option, leftMargin + 13, currentY);
                doc.setFontSize(10);
                currentY += 6;
              });
            }
            currentY += 4;
            break;

          case 'radio':
            // Draw radio buttons
            if (question.options) {
              question.options.forEach((option) => {
                doc.circle(leftMargin + 8, currentY - 1.5, 2);
                doc.setFontSize(9);
                doc.text(option, leftMargin + 13, currentY);
                doc.setFontSize(10);
                currentY += 6;
              });
            }
            currentY += 4;
            break;

          case 'signature':
            // Draw signature box with label
            doc.roundedRect(leftMargin + 3, currentY, 80, 20, 2, 2);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('Signature:', leftMargin + 6, currentY + 4);
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            // Add date line next to signature
            doc.roundedRect(leftMargin + 90, currentY, 40, 20, 2, 2);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('Date:', leftMargin + 93, currentY + 4);
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            currentY += 24;
            break;

          default:
            doc.roundedRect(leftMargin + 3, currentY, pageWidth - 6, 8, 1, 1);
            currentY += 12;
        }

        currentY += 4; // Space between questions
      }

      currentY += 6; // Space between sections
    }

    await this.addProfessionalFooter(doc, primaryRGB);

    return doc;
  }

  /**
   * Generate a filled form PDF (from client response)
   */
  async generateFilledForm(template, response) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const colors = this.branding?.brandColors || { primary: '#3f51b5', accent: '#4caf50' };
    const primaryRGB = this.hexToRGB(colors.primary);
    const accentRGB = this.hexToRGB(colors.accent);

    let currentY = await this.addProfessionalHeader(doc, template.name, primaryRGB);

    const leftMargin = 20;
    const rightMargin = 20;
    const pageWidth = doc.internal.pageSize.getWidth() - leftMargin - rightMargin;
    const lineHeight = 6;

    // Add client info box
    if (response.clientName) {
      doc.setFillColor(240, 248, 255);
      doc.setDrawColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
      doc.roundedRect(leftMargin, currentY, pageWidth, 14, 2, 2);

      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(`Client: ${response.clientName}`, leftMargin + 4, currentY + 6);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(8);
      doc.text(`Submitted: ${new Date(response.submittedAt).toLocaleString()}`, leftMargin + 4, currentY + 11);
      currentY += 18;
    }

    // Iterate through sections and questions with answers
    for (const section of template.sections) {
      // Check if we need a new page
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }

      // Add section header with background
      doc.setFillColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
      doc.rect(leftMargin, currentY - 6, pageWidth, 10, 'F');

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(section.title, leftMargin + 3, currentY);
      doc.setTextColor(0, 0, 0);
      currentY += 8;

      // Add section description if exists (but filter out the branding header)
      if (section.description) {
        const cleanDescription = this.cleanDescription(section.description);
        if (cleanDescription) {
          doc.setFontSize(9);
          doc.setFont(undefined, 'italic');
          doc.setTextColor(80, 80, 80);
          const descLines = doc.splitTextToSize(cleanDescription, pageWidth - 6);
          doc.text(descLines, leftMargin + 3, currentY);
          currentY += (descLines.length * 5) + 4;
          doc.setTextColor(0, 0, 0);
        }
      }

      // Add questions with answers
      doc.setFontSize(10);
      for (const question of section.questions) {
        // Check if we need a new page
        if (currentY > 260) {
          doc.addPage();
          currentY = 20;
        }

        // Question label
        doc.setFont(undefined, 'bold');
        const questionText = question.label;
        const questionLines = doc.splitTextToSize(questionText, pageWidth - 10);
        doc.text(questionLines, leftMargin + 3, currentY);
        currentY += (questionLines.length * lineHeight) + 2;

        // Answer box
        doc.setFont(undefined, 'normal');
        const answer = response.answers[question.id];

        if (question.type === 'signature' && answer && answer.startsWith('data:image')) {
          // Add signature image in a bordered box
          doc.setDrawColor(200, 200, 200);
          doc.setFillColor(250, 250, 250);
          doc.roundedRect(leftMargin + 3, currentY, 70, 22, 2, 2, 'FD');

          try {
            doc.addImage(answer, 'PNG', leftMargin + 5, currentY + 1, 66, 20);
            currentY += 26;
          } catch (error) {
            console.error('[PDF] Failed to add signature:', error);
            doc.setTextColor(150, 150, 150);
            doc.text('(Signature not available)', leftMargin + 6, currentY + 6);
            doc.setTextColor(0, 0, 0);
            currentY += 10;
          }
        } else {
          // Text answer in a box
          const answerText = Array.isArray(answer) ? answer.join(', ') : (answer || '(No answer provided)');

          doc.setDrawColor(200, 200, 200);
          doc.setFillColor(250, 250, 250);

          const answerLines = doc.splitTextToSize(String(answerText), pageWidth - 12);
          const boxHeight = Math.max(10, (answerLines.length * lineHeight) + 4);

          doc.roundedRect(leftMargin + 3, currentY, pageWidth - 6, boxHeight, 2, 2, 'FD');

          doc.setFontSize(9);
          doc.setTextColor(40, 40, 40);
          doc.text(answerLines, leftMargin + 6, currentY + 6);
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          currentY += boxHeight + 2;
        }

        currentY += 4; // Space between questions
      }

      currentY += 6; // Space between sections
    }

    await this.addProfessionalFooter(doc, primaryRGB);

    return doc;
  }

  /**
   * Add professional branded header to PDF
   */
  async addProfessionalHeader(doc, formTitle, primaryRGB) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const branding = this.branding;

    // Add colored header bar
    doc.setFillColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
    doc.rect(0, 0, pageWidth, 25, 'F');

    // Add logo if available
    if (branding?.logo) {
      try {
        // Logo on the right side
        doc.addImage(branding.logo, 'PNG', pageWidth - 55, 5, 50, 15, undefined, 'FAST');
      } catch (error) {
        console.error('[PDF] Failed to add logo:', error);
      }
    }

    // Company name in white on colored background
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(branding?.companyName || 'Company Name', 15, 12);

    // Contact info in white
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    let contactInfo = [];
    if (branding?.phone) contactInfo.push(branding.phone);
    if (branding?.email) contactInfo.push(branding.email);
    if (branding?.website) contactInfo.push(branding.website);

    if (contactInfo.length > 0) {
      doc.text(contactInfo.join(' • '), 15, 19);
    }

    // Form title below header
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(formTitle, 20, 35);

    // Decorative line
    doc.setDrawColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
    doc.setLineWidth(0.5);
    doc.line(20, 38, pageWidth - 20, 38);
    doc.setLineWidth(0.2);

    return 44; // Return Y position for content to start
  }

  /**
   * Add professional footer to PDF
   */
  async addProfessionalFooter(doc, primaryRGB) {
    const pageCount = doc.internal.getNumberOfPages();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Footer line
      doc.setDrawColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
      doc.setLineWidth(0.3);
      doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
      doc.setLineWidth(0.2);

      // Page number on left
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${pageCount}`, 20, pageHeight - 15);

      // Timestamp on right
      doc.text(
        `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        pageWidth - 20,
        pageHeight - 15,
        { align: 'right' }
      );

      // Privacy badge
      if (this.branding) {
        doc.setFontSize(7);
        doc.setTextColor(120, 120, 120);
        doc.text(
          'Confidential & Proprietary',
          pageWidth / 2,
          pageHeight - 15,
          { align: 'center' }
        );
      }
    }

    doc.setTextColor(0, 0, 0);
  }

  /**
   * Clean section description from auto-branding text
   */
  cleanDescription(description) {
    if (!description) return '';

    // Remove the auto-branding header that starts and ends with ━━━
    const lines = description.split('\n');
    const filteredLines = [];
    let skipMode = false;

    for (const line of lines) {
      if (line.includes('━━━━━━━━━━━━━━━')) {
        skipMode = !skipMode;
        continue;
      }
      if (!skipMode && line.trim() && !line.includes('[Company Logo]') && !line.includes('Provided by:')) {
        filteredLines.push(line);
      }
    }

    return filteredLines.join('\n').trim();
  }

  /**
   * Convert hex color to RGB
   */
  hexToRGB(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 63, g: 81, b: 181 }; // Default blue
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
