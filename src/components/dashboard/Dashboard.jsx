import { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckSquare, 
  MessageSquare, 
  Brain,
  TrendingUp,
  Clock,
  Target,
  Zap,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/utils';
import { dashboardAPI } from '@/api/dashboard';

const iconMap = {
  FileText: FileText,
  CheckSquare: CheckSquare,
  MessageSquare: MessageSquare,
  Brain: Brain
};

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsData, activityData] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentActivity()
      ]);
      setStats(statsData);
      setRecentActivity(activityData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const todoCompletionRate = stats ? Math.round((stats.completedTodos / stats.totalTodos) * 100) || 0 : 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-48">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-400">กำลังเตรียมพื้นที่ทำงานของคุณ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          สวัสดี! ยินดีต้อนรับสู่ AI Workspace
        </h1>
        <p className="text-blue-100">
          {currentTime.toLocaleDateString('th-TH', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        <p className="text-blue-100">
          เวลา {currentTime.toLocaleTimeString('th-TH', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">บันทึกทั้งหมด</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalNotes || 0}</div>
            <p className="text-xs text-muted-foreground">
              คลังความรู้ของคุณ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รายการสิ่งที่ต้องทำ</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedTodos || 0}/{stats?.totalTodos || 0}</div>
            <p className="text-xs text-muted-foreground">
              {todoCompletionRate}% เสร็จสิ้น
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Interactions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.aiInteractions || 0}</div>
            <p className="text-xs text-muted-foreground">
              จำนวนข้อความที่ AI ช่วยคุณ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">โหนดความรู้</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.knowledgeNodes || 0}</div>
            <p className="text-xs text-muted-foreground">
              จุดเชื่อมโยงความรู้
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Quests - Keeping mock for now as it's a feature logic */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              ภารกิจประจำวัน
            </CardTitle>
            <CardDescription>
              ทำภารกิจให้เสร็จเพื่อรับคะแนน!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center py-8">
              ระบบภารกิจกำลังอยู่ในระหว่างการพัฒนา
            </p>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              กิจกรรมล่าสุด
            </CardTitle>
            <CardDescription>
              กิจกรรมที่คุณทำล่าสุดในระบบ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => {
                  const Icon = iconMap[activity.icon] || FileText;
                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Icon className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  ยังไม่มีกิจกรรมล่าสุด
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>การดำเนินการด่วน</CardTitle>
          <CardDescription>
            เริ่มต้นทำงานได้ทันทีด้วยปุ่มลัดเหล่านี้
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col gap-2" variant="outline">
              <FileText className="h-6 w-6" />
              <span className="text-sm">บันทึกใหม่</span>
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <CheckSquare className="h-6 w-6" />
              <span className="text-sm">เพิ่มงาน</span>
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <MessageSquare className="h-6 w-6" />
              <span className="text-sm">AI Chat</span>
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <Brain className="h-6 w-6" />
              <span className="text-sm">แผนภาพความรู้</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
