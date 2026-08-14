import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { FindAndReplace } from '@tiptap/extension-find-and-replace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, Quote, Undo, Redo, Image as ImageIcon, Search } from 'lucide-react';
import { MediaLibraryModal } from '@/components/admin/MediaLibraryModal';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-md my-4 max-w-full',
        },
      }),
      FindAndReplace,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] border rounded-md p-4 mt-2',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-md">
      <div className="flex flex-wrap gap-1 border-b p-2 bg-muted/50 rounded-t-md">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'bg-muted' : ''}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1 my-auto" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1 my-auto" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-muted' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-muted' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-muted' : ''}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1 my-auto" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowSearch(!showSearch)}
          className={showSearch ? 'bg-muted' : ''}
          title="Find and Replace"
        >
          <Search className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1 my-auto" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsMediaLibraryOpen(true)}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1 my-auto" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {showSearch && (
        <div className="flex flex-wrap gap-2 p-2 border-b bg-muted/30 items-center text-sm">
          <Input 
            size="sm" 
            placeholder="Find..." 
            value={searchTerm} 
            onChange={(e) => {
              setSearchTerm(e.target.value);
              editor.commands.setSearchTerm(e.target.value);
            }} 
            className="w-40 h-8"
          />
          <Input 
            size="sm" 
            placeholder="Replace with..." 
            value={replaceTerm} 
            onChange={(e) => {
              setReplaceTerm(e.target.value);
              editor.commands.setReplaceTerm(e.target.value);
            }} 
            className="w-40 h-8"
          />
          <Button 
            type="button" 
            size="sm" 
            variant="outline" 
            className="h-8 px-3 text-xs"
            onClick={() => editor.commands.goToPreviousResult()}
          >
            Prev
          </Button>
          <Button 
            type="button" 
            size="sm" 
            variant="outline" 
            className="h-8 px-3 text-xs"
            onClick={() => editor.commands.goToNextResult()}
          >
            Next
          </Button>
          <Button 
            type="button" 
            size="sm" 
            variant="secondary" 
            className="h-8 px-3 text-xs ml-2"
            onClick={() => editor.commands.replace()}
          >
            Replace
          </Button>
          <Button 
            type="button" 
            size="sm" 
            variant="secondary" 
            className="h-8 px-3 text-xs"
            onClick={() => editor.commands.replaceAll()}
          >
            Replace All
          </Button>
          <Button 
            type="button" 
            size="sm" 
            variant="ghost" 
            className="h-8 px-3 text-xs ml-auto text-muted-foreground"
            onClick={() => {
              setShowSearch(false);
              setSearchTerm("");
              editor.commands.clearSearch();
            }}
          >
            Close
          </Button>
        </div>
      )}
      <EditorContent editor={editor} />
      <MediaLibraryModal 
        open={isMediaLibraryOpen}
        onOpenChange={setIsMediaLibraryOpen}
        onSelect={(url, alt) => {
          if (url) {
            editor.chain().focus().setImage({ src: url, alt }).run();
          }
        }}
      />
    </div>
  );
}
