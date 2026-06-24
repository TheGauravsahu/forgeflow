import { FormField } from '../types/shared';

export interface FormTemplate {
  id: string;
  title: string;
  description: string;
  iconName: string;
  fields: FormField[];
  settings: {
    submitButtonText: string;
    successMessage: string;
    theme: {
      primaryColor: string;
      backgroundColor: string;
      borderRadius: string;
      fontFamily: string;
    };
  };
}

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: 'contact-form',
    title: 'Contact Form',
    description: 'Simple contact request form with name, email, subject, and message fields.',
    iconName: 'Mail',
    settings: {
      submitButtonText: 'Send Message',
      successMessage: 'Thank you! Your message has been sent successfully. We will get back to you soon.',
      theme: {
        primaryColor: '#f59e0b',
        backgroundColor: '#ffffff',
        borderRadius: '0.625rem',
        fontFamily: 'Geist'
      }
    },
    fields: [
      {
        id: 'heading-1',
        type: 'heading',
        properties: {
          label: 'Contact Us',
          level: 'h2',
          content: 'We\'d love to hear from you. Fill out the form below.'
        }
      },
      {
        id: 'name',
        type: 'text',
        properties: {
          label: 'Full Name',
          placeholder: 'John Doe',
          required: true
        }
      },
      {
        id: 'email',
        type: 'email',
        properties: {
          label: 'Email Address',
          placeholder: 'john@example.com',
          required: true
        }
      },
      {
        id: 'subject',
        type: 'text',
        properties: {
          label: 'Subject',
          placeholder: 'How can we help you?',
          required: false
        }
      },
      {
        id: 'message',
        type: 'paragraph',
        properties: {
          label: 'Your Message',
          placeholder: 'Type your inquiry here...',
          required: true
        }
      }
    ]
  },
  {
    id: 'job-application',
    title: 'Job Application',
    description: 'Collect applications with position, experience level, details, and resume upload.',
    iconName: 'Briefcase',
    settings: {
      submitButtonText: 'Submit Application',
      successMessage: 'Thank you for applying! We have received your application and will review it shortly.',
      theme: {
        primaryColor: '#f59e0b',
        backgroundColor: '#ffffff',
        borderRadius: '0.625rem',
        fontFamily: 'Geist'
      }
    },
    fields: [
      {
        id: 'heading-1',
        type: 'heading',
        properties: {
          label: 'Careers at ForgeFlow',
          level: 'h2',
          content: 'Join our team. Please complete the application below.'
        }
      },
      {
        id: 'name',
        type: 'text',
        properties: {
          label: 'Full Name',
          placeholder: 'Jane Doe',
          required: true
        }
      },
      {
        id: 'email',
        type: 'email',
        properties: {
          label: 'Email Address',
          placeholder: 'jane@example.com',
          required: true
        }
      },
      {
        id: 'phone',
        type: 'phone',
        properties: {
          label: 'Phone Number',
          placeholder: '+1 (555) 000-0000',
          required: true
        }
      },
      {
        id: 'position',
        type: 'select',
        properties: {
          label: 'Position Applied For',
          required: true,
          options: [
            { label: 'Software Engineer', value: 'swe' },
            { label: 'Product Manager', value: 'pm' },
            { label: 'UI/UX Designer', value: 'designer' },
            { label: 'Marketing Specialist', value: 'marketing' }
          ]
        }
      },
      {
        id: 'experience',
        type: 'select',
        properties: {
          label: 'Experience Level',
          required: true,
          options: [
            { label: 'Junior (0-2 years)', value: 'junior' },
            { label: 'Mid-level (2-5 years)', value: 'mid' },
            { label: 'Senior (5-8 years)', value: 'senior' },
            { label: 'Lead / Principal (8+ years)', value: 'lead' }
          ]
        }
      },
      {
        id: 'resume',
        type: 'file',
        properties: {
          label: 'Resume Upload (PDF, DOCX)',
          required: false,
          allowedFileTypes: ['.pdf', '.docx'],
          maxSizeMB: 5
        }
      },
      {
        id: 'cover_letter',
        type: 'paragraph',
        properties: {
          label: 'Cover Letter / Notes',
          placeholder: 'Why do you want to join us?',
          required: false
        }
      }
    ]
  },
  {
    id: 'event-registration',
    title: 'Event Registration',
    description: 'Ticket type selectors, attendee count, dietary selections, and terms consent.',
    iconName: 'Calendar',
    settings: {
      submitButtonText: 'Register Now',
      successMessage: 'Registration successful! Check your email for your ticket and event details.',
      theme: {
        primaryColor: '#f59e0b',
        backgroundColor: '#ffffff',
        borderRadius: '0.625rem',
        fontFamily: 'Geist'
      }
    },
    fields: [
      {
        id: 'heading-1',
        type: 'heading',
        properties: {
          label: 'ForgeFlow Summit 2026',
          level: 'h2',
          content: 'Secure your spot for the annual tech summit.'
        }
      },
      {
        id: 'name',
        type: 'text',
        properties: {
          label: 'Full Name',
          placeholder: 'Alice Smith',
          required: true
        }
      },
      {
        id: 'email',
        type: 'email',
        properties: {
          label: 'Email Address',
          placeholder: 'alice@example.com',
          required: true
        }
      },
      {
        id: 'ticket_type',
        type: 'select',
        properties: {
          label: 'Ticket Tier',
          required: true,
          options: [
            { label: 'General Admission ($99)', value: 'general' },
            { label: 'VIP Pass ($299)', value: 'vip' },
            { label: 'Virtual Live Stream (Free)', value: 'virtual' }
          ]
        }
      },
      {
        id: 'tickets_count',
        type: 'number',
        properties: {
          label: 'Number of Tickets',
          required: true,
          min: 1,
          max: 10,
          defaultValue: 1
        }
      },
      {
        id: 'dietary',
        type: 'checkbox',
        properties: {
          label: 'Dietary Requirements',
          required: false,
          options: [
            { label: 'None', value: 'none' },
            { label: 'Vegetarian', value: 'vegetarian' },
            { label: 'Vegan', value: 'vegan' },
            { label: 'Gluten Free', value: 'gluten-free' },
            { label: 'Nut Allergy', value: 'nut-allergy' }
          ]
        }
      },
      {
        id: 'consent',
        type: 'toggle',
        properties: {
          label: 'I agree to the code of conduct and event policies',
          required: true
        }
      }
    ]
  },
  {
    id: 'customer-feedback',
    title: 'Customer Feedback',
    description: 'Collect client feedback using 5-star ratings, sliders, and detailed reviews.',
    iconName: 'MessageSquare',
    settings: {
      submitButtonText: 'Submit Feedback',
      successMessage: 'Thank you for your feedback! Your comments help us improve our services.',
      theme: {
        primaryColor: '#f59e0b',
        backgroundColor: '#ffffff',
        borderRadius: '0.625rem',
        fontFamily: 'Geist'
      }
    },
    fields: [
      {
        id: 'heading-1',
        type: 'heading',
        properties: {
          label: 'Share Your Experience',
          level: 'h2',
          content: 'We value your input. Let us know how we did.'
        }
      },
      {
        id: 'rating',
        type: 'rating',
        properties: {
          label: 'Overall Satisfaction',
          required: true,
          max: 5,
          defaultValue: 5
        }
      },
      {
        id: 'category',
        type: 'select',
        properties: {
          label: 'What does your feedback relate to?',
          required: true,
          options: [
            { label: 'Product Quality', value: 'product' },
            { label: 'Website Experience', value: 'web' },
            { label: 'Customer Support', value: 'support' },
            { label: 'Shipping & Delivery', value: 'shipping' }
          ]
        }
      },
      {
        id: 'recommend',
        type: 'slider',
        properties: {
          label: 'How likely are you to recommend us to a friend? (1-10)',
          required: true,
          min: 1,
          max: 10,
          defaultValue: 8
        }
      },
      {
        id: 'comments',
        type: 'paragraph',
        properties: {
          label: 'What could we improve?',
          placeholder: 'Tell us in detail...',
          required: false
        }
      }
    ]
  },
  {
    id: 'survey',
    title: 'Survey',
    description: 'Standard research survey with multi-choice, usability scales, and open response.',
    iconName: 'Clipboard',
    settings: {
      submitButtonText: 'Complete Survey',
      successMessage: 'Thank you for participating! Your responses have been recorded.',
      theme: {
        primaryColor: '#f59e0b',
        backgroundColor: '#ffffff',
        borderRadius: '0.625rem',
        fontFamily: 'Geist'
      }
    },
    fields: [
      {
        id: 'heading-1',
        type: 'heading',
        properties: {
          label: 'User Research Survey',
          level: 'h2',
          content: 'Help us understand how users interact with our platform.'
        }
      },
      {
        id: 'employment',
        type: 'select',
        properties: {
          label: 'What is your current employment status?',
          required: true,
          options: [
            { label: 'Employed Full-time', value: 'full-time' },
            { label: 'Employed Part-time', value: 'part-time' },
            { label: 'Self-employed / Freelancer', value: 'self-employed' },
            { label: 'Student', value: 'student' },
            { label: 'Other', value: 'other' }
          ]
        }
      },
      {
        id: 'features',
        type: 'checkbox',
        properties: {
          label: 'Which features do you use most frequently? (Select all that apply)',
          required: false,
          options: [
            { label: 'Form Builder Canvas', value: 'canvas' },
            { label: 'Insights & Analytics', value: 'analytics' },
            { label: 'File Upload Inputs', value: 'files' },
            { label: 'Embed Webhooks', value: 'webhooks' },
            { label: 'Themes / Colors Customization', value: 'themes' }
          ]
        }
      },
      {
        id: 'usability',
        type: 'rating',
        properties: {
          label: 'How would you rate the platform usability?',
          required: true,
          max: 5,
          defaultValue: 4
        }
      },
      {
        id: 'suggestions',
        type: 'paragraph',
        properties: {
          label: 'Any additional suggestions or requests?',
          placeholder: 'Type your suggestions here...',
          required: false
        }
      }
    ]
  },
  {
    id: 'lead-capture',
    title: 'Lead Capture',
    description: 'Capture business leads with company metrics, custom requests, and profile validation.',
    iconName: 'Target',
    settings: {
      submitButtonText: 'Book Demo Session',
      successMessage: 'Thank you for your interest! A ForgeFlow consultant will reach out to you within 24 hours.',
      theme: {
        primaryColor: '#f59e0b',
        backgroundColor: '#ffffff',
        borderRadius: '0.625rem',
        fontFamily: 'Geist'
      }
    },
    fields: [
      {
        id: 'heading-1',
        type: 'heading',
        properties: {
          label: 'Request a Personalized Demo',
          level: 'h2',
          content: 'Let\'s talk about how ForgeFlow can optimize your workflow.'
        }
      },
      {
        id: 'first_name',
        type: 'text',
        properties: {
          label: 'First Name',
          placeholder: 'John',
          required: true
        }
      },
      {
        id: 'last_name',
        type: 'text',
        properties: {
          label: 'Last Name',
          placeholder: 'Doe',
          required: true
        }
      },
      {
        id: 'email',
        type: 'email',
        properties: {
          label: 'Business Email Address',
          placeholder: 'john@company.com',
          required: true
        }
      },
      {
        id: 'company',
        type: 'text',
        properties: {
          label: 'Company Name',
          placeholder: 'Acme Corp',
          required: true
        }
      },
      {
        id: 'company_size',
        type: 'select',
        properties: {
          label: 'Company Size',
          required: true,
          options: [
            { label: '1 - 10 employees', value: '1-10' },
            { label: '11 - 50 employees', value: '11-50' },
            { label: '51 - 200 employees', value: '51-200' },
            { label: '201 - 1000 employees', value: '201-1000' },
            { label: '1000+ employees', value: '1000+' }
          ]
        }
      },
      {
        id: 'message',
        type: 'paragraph',
        properties: {
          label: 'Tell us about your form builder requirements',
          placeholder: 'What are you looking to achieve?',
          required: false
        }
      }
    ]
  },
  {
    id: 'newsletter-signup',
    title: 'Newsletter Signup',
    description: 'Clean marketing newsletter subscription with checkbox interest and privacy consent.',
    iconName: 'Sparkles',
    settings: {
      submitButtonText: 'Subscribe to Newsletter',
      successMessage: 'Welcome to the club! You are now subscribed. Check your inbox for our latest updates.',
      theme: {
        primaryColor: '#f59e0b',
        backgroundColor: '#ffffff',
        borderRadius: '0.625rem',
        fontFamily: 'Geist'
      }
    },
    fields: [
      {
        id: 'heading-1',
        type: 'heading',
        properties: {
          label: 'Join the ForgeFlow Dispatch',
          level: 'h2',
          content: 'Get weekly tips on visual design, form engineering, and analytics insights.'
        }
      },
      {
        id: 'email',
        type: 'email',
        properties: {
          label: 'Email Address',
          placeholder: 'you@domain.com',
          required: true
        }
      },
      {
        id: 'interests',
        type: 'checkbox',
        properties: {
          label: 'Which topics are you interested in?',
          required: true,
          options: [
            { label: 'Product announcements & features', value: 'product' },
            { label: 'Developer tutorials & APIs', value: 'dev' },
            { label: 'Design tips & templates', value: 'design' },
            { label: 'Special promotion offers', value: 'offers' }
          ]
        }
      },
      {
        id: 'privacy',
        type: 'toggle',
        properties: {
          label: 'I accept the privacy policy and agree to receive marketing emails',
          required: true
        }
      }
    ]
  },
  {
    id: 'quiz',
    title: 'Quiz / Trivia',
    description: 'Build interactive questionnaires or knowledge check quizzes.',
    iconName: 'HelpCircle',
    settings: {
      submitButtonText: 'Submit Quiz',
      successMessage: 'Thank you! Your answers have been submitted. We will send you your score shortly.',
      theme: {
        primaryColor: '#f59e0b',
        backgroundColor: '#ffffff',
        borderRadius: '0.625rem',
        fontFamily: 'Geist'
      }
    },
    fields: [
      {
        id: 'heading-1',
        type: 'heading',
        properties: {
          label: 'General Technology Quiz',
          level: 'h2',
          content: 'Test your basic web development knowledge!'
        }
      },
      {
        id: 'q1',
        type: 'radio',
        properties: {
          label: '1. What does HTML stand for?',
          required: true,
          options: [
            { label: 'Hyper Text Markup Language', value: 'correct' },
            { label: 'Hyper Text Markdown Language', value: 'w1' },
            { label: 'Hyperlinks Text Machine Language', value: 'w2' }
          ]
        }
      },
      {
        id: 'q2',
        type: 'radio',
        properties: {
          label: '2. Which language runs in a web browser context?',
          required: true,
          options: [
            { label: 'C++', value: 'w1' },
            { label: 'Python', value: 'w2' },
            { label: 'JavaScript', value: 'correct' },
            { label: 'Java', value: 'w3' }
          ]
        }
      },
      {
        id: 'q3',
        type: 'radio',
        properties: {
          label: '3. What is the standard port for HTTPS?',
          required: true,
          options: [
            { label: '80', value: 'w1' },
            { label: '443', value: 'correct' },
            { label: '8080', value: 'w2' },
            { label: '22', value: 'w3' }
          ]
        }
      },
      {
        id: 'username',
        type: 'text',
        properties: {
          label: 'Enter your name to register your score',
          placeholder: 'Tester',
          required: false
        }
      }
    ]
  },
  {
    id: 'support-request',
    title: 'Support Request',
    description: 'Ticket generation form with category selector, urgency selector, and description.',
    iconName: 'AlertCircle',
    settings: {
      submitButtonText: 'Create Support Ticket',
      successMessage: 'Support ticket created successfully! A member of our support team will reply within 4 hours.',
      theme: {
        primaryColor: '#f59e0b',
        backgroundColor: '#ffffff',
        borderRadius: '0.625rem',
        fontFamily: 'Geist'
      }
    },
    fields: [
      {
        id: 'heading-1',
        type: 'heading',
        properties: {
          label: 'Submit a Support Request',
          level: 'h2',
          content: 'Encountered an issue? Describe it below and we\'ll get it sorted.'
        }
      },
      {
        id: 'subject',
        type: 'text',
        properties: {
          label: 'Subject',
          placeholder: 'e.g., Cannot export CSV from insights',
          required: true
        }
      },
      {
        id: 'department',
        type: 'select',
        properties: {
          label: 'Related Department',
          required: true,
          options: [
            { label: 'Technical Support', value: 'tech' },
            { label: 'Billing & Invoicing', value: 'billing' },
            { label: 'Sales & Account Upgrades', value: 'sales' }
          ]
        }
      },
      {
        id: 'urgency',
        type: 'select',
        properties: {
          label: 'Urgency Level',
          required: true,
          options: [
            { label: 'Low - General Question', value: 'low' },
            { label: 'Medium - Affecting performance', value: 'medium' },
            { label: 'High - Core blocker', value: 'high' },
            { label: 'Urgent - System completely down', value: 'urgent' }
          ]
        }
      },
      {
        id: 'description',
        type: 'paragraph',
        properties: {
          label: 'Detailed Description',
          placeholder: 'Provide steps to reproduce the issue and any details...',
          required: true
        }
      },
      {
        id: 'attachment',
        type: 'file',
        properties: {
          label: 'Attach error screenshot or logs (optional)',
          required: false,
          maxSizeMB: 10
        }
      }
    ]
  }
];
