import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings, Lock, Shield, Key } from "lucide-react";

export default function AdminSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(true);
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handlePasswordVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast({
        title: "Error",
        description: "Please enter your password",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    
    try {
      const response = await fetch("/api/admin/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsPasswordVerified(true);
        setShowPasswordModal(false);
        setPassword("");
        toast({
          title: "Success",
          description: "Password verified. Access granted.",
        });
      } else {
        toast({
          title: "Error",
          description: "Incorrect password. Access denied.",
          variant: "destructive",
        });
        setPassword("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify password",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Access denied. Admin role required.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin">
                <Button variant="outline" size="sm" className="mb-0 border-black text-black hover:bg-gray-100">
                  ← Back to Admin
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-black">System Settings</h1>
                <p className="text-gray-600 mt-1">Configure security and system parameters</p>
              </div>
            </div>
            <Shield className="h-12 w-12 text-black opacity-20" />
          </div>
        </div>
      </div>

      {/* Password Verification Modal */}
      <Dialog open={showPasswordModal && !isPasswordVerified} onOpenChange={setShowPasswordModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security Verification Required
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handlePasswordVerification} className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Settings access is protected. Please enter your password to continue.
              </p>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isVerifying}
                className="border-black"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black"
              disabled={isVerifying}
            >
              {isVerifying ? "Verifying..." : "Verify Access"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Settings Content - Only show if password verified */}
      {isPasswordVerified && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Security Settings */}
            <Card className="border-2 border-black">
              <CardHeader className="bg-gray-50 border-b-2 border-black">
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm font-medium text-blue-900 mb-2">Session Management</p>
                  <p className="text-xs text-blue-700 mb-3">Manage active admin sessions</p>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0 w-full">
                    View & Terminate Sessions
                  </Button>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded">
                  <p className="text-sm font-medium text-purple-900 mb-2">Audit Logs</p>
                  <p className="text-xs text-purple-700 mb-3">View system activity and changes</p>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white border-0 w-full">
                    Access Audit Logs
                  </Button>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded">
                  <p className="text-sm font-medium text-orange-900 mb-2">Change Admin Password</p>
                  <p className="text-xs text-orange-700 mb-3">Update your account password</p>
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white border-0 w-full">
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Configuration */}
            <Card className="border-2 border-black">
              <CardHeader className="bg-gray-50 border-b-2 border-black">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm font-medium text-green-900 mb-2">Email Settings</p>
                  <p className="text-xs text-green-700 mb-3">Configure system email notifications</p>
                  <Button className="bg-green-600 hover:bg-green-700 text-white border-0 w-full">
                    Configure Email
                  </Button>
                </div>

                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded">
                  <p className="text-sm font-medium text-indigo-900 mb-2">API Keys & Tokens</p>
                  <p className="text-xs text-indigo-700 mb-3">Manage system API credentials</p>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 w-full">
                    Manage Credentials
                  </Button>
                </div>

                <div className="p-4 bg-cyan-50 border border-cyan-200 rounded">
                  <p className="text-sm font-medium text-cyan-900 mb-2">Database Backup</p>
                  <p className="text-xs text-cyan-700 mb-3">Create and restore system backups</p>
                  <Button className="bg-cyan-600 hover:bg-cyan-700 text-white border-0 w-full">
                    Backup Management
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Lock Icon Footer */}
          <div className="mt-8 p-6 bg-gray-100 border-2 border-black rounded text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Key className="h-5 w-5 text-black" />
              <p className="text-sm font-semibold text-black">Password-Protected Area</p>
            </div>
            <p className="text-xs text-gray-600">
              All changes made in this area are logged and monitored for security purposes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
