import { useState } from 'react';
import { 
  Menu, 
  X, 
  Home, 
  FileText, 
  MessageSquare, 
  Settings, 
  CheckSquare,
  Brain,
  Search,
  User,
  LogOut,
  Bot,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils';
import { useTheme } from './common/ThemeProvider';

const navigation = [
  { name: 'แดชบอร์ด', href: '/', icon: Home },
  { name: 'บันทึก', href: '/notes', icon: FileText },
  { name: 'รายการสิ่งที่ต้องทำ', href: '/todos', icon: CheckSquare },
  { name: 'AI Chat', href: '/chat', icon: MessageSquare },
  { name: 'AI Agents', href: '/agents', icon: Bot },
  { name: 'แผนภาพความรู้', href: '/knowledge-graph', icon: Brain },
  { name: 'ค้นหา', href: '/search', icon: Search },
];

export default function Layout({ children, currentPath = '/' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark':
        return Sun;
      case 'light':
        return Moon;
      default:
        return Monitor;
    }
  };

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-gray-800 shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              AI Workspace
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </a>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="space-y-2">
              <a
                href="/profile"
                className="flex items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    ผู้ใช้
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    user@example.com
                  </p>
                </div>
              </a>
              <div className="flex gap-1">
                <a
                  href="/settings"
                  className="flex-1 flex items-center justify-center p-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  ตั้งค่า
                </a>
                <Button variant="ghost" size="sm" onClick={cycleTheme} title="เปลี่ยนธีม">
                  {(() => {
                    const ThemeIcon = getThemeIcon();
                    return <ThemeIcon className="h-4 w-4" />;
                  })()}
                </Button>
                <Button variant="ghost" size="sm" title="ออกจากระบบ">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              AI Workspace
            </h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </a>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="space-y-2">
              <a
                href="/profile"
                className="flex items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    ผู้ใช้
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    user@example.com
                  </p>
                </div>
              </a>
              <div className="flex gap-1">
                <a
                  href="/settings"
                  className="flex-1 flex items-center justify-center p-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  ตั้งค่า
                </a>
                <Button variant="ghost" size="sm" onClick={cycleTheme} title="เปลี่ยนธีม">
                  {(() => {
                    const ThemeIcon = getThemeIcon();
                    return <ThemeIcon className="h-4 w-4" />;
                  })()}
                </Button>
                <Button variant="ghost" size="sm" title="ออกจากระบบ">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {navigation.find(item => item.href === currentPath)?.name || 'แดชบอร์ด'}
              </h2>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Button variant="ghost" size="sm">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
