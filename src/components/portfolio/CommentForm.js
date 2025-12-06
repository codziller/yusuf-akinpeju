import { useState } from 'react';

const CommentForm = ({ articleTitle }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    comment: ''
  });
  const [status, setStatus] = useState('idle'); // idle, sending, success, error
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setMessage('');

    try {
      const response = await fetch('/api/send-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          articleTitle
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Thank you for your comment! I\'ll get back to you soon.');
        setFormData({ name: '', email: '', comment: '' });
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to send comment. Please try again later.');
    }
  };

  return (
    <div className="mt-12 border-t border-grey-border pt-12">
      <h3 className="text-2xl font-bold mb-6">Leave a comment</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-grey-border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-grey-border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="your.email@example.com"
          />
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium mb-2">
            Comment
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            required
            rows="4"
            className="w-full px-4 py-2 border border-grey-border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
            placeholder="Share your thoughts..."
          />
        </div>

        <button
          type="submit"
          disabled={status === 'sending'}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-grey-text transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'sending' ? 'Sending...' : 'Submit Comment'}
        </button>

        {message && (
          <div
            className={`mt-4 p-4 rounded-lg ${
              status === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default CommentForm;
