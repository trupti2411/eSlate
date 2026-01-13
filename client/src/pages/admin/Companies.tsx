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
import { Plus, Building2, Users, Phone, Mail, MapPin, Power, PowerOff, Settings } from "lucide-react";
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
    return <div className="p-6">Loading companies...</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/admin">
            <Button variant="outline" size="sm" className="mb-3 border-black dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
              ← Back to Admin
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tutoring Companies</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage tutoring companies and their staff</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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
          <Card key={company.id} className="border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <CardTitle className="text-lg text-gray-900 dark:text-white">{company.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={company.isActive ? "default" : "secondary"} className="text-[10px]">
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
                    className="p-1 h-8 w-8"
                  >
                    {company.isActive ? (
                      <PowerOff className="w-4 h-4 text-red-600" />
                    ) : (
                      <Power className="w-4 h-4 text-green-600" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {company.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{company.description}</p>
              )}
              
              <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{company.contactEmail || <span className="text-red-500 text-xs">Not set</span>}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>{company.contactPhone || <span className="text-red-500 text-xs">Not set</span>}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span className="line-clamp-1">{company.address || <span className="text-red-500 text-xs">Not set</span>}</span>
                </div>
              </div>
              
              <div className="pt-2 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCompany(company.id)}
                  className="w-full border-black dark:border-gray-600"
                >
                  <Users className="w-4 h-4 mr-2" />
                  View Tutors
                </Button>
                <Link href={`/admin/companies/${company.id}`}>
                  <Button
                    size="sm"
                    className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Company
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Company Details */}
      {selectedCompany && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Company Tutors</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTutors ? (
              <p>Loading tutors...</p>
            ) : companyTutors && companyTutors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companyTutors.map((tutor) => (
                  <Card key={tutor.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">Tutor #{tutor.id.slice(-6)}</h4>
                        <Badge variant={tutor.isVerified ? "default" : "secondary"}>
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
              className="mt-4"
              onClick={() => setSelectedCompany(null)}
            >
              Close Details
            </Button>
          </CardContent>
        </Card>
      )}

      {companies?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Companies Yet</h3>
            <p className="text-gray-500 mb-4">Create your first tutoring company to get started.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Company
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}