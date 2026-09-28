import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';
import type { LegalSection } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms that govern bookings, stays, and use of the Nova Suites website and services.',
};

const UPDATED = 'September 2026';

const sections: LegalSection[] = [
  {
    heading: 'Agreement to These Terms',
    paragraphs: [
      'These terms govern your use of the Nova Suites website and your bookings with us. By making a reservation or using the site, you confirm that you are at least 18 years old and that you accept these terms. If you book on behalf of others, you confirm you have their permission to share their details with us.',
    ],
  },
  {
    heading: 'Bookings and Reservations',
    paragraphs: [
      'A booking is confirmed only once we have issued a confirmation and, where required, received payment. We reserve the right to decline or cancel a reservation in limited circumstances, including suspected fraud, incorrect pricing, or unavailability of the room.',
    ],
    bullets: [
      'You must provide accurate guest details and a valid contact email address.',
      'The lead guest is responsible for the booking and for all guests staying under it.',
      'Room assignments are indicative; we may move you to an equivalent or better room.',
    ],
  },
  {
    heading: 'Rates and Payment',
    paragraphs: [
      'Rates are quoted per room, per night, in Nigerian Naira (NGN), and include applicable taxes and fees unless stated otherwise. Online card payments are processed securely by Paystack. Your reservation may be held as pending until payment is confirmed.',
    ],
  },
  {
    heading: 'Check-in and Check-out',
    paragraphs: [
      'Standard check-in is from 2:00 PM and check-out is by 12:00 noon. Early check-in and late check-out are subject to availability and may incur an additional charge. A valid government-issued ID is required at check-in.',
    ],
  },
  {
    heading: 'Cancellations and Refunds',
    paragraphs: [
      'You may cancel free of charge up to 48 hours before your check-in date. Cancellations made within 48 hours of check-in, and no-shows, may be charged for the first night. Refunds are returned to the original payment method and typically take 5\u201310 business days to appear.',
    ],
  },
  {
    heading: 'Guest Conduct',
    paragraphs: [
      'We want every guest to feel safe and comfortable. We ask that you keep noise to a reasonable level, treat our team and other guests with respect, and follow the guidance of hotel staff. We may ask a guest to leave, without refund, for behaviour that is unlawful, unsafe, or seriously disruptive.',
    ],
    bullets: [
      'Smoking is not permitted indoors; designated outdoor areas are available.',
      'Pets are not permitted except registered assistance animals.',
      'Outside visitors are welcome in public areas and must be accompanied in guest areas.',
    ],
  },
  {
    heading: 'Damages and Liability',
    paragraphs: [
      'You are responsible for any loss or damage caused to hotel property by you or your guests during your stay. Where damage is identified, we will notify you and charge the reasonable cost of repair or replacement to the payment method on file.',
    ],
  },
  {
    heading: 'Parking and Valuables',
    paragraphs: [
      'On-site parking is provided as a courtesy and is used at your own risk. A safe is available in every room; please use it for valuables. To the extent permitted by law, we are not liable for loss or damage to items that have not been deposited in a safe.',
    ],
  },
  {
    heading: 'Events and Group Bookings',
    paragraphs: [
      'Events, conferences, and group stays are governed by separate terms and may require a deposit and a signed agreement. Please contact our events team to discuss your requirements.',
    ],
  },
  {
    heading: 'Intellectual Property',
    paragraphs: [
      'The Nova Suites name, logo, website content, and imagery are owned by us or our licensors and may not be copied, reproduced, or used without our written permission.',
    ],
  },
  {
    heading: 'Governing Law',
    paragraphs: [
      'These terms are governed by the laws of the Federal Republic of Nigeria, and any disputes will be subject to the exclusive jurisdiction of the courts of Lagos State.',
    ],
  },
  {
    heading: 'Changes to These Terms',
    paragraphs: [
      'We may update these terms from time to time. The version in effect at the time of your booking applies to that booking. Continued use of the website after an update constitutes acceptance of the revised terms.',
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated={UPDATED}
      intro="These terms set out the agreement between you and Nova Suites for reservations, stays, and use of our website. Please read them carefully before booking."
      sections={sections}
    />
  );
}
