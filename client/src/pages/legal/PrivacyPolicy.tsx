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
            <p className="text-sm text-muted-foreground">Last updated: December 2024 | Version 1.0</p>
          </CardHeader>
          <CardContent className="prose prose-lg dark:prose-invert max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Welcome to eSlate ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our educational platform.
            </p>
            <p>
              eSlate is designed for educational purposes, serving students, parents, tutors, and educational administrators. We take special care to protect the privacy of minors who use our platform.
            </p>

            <h2>2. Information We Collect</h2>
            
            <h3>2.1 Personal Information</h3>
            <p>We may collect the following types of personal information:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, password, and profile picture</li>
              <li><strong>Educational Information:</strong> Grade level, school name, class assignments, academic records</li>
              <li><strong>Contact Information:</strong> Phone numbers (for parents/guardians)</li>
              <li><strong>Usage Data:</strong> Assignment submissions, test results, progress tracking data</li>
            </ul>

            <h3>2.2 Automatically Collected Information</h3>
            <p>When you use eSlate, we automatically collect:</p>
            <ul>
              <li>Device information (browser type, operating system)</li>
              <li>IP address and general location data</li>
              <li>Usage patterns and interaction data</li>
              <li>Session information and cookies</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide and maintain our educational services</li>
              <li>Facilitate communication between students, parents, and tutors</li>
              <li>Track academic progress and generate reports</li>
              <li>Send important notifications about assignments and deadlines</li>
              <li>Improve our platform and develop new features</li>
              <li>Ensure the security and integrity of our services</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>4. Information Sharing and Disclosure</h2>
            <p>We may share your information with:</p>
            <ul>
              <li><strong>Educational Institutions:</strong> Tutoring companies and educational administrators you are enrolled with</li>
              <li><strong>Parents/Guardians:</strong> Parents can view their children's academic information</li>
              <li><strong>Service Providers:</strong> Third-party services that help us operate our platform</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
            <p>
              We do not sell, rent, or trade your personal information to third parties for marketing purposes.
            </p>

            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information, including:
            </p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication mechanisms</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and employee training</li>
            </ul>

            <h2>6. Children's Privacy</h2>
            <p>
              eSlate is designed for use by students of all ages with appropriate parental/guardian consent. We are committed to complying with applicable children's privacy laws, including COPPA (Children's Online Privacy Protection Act) in the United States.
            </p>
            <p>
              For users under 13, we require parental consent before collecting personal information. Parents have the right to review, modify, or delete their child's information.
            </p>

            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data (subject to legal requirements)</li>
              <li>Opt-out of certain data processing activities</li>
              <li>Export your data in a portable format</li>
            </ul>

            <h2>8. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide services. Academic records may be retained longer for educational and legal purposes. You may request deletion of your account at any time.
            </p>

            <h2>9. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to maintain your session, remember your preferences, and analyze usage patterns. You can control cookie settings through your browser, though some features may not work properly without cookies.
            </p>

            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of eSlate after changes constitutes acceptance of the updated policy.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <ul>
              <li>Email: privacy@eslate.edu</li>
              <li>Address: eSlate Education Platform</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
