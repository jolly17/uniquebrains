/**
 * ContentComments Component
 * 
 * Reusable comment section for ANY content page.
 * 
 * SCALABLE DESIGN:
 * - Pass any unique string as contentPage prop
 * - No database changes needed for new pages
 * - Just add <ContentComments contentPage="your-page-slug" /> to any page
 * 
 * @example
 * // Using predefined constants (optional)
 * import { CONTENT_PAGES } from '../services/contentCommentService';
 * <ContentComments contentPage={CONTENT_PAGES.NEURODIVERSITY} />
 * 
 * @example
 * // Using any custom string (works without adding to CONTENT_PAGES)
 * <ContentComments contentPage="my-new-guide-2024" title="Discussion" />
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  getCommentsByPage, 
  createComment, 
  deleteComment,
  CONTENT_PAGES 
} from '../services/contentCommentService';
import './ContentComments.css';

function ContentComments({ contentPage, title = 'Community Discussion' }) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [commentText, setCommentText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Load comments on mount
  useEffect(() => {
    loadComments();
  }, [contentPage]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getCommentsByPage(contentPage);
      setComments(data);
    } catch (err) {
      console.error('Error loading comments:', err);
      setError('Failed to load comments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please log in to post a comment');
      return;
    }

    if (!commentText.trim()) {
      setError('Please enter a comment');
      return;
    }

    if (commentText.trim().length < 3) {
      setError('Comment must be at least 3 characters long');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const newComment = await createComment({
        contentPage,
        commentText: commentText.trim(),
        isAnonymous
      }, user.id);

      // Add the new comment to the top of the list
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
      setIsAnonymous(false);
      setSuccess('Comment posted successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error posting comment:', err);
      setError(err.message || 'Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await deleteComment(commentId, user.id);
      setComments(prev => prev.filter(c => c.id !== commentId));
      setSuccess('Comment deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getDisplayName = (comment) => {
    if (comment.is_anonymous) {
      return 'Anonymous';
    }
    if (comment.profiles?.first_name) {
      return `${comment.profiles.first_name} ${comment.profiles.last_name || ''}`.trim();
    }
    return 'User';
  };

  const isOwnComment = (comment) => {
    return user && comment.user_id === user.id;
  };

  return (
    <div className="content-comments">
      <div className="comments-header">
        <h2>💬 {title}</h2>
        <p className="comments-subtitle">
          Share your thoughts, experiences, or questions with the community
        </p>
      </div>

      {/* Comment Form */}
      <div className="comment-form-section">
        {user ? (
          <form onSubmit={handleSubmit} className="comment-form">
            <div className="form-group">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts or experiences..."
                rows={4}
                maxLength={2000}
                disabled={submitting}
                className="comment-textarea"
              />
              <div className="textarea-footer">
                <span className="char-count">{commentText.length}/2000</span>
              </div>
            </div>

            <div className="form-options">
              <label className="anonymous-checkbox">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  disabled={submitting}
                />
                <span>Post anonymously</span>
              </label>

              <button 
                type="submit" 
                className="btn-submit-comment"
                disabled={submitting || !commentText.trim()}
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>

            {error && <div className="form-error">{error}</div>}
            {success && <div className="form-success">{success}</div>}
          </form>
        ) : (
          <div className="login-prompt">
            <p>
              <Link to="/login">Log in</Link> or <Link to="/signup">sign up</Link> to join the discussion
            </p>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="comments-list-section">
        <div className="comments-count">
          {loading ? 'Loading...' : `${comments.length} comment${comments.length !== 1 ? 's' : ''}`}
        </div>

        {loading ? (
          <div className="comments-loading">
            <div className="loading-spinner"></div>
            <p>Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="no-comments">
            <div className="no-comments-icon">💭</div>
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-card">
                <div className="comment-header">
                  <div className="comment-author">
                    <span className="author-avatar">
                      {comment.is_anonymous ? '👤' : getDisplayName(comment).charAt(0).toUpperCase()}
                    </span>
                    <span className="author-name">{getDisplayName(comment)}</span>
                  </div>
                  <span className="comment-date">{formatDate(comment.created_at)}</span>
                </div>
                <div className="comment-body">
                  <p>{comment.comment_text}</p>
                </div>
                {isOwnComment(comment) && (
                  <div className="comment-actions">
                    <button 
                      onClick={() => handleDelete(comment.id)}
                      className="btn-delete-comment"
                      title="Delete comment"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ContentComments;