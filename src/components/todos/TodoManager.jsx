import { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  AlertCircle,
  Trash2,
  Edit3,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatRelativeTime, formatDate } from '@/utils';
import { useTodos } from '@/hooks/useTodos';

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

const priorityIcons = {
  low: Clock,
  medium: AlertCircle,
  high: AlertCircle
};

export default function TodoManager() {
  const { 
    todos, 
    loading: isLoading, 
    createTodo, 
    updateTodo, 
    deleteTodo, 
    toggleTodo 
  } = useTodos();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, completed, pending
  const [filterPriority, setFilterPriority] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  });

  // Filter todos
  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (todo.description && todo.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'completed' && todo.completed) ||
                         (filterStatus === 'pending' && !todo.completed);
    const matchesPriority = filterPriority === 'all' || todo.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Sort todos by priority and due date
  const sortedTodos = filteredTodos.sort((a, b) => {
    // Completed todos go to bottom
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Sort by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    
    // Sort by due date
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  const handleCreateTodo = async () => {
    if (!newTodo.title.trim()) return;
    await createTodo(newTodo);
    setNewTodo({ title: '', description: '', priority: 'medium', dueDate: '' });
    setIsCreateDialogOpen(false);
  };

  const handleToggleComplete = async (todoId) => {
    await toggleTodo(todoId);
  };

  const handleDeleteTodo = async (todoId) => {
    await deleteTodo(todoId);
  };

  const overdueTodos = todos.filter(todo => 
    !todo.completed && 
    todo.dueDate && 
    new Date(todo.dueDate) < new Date()
  );

  const todayTodos = todos.filter(todo => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return !todo.completed &&
      todo.dueDate &&
      new Date(todo.dueDate) >= today &&
      new Date(todo.dueDate) < tomorrow;
  });

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            รายการสิ่งที่ต้องทำ
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            จัดการงานและติดตามความคืบหน้า
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              เพิ่มงานใหม่
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มงานใหม่</DialogTitle>
              <DialogDescription>
                สร้างรายการสิ่งที่ต้องทำใหม่
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">ชื่องาน</Label>
                <Input
                  id="title"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                  placeholder="ใส่ชื่องาน..."
                />
              </div>
              
              <div>
                <Label htmlFor="description">รายละเอียด</Label>
                <Textarea
                  id="description"
                  value={newTodo.description}
                  onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                  placeholder="รายละเอียดงาน (ไม่บังคับ)..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="priority">ระดับความสำคัญ</Label>
                <Select value={newTodo.priority} onValueChange={(value) => setNewTodo({ ...newTodo, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">ต่ำ</SelectItem>
                    <SelectItem value="medium">ปานกลาง</SelectItem>
                    <SelectItem value="high">สูง</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dueDate">กำหนดส่ง</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={newTodo.dueDate}
                  onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleCreateTodo}>
                  เพิ่มงาน
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">งานทั้งหมด</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">เสร็จแล้ว</p>
                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">วันนี้</p>
                <p className="text-2xl font-bold text-blue-600">{todayTodos.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">เกินกำหนด</p>
                <p className="text-2xl font-bold text-red-600">{overdueTodos.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="ค้นหางาน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="pending">ยังไม่เสร็จ</SelectItem>
              <SelectItem value="completed">เสร็จแล้ว</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกระดับ</SelectItem>
              <SelectItem value="high">สูง</SelectItem>
              <SelectItem value="medium">ปานกลาง</SelectItem>
              <SelectItem value="low">ต่ำ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Todo List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">กำลังโหลดรายการงานของคุณ...</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {sortedTodos.map((todo) => {
              const PriorityIcon = priorityIcons[todo.priority];
              const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;
              
              return (
                <Card key={todo.id} className={`transition-all hover:shadow-md ${todo.completed ? 'opacity-60' : ''} ${isOverdue ? 'border-red-200 dark:border-red-800' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => handleToggleComplete(todo.id)}
                        className="mt-1"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                            {todo.title}
                          </h3>
                          
                          <div className="flex items-center gap-2">
                            <Badge className={priorityColors[todo.priority]}>
                              <PriorityIcon className="h-3 w-3 mr-1" />
                              {todo.priority === 'high' ? 'สูง' : todo.priority === 'medium' ? 'ปานกลาง' : 'ต่ำ'}
                            </Badge>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingTodo({
                                ...todo,
                                dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().slice(0, 16) : ''
                              })}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTodo(todo.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {todo.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {todo.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          {todo.dueDate && (
                            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
                              <Calendar className="h-3 w-3" />
                              {formatDate(todo.dueDate)}
                              {isOverdue && <span className="font-medium">(เกินกำหนด)</span>}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            อัปเดต {formatRelativeTime(todo.updatedAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {sortedTodos.length === 0 && (
            <div className="text-center py-12">
              <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                ไม่พบงาน
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' 
                  ? 'ลองเปลี่ยนเงื่อนไขการค้นหา' 
                  : 'เริ่มต้นเพิ่มงานแรกของคุณ'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Edit Dialog */}
      {editingTodo && (
        <Dialog open={!!editingTodo} onOpenChange={() => setEditingTodo(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>แก้ไขงาน</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">ชื่องาน</Label>
                <Input
                  id="edit-title"
                  value={editingTodo.title}
                  onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">รายละเอียด</Label>
                <Textarea
                  id="edit-description"
                  value={editingTodo.description}
                  onChange={(e) => setEditingTodo({ ...editingTodo, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit-priority">ระดับความสำคัญ</Label>
                <Select 
                  value={editingTodo.priority} 
                  onValueChange={(value) => setEditingTodo({ ...editingTodo, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">ต่ำ</SelectItem>
                    <SelectItem value="medium">ปานกลาง</SelectItem>
                    <SelectItem value="high">สูง</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-dueDate">กำหนดส่ง</Label>
                <Input
                  id="edit-dueDate"
                  type="datetime-local"
                  value={editingTodo.dueDate}
                  onChange={(e) => setEditingTodo({ ...editingTodo, dueDate: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingTodo(null)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleUpdateTodo}>
                  บันทึกการเปลี่ยนแปลง
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
