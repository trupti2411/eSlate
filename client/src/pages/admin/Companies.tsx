import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Building2, Users, Phone, Mail, MapPin, Power, PowerOff, Settings, TrendingUp, ArrowLeft, ChevronRight } from "lucide-react";
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

interface CompanyTutor {
  id: string;
  userId: string;
  specialization: string;
  qualifications: string;
  isVerified: boolean;
}

export default function Companies() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
  });

  // Fetch all tutoring companies
  const { data: companies, isLoading: loadingCompanies } = useQuery<TutoringCompany[]>({
    queryKey: ["/api/companies"],
  });

  // Fetch tutors for selected company
  const { data: companyTutors, isLoading: loadingTutors } = useQuery<CompanyTutor[]>({
    queryKey: ["/api/companies", selectedCompany, "tutors"],
    enabled: !!selectedCompany,
  });

  // Create company mutation
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

  // Toggle company status mutation
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

  if (loadingCompanies) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-purple-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* Gradient Hero Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <div className="h-8 w-px bg-white/20" />
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Tutoring Companies</h1>
                  <p className="text-purple-100 mt-1">Manage tutoring companies and their staff</p>
                </div>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 px-3 py-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              {companies?.length || 0} Companies
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Action Bar */}
        <div className="flex justify-end">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all">
                <Plus className="w-4 h-4 mr-2" />
                Add Company
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Tutoring Company</DialogTitle>
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

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createCompanyMutation.isPending} className="bg-black text-white hover:bg-gray-800">
                  {createCompanyMutation.isPending ? "Creating..." : "Create Company"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies?.map((company) => (
            <Card key={company.id} className="border-0 bg-white shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <CardTitle className="text-lg text-gray-900">{company.name}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      className={company.isActive 
                        ? "bg-green-100 text-green-700 border-green-200" 
                        : "bg-gray-100 text-gray-600 border-gray-200"
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
                      className="p-1 h-8 w-8 hover:bg-gray-100"
                    >
                      {company.isActive ? (
                        <PowerOff className="w-4 h-4 text-red-500" />
                      ) : (
                        <Power className="w-4 h-4 text-green-500" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {company.description && (
                  <p className="text-gray-600 text-sm line-clamp-2">{company.description}</p>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="w-4 h-4 text-purple-500" />
                    <span>{company.contactEmail || <span className="text-red-500 text-xs">Not set</span>}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="w-4 h-4 text-purple-500" />
                    <span>{company.contactPhone || <span className="text-red-500 text-xs">Not set</span>}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-purple-500" />
                    <span className="line-clamp-1">{company.address || <span className="text-red-500 text-xs">Not set</span>}</span>
                  </div>
                </div>
                
                <div className="pt-3 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCompany(company.id)}
                    className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    View Tutors
                  </Button>
                  <Link href={`/admin/companies/${company.id}`}>
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
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

        {/* Selected Company Details */}
        {selectedCompany && (
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center space-x-2 text-gray-800">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <span>Company Tutors</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {loadingTutors ? (
                <p className="text-gray-600">Loading tutors...</p>
              ) : companyTutors && companyTutors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {companyTutors.map((tutor) => (
                    <Card key={tutor.id} className="border border-gray-200 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900">Tutor #{tutor.id.slice(-6)}</h4>
                          <Badge 
                            className={tutor.isVerified 
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                            }
                          >
                            {tutor.isVerified ? "Verified" : "Pending"}
                          </Badge>
                        </div>
                        {tutor.specialization && (
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Specialization:</strong> {tutor.specialization}
                          </p>
                        )}
                        {tutor.qualifications && (
                          <p className="text-sm text-gray-600">
                            <strong>Qualifications:</strong> {tutor.qualifications}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No tutors found for this company.</p>
              )}
              
              <Button 
                variant="outline" 
                className="mt-4 border-purple-200 text-purple-600 hover:bg-purple-50"
                onClick={() => setSelectedCompany(null)}
              >
                Close Details
              </Button>
            </CardContent>
          </Card>
        )}

        {companies?.length === 0 && (
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="text-center py-12">
              <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Companies Yet</h3>
              <p className="text-gray-500 mb-4">Create your first tutoring company to get started.</p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Company
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}