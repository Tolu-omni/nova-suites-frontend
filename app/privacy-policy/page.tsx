import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';
import type { LegalSection } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Nova Suites collects, uses, and protects your personal information when you book or stay with us.',
};

const UPDATED = 'September 2026';

const sections: LegalSection[] = [
  {
    heading: 'Information We Collect',
    paragraphs: [
      'We collect the information you give us when you create an account, make a booking, or contact us, along with limited technical data gathered automatically when you use our website.',
    ],
    bullets: [
      'Booking details you provide: full name, email address, stay dates, guest count, and any special requests.',
      'Account details: your name, email address, and a securely hashed password.',
      'Payment details: transaction references and amounts. Card data is handled directly by our payment provider, Paystack; Nova Suites does not store full card numbers.',
      'Technical data: IP address, browser type, device type, and pages visited, used to keep the site secure and working correctly.',
    ],
  },
  {
    heading: 'How We Use Your Information',
    paragraphs: [
      'We use your information to provide and improve our services, and to meet our legal and accounting obligations.',
    ],
    bullets: [
      'To create and manage your reservations, and to confirm your stay.',
      'To process payments and issue receipts through Paystack.',
      'To contact you about your booking, including confirmation and pre-arrival details.',
      'To respond to enquiries, complaints, and requests for assistance.',
      'To detect and prevent fraud, abuse, and unauthorised access.',
      'To send offers and updates, only where you have opted in. You can unsubscribe at any time.',
    ],
  },
  {
    heading: 'Payment Information',
    paragraphs: [
      'Online payments are processed by Paystack, a PCI-DSS compliant payment provider. When you pay, you are redirected to Paystack and your card details are entered on their secure systems. We receive only the outcome of the transaction and a reference number, which we store against your booking for reconciliation and refunds.',
    ],
  },
  {
    heading: 'Cookies and Analytics',
    paragraphs: [
      'We use a small number of cookies and similar technologies to keep you signed in, remember your preferences, and understand how the site is used so we can improve it. You can control cookies through your browser settings; blocking essential cookies may prevent parts of the site from working.',
    ],
  },
  {
    heading: 'Sharing Your Information',
    paragraphs: [
      'We do not sell your personal information. We share it only where necessary to deliver our services or where the law requires it.',
    ],
    bullets: [
      'With payment providers to process your transactions.',
      'With service providers who support our operations, such as hosting and email delivery, under confidentiality obligations.',
      'With law enforcement or regulators where we are legally required to do so.',
      'With a successor organisation if the business is sold or restructured, in which case you will be notified.',
    ],
  },
  {
    heading: 'Data Retention',
    paragraphs: [
      'We keep booking and payment records for as long as needed to provide our services and to satisfy legal, tax, and accounting requirements. When information is no longer required, we delete it or anonymise it securely.',
    ],
  },
  {
    heading: 'Your Rights',
    paragraphs: [
      'Subject to applicable law, including the Nigeria Data Protection Act, you have the right to access, correct, or delete the personal information we hold about you, and to object to or restrict certain processing.',
    ],
    bullets: [
      'Request a copy of the personal information we hold about you.',
      'Ask us to correct information that is inaccurate or incomplete.',
      'Ask us to delete information we no longer have a lawful reason to keep.',
      'Withdraw consent for marketing at any time.',
    ],
  },
  {
    heading: 'Security',
    paragraphs: [
      'We use industry-standard measures to protect your information, including encryption in transit, hashed passwords, access controls, and regular review of our systems. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.',
    ],
  },
  {
    heading: 'Children\u2019s Privacy',
    paragraphs: [
      'Our website and services are not directed at children under 18. We do not knowingly collect personal information from children. If you believe a child has provided us with information, please contact us so we can remove it.',
    ],
  },
  {
    heading: 'International Transfers',
    paragraphs: [
      'Some of our service providers may store or process data outside Nigeria. Where that happens, we take steps to ensure your information receives an appropriate level of protection.',
    ],
  },
  {
    heading: 'Changes to This Policy',
    paragraphs: [
      'We may update this policy from time to time to reflect changes in our practices or the law. When we do, we will revise the "last updated" date above and, for significant changes, notify you by email or through the website.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated={UPDATED}
      intro="Nova Suites respects your privacy. This policy explains what personal information we collect, why we collect it, how we protect it, and the choices you have."
      sections={sections}
    />
  );
}
