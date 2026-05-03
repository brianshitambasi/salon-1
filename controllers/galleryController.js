const { Gallery } = require('../model/models');

// @desc    Get all gallery posts
// @route   GET /api/gallery
// @access  Public
const getGalleryPosts = async (req, res) => {
  try {
    const posts = await Gallery.find({ isActive: true })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name')
      .populate('comments.userId', 'name');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single gallery post
// @route   GET /api/gallery/:id
// @access  Public
const getGalleryPostById = async (req, res) => {
  try {
    const post = await Gallery.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('comments.userId', 'name');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create gallery post
// @route   POST /api/gallery
// @access  Private/Admin
const createGalleryPost = async (req, res) => {
  try {
    const { title, imageUrl, description, category } = req.body;
    if (!title || !imageUrl) {
      return res.status(400).json({ message: 'Title and image URL are required' });
    }
    const post = new Gallery({
      title,
      imageUrl,
      description,
      category: category || 'style',
      createdBy: req.user.id
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update gallery post
// @route   PUT /api/gallery/:id
// @access  Private/Admin
const updateGalleryPost = async (req, res) => {
  try {
    const post = await Gallery.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    post.title = req.body.title || post.title;
    post.imageUrl = req.body.imageUrl || post.imageUrl;
    post.description = req.body.description || post.description;
    post.category = req.body.category || post.category;
    post.isActive = req.body.isActive !== undefined ? req.body.isActive : post.isActive;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete gallery post
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
const deleteGalleryPost = async (req, res) => {
  try {
    const post = await Gallery.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Like/Unlike gallery post
// @route   POST /api/gallery/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const post = await Gallery.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const likeIndex = post.likes.indexOf(req.user.id);
    if (likeIndex === -1) {
      post.likes.push(req.user.id);
    } else {
      post.likes.splice(likeIndex, 1);
    }
    await post.save();
    res.json({ likes: post.likes.length, liked: likeIndex === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Add comment to gallery post
// @route   POST /api/gallery/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const post = await Gallery.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const comment = {
      userId: req.user.id,
      text: req.body.text,
      createdAt: new Date()
    };
    
    post.comments = post.comments || [];
    post.comments.push(comment);
    await post.save();
    
    // Populate the user info for the new comment
    await post.populate('comments.userId', 'name');
    
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete comment from gallery post (admin or comment owner)
// @route   DELETE /api/gallery/:postId/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const post = await Gallery.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is admin or comment owner
    if (comment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    comment.remove();
    await post.save();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getGalleryPosts,
  getGalleryPostById,
  createGalleryPost,
  updateGalleryPost,
  deleteGalleryPost,
  toggleLike,
  addComment,
  deleteComment
};