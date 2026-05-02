import { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Tag,
  Calendar,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { formatRelativeTime, truncateText } from '@/utils';
import { useNotes } from '@/hooks/useNotes';

export default function NotesManager() {
  const { 
    notes, 
    loading: isLoading, 
    createNote, 
    updateNote, 
    deleteNote 
  } = useNotes();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: [],
    isPublic: false
  });

  // Get all unique tags
  const allTags = [...new Set(notes.flatMap(note => note.tags || []))];

  // Filter notes based on search and tag
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || (note.tags && note.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  const handleCreateNote = async () => {
    if (!newNote.title.trim()) return;
    await createNote({
      ...newNote,
      tags: newNote.tags.filter(tag => tag.trim())
    });
    setNewNote({ title: '', content: '', tags: [], isPublic: false });
    setIsCreateDialogOpen(false);
  };

  const handleUpdateNote = async () => {
    if (!editingNote.title.trim()) return;
    await updateNote(editingNote.id, editingNote);
    setEditingNote(null);
  };

  const handleDeleteNote = async (noteId) => {
    await deleteNote(noteId);
  };

  const addTag = (noteData, setNoteData) => {
    const tagInput = document.getElementById('tag-input');
    const tag = tagInput.value.trim();
    if (tag && !noteData.tags.includes(tag)) {
      setNoteData({
        ...noteData,
        tags: [...noteData.tags, tag]
      });
      tagInput.value = '';
    }
  };

  const removeTag = (noteData, setNoteData, tagToRemove) => {
    setNoteData({
      ...noteData,
      tags: noteData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            บันทึกของฉัน
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            จัดการและค้นหาบันทึกทั้งหมดของคุณ
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              สร้างบันทึกใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>สร้างบันทึกใหม่</DialogTitle>
              <DialogDescription>
                เขียนบันทึกใหม่ด้วย Markdown
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">ชื่อบันทึก</Label>
                <Input
                  id="title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="ใส่ชื่อบันทึก..."
                />
              </div>
              
              <div>
                <Label htmlFor="content">เนื้อหา</Label>
                <Textarea
                  id="content"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="เขียนเนื้อหาด้วย Markdown..."
                  rows={10}
                />
              </div>

              <div>
                <Label htmlFor="tags">แท็ก</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="tag-input"
                    placeholder="เพิ่มแท็ก..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(newNote, setNewNote);
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => addTag(newNote, setNewNote)}
                  >
                    เพิ่ม
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newNote.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeTag(newNote, setNewNote, tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={newNote.isPublic}
                  onCheckedChange={(checked) => setNewNote({ ...newNote, isPublic: checked })}
                />
                <Label htmlFor="public">เผยแพร่สาธารณะ</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleCreateNote}>
                  สร้างบันทึก
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="ค้นหาบันทึก..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">ทุกแท็ก</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">กำลังโหลดบันทึกของคุณ...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">
                      {note.title}
                    </CardTitle>
                    <div className="flex gap-1">
                      {note.isPublic ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-2 text-xs">
                    <Calendar className="h-3 w-3" />
                    {formatRelativeTime(note.updatedAt)}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {truncateText(note.content.replace(/[#*`]/g, ''), 120)}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {note.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingNote(note)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredNotes.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                ไม่พบบันทึก
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || selectedTag ? 'ลองเปลี่ยนคำค้นหาหรือแท็ก' : 'เริ่มต้นสร้างบันทึกแรกของคุณ'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Edit Dialog */}
      {editingNote && (
        <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>แก้ไขบันทึก</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">ชื่อบันทึก</Label>
                <Input
                  id="edit-title"
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-content">เนื้อหา</Label>
                <Textarea
                  id="edit-content"
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  rows={10}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-public"
                  checked={editingNote.isPublic}
                  onCheckedChange={(checked) => setEditingNote({ ...editingNote, isPublic: checked })}
                />
                <Label htmlFor="edit-public">เผยแพร่สาธารณะ</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingNote(null)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleUpdateNote}>
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
