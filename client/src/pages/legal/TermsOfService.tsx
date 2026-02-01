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
            <p className="text-sm text-muted-foreground">Last updated: February 2026 | Version 2.0</p>
          </CardHeader>
          <CardContent className="prose prose-lg dark:prose-invert max-w-none">
            <h2>1. Introduction and Acceptance</h2>
            <p>
              These Terms of Service ("Terms") constitute a legally binding agreement between you and eSlate Pty Ltd ABN [ABN Number] ("eSlate," "we," "our," or "us") governing your access to and use of the eSlate educational platform, including all websites, applications, and services (collectively, "the Platform").
            </p>
            <p>
              By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree, you must not use the Platform. If you are using the Platform on behalf of an organization (such as an education provider), you represent and warrant that you have authority to bind that organization to these Terms.
            </p>

            <h2>2. Definitions</h2>
            <ul>
              <li><strong>"Education Provider"</strong> means any tutoring centre, learning centre, coaching college, educational institution, or similar organization that subscribes to eSlate's services</li>
              <li><strong>"Centre Manager"</strong> means an administrator designated by an Education Provider to manage their account</li>
              <li><strong>"Tutor"</strong> means an educator, teacher, or instructor using the Platform</li>
              <li><strong>"Student"</strong> means a learner using the Platform</li>
              <li><strong>"Parent"</strong> means a parent, legal guardian, or authorized carer of a Student</li>
              <li><strong>"User"</strong> means any person accessing the Platform, including Education Providers, Centre Managers, Tutors, Students, Parents, and general visitors</li>
              <li><strong>"Content"</strong> means all text, images, documents, assignments, worksheets, and other materials on the Platform</li>
            </ul>

            <h2>3. Description of Services</h2>
            <p>
              eSlate provides a comprehensive educational management platform designed to facilitate:
            </p>
            <ul>
              <li>Assignment and worksheet creation, distribution, and management</li>
              <li>Student assignment submission with PDF annotation and interactive worksheets</li>
              <li>Grading, feedback, and progress tracking</li>
              <li>Real-time messaging between stakeholders</li>
              <li>Calendar and scheduling management</li>
              <li>Attendance tracking and reporting</li>
              <li>Parent visibility into student progress</li>
              <li>AI-powered learning assistance features (with parental controls)</li>
              <li>Class and enrolment management for Education Providers</li>
            </ul>
            <p>
              The Platform is optimized for e-ink devices and high-contrast displays to enhance accessibility.
            </p>

            <h2>4. Eligibility and Registration</h2>
            
            <h3>4.1 Eligibility</h3>
            <ul>
              <li>Education Providers must be legitimate educational businesses operating lawfully in their jurisdiction</li>
              <li>Tutors must be at least 18 years of age and hold appropriate qualifications and clearances</li>
              <li>Parents must be at least 18 years of age and have legal authority over the Students they register</li>
              <li>Students of any age may use the Platform with appropriate parental/guardian consent</li>
            </ul>

            <h3>4.2 Account Registration</h3>
            <p>
              To use the Platform, you must create an account and provide accurate, complete, and current information. You agree to:
            </p>
            <ul>
              <li>Provide truthful registration information</li>
              <li>Maintain and update your information as needed</li>
              <li>Keep your password confidential and secure</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>

            <h3>4.3 Account Types and Hierarchy</h3>
            <ul>
              <li><strong>System Administrator:</strong> eSlate staff managing the overall platform</li>
              <li><strong>Education Provider Account:</strong> Organizational account for tutoring centres</li>
              <li><strong>Centre Manager:</strong> Administrator managing an Education Provider's account</li>
              <li><strong>Tutor Account:</strong> For educators creating and grading assignments</li>
              <li><strong>Parent Account:</strong> For parents/guardians monitoring student progress</li>
              <li><strong>Student Account:</strong> For learners completing assignments</li>
            </ul>

            <h2>5. Education Provider Terms</h2>
            
            <h3>5.1 Subscription and Access</h3>
            <p>Education Providers agree to:</p>
            <ul>
              <li>Subscribe to an appropriate service plan and pay all applicable fees</li>
              <li>Designate responsible Centre Managers to administer their account</li>
              <li>Ensure all staff using the Platform are properly trained</li>
              <li>Maintain appropriate Working with Children Checks or equivalent clearances for all staff as required by law</li>
              <li>Comply with all applicable education regulations and laws</li>
            </ul>

            <h3>5.2 Data Responsibilities</h3>
            <p>Education Providers are responsible for:</p>
            <ul>
              <li>Obtaining necessary consents from parents before enrolling Students</li>
              <li>Ensuring accuracy of all data entered into the Platform</li>
              <li>Managing staff access permissions appropriately</li>
              <li>Complying with privacy laws regarding student data</li>
              <li>Responding to data access requests from their Users</li>
            </ul>

            <h3>5.3 Relationship with eSlate</h3>
            <p>
              Education Providers are independent businesses and not employees, agents, or partners of eSlate. Nothing in these Terms creates an employment, agency, franchise, joint venture, or partnership relationship.
            </p>

            <h2>6. Tutor Terms</h2>
            <p>Tutors using the Platform agree to:</p>
            <ul>
              <li>Use the Platform solely for legitimate educational purposes</li>
              <li>Create appropriate, accurate, and fair educational content</li>
              <li>Grade and provide feedback in a timely and constructive manner</li>
              <li>Maintain professional conduct in all communications</li>
              <li>Protect student privacy and confidentiality</li>
              <li>Not share login credentials or allow unauthorized access</li>
              <li>Report any misconduct, policy violations, or safeguarding concerns</li>
              <li>Comply with the policies of their Education Provider</li>
            </ul>

            <h2>7. Parent and Guardian Terms</h2>
            <p>Parents and guardians agree to:</p>
            <ul>
              <li>Provide accurate information about themselves and their children</li>
              <li>Consent to the collection and use of their child's data as described in our Privacy Policy</li>
              <li>Monitor their child's use of the Platform appropriately</li>
              <li>Ensure their child understands and follows Platform rules</li>
              <li>Communicate concerns through appropriate channels</li>
              <li>Pay any applicable fees as agreed with the Education Provider</li>
              <li>Configure AI feature controls according to their preferences</li>
            </ul>
            <p>
              Parents have the right to access their child's academic records, progress reports, and communications through the Platform.
            </p>

            <h2>8. Student Terms</h2>
            <p>Students using the Platform agree to:</p>
            <ul>
              <li>Use the Platform for genuine educational purposes</li>
              <li>Complete assignments honestly and without cheating or plagiarism</li>
              <li>Submit work by assigned deadlines</li>
              <li>Communicate respectfully with tutors and peers</li>
              <li>Not share account credentials</li>
              <li>Report technical issues or concerns to tutors or parents</li>
              <li>Follow academic integrity guidelines</li>
            </ul>

            <h2>9. Acceptable Use Policy</h2>
            <p>All Users agree NOT to:</p>
            <ul>
              <li>Use the Platform for any unlawful purpose or in violation of any laws</li>
              <li>Submit false, misleading, or fraudulent information</li>
              <li>Plagiarize, cheat, or engage in academic dishonesty</li>
              <li>Harass, bully, intimidate, or threaten other Users</li>
              <li>Upload offensive, discriminatory, defamatory, or inappropriate content</li>
              <li>Attempt to gain unauthorized access to accounts or systems</li>
              <li>Interfere with the Platform's operation or security</li>
              <li>Use automated tools, bots, or scrapers without permission</li>
              <li>Upload malware, viruses, or harmful code</li>
              <li>Infringe on intellectual property rights</li>
              <li>Share other Users' personal information without consent</li>
              <li>Use the Platform for commercial purposes unrelated to education</li>
              <li>Circumvent parental controls or access restrictions</li>
            </ul>

            <h2>10. Intellectual Property</h2>
            
            <h3>10.1 Platform Ownership</h3>
            <p>
              eSlate owns all rights to the Platform, including software, design, logos, trademarks, and documentation. Users may not copy, modify, distribute, or create derivative works without permission.
            </p>

            <h3>10.2 User Content</h3>
            <ul>
              <li><strong>Education Providers and Tutors:</strong> Retain ownership of educational content they create (assignments, worksheets, etc.). By uploading content, you grant eSlate a non-exclusive, worldwide license to use, store, display, and distribute the content as necessary to provide our services.</li>
              <li><strong>Students:</strong> Retain ownership of their submitted work. Tutors, administrators, and parents may access this work for educational purposes.</li>
            </ul>

            <h3>10.3 Feedback</h3>
            <p>
              If you provide feedback or suggestions about the Platform, you grant eSlate the right to use this feedback without compensation or attribution.
            </p>

            <h2>11. Fees and Payment</h2>
            
            <h3>11.1 Subscription Fees</h3>
            <p>
              Education Providers pay subscription fees according to their selected plan. Fees are billed in advance on a monthly or annual basis and are non-refundable except as required by law or as stated in your subscription agreement.
            </p>

            <h3>11.2 Payment Terms</h3>
            <ul>
              <li>Fees are quoted and payable in Australian Dollars (AUD) unless otherwise agreed</li>
              <li>All prices are exclusive of GST, which will be added where applicable</li>
              <li>Payment is due according to the terms of your subscription</li>
              <li>Overdue payments may result in suspension of services</li>
            </ul>

            <h3>11.3 Price Changes</h3>
            <p>
              We may modify pricing with at least 30 days' notice. Continued use after price changes constitutes acceptance.
            </p>

            <h2>12. Term and Termination</h2>
            
            <h3>12.1 Term</h3>
            <p>
              These Terms remain in effect while you use the Platform. Subscriptions continue according to their billing cycle until terminated.
            </p>

            <h3>12.2 Termination by You</h3>
            <ul>
              <li>Education Providers may cancel subscriptions with 30 days' notice</li>
              <li>Individual Users may request account deletion at any time</li>
              <li>Upon termination, access to the Platform ceases</li>
            </ul>

            <h3>12.3 Termination by eSlate</h3>
            <p>We may suspend or terminate accounts:</p>
            <ul>
              <li>For violation of these Terms or acceptable use policies</li>
              <li>For non-payment of fees</li>
              <li>For illegal activity or misconduct</li>
              <li>To protect other Users or the Platform</li>
              <li>For any other reason with reasonable notice</li>
            </ul>

            <h3>12.4 Effect of Termination</h3>
            <ul>
              <li>All rights granted to you under these Terms terminate</li>
              <li>You must stop using the Platform immediately</li>
              <li>We may delete your data after a reasonable period (see Privacy Policy)</li>
              <li>Provisions that should survive termination will remain in effect</li>
            </ul>

            <h2>13. Disclaimer of Warranties</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <ul>
              <li>THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED</li>
              <li>WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE</li>
              <li>WE DO NOT GUARANTEE SPECIFIC EDUCATIONAL OUTCOMES</li>
              <li>WE ARE NOT RESPONSIBLE FOR THE ACCURACY OF USER-GENERATED CONTENT</li>
              <li>WE DO NOT ENDORSE OR VERIFY THE QUALIFICATIONS OF EDUCATION PROVIDERS OR TUTORS</li>
            </ul>
            <p>
              Australian Consumer Law provides certain guarantees that cannot be excluded. Nothing in these Terms limits those statutory rights.
            </p>

            <h2>14. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <ul>
              <li>eSlate's total liability for any claim arising from these Terms or the Platform shall not exceed the fees paid by you in the 12 months preceding the claim</li>
              <li>We are not liable for any indirect, incidental, special, consequential, or punitive damages</li>
              <li>We are not liable for loss of data, profits, revenue, or business opportunities</li>
              <li>We are not liable for actions of Users, Education Providers, or Tutors</li>
              <li>We are not liable for third-party services or content</li>
            </ul>

            <h2>15. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless eSlate, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, costs, and expenses (including legal fees) arising from:
            </p>
            <ul>
              <li>Your use of the Platform</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Content you upload or create</li>
              <li>Your negligent or wrongful conduct</li>
            </ul>

            <h2>16. Privacy</h2>
            <p>
              Your use of the Platform is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Platform, you consent to our data practices as described in the Privacy Policy.
            </p>

            <h2>17. Modifications to Terms</h2>
            <p>
              We may modify these Terms at any time. Material changes will be communicated via email or prominent notice on the Platform at least 30 days before taking effect. Your continued use after changes constitutes acceptance.
            </p>

            <h2>18. Governing Law and Disputes</h2>
            <p>
              These Terms are governed by the laws of New South Wales, Australia. Any disputes shall be resolved as follows:
            </p>
            <ul>
              <li>First, by good faith negotiation between the parties</li>
              <li>If unresolved, by mediation in Sydney, Australia</li>
              <li>If still unresolved, by the courts of New South Wales, Australia</li>
            </ul>
            <p>
              Nothing in these Terms limits your rights under Australian Consumer Law.
            </p>

            <h2>19. General Provisions</h2>
            <ul>
              <li><strong>Entire Agreement:</strong> These Terms, together with the Privacy Policy and any subscription agreement, constitute the entire agreement between you and eSlate</li>
              <li><strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions continue in effect</li>
              <li><strong>No Waiver:</strong> Failure to enforce any right does not waive that right</li>
              <li><strong>Assignment:</strong> You may not assign your rights without our consent. We may assign our rights freely</li>
              <li><strong>Force Majeure:</strong> We are not liable for failures due to circumstances beyond our reasonable control</li>
            </ul>

            <h2>20. Contact Information</h2>
            <p>
              For questions about these Terms, please contact:
            </p>
            <ul>
              <li><strong>Email:</strong> legal@eslate.com.au</li>
              <li><strong>General Inquiries:</strong> nirav@eslate.com.au</li>
              <li><strong>Mail:</strong> eSlate Pty Ltd, Sydney, NSW, Australia</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
