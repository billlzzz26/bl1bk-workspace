import { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Settings, 
  Plus,
  MessageSquare,
  Trash2,
  Copy,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatRelativeTime, generateId } from '@/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Mock data
const mockSessions = [
  {
    id: '1',
    title: 'การสนทนาเกี่ยวกับ Machine Learning',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    aiProvider: 'OpenAI GPT-4'
  },
  {
    id: '2', 
    title: 'ช่วยเขียนโค้ด Python',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    aiProvider: 'Google Gemini'
  }
];

const mockMessages = {
  '1': [
    {
      id: '1',
      role: 'user',
      content: 'อธิบายเกี่ยวกับ Machine Learning ให้ฟังหน่อย',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      role: 'assistant',
      content: `# Machine Learning คืออะไร?

**Machine Learning (ML)** เป็นสาขาหนึ่งของ Artificial Intelligence ที่ให้คอมพิวเตอร์สามารถเรียนรู้และปรับปรุงประสิทธิภาพได้โดยอัตโนมัติจากข้อมูล โดยไม่ต้องเขียนโปรแกรมอย่างชัดเจน

## ประเภทหลักของ Machine Learning:

### 1. Supervised Learning
- เรียนรู้จากข้อมูลที่มีคำตอบ (labeled data)
- ตัวอย่าง: การจำแนกประเภทอีเมลสแปม, การทำนายราคาบ้าน

### 2. Unsupervised Learning  
- เรียนรู้จากข้อมูลที่ไม่มีคำตอบ (unlabeled data)
- ตัวอย่าง: การจัดกลุ่มลูกค้า, การลดมิติข้อมูล

### 3. Reinforcement Learning
- เรียนรู้ผ่านการทดลองและรับผลตอบแทน
- ตัวอย่าง: เกม, การขับรถอัตโนมัติ

## การประยุกต์ใช้งาน:
- 🔍 ระบบแนะนำสินค้า
- 🏥 การวินิจฉัยทางการแพทย์  
- 🚗 รถยนต์ไร้คนขับ
- 💬 ระบบแชทบอท
- 📊 การวิเคราะห์ข้อมูลทางธุรกิจ`,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000)
    }
  ],
  '2': [
    {
      id: '3',
      role: 'user', 
      content: 'ช่วยเขียนฟังก์ชัน Python สำหรับคำนวณ Fibonacci',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: '4',
      role: 'assistant',
      content: `นี่คือฟังก์ชัน Python สำหรับคำนวณ Fibonacci หลายแบบ:

## 1. แบบ Recursive (เรียกตัวเอง)
\`\`\`python
def fibonacci_recursive(n):
    if n <= 1:
        return n
    return fibonacci_recursive(n-1) + fibonacci_recursive(n-2)

# ตัวอย่างการใช้งาน
print(fibonacci_recursive(10))  # Output: 55
\`\`\`

## 2. แบบ Iterative (วนลูป) - เร็วกว่า
\`\`\`python
def fibonacci_iterative(n):
    if n <= 1:
        return n
    
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

# ตัวอย่างการใช้งาน
print(fibonacci_iterative(10))  # Output: 55
\`\`\`

## 3. แบบ Generator (สำหรับลำดับ)
\`\`\`python
def fibonacci_generator(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# ตัวอย่างการใช้งาน
fib_sequence = list(fibonacci_generator(10))
print(fib_sequence)  # Output: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
\`\`\`

**แนะนำ:** ใช้แบบ Iterative สำหรับประสิทธิภาพที่ดีที่สุด!`,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 45000)
    }
  ]
};

export default function ChatInterface() {
  const [sessions, setSessions] = useState(mockSessions);
  const [currentSessionId, setCurrentSessionId] = useState('1');
  const [messages, setMessages] = useState(mockMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const currentMessages = messages[currentSessionId] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const createNewSession = () => {
    const newSession = {
      id: generateId(),
      title: 'การสนทนาใหม่',
      createdAt: new Date(),
      aiProvider: 'OpenAI GPT-4'
    };
    
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
    setMessages({ ...messages, [newSession.id]: [] });
  };

  const deleteSession = (sessionId) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    
    const updatedMessages = { ...messages };
    delete updatedMessages[sessionId];
    setMessages(updatedMessages);
    
    if (currentSessionId === sessionId && updatedSessions.length > 0) {
      setCurrentSessionId(updatedSessions[0].id);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: generateId(),
      role: 'user',
      content: inputMessage,
      createdAt: new Date()
    };

    // Add user message
    const updatedMessages = {
      ...messages,
      [currentSessionId]: [...currentMessages, userMessage]
    };
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: generateId(),
        role: 'assistant',
        content: `ขอบคุณสำหรับคำถาม: "${inputMessage}"\n\nนี่คือตัวอย่างการตอบกลับจาก AI ที่จะถูกแทนที่ด้วยการเรียก API จริงในอนาคต\n\n**หมายเหตุ:** ระบบ AI ยังอยู่ในระหว่างการพัฒนา`,
        createdAt: new Date()
      };

      setMessages({
        ...updatedMessages,
        [currentSessionId]: [...updatedMessages[currentSessionId], aiMessage]
      });
      setIsLoading(false);
    }, 1500);
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  const regenerateResponse = (messageId) => {
    // Implementation for regenerating AI response
    console.log('Regenerating response for message:', messageId);
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
      {/* Sessions Sidebar */}
      <div className="w-80 flex flex-col">
        <Card className="flex-1">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">การสนทนา</CardTitle>
              <Button size="sm" onClick={createNewSession}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-20rem)]">
              <div className="space-y-2 p-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      currentSessionId === session.id
                        ? 'bg-blue-100 dark:bg-blue-900'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setCurrentSessionId(session.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {session.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatRelativeTime(session.createdAt)}
                        </p>
                        <Badge variant="outline" className="text-xs mt-2">
                          {session.aiProvider}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">
                  {sessions.find(s => s.id === currentSessionId)?.title || 'การสนทนา'}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  AI Provider: {sessions.find(s => s.id === currentSessionId)?.aiProvider}
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          className="prose prose-sm dark:prose-invert max-w-none"
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                      
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs opacity-70">
                          {formatRelativeTime(message.createdAt)}
                        </span>
                        
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyMessage(message.content)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          {message.role === 'assistant' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => regenerateResponse(message.id)}
                              className="h-6 w-6 p-0"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="พิมพ์ข้อความของคุณ..."
                  rows={1}
                  className="resize-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-4"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                กด Enter เพื่อส่ง, Shift+Enter เพื่อขึ้นบรรทัดใหม่
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
