import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, ShieldCheck, CalendarDays, ArrowRight, Loader2, GraduationCap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

// Format a YYYY-MM-DD (or ISO) date string as "02 Feb 2026". Parsed by-parts so we
// don't shift days across timezones — pack dates are calendar dates, not instants.
function formatDate(s: string | null | undefined): string {
  if (!s) return "";
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(s);
  const [, y, mo, d] = m;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d} ${months[parseInt(mo, 10) - 1]} ${y}`;
}

// WWCC expiry must be ≥30 days in the future (matched server-side per v3 §8.1)
const wwccSchema = z.object({
  wwccNumber: z.string().min(3, "WWCC number is required"),
  wwccExpiry: z.string().min(1, "Expiry is required").refine((d) => {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 30);
    return new Date(d) >= minDate;
  }, "Expiry must be at least 30 days from today"),
  wwccState: z.string().default("NSW"),
});
type WwccData = z.infer<typeof wwccSchema>;

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  // Multi-tutor business owners (role=company_admin on the wire) aren't tutors themselves —
  // skip the WWCC step. Solo tutors (role=tutor) start at step 1.
  const isCompanyAdmin = (user as any)?.role === "company_admin";
  const [step, setStep] = useState<Step>(isCompanyAdmin ? 2 : 1);

  // If user data loads after the page mounts, advance past WWCC for company owners.
  useEffect(() => {
    if (isCompanyAdmin && step === 1) setStep(2);
  }, [isCompanyAdmin, step]);

  const wwccForm = useForm<WwccData>({
    resolver: zodResolver(wwccSchema),
    defaultValues: { wwccNumber: "", wwccExpiry: "", wwccState: "NSW" },
  });

  const wwccMutation = useMutation({
    mutationFn: async (data: WwccData) =>
      apiRequest("/api/me/wwcc", "POST", {
        wwcc_number: data.wwccNumber,
        wwcc_expiry: data.wwccExpiry,
        wwcc_state: data.wwccState,
      }),
    onSuccess: () => {
      toast({ title: "WWCC captured", description: "Compliance set. Next: your academic calendar." });
      setStep(2);
    },
    onError: (err: any) => {
      toast({ title: "Couldn't save WWCC", description: err.message ?? "Try again.", variant: "destructive" });
    },
  });

  const packQuery = useQuery<any>({
    queryKey: ["/api/state-packs/NSW/2026"],
    queryFn: () => apiRequest("/api/state-packs/NSW/2026", "GET"),
    enabled: step === 2,
  });

  const applyMutation = useMutation({
    mutationFn: async () =>
      apiRequest("/api/state-packs/apply", "POST", { state_code: "NSW", year: 2026 }),
    onSuccess: () => {
      toast({ title: "Calendar applied", description: "NSW 2026 terms and weeks are ready." });
      setStep(3);
    },
    onError: (err: any) => {
      toast({ title: "Couldn't apply calendar", description: err.message ?? "Try again.", variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <GraduationCap className="h-10 w-10 text-blue-600 mx-auto mb-2" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to eSlate</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Three quick steps to get your tutoring profile ready.</p>
        </div>

        <Stepper current={step} />

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-blue-600" /> Working With Children Check</CardTitle>
              <CardDescription>
                Required before you can be assigned to classes involving minors. We store your WWCC number encrypted at rest.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...wwccForm}>
                <form onSubmit={wwccForm.handleSubmit((d) => wwccMutation.mutate(d))} className="space-y-4">
                  <FormField
                    control={wwccForm.control}
                    name="wwccNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WWCC number</FormLabel>
                        <FormControl><Input placeholder="e.g. WWCC1234567E" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={wwccForm.control}
                      name="wwccExpiry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry date</FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={wwccForm.control}
                      name="wwccState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issuing state</FormLabel>
                          <FormControl><Input placeholder="NSW" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={wwccMutation.isPending} className="w-full bg-blue-600 hover:bg-blue-700">
                    {wwccMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                    Save and continue
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-blue-600" /> Academic calendar</CardTitle>
              <CardDescription>
                We'll seed the NSW 2026 calendar — Terms 1–4 with all weeks (~40) and public holidays flagged. You can edit term dates later if your school differs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {packQuery.isLoading && <div className="text-sm text-gray-500">Loading pack…</div>}
              {packQuery.data?.academic_year?.terms && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Terms (NSW 2026)</div>
                  <ul className="text-sm space-y-1">
                    {packQuery.data.academic_year.terms.map((t: any) => (
                      <li key={t.name} className="flex justify-between border-b border-gray-100 dark:border-gray-800 py-1">
                        <span>{t.name}</span>
                        <span className="text-gray-500">{formatDate(t.start_date)} → {formatDate(t.end_date)}</span>
                      </li>
                    ))}
                  </ul>
                  <Alert>
                    <AlertDescription className="text-xs">
                      Pack version {packQuery.data.pack_version}. Public holidays are flagged on the containing week, not skipped.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              <Button
                onClick={() => applyMutation.mutate()}
                disabled={applyMutation.isPending || !packQuery.data}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {applyMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                Apply NSW 2026 calendar
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-600" /> You're set up</CardTitle>
              <CardDescription>
                WWCC captured, NSW 2026 calendar applied. From the dashboard you can pick active subjects, create classes, and enrol students.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /> Compliance: <span className="font-medium">active</span></li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /> Academic year: <span className="font-medium">2026 (draft)</span></li>
                <li className="flex items-center gap-2 text-gray-500"><span className="h-4 w-4 inline-block" /> Subjects + classes: next from your dashboard</li>
              </ul>
              <Link href="/">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Go to dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <Link href="/" className="text-xs text-gray-500 hover:text-gray-700">Skip for now (you can finish later)</Link>
        </div>
      </div>
    </div>
  );
}

function Stepper({ current }: { current: Step }) {
  const { user } = useAuth();
  const isCompanyAdmin = (user as any)?.role === "company_admin";
  const labels = isCompanyAdmin
    ? ["Calendar", "Done"]
    : ["WWCC", "Calendar", "Done"];
  // For company admin (no WWCC), shift indices so current=2 maps to first label, current=3 to second.
  const displayed = isCompanyAdmin ? current - 1 : current;
  return (
    <div className="flex items-center justify-center gap-3 text-sm">
      {labels.map((label, i) => {
        const idx = i + 1;
        const active = idx === displayed;
        const done = idx < displayed;
        return (
          <div key={label} className="flex items-center gap-2">
            <span className={
              "rounded-full h-7 w-7 flex items-center justify-center text-xs font-medium " +
              (done ? "bg-green-600 text-white"
                : active ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-500")
            }>
              {done ? "✓" : idx}
            </span>
            <span className={active ? "font-medium" : "text-gray-500"}>{label}</span>
            {idx < labels.length && <span className="text-gray-300 dark:text-gray-600">→</span>}
          </div>
        );
      })}
    </div>
  );
}
