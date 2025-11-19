/**
 * Main Application
 * Coordinates all modules and handles view rendering
 */

class App {
  constructor() {
    this.branding = null;
    this.currentSignaturePad = null;
    this.isOnline = navigator.onLine;
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      // Show loading state
      this.showLoader();

      // Initialize database
      await window.DB.init();
      console.log('[App] Database initialized');

      // Initialize PDF generator
      await window.PDFGenerator.init();
      console.log('[App] PDF Generator initialized');

      // Check if branding exists
      this.branding = await window.DB.getBranding();

      // Register service worker
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('[App] Service Worker registered:', registration);

          // Listen for service worker messages
          navigator.serviceWorker.addEventListener('message', this.handleSWMessage.bind(this));
        } catch (error) {
          console.error('[App] Service Worker registration failed:', error);
        }
      }

      // Set up network status listeners
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.showNotification('Back online', 'success');
        this.requestBackgroundSync();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.showNotification('You are offline - app will continue to work', 'info');
      });

      // Register routes
      this.registerRoutes();

      // Initialize router
      window.Router.init();

      // Hide loader
      this.hideLoader();

      // Log app start
      await window.DB.logEvent('app_start', { online: this.isOnline });

    } catch (error) {
      console.error('[App] Initialization failed:', error);
      this.showNotification('Failed to initialize app: ' + error.message, 'error');
    }
  }

  /**
   * Register all application routes
   */
  registerRoutes() {
    // Check if first-time setup is needed
    window.Router.setBeforeNavigate(async (path) => {
      if (path !== '/setup' && !this.branding) {
        window.Router.navigate('/setup');
        return false;
      }
      return true;
    });

    // Route definitions
    window.Router.register('/', () => this.renderDashboard());
    window.Router.register('/setup', () => this.renderSetup());
    window.Router.register('/dashboard', () => this.renderDashboard());
    window.Router.register('/templates', () => this.renderTemplates());
    window.Router.register('/builder', (params) => this.renderBuilder(params));
    window.Router.register('/fill', (params) => this.renderFillForm(params));
    window.Router.register('/responses', () => this.renderResponses());
    window.Router.register('/settings', () => this.renderSettings());
    window.Router.register('/analytics', () => this.renderAnalytics());
  }

  /**
   * Handle messages from service worker
   */
  handleSWMessage(event) {
    const { type, success, error } = event.data;

    if (type === 'SYNC_START') {
      this.showNotification('Syncing data...', 'info');
    } else if (type === 'SYNC_COMPLETE') {
      if (success) {
        this.showNotification('Data synced successfully', 'success');
      } else {
        this.showNotification('Sync failed: ' + error, 'error');
      }
    }
  }

  /**
   * Request background sync when online
   */
  async requestBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('backup-data');
        console.log('[App] Background sync requested');
      } catch (error) {
        console.error('[App] Background sync failed:', error);
      }
    }
  }

  /**
   * Render setup view (first-time branding setup)
   */
  async renderSetup() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="container container-sm">
        <div class="card">
          <div class="card-header">
            <div>
              <h1 class="card-title">Welcome! Let's Set Up Your Business</h1>
              <p class="card-subtitle">This information will appear on all your forms</p>
            </div>
          </div>
          <div class="card-body">
            <form id="setupForm">
              <div class="form-group">
                <label for="companyName" class="required">Company Name</label>
                <input type="text" id="companyName" required value="${this.branding?.companyName || ''}">
              </div>

              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" value="${this.branding?.email || ''}">
              </div>

              <div class="form-group">
                <label for="phone">Phone</label>
                <input type="tel" id="phone" value="${this.branding?.phone || ''}">
              </div>

              <div class="form-group">
                <label for="website">Website</label>
                <input type="url" id="website" value="${this.branding?.website || ''}">
              </div>

              <div class="form-group">
                <label for="address">Address</label>
                <textarea id="address" rows="3">${this.branding?.address || ''}</textarea>
              </div>

              <div class="alert alert-info">
                <strong>Offline First:</strong> All your data is stored locally on this device.
                No internet connection required after initial setup!
              </div>

              <div class="card-footer">
                <button type="submit" class="btn btn-primary btn-lg btn-block">
                  ${this.branding ? 'Update Settings' : 'Complete Setup & Get Started'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    // Handle form submission
    document.getElementById('setupForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const brandingData = {
        companyName: document.getElementById('companyName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        website: document.getElementById('website').value,
        address: document.getElementById('address').value
      };

      try {
        await window.DB.saveBranding(brandingData);
        this.branding = await window.DB.getBranding();
        await window.PDFGenerator.init(); // Reinitialize with new branding

        this.showNotification('Settings saved successfully!', 'success');
        window.Router.navigate('/dashboard');

        await window.DB.logEvent('branding_setup', { isFirstTime: !this.branding });
      } catch (error) {
        this.showNotification('Failed to save settings: ' + error.message, 'error');
      }
    });
  }

  /**
   * Render dashboard view
   */
  async renderDashboard() {
    const templates = await window.DB.getAllTemplates();
    const responses = await window.DB.getAllResponses();

    const app = document.getElementById('app');
    app.innerHTML = `
      <header>
        <div class="container">
          <h1>${this.branding?.companyName || 'Form Builder'}</h1>
          <nav>
            <button onclick="window.Router.navigate('/settings')">Settings</button>
            <button onclick="window.Router.navigate('/analytics')">Analytics</button>
          </nav>
        </div>
      </header>

      <main>
        <div class="container">
          <h2>Dashboard</h2>
          <p class="text-muted">Manage your forms and client responses</p>

          <div class="dashboard-grid">
            <div class="dashboard-card" onclick="window.Router.navigate('/builder')">
              <div class="dashboard-card-icon">📝</div>
              <h3 class="dashboard-card-title">Create New Form</h3>
              <p class="dashboard-card-description">Build a custom onboarding form</p>
            </div>

            <div class="dashboard-card" onclick="window.Router.navigate('/templates')">
              <div class="dashboard-card-icon">📋</div>
              <h3 class="dashboard-card-title">My Templates</h3>
              <p class="dashboard-card-description">${templates.length} template${templates.length !== 1 ? 's' : ''}</p>
            </div>

            <div class="dashboard-card" onclick="window.Router.navigate('/responses')">
              <div class="dashboard-card-icon">📊</div>
              <h3 class="dashboard-card-title">View Responses</h3>
              <p class="dashboard-card-description">${responses.length} response${responses.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div class="card mt-4">
            <div class="card-header">
              <div>
                <h3 class="card-title">Quick Start Guide</h3>
              </div>
            </div>
            <div class="card-body">
              <ol style="padding-left: 1.5rem;">
                <li><strong>Create a Form Template:</strong> Click "Create New Form" to build your custom client onboarding form</li>
                <li><strong>Fill Out Forms:</strong> Select a template and hand your device to clients to fill out digitally</li>
                <li><strong>Export as PDF:</strong> Generate blank PDFs for printing or filled PDFs with client responses</li>
                <li><strong>Manage Data:</strong> View all responses, export data, and sync when online</li>
              </ol>

              <div class="alert alert-success mt-3">
                <strong>✓ Fully Offline:</strong> This app works 100% offline after installation.
                All data is stored securely on your device.
                ${this.isOnline ? '' : ' <br><strong>You are currently offline</strong> - all features still work!'}
              </div>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  /**
   * Render templates list view
   */
  async renderTemplates() {
    const templates = await window.DB.getAllTemplates();

    const app = document.getElementById('app');
    app.innerHTML = `
      <header>
        <div class="container">
          <h1>${this.branding?.companyName || 'Form Builder'}</h1>
          <nav>
            <button onclick="window.Router.navigate('/dashboard')">Dashboard</button>
            <button onclick="window.Router.navigate('/builder')">New Template</button>
          </nav>
        </div>
      </header>

      <main>
        <div class="container">
          <h2>My Form Templates</h2>
          <p class="text-muted">Create, edit, and manage your form templates</p>

          ${templates.length === 0 ? `
            <div class="card text-center">
              <div class="card-body">
                <div style="font-size: 4rem; margin-bottom: 1rem;">📝</div>
                <h3>No templates yet</h3>
                <p class="text-muted">Create your first form template to get started</p>
                <button class="btn btn-primary mt-3" onclick="window.Router.navigate('/builder')">
                  Create First Template
                </button>
              </div>
            </div>
          ` : `
            <div class="card">
              <div class="card-body">
                ${templates.map(template => {
                  const questionCount = template.sections.reduce((sum, s) => sum + s.questions.length, 0);
                  return `
                    <div class="template-list-item">
                      <div class="template-info">
                        <h3>${template.name}</h3>
                        <div class="template-meta">
                          ${template.sections.length} sections • ${questionCount} questions •
                          Created ${new Date(template.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div class="template-actions">
                        <button class="btn btn-sm btn-primary" onclick="app.navigateToFill(${template.id})">
                          Fill Form
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="app.editTemplate(${template.id})">
                          Edit
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="app.duplicateTemplate(${template.id})">
                          Duplicate
                        </button>
                        <button class="btn btn-sm btn-success" onclick="app.exportBlankPDF(${template.id})">
                          Export PDF
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="app.deleteTemplate(${template.id})">
                          Delete
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `}
        </div>
      </main>
    `;
  }

  /**
   * Render form builder view
   */
  async renderBuilder(params = {}) {
    const templateId = params.id;

    if (templateId) {
      await window.FormBuilder.loadTemplate(parseInt(templateId));
    } else {
      window.FormBuilder.initNewTemplate();
    }

    const template = window.FormBuilder.getTemplate();

    const app = document.getElementById('app');
    app.innerHTML = `
      <header>
        <div class="container">
          <h1>Form Builder</h1>
          <nav>
            <button onclick="window.Router.navigate('/templates')">Cancel</button>
            <button class="btn-primary" onclick="app.previewTemplate()">Preview</button>
            <button class="btn-success" onclick="app.saveTemplate()">Save Template</button>
          </nav>
        </div>
      </header>

      <main>
        <div class="container container-sm">
          <div class="card">
            <div class="card-body">
              <div class="form-group">
                <label for="templateName" class="required">Form Name</label>
                <input type="text" id="templateName" value="${template.name}"
                  onchange="window.FormBuilder.currentTemplate.name = this.value"
                  placeholder="e.g., Client Intake Form">
              </div>
            </div>
          </div>

          <div id="sectionsContainer"></div>

          <button class="btn btn-outline btn-block" onclick="app.addSection()">
            + Add Section
          </button>
        </div>
      </main>
    `;

    this.renderSections();
  }

  /**
   * Render form sections in builder
   */
  renderSections() {
    const template = window.FormBuilder.getTemplate();
    const container = document.getElementById('sectionsContainer');

    container.innerHTML = template.sections.map((section, sectionIndex) => `
      <div class="builder-section" data-section-id="${section.id}">
        <div class="builder-section-header">
          <div style="flex: 1;">
            <input type="text" value="${section.title}"
              onchange="window.FormBuilder.updateSection('${section.id}', { title: this.value })"
              placeholder="Section Title"
              style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">
            <input type="text" value="${section.description}"
              onchange="window.FormBuilder.updateSection('${section.id}', { description: this.value })"
              placeholder="Section Description (optional)"
              class="text-muted">
          </div>
          <div class="builder-section-controls">
            ${sectionIndex > 0 ? `<button class="btn btn-sm" onclick="app.moveSection('${section.id}', 'up')">↑</button>` : ''}
            ${sectionIndex < template.sections.length - 1 ? `<button class="btn btn-sm" onclick="app.moveSection('${section.id}', 'down')">↓</button>` : ''}
            ${template.sections.length > 1 ? `<button class="btn btn-sm btn-danger" onclick="app.removeSection('${section.id}')">Delete</button>` : ''}
          </div>
        </div>

        <div id="questions-${section.id}">
          ${section.questions.map((question, qIndex) => this.renderQuestion(section.id, question, qIndex, section.questions.length)).join('')}
        </div>

        <div class="btn-group mt-2">
          <button class="btn btn-sm btn-outline" onclick="app.addQuestion('${section.id}', 'text')">+ Short Text</button>
          <button class="btn btn-sm btn-outline" onclick="app.addQuestion('${section.id}', 'textarea')">+ Long Text</button>
          <button class="btn btn-sm btn-outline" onclick="app.addQuestion('${section.id}', 'checkbox')">+ Checkboxes</button>
          <button class="btn btn-sm btn-outline" onclick="app.addQuestion('${section.id}', 'radio')">+ Multiple Choice</button>
          <button class="btn btn-sm btn-outline" onclick="app.addQuestion('${section.id}', 'signature')">+ Signature</button>
        </div>
      </div>
    `).join('');
  }

  /**
   * Render a question in the builder
   */
  renderQuestion(sectionId, question, qIndex, totalQuestions) {
    const hasOptions = ['checkbox', 'radio', 'select'].includes(question.type);

    return `
      <div class="builder-question" data-question-id="${question.id}">
        <div class="builder-question-header">
          <div style="flex: 1;">
            <span class="builder-question-type">${window.FormBuilder.getQuestionTypeLabel(question.type)}</span>
          </div>
          <div class="builder-question-controls">
            ${qIndex > 0 ? `<button class="btn btn-sm" onclick="app.moveQuestion('${sectionId}', '${question.id}', 'up')">↑</button>` : ''}
            ${qIndex < totalQuestions - 1 ? `<button class="btn btn-sm" onclick="app.moveQuestion('${sectionId}', '${question.id}', 'down')">↓</button>` : ''}
            <button class="btn btn-sm btn-danger" onclick="app.removeQuestion('${sectionId}', '${question.id}')">×</button>
          </div>
        </div>

        <div class="form-group">
          <input type="text" value="${question.label}"
            onchange="window.FormBuilder.updateQuestion('${sectionId}', '${question.id}', { label: this.value })"
            placeholder="Question text">
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" ${question.required ? 'checked' : ''}
              onchange="window.FormBuilder.updateQuestion('${sectionId}', '${question.id}', { required: this.checked })">
            Required
          </label>
        </div>

        ${hasOptions ? `
          <div class="builder-options">
            <label>Options:</label>
            ${question.options.map((option, optIndex) => `
              <div class="builder-option">
                <input type="text" value="${option}"
                  onchange="window.FormBuilder.updateQuestionOption('${sectionId}', '${question.id}', ${optIndex}, this.value)">
                ${question.options.length > 2 ? `
                  <button class="btn btn-sm btn-danger"
                    onclick="app.removeQuestionOption('${sectionId}', '${question.id}', ${optIndex})">×</button>
                ` : ''}
              </div>
            `).join('')}
            <button class="btn btn-sm btn-outline mt-1"
              onclick="app.addQuestionOption('${sectionId}', '${question.id}')">+ Add Option</button>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Builder action methods
  addSection() {
    window.FormBuilder.addSection();
    this.renderSections();
  }

  removeSection(sectionId) {
    if (confirm('Delete this section?')) {
      window.FormBuilder.removeSection(sectionId);
      this.renderSections();
    }
  }

  moveSection(sectionId, direction) {
    window.FormBuilder.moveSection(sectionId, direction);
    this.renderSections();
  }

  addQuestion(sectionId, type) {
    window.FormBuilder.addQuestion(sectionId, type);
    this.renderSections();
  }

  removeQuestion(sectionId, questionId) {
    if (confirm('Delete this question?')) {
      window.FormBuilder.removeQuestion(sectionId, questionId);
      this.renderSections();
    }
  }

  moveQuestion(sectionId, questionId, direction) {
    window.FormBuilder.moveQuestion(sectionId, questionId, direction);
    this.renderSections();
  }

  addQuestionOption(sectionId, questionId) {
    window.FormBuilder.addQuestionOption(sectionId, questionId);
    this.renderSections();
  }

  removeQuestionOption(sectionId, questionId, optionIndex) {
    window.FormBuilder.removeQuestionOption(sectionId, questionId, optionIndex);
    this.renderSections();
  }

  async saveTemplate() {
    try {
      const id = await window.FormBuilder.saveTemplate();
      this.showNotification('Template saved successfully!', 'success');
      window.Router.navigate('/templates');
    } catch (error) {
      this.showNotification('Save failed: ' + error.message, 'error');
    }
  }

  previewTemplate() {
    // TODO: Implement preview in modal
    alert('Preview functionality coming soon!');
  }

  // Template action methods
  editTemplate(templateId) {
    window.Router.navigate('/builder', { id: templateId });
  }

  navigateToFill(templateId) {
    window.Router.navigate('/fill', { id: templateId });
  }

  async duplicateTemplate(templateId) {
    try {
      const newId = await window.FormBuilder.duplicateTemplate(templateId);
      this.showNotification('Template duplicated successfully!', 'success');
      window.Router.navigate('/templates');
    } catch (error) {
      this.showNotification('Duplication failed: ' + error.message, 'error');
    }
  }

  async exportBlankPDF(templateId) {
    try {
      const template = await window.DB.getTemplate(templateId);
      const doc = await window.PDFGenerator.generateBlankForm(template);
      window.PDFGenerator.download(doc, `${template.name} - Blank.pdf`);
      this.showNotification('PDF exported successfully!', 'success');
      await window.DB.logEvent('pdf_export', { templateId, type: 'blank' });
    } catch (error) {
      this.showNotification('PDF export failed: ' + error.message, 'error');
    }
  }

  async deleteTemplate(templateId) {
    if (confirm('Delete this template? This cannot be undone.')) {
      try {
        await window.DB.deleteTemplate(templateId);
        this.showNotification('Template deleted', 'success');
        window.Router.navigate('/templates');
      } catch (error) {
        this.showNotification('Delete failed: ' + error.message, 'error');
      }
    }
  }

  /**
   * Render form filling view (for clients)
   */
  async renderFillForm(params = {}) {
    const templateId = parseInt(params.id);
    const template = await window.DB.getTemplate(templateId);

    if (!template) {
      this.showNotification('Template not found', 'error');
      window.Router.navigate('/templates');
      return;
    }

    const app = document.getElementById('app');
    app.innerHTML = `
      <header>
        <div class="container">
          <h1>${template.name}</h1>
          <nav>
            <button onclick="window.Router.navigate('/templates')">Cancel</button>
            <button class="btn-success" onclick="app.submitResponse()">Submit</button>
          </nav>
        </div>
      </header>

      <main>
        <div class="container container-sm">
          <div class="card">
            <div class="card-body">
              <div class="form-group">
                <label for="clientName">Client Name (Optional)</label>
                <input type="text" id="clientName" placeholder="Enter client name">
                <div class="form-help">This helps you identify the response later</div>
              </div>
            </div>
          </div>

          <form id="responseForm" data-template-id="${templateId}">
            ${template.sections.map(section => `
              <div class="response-section">
                <h2 class="response-section-title">${section.title}</h2>
                ${section.description ? `<p class="response-section-description">${section.description}</p>` : ''}

                ${section.questions.map(question => this.renderFormQuestion(question)).join('')}
              </div>
            `).join('')}
          </form>
        </div>
      </main>
    `;

    // Initialize signature pads
    document.querySelectorAll('.signature-pad').forEach(canvas => {
      const questionId = canvas.dataset.questionId;
      const signatureManager = new window.SignatureManager(canvas);
      canvas.signatureManager = signatureManager;
    });
  }

  /**
   * Render a form question for client to fill
   */
  renderFormQuestion(question) {
    const requiredAttr = question.required ? 'required' : '';
    const requiredLabel = question.required ? '<span class="text-error">*</span>' : '';

    let inputHtml = '';

    switch (question.type) {
      case 'text':
        inputHtml = `<input type="text" id="q-${question.id}" ${requiredAttr}>`;
        break;

      case 'textarea':
        inputHtml = `<textarea id="q-${question.id}" rows="5" ${requiredAttr}></textarea>`;
        break;

      case 'checkbox':
        inputHtml = question.options.map((option, index) => `
          <div>
            <label>
              <input type="checkbox" name="q-${question.id}" value="${option}">
              ${option}
            </label>
          </div>
        `).join('');
        break;

      case 'radio':
        inputHtml = question.options.map((option, index) => `
          <div>
            <label>
              <input type="radio" name="q-${question.id}" value="${option}" ${requiredAttr}>
              ${option}
            </label>
          </div>
        `).join('');
        break;

      case 'select':
        inputHtml = `
          <select id="q-${question.id}" ${requiredAttr}>
            <option value="">-- Select --</option>
            ${question.options.map(option => `<option value="${option}">${option}</option>`).join('')}
          </select>
        `;
        break;

      case 'signature':
        inputHtml = `
          <div class="signature-pad-container">
            <canvas class="signature-pad" data-question-id="${question.id}"></canvas>
            <div class="signature-pad-footer">
              <span class="text-muted">Sign above</span>
              <button type="button" class="btn btn-sm btn-secondary"
                onclick="document.querySelector('[data-question-id=\\'${question.id}\\']').signatureManager.clear()">
                Clear
              </button>
            </div>
          </div>
        `;
        break;

      default:
        inputHtml = `<input type="text" id="q-${question.id}" ${requiredAttr}>`;
    }

    return `
      <div class="response-question form-group">
        <label ${question.type === 'checkbox' ? '' : `for="q-${question.id}"`}>
          ${question.label} ${requiredLabel}
        </label>
        ${inputHtml}
      </div>
    `;
  }

  /**
   * Submit client response
   */
  async submitResponse() {
    const form = document.getElementById('responseForm');
    const templateId = parseInt(form.dataset.templateId);
    const template = await window.DB.getTemplate(templateId);

    // Collect answers
    const answers = {};
    let hasErrors = false;

    for (const section of template.sections) {
      for (const question of section.questions) {
        const questionId = question.id;

        if (question.type === 'checkbox') {
          const checkboxes = document.querySelectorAll(`input[name="q-${questionId}"]:checked`);
          answers[questionId] = Array.from(checkboxes).map(cb => cb.value);

          if (question.required && answers[questionId].length === 0) {
            hasErrors = true;
            this.showNotification(`Please answer: ${question.label}`, 'error');
          }
        } else if (question.type === 'signature') {
          const canvas = document.querySelector(`[data-question-id="${questionId}"]`);
          if (canvas && canvas.signatureManager) {
            const dataURL = canvas.signatureManager.getDataURL();
            if (dataURL) {
              answers[questionId] = dataURL;
            } else if (question.required) {
              hasErrors = true;
              this.showNotification(`Please provide signature: ${question.label}`, 'error');
            }
          }
        } else {
          const element = document.getElementById(`q-${questionId}`);
          if (element) {
            answers[questionId] = element.value;

            if (question.required && !answers[questionId]) {
              hasErrors = true;
              this.showNotification(`Please answer: ${question.label}`, 'error');
            }
          }
        }
      }
    }

    if (hasErrors) {
      return;
    }

    // Save response
    try {
      const response = {
        templateId,
        clientName: document.getElementById('clientName').value,
        answers
      };

      await window.DB.saveResponse(response);
      await window.DB.logEvent('form_submitted', { templateId, clientName: response.clientName });

      this.showNotification('Response saved successfully!', 'success');

      // Ask if they want to export PDF
      if (confirm('Response saved! Export as PDF?')) {
        const doc = await window.PDFGenerator.generateFilledForm(template, response);
        const fileName = response.clientName ?
          `${template.name} - ${response.clientName}.pdf` :
          `${template.name} - Response.pdf`;
        window.PDFGenerator.download(doc, fileName);
      }

      window.Router.navigate('/responses');
    } catch (error) {
      this.showNotification('Failed to save response: ' + error.message, 'error');
    }
  }

  /**
   * Render responses list view
   */
  async renderResponses() {
    const responses = await window.DB.getAllResponses();
    const templates = await window.DB.getAllTemplates();

    const app = document.getElementById('app');
    app.innerHTML = `
      <header>
        <div class="container">
          <h1>Client Responses</h1>
          <nav>
            <button onclick="window.Router.navigate('/dashboard')">Dashboard</button>
            ${responses.length > 0 ? `<button class="btn-success" onclick="app.exportAllData()">Export All Data</button>` : ''}
          </nav>
        </div>
      </header>

      <main>
        <div class="container">
          <h2>Client Responses</h2>
          <p class="text-muted">View and export submitted forms</p>

          ${responses.length === 0 ? `
            <div class="card text-center">
              <div class="card-body">
                <div style="font-size: 4rem; margin-bottom: 1rem;">📊</div>
                <h3>No responses yet</h3>
                <p class="text-muted">Responses will appear here after clients fill out forms</p>
              </div>
            </div>
          ` : `
            <div class="card">
              <div class="card-body">
                ${responses.reverse().map(response => {
                  const template = templates.find(t => t.id === response.templateId);
                  const templateName = template ? template.name : 'Unknown Template';
                  return `
                    <div class="template-list-item">
                      <div class="template-info">
                        <h3>${response.clientName || 'Anonymous'}</h3>
                        <div class="template-meta">
                          ${templateName} • Submitted ${new Date(response.submittedAt).toLocaleString()}
                        </div>
                      </div>
                      <div class="template-actions">
                        <button class="btn btn-sm btn-primary" onclick="app.viewResponse(${response.id})">
                          View
                        </button>
                        <button class="btn btn-sm btn-success" onclick="app.exportResponsePDF(${response.id})">
                          Export PDF
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="app.deleteResponse(${response.id})">
                          Delete
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `}
        </div>
      </main>
    `;
  }

  async viewResponse(responseId) {
    // TODO: Implement detailed response view
    alert('Detailed view coming soon! Use Export PDF to see full response.');
  }

  async exportResponsePDF(responseId) {
    try {
      const response = await window.DB.getResponse(responseId);
      const template = await window.DB.getTemplate(response.templateId);

      const doc = await window.PDFGenerator.generateFilledForm(template, response);
      const fileName = response.clientName ?
        `${template.name} - ${response.clientName}.pdf` :
        `${template.name} - Response ${responseId}.pdf`;

      window.PDFGenerator.download(doc, fileName);
      this.showNotification('PDF exported successfully!', 'success');
      await window.DB.logEvent('pdf_export', { responseId, type: 'filled' });
    } catch (error) {
      this.showNotification('PDF export failed: ' + error.message, 'error');
    }
  }

  async deleteResponse(responseId) {
    if (confirm('Delete this response? This cannot be undone.')) {
      try {
        await window.DB.deleteResponse(responseId);
        this.showNotification('Response deleted', 'success');
        window.Router.navigate('/responses');
      } catch (error) {
        this.showNotification('Delete failed: ' + error.message, 'error');
      }
    }
  }

  async exportAllData() {
    try {
      const data = await window.DB.exportAllData();
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `form-builder-backup-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);

      this.showNotification('Data exported successfully!', 'success');
      await window.DB.logEvent('data_export', { timestamp: new Date().toISOString() });
    } catch (error) {
      this.showNotification('Export failed: ' + error.message, 'error');
    }
  }

  /**
   * Render settings view
   */
  async renderSettings() {
    window.Router.navigate('/setup');
  }

  /**
   * Render analytics view
   */
  async renderAnalytics() {
    const analytics = await window.DB.getAllAnalytics();
    const templates = await window.DB.getAllTemplates();
    const responses = await window.DB.getAllResponses();

    // Calculate stats
    const totalForms = templates.length;
    const totalResponses = responses.length;
    const formSubmissions = analytics.filter(e => e.eventType === 'form_submitted').length;
    const pdfExports = analytics.filter(e => e.eventType === 'pdf_export').length;

    const app = document.getElementById('app');
    app.innerHTML = `
      <header>
        <div class="container">
          <h1>Analytics</h1>
          <nav>
            <button onclick="window.Router.navigate('/dashboard')">Dashboard</button>
          </nav>
        </div>
      </header>

      <main>
        <div class="container">
          <h2>Usage Analytics</h2>
          <p class="text-muted">Track your form builder usage</p>

          <div class="grid grid-2">
            <div class="card">
              <div class="card-body text-center">
                <div style="font-size: 3rem; color: var(--primary-color);">${totalForms}</div>
                <h3>Total Forms</h3>
              </div>
            </div>

            <div class="card">
              <div class="card-body text-center">
                <div style="font-size: 3rem; color: var(--accent-color);">${totalResponses}</div>
                <h3>Total Responses</h3>
              </div>
            </div>

            <div class="card">
              <div class="card-body text-center">
                <div style="font-size: 3rem; color: var(--primary-color);">${formSubmissions}</div>
                <h3>Form Submissions</h3>
              </div>
            </div>

            <div class="card">
              <div class="card-body text-center">
                <div style="font-size: 3rem; color: var(--accent-color);">${pdfExports}</div>
                <h3>PDF Exports</h3>
              </div>
            </div>
          </div>

          <div class="card mt-3">
            <div class="card-header">
              <h3 class="card-title">Recent Activity</h3>
            </div>
            <div class="card-body">
              ${analytics.length === 0 ? `
                <p class="text-muted text-center">No activity yet</p>
              ` : `
                <div style="max-height: 400px; overflow-y: auto;">
                  ${analytics.reverse().slice(0, 50).map(event => `
                    <div style="padding: 0.5rem; border-bottom: 1px solid var(--divider-color);">
                      <strong>${event.eventType.replace(/_/g, ' ')}</strong>
                      <span class="text-muted" style="float: right;">
                        ${new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>
        </div>
      </main>
    `;
  }

  /**
   * Show notification to user
   */
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '400px';
    notification.style.boxShadow = 'var(--shadow-lg)';
    notification.style.animation = 'slideIn 0.3s ease';

    document.body.appendChild(notification);

    // Remove after 4 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  /**
   * Show loader
   */
  showLoader() {
    const app = document.getElementById('app');
    app.innerHTML = '<div class="loader"></div>';
  }

  /**
   * Hide loader
   */
  hideLoader() {
    // Loader will be replaced by content
  }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', async () => {
  app = new App();
  window.app = app; // Make available globally for onclick handlers
  await app.init();
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
