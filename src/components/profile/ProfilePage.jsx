import { useState } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Link, 
  Edit3, 
  Save, 
  Camera,
  Github,
  Globe,
  Twitter,
  Linkedin,
  Award,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const mockUserData = {
  id: '1',
  name: 'ผู้ใช้งาน',
  email: 'user@example.com',
  avatar: '/api/placeholder/128/128',
  bio: 'นักพัฒนาซอฟต์แวร์ที่หลงใหลในเทคโนโลยี AI และการจัดการความรู้',
  location: 'กรุงเทพมหานคร, ประเทศไทย',
  website: 'https://example.com',
  github: 'billlzzz10',
  twitter: '@username',
  linkedin: 'username',
  joinedDate: '2024-01-15',
  lastActive: '2024-10-02T14:30:00Z'
};

const mockStats = {
  totalNotes: 127,
  totalTodos: 23,
  completedTodos: 15,
  aiInteractions: 156,
  streakDays: 12,
  totalPoints: 2450,
  level: 8
};

const mockAchievements = [
  {
    id: '1',
    title: 'First Note',
    description: 'สร้างบันทึกแรก',
    icon: '📝',
    earned: true,
    date: '2024-01-16'
  },
  {
    id: '2',
    title: 'AI Explorer',
    description: 'ใช้ AI Chat 100 ครั้ง',
    icon: '🤖',
    earned: true,
    date: '2024-02-10'
  },
  {
    id: '3',
    title: 'Task Master',
    description: 'ทำงานเสร็จ 50 รายการ',
    icon: '✅',
    earned: true,
    date: '2024-03-05'
  },
  {
    id: '4',
    title: 'Knowledge Builder',
    description: 'สร้างบันทึก 100 รายการ',
    icon: '🧠',
    earned: false,
    progress: 75
  }
];

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(mockUserData);

  const handleSave = () => {
    // Save user data to backend
    console.log('Saving user data:', userData);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const completionRate = Math.round((mockStats.completedTodos / mockStats.totalTodos) * 100);
  const nextLevelProgress = (mockStats.totalPoints % 500) / 5; // Assuming 500 points per level

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <User className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            โปรไฟล์
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            จัดการข้อมูลส่วนตัวและดูสถิติการใช้งาน
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>ข้อมูลส่วนตัว</CardTitle>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                >
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      บันทึก
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-4 w-4 mr-2" />
                      แก้ไข
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={userData.avatar} alt={userData.name} />
                    <AvatarFallback className="text-lg">
                      {userData.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{userData.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{userData.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">Level {mockStats.level}</Badge>
                    <Badge variant="outline">{mockStats.totalPoints} แต้ม</Badge>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">ชื่อ</Label>
                  <Input
                    id="name"
                    value={userData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">ที่อยู่</Label>
                  <Input
                    id="location"
                    value={userData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">เว็บไซต์</Label>
                  <Input
                    id="website"
                    value={userData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">เกี่ยวกับฉัน</Label>
                <Textarea
                  id="bio"
                  value={userData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h4 className="font-medium">ลิงก์โซเชียล</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    <Input
                      placeholder="GitHub username"
                      value={userData.github}
                      onChange={(e) => handleInputChange('github', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Twitter className="h-4 w-4" />
                    <Input
                      placeholder="Twitter handle"
                      value={userData.twitter}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    <Input
                      placeholder="LinkedIn username"
                      value={userData.linkedin}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                ความสำเร็จ
              </CardTitle>
              <CardDescription>
                รางวัลและความสำเร็จที่คุณได้รับ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border ${
                      achievement.earned
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                        : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium">{achievement.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {achievement.description}
                        </p>
                        {achievement.earned ? (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            ได้รับเมื่อ {new Date(achievement.date).toLocaleDateString('th-TH')}
                          </p>
                        ) : (
                          <div className="mt-2">
                            <Progress value={achievement.progress} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">
                              {achievement.progress}% เสร็จสิ้น
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Level Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                ระดับและคะแนน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  Level {mockStats.level}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {mockStats.totalPoints} แต้ม
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>ความคืบหน้าไปยังเลเวลถัดไป</span>
                  <span>{nextLevelProgress}%</span>
                </div>
                <Progress value={nextLevelProgress} />
                <p className="text-xs text-gray-500 text-center">
                  อีก {500 - (mockStats.totalPoints % 500)} แต้ม
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Activity Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                สถิติการใช้งาน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">บันทึกทั้งหมด</span>
                  <span className="font-medium">{mockStats.totalNotes}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">งานที่เสร็จ</span>
                  <span className="font-medium">
                    {mockStats.completedTodos}/{mockStats.totalTodos}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">AI Interactions</span>
                  <span className="font-medium">{mockStats.aiInteractions}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">Streak</span>
                  <span className="font-medium">{mockStats.streakDays} วัน</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>อัตราการทำงานเสร็จ</span>
                    <span>{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                ข้อมูลบัญชี
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>เข้าร่วมเมื่อ {new Date(userData.joinedDate).toLocaleDateString('th-TH')}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>ใช้งานล่าสุด {new Date(userData.lastActive).toLocaleDateString('th-TH')}</span>
              </div>

              {userData.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{userData.location}</span>
                </div>
              )}

              {userData.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Link className="h-4 w-4" />
                  <a 
                    href={userData.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {userData.website}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
