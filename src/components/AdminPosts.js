import React, { useEffect, useState } from 'react';
import api from '../api';
import { Box, Button, TextField, Paper, Typography, CircularProgress, Snackbar, Alert, Stack, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, TextField as MuiTextField, DialogActions } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import CodeBlock from '@tiptap/extension-code-block';
import Blockquote from '@tiptap/extension-blockquote';
import Heading from '@tiptap/extension-heading';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CodeIcon from '@mui/icons-material/Code';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ImageIcon from '@mui/icons-material/Image';
import LinkIcon from '@mui/icons-material/Link';
import TitleIcon from '@mui/icons-material/Title';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import { uploadImage } from '../api';

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', slug: '', content: '', type: '', tags: '', author: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formDialogOpen, setFormDialogOpen] = useState(false);

  const muiTheme = useMuiTheme();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('adminToken')}` };
      const res = await api.get('/articles', { headers });
      setPosts(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch posts');
    }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('adminToken')}` };
      await api.delete(`/articles/${id}`, { headers });
      setSnackbar({ open: true, message: 'Post deleted', severity: 'success' });
      fetchPosts();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete post', severity: 'error' });
    }
  };

  const handleFormChange = e => {
    const { name, value } = e.target;
    let newForm = { ...form, [name]: value };
    // Auto-generate slug from title if title changes and not editing slug directly
    if (name === 'title' && !editing) {
      newForm.slug = generateSlug(value);
    }
    setForm(newForm);
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleFormSubmit = async e => {
    e.preventDefault();
    const content = editor ? editor.getHTML() : form.content;
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('adminToken')}` };
      const payload = {
        ...form,
        content,
        slug: form.slug || generateSlug(form.title),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        author: form.author || ''
      };
      // Remove empty fields
      Object.keys(payload).forEach(key => {
        if (payload[key] === '' || payload[key] === undefined) {
          delete payload[key];
        }
      });
      if (!payload.author) {
        setError('Author is required');
        return;
      }
      if (editing) {
        await api.put(`/articles/${editing}`, payload, { headers });
        setSnackbar({ open: true, message: 'Post updated', severity: 'success' });
        setEditing(null);
        setForm({ title: '', slug: '', content: '', type: '', tags: '', author: '' });
        setFormDialogOpen(false);
        fetchPosts();
      } else {
        await api.post('/articles', payload, { headers });
        setSnackbar({ open: true, message: 'Post created', severity: 'success' });
        setForm({ title: '', slug: '', content: '', type: '', tags: '', author: '' });
        setFormDialogOpen(false);
    fetchPosts();
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save post. Please check your input and try again.', severity: 'error' });
    }
  };

  const handleAddPost = () => {
    setEditing(null);
    setForm({ title: '', slug: '', content: '', type: '', tags: '', author: '' });
    if (editor) {
      editor.commands.setContent('');
    }
    setFormDialogOpen(true);
  };

  const handleEdit = (post) => {
    setEditing(post._id);
    setForm({
      title: post.title,
      slug: post.slug || '',
      content: post.content,
      type: post.type,
      tags: post.tags.map(t => t.name).join(', '),
      author: post.author || ''
    });
    if (editor) {
      editor.commands.setContent(post.content || '');
    }
    setFormDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setFormDialogOpen(false);
    setEditing(null);
    setForm({ title: '', slug: '', content: '', type: '', tags: '', author: '' });
    if (editor) {
      editor.commands.setContent('');
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Image,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      CodeBlock,
      Blockquote,
      Heading.configure({ levels: [1, 2, 3] }),
    ],
    content: form.content,
    onUpdate: ({ editor }) => {
      setForm(f => ({ ...f, content: editor.getHTML() }));
    },
  });

  const columns = [
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 120 },
    { field: 'slug', headerName: 'Slug', flex: 1, minWidth: 120 },
    { field: 'type', headerName: 'Type', flex: 1, minWidth: 80 },
    {
      field: 'tags',
      headerName: 'Tags',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => {
        if (!params.row || !Array.isArray(params.row.tags)) return '';
        return params.row.tags.map(tag => tag && tag.name ? tag.name : '').filter(Boolean).join(', ');
      }
    },
    { field: 'author', headerName: 'Author', flex: 1, minWidth: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 160,
      sortable: false,
      renderCell: (params) => (
        <>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleEdit(params.row)}
            sx={{ mr: 1, display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handleDelete(params.row._id)}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Delete
          </Button>
          <IconButton size="small" onClick={() => handleEdit(params.row)} sx={{ display: { xs: 'inline-flex', sm: 'none' } }}><EditIcon /></IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(params.row._id)} sx={{ display: { xs: 'inline-flex', sm: 'none' } }}><DeleteIcon /></IconButton>
        </>
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontSize: { xs: '1.4rem', sm: '2rem' }, fontWeight: 700 }}>
          Manage Posts
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddPost}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        >
          Add Post
        </Button>
        <IconButton
          color="primary"
          onClick={handleAddPost}
          sx={{ display: { xs: 'flex', sm: 'none' } }}
        >
          <AddIcon />
        </IconButton>
      </Box>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <Box sx={{ width: '100%', maxWidth: '100vw', overflowX: 'auto' }}>
          <DataGrid
            autoHeight
            rows={posts.filter(p => p && typeof p === 'object' && p._id).map(p => ({ ...p, id: p._id }))}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20, 100]}
            sx={{ minWidth: 320, maxWidth: '100vw', bgcolor: 'background.paper', color: 'text.primary', borderRadius: 2 }}
            disableSelectionOnClick
          />
        </Box>
      )}

      {/* Post Form Dialog */}
      <Dialog 
        open={formDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '80vh',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle>
          {editing ? 'Edit Post' : 'Add New Post'}
        </DialogTitle>
        <DialogContent dividers>
          <form onSubmit={handleFormSubmit} style={{ width: '100%' }}>
            <Stack direction="column" spacing={3} alignItems="stretch" sx={{ width: '100%', overflow: 'visible' }}>
              <TextField 
                name="title" 
                label="Title *" 
                value={form.title} 
                onChange={handleFormChange} 
                required 
                size="small" 
                variant="outlined" 
                fullWidth 
              />
              <TextField 
                name="slug" 
                label="Slug *" 
                value={form.slug} 
                onChange={handleFormChange} 
                required 
                size="small" 
                variant="outlined" 
                fullWidth 
              />
              <TextField 
                name="type" 
                label="Type *" 
                value={form.type} 
                onChange={handleFormChange} 
                required 
                size="small" 
                variant="outlined" 
                fullWidth 
              />
              <TextField 
                name="tags" 
                label="Tags (comma separated)" 
                value={form.tags} 
                onChange={handleFormChange} 
                size="small" 
                variant="outlined" 
                fullWidth 
              />
              <TextField 
                name="author" 
                label="Author *" 
                value={form.author} 
                onChange={handleFormChange} 
                required 
                size="small" 
                variant="outlined" 
                fullWidth 
              />
              <Box
                sx={{
                  border: `1px solid ${muiTheme.palette.divider}`,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  p: 0,
                  minHeight: 160,
                  overflow: 'visible',
                  '& .tiptap': { minHeight: 120, outline: 'none', bgcolor: 'background.paper', color: 'text.primary' },
                }}
              >
                <MenuBar editor={editor} />
                <EditorContent editor={editor} className="tiptap" />
              </Box>
            </Stack>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleFormSubmit} 
            variant="contained"
            disabled={!form.title || !form.type || !form.author}
          >
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Enhanced MenuBar component for TipTap formatting
function MenuBar({ editor }) {
  const [imageDialogOpen, setImageDialogOpen] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState('');
  const [linkDialogOpen, setLinkDialogOpen] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);

  if (!editor) return null;

  // Image upload handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadImage(file);
      editor.chain().focus().setImage({ src: url }).run();
      setImageDialogOpen(false);
      setImageUrl('');
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
      <Tooltip title="Undo"><span><IconButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><UndoIcon /></IconButton></span></Tooltip>
      <Tooltip title="Redo"><span><IconButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><RedoIcon /></IconButton></span></Tooltip>
      <Tooltip title="Bold"><span><IconButton onClick={() => editor.chain().focus().toggleBold().run()} color={editor.isActive('bold') ? 'primary' : 'default'}><FormatBoldIcon /></IconButton></span></Tooltip>
      <Tooltip title="Italic"><span><IconButton onClick={() => editor.chain().focus().toggleItalic().run()} color={editor.isActive('italic') ? 'primary' : 'default'}><FormatItalicIcon /></IconButton></span></Tooltip>
      <Tooltip title="Underline"><span><IconButton onClick={() => editor.chain().focus().toggleUnderline().run()} color={editor.isActive('underline') ? 'primary' : 'default'}><FormatUnderlinedIcon /></IconButton></span></Tooltip>
      <Tooltip title="Bullet List"><span><IconButton onClick={() => editor.chain().focus().toggleBulletList().run()} color={editor.isActive('bulletList') ? 'primary' : 'default'}><FormatListBulletedIcon /></IconButton></span></Tooltip>
      <Tooltip title="Ordered List"><span><IconButton onClick={() => editor.chain().focus().toggleOrderedList().run()} color={editor.isActive('orderedList') ? 'primary' : 'default'}><FormatListNumberedIcon /></IconButton></span></Tooltip>
      <Tooltip title="Blockquote"><span><IconButton onClick={() => editor.chain().focus().toggleBlockquote().run()} color={editor.isActive('blockquote') ? 'primary' : 'default'}><FormatQuoteIcon /></IconButton></span></Tooltip>
      <Tooltip title="Code Block"><span><IconButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} color={editor.isActive('codeBlock') ? 'primary' : 'default'}><CodeIcon /></IconButton></span></Tooltip>
      <Tooltip title="Heading 1"><span><IconButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} color={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'}><TitleIcon fontSize="small" />1</IconButton></span></Tooltip>
      <Tooltip title="Heading 2"><span><IconButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} color={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'}><TitleIcon fontSize="small" />2</IconButton></span></Tooltip>
      <Tooltip title="Heading 3"><span><IconButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} color={editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'}><TitleIcon fontSize="small" />3</IconButton></span></Tooltip>
      <Tooltip title="Align Left"><span><IconButton onClick={() => editor.chain().focus().setTextAlign('left').run()} color={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'default'}><FormatAlignLeftIcon /></IconButton></span></Tooltip>
      <Tooltip title="Align Center"><span><IconButton onClick={() => editor.chain().focus().setTextAlign('center').run()} color={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'default'}><FormatAlignCenterIcon /></IconButton></span></Tooltip>
      <Tooltip title="Align Right"><span><IconButton onClick={() => editor.chain().focus().setTextAlign('right').run()} color={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'default'}><FormatAlignRightIcon /></IconButton></span></Tooltip>
      <Tooltip title="Insert Image"><span><IconButton onClick={() => setImageDialogOpen(true)}><ImageIcon /></IconButton></span></Tooltip>
      <Tooltip title="Insert Link"><span><IconButton onClick={() => setLinkDialogOpen(true)}><LinkIcon /></IconButton></span></Tooltip>
      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)}>
        <DialogTitle>Insert Image</DialogTitle>
        <DialogContent>
          <MuiTextField
            label="Image URL"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button 
            variant="outlined" 
            component="label" 
            fullWidth
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Image'}
            <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (imageUrl) {
                editor.chain().focus().setImage({ src: imageUrl }).run();
                setImageDialogOpen(false);
                setImageUrl('');
              }
            }}
            disabled={!imageUrl || isUploading}
          >
            Insert
          </Button>
        </DialogActions>
      </Dialog>
      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)}>
        <DialogTitle>Insert Link</DialogTitle>
        <DialogContent>
          <MuiTextField
            label="Link URL"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (linkUrl) {
                editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
                setLinkDialogOpen(false);
                setLinkUrl('');
              }
            }}
            disabled={!linkUrl}
          >
            Insert
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default AdminPosts; 