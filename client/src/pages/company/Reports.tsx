import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { 
  FileText, 
  Download, 
  Play, 
  Clock, 
  CheckCircle, 
  XCircle, 
  BarChart3,
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  Loader2,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ReportType {
  id: string;
  name: string;
  description: string;
}

interface ReportRun {
  id: string;
  companyId: string;
  reportType: string;
  name: string;
  parameters: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  resultData: any;
  rowCount: number;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

const reportIcons: Record<string, any> = {
  student_performance: Users,
  attendance_summary: Calendar,
  class_utilization: BookOpen,
  assignment_completion: FileText,
  tutor_workload: Users,
  enrollment_trends: TrendingUp,
};

export default function Reports() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'builder' | 'history'>('builder');
  const [selectedReportType, setSelectedReportType] = useState<string>('');
  const [reportName, setReportName] = useState('');
  const [selectedReport, setSelectedReport] = useState<ReportRun | null>(null);

  const { data: user } = useQuery<any>({
    queryKey: ['/api/user'],
  });

  const { data: companyAdmin } = useQuery<any>({
    queryKey: ['/api/company-admin/profile'],
    enabled: user?.role === 'company_admin',
  });

  const companyId = companyAdmin?.companyId;

  const { data: reportTypes = [] } = useQuery<ReportType[]>({
    queryKey: ['/api/reports/types'],
    enabled: !!user,
  });

  const { data: reportHistory = [], isLoading: historyLoading, refetch: refetchHistory } = useQuery<ReportRun[]>({
    queryKey: ['/api/reports/history', companyId],
    enabled: !!companyId,
  });

  const runReportMutation = useMutation({
    mutationFn: async (data: { companyId: string; reportType: string; name: string; parameters?: any }) => {
      const response = await apiRequest('POST', '/api/reports/run', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: 'Report generated successfully' });
      setSelectedReport(data);
      queryClient.invalidateQueries({ queryKey: ['/api/reports/history', companyId] });
      setActiveTab('history');
    },
    onError: (error: any) => {
      toast({ title: 'Failed to generate report', description: error.message, variant: 'destructive' });
    },
  });

  const handleRunReport = () => {
    if (!selectedReportType || !companyId) {
      toast({ title: 'Please select a report type', variant: 'destructive' });
      return;
    }

    const reportType = reportTypes.find(rt => rt.id === selectedReportType);
    runReportMutation.mutate({
      companyId,
      reportType: selectedReportType,
      name: reportName || reportType?.name || 'Report',
      parameters: {},
    });
  };

  const handleExportCSV = (reportRunId: string) => {
    window.open(`/api/reports/export/${reportRunId}/csv`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  if (!user || user.role !== 'company_admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="p-8">
          <p className="text-gray-600 dark:text-gray-400">Only company administrators can access reports.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/company')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Generate and export business reports</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => refetchHistory()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'builder' | 'history')}>
          <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Report Builder
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Report History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reportTypes.map((reportType) => {
                const Icon = reportIcons[reportType.id] || FileText;
                const isSelected = selectedReportType === reportType.id;
                
                return (
                  <Card
                    key={reportType.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected 
                        ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => setSelectedReportType(reportType.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-800'}`}>
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`} />
                        </div>
                        <CardTitle className="text-base">{reportType.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">{reportType.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {selectedReportType && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Generate Report</CardTitle>
                  <CardDescription>Configure and run your selected report</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="reportName">Report Name (Optional)</Label>
                      <Input
                        id="reportName"
                        placeholder="Enter a custom name for this report"
                        value={reportName}
                        onChange={(e) => setReportName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Report Type</Label>
                      <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {reportTypes.map((rt) => (
                            <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleRunReport}
                      disabled={runReportMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {runReportMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Generate Report
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Report History</CardTitle>
                <CardDescription>View and download previously generated reports</CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : reportHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No reports generated yet</p>
                    <p className="text-sm">Use the Report Builder tab to create your first report</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Rows</TableHead>
                        <TableHead>Generated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportHistory.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {report.reportType.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(report.status)}</TableCell>
                          <TableCell>{report.rowCount || '-'}</TableCell>
                          <TableCell>
                            {report.createdAt ? format(new Date(report.createdAt), 'MMM d, yyyy HH:mm') : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {report.status === 'completed' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedReport(report)}
                                  >
                                    View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExportCSV(report.id)}
                                  >
                                    <Download className="w-4 h-4 mr-1" />
                                    CSV
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {selectedReport && selectedReport.status === 'completed' && selectedReport.resultData && (
              <Card className="mt-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedReport.name}</CardTitle>
                      <CardDescription>
                        {selectedReport.resultData.title} - Generated {selectedReport.createdAt ? format(new Date(selectedReport.createdAt), 'MMM d, yyyy HH:mm') : ''}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleExportCSV(selectedReport.id)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedReport.resultData.summary && (
                    <div className="grid gap-4 md:grid-cols-3 mb-6">
                      {Object.entries(selectedReport.resultData.summary).map(([key, value]) => (
                        <Card key={key} className="bg-gray-50 dark:bg-gray-800">
                          <CardContent className="p-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{String(value)}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {selectedReport.resultData.data && selectedReport.resultData.data.length > 0 && (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {Object.keys(selectedReport.resultData.data[0]).map((key) => (
                              <TableHead key={key} className="capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedReport.resultData.data.slice(0, 50).map((row: any, idx: number) => (
                            <TableRow key={idx}>
                              {Object.values(row).map((value: any, cellIdx) => (
                                <TableCell key={cellIdx}>{String(value)}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {selectedReport.resultData.data.length > 50 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
                          Showing first 50 of {selectedReport.resultData.data.length} rows. Export to CSV for full data.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
