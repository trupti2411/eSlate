import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, Presentation, Settings } from "lucide-react";

interface RoleSelectorProps {
  onRoleSelect: (role: string) => void;
}

export default function RoleSelector({ onRoleSelect }: RoleSelectorProps) {
  const roles = [
    {
      id: 'student',
      name: 'Student',
      description: 'Access assignments and coursework',
      icon: GraduationCap,
    },
    {
      id: 'parent',
      name: 'Parent',
      description: 'Monitor progress and verify work',
      icon: Users,
    },
    {
      id: 'tutor',
      name: 'Tutor',
      description: 'Manage classes and students',
      icon: Presentation,
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'System administration access',
      icon: Settings,
    },
  ];

  return (
    <Card className="eink-card max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl text-black">Select Your Role</CardTitle>
        <p className="text-center text-gray-600">Choose your account type to continue</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Button
                key={role.id}
                onClick={() => onRoleSelect(role.id)}
                className="w-full eink-button py-4 px-6 text-left flex items-center"
              >
                <Icon className="mr-3 h-5 w-5" />
                <div>
                  <div className="font-semibold">{role.name}</div>
                  <div className="text-sm text-gray-600">{role.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
