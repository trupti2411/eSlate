import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function TermsOfService() {
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
            <CardTitle className="text-3xl" data-testid="terms-title">Terms of Service</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: December 2024 | Version 1.0</p>
          </CardHeader>
          <CardContent className="prose prose-lg dark:prose-invert max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using eSlate ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Platform. If you are using the Platform on behalf of an organization (such as a tutoring company), you represent that you have the authority to bind that organization to these Terms.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              eSlate is an educational platform designed to facilitate learning management, including:
            </p>
            <ul>
              <li>Assignment creation, distribution, and submission</li>
              <li>Test and exam management with automated grading</li>
              <li>Progress tracking and reporting</li>
              <li>Communication between students, parents, and tutors</li>
              <li>Worksheet creation and interactive learning tools</li>
            </ul>

            <h2>3. User Accounts</h2>
            
            <h3>3.1 Account Registration</h3>
            <p>
              To use eSlate, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate.
            </p>

            <h3>3.2 Account Security</h3>
            <p>
              You are responsible for safeguarding your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
            </p>

            <h3>3.3 Account Types</h3>
            <ul>
              <li><strong>Student Accounts:</strong> For learners enrolled in educational programs</li>
              <li><strong>Parent Accounts:</strong> For parents/guardians to monitor their children's progress</li>
              <li><strong>Tutor Accounts:</strong> For educators to manage classes and assignments</li>
              <li><strong>Administrator Accounts:</strong> For managing tutoring companies and platform settings</li>
            </ul>

            <h2>4. Acceptable Use</h2>
            <p>You agree NOT to:</p>
            <ul>
              <li>Use the Platform for any unlawful purpose</li>
              <li>Share your account credentials with others</li>
              <li>Submit false, misleading, or plagiarized content</li>
              <li>Harass, bully, or intimidate other users</li>
              <li>Attempt to gain unauthorized access to the Platform or other accounts</li>
              <li>Interfere with the proper functioning of the Platform</li>
              <li>Use automated systems to access the Platform without permission</li>
              <li>Upload malicious software or harmful content</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>

            <h2>5. Educational Content and Intellectual Property</h2>
            
            <h3>5.1 Platform Content</h3>
            <p>
              All content provided by eSlate, including but not limited to software, text, graphics, and logos, is owned by or licensed to us and is protected by intellectual property laws.
            </p>

            <h3>5.2 User-Generated Content</h3>
            <p>
              You retain ownership of content you create on the Platform (assignments, worksheets, etc.). By submitting content, you grant eSlate a non-exclusive license to use, store, and display such content as necessary to provide our services.
            </p>

            <h3>5.3 Student Work</h3>
            <p>
              Students retain ownership of their submitted assignments and work. Tutors and administrators may access and evaluate this work for educational purposes.
            </p>

            <h2>6. Privacy</h2>
            <p>
              Your use of eSlate is also governed by our Privacy Policy, which describes how we collect, use, and protect your personal information. By using the Platform, you consent to our data practices as described in the Privacy Policy.
            </p>

            <h2>7. Fees and Payment</h2>
            <p>
              Certain features of eSlate may require payment. Payment terms will be specified at the time of purchase. All fees are non-refundable unless otherwise stated. We reserve the right to modify pricing with reasonable notice.
            </p>

            <h2>8. Termination</h2>
            <p>
              We may suspend or terminate your account if you violate these Terms or for any other reason at our discretion. You may also request to close your account at any time. Upon termination, your right to use the Platform ceases immediately.
            </p>

            <h2>9. Disclaimer of Warranties</h2>
            <p>
              THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT THE PLATFORM WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE. EDUCATIONAL OUTCOMES DEPEND ON MANY FACTORS BEYOND OUR CONTROL.
            </p>

            <h2>10. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, ESLATE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS.
            </p>

            <h2>11. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless eSlate, its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Platform or violation of these Terms.
            </p>

            <h2>12. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. Material changes will be communicated through the Platform or via email. Your continued use of the Platform after changes constitutes acceptance of the modified Terms.
            </p>

            <h2>13. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles. Any disputes shall be resolved through binding arbitration or in courts of competent jurisdiction.
            </p>

            <h2>14. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
            </p>

            <h2>15. Contact Information</h2>
            <p>
              For questions about these Terms, please contact us at:
            </p>
            <ul>
              <li>Email: legal@eslate.edu</li>
              <li>Address: eSlate Education Platform</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
