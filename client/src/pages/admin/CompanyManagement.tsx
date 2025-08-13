import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Building2, Users, UserPlus, Power, PowerOff, ArrowLeft } from "lucide-react";
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
  user?: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

export default function CompanyManagement() {
  const { toast } = useToast();
  const params = useParams();
  const companyId = params.id;

  // Fetch company details
  const { data: company, isLoading: companyLoading } = useQuery<TutoringCompany>({
    queryKey: ["/api/companies", companyId],
    enabled: !!companyId,
  });

  // Fetch company tutors
  const { data: tutors, isLoading: tutorsLoading } = useQuery<CompanyTutor[]>({
    queryKey: ["/api/companies", companyId, "tutors"],
    enabled: !!companyId,
  });

  // Fetch unassigned tutors
  const { data: unassignedTutors } = useQuery<CompanyTutor[]>({
    queryKey: ["/api/admin/unassigned-tutors"],
    enabled: !!companyId,
  });

  // Toggle company status
  const toggleCompanyStatus = useMutation({
    mutationFn: async (isActive: boolean) => {
      return await apiRequest(`/api/companies/${companyId}/status`, "PATCH", { isActive });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Company status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update company status",
        variant: "destructive",
      });
    },
  });

  // Assign tutor mutation
  const assignTutorMutation = useMutation({
    mutationFn: async (tutorId: string) => {
      return await apiRequest(`/api/companies/${companyId}/assign-tutor/${tutorId}`, "PATCH");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tutor assigned successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "tutors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/unassigned-tutors"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign tutor",
        variant: "destructive",
      });
    },
  });

  // Unassign tutor mutation
  const unassignTutorMutation = useMutation({
    mutationFn: async (tutorId: string) => {
      return await apiRequest(`/api/companies/${companyId}/unassign-tutor/${tutorId}`, "PATCH");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tutor removed from company successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "tutors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/unassigned-tutors"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove tutor",
        variant: "destructive",
      });
    },
  });

  if (companyLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center">Loading company details...</div>
        </div>
      </Layout>
    );
  }

  if (!company) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center">Company not found</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/companies">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Companies
              </Button>
            </Link>
            <div>
              <h1 className="page-title flex items-center space-x-3">
                <Building2 className="w-8 h-8 text-blue-600" />
                <span>{company.name}</span>
                <Badge variant={company.isActive ? "default" : "secondary"}>
                  {company.isActive ? "Active" : "Inactive"}
                </Badge>
              </h1>
              <p className="text-gray-600">Company Management Dashboard</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={() => toggleCompanyStatus.mutate(!company.isActive)}
            disabled={toggleCompanyStatus.isPending}
            className="flex items-center space-x-2"
          >
            {company.isActive ? (
              <>
                <PowerOff className="w-4 h-4 text-red-600" />
                <span>Deactivate</span>
              </>
            ) : (
              <>
                <Power className="w-4 h-4 text-green-600" />
                <span>Activate</span>
              </>
            )}
          </Button>
        </div>

        {/* Company Details */}
        <Card className="eink-card">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-600">Description</h3>
                <p>{company.description || "No description provided"}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-600">Contact Email</h3>
                <p>{company.contactEmail || "Not provided"}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-600">Contact Phone</h3>
                <p>{company.contactPhone || "Not provided"}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-600">Address</h3>
                <p>{company.address || "Not provided"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Tutors */}
        <Card className="eink-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Current Tutors ({tutors?.length || 0})</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tutorsLoading ? (
              <p>Loading tutors...</p>
            ) : tutors && tutors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tutors.map((tutor) => (
                  <Card key={tutor.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">
                            {tutor.user ? `${tutor.user.firstName} ${tutor.user.lastName}` : `Tutor #${tutor.id.slice(-6)}`}
                          </h4>
                          {tutor.user?.email && (
                            <p className="text-sm text-gray-600">{tutor.user.email}</p>
                          )}
                        </div>
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
                        <p className="text-sm text-gray-600 mb-3">
                          <strong>Qualifications:</strong> {tutor.qualifications}
                        </p>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => unassignTutorMutation.mutate(tutor.id)}
                        disabled={unassignTutorMutation.isPending}
                        className="w-full text-red-600 hover:bg-red-50"
                      >
                        Remove from Company
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No tutors assigned to this company yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Available Tutors */}
        {unassignedTutors && unassignedTutors.length > 0 && (
          <Card className="eink-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>Available Tutors ({unassignedTutors.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unassignedTutors.map((tutor) => (
                  <Card key={tutor.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">
                            {tutor.user ? `${tutor.user.firstName} ${tutor.user.lastName}` : `Tutor #${tutor.id.slice(-6)}`}
                          </h4>
                          {tutor.user?.email && (
                            <p className="text-sm text-gray-600">{tutor.user.email}</p>
                          )}
                        </div>
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
                        <p className="text-sm text-gray-600 mb-3">
                          <strong>Qualifications:</strong> {tutor.qualifications}
                        </p>
                      )}
                      
                      <Button
                        size="sm"
                        onClick={() => assignTutorMutation.mutate(tutor.id)}
                        disabled={assignTutorMutation.isPending}
                        className="w-full"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Assign to Company
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}