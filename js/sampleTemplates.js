/**
 * Sample Form Templates
 * Pre-built templates that users can import to get started quickly
 */

const SAMPLE_TEMPLATES = [
  {
    name: 'Basic Client Intake Form',
    description: 'A general-purpose client onboarding form suitable for most service businesses',
    category: 'General',
    icon: '📋',
    sections: [
      {
        id: 'sample-basic-1',
        title: 'Client Information',
        description: 'Basic contact and company details',
        questions: [
          {
            id: 'sample-basic-1-1',
            type: 'text',
            label: 'Full Name',
            required: true
          },
          {
            id: 'sample-basic-1-2',
            type: 'text',
            label: 'Company/Organization Name',
            required: false
          },
          {
            id: 'sample-basic-1-3',
            type: 'text',
            label: 'Email Address',
            required: true
          },
          {
            id: 'sample-basic-1-4',
            type: 'text',
            label: 'Phone Number',
            required: true
          },
          {
            id: 'sample-basic-1-5',
            type: 'textarea',
            label: 'Mailing Address',
            required: false
          }
        ]
      },
      {
        id: 'sample-basic-2',
        title: 'Project Details',
        description: 'Information about the services needed',
        questions: [
          {
            id: 'sample-basic-2-1',
            type: 'radio',
            label: 'How did you hear about us?',
            required: false,
            options: ['Referral', 'Social Media', 'Search Engine', 'Advertisement', 'Other']
          },
          {
            id: 'sample-basic-2-2',
            type: 'checkbox',
            label: 'Which services are you interested in?',
            required: true,
            options: ['Consultation', 'Design', 'Implementation', 'Maintenance', 'Training']
          },
          {
            id: 'sample-basic-2-3',
            type: 'textarea',
            label: 'Please describe your project or needs',
            required: true
          },
          {
            id: 'sample-basic-2-4',
            type: 'text',
            label: 'Desired timeline or deadline',
            required: false
          },
          {
            id: 'sample-basic-2-5',
            type: 'text',
            label: 'Estimated budget range',
            required: false
          }
        ]
      },
      {
        id: 'sample-basic-3',
        title: 'Agreement',
        description: 'Client acknowledgment and signature',
        questions: [
          {
            id: 'sample-basic-3-1',
            type: 'checkbox',
            label: 'I agree to the terms and conditions',
            required: true,
            options: ['I have read and agree to the terms of service and privacy policy']
          },
          {
            id: 'sample-basic-3-2',
            type: 'signature',
            label: 'Client Signature',
            required: true
          }
        ]
      }
    ]
  },

  {
    name: 'Photography Session Questionnaire',
    description: 'Detailed questionnaire for photography clients (portraits, events, weddings)',
    category: 'Photography',
    icon: '📸',
    sections: [
      {
        id: 'sample-photo-1',
        title: 'Contact Information',
        description: 'Your contact details',
        questions: [
          {
            id: 'sample-photo-1-1',
            type: 'text',
            label: 'Full Name',
            required: true
          },
          {
            id: 'sample-photo-1-2',
            type: 'text',
            label: 'Email Address',
            required: true
          },
          {
            id: 'sample-photo-1-3',
            type: 'text',
            label: 'Phone Number',
            required: true
          },
          {
            id: 'sample-photo-1-4',
            type: 'text',
            label: 'Instagram Handle (optional)',
            required: false
          }
        ]
      },
      {
        id: 'sample-photo-2',
        title: 'Session Details',
        description: 'Tell us about your photo session',
        questions: [
          {
            id: 'sample-photo-2-1',
            type: 'radio',
            label: 'Type of Session',
            required: true,
            options: ['Portrait', 'Family', 'Wedding', 'Event', 'Product', 'Other']
          },
          {
            id: 'sample-photo-2-2',
            type: 'text',
            label: 'Preferred Date',
            required: true
          },
          {
            id: 'sample-photo-2-3',
            type: 'text',
            label: 'Preferred Time',
            required: false
          },
          {
            id: 'sample-photo-2-4',
            type: 'text',
            label: 'Preferred Location',
            required: false
          },
          {
            id: 'sample-photo-2-5',
            type: 'text',
            label: 'Number of people being photographed',
            required: false
          },
          {
            id: 'sample-photo-2-6',
            type: 'textarea',
            label: 'Special requests or ideas for the session',
            required: false
          }
        ]
      },
      {
        id: 'sample-photo-3',
        title: 'Style Preferences',
        description: 'Help us understand your vision',
        questions: [
          {
            id: 'sample-photo-3-1',
            type: 'checkbox',
            label: 'Photography style preferences',
            required: false,
            options: ['Natural/Candid', 'Posed/Formal', 'Editorial', 'Artistic', 'Documentary']
          },
          {
            id: 'sample-photo-3-2',
            type: 'checkbox',
            label: 'Color preferences',
            required: false,
            options: ['Bright & Vibrant', 'Soft & Pastel', 'Black & White', 'Moody/Dark', 'No Preference']
          },
          {
            id: 'sample-photo-3-3',
            type: 'textarea',
            label: 'Link to inspiration photos or Pinterest board',
            required: false
          }
        ]
      },
      {
        id: 'sample-photo-4',
        title: 'Agreement & Signature',
        description: 'Session booking confirmation',
        questions: [
          {
            id: 'sample-photo-4-1',
            type: 'checkbox',
            label: 'Agreement',
            required: true,
            options: ['I understand the booking terms and cancellation policy']
          },
          {
            id: 'sample-photo-4-2',
            type: 'signature',
            label: 'Client Signature',
            required: true
          }
        ]
      }
    ]
  },

  {
    name: 'Service Agreement & Client Onboarding',
    description: 'Comprehensive service agreement form for contractors and service providers',
    category: 'Contracts',
    icon: '📝',
    sections: [
      {
        id: 'sample-contract-1',
        title: 'Client Details',
        description: 'Primary contact information',
        questions: [
          {
            id: 'sample-contract-1-1',
            type: 'text',
            label: 'Individual/Company Name',
            required: true
          },
          {
            id: 'sample-contract-1-2',
            type: 'text',
            label: 'Business Registration Number (if applicable)',
            required: false
          },
          {
            id: 'sample-contract-1-3',
            type: 'text',
            label: 'Primary Contact Person',
            required: true
          },
          {
            id: 'sample-contract-1-4',
            type: 'text',
            label: 'Email Address',
            required: true
          },
          {
            id: 'sample-contract-1-5',
            type: 'text',
            label: 'Phone Number',
            required: true
          },
          {
            id: 'sample-contract-1-6',
            type: 'textarea',
            label: 'Business Address',
            required: true
          }
        ]
      },
      {
        id: 'sample-contract-2',
        title: 'Scope of Work',
        description: 'Services to be provided',
        questions: [
          {
            id: 'sample-contract-2-1',
            type: 'textarea',
            label: 'Detailed description of services required',
            required: true
          },
          {
            id: 'sample-contract-2-2',
            type: 'text',
            label: 'Project start date',
            required: true
          },
          {
            id: 'sample-contract-2-3',
            type: 'text',
            label: 'Expected completion date',
            required: false
          },
          {
            id: 'sample-contract-2-4',
            type: 'checkbox',
            label: 'Deliverables',
            required: false,
            options: ['Reports', 'Documentation', 'Training Materials', 'Source Files', 'Other']
          }
        ]
      },
      {
        id: 'sample-contract-3',
        title: 'Payment Terms',
        description: 'Financial arrangements',
        questions: [
          {
            id: 'sample-contract-3-1',
            type: 'text',
            label: 'Total project cost',
            required: false
          },
          {
            id: 'sample-contract-3-2',
            type: 'radio',
            label: 'Payment structure',
            required: false,
            options: ['Fixed Price', 'Hourly Rate', 'Milestone-based', 'Retainer', 'Other']
          },
          {
            id: 'sample-contract-3-3',
            type: 'radio',
            label: 'Payment schedule',
            required: false,
            options: ['Upfront payment', '50% upfront, 50% on completion', 'Monthly invoicing', 'Upon milestone completion', 'Other']
          },
          {
            id: 'sample-contract-3-4',
            type: 'text',
            label: 'Deposit amount (if applicable)',
            required: false
          }
        ]
      },
      {
        id: 'sample-contract-4',
        title: 'Terms & Conditions',
        description: 'Agreement terms and legal acknowledgments',
        questions: [
          {
            id: 'sample-contract-4-1',
            type: 'checkbox',
            label: 'Client acknowledges and agrees to',
            required: true,
            options: [
              'Payment terms as outlined above',
              'Cancellation policy and fees',
              'Intellectual property rights',
              'Confidentiality agreement',
              'Liability limitations'
            ]
          },
          {
            id: 'sample-contract-4-2',
            type: 'textarea',
            label: 'Additional notes or special terms',
            required: false
          },
          {
            id: 'sample-contract-4-3',
            type: 'signature',
            label: 'Client Signature',
            required: true
          },
          {
            id: 'sample-contract-4-4',
            type: 'text',
            label: 'Date',
            required: true
          }
        ]
      }
    ]
  }
];

// Export for use in other modules
window.SAMPLE_TEMPLATES = SAMPLE_TEMPLATES;
