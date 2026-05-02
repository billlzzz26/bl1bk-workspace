import { useState } from 'react';
import { 
  Settings, 
  User, 
  Key, 
  Palette, 
  Bell, 
  Shield, 
  Database,
  Bot,
  Zap,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '../common/ThemeProvider';

const aiProviders = [
  { id: 'openai', name: 'OpenAI', description: 'GPT-4, GPT-3.5 Turbo', status: 'connected' },
  { id: 'google', name: 'Google AI', description: 'Gemini Pro, Gemini Ultra', status: 'disconnected' },
  { id: 'anthropic', name: 'Anthropic', description: 'Claude 3 Opus, Sonnet', status: 'connected' },
  { id: 'cohere', name: 'Cohere', description: 'Command, Embed', status: 'disconnected' },
  { id: 'huggingface', name: 'Hugging Face', description: 'Open Source Models', status: 'disconnected' },
  { id: 'replicate', name: 'Replicate', description: 'Community Models', status: 'disconnected' },
  { id: 'together', name: 'Together AI', description: 'Fast Inference', status: 'disconnected' },
  { id: 'groq', name: 'Groq', description: 'Ultra-fast LLM', status: 'disconnected' },
  { id: 'perplexity', name: 'Perplexity', description: 'Search-augmented AI', status: 'disconnected' },
  { id: 'mistral', name: 'Mistral', description: 'European AI Models', status: 'disconnected' }
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [showApiKeys, setShowApiKeys] = useState({});
  const [settings, setSettings] = useState({
    notifications: true,
    autoSave: true,
    darkMode: theme === 'dark',
    language: 'th',
    aiProvider: 'openai',
    maxTokens: 2000,
    temperature: 0.7
  });

  const [apiKeys, setApiKeys] = useState({
    openai: '',
    google: '',
    anthropic: '',
    cohere: '',
    huggingface: '',
    replicate: '',
    together: '',
    groq: '',
    perplexity: '',
    mistral: ''
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    if (key === 'darkMode') {
      setTheme(value ? 'dark' : 'light');
    }
  };

  const handleApiKeyChange = (provider, value) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }));
  };

  const toggleShowApiKey = (provider) => {
    setShowApiKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const saveSettings = () => {
    // Save settings to backend
    console.log('Saving settings:', settings);
    console.log('Saving API keys:', apiKeys);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ตั้งค่า
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            จัดการการตั้งค่าแอปพลิเคชันและการเชื่อมต่อ AI
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">ทั่วไป</TabsTrigger>
          <TabsTrigger value="ai">AI Providers</TabsTrigger>
          <TabsTrigger value="security">ความปลอดภัย</TabsTrigger>
          <TabsTrigger value="advanced">ขั้นสูง</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                การแสดงผล
              </CardTitle>
              <CardDescription>
                ปรับแต่งธีมและการแสดงผลของแอปพลิเคชัน
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode">โหมดมืด</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    เปิดใช้งานธีมสีเข้ม
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">ภาษา</Label>
                <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="th">ไทย</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                การแจ้งเตือน
              </CardTitle>
              <CardDescription>
                จัดการการแจ้งเตือนและการบันทึกอัตโนมัติ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">การแจ้งเตือน</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    รับการแจ้งเตือนเมื่อมีกิจกรรมใหม่
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-save">บันทึกอัตโนมัติ</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    บันทึกการเปลี่ยนแปลงโดยอัตโนมัติ
                  </p>
                </div>
                <Switch
                  id="auto-save"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Providers
              </CardTitle>
              <CardDescription>
                จัดการ API keys และการเชื่อมต่อกับ AI providers ต่างๆ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {aiProviders.map((provider) => (
                <div key={provider.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{provider.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {provider.description}
                      </p>
                    </div>
                    <Badge variant={provider.status === 'connected' ? 'default' : 'secondary'}>
                      {provider.status === 'connected' ? 'เชื่อมต่อแล้ว' : 'ยังไม่เชื่อมต่อ'}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        type={showApiKeys[provider.id] ? 'text' : 'password'}
                        placeholder={`${provider.name} API Key`}
                        value={apiKeys[provider.id]}
                        onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => toggleShowApiKey(provider.id)}
                      >
                        {showApiKeys[provider.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button variant="outline" size="sm">
                      ทดสอบ
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                การตั้งค่า AI
              </CardTitle>
              <CardDescription>
                ปรับแต่งพารามิเตอร์สำหรับการทำงานของ AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ai-provider">AI Provider เริ่มต้น</Label>
                <Select value={settings.aiProvider} onValueChange={(value) => handleSettingChange('aiProvider', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aiProviders.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-tokens">Max Tokens</Label>
                <Input
                  id="max-tokens"
                  type="number"
                  value={settings.maxTokens}
                  onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={settings.temperature}
                  onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                ความปลอดภัย
              </CardTitle>
              <CardDescription>
                จัดการการตั้งค่าความปลอดภัยและการเข้ารหัส
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                  การเข้ารหัส API Keys
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  API Keys ทั้งหมดจะถูกเข้ารหัสก่อนบันทึกลงฐานข้อมูล
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="encryption-key">Encryption Key</Label>
                <Input
                  id="encryption-key"
                  type="password"
                  placeholder="32-character encryption key"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  ใช้สำหรับเข้ารหัส API keys และข้อมูลสำคัญ
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                การตั้งค่าขั้นสูง
              </CardTitle>
              <CardDescription>
                การตั้งค่าสำหรับผู้ใช้ขั้นสูงและการพัฒนา
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="opik-api-key">Opik API Key</Label>
                <Input
                  id="opik-api-key"
                  type="password"
                  placeholder="your-opik-api-key"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  สำหรับติดตามและวิเคราะห์การใช้งาน AI
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mcp-server">MCP Server URL</Label>
                <Input
                  id="mcp-server"
                  placeholder="http://localhost:8000"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  URL สำหรับเชื่อมต่อ Model Context Protocol
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent-sandbox">Agent Sandbox URL</Label>
                <Input
                  id="agent-sandbox"
                  placeholder="http://localhost:8080"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  URL สำหรับเชื่อมต่อ AI Agent Sandbox
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={saveSettings} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          บันทึกการตั้งค่า
        </Button>
      </div>
    </div>
  );
}
