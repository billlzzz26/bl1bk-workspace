import { useState, useEffect } from 'react';
import { 
  Bot, 
  Play, 
  Square, 
  Settings, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSandboxAgent } from '@/lib/ai/agents/sandboxAgent';

const agentTypes = [
  {
    id: 'note-analyzer',
    name: 'Note Analyzer',
    description: 'วิเคราะห์และสรุปบันทึก',
    icon: '📝',
    capabilities: ['text-analysis', 'summarization', 'tagging']
  },
  {
    id: 'task-manager',
    name: 'Task Manager',
    description: 'จัดการและวางแผนงาน',
    icon: '✅',
    capabilities: ['task-planning', 'scheduling', 'prioritization']
  },
  {
    id: 'research-assistant',
    name: 'Research Assistant',
    description: 'ช่วยค้นคว้าและรวบรวมข้อมูล',
    icon: '🔍',
    capabilities: ['web-search', 'information-synthesis', 'fact-checking']
  },
  {
    id: 'code-helper',
    name: 'Code Helper',
    description: 'ช่วยเหลือด้านการเขียนโปรแกรม',
    icon: '💻',
    capabilities: ['code-analysis', 'debugging', 'documentation']
  }
];

export default function AgentControlPanel() {
  const [agents, setAgents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sandboxStatus, setSandboxStatus] = useState({ available: false });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [sandboxAgent, setSandboxAgent] = useState(null);

  // Form states
  const [newAgentForm, setNewAgentForm] = useState({
    type: '',
    name: '',
    model: 'gpt-3.5-turbo',
    systemPrompt: ''
  });

  const [newTaskForm, setNewTaskForm] = useState({
    agentId: '',
    type: 'general',
    instruction: '',
    priority: 'normal'
  });

  useEffect(() => {
    initializeSandbox();
    loadAgents();
    loadTasks();
    
    // ตั้งค่า interval สำหรับอัปเดตสถานะ
    const interval = setInterval(() => {
      updateStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const initializeSandbox = async () => {
    try {
      const agent = getSandboxAgent();
      setSandboxAgent(agent);
      
      const initialized = await agent.initialize();
      if (initialized) {
        const status = await agent.checkSandboxStatus();
        setSandboxStatus(status);
      }
    } catch (error) {
      console.error('Failed to initialize sandbox:', error);
    }
  };

  const loadAgents = async () => {
    if (sandboxAgent) {
      const activeAgents = sandboxAgent.getActiveAgents();
      setAgents(activeAgents);
    }
  };

  const loadTasks = async () => {
    // โหลดรายการงานจาก API หรือ local storage
    const savedTasks = localStorage.getItem('agent-tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  };

  const updateStatus = async () => {
    if (sandboxAgent) {
      const status = await sandboxAgent.checkSandboxStatus();
      setSandboxStatus(status);
      
      // อัปเดตสถานะงาน
      const updatedTasks = await Promise.all(
        tasks.map(async (task) => {
          if (task.status === 'running' || task.status === 'assigned') {
            const taskStatus = await sandboxAgent.getTaskStatus(task.id);
            return { ...task, ...taskStatus };
          }
          return task;
        })
      );
      setTasks(updatedTasks);
      localStorage.setItem('agent-tasks', JSON.stringify(updatedTasks));
    }
  };

  const createAgent = async () => {
    try {
      if (!sandboxAgent) return;

      const agentConfig = {
        type: newAgentForm.type,
        name: newAgentForm.name || `${newAgentForm.type}-${Date.now()}`,
        model: newAgentForm.model,
        systemPrompt: newAgentForm.systemPrompt
      };

      const agent = await sandboxAgent.createSpecializedAgent(newAgentForm.type, agentConfig);
      setAgents(prev => [...prev, agent]);
      setIsCreateDialogOpen(false);
      setNewAgentForm({ type: '', name: '', model: 'gpt-3.5-turbo', systemPrompt: '' });
    } catch (error) {
      console.error('Failed to create agent:', error);
    }
  };

  const stopAgent = async (agentId) => {
    try {
      if (!sandboxAgent) return;
      
      const success = await sandboxAgent.stopAgent(agentId);
      if (success) {
        setAgents(prev => prev.filter(agent => agent.id !== agentId));
      }
    } catch (error) {
      console.error('Failed to stop agent:', error);
    }
  };

  const assignTask = async () => {
    try {
      if (!sandboxAgent) return;

      const task = {
        type: newTaskForm.type,
        instruction: newTaskForm.instruction,
        priority: newTaskForm.priority
      };

      const result = await sandboxAgent.assignTask(newTaskForm.agentId, task);
      
      const newTask = {
        id: result.taskId,
        agentId: newTaskForm.agentId,
        agentName: agents.find(a => a.id === newTaskForm.agentId)?.name || 'Unknown',
        instruction: task.instruction,
        status: result.status,
        priority: task.priority,
        createdAt: new Date().toISOString()
      };

      setTasks(prev => [...prev, newTask]);
      setIsTaskDialogOpen(false);
      setNewTaskForm({ agentId: '', type: 'general', instruction: '', priority: 'normal' });
    } catch (error) {
      console.error('Failed to assign task:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'running':
      case 'completed':
        return 'bg-green-500';
      case 'assigned':
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Activity className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Agent Control Panel
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              จัดการ AI Agents และงานต่างๆ
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={agents.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                มอบหมายงาน
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>มอบหมายงานให้ Agent</DialogTitle>
                <DialogDescription>
                  เลือก Agent และระบุงานที่ต้องการให้ทำ
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agent-select">เลือก Agent</Label>
                  <Select value={newTaskForm.agentId} onValueChange={(value) => 
                    setNewTaskForm(prev => ({ ...prev, agentId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือก Agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-type">ประเภทงาน</Label>
                  <Select value={newTaskForm.type} onValueChange={(value) => 
                    setNewTaskForm(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">ทั่วไป</SelectItem>
                      <SelectItem value="analysis">วิเคราะห์</SelectItem>
                      <SelectItem value="research">ค้นคว้า</SelectItem>
                      <SelectItem value="automation">อัตโนมัติ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">ความสำคัญ</Label>
                  <Select value={newTaskForm.priority} onValueChange={(value) => 
                    setNewTaskForm(prev => ({ ...prev, priority: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">ต่ำ</SelectItem>
                      <SelectItem value="normal">ปกติ</SelectItem>
                      <SelectItem value="high">สูง</SelectItem>
                      <SelectItem value="urgent">เร่งด่วน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instruction">คำสั่งงาน</Label>
                  <Textarea
                    id="instruction"
                    placeholder="อธิบายงานที่ต้องการให้ Agent ทำ..."
                    value={newTaskForm.instruction}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, instruction: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={assignTask} disabled={!newTaskForm.agentId || !newTaskForm.instruction}>
                    มอบหมายงาน
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                สร้าง Agent
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>สร้าง AI Agent ใหม่</DialogTitle>
                <DialogDescription>
                  เลือกประเภทและตั้งค่า Agent ที่ต้องการ
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agent-type">ประเภท Agent</Label>
                  <Select value={newAgentForm.type} onValueChange={(value) => {
                    const selectedType = agentTypes.find(t => t.id === value);
                    setNewAgentForm(prev => ({ 
                      ...prev, 
                      type: value,
                      name: selectedType?.name || '',
                      systemPrompt: selectedType ? `You are a ${selectedType.name.toLowerCase()}. ${selectedType.description}` : ''
                    }));
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกประเภท Agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agentTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            <div>
                              <div className="font-medium">{type.name}</div>
                              <div className="text-sm text-gray-500">{type.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent-name">ชื่อ Agent</Label>
                  <Input
                    id="agent-name"
                    value={newAgentForm.name}
                    onChange={(e) => setNewAgentForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ชื่อของ Agent"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">AI Model</Label>
                  <Select value={newAgentForm.model} onValueChange={(value) => 
                    setNewAgentForm(prev => ({ ...prev, model: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                      <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="system-prompt">System Prompt</Label>
                  <Textarea
                    id="system-prompt"
                    value={newAgentForm.systemPrompt}
                    onChange={(e) => setNewAgentForm(prev => ({ ...prev, systemPrompt: e.target.value }))}
                    placeholder="คำสั่งระบบสำหรับ Agent..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={createAgent} disabled={!newAgentForm.type}>
                    สร้าง Agent
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Sandbox Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            สถานะ Sandbox
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${sandboxStatus.available ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="font-medium">
              {sandboxStatus.available ? 'พร้อมใช้งาน' : 'ไม่พร้อมใช้งาน'}
            </span>
            <Badge variant="secondary">
              {sandboxStatus.activeAgents || 0} / {sandboxStatus.maxAgents || 10} Agents
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="agents">Active Agents</TabsTrigger>
          <TabsTrigger value="tasks">งานที่มอบหมาย</TabsTrigger>
          <TabsTrigger value="metrics">สถิติ</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          {agents.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  ยังไม่มี Agent ที่ใช้งาน
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  สร้าง Agent ใหม่เพื่อเริ่มใช้งาน
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  สร้าง Agent แรก
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <Card key={agent.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                    </div>
                    <CardDescription>{agent.type}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Model:</span>
                        <span className="font-medium">{agent.model}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>สร้างเมื่อ:</span>
                        <span>{new Date(agent.createdAt).toLocaleTimeString('th-TH')}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAgent(agent)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        ดู
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => stopAgent(agent.id)}
                      >
                        <Square className="h-4 w-4 mr-1" />
                        หยุด
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  ยังไม่มีงานที่มอบหมาย
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  มอบหมายงานให้ Agent เพื่อเริ่มใช้งาน
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(task.status)}
                          <span className="font-medium">{task.agentName}</span>
                          <Badge variant="outline" className="text-xs">
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {task.instruction}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>สร้างเมื่อ: {new Date(task.createdAt).toLocaleString('th-TH')}</span>
                          <Badge variant="secondary">{task.status}</Badge>
                        </div>
                        {task.progress !== undefined && (
                          <div className="mt-2">
                            <Progress value={task.progress} className="h-2" />
                            <span className="text-xs text-gray-500">{task.progress}% เสร็จสิ้น</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                สถิติการใช้งาน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{agents.length}</div>
                  <div className="text-sm text-gray-600">Active Agents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {tasks.filter(t => t.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">งานที่เสร็จ</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {tasks.filter(t => ['running', 'assigned'].includes(t.status)).length}
                  </div>
                  <div className="text-sm text-gray-600">งานที่กำลังทำ</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
