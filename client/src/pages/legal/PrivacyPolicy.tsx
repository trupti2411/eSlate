import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl" data-testid="privacy-policy-title">Privacy Policy</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: February 2026 | Version 2.0</p>
          </CardHeader>
          <CardContent className="prose prose-lg dark:prose-invert max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Creative Arc Infotech Pty Ltd ABN [ABN Number] ("Creative Arc," "we," "our," or "us") operates eSlate, an educational platform, and is committed to protecting the privacy of all users. This Privacy Policy explains how we collect, use, disclose, and safeguard personal information in accordance with the Australian Privacy Principles (APPs) contained in the Privacy Act 1988 (Cth) and other applicable privacy legislation.
            </p>
            <p>
              eSlate provides educational management services to education providers (tutoring centres, learning centres, educational institutions), their tutors, students, and parents/guardians. We understand the sensitive nature of educational data and take our privacy obligations seriously.
            </p>

            <h2>2. Definitions</h2>
            <ul>
              <li><strong>"Education Provider"</strong> means any tutoring centre, learning centre, coaching college, or educational institution that subscribes to eSlate's services</li>
              <li><strong>"Centre Manager"</strong> means an administrator of an Education Provider who manages the platform on their behalf</li>
              <li><strong>"Tutor"</strong> means an educator employed or contracted by an Education Provider who uses the platform</li>
              <li><strong>"Student"</strong> means a learner enrolled with an Education Provider and using the platform</li>
              <li><strong>"Parent/Guardian"</strong> means the parent, legal guardian, or authorized carer of a Student</li>
              <li><strong>"Personal Information"</strong> has the meaning given in the Privacy Act 1988 (Cth)</li>
              <li><strong>"Sensitive Information"</strong> includes health information, racial or ethnic origin, and other categories defined in the Privacy Act</li>
            </ul>

            <h2>3. Information We Collect</h2>
            
            <h3>3.1 Information from Education Providers</h3>
            <ul>
              <li>Business name, ABN, and contact details</li>
              <li>Centre Manager names and contact information</li>
              <li>Billing and payment information</li>
              <li>Business addresses and operating hours</li>
              <li>Staff/tutor rosters and contact details</li>
            </ul>

            <h3>3.2 Information from Tutors</h3>
            <ul>
              <li>Full name and contact details (email, phone)</li>
              <li>Employment information and qualifications</li>
              <li>Profile information and teaching specializations</li>
              <li>Working with Children Check details (where applicable)</li>
              <li>Class schedules and availability</li>
            </ul>

            <h3>3.3 Information from Students</h3>
            <ul>
              <li>Full name, date of birth, and year level</li>
              <li>School name and educational background</li>
              <li>Parent/guardian contact details</li>
              <li>Academic records, assignments, and test results</li>
              <li>Progress reports and learning analytics</li>
              <li>Attendance records</li>
              <li>Learning preferences and special requirements</li>
            </ul>

            <h3>3.4 Information from Parents/Guardians</h3>
            <ul>
              <li>Full name and relationship to student</li>
              <li>Contact details (email, phone, address)</li>
              <li>Emergency contact information</li>
              <li>Payment and billing information</li>
              <li>Communication preferences</li>
            </ul>

            <h3>3.5 Information from General Public</h3>
            <ul>
              <li>Contact form submissions (name, email, message)</li>
              <li>Newsletter subscriptions</li>
              <li>Inquiry details and communication history</li>
            </ul>

            <h3>3.6 Automatically Collected Information</h3>
            <ul>
              <li>Device information (browser type, operating system, device type)</li>
              <li>IP address and approximate geographic location</li>
              <li>Usage patterns, page views, and feature interactions</li>
              <li>Session data and authentication logs</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h2>4. How We Collect Information</h2>
            <p>We collect personal information through:</p>
            <ul>
              <li>Direct submission via account registration and forms</li>
              <li>Education Providers who enrol students and staff on our platform</li>
              <li>Tutors who input student information and academic records</li>
              <li>Parents/guardians who register themselves and their children</li>
              <li>Automated collection through cookies and analytics tools</li>
              <li>Communications via email, phone, or our contact form</li>
              <li>Third-party authentication services (where used)</li>
            </ul>

            <h2>5. Purpose of Collection</h2>
            <p>We collect and use personal information to:</p>
            <ul>
              <li>Provide and maintain our educational platform services</li>
              <li>Facilitate assignment creation, submission, and grading</li>
              <li>Enable communication between students, parents, tutors, and administrators</li>
              <li>Track academic progress and generate reports</li>
              <li>Manage class schedules and attendance</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send notifications about assignments, deadlines, and important updates</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Improve our platform, develop new features, and fix issues</li>
              <li>Ensure platform security and prevent fraud</li>
              <li>Comply with legal obligations and enforce our terms</li>
              <li>Generate anonymized analytics and insights</li>
            </ul>

            <h2>6. Disclosure of Information</h2>
            
            <h3>6.1 Within the Educational Relationship</h3>
            <p>We share information as necessary to provide educational services:</p>
            <ul>
              <li><strong>Students:</strong> Their information is accessible to their assigned tutors, the Education Provider's administrators, and their parents/guardians</li>
              <li><strong>Parents/Guardians:</strong> Have access to their children's academic records, progress, attendance, and communications</li>
              <li><strong>Tutors:</strong> Can access student information for students in their classes</li>
              <li><strong>Education Providers:</strong> Have access to all data within their organization</li>
            </ul>

            <h3>6.2 Third-Party Service Providers</h3>
            <p>We may share information with:</p>
            <ul>
              <li>Cloud hosting and storage providers (data centres located in Australia where possible)</li>
              <li>Payment processors for subscription and billing</li>
              <li>Email and communication service providers</li>
              <li>Analytics providers (anonymized data only)</li>
              <li>Security and fraud prevention services</li>
            </ul>

            <h3>6.3 Legal Requirements</h3>
            <p>We may disclose information when required by:</p>
            <ul>
              <li>Australian law, court orders, or legal process</li>
              <li>Government or regulatory authorities</li>
              <li>To protect our rights, property, or safety</li>
              <li>In connection with investigations of suspected illegal activity</li>
            </ul>

            <h3>6.4 What We Do NOT Do</h3>
            <ul>
              <li>We do NOT sell personal information to third parties</li>
              <li>We do NOT share student data with advertisers</li>
              <li>We do NOT use student data for targeted advertising</li>
              <li>We do NOT disclose information to unauthorized parties</li>
            </ul>

            <h2>7. Children's Privacy</h2>
            <p>
              eSlate is designed for use by students of all ages, including children under 18. We take special precautions to protect children's privacy:
            </p>
            <ul>
              <li>Student accounts for minors require parent/guardian consent through the Education Provider or direct parent registration</li>
              <li>Parents/guardians have full access to their child's data and can review, modify, or request deletion</li>
              <li>We collect only information necessary for educational purposes</li>
              <li>Student data is not used for marketing or advertising</li>
              <li>We implement age-appropriate privacy controls</li>
              <li>AI features (such as hints) can be controlled by parents through their dashboard settings</li>
            </ul>

            <h2>8. Data Security</h2>
            <p>
              We implement comprehensive security measures to protect personal information:
            </p>
            <ul>
              <li>Encryption of data in transit (TLS/SSL) and at rest</li>
              <li>Secure authentication with password hashing</li>
              <li>Role-based access controls limiting data access</li>
              <li>Regular security assessments and penetration testing</li>
              <li>Secure cloud infrastructure with redundancy</li>
              <li>Employee training on data protection</li>
              <li>Incident response procedures</li>
              <li>Regular backups with secure storage</li>
            </ul>
            <p>
              While we take all reasonable steps to protect your information, no method of electronic transmission or storage is 100% secure. We encourage users to use strong passwords and keep their credentials confidential.
            </p>

            <h2>9. Data Retention</h2>
            <ul>
              <li><strong>Active Accounts:</strong> Personal information is retained while accounts are active and services are being provided</li>
              <li><strong>Academic Records:</strong> Student academic records, assignments, and progress data may be retained for up to 7 years after the last activity for educational continuity and legal compliance</li>
              <li><strong>Inactive Accounts:</strong> Accounts inactive for more than 2 years may be archived or deleted after notice</li>
              <li><strong>Deleted Accounts:</strong> Upon account deletion request, we will remove personal information within 30 days, except where retention is required by law</li>
              <li><strong>Backup Data:</strong> Backup copies may persist for up to 90 days after deletion</li>
            </ul>

            <h2>10. Your Rights</h2>
            <p>Under Australian privacy law, you have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal information we hold</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
              <li><strong>Portability:</strong> Request your data in a commonly used format</li>
              <li><strong>Restriction:</strong> Request we limit processing of your information</li>
              <li><strong>Objection:</strong> Object to certain uses of your information</li>
              <li><strong>Complaint:</strong> Lodge a complaint with the Office of the Australian Information Commissioner (OAIC)</li>
            </ul>
            <p>
              To exercise these rights, contact us using the details in Section 14. We will respond to requests within 30 days.
            </p>

            <h2>11. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies for:
            </p>
            <ul>
              <li><strong>Essential Cookies:</strong> Required for platform functionality (authentication, session management)</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform (anonymized)</li>
            </ul>
            <p>
              You can control cookies through your browser settings. Disabling essential cookies may affect platform functionality.
            </p>

            <h2>12. Cross-Border Data Transfers</h2>
            <p>
              While we primarily store data within Australia, some service providers may process data in other jurisdictions. When transferring data overseas, we ensure:
            </p>
            <ul>
              <li>The recipient is subject to laws providing comparable privacy protection</li>
              <li>Appropriate contractual protections are in place</li>
              <li>You are informed of the countries where your data may be processed</li>
            </ul>

            <h2>13. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be communicated through:
            </p>
            <ul>
              <li>Email notification to registered users</li>
              <li>Prominent notice on our platform</li>
              <li>Updated "Last modified" date</li>
            </ul>
            <p>
              Continued use of eSlate after changes constitutes acceptance of the updated policy. We encourage you to review this policy periodically.
            </p>

            <h2>14. Contact Us</h2>
            <p>
              For privacy-related inquiries, requests, or complaints:
            </p>
            <ul>
              <li><strong>Email:</strong> support@eslate.com.au</li>
              <li><strong>Phone:</strong> Contact your Education Provider or use our contact form</li>
              <li><strong>Mail:</strong> Creative Arc Infotech Pty Ltd, Sydney, NSW, Australia</li>
            </ul>
            <p>
              If you are not satisfied with our response, you may lodge a complaint with the Office of the Australian Information Commissioner (OAIC) at <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer">www.oaic.gov.au</a>.
            </p>

            <h2>15. Education Provider Responsibilities</h2>
            <p>
              Education Providers using eSlate are responsible for:
            </p>
            <ul>
              <li>Obtaining necessary consents from students, parents, and staff before entering their data</li>
              <li>Ensuring accuracy of information entered into the platform</li>
              <li>Managing access permissions for their staff appropriately</li>
              <li>Complying with their own privacy obligations under Australian law</li>
              <li>Informing their users about data collection and use</li>
              <li>Responding to access and correction requests from their users</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
