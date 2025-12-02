import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Shield, FileText, Scale, Loader2, ExternalLink } from 'lucide-react';
import { Link } from 'wouter';

interface TermsAcceptanceModalProps {
  isOpen: boolean;
  onAccepted: () => void;
  userRole?: string;
}

const TERMS_VERSION = "1.0";

export function TermsAcceptanceModal({ isOpen, onAccepted, userRole }: TermsAcceptanceModalProps) {
  const { toast } = useToast();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedAgreement, setAcceptedAgreement] = useState(false);

  const acceptTermsMutation = useMutation({
    mutationFn: () => apiRequest('/api/users/accept-terms', 'POST', { version: TERMS_VERSION }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Terms Accepted",
        description: "Thank you for accepting our terms and policies.",
      });
      onAccepted();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save your acceptance. Please try again.",
        variant: "destructive",
      });
    },
  });

  const allAccepted = acceptedTerms && acceptedPrivacy && acceptedAgreement;

  const handleAccept = () => {
    if (allAccepted) {
      acceptTermsMutation.mutate();
    }
  };

  const getRoleSpecificMessage = () => {
    switch (userRole) {
      case 'student':
        return "As a student, you'll be submitting assignments, taking tests, and communicating with tutors through our platform.";
      case 'parent':
        return "As a parent, you'll have access to monitor your child's academic progress, assignments, and communications.";
      case 'company_admin':
        return "As an administrator, you'll be managing tutors, students, classes, and educational content for your organization.";
      case 'tutor':
        return "As a tutor, you'll be creating assignments, grading student work, and communicating with students and parents.";
      default:
        return "Please review and accept our policies to continue using eSlate.";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2" data-testid="terms-modal-title">
            <Shield className="h-6 w-6" />
            Welcome to eSlate
          </DialogTitle>
          <DialogDescription className="text-base">
            Before you continue, please review and accept our terms and policies.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm">{getRoleSpecificMessage()}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                  data-testid="checkbox-terms"
                />
                <div className="flex-1">
                  <label htmlFor="terms" className="flex items-center gap-2 font-medium cursor-pointer">
                    <Scale className="h-4 w-4" />
                    Terms of Service
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    I have read and agree to the Terms of Service governing my use of the eSlate platform.
                  </p>
                  <Link href="/legal/terms" target="_blank">
                    <Button variant="link" size="sm" className="px-0 h-auto text-primary" data-testid="link-view-terms">
                      Read Terms of Service <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <Checkbox
                  id="privacy"
                  checked={acceptedPrivacy}
                  onCheckedChange={(checked) => setAcceptedPrivacy(checked === true)}
                  data-testid="checkbox-privacy"
                />
                <div className="flex-1">
                  <label htmlFor="privacy" className="flex items-center gap-2 font-medium cursor-pointer">
                    <Shield className="h-4 w-4" />
                    Privacy Policy
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    I have read and understand the Privacy Policy describing how my data is collected, used, and protected.
                  </p>
                  <Link href="/legal/privacy" target="_blank">
                    <Button variant="link" size="sm" className="px-0 h-auto text-primary" data-testid="link-view-privacy">
                      Read Privacy Policy <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <Checkbox
                  id="agreement"
                  checked={acceptedAgreement}
                  onCheckedChange={(checked) => setAcceptedAgreement(checked === true)}
                  data-testid="checkbox-agreement"
                />
                <div className="flex-1">
                  <label htmlFor="agreement" className="flex items-center gap-2 font-medium cursor-pointer">
                    <FileText className="h-4 w-4" />
                    User Agreement
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    I agree to abide by the User Agreement, including the code of conduct and academic integrity policies.
                  </p>
                  <Link href="/legal/agreement" target="_blank">
                    <Button variant="link" size="sm" className="px-0 h-auto text-primary" data-testid="link-view-agreement">
                      Read User Agreement <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {userRole === 'parent' && (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Parent/Guardian Notice:</strong> By accepting these terms, you also consent to the collection and use of your child's educational data as described in our Privacy Policy.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator />

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <p className="text-xs text-muted-foreground flex-1">
            Version {TERMS_VERSION} • By clicking "Accept & Continue," you confirm that you have read and agree to all policies.
          </p>
          <Button
            onClick={handleAccept}
            disabled={!allAccepted || acceptTermsMutation.isPending}
            className="min-w-[150px]"
            data-testid="button-accept-terms"
          >
            {acceptTermsMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Accept & Continue"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
