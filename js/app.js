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
   * Check if running on iOS
   */
  isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  /**
   * Check if running as installed PWA
   */
  isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }

  /**
   * Render setup view (first-time branding setup)
   */
  async renderSetup() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="container container-sm">
        ${!this.branding ? `
          <div class="privacy-manifesto">
            <h2>YOUR DATA. YOUR DEVICE. PERIOD.</h2>
            <ul>
              <li>No accounts</li>
              <li>No passwords</li>
              <li>No cloud uploads (unless YOU choose)</li>
              <li>No tracking</li>
              <li>No analytics to 3rd parties</li>
              <li>No newsletters</li>
              <li>Works 100% offline</li>
              <li>Data never leaves your device</li>
              <li>Export anytime, anywhere</li>
            </ul>
            <p>
              We don't want your data. We don't want your clients' data.
              We don't even have a server to store it on.
              <br><br>
              <strong>This is YOUR tool. Your data stays with YOU.</strong>
            </p>
          </div>
        ` : ''}

        <div class="card">
          <div class="card-header">
            <div>
              <h1 class="card-title">${this.branding ? 'Business Settings' : 'Welcome! Let\'s Set Up Your Business'}</h1>
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
                <label for="phone" class="required">Phone</label>
                <input type="tel" id="phone" required value="${this.branding?.phone || ''}">
              </div>

              <div class="form-group">
                <label for="website">Website</label>
                <input type="text" id="website" placeholder="https://example.com" value="${this.branding?.website || ''}">
              </div>

              <div class="form-group">
                <label for="ein">EIN (Employer Identification Number)</label>
                <input type="text" id="ein" placeholder="12-3456789 (optional)" value="${this.branding?.ein || ''}">
              </div>

              <div class="form-group">
                <label for="address" class="required">Address</label>
                <textarea id="address" rows="3" required placeholder="City, State (or full address)">${this.branding?.address || ''}</textarea>
              </div>

              <div class="alert alert-success">
                <strong>✓ Fully Offline:</strong> All your data is stored locally on this device.
                No internet connection required after initial setup!
                ${!navigator.onLine ? '<br><strong>You are currently offline</strong> - everything still works!' : ''}
              </div>

              ${this.branding ? `
                <div class="card mt-3">
                  <div class="card-header">
                    <h3 class="card-title">💾 Backup Options (Optional)</h3>
                    <p class="card-subtitle">Your data, your choice, your cloud</p>
                  </div>
                  <div class="card-body">

                    <div class="alert alert-success mb-3">
                      <strong>✨ Recommended: Save to Files</strong><br>
                      No setup required • Works immediately • Saves to iCloud on iOS
                    </div>

                    <div class="backup-option" style="border: 3px solid var(--accent-color); background: #f1f8f4;"
                         onclick="app.backupToFiles()">
                      <div class="backup-option-icon">☁️</div>
                      <div class="backup-option-title" style="font-size: 1.25rem; color: var(--accent-color);">
                        Save to Files
                      </div>
                      <div class="backup-option-status" style="color: var(--accent-dark); font-weight: 500;">
                        <strong>No setup needed!</strong><br>
                        iOS → iCloud Drive<br>
                        Desktop → Any location
                      </div>
                      <button class="btn btn-success mt-2" onclick="event.stopPropagation(); app.backupToFiles();">
                        Save Backup Now
                      </button>
                    </div>

                    <details class="mt-4" style="cursor: pointer;">
                      <summary style="font-weight: 600; padding: 1rem; background: var(--background); border-radius: var(--border-radius);">
                        <span style="font-size: 1.1rem;">⚙️ Advanced: Auto-Sync to Your Cloud</span>
                        <span style="float: right; color: var(--text-secondary); font-size: 0.875rem;">(Requires setup)</span>
                      </summary>

                      <div style="padding: 1.5rem; background: var(--background); border-radius: var(--border-radius); margin-top: 0.5rem;">
                        <p class="text-muted mb-3">
                          Connect to <strong>your personal</strong> Google Drive or Dropbox account.
                          Data goes directly to <strong>YOUR</strong> cloud - we never see it.
                        </p>

                        <div class="backup-options">
                          <div class="backup-option ${window.CloudBackup.isConnected('googleDrive') ? 'connected' : ''}"
                               onclick="app.toggleCloudProvider('googleDrive')">
                            <div class="backup-option-icon">📁</div>
                            <div class="backup-option-title">Google Drive</div>
                            <div class="backup-option-status">
                              ${window.CloudBackup.isConnected('googleDrive') ? '✓ Connected' : 'Setup Required'}
                            </div>
                            ${!window.CloudBackup.isConnected('googleDrive') ? `
                              <button class="btn btn-sm btn-outline mt-2"
                                      onclick="event.stopPropagation(); app.showOAuthGuide('googleDrive')">
                                Setup Instructions
                              </button>
                            ` : ''}
                          </div>

                          <div class="backup-option ${window.CloudBackup.isConnected('dropbox') ? 'connected' : ''}"
                               onclick="app.toggleCloudProvider('dropbox')">
                            <div class="backup-option-icon">📦</div>
                            <div class="backup-option-title">Dropbox</div>
                            <div class="backup-option-status">
                              ${window.CloudBackup.isConnected('dropbox') ? '✓ Connected' : 'Setup Required'}
                            </div>
                            ${!window.CloudBackup.isConnected('dropbox') ? `
                              <button class="btn btn-sm btn-outline mt-2"
                                      onclick="event.stopPropagation(); app.showOAuthGuide('dropbox')">
                                Setup Instructions
                              </button>
                            ` : ''}
                          </div>
                        </div>

                        <div class="alert alert-info mt-3">
                          <strong>Why Setup Required?</strong><br>
                          To protect your privacy, <strong>you</strong> create your own OAuth app (free!).
                          This ensures data goes directly to <strong>your</strong> cloud account, never through our servers.
                        </div>
                      </div>
                    </details>

                    <div class="alert alert-info mt-3" style="font-size: 0.875rem;">
                      <strong>🔒 Your Privacy Guarantee:</strong><br>
                      All backup methods are 100% optional. If you enable cloud sync,
                      data is sent directly to YOUR account using YOUR credentials.
                      We never see, store, or have access to your data.
                    </div>
                  </div>
                </div>
              ` : ''}

              <div class="card-footer">
                <button type="submit" class="btn btn-primary btn-lg btn-block">
                  ${this.branding ? 'Save Settings' : 'Complete Setup & Get Started'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Privacy Badge -->
      <div class="privacy-badge" title="Your data stays on your device. No tracking. No cloud uploads (unless you choose). Period.">
        Your Data, Your Device
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
        ein: document.getElementById('ein').value,
        address: document.getElementById('address').value
      };

      try {
        console.log('[App] Saving branding data:', brandingData);
        await window.DB.saveBranding(brandingData);
        this.branding = await window.DB.getBranding();
        await window.PDFGenerator.init(); // Reinitialize with new branding

        this.showNotification('Settings saved successfully!', 'success');
        window.Router.navigate('/dashboard');

        await window.DB.logEvent('branding_setup', { isFirstTime: !this.branding });
      } catch (error) {
        console.error('[App] Failed to save branding:', error);
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

          ${this.isIOS() && !this.isPWA() ? `
            <div class="card mt-4" style="border: 2px solid var(--primary-color);">
              <div class="card-header">
                <div>
                  <h3 class="card-title">📲 Install on iPhone/iPad</h3>
                  <p class="card-subtitle">Get the best experience with offline access</p>
                </div>
              </div>
              <div class="card-body">
                <p>To install this app on your iOS device:</p>
                <ol style="padding-left: 1.5rem; margin: 1rem 0;">
                  <li>Tap the <strong>Share</strong> button <span style="font-size: 1.5rem;">⎙</span> at the bottom of Safari</li>
                  <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                  <li>Tap <strong>"Add"</strong> in the top right</li>
                  <li>The app icon will appear on your home screen!</li>
                </ol>
                <div class="alert alert-info">
                  <strong>Note:</strong> This only works in Safari browser. If you're using Chrome or Firefox on iOS,
                  please open this page in Safari first.
                </div>
                <p class="text-muted" style="font-size: 0.875rem; margin-top: 1rem;">
                  After installation, the app works completely offline and will feel like a native iOS app.
                </p>
              </div>
            </div>
          ` : ''}

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

      <!-- Privacy Badge -->
      <div class="privacy-badge" title="Your data stays on your device. No tracking. No cloud uploads (unless you choose). Period.">
        Your Data, Your Device
      </div>
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
      console.log('[App] Saving template...');

      // Check if database is initialized
      if (!window.DB || !window.DB.db) {
        throw new Error('Database not initialized. Please refresh the page and try again.');
      }

      // Validate before attempting to save
      const errors = window.FormBuilder.validateTemplate();
      if (errors.length > 0) {
        // Show user-friendly validation errors
        const errorMsg = 'Please fix the following issues:\n\n' + errors.map((e, i) => `${i + 1}. ${e}`).join('\n');
        alert(errorMsg);
        this.showNotification('Please fix validation errors', 'error');
        return;
      }

      // Attempt to save
      const id = await window.FormBuilder.saveTemplate();
      console.log('[App] Template saved with ID:', id);

      this.showNotification('Template saved successfully!', 'success');
      window.Router.navigate('/templates');

    } catch (error) {
      console.error('[App] Save template failed:', error);

      // Provide user-friendly error messages
      let errorMessage = error.message;

      if (error.name === 'QuotaExceededError') {
        errorMessage = 'Storage quota exceeded. Please free up space or delete old templates.';
      } else if (error.message.includes('database')) {
        errorMessage = 'Database error. Try refreshing the page.\n\nDetails: ' + error.message;
      } else if (!navigator.onLine) {
        errorMessage = 'You are offline, but save should still work. Error: ' + error.message;
      }

      // Show detailed error message
      alert('Save Failed\n\n' + errorMessage + '\n\nIf this persists, try:\n1. Refresh the page\n2. Clear browser cache\n3. Check browser console for details');

      this.showNotification('Save failed - check error dialog', 'error');
    }
  }

  previewTemplate() {
    const template = window.FormBuilder.getTemplate();

    // Create modal overlay
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      overflow: auto;
    `;

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      border-radius: 12px;
      max-width: 800px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    `;

    modalContent.innerHTML = `
      <div style="padding: 2rem; border-bottom: 1px solid var(--divider-color); position: sticky; top: 0; background: white; z-index: 1;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="margin: 0; color: var(--primary-color);">Preview: ${template.name || 'Untitled Form'}</h2>
            <p style="margin: 0.5rem 0 0 0; color: var(--text-secondary); font-size: 0.875rem;">
              This is how your form will look when clients fill it out
            </p>
          </div>
          <button class="btn btn-secondary" onclick="this.closest('[style*=\\'position: fixed\\']').remove()" style="font-size: 1.5rem; padding: 0.5rem 1rem;">×</button>
        </div>
      </div>
      <div style="padding: 2rem;">
        ${template.sections.length === 0 ? `
          <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
            <div style="font-size: 3rem; margin-bottom: 1rem;">📝</div>
            <p>No sections added yet. Add sections and questions to see the preview.</p>
          </div>
        ` : `
          <div class="card" style="margin-bottom: 1.5rem;">
            <div class="card-body">
              <div class="form-group">
                <label for="preview-clientName">Client Name (Optional)</label>
                <input type="text" id="preview-clientName" placeholder="Enter client name" disabled>
                <div class="form-help">This helps you identify the response later</div>
              </div>
            </div>
          </div>

          ${template.sections.map(section => `
            <div class="response-section" style="background: white; border-radius: var(--border-radius); padding: 1.5rem; margin-bottom: 1.5rem; border: 1px solid var(--divider-color);">
              <h2 class="response-section-title" style="font-size: 1.5rem; margin-bottom: ${section.description ? '0.5rem' : '1rem'}; color: var(--text-primary);">
                ${section.title}
              </h2>
              ${section.description ? `<p class="response-section-description" style="color: var(--text-secondary); margin-bottom: 1.5rem;">${section.description}</p>` : ''}

              ${section.questions.length === 0 ? `
                <p style="color: var(--text-secondary); font-style: italic;">No questions in this section</p>
              ` : section.questions.map(question => this.renderPreviewQuestion(question)).join('')}
            </div>
          `).join('')}
        `}

        <div style="display: flex; gap: 1rem; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--divider-color);">
          <button class="btn btn-secondary" onclick="this.closest('[style*=\\'position: fixed\\']').remove()" style="flex: 1;">
            Close Preview
          </button>
          <button class="btn btn-primary" onclick="app.saveTemplate(); this.closest('[style*=\\'position: fixed\\']').remove();" style="flex: 1;">
            Save Template
          </button>
        </div>
      </div>
    `;

    modal.appendChild(modalContent);

    // Close modal when clicking outside
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    document.body.appendChild(modal);
  }

  /**
   * Render a question in preview mode
   */
  renderPreviewQuestion(question) {
    const requiredLabel = question.required ? '<span style="color: var(--error-color);">*</span>' : '';

    let inputHtml = '';

    switch (question.type) {
      case 'text':
        inputHtml = `<input type="text" placeholder="Enter your answer..." disabled style="width: 100%; padding: 0.75rem; border: 1px solid var(--divider-color); border-radius: var(--border-radius); font-size: 1rem;">`;
        break;

      case 'textarea':
        inputHtml = `<textarea rows="5" placeholder="Enter your answer..." disabled style="width: 100%; padding: 0.75rem; border: 1px solid var(--divider-color); border-radius: var(--border-radius); font-size: 1rem; font-family: inherit;"></textarea>`;
        break;

      case 'checkbox':
        inputHtml = (question.options || []).map(option => `
          <div style="margin-bottom: 0.5rem;">
            <label style="display: flex; align-items: center; cursor: pointer;">
              <input type="checkbox" disabled style="margin-right: 0.5rem;">
              ${option}
            </label>
          </div>
        `).join('');
        break;

      case 'radio':
        inputHtml = (question.options || []).map(option => `
          <div style="margin-bottom: 0.5rem;">
            <label style="display: flex; align-items: center; cursor: pointer;">
              <input type="radio" disabled style="margin-right: 0.5rem;">
              ${option}
            </label>
          </div>
        `).join('');
        break;

      case 'select':
        inputHtml = `
          <select disabled style="width: 100%; padding: 0.75rem; border: 1px solid var(--divider-color); border-radius: var(--border-radius); font-size: 1rem;">
            <option>-- Select --</option>
            ${(question.options || []).map(option => `<option>${option}</option>`).join('')}
          </select>
        `;
        break;

      case 'signature':
        inputHtml = `
          <div style="border: 2px dashed var(--divider-color); border-radius: var(--border-radius); padding: 3rem 1rem; text-align: center; background: var(--background);">
            <div style="color: var(--text-secondary); font-size: 0.875rem;">✍️ Signature pad will appear here</div>
          </div>
        `;
        break;

      default:
        inputHtml = `<input type="text" placeholder="Enter your answer..." disabled style="width: 100%; padding: 0.75rem; border: 1px solid var(--divider-color); border-radius: var(--border-radius); font-size: 1rem;">`;
    }

    return `
      <div class="response-question form-group" style="margin-bottom: 1.5rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--text-primary);">
          ${question.label} ${requiredLabel}
        </label>
        ${inputHtml}
      </div>
    `;
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
   * Show OAuth setup guide
   */
  showOAuthGuide(provider) {
    const guides = {
      googleDrive: {
        title: 'Google Drive Setup',
        steps: [
          'Go to <a href="https://console.cloud.google.com" target="_blank">console.cloud.google.com</a>',
          'Create a new project (or select existing)',
          'Enable "Google Drive API" from the API Library',
          'Go to "Credentials" → "Create Credentials" → "OAuth client ID"',
          'If prompted, configure OAuth consent screen (External type)',
          'Application type: Web application',
          'Add authorized redirect URI: <code>' + window.location.origin + '/' + '</code>',
          'Copy the Client ID (looks like: 123456-abc.apps.googleusercontent.com)'
        ],
        videoUrl: 'https://www.youtube.com/results?search_query=google+drive+api+oauth+setup'
      },
      dropbox: {
        title: 'Dropbox Setup',
        steps: [
          'Go to <a href="https://www.dropbox.com/developers/apps" target="_blank">dropbox.com/developers/apps</a>',
          'Click "Create app"',
          'Choose API: Scoped access',
          'Choose access type: Full Dropbox (or App folder for more security)',
          'Name your app (must be unique)',
          'Go to "Permissions" tab and enable: files.content.write and files.content.read',
          'Go to "Settings" tab',
          'Add Redirect URI: <code>' + window.location.origin + '/' + '</code>',
          'Copy the "App key" from Settings tab'
        ],
        videoUrl: 'https://www.youtube.com/results?search_query=dropbox+api+oauth+setup'
      }
    };

    const guide = guides[provider];
    if (!guide) return;

    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.7); z-index: 10000;
      display: flex; align-items: center; justify-content: center;
      padding: 20px; overflow: auto;
    `;

    modal.innerHTML = `
      <div style="
        background: white; border-radius: 12px; max-width: 700px;
        width: 100%; max-height: 90vh; overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      ">
        <div style="padding: 2rem; border-bottom: 1px solid var(--divider-color);">
          <h2 style="margin: 0; color: var(--primary-color);">${guide.title}</h2>
          <p style="margin: 0.5rem 0 0 0; color: var(--text-secondary);">
            One-time setup (takes ~5 minutes)
          </p>
        </div>
        <div style="padding: 2rem;">
          <div style="background: #fff3cd; border-left: 4px solid #ff9800; padding: 1rem; margin-bottom: 1.5rem;">
            <strong>Why this setup?</strong><br>
            Creating your own OAuth app ensures data goes directly to YOUR cloud account.
            We never have access to your data. This is FREE and takes just a few minutes!
          </div>

          <h3 style="margin-bottom: 1rem;">Step-by-Step Instructions:</h3>
          <ol style="padding-left: 1.5rem; line-height: 2;">
            ${guide.steps.map(step => `<li style="margin-bottom: 0.75rem;">${step}</li>`).join('')}
          </ol>

          <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 1rem; margin: 1.5rem 0;">
            <strong>Need help?</strong> Search YouTube for step-by-step video tutorials:<br>
            <a href="${guide.videoUrl}" target="_blank" style="color: #2196f3; text-decoration: underline;">
              Watch video guide →
            </a>
          </div>

          <div style="display: flex; gap: 1rem; margin-top: 2rem;">
            <button class="btn btn-secondary" onclick="this.closest('[style*=\\'position: fixed\\']').remove()" style="flex: 1;">
              Close
            </button>
            <button class="btn btn-primary" onclick="app.promptForOAuthCredentials('${provider}'); this.closest('[style*=\\'position: fixed\\']').remove();" style="flex: 1;">
              I Have My Credentials →
            </button>
          </div>
        </div>
      </div>
    `;

    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    document.body.appendChild(modal);
  }

  /**
   * Prompt for OAuth credentials
   */
  async promptForOAuthCredentials(provider) {
    const providerNames = {
      googleDrive: 'Google Drive',
      dropbox: 'Dropbox'
    };

    const credentialNames = {
      googleDrive: 'Client ID',
      dropbox: 'App Key'
    };

    const placeholders = {
      googleDrive: '123456789-abc123.apps.googleusercontent.com',
      dropbox: 'abc123xyz789'
    };

    const credential = prompt(
      `Enter your ${providerNames[provider]} ${credentialNames[provider]}:\n\n` +
      `Example: ${placeholders[provider]}\n\n` +
      `(This will be stored locally on your device)`
    );

    if (!credential || credential.trim() === '') {
      return;
    }

    // Save the credential
    if (provider === 'googleDrive') {
      window.CloudBackup.configureGoogleDrive(credential.trim());
    } else if (provider === 'dropbox') {
      window.CloudBackup.configureDropbox(credential.trim());
    }

    this.showNotification('Credentials saved! Now connecting...', 'success');

    // Now try to connect
    this.toggleCloudProvider(provider);
  }

  /**
   * Toggle cloud provider connection
   */
  async toggleCloudProvider(provider) {
    try {
      if (window.CloudBackup.isConnected(provider)) {
        // Disconnect
        if (confirm(`Disconnect from ${provider}?`)) {
          window.CloudBackup.disconnect(provider);
          this.showNotification(`Disconnected from ${provider}`, 'success');
          window.Router.navigate('/setup'); // Refresh
        }
      } else {
        // Check if configured
        const storageKeys = {
          googleDrive: 'gdrive_client_id',
          dropbox: 'dropbox_app_key'
        };

        const isConfigured = localStorage.getItem(storageKeys[provider]);

        if (!isConfigured) {
          // Not configured - prompt for credentials
          const providerNames = {
            googleDrive: 'Google Drive',
            dropbox: 'Dropbox'
          };

          const setup = confirm(
            `${providerNames[provider]} requires setup.\n\n` +
            `You need to create a free OAuth app to connect your ${providerNames[provider]} account.\n\n` +
            `Click OK to see setup instructions, or Cancel to skip.`
          );

          if (setup) {
            this.showOAuthGuide(provider);
          }
          return;
        }

        // Already configured - connect
        this.showNotification(`Connecting to ${provider}...`, 'info');

        if (provider === 'googleDrive') {
          await window.CloudBackup.connectGoogleDrive();
          this.showNotification('Connected to Google Drive!', 'success');
        } else if (provider === 'dropbox') {
          await window.CloudBackup.connectDropbox();
          this.showNotification('Connected to Dropbox!', 'success');
        }

        // Refresh to show connected state
        window.Router.navigate('/setup');
      }
    } catch (error) {
      this.showNotification(`Connection failed: ${error.message}`, 'error');

      // If error says "not configured", show guide
      if (error.message.includes('not configured')) {
        this.showOAuthGuide(provider);
      }
    }
  }

  /**
   * Backup to Files (iCloud on iOS, file picker on desktop)
   */
  async backupToFiles() {
    try {
      const data = await window.DB.exportAllData();
      await window.CloudBackup.backupToICloud(data);
      this.showNotification('Backup saved! On iOS, choose iCloud Drive in Files app.', 'success');
    } catch (error) {
      this.showNotification(`Backup failed: ${error.message}`, 'error');
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
