import { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Settings, 
  Plus, 
  Trash2, 
  Copy,
  Download,
  RefreshCw,
  Zap,
  Brain,
  Code,
  Search,
  FileText,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAgents } from '@/hooks/useAgents';
import { aiAPI } from '@/api/ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const aiProviders = [
  { id: 'openai', name: 'OpenAI GPT-4', icon: '🤖' },
  { id: 'claude', name: 'Anthropic Claude', icon: '🧠' },
  { id: 'gemini', name: 'Google Gemini', icon: '✨' },
  { id: 'local-agent', name: 'Local Agent', icon: '🏠' }
];

const quickActions = [
  {
    id: 'summarize-notes',
    title: 'สรุปบันทึก',
    description: 'สรุปบันทึกล่าสุดของคุณ',
    icon: FileText,
    agentType: 'note-analyzer',
    prompt: 'กรุณาสรุปบันทึกล่าสุดของฉันและแสดงประเด็นสำคัญ'
  },
  {
    id: 'plan-tasks',
    title: 'วางแผนงาน',
    description: 'วางแผนและจัดลำดับความสำคัญของงาน',
    icon: Brain,
    agentType: 'task-manager',
    prompt: 'ช่วยวางแผนและจัดลำดับความสำคัญของงานที่ฉันต้องทำ'
  },
  {
    id: 'research-topic',
    title: 'ค้นคว้าหัวข้อ',
    description: 'ค้นคว้าข้อมูลเกี่ยวกับหัวข้อที่สนใจ',
    icon: Search,
    agentType: 'research-assistant',
    prompt: 'ช่วยค้นคว้าข้อมูลเกี่ยวกับ: '
  },
  {
    id: 'code-review',
    title: 'ตรวจสอบโค้ด',
    description: 'ตรวจสอบและปรับปรุงโค้ด',
    icon: Code,
    agentType: 'code-helper',
    prompt: 'ช่วยตรวจสอบและแนะนำการปรับปรุงโค้ดนี้: '
  }
];

export default function EnhancedChatInterface() {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [isAgentDialogOpen, setIsAgentDialogOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const { 
    agents, 
    createAgent, 
    assignTask, 
    getTaskResult,
    isLoading: agentsLoading 
  } = useAgents();

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSessions = async () => {
    try {
      setSessionsLoading(true);
      const data = await aiAPI.getSessions();
      setSessions(data);
      if (data.length > 0 && !currentSession) {
        handleSelectSession(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleSelectSession = async (sessionId) => {
    try {
      setMessagesLoading(true);
      const session = await aiAPI.getSessionWithMessages(sessionId);
      setCurrentSession(session);
    } catch (error) {
      console.error('Failed to select session:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      const newSession = await aiAPI.createSession({
        title: `แชทใหม่ ${sessions.length + 1}`,
        providerId: selectedProvider // This will need to be mapped to DB provider IDs eventually
      });

      setSessions([newSession, ...sessions]);
      setCurrentSession(newSession);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await aiAPI.deleteSession(sessionId);
      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(updatedSessions);
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        if (updatedSessions.length > 0) {
          handleSelectSession(updatedSessions[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !currentSession) return;

    const userContent = message;
    setMessage('');
    setIsLoading(true);

    try {
      // 1. Add user message to DB
      const userMessage = await aiAPI.addMessage(currentSession.id, {
        content: userContent,
        role: 'user'
      });

      // Update local state for immediate feedback
      setCurrentSession(prev => ({
        ...prev,
        messages: [...(prev?.messages || []), userMessage]
      }));

      // 2. Simulate AI response (replace with actual AI logic later)
      const aiResponseContent = await simulateAIResponse(userContent, currentSession.providerId);
      
      // 3. Add AI message to DB
      const aiMessage = await aiAPI.addMessage(currentSession.id, {
        content: aiResponseContent,
        role: 'assistant',
        metadata: { provider: selectedProvider }
      });

      // Update local state with AI response
      setCurrentSession(prev => ({
        ...prev,
        messages: [...(prev?.messages || []), aiMessage]
      }));

      // Update sessions list to reflect new order/timestamp
      setSessions(prev => prev.map(s => 
        s.id === currentSession.id ? { ...s, updatedAt: new Date() } : s
      ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));

    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateAIResponse = async (userMessage, provider) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simple response simulation
    const responses = [
      `ขอบคุณสำหรับคำถาม "${userMessage}" ฉันเป็น AI จาก ${provider} และพร้อมช่วยเหลือคุณ`,
      `เกี่ยวกับ "${userMessage}" ฉันคิดว่านี่เป็นหัวข้อที่น่าสนใจ ให้ฉันช่วยวิเคราะห์ให้คุณ`,
      `สำหรับคำถามของคุณเกี่ยวกับ "${userMessage}" ฉันมีข้อมูลที่อาจเป็นประโยชน์`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const executeQuickAction = async (action) => {
    if (!currentSession) {
      createNewSession();
    }

    let prompt = action.prompt;
    if (action.id === 'research-topic') {
      const topic = window.prompt('กรุณาระบุหัวข้อที่ต้องการค้นคว้า:');
      if (!topic) return;
      prompt += topic;
    } else if (action.id === 'code-review') {
      const code = window.prompt('กรุณาใส่โค้ดที่ต้องการตรวจสอบ:');
      if (!code) return;
      prompt += code;
    }

    // Check if we have a suitable agent
    const suitableAgent = agents.find(agent => agent.type === action.agentType);
    
    if (suitableAgent) {
      try {
        // Assign task to agent
        const task = await assignTask(suitableAgent.id, {
          type: action.id,
          instruction: prompt,
          priority: 'normal'
        });

        // Add user message
        const userMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: prompt,
          timestamp: new Date().toISOString(),
          quickAction: action.id
        };

        // Add agent processing message
        const agentMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `🤖 กำลังประมวลผลด้วย ${suitableAgent.name}...\n\nTask ID: ${task.id}`,
          timestamp: new Date().toISOString(),
          taskId: task.id,
          agentId: suitableAgent.id,
          processing: true
        };

        const updatedSession = {
          ...currentSession,
          messages: [...(currentSession?.messages || []), userMessage, agentMessage],
          updatedAt: new Date().toISOString()
        };

        setCurrentSession(updatedSession);

        // Wait for result (in background)
        getTaskResult(task.id).then(result => {
          const resultMessage = {
            ...agentMessage,
            content: result || 'งานเสร็จสิ้นแล้ว',
            processing: false,
            completed: true
          };

          const finalSession = {
            ...updatedSession,
            messages: updatedSession.messages.map(msg => 
              msg.id === agentMessage.id ? resultMessage : msg
            ),
            updatedAt: new Date().toISOString()
          };

          setCurrentSession(finalSession);
        }).catch(error => {
          const errorMessage = {
            ...agentMessage,
            content: `❌ เกิดข้อผิดพลาด: ${error.message}`,
            processing: false,
            error: true
          };

          const errorSession = {
            ...updatedSession,
            messages: updatedSession.messages.map(msg => 
              msg.id === agentMessage.id ? errorMessage : msg
            ),
            updatedAt: new Date().toISOString()
          };

          setCurrentSession(errorSession);
        });

      } catch (error) {
        console.error('Failed to execute quick action:', error);
      }
    } else {
      // Fallback to regular chat
      setMessage(prompt);
      await sendMessage();
    }
  };

  const createAgentForAction = async (actionType) => {
    try {
      const agent = await createAgent({
        type: actionType,
        name: `${actionType} Agent`,
      });
      
      setIsAgentDialogOpen(false);
      return agent;
    } catch (error) {
      console.error('Failed to create agent:', error);
    }
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  const exportChat = () => {
    if (!currentSession) return;
    
    const chatText = currentSession.messages
      .map(msg => `${msg.role === 'user' ? 'ผู้ใช้' : 'AI'}: ${msg.content}`)
      .join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${currentSession.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar */}
      <div className="w-80 flex flex-col gap-4">
        {/* New Chat Button */}
        <Button onClick={createNewSession} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          แชทใหม่
        </Button>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">การดำเนินการด่วน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const hasAgent = agents.some(agent => agent.type === action.agentType);
              
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => executeQuickAction(action)}
                >
                  <div className="flex items-start gap-2">
                    <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs text-gray-500">{action.description}</div>
                      {hasAgent && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          Agent พร้อม
                        </Badge>
                      )}
                    </div>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Chat Sessions */}
        <Card className="flex-1 overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm">ประวัติแชท</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 flex-1 overflow-y-auto">
            {sessionsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : sessions.length > 0 ? (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-2 rounded-md cursor-pointer transition-colors ${
                    currentSession?.id === session.id
                      ? 'bg-blue-100 dark:bg-blue-900'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => handleSelectSession(session.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {session.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(session.updatedAt).toLocaleDateString('th-TH')}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-center text-gray-500 py-4">ไม่มีประวัติการแชท</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {currentSession ? (
          <>
            {/* Chat Header */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg truncate">{currentSession.title}</CardTitle>
                    <CardDescription className="truncate">
                      Provider: {currentSession.aiProvider?.name || 'Default'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={exportChat}>
                      <Download className="h-4 w-4 mr-2" />
                      ส่งออก
                    </Button>
                    <Dialog open={isAgentDialogOpen} onOpenChange={setIsAgentDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Bot className="h-4 w-4 mr-2" />
                          Agents ({agents.length})
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>AI Agents</DialogTitle>
                          <DialogDescription>
                            จัดการ AI Agents สำหรับการทำงานเฉพาะ
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {quickActions.map((action) => {
                            const hasAgent = agents.some(agent => agent.type === action.agentType);
                            return (
                              <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                  <div className="font-medium">{action.title}</div>
                                  <div className="text-sm text-gray-500">{action.description}</div>
                                </div>
                                {hasAgent ? (
                                  <Badge variant="default">พร้อมใช้งาน</Badge>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => createAgentForAction(action.agentType)}
                                    disabled={agentsLoading}
                                  >
                                    สร้าง Agent
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Messages */}
            <Card className="flex-1 flex flex-col mt-4 overflow-hidden">
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 relative">
                {messagesLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : null}
                
                {currentSession.messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {msg.role === 'assistant' && (
                          <div className="flex-shrink-0 mt-1">
                            {msg.processing ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : msg.error ? (
                              <Bot className="h-4 w-4 text-red-500" />
                            ) : (
                              <Bot className="h-4 w-4" />
                            )}
                          </div>
                        )}
                        <div className="flex-1">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            className="prose prose-sm max-w-none dark:prose-invert"
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyMessage(msg.content)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-xs opacity-70 mt-2">
                        {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString('th-TH')}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex gap-2 mb-2">
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aiProviders.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          <div className="flex items-center gap-2">
                            <span>{provider.icon}</span>
                            <span>{provider.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="พิมพ์ข้อความของคุณ..."
                    className="flex-1 min-h-[60px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!message.trim() || isLoading}
                    className="self-end"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </>
        ) : (
          <Card className="flex-1 flex items-center justify-center">
            <CardContent className="text-center">
              <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                ยินดีต้อนรับสู่ AI Chat
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                เริ่มแชทใหม่หรือเลือกการดำเนินการด่วน
              </p>
              <Button onClick={createNewSession}>
                <Plus className="h-4 w-4 mr-2" />
                เริ่มแชทใหม่
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
