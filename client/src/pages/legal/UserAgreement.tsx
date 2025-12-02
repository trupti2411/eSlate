import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function UserAgreement() {
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
            <CardTitle className="text-3xl" data-testid="agreement-title">User Agreement</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: December 2024 | Version 1.0</p>
          </CardHeader>
          <CardContent className="prose prose-lg dark:prose-invert max-w-none">
            <h2>eSlate Educational Platform User Agreement</h2>
            <p>
              This User Agreement ("Agreement") is a binding contract between you ("User," "you," or "your") and eSlate ("we," "us," or "our") governing your use of the eSlate educational platform.
            </p>

            <h2>1. Agreement to Terms</h2>
            <p>
              By clicking "I Accept" or by using the eSlate platform, you acknowledge that you have read, understood, and agree to be bound by this Agreement, our Terms of Service, and our Privacy Policy. If you are a parent or guardian agreeing on behalf of a minor, you accept these terms on their behalf.
            </p>

            <h2>2. User Responsibilities</h2>

            <h3>2.1 For All Users</h3>
            <ul>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Use the platform honestly and in good faith</li>
              <li>Respect the rights and privacy of other users</li>
              <li>Report any security vulnerabilities or misuse</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>

            <h3>2.2 For Students</h3>
            <ul>
              <li>Complete assignments honestly without plagiarism or cheating</li>
              <li>Submit work by assigned deadlines</li>
              <li>Communicate respectfully with tutors and peers</li>
              <li>Report any technical issues promptly</li>
              <li>Use learning resources responsibly</li>
            </ul>

            <h3>2.3 For Parents/Guardians</h3>
            <ul>
              <li>Monitor your child's use of the platform appropriately</li>
              <li>Ensure your child understands and follows the platform rules</li>
              <li>Provide accurate contact information</li>
              <li>Communicate concerns to tutors through proper channels</li>
              <li>Support your child's learning journey</li>
            </ul>

            <h3>2.4 For Tutors and Administrators</h3>
            <ul>
              <li>Create fair and appropriate educational content</li>
              <li>Grade and provide feedback in a timely manner</li>
              <li>Maintain professional conduct at all times</li>
              <li>Protect student privacy and confidential information</li>
              <li>Report any violations of platform policies</li>
            </ul>

            <h2>3. Academic Integrity</h2>
            <p>
              eSlate is committed to academic integrity. Users agree to:
            </p>
            <ul>
              <li>Not share answers or completed assignments with other students</li>
              <li>Not use unauthorized aids during tests or exams</li>
              <li>Properly cite sources when required</li>
              <li>Not impersonate other users</li>
              <li>Report suspected violations of academic integrity</li>
            </ul>
            <p>
              Violations of academic integrity may result in score adjustments, disciplinary action, or account termination.
            </p>

            <h2>4. Content Guidelines</h2>
            <p>All content shared on the platform must:</p>
            <ul>
              <li>Be appropriate for an educational environment</li>
              <li>Not contain offensive, discriminatory, or harmful material</li>
              <li>Not infringe on intellectual property rights</li>
              <li>Not contain personal information of others without consent</li>
              <li>Be relevant to educational purposes</li>
            </ul>

            <h2>5. Communication Standards</h2>
            <p>When using messaging and communication features:</p>
            <ul>
              <li>Be respectful and professional</li>
              <li>Keep messages relevant to educational matters</li>
              <li>Do not share inappropriate content</li>
              <li>Report any harassment or bullying immediately</li>
              <li>Parents may review their children's communications</li>
            </ul>

            <h2>6. Data and Privacy</h2>
            <p>
              By using eSlate, you consent to:
            </p>
            <ul>
              <li>Collection of educational data as described in our Privacy Policy</li>
              <li>Sharing of progress information with authorized parties (parents, tutors, administrators)</li>
              <li>Use of anonymized data for platform improvement</li>
              <li>Storage of submitted work and communications</li>
            </ul>

            <h2>7. Parental Consent for Minors</h2>
            <p>
              For users under 18 years of age:
            </p>
            <ul>
              <li>A parent or guardian must accept this Agreement on the minor's behalf</li>
              <li>Parents have the right to access their child's account and data</li>
              <li>Parents may request modification or deletion of their child's data</li>
              <li>The parent or guardian is responsible for monitoring appropriate use</li>
            </ul>

            <h2>8. Consequences of Violation</h2>
            <p>
              Violations of this Agreement may result in:
            </p>
            <ul>
              <li>Warning and counseling</li>
              <li>Temporary suspension of account</li>
              <li>Permanent termination of account</li>
              <li>Notification to parents, schools, or relevant authorities</li>
              <li>Legal action in serious cases</li>
            </ul>

            <h2>9. Modifications</h2>
            <p>
              We may update this Agreement from time to time. Users will be notified of material changes and may be required to re-accept updated terms. Continued use of the platform after notification constitutes acceptance.
            </p>

            <h2>10. Acknowledgment</h2>
            <p>
              By accepting this Agreement, you confirm that:
            </p>
            <ul>
              <li>You have read and understand all terms</li>
              <li>You have the legal capacity to enter into this Agreement</li>
              <li>If accepting for a minor, you have parental authority to do so</li>
              <li>You agree to comply with all stated terms and conditions</li>
            </ul>

            <h2>11. Contact</h2>
            <p>
              For questions about this Agreement, contact us at:
            </p>
            <ul>
              <li>Email: support@eslate.edu</li>
              <li>Address: eSlate Education Platform</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
