/**
 * Sample Form Templates
 * Pre-built templates that users can import to get started quickly
 * These templates are generic and auto-branded with user's company info
 */

const SAMPLE_TEMPLATES = [
  {
    name: 'Contact Form',
    description: 'Simple contact form for general inquiries and questions',
    category: 'General',
    icon: '✉️',
    sections: [
      {
        id: 'sample-contact-1',
        title: 'Contact Information',
        description: 'How can we reach you?',
        questions: [
          {
            id: 'sample-contact-1-1',
            type: 'text',
            label: 'Full Name',
            required: true
          },
          {
            id: 'sample-contact-1-2',
            type: 'text',
            label: 'Email Address',
            required: true
          },
          {
            id: 'sample-contact-1-3',
            type: 'text',
            label: 'Phone Number',
            required: false
          },
          {
            id: 'sample-contact-1-4',
            type: 'text',
            label: 'Company/Organization (optional)',
            required: false
          }
        ]
      },
      {
        id: 'sample-contact-2',
        title: 'Your Message',
        description: 'Tell us how we can help',
        questions: [
          {
            id: 'sample-contact-2-1',
            type: 'radio',
            label: 'Subject',
            required: true,
            options: ['General Inquiry', 'Request a Quote', 'Support', 'Partnership', 'Other']
          },
          {
            id: 'sample-contact-2-2',
            type: 'textarea',
            label: 'Message',
            required: true
          },
          {
            id: 'sample-contact-2-3',
            type: 'radio',
            label: 'Preferred contact method',
            required: false,
            options: ['Email', 'Phone', 'No Preference']
          }
        ]
      }
    ]
  },

  {
    name: 'Job Application',
    description: 'Employment application form for collecting candidate information',
    category: 'HR',
    icon: '💼',
    sections: [
      {
        id: 'sample-job-1',
        title: 'Personal Information',
        description: 'Tell us about yourself',
        questions: [
          {
            id: 'sample-job-1-1',
            type: 'text',
            label: 'Full Name',
            required: true
          },
          {
            id: 'sample-job-1-2',
            type: 'text',
            label: 'Email Address',
            required: true
          },
          {
            id: 'sample-job-1-3',
            type: 'text',
            label: 'Phone Number',
            required: true
          },
          {
            id: 'sample-job-1-4',
            type: 'textarea',
            label: 'Current Address',
            required: true
          },
          {
            id: 'sample-job-1-5',
            type: 'text',
            label: 'LinkedIn Profile (optional)',
            required: false
          }
        ]
      },
      {
        id: 'sample-job-2',
        title: 'Position & Availability',
        description: 'Which position are you applying for?',
        questions: [
          {
            id: 'sample-job-2-1',
            type: 'text',
            label: 'Position Applied For',
            required: true
          },
          {
            id: 'sample-job-2-2',
            type: 'radio',
            label: 'Employment Type Desired',
            required: true,
            options: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Flexible']
          },
          {
            id: 'sample-job-2-3',
            type: 'text',
            label: 'Desired Salary/Rate',
            required: false
          },
          {
            id: 'sample-job-2-4',
            type: 'text',
            label: 'Available Start Date',
            required: true
          }
        ]
      },
      {
        id: 'sample-job-3',
        title: 'Experience & Qualifications',
        description: 'Share your background',
        questions: [
          {
            id: 'sample-job-3-1',
            type: 'textarea',
            label: 'Relevant Work Experience (most recent first)',
            required: true
          },
          {
            id: 'sample-job-3-2',
            type: 'textarea',
            label: 'Education & Certifications',
            required: true
          },
          {
            id: 'sample-job-3-3',
            type: 'textarea',
            label: 'Key Skills & Competencies',
            required: true
          },
          {
            id: 'sample-job-3-4',
            type: 'textarea',
            label: 'Why are you interested in this position?',
            required: true
          }
        ]
      },
      {
        id: 'sample-job-4',
        title: 'References',
        description: 'Professional references (optional)',
        questions: [
          {
            id: 'sample-job-4-1',
            type: 'textarea',
            label: 'Reference 1: Name, Title, Company, Phone',
            required: false
          },
          {
            id: 'sample-job-4-2',
            type: 'textarea',
            label: 'Reference 2: Name, Title, Company, Phone',
            required: false
          },
          {
            id: 'sample-job-4-3',
            type: 'checkbox',
            label: 'Acknowledgment',
            required: true,
            options: ['I certify that the information provided is accurate and complete']
          },
          {
            id: 'sample-job-4-4',
            type: 'signature',
            label: 'Applicant Signature',
            required: true
          }
        ]
      }
    ]
  },

  {
    name: 'Registration Form',
    description: 'General registration form for events, services, or memberships',
    category: 'Events',
    icon: '📋',
    sections: [
      {
        id: 'sample-reg-1',
        title: 'Participant Information',
        description: 'Who is registering?',
        questions: [
          {
            id: 'sample-reg-1-1',
            type: 'text',
            label: 'Full Name',
            required: true
          },
          {
            id: 'sample-reg-1-2',
            type: 'text',
            label: 'Email Address',
            required: true
          },
          {
            id: 'sample-reg-1-3',
            type: 'text',
            label: 'Phone Number',
            required: true
          },
          {
            id: 'sample-reg-1-4',
            type: 'text',
            label: 'Organization/Company (if applicable)',
            required: false
          },
          {
            id: 'sample-reg-1-5',
            type: 'text',
            label: 'Job Title/Role (if applicable)',
            required: false
          }
        ]
      },
      {
        id: 'sample-reg-2',
        title: 'Registration Details',
        description: 'What are you registering for?',
        questions: [
          {
            id: 'sample-reg-2-1',
            type: 'radio',
            label: 'Registration Type',
            required: true,
            options: ['Individual', 'Group', 'Organization', 'Student']
          },
          {
            id: 'sample-reg-2-2',
            type: 'text',
            label: 'Number of Participants (if group)',
            required: false
          },
          {
            id: 'sample-reg-2-3',
            type: 'checkbox',
            label: 'What are you interested in?',
            required: true,
            options: ['Full Access', 'Basic Package', 'Premium Package', 'VIP Package']
          },
          {
            id: 'sample-reg-2-4',
            type: 'radio',
            label: 'How did you hear about us?',
            required: false,
            options: ['Website', 'Social Media', 'Referral', 'Email', 'Advertisement', 'Other']
          }
        ]
      },
      {
        id: 'sample-reg-3',
        title: 'Additional Information',
        description: 'Help us serve you better',
        questions: [
          {
            id: 'sample-reg-3-1',
            type: 'textarea',
            label: 'Dietary Restrictions/Allergies (if applicable)',
            required: false
          },
          {
            id: 'sample-reg-3-2',
            type: 'textarea',
            label: 'Special Accommodations Needed',
            required: false
          },
          {
            id: 'sample-reg-3-3',
            type: 'textarea',
            label: 'Additional Comments or Questions',
            required: false
          },
          {
            id: 'sample-reg-3-4',
            type: 'checkbox',
            label: 'Agreement',
            required: true,
            options: ['I agree to the terms and conditions', 'I consent to receive updates and communications']
          },
          {
            id: 'sample-reg-3-5',
            type: 'signature',
            label: 'Signature',
            required: true
          }
        ]
      }
    ]
  },

  {
    name: 'Order Form',
    description: 'Product or service order form with pricing and delivery details',
    category: 'Sales',
    icon: '🛒',
    sections: [
      {
        id: 'sample-order-1',
        title: 'Customer Information',
        description: 'Billing and contact details',
        questions: [
          {
            id: 'sample-order-1-1',
            type: 'text',
            label: 'Full Name',
            required: true
          },
          {
            id: 'sample-order-1-2',
            type: 'text',
            label: 'Email Address',
            required: true
          },
          {
            id: 'sample-order-1-3',
            type: 'text',
            label: 'Phone Number',
            required: true
          },
          {
            id: 'sample-order-1-4',
            type: 'textarea',
            label: 'Billing Address',
            required: true
          },
          {
            id: 'sample-order-1-5',
            type: 'text',
            label: 'Company/Organization (optional)',
            required: false
          }
        ]
      },
      {
        id: 'sample-order-2',
        title: 'Order Details',
        description: 'What would you like to order?',
        questions: [
          {
            id: 'sample-order-2-1',
            type: 'textarea',
            label: 'Product/Service Description (Item 1)',
            required: true
          },
          {
            id: 'sample-order-2-2',
            type: 'text',
            label: 'Quantity',
            required: true
          },
          {
            id: 'sample-order-2-3',
            type: 'textarea',
            label: 'Additional Items (optional)',
            required: false
          },
          {
            id: 'sample-order-2-4',
            type: 'checkbox',
            label: 'Add-ons or Special Options',
            required: false,
            options: ['Rush Processing', 'Gift Wrapping', 'Extended Warranty', 'Installation Service']
          },
          {
            id: 'sample-order-2-5',
            type: 'textarea',
            label: 'Special Instructions or Customization',
            required: false
          }
        ]
      },
      {
        id: 'sample-order-3',
        title: 'Delivery & Payment',
        description: 'How and when do you need this?',
        questions: [
          {
            id: 'sample-order-3-1',
            type: 'radio',
            label: 'Delivery Method',
            required: true,
            options: ['Shipping', 'Local Pickup', 'Digital Delivery', 'In-Person Service']
          },
          {
            id: 'sample-order-3-2',
            type: 'textarea',
            label: 'Shipping Address (if different from billing)',
            required: false
          },
          {
            id: 'sample-order-3-3',
            type: 'text',
            label: 'Desired Delivery/Service Date',
            required: false
          },
          {
            id: 'sample-order-3-4',
            type: 'radio',
            label: 'Payment Method',
            required: true,
            options: ['Credit Card', 'PayPal', 'Bank Transfer', 'Cash', 'Invoice', 'Other']
          },
          {
            id: 'sample-order-3-5',
            type: 'text',
            label: 'Purchase Order Number (if applicable)',
            required: false
          },
          {
            id: 'sample-order-3-6',
            type: 'signature',
            label: 'Signature to Confirm Order',
            required: true
          }
        ]
      }
    ]
  },

  {
    name: 'Reservation Form',
    description: 'Booking form for appointments, services, or venue reservations',
    category: 'Bookings',
    icon: '📅',
    sections: [
      {
        id: 'sample-res-1',
        title: 'Contact Information',
        description: 'Who is making the reservation?',
        questions: [
          {
            id: 'sample-res-1-1',
            type: 'text',
            label: 'Full Name',
            required: true
          },
          {
            id: 'sample-res-1-2',
            type: 'text',
            label: 'Email Address',
            required: true
          },
          {
            id: 'sample-res-1-3',
            type: 'text',
            label: 'Phone Number',
            required: true
          },
          {
            id: 'sample-res-1-4',
            type: 'text',
            label: 'Alternative Contact Number (optional)',
            required: false
          }
        ]
      },
      {
        id: 'sample-res-2',
        title: 'Reservation Details',
        description: 'When and what would you like to book?',
        questions: [
          {
            id: 'sample-res-2-1',
            type: 'radio',
            label: 'Type of Reservation',
            required: true,
            options: ['Appointment', 'Service', 'Event Space', 'Table/Seating', 'Equipment', 'Other']
          },
          {
            id: 'sample-res-2-2',
            type: 'text',
            label: 'Preferred Date',
            required: true
          },
          {
            id: 'sample-res-2-3',
            type: 'text',
            label: 'Preferred Time',
            required: true
          },
          {
            id: 'sample-res-2-4',
            type: 'text',
            label: 'Alternative Date/Time (if available)',
            required: false
          },
          {
            id: 'sample-res-2-5',
            type: 'text',
            label: 'Duration (hours/days)',
            required: false
          },
          {
            id: 'sample-res-2-6',
            type: 'text',
            label: 'Number of People/Guests',
            required: true
          }
        ]
      },
      {
        id: 'sample-res-3',
        title: 'Additional Details',
        description: 'Special requests and preferences',
        questions: [
          {
            id: 'sample-res-3-1',
            type: 'checkbox',
            label: 'Special Requirements',
            required: false,
            options: ['Wheelchair Accessible', 'Parking Needed', 'AV Equipment', 'Catering', 'Other']
          },
          {
            id: 'sample-res-3-2',
            type: 'textarea',
            label: 'Special Requests or Notes',
            required: false
          },
          {
            id: 'sample-res-3-3',
            type: 'radio',
            label: 'How did you hear about us?',
            required: false,
            options: ['Website', 'Social Media', 'Referral', 'Previous Customer', 'Advertisement', 'Other']
          },
          {
            id: 'sample-res-3-4',
            type: 'checkbox',
            label: 'Agreement',
            required: true,
            options: ['I understand the cancellation policy', 'I agree to the terms and conditions']
          },
          {
            id: 'sample-res-3-5',
            type: 'signature',
            label: 'Signature to Confirm Reservation',
            required: true
          }
        ]
      }
    ]
  },

  {
    name: 'Client Intake Form - Website Copy Generation',
    description: 'Comprehensive intake form for collecting client information to generate website copy',
    category: 'Marketing',
    icon: '📝',
    sections: [
      {
        id: 'sample-intake-1',
        title: 'Basic Information',
        description: 'Tell us about your business',
        questions: [
          {
            id: 'sample-intake-1-1',
            type: 'text',
            label: 'Company/Business Name',
            required: true
          },
          {
            id: 'sample-intake-1-2',
            type: 'textarea',
            label: 'What service do you provide? (Be specific - e.g., "Tree removal and storm cleanup" not just "landscaping")',
            required: true
          },
          {
            id: 'sample-intake-1-3',
            type: 'text',
            label: 'Business phone number (This is where quote requests will be sent via text)',
            required: true
          },
          {
            id: 'sample-intake-1-4',
            type: 'text',
            label: 'Where do you provide service? (City, county, or region)',
            required: true
          }
        ]
      },
      {
        id: 'sample-intake-2',
        title: 'Your Customers',
        description: 'Help us understand who you serve',
        questions: [
          {
            id: 'sample-intake-2-1',
            type: 'textarea',
            label: 'Who is your ideal customer? (e.g., "Homeowners with overgrown properties", "Property managers", "Realtors")',
            required: true
          },
          {
            id: 'sample-intake-2-2',
            type: 'textarea',
            label: 'What problem are they trying to solve when they call you?',
            required: true
          },
          {
            id: 'sample-intake-2-3',
            type: 'textarea',
            label: 'Why do other companies fail to solve this problem? (What makes the job difficult?)',
            required: true
          },
          {
            id: 'sample-intake-2-4',
            type: 'textarea',
            label: 'What happens if they DON\'T hire someone to fix this? (What pain continues?)',
            required: true
          }
        ]
      },
      {
        id: 'sample-intake-3',
        title: 'Your Solution',
        description: 'What makes you different',
        questions: [
          {
            id: 'sample-intake-3-1',
            type: 'textarea',
            label: 'What makes YOUR company different from competitors? (Your unique advantage)',
            required: true
          },
          {
            id: 'sample-intake-3-2',
            type: 'textarea',
            label: 'How do you actually solve the problem? (Your process, equipment, approach)',
            required: true
          },
          {
            id: 'sample-intake-3-3',
            type: 'text',
            label: 'How fast can you typically complete jobs? (Timeline/turnaround)',
            required: true
          },
          {
            id: 'sample-intake-3-4',
            type: 'text',
            label: 'How do you price your work? (e.g., "Flat-rate quotes", "By the job, not by the hour")',
            required: true
          }
        ]
      },
      {
        id: 'sample-intake-4',
        title: 'Services',
        description: 'Your three main services',
        questions: [
          {
            id: 'sample-intake-4-1',
            type: 'text',
            label: 'Service 1 Name',
            required: true
          },
          {
            id: 'sample-intake-4-2',
            type: 'textarea',
            label: 'Service 1 - What it includes',
            required: true
          },
          {
            id: 'sample-intake-4-3',
            type: 'text',
            label: 'Service 2 Name',
            required: true
          },
          {
            id: 'sample-intake-4-4',
            type: 'textarea',
            label: 'Service 2 - What it includes',
            required: true
          },
          {
            id: 'sample-intake-4-5',
            type: 'text',
            label: 'Service 3 Name',
            required: true
          },
          {
            id: 'sample-intake-4-6',
            type: 'textarea',
            label: 'Service 3 - What it includes',
            required: true
          }
        ]
      },
      {
        id: 'sample-intake-5',
        title: 'Brand Voice',
        description: 'Your company\'s personality',
        questions: [
          {
            id: 'sample-intake-5-1',
            type: 'checkbox',
            label: 'How would you describe your company\'s personality? (Check all that apply)',
            required: true,
            options: [
              'Professional and polished',
              'Friendly and approachable',
              'No-nonsense and direct',
              'Confident and bold',
              'Down-to-earth and reliable'
            ]
          },
          {
            id: 'sample-intake-5-2',
            type: 'textarea',
            label: 'If you had to describe your company in ONE sentence, what would it be?',
            required: true
          }
        ]
      },
      {
        id: 'sample-intake-6',
        title: 'Logo & Branding',
        description: 'Visual identity information',
        questions: [
          {
            id: 'sample-intake-6-1',
            type: 'radio',
            label: 'Do you have a logo file?',
            required: true,
            options: ['Yes', 'No']
          },
          {
            id: 'sample-intake-6-2',
            type: 'text',
            label: 'If yes, please provide email address to send logo file',
            required: false
          },
          {
            id: 'sample-intake-6-3',
            type: 'radio',
            label: 'Do you have specific brand colors?',
            required: true,
            options: ['Yes', 'No']
          },
          {
            id: 'sample-intake-6-4',
            type: 'text',
            label: 'If yes, what are your brand colors?',
            required: false
          }
        ]
      },
      {
        id: 'sample-intake-7',
        title: 'Final Question',
        description: 'The one thing that matters most',
        questions: [
          {
            id: 'sample-intake-7-1',
            type: 'textarea',
            label: 'What\'s the ONE thing you want every potential customer to remember about your business?',
            required: true
          },
          {
            id: 'sample-intake-7-2',
            type: 'signature',
            label: 'Client Signature',
            required: true
          }
        ]
      }
    ]
  }
];

// Export for use in other modules
window.SAMPLE_TEMPLATES = SAMPLE_TEMPLATES;
