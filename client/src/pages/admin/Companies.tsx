import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Plus, Building2, User, ArrowLeft, ChevronRight, Search,
  CheckCircle, XCircle, Copy, MapPin, Settings, Layers, LogOut, Bell,
} from "lucide-react";
import { Link } from "wouter";

interface BusinessSummary {
  id: string;
  name: string;
  state: string;
  type: "individual" | "multi_tutor";
  tier: string;
  hasOwner: boolean;
  companyId: string;
}

interface InviteResponse {
  invitation_id: number;
  business_id: number;
  business_type: "individual" | "multi_tutor";
  business_name: string;
  token: string;
  expires_at: string;
}

type ProfileType = "individual" | "multi_tutor";

export default function Companies() {
  const { toast } = useToast();
  const { user: me, logoutMutation } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | ProfileType>("all");
  const [inviteResult, setInviteResult] = useState<InviteResponse | null>(null);

  const [form, setForm] = useState({
    type: "multi_tutor" as ProfileType,
    name: "",
    ownerFirstName: "",
    ownerLastName: "",
    ownerEmail: "",
    stateCode: "NSW",
    // ESLATE-3: optional company-profile fields (multi_tutor only)
    abn: "",
    address: "",
    contactEmail: "",
    contactPhone: "",
  });

  const { data: businesses, isLoading } = useQuery<BusinessSummary[]>({
    queryKey: ["/api/companies"],
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: typeof form): Promise<InviteResponse> => {
      const payload: Record<string, unknown> = {
        type: data.type,
        owner_email: data.ownerEmail,
        owner_first_name: data.ownerFirstName,
        owner_last_name: data.ownerLastName,
        state_code: data.stateCode,
      };
      if (data.type === "multi_tutor") payload.name = data.name;
      else if (data.name.trim()) payload.name = data.name;
      // ESLATE-3: only send the optional company-profile fields for multi_tutor,
      // and only if they're actually filled in.
      if (data.type === "multi_tutor") {
        if (data.abn.trim())          payload.abn           = data.abn.trim();
        if (data.address.trim())      payload.address       = data.address.trim();
        if (data.contactEmail.trim()) payload.contact_email = data.contactEmail.trim();
        if (data.contactPhone.trim()) payload.contact_phone = data.contactPhone.trim();
      }
      return await apiRequest("/api/admin/businesses/invite", "POST", payload);
    },
    onSuccess: (res) => {
      toast({
        title: "Invitation created",
        description: `Send the link to ${form.ownerEmail} so they can set their password.`,
      });
      setInviteResult(res);
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Couldn't create invitation",
        description: error.message || "Failed to invite",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setForm({
      type: "multi_tutor",
      name: "",
      ownerFirstName: "",
      ownerLastName: "",
      ownerEmail: "",
      stateCode: "NSW",
      abn: "",
      address: "",
      contactEmail: "",
      contactPhone: "",
    });
    setInviteResult(null);
  };

  const closeDialog = () => {
    setIsCreateDialogOpen(false);
    resetForm();
  };

  // ESLATE-3: lightweight client-side validation. Backend validates authoritatively.
  // ABN: 11 digits with optional " " or "-" between groups.
  const abnDigits = form.abn.replace(/[\s-]/g, "");
  const abnValid = !form.abn.trim() || /^\d{11}$/.test(abnDigits);
  const contactEmailValid = !form.contactEmail.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim());
  const contactPhoneDigits = form.contactPhone.replace(/[^\d]/g, "");
  const contactPhoneValid = !form.contactPhone.trim() || (contactPhoneDigits.length >= 6 && contactPhoneDigits.length <= 15);
  const optionalFieldsValid = abnValid && contactEmailValid && contactPhoneValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!optionalFieldsValid) {
      toast({
        title: "Please fix the highlighted fields",
        description: "ABN, contact email, or phone has an invalid format.",
        variant: "destructive",
      });
      return;
    }
    inviteMutation.mutate(form);
  };

  const inviteLink = inviteResult
    ? `${window.location.origin}/accept-invite/business?token=${inviteResult.token}`
    : "";

  const copyInviteLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast({ title: "Link copied", description: "Paste it into an email to the owner." });
    } catch {
      toast({ title: "Couldn't copy", description: "Select the link manually.", variant: "destructive" });
    }
  };

  const filtered = businesses?.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || b.type === filterType;
    return matchesSearch && matchesType;
  });

  const total = businesses?.length || 0;
  const totalCompanies = businesses?.filter((b) => b.type === "multi_tutor").length || 0;
  const totalIndividuals = businesses?.filter((b) => b.type === "individual").length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Purple admin header */}
      <header className="bg-purple-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/admin">
                <button className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center flex-shrink-0">
                  <ArrowLeft size={16} />
                </button>
              </Link>
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <Building2 size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-purple-200">Admin Portal</p>
                <h1 className="text-xl sm:text-2xl font-black truncate">Tutors &amp; companies</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="hidden md:flex items-center gap-2 text-xs text-purple-100">
                <Bell size={14} />
                <span>Welcome, {me?.firstName ?? "Admin"}</span>
              </div>
              <button
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="text-xs font-bold bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-xl flex items-center gap-1.5 disabled:opacity-60"
              >
                <LogOut size={12} />
                <span className="hidden sm:inline">{logoutMutation.isPending ? "Signing out…" : "Sign out"}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Title + create action */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-black text-gray-900">Tutor &amp; company profiles</h2>
            <p className="text-sm text-gray-500 mt-0.5">Create solo-tutor and tutoring-company accounts. Invites are sent via link.</p>
          </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={(open) => { if (!open) resetForm(); setIsCreateDialogOpen(open); }}
            >
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create profile</DialogTitle>
                  <DialogDescription>
                    Choose the profile type and enter the owner's contact details. An invitation link will be generated so they can set their own password.
                  </DialogDescription>
                </DialogHeader>

                {inviteResult ? (
                  <div className="space-y-4">
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Invitation created for <strong>{form.ownerEmail}</strong>. Share this link — it expires in 7 days.
                      </AlertDescription>
                    </Alert>

                    <div>
                      <Label className="text-xs uppercase tracking-wider text-gray-500">Invite link</Label>
                      <div className="flex gap-2 mt-1.5">
                        <Input readOnly value={inviteLink} className="font-mono text-xs" />
                        <Button type="button" onClick={copyInviteLink} variant="outline">
                          <Copy className="w-4 h-4 mr-1" /> Copy
                        </Button>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Business <strong>{inviteResult.business_name}</strong> (id #{inviteResult.business_id}) has been created
                      as <strong>{inviteResult.business_type === "individual" ? "Solo Tutor" : "Tutoring Company"}</strong>.
                      It will activate once the owner accepts the invite.
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={resetForm}>Create another</Button>
                      <Button type="button" onClick={closeDialog} className="bg-purple-600 text-white hover:bg-purple-700">Done</Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label>Profile type <span className="text-red-500">*</span></Label>
                      <Select
                        value={form.type}
                        onValueChange={(v) => setForm({ ...form, type: v as ProfileType })}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Solo tutor (just one person)</SelectItem>
                          <SelectItem value="multi_tutor">Tutoring company (multiple tutors)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        {form.type === "individual"
                          ? "We'll create a hidden Individual business so the tutor has somewhere to own classes and students."
                          : "We'll create a Multi-Tutor business at Starter tier. The owner can invite tutors after setup."}
                      </p>
                    </div>

                    {form.type === "multi_tutor" && (
                      <div>
                        <Label htmlFor="biz-name">Business name <span className="text-red-500">*</span></Label>
                        <Input
                          id="biz-name"
                          className="mt-1.5"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="e.g. Acme Tutoring"
                          required
                        />
                      </div>
                    )}

                    {/* ESLATE-3: optional company-profile details (multi_tutor only). */}
                    {form.type === "multi_tutor" && (
                      <div className="space-y-4 rounded-xl border border-purple-100 bg-purple-50/30 p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-purple-700">
                          Company details (optional)
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="biz-abn">ABN</Label>
                            <Input
                              id="biz-abn"
                              className={`mt-1.5 ${!abnValid ? "border-red-300 focus-visible:ring-red-400" : ""}`}
                              value={form.abn}
                              onChange={(e) => setForm({ ...form, abn: e.target.value })}
                              placeholder="11 digits, e.g. 12 345 678 901"
                              inputMode="numeric"
                            />
                            {!abnValid && (
                              <p className="text-xs text-red-600 mt-1">ABN must be 11 digits.</p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="biz-phone">Contact phone</Label>
                            <Input
                              id="biz-phone"
                              type="tel"
                              className={`mt-1.5 ${!contactPhoneValid ? "border-red-300 focus-visible:ring-red-400" : ""}`}
                              value={form.contactPhone}
                              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                              placeholder="e.g. +61 2 9000 1234"
                            />
                            {!contactPhoneValid && (
                              <p className="text-xs text-red-600 mt-1">Phone must contain 6–15 digits.</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="biz-contact-email">Contact email</Label>
                          <Input
                            id="biz-contact-email"
                            type="email"
                            className={`mt-1.5 ${!contactEmailValid ? "border-red-300 focus-visible:ring-red-400" : ""}`}
                            value={form.contactEmail}
                            onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                            placeholder="hello@acmetutoring.com.au"
                          />
                          {!contactEmailValid && (
                            <p className="text-xs text-red-600 mt-1">Enter a valid email address.</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Public-facing contact email for the company. Different from the owner login email below.
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="biz-address">Address</Label>
                          <Input
                            id="biz-address"
                            className="mt-1.5"
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            placeholder="e.g. 123 George St, Sydney NSW 2000"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first-name">Owner first name <span className="text-red-500">*</span></Label>
                        <Input
                          id="first-name"
                          className="mt-1.5"
                          value={form.ownerFirstName}
                          onChange={(e) => setForm({ ...form, ownerFirstName: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="last-name">Owner last name <span className="text-red-500">*</span></Label>
                        <Input
                          id="last-name"
                          className="mt-1.5"
                          value={form.ownerLastName}
                          onChange={(e) => setForm({ ...form, ownerLastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="owner-email">Owner email <span className="text-red-500">*</span></Label>
                      <Input
                        id="owner-email"
                        type="email"
                        className="mt-1.5"
                        value={form.ownerEmail}
                        onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                        placeholder="owner@example.com"
                        required
                      />
                    </div>

                    {form.type === "individual" && (
                      <div>
                        <Label htmlFor="solo-biz-name">Business name (optional)</Label>
                        <Input
                          id="solo-biz-name"
                          className="mt-1.5"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder={`Default: "${(form.ownerFirstName + ' ' + form.ownerLastName).trim() || 'Their name'} Tutoring"`}
                        />
                      </div>
                    )}

                    <div>
                      <Label>State</Label>
                      <Input
                        readOnly
                        value="NSW"
                        className="mt-1.5 bg-gray-50 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">v1 supports NSW only.</p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                      <Button type="submit" disabled={inviteMutation.isPending} className="bg-purple-600 text-white hover:bg-purple-700">
                        {inviteMutation.isPending ? "Creating..." : "Create & generate invite"}
                      </Button>
                    </div>
                  </form>
                )}
              </DialogContent>
            </Dialog>
        </div>

        {/* Stat strip — click to filter */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Total profiles" value={total} icon={<Layers size={16} />} tone="purple"
            active={filterType === "all"} onClick={() => setFilterType("all")}
          />
          <StatCard
            label="Tutoring companies" value={totalCompanies} icon={<Building2 size={16} />} tone="purple-light"
            active={filterType === "multi_tutor"} onClick={() => setFilterType("multi_tutor")}
          />
          <StatCard
            label="Solo tutors" value={totalIndividuals} icon={<User size={16} />} tone="blue"
            active={filterType === "individual"} onClick={() => setFilterType("individual")}
          />
        </div>

        {/* Search + filter chip */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search by name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white rounded-xl border border-gray-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          {filterType !== "all" && (
            <button
              onClick={() => setFilterType("all")}
              className="text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-3 py-1.5 flex items-center gap-1.5 hover:bg-purple-100"
            >
              {filterType === "multi_tutor" ? "Companies" : "Solo tutors"} · clear
            </button>
          )}
          <span className="text-xs text-gray-500 ml-auto">
            {filtered?.length ?? 0} of {total}
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered?.map((b) => {
            const isIndividual = b.type === "individual";
            const Icon = isIndividual ? User : Building2;
            return (
              <Card key={b.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`p-2 rounded-lg ${isIndividual ? "bg-blue-50" : "bg-purple-50"}`}>
                        <Icon className={`w-5 h-5 ${isIndividual ? "text-blue-600" : "text-purple-600"}`} />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg text-gray-900 truncate">{b.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge
                            className={
                              isIndividual
                                ? "bg-blue-50 text-blue-700 border-blue-200 text-[10px]"
                                : "bg-purple-50 text-purple-700 border-purple-200 text-[10px]"
                            }
                          >
                            {isIndividual ? "Solo tutor" : "Tutoring company"}
                          </Badge>
                          <Badge className="bg-gray-50 text-gray-600 border-gray-200 text-[10px] capitalize">
                            {b.tier}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={
                        b.hasOwner
                          ? "bg-green-50 text-green-700 border-green-200 text-[10px]"
                          : "bg-amber-50 text-amber-700 border-amber-200 text-[10px]"
                      }
                    >
                      {b.hasOwner ? "Active" : "Pending invite"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-xs">{b.state || "—"}</span>
                  </div>

                  <div className="pt-2">
                    <Link href={`/admin/companies/${b.id}`}>
                      <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                        <Settings className="w-4 h-4 mr-2" />
                        Manage
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filtered?.length === 0 && (
          <Card className="bg-white border border-gray-200 shadow-sm rounded-2xl">
            <CardContent className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-3">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-1">
                {searchQuery || filterType !== "all" ? "No profiles match" : "No profiles yet"}
              </h3>
              <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
                {searchQuery || filterType !== "all"
                  ? "Try a different search or filter."
                  : "Create your first solo tutor or tutoring-company profile to get started."}
              </p>
              {!searchQuery && filterType === "all" && (
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create first profile
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ---------- subcomponents ---------- */

function StatCard({
  label, value, icon, tone, active, onClick,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "purple" | "purple-light" | "blue";
  active: boolean;
  onClick: () => void;
}) {
  const tones: Record<string, { bg: string; text: string; border: string; activeRing: string }> = {
    purple:         { bg: "bg-purple-50",    text: "text-purple-700", border: "border-purple-200", activeRing: "ring-purple-400" },
    "purple-light": { bg: "bg-purple-50/60", text: "text-purple-600", border: "border-purple-100", activeRing: "ring-purple-400" },
    blue:           { bg: "bg-blue-50",      text: "text-blue-700",   border: "border-blue-200",   activeRing: "ring-blue-400" },
  };
  const t = tones[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left bg-white rounded-2xl border ${t.border} shadow-sm p-3 hover:shadow transition-all ${active ? `ring-2 ${t.activeRing} ring-offset-1` : ""}`}
    >
      <div className="flex items-center justify-between">
        <div className={`w-8 h-8 rounded-lg ${t.bg} ${t.text} flex items-center justify-center`}>
          {icon}
        </div>
        <span className={`text-2xl font-black ${t.text}`}>{value}</span>
      </div>
      <p className="text-xs font-semibold text-gray-600 mt-2">{label}</p>
    </button>
  );
}
