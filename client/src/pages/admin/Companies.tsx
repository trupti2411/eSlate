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
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Plus, Building2, User, ArrowLeft, ChevronRight, Search, Filter,
  CheckCircle, XCircle, Copy, MapPin, Settings,
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
    });
    setInviteResult(null);
  };

  const closeDialog = () => {
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
          <div className="w-10 h-10 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <div className="h-8 w-px bg-gray-200" />
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <Building2 className="h-7 w-7 text-gray-700" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Tutor & Company Profiles</h1>
                  <p className="text-gray-500 mt-1">Create solo-tutor and tutoring-company accounts. Invites are sent via link.</p>
                </div>
              </div>
            </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={(open) => { if (!open) resetForm(); setIsCreateDialogOpen(open); }}
            >
              <DialogTrigger asChild>
                <Button className="bg-gray-800 hover:bg-gray-900 text-white shadow-sm">
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
                      <Button type="button" onClick={closeDialog} className="bg-gray-800 text-white hover:bg-gray-900">Done</Button>
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
                      <Button type="submit" disabled={inviteMutation.isPending} className="bg-gray-800 text-white hover:bg-gray-900">
                        {inviteMutation.isPending ? "Creating..." : "Create & generate invite"}
                      </Button>
                    </div>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total profiles</p>
                  <div className="text-3xl font-bold text-gray-900">{total}</div>
                </div>
                <div className="p-3 bg-gray-100 rounded-xl">
                  <Building2 className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Tutoring companies</p>
                  <div className="text-3xl font-bold text-purple-600">{totalCompanies}</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Solo tutors</p>
                  <div className="text-3xl font-bold text-blue-600">{totalIndividuals}</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={filterType === "all" ? "default" : "outline"}
                onClick={() => setFilterType("all")}
                className={filterType === "all" ? "bg-gray-800 text-white" : "border-gray-200"}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filterType === "multi_tutor" ? "default" : "outline"}
                onClick={() => setFilterType("multi_tutor")}
                className={filterType === "multi_tutor" ? "bg-purple-600 text-white" : "border-gray-200"}
              >
                Companies
              </Button>
              <Button
                size="sm"
                variant={filterType === "individual" ? "default" : "outline"}
                onClick={() => setFilterType("individual")}
                className={filterType === "individual" ? "bg-blue-600 text-white" : "border-gray-200"}
              >
                Solo tutors
              </Button>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered?.map((b) => {
            const isIndividual = b.type === "individual";
            const Icon = isIndividual ? User : Building2;
            return (
              <Card key={b.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all group">
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
                      <Button size="sm" className="w-full bg-gray-800 hover:bg-gray-900 text-white">
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
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {searchQuery || filterType !== "all" ? "No profiles match" : "No profiles yet"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || filterType !== "all"
                  ? "Try a different search or filter."
                  : "Create your first solo tutor or tutoring-company profile to get started."}
              </p>
              {!searchQuery && filterType === "all" && (
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gray-800 hover:bg-gray-900 text-white"
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
