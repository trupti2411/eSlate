import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Building2, Users, Phone, Mail, MapPin, Power, PowerOff, Settings, TrendingUp, ArrowLeft, ChevronRight, Search, Filter, CheckCircle, XCircle, GraduationCap } from "lucide-react";
import { Link } from "wouter";

interface TutoringCompany {
  id: string;
  name: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  isActive: boolean;
  createdAt: string;
}

export default function Companies() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
  });

  const { data: companies, isLoading: loadingCompanies } = useQuery<TutoringCompany[]>({
    queryKey: ["/api/companies"],
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (companyData: typeof formData) => {
      return await apiRequest("/api/companies", "POST", companyData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tutoring company created successfully",
      });
      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        contactEmail: "",
        contactPhone: "",
        address: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create company",
        variant: "destructive",
      });
    },
  });

  const toggleCompanyStatusMutation = useMutation({
    mutationFn: async ({ companyId, isActive }: { companyId: string; isActive: boolean }) => {
      return await apiRequest(`/api/companies/${companyId}/status`, "PATCH", { isActive });
    },
    onSuccess: (_, { isActive }) => {
      toast({
        title: "Success",
        description: `Company ${isActive ? 'activated' : 'deactivated'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update company status",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCompanyMutation.mutate(formData);
  };

  // Filter companies
  const filteredCompanies = companies?.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.contactEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && company.isActive) ||
      (filterStatus === 'inactive' && !company.isActive);
    return matchesSearch && matchesFilter;
  });

  // Stats
  const totalCompanies = companies?.length || 0;
  const activeCompanies = companies?.filter(c => c.isActive).length || 0;
  const inactiveCompanies = totalCompanies - activeCompanies;

  if (loadingCompanies) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading companies...</p>
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
                  <h1 className="text-2xl font-bold text-gray-900">Tutoring Companies</h1>
                  <p className="text-gray-500 mt-1">Manage tutoring companies and their staff</p>
                </div>
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gray-800 hover:bg-gray-900 text-white shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Company
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Tutoring Company</DialogTitle>
                  <DialogDescription>Add a new tutoring company to the platform.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Company Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactEmail">Contact Email <span className="text-red-500">*</span></Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactPhone">Contact Phone <span className="text-red-500">*</span></Label>
                      <Input
                        id="contactPhone"
                        value={formData.contactPhone}
                        onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createCompanyMutation.isPending} className="bg-gray-800 text-white hover:bg-gray-900">
                      {createCompanyMutation.isPending ? "Creating..." : "Create Company"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Analytics Strip */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Companies</p>
                  <div className="text-3xl font-bold text-gray-900">{totalCompanies}</div>
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
                  <p className="text-gray-500 text-sm font-medium">Active</p>
                  <div className="text-3xl font-bold text-green-600">{activeCompanies}</div>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Inactive</p>
                  <div className="text-3xl font-bold text-gray-400">{inactiveCompanies}</div>
                </div>
                <div className="p-3 bg-gray-100 rounded-xl">
                  <XCircle className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search companies..."
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
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                className={filterStatus === 'all' ? 'bg-gray-800 text-white' : 'border-gray-200'}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('active')}
                className={filterStatus === 'active' ? 'bg-green-600 text-white' : 'border-gray-200'}
              >
                Active
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('inactive')}
                className={filterStatus === 'inactive' ? 'bg-gray-500 text-white' : 'border-gray-200'}
              >
                Inactive
              </Button>
            </div>
          </div>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCompanies?.map((company) => (
            <Card key={company.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                      <Building2 className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-gray-900">{company.name}</CardTitle>
                      {company.description && (
                        <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{company.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge 
                      className={company.isActive 
                        ? "bg-green-50 text-green-700 border-green-200 text-[10px]" 
                        : "bg-gray-100 text-gray-600 border-gray-200 text-[10px]"
                      }
                    >
                      {company.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCompanyStatusMutation.mutate({
                        companyId: company.id,
                        isActive: !company.isActive
                      })}
                      disabled={toggleCompanyStatusMutation.isPending}
                      className="p-1 h-7 w-7 hover:bg-gray-100"
                    >
                      {company.isActive ? (
                        <PowerOff className="w-3.5 h-3.5 text-red-500" />
                      ) : (
                        <Power className="w-3.5 h-3.5 text-green-500" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate text-xs">{company.contactEmail || <span className="text-red-400">Not set</span>}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-xs">{company.contactPhone || <span className="text-red-400">Not set</span>}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="line-clamp-1 text-xs">{company.address || <span className="text-red-400">Not set</span>}</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Link href={`/admin/companies/${company.id}`}>
                    <Button
                      size="sm"
                      className="w-full bg-gray-800 hover:bg-gray-900 text-white"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Company
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCompanies?.length === 0 && (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {searchQuery || filterStatus !== 'all' ? 'No Companies Found' : 'No Companies Yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Create your first tutoring company to get started.'}
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gray-800 hover:bg-gray-900 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Company
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
