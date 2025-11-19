/**
 * Form Builder
 * Allows users to create custom form templates
 */

class FormBuilder {
  constructor() {
    this.currentTemplate = {
      name: '',
      sections: []
    };
    this.editingTemplateId = null;
  }

  /**
   * Initialize a new template
   */
  initNewTemplate() {
    this.currentTemplate = {
      name: '',
      sections: [
        {
          id: this.generateId(),
          title: 'Section 1',
          description: '',
          questions: []
        }
      ]
    };
    this.editingTemplateId = null;
  }

  /**
   * Load an existing template for editing
   */
  async loadTemplate(templateId) {
    const template = await window.DB.getTemplate(templateId);
    if (template) {
      this.currentTemplate = { ...template };
      this.editingTemplateId = templateId;
      return true;
    }
    return false;
  }

  /**
   * Add a new section
   */
  addSection() {
    const sectionNumber = this.currentTemplate.sections.length + 1;
    this.currentTemplate.sections.push({
      id: this.generateId(),
      title: `Section ${sectionNumber}`,
      description: '',
      questions: []
    });
  }

  /**
   * Remove a section
   */
  removeSection(sectionId) {
    this.currentTemplate.sections = this.currentTemplate.sections.filter(
      s => s.id !== sectionId
    );
  }

  /**
   * Update section
   */
  updateSection(sectionId, updates) {
    const section = this.currentTemplate.sections.find(s => s.id === sectionId);
    if (section) {
      Object.assign(section, updates);
    }
  }

  /**
   * Add a question to a section
   */
  addQuestion(sectionId, questionType = 'text') {
    const section = this.currentTemplate.sections.find(s => s.id === sectionId);
    if (section) {
      const question = {
        id: this.generateId(),
        type: questionType,
        label: 'New Question',
        required: false
      };

      // Add options for multiple choice questions
      if (questionType === 'checkbox' || questionType === 'radio' || questionType === 'select') {
        question.options = ['Option 1', 'Option 2'];
      }

      section.questions.push(question);
      return question.id;
    }
    return null;
  }

  /**
   * Remove a question
   */
  removeQuestion(sectionId, questionId) {
    const section = this.currentTemplate.sections.find(s => s.id === sectionId);
    if (section) {
      section.questions = section.questions.filter(q => q.id !== questionId);
    }
  }

  /**
   * Update a question
   */
  updateQuestion(sectionId, questionId, updates) {
    const section = this.currentTemplate.sections.find(s => s.id === sectionId);
    if (section) {
      const question = section.questions.find(q => q.id === questionId);
      if (question) {
        Object.assign(question, updates);
      }
    }
  }

  /**
   * Add option to a multiple choice question
   */
  addQuestionOption(sectionId, questionId) {
    const section = this.currentTemplate.sections.find(s => s.id === sectionId);
    if (section) {
      const question = section.questions.find(q => q.id === questionId);
      if (question && question.options) {
        const optionNumber = question.options.length + 1;
        question.options.push(`Option ${optionNumber}`);
      }
    }
  }

  /**
   * Remove option from a multiple choice question
   */
  removeQuestionOption(sectionId, questionId, optionIndex) {
    const section = this.currentTemplate.sections.find(s => s.id === sectionId);
    if (section) {
      const question = section.questions.find(q => q.id === questionId);
      if (question && question.options && question.options.length > 1) {
        question.options.splice(optionIndex, 1);
      }
    }
  }

  /**
   * Update question option
   */
  updateQuestionOption(sectionId, questionId, optionIndex, value) {
    const section = this.currentTemplate.sections.find(s => s.id === sectionId);
    if (section) {
      const question = section.questions.find(q => q.id === questionId);
      if (question && question.options) {
        question.options[optionIndex] = value;
      }
    }
  }

  /**
   * Move section up or down
   */
  moveSection(sectionId, direction) {
    const index = this.currentTemplate.sections.findIndex(s => s.id === sectionId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      [this.currentTemplate.sections[index], this.currentTemplate.sections[index - 1]] =
        [this.currentTemplate.sections[index - 1], this.currentTemplate.sections[index]];
    } else if (direction === 'down' && index < this.currentTemplate.sections.length - 1) {
      [this.currentTemplate.sections[index], this.currentTemplate.sections[index + 1]] =
        [this.currentTemplate.sections[index + 1], this.currentTemplate.sections[index]];
    }
  }

  /**
   * Move question up or down within a section
   */
  moveQuestion(sectionId, questionId, direction) {
    const section = this.currentTemplate.sections.find(s => s.id === sectionId);
    if (!section) return;

    const index = section.questions.findIndex(q => q.id === questionId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      [section.questions[index], section.questions[index - 1]] =
        [section.questions[index - 1], section.questions[index]];
    } else if (direction === 'down' && index < section.questions.length - 1) {
      [section.questions[index], section.questions[index + 1]] =
        [section.questions[index + 1], section.questions[index]];
    }
  }

  /**
   * Validate template before saving
   */
  validateTemplate() {
    const errors = [];

    if (!this.currentTemplate.name || this.currentTemplate.name.trim() === '') {
      errors.push('Form name is required');
    }

    if (this.currentTemplate.sections.length === 0) {
      errors.push('At least one section is required');
    }

    this.currentTemplate.sections.forEach((section, sectionIndex) => {
      if (!section.title || section.title.trim() === '') {
        errors.push(`Section ${sectionIndex + 1} must have a title`);
      }

      if (section.questions.length === 0) {
        errors.push(`Section "${section.title}" must have at least one question`);
      }

      section.questions.forEach((question, questionIndex) => {
        if (!question.label || question.label.trim() === '') {
          errors.push(`Question ${questionIndex + 1} in "${section.title}" must have a label`);
        }

        if ((question.type === 'checkbox' || question.type === 'radio' || question.type === 'select') &&
            (!question.options || question.options.length < 2)) {
          errors.push(`Question "${question.label}" must have at least 2 options`);
        }
      });
    });

    return errors;
  }

  /**
   * Save template to IndexedDB
   */
  async saveTemplate() {
    const errors = this.validateTemplate();
    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }

    const template = {
      ...this.currentTemplate,
      id: this.editingTemplateId || undefined
    };

    const id = await window.DB.saveTemplate(template);

    // Log analytics
    await window.DB.logEvent('template_saved', {
      templateId: id,
      sectionCount: template.sections.length,
      questionCount: template.sections.reduce((sum, s) => sum + s.questions.length, 0)
    });

    return id;
  }

  /**
   * Get current template
   */
  getTemplate() {
    return this.currentTemplate;
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Duplicate a template
   */
  async duplicateTemplate(templateId) {
    const template = await window.DB.getTemplate(templateId);
    if (template) {
      const duplicated = {
        ...template,
        name: `${template.name} (Copy)`,
        id: undefined // Remove ID so it gets a new one
      };

      // Generate new IDs for sections and questions
      duplicated.sections = duplicated.sections.map(section => ({
        ...section,
        id: this.generateId(),
        questions: section.questions.map(question => ({
          ...question,
          id: this.generateId()
        }))
      }));

      return await window.DB.saveTemplate(duplicated);
    }
    return null;
  }

  /**
   * Get question type label
   */
  getQuestionTypeLabel(type) {
    const labels = {
      'text': 'Short Text',
      'textarea': 'Long Text',
      'checkbox': 'Checkboxes',
      'radio': 'Multiple Choice',
      'select': 'Dropdown',
      'signature': 'Signature'
    };
    return labels[type] || type;
  }
}

// Create singleton instance
const formBuilder = new FormBuilder();

// Export for use in other modules
window.FormBuilder = formBuilder;
