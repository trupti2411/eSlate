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
            <p className="text-sm text-muted-foreground">Last updated: February 2026 | Version 2.0</p>
          </CardHeader>
          <CardContent className="prose prose-lg dark:prose-invert max-w-none">
            <h2>eSlate Educational Platform User Agreement</h2>
            <p>
              This User Agreement ("Agreement") is a binding contract between you ("User," "you," or "your") and Creative Arc Infotech Pty Ltd ABN [ABN Number] ("Creative Arc," "we," "us," or "our") governing your use of the eSlate educational platform. eSlate is a product and service provided by Creative Arc Infotech Pty Ltd. This Agreement supplements our Terms of Service and Privacy Policy.
            </p>
            <p>
              By clicking "I Accept," creating an account, or using the eSlate platform, you acknowledge that you have read, understood, and agree to be bound by this Agreement. If you are accepting on behalf of a minor, you confirm you have legal authority to do so.
            </p>

            <h2>1. Purpose of This Agreement</h2>
            <p>
              eSlate is a comprehensive learning management system serving education providers, tutors, students, parents, and the general public. This Agreement establishes the responsibilities and expectations for all users to ensure a safe, productive, and respectful educational environment.
            </p>

            <h2>2. User Categories and Responsibilities</h2>

            <h3>2.1 Education Providers (Tutoring Centres, Learning Centres)</h3>
            <p>Education Providers subscribing to eSlate agree to:</p>
            <ul>
              <li>Operate a legitimate educational business in compliance with all applicable laws and regulations</li>
              <li>Maintain appropriate business registrations, licenses, and insurance</li>
              <li>Ensure all staff have current Working with Children Checks or equivalent clearances as required by Australian law</li>
              <li>Implement appropriate safeguarding policies and procedures</li>
              <li>Obtain informed consent from parents before enrolling students on the platform</li>
              <li>Provide accurate information about their services, qualifications, and staff</li>
              <li>Designate responsible Centre Managers to administer their account</li>
              <li>Train staff on proper use of the platform and privacy obligations</li>
              <li>Respond promptly to student, parent, and platform communications</li>
              <li>Pay all subscription fees in accordance with their agreement</li>
              <li>Report any safeguarding concerns, data breaches, or security incidents immediately</li>
              <li>Maintain records as required by educational regulations</li>
              <li>Not use the platform for purposes other than legitimate educational services</li>
            </ul>

            <h3>2.2 Centre Managers (Administrators)</h3>
            <p>Centre Managers appointed by Education Providers agree to:</p>
            <ul>
              <li>Manage the Education Provider's account responsibly and securely</li>
              <li>Grant and revoke access permissions appropriately</li>
              <li>Ensure data accuracy for all enrolled students and staff</li>
              <li>Monitor platform usage for compliance with policies</li>
              <li>Address issues raised by tutors, students, or parents promptly</li>
              <li>Configure platform settings appropriately for their organization</li>
              <li>Maintain confidentiality of student and family information</li>
              <li>Escalate serious concerns to appropriate authorities when required</li>
              <li>Ensure staff compliance with platform policies</li>
            </ul>

            <h3>2.3 Tutors (Educators, Teachers, Instructors)</h3>
            <p>Tutors using the platform agree to:</p>
            <ul>
              <li>Provide accurate professional information including qualifications</li>
              <li>Maintain current Working with Children Checks or equivalent as required</li>
              <li>Create educationally appropriate and accurate content</li>
              <li>Set clear, reasonable expectations for assignments and deadlines</li>
              <li>Provide timely, constructive, and fair feedback on student work</li>
              <li>Grade work objectively and consistently</li>
              <li>Communicate professionally and respectfully at all times</li>
              <li>Protect student privacy and maintain confidentiality</li>
              <li>Not share login credentials or allow unauthorized access</li>
              <li>Report any student welfare concerns to appropriate parties</li>
              <li>Report suspected academic dishonesty appropriately</li>
              <li>Attend scheduled classes and fulfill teaching commitments</li>
              <li>Maintain accurate attendance records</li>
              <li>Use AI assistance features (grading, question generation) responsibly</li>
              <li>Not engage in any form of discrimination, harassment, or inappropriate conduct</li>
            </ul>

            <h3>2.4 Parents and Guardians</h3>
            <p>Parents and guardians using the platform agree to:</p>
            <ul>
              <li>Provide accurate information about themselves and their children</li>
              <li>Have legal authority over the students they register or manage</li>
              <li>Consent to the collection and use of their child's educational data</li>
              <li>Monitor their child's platform usage appropriately</li>
              <li>Ensure their child understands and follows platform rules</li>
              <li>Review their child's assignments, progress, and communications regularly</li>
              <li>Communicate concerns to tutors or administrators through proper channels</li>
              <li>Configure AI feature controls (hints, assistance) according to their preferences</li>
              <li>Pay any applicable fees as agreed with the Education Provider</li>
              <li>Keep contact information current</li>
              <li>Support their child's learning and encourage academic integrity</li>
              <li>Report any platform issues or concerns promptly</li>
              <li>Not share account credentials or allow unauthorized access</li>
              <li>Not interfere with other students' learning or platform use</li>
            </ul>

            <h3>2.5 Students</h3>
            <p>Students using the platform agree to:</p>
            <ul>
              <li>Use the platform for genuine educational purposes only</li>
              <li>Complete assignments honestly and independently (unless collaboration is authorized)</li>
              <li>Not plagiarize, copy, or submit work that is not their own</li>
              <li>Not cheat on tests, exams, or assignments</li>
              <li>Not share answers or help others cheat</li>
              <li>Submit work by assigned deadlines or communicate with tutors if extensions are needed</li>
              <li>Communicate respectfully with tutors, staff, and peers</li>
              <li>Not share account passwords or allow others to use their account</li>
              <li>Report technical problems to tutors or parents</li>
              <li>Use AI hint features appropriately and not as a substitute for learning</li>
              <li>Attend scheduled classes and participate constructively</li>
              <li>Respect the learning environment and other students</li>
              <li>Not upload, share, or create inappropriate content</li>
              <li>Not bully, harass, or intimidate others</li>
              <li>Follow instructions from tutors and administrators</li>
            </ul>

            <h3>2.6 General Public (Website Visitors)</h3>
            <p>Visitors to our public website agree to:</p>
            <ul>
              <li>Use the contact form and public features appropriately</li>
              <li>Provide accurate information in inquiries</li>
              <li>Not attempt to access restricted areas of the platform</li>
              <li>Not use automated tools to scrape or collect data</li>
              <li>Respect intellectual property rights</li>
            </ul>

            <h2>3. Academic Integrity</h2>
            <p>
              eSlate is committed to maintaining the highest standards of academic integrity. All users acknowledge and agree:
            </p>
            
            <h3>3.1 Prohibited Conduct</h3>
            <ul>
              <li>Plagiarism: Submitting work that is not your own or failing to properly cite sources</li>
              <li>Cheating: Using unauthorized materials, resources, or assistance during assessments</li>
              <li>Collusion: Unauthorized collaboration on individual assignments</li>
              <li>Contract cheating: Having someone else complete work on your behalf</li>
              <li>Fabrication: Falsifying data, results, or information</li>
              <li>Impersonation: Having someone else take an assessment or logging into another's account</li>
              <li>Distribution: Sharing assessment answers or materials inappropriately</li>
            </ul>

            <h3>3.2 Consequences</h3>
            <p>Violations of academic integrity may result in:</p>
            <ul>
              <li>Warning and counseling</li>
              <li>Score of zero on the affected assessment</li>
              <li>Requirement to redo the assessment</li>
              <li>Notification to parents/guardians</li>
              <li>Temporary suspension of account</li>
              <li>Permanent termination of account</li>
              <li>Reporting to the Education Provider</li>
              <li>In serious cases, legal action</li>
            </ul>

            <h3>3.3 AI Assistance</h3>
            <p>
              eSlate offers AI-powered features including progressive hints and learning assistance. These features are designed to support learning, not replace it. Students must:
            </p>
            <ul>
              <li>Use AI hints as learning aids, not as answer generators</li>
              <li>Not rely excessively on AI assistance</li>
              <li>Understand that parents may disable or limit AI features</li>
              <li>Complete final answers independently</li>
            </ul>

            <h2>4. Content Guidelines</h2>
            <p>All content uploaded, created, or shared on eSlate must:</p>
            <ul>
              <li>Be appropriate for an educational environment and all age groups</li>
              <li>Not contain profanity, obscenity, or offensive language</li>
              <li>Not contain discriminatory, racist, sexist, or hateful material</li>
              <li>Not contain violent, threatening, or harmful content</li>
              <li>Not contain sexually explicit or suggestive material</li>
              <li>Not infringe on intellectual property rights (copyright, trademarks)</li>
              <li>Not contain personal information of others without consent</li>
              <li>Not contain malware, viruses, or harmful code</li>
              <li>Not promote illegal activities</li>
              <li>Not constitute spam or unsolicited advertising</li>
            </ul>
            <p>
              eSlate reserves the right to remove any content that violates these guidelines without notice.
            </p>

            <h2>5. Communication Standards</h2>
            <p>All platform communications (messages, comments, feedback) must:</p>
            <ul>
              <li>Be respectful, professional, and constructive</li>
              <li>Be relevant to educational matters</li>
              <li>Not contain harassment, bullying, or intimidation</li>
              <li>Not contain personal attacks or defamatory statements</li>
              <li>Not contain inappropriate jokes or offensive humor</li>
              <li>Respect cultural and religious differences</li>
            </ul>
            <p>
              Parents have the right to review their children's communications. All communications may be monitored for safety and compliance purposes.
            </p>

            <h2>6. Data Protection and Privacy</h2>
            <p>By using eSlate, you acknowledge and agree:</p>
            <ul>
              <li>Your data will be collected and used as described in our Privacy Policy</li>
              <li>Student progress and records will be shared with authorized parties (parents, tutors, administrators)</li>
              <li>Anonymized data may be used for platform improvement and analytics</li>
              <li>You will protect the privacy of other users</li>
              <li>You will not share, sell, or disclose other users' personal information</li>
              <li>You will report any data breaches or privacy concerns immediately</li>
            </ul>

            <h2>7. Child Safety and Safeguarding</h2>
            <p>
              eSlate is committed to child safety. All users agree to:
            </p>
            <ul>
              <li>Prioritize the safety and wellbeing of children at all times</li>
              <li>Report any concerns about child safety immediately to Education Providers and appropriate authorities</li>
              <li>Not engage in any form of grooming, exploitation, or abuse</li>
              <li>Maintain appropriate boundaries in all interactions</li>
              <li>Comply with mandatory reporting obligations where applicable</li>
            </ul>
            <p>
              Education Providers and Tutors have additional obligations to implement safeguarding policies and maintain appropriate clearances.
            </p>

            <h2>8. Security Obligations</h2>
            <p>All users agree to:</p>
            <ul>
              <li>Keep login credentials confidential and secure</li>
              <li>Use strong passwords and enable additional security measures when available</li>
              <li>Not share accounts or allow unauthorized access</li>
              <li>Log out when using shared or public devices</li>
              <li>Report any security incidents, suspicious activity, or unauthorized access immediately</li>
              <li>Not attempt to bypass security measures or access restricted areas</li>
              <li>Not interfere with the platform's operation or other users' access</li>
            </ul>

            <h2>9. Intellectual Property</h2>
            <ul>
              <li>eSlate owns all platform software, design, and branding</li>
              <li>Education Providers and Tutors retain ownership of educational content they create</li>
              <li>Students retain ownership of their original work</li>
              <li>By uploading content, you grant eSlate a license to use it for service provision</li>
              <li>You must not infringe on third-party intellectual property rights</li>
              <li>Unauthorized copying, distribution, or use of platform content is prohibited</li>
            </ul>

            <h2>10. Consequences of Violation</h2>
            <p>
              Violations of this Agreement may result in:
            </p>
            <ul>
              <li>Warning and documentation of the incident</li>
              <li>Temporary restriction of features or access</li>
              <li>Temporary suspension of account</li>
              <li>Permanent termination of account</li>
              <li>Notification to parents, guardians, or Education Providers</li>
              <li>Reporting to relevant authorities (education, child protection, law enforcement)</li>
              <li>Civil or criminal legal action in serious cases</li>
            </ul>
            <p>
              The severity of consequences will depend on the nature and severity of the violation, whether it is a repeat offense, and the impact on other users.
            </p>

            <h2>11. Dispute Resolution</h2>
            <p>
              If you have a dispute or concern:
            </p>
            <ul>
              <li>First, attempt to resolve it directly with the relevant party (tutor, administrator)</li>
              <li>If unresolved, contact your Education Provider's management</li>
              <li>If still unresolved, contact eSlate support</li>
              <li>Formal disputes will be handled according to our Terms of Service</li>
            </ul>

            <h2>12. Modifications</h2>
            <p>
              We may update this Agreement from time to time. Material changes will be communicated through the platform or via email. Continued use after changes constitutes acceptance. You may be required to re-accept updated terms.
            </p>

            <h2>13. Acknowledgment and Acceptance</h2>
            <p>
              By accepting this Agreement, you confirm that:
            </p>
            <ul>
              <li>You have read and understood all terms of this Agreement</li>
              <li>You have read and understood our Terms of Service and Privacy Policy</li>
              <li>You have the legal capacity to enter into this Agreement</li>
              <li>If accepting for a minor, you have parental or guardianship authority to do so</li>
              <li>You agree to comply with all stated terms and conditions</li>
              <li>You understand the consequences of violating this Agreement</li>
            </ul>

            <h2>14. Contact Information</h2>
            <p>
              For questions about this Agreement:
            </p>
            <ul>
              <li><strong>Email:</strong> support@eslate.com.au</li>
              <li><strong>Mail:</strong> Creative Arc Infotech Pty Ltd, Sydney, NSW, Australia</li>
            </ul>
            <p>
              For urgent safeguarding or child safety concerns, please contact the relevant authorities in addition to notifying us.
            </p>

            <h2>15. Governing Law</h2>
            <p>
              This Agreement is governed by the laws of New South Wales, Australia. Any disputes shall be subject to the exclusive jurisdiction of the courts of New South Wales, Australia.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
