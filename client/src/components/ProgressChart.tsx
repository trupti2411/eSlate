import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Award, Target } from "lucide-react";

interface Progress {
  id: string;
  studentId: string;
  assignmentId: string;
  completionPercentage: number;
  timeSpent?: number;
  lastAccessedAt: string;
}

interface ProgressChartProps {
  data: Progress[];
}

export default function ProgressChart({ data }: ProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="eink-card">
        <CardContent className="p-8 text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-black mb-2">No Progress Data</h3>
          <p className="text-gray-600">Start working on assignments to see your progress.</p>
        </CardContent>
      </Card>
    );
  }

  const averageCompletion = data.reduce((acc, item) => acc + item.completionPercentage, 0) / data.length;
  const totalTimeSpent = data.reduce((acc, item) => acc + (item.timeSpent || 0), 0);
  const completedAssignments = data.filter(item => item.completionPercentage >= 100).length;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="eink-card">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-black" />
            <div className="text-2xl font-bold text-black">{Math.round(averageCompletion)}%</div>
            <p className="text-xs text-gray-600">Avg Progress</p>
          </CardContent>
        </Card>

        <Card className="eink-card">
          <CardContent className="p-4 text-center">
            <Award className="h-6 w-6 mx-auto mb-2 text-black" />
            <div className="text-2xl font-bold text-black">{completedAssignments}</div>
            <p className="text-xs text-gray-600">Completed</p>
          </CardContent>
        </Card>

        <Card className="eink-card">
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 mx-auto mb-2 text-black" />
            <div className="text-2xl font-bold text-black">{Math.round(totalTimeSpent / 60)}h</div>
            <p className="text-xs text-gray-600">Time Spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress List */}
      <Card className="eink-card">
        <CardHeader>
          <CardTitle className="text-lg">Recent Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                <div className="flex-1">
                  <div className="text-sm font-medium text-black">
                    Assignment #{item.assignmentId.slice(-6)}
                  </div>
                  <div className="text-xs text-gray-600">
                    Last accessed: {new Date(item.lastAccessedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-black">{item.completionPercentage}%</div>
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-black rounded-full" 
                      style={{ width: `${item.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
