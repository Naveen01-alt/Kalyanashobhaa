import React, { useState, useEffect } from 'react';
import './AdminHelpCenter.css'; 

const AdminHelpCenter = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state for resolving an issue
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [adminReply, setAdminReply] = useState('');
  const [resolving, setResolving] = useState(false);
  
  // New state to toggle inline image viewing
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('adminToken'); 

    try {
      const response = await fetch('https://kalyanashobha-back.vercel.app/api/admin/help-center/issues', {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (data.success) {
        setIssues(data.data);
      } else {
        setError(data.message || 'Failed to fetch issues.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('A network error occurred while fetching issues.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!adminReply.trim()) return;

    setResolving(true);
    const token = localStorage.getItem('adminToken');

    try {
      const response = await fetch('https://kalyanashobha-back.vercel.app/api/admin/help-center/resolve', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          issueId: selectedIssue._id,
          adminReply: adminReply
        })
      });

      const data = await response.json();

      if (data.success) {
        setIssues(issues.map(issue => 
          issue._id === selectedIssue._id ? { ...issue, status: 'Resolved' } : issue
        ));
        closeModal();
      } else {
        alert(data.message || 'Failed to resolve the issue.');
      }
    } catch (err) {
      console.error('Resolve error:', err);
      alert('An error occurred while submitting the resolution.');
    } finally {
      setResolving(false);
    }
  };

  const openModal = (issue) => {
    setSelectedIssue(issue);
    setAdminReply('');
    setShowImage(false); // Reset image state when opening new modal
  };

  const closeModal = () => {
    setSelectedIssue(null);
    setAdminReply('');
    setShowImage(false); // Reset image state when closing
  };

  return (
    <div className="ks-admin-page">
      <div className="ks-admin-container">
        
        {/* Header */}
        <div className="ks-admin-topbar">
          <div className="ks-admin-title-group">
            <h1 className="ks-group-title" style={{ margin: 0 }}>Help Center Management</h1>
            <p className="ks-step-sub" style={{ display: 'block', margin: '4px 0 0' }}>
              Review and resolve user support tickets.
            </p>
          </div>
          <button onClick={fetchIssues} className="ks-btn-outline">
            Refresh List
          </button>
        </div>

        {error && (
          <div className="ks-alert ks-alert-error" style={{ margin: '0 0 24px' }}>
            {error}
          </div>
        )}

        {/* Issues Table */}
        <div className="ks-table-card">
          <div className="ks-table-responsive">
            <table className="ks-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User Details</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th className="ks-text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  /* Skeleton Loading Rows */
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`}>
                      <td>
                        <div className="ks-skeleton ks-skeleton-text" style={{ width: '80px' }}></div>
                      </td>
                      <td>
                        <div className="ks-skeleton ks-skeleton-text" style={{ width: '120px', marginBottom: '6px' }}></div>
                        <div className="ks-skeleton ks-skeleton-text" style={{ width: '80px' }}></div>
                      </td>
                      <td>
                        <div className="ks-skeleton ks-skeleton-text" style={{ width: '80%', marginBottom: '6px' }}></div>
                        <div className="ks-skeleton ks-skeleton-text" style={{ width: '60%' }}></div>
                      </td>
                      <td>
                        <div className="ks-skeleton ks-skeleton-badge"></div>
                      </td>
                      <td className="ks-text-right">
                        <div className="ks-skeleton ks-skeleton-text" style={{ width: '80px', marginLeft: 'auto' }}></div>
                      </td>
                    </tr>
                  ))
                ) : issues.length === 0 ? (
                  /* Empty State */
                  <tr>
                    <td colSpan="5" className="ks-empty-state">
                      No support tickets found.
                    </td>
                  </tr>
                ) : (
                  /* Actual Data Rows */
                  issues.map((issue) => (
                    <tr key={issue._id}>
                      <td className="ks-text-muted ks-nowrap">
                        {new Date(issue.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <div className="ks-fw-600 ks-text-main">
                          {issue.userId?.firstName} {issue.userId?.lastName}
                        </div>
                        <div className="ks-text-xs ks-text-muted" style={{ marginTop: '2px' }}>
                          ID: {issue.userId?.uniqueId}
                        </div>
                      </td>
                      <td>
                        <div className="ks-fw-600 ks-text-main">{issue.subject}</div>
                        <div className="ks-text-xs ks-text-muted ks-truncate-text" title={issue.summary}>
                          {issue.summary}
                        </div>
                      </td>
                      <td>
                        <span className={`ks-badge ${issue.status === 'Resolved' ? 'ks-badge-resolved' : 'ks-badge-pending'}`}>
                          {issue.status}
                        </span>
                      </td>
                      <td className="ks-text-right">
                        <button onClick={() => openModal(issue)} className="ks-action-link">
                          View & Reply
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Resolution Modal */}
      {selectedIssue && (
        <div className="ks-modal-overlay" onClick={closeModal}>
          <div className="ks-modal-card" onClick={e => e.stopPropagation()}>
            
            <div className="ks-modal-header">
              <h2 className="ks-modal-title">Ticket Details</h2>
              <button onClick={closeModal} className="ks-modal-close">&times;</button>
            </div>

            <div className="ks-modal-body">
              <div className="ks-info-grid">
                <div className="ks-info-block">
                  <span className="ks-info-label">Reported By</span>
                  <div className="ks-info-value">{selectedIssue.userId?.firstName} {selectedIssue.userId?.lastName}</div>
                  <div className="ks-text-muted ks-text-sm">{selectedIssue.userId?.email}</div>
                  <div className="ks-text-muted ks-text-sm">{selectedIssue.userId?.mobileNumber}</div>
                </div>
                <div className="ks-info-block">
                  <span className="ks-info-label">Status</span>
                  <span className={`ks-badge ${selectedIssue.status === 'Resolved' ? 'ks-badge-resolved' : 'ks-badge-pending'}`}>
                    {selectedIssue.status}
                  </span>
                </div>
              </div>

              <div className="ks-issue-details-box">
                <h3 className="ks-issue-title">{selectedIssue.subject}</h3>
                <p className="ks-issue-summary">{selectedIssue.summary}</p>
                
                {/* Inline Image Viewer Toggle */}
                {selectedIssue.screenshotUrl && (
                  <div className="ks-attachment-wrap">
                    <button 
                      type="button"
                      onClick={() => setShowImage(!showImage)}
                      className="ks-attachment-toggle"
                    >
                      📎 {showImage ? 'Hide Attached Screenshot' : 'View Attached Screenshot'}
                    </button>
                    
                    {/* Render Image below if toggled on */}
                    {showImage && (
                      <div className="ks-image-preview-box">
                        <img 
                          src={selectedIssue.screenshotUrl} 
                          alt="User attached screenshot" 
                          className="ks-attached-image"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedIssue.status !== 'Resolved' && (
                <form onSubmit={handleResolveSubmit}>
                  <div className="ks-input-block" style={{ marginBottom: 0 }}>
                    <label htmlFor="reply" className="ks-label">
                      Admin Reply & Resolution <span className="ks-highlight-red">*</span>
                    </label>
                    <textarea
                      id="reply"
                      rows="4"
                      value={adminReply}
                      onChange={(e) => setAdminReply(e.target.value)}
                      className="ks-control ks-textarea"
                      placeholder="Type your resolution message here. This will be emailed directly to the user..."
                      required
                    ></textarea>
                  </div>
                  
                  <div className="ks-modal-footer">
                    <button type="button" onClick={closeModal} className="ks-btn-outline">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resolving || !adminReply.trim()}
                      className="ks-btn ks-btn-primary"
                      style={{ padding: '12px 24px', fontSize: '14px' }}
                    >
                      {resolving ? 'Sending...' : 'Mark as Resolved & Send'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHelpCenter;
