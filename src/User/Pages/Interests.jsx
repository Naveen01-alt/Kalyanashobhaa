import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from "../Components/Navbar.jsx";
import './Interests.css';

// --- HELPER TO TRANSLATE STATUS ---
const getUserFriendlyStatus = (status) => {
    switch(status) {
        case 'PendingAdminPhase1': return 'Waiting for Admin';
        case 'PendingUser': return 'Waiting for User';
        case 'PendingAdminPhase2': return 'Admin Finalizing';
        case 'Finalized': return 'Connected';
        case 'Declined': return 'Declined';
        case 'Rejected': return 'Rejected';
        default: return status;
    }
};

const Interests = () => {
  const [activeTab, setActiveTab] = useState('received'); // received | sent | contacts
  const [sentList, setSentList] = useState([]);
  const [receivedList, setReceivedList] = useState([]);
  const [loading, setLoading] = useState(true);

  const neutralAvatar = "https://cdn-icons-png.flaticon.com/512/847/847969.png"; 
  const API_BASE = "https://kalyanashobha-back.vercel.app/api/user";

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async (isBackground = false) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Please login to view connections");
      return;
    }

    if (!isBackground) setLoading(true);

    try {
      const [resSent, resRec] = await Promise.all([
        fetch(`${API_BASE}/interests/sent`, { headers: { 'Authorization': token } }),
        fetch(`${API_BASE}/interests/received`, { headers: { 'Authorization': token } })
      ]);

      const dataSent = await resSent.json();
      const dataRec = await resRec.json();

      if (dataSent.success) setSentList(dataSent.data || []);
      if (dataRec.success) setReceivedList(dataRec.data || []);

    } catch (err) {
      if (!isBackground) toast.error("Could not load data");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (interestId, action) => {
    toast((t) => (
      <div className="toast-confirm">
        <span>{action === 'accept' ? 'Accept' : 'Decline'} this request?</span>
        <div className="toast-actions">
          <button className="toast-btn confirm" onClick={() => performAction(interestId, action, t.id)}>Yes</button>
          <button className="toast-btn cancel" onClick={() => toast.dismiss(t.id)}>No</button>
        </div>
      </div>
    ), { duration: 4000, position: 'top-center' });
  };

  const performAction = async (interestId, action, toastId) => {
    toast.dismiss(toastId);
    const loadingToast = toast.loading("Processing...");
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_BASE}/interest/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ interestId, action })
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Request ${action}ed successfully!`, { id: loadingToast });
        fetchInterests(true); 
      } else {
        toast.error(data.message || "Action failed", { id: loadingToast });
      }
    } catch (err) {
      toast.error("Network error", { id: loadingToast });
    }
  };

  const renderSkeleton = () => (
    <div className="ic-grid">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div key={n} className="ic-card skeleton-card">
          <div className="sk-header"><div className="sk-avatar shimmer"></div><div className="sk-info"><div className="sk-line w-60 shimmer"></div><div className="sk-line w-40 shimmer"></div></div></div>
          <div className="sk-body"><div className="sk-line w-80 shimmer"></div><div className="sk-line w-50 shimmer"></div></div>
        </div>
      ))}
    </div>
  );

  const Card = ({ profile, status, type, onAction, item }) => {
    const isConnected = status === 'Finalized';

    // Calculate Age properly
    let age = "--";
    if (profile?.dob) {
       const diff = Date.now() - new Date(profile.dob).getTime();
       const ageDate = new Date(diff);
       age = Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    return (
      <div className="ic-card fade-in">
        <div className="ic-header">
          <img src={neutralAvatar} alt="User" className="ic-avatar" />
          <div className="ic-user-info">
            <h3 className="ic-name">{profile?.firstName || 'Unknown'} {profile?.lastName || ''}</h3>
            <p className="ic-role">{profile?.jobRole || profile?.occupation || "Not Specified"}</p>
            {isConnected && <span className="ic-badge connected">Managed by Admin</span>}
          </div>
        </div>

        {/* DASHBOARD-STYLE GRID FOR BASIC DETAILS */}
        <div className="ic-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
          <div className="ic-row" style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="ic-label" style={{ fontSize: '0.7rem', color: '#64748b' }}>ID</span>
            <span className="ic-value highlight" style={{ fontWeight: '600' }}>{profile?.uniqueId || "--"}</span>
          </div>
          <div className="ic-row" style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="ic-label" style={{ fontSize: '0.7rem', color: '#64748b' }}>Age</span>
            <span className="ic-value">{age} Yrs</span>
          </div>
          <div className="ic-row" style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="ic-label" style={{ fontSize: '0.7rem', color: '#64748b' }}>Education</span>
            <span className="ic-value">{profile?.education || profile?.highestQualification || "--"}</span>
          </div>
          <div className="ic-row" style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="ic-label" style={{ fontSize: '0.7rem', color: '#64748b' }}>Location</span>
            <span className="ic-value">{profile?.city ? `${profile.city}, ${profile.state}` : "--"}</span>
          </div>
          <div className="ic-row" style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="ic-label" style={{ fontSize: '0.7rem', color: '#64748b' }}>Community</span>
            <span className="ic-value">{profile?.community || profile?.caste || "--"}</span>
          </div>
          <div className="ic-row" style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="ic-label" style={{ fontSize: '0.7rem', color: '#64748b' }}>Sub-Community</span>
            <span className="ic-value">{profile?.subCommunity || "--"}</span>
          </div>
          <div className="ic-row" style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="ic-label" style={{ fontSize: '0.7rem', color: '#64748b' }}>Height</span>
            <span className="ic-value">{profile?.height ? `${profile.height} cm` : "--"}</span>
          </div>
          <div className="ic-row" style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="ic-label" style={{ fontSize: '0.7rem', color: '#64748b' }}>Status</span>
            <span className="ic-value">{profile?.maritalStatus || "--"}</span>
          </div>
        </div>

        {/* STATUS TRACKER (Hidden if Completed) */}
        {!isConnected && (
          <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
             <span className={`ic-status-pill ${status?.toLowerCase()}`}>
               {getUserFriendlyStatus(status)}
             </span>
          </div>
        )}

        {/* ACTION BUTTONS: Only show on Received Tab if it specifically waits for User Action */}
        {type === 'received' && status === 'PendingUser' && (
          <div className="ic-actions" style={{ marginTop: '15px' }}>
            <button onClick={() => onAction(item._id, 'accept')} className="ic-btn btn-accept">Accept</button>
            <button onClick={() => onAction(item._id, 'decline')} className="ic-btn btn-decline">Decline</button>
          </div>
        )}
      </div>
    );
  };

  const getDisplayData = () => {
    if (activeTab === 'received') {
      // Show requests sent TO me that are NOT finalized yet (includes PendingUser, AdminFinalizing, Declined)
      return receivedList
        .filter(i => i.status !== 'Finalized')
        .map(item => ({ ...item, profile: item.senderId, type: 'received' }));
    }
    if (activeTab === 'sent') {
      // Show requests sent BY me that are NOT finalized yet
      return sentList
        .filter(i => i.status !== 'Finalized')
        .map(item => ({ ...item, profile: item.receiverId || item.receiverProfile, type: 'sent' }));
    }
    if (activeTab === 'contacts') {
      // Finalized connections ONLY
      const acceptedSent = sentList.filter(i => i.status === 'Finalized').map(i => ({ ...i, profile: i.receiverId || i.receiverProfile }));
      const acceptedRec = receivedList.filter(i => i.status === 'Finalized').map(i => ({ ...i, profile: i.senderId }));
      return [...acceptedSent, ...acceptedRec].map(item => ({ ...item, type: 'contacts' }));
    }
    return [];
  };

  const displayData = getDisplayData();
  const pendingRequestsCount = receivedList.filter(i => i.status === 'PendingUser').length;

  return (
    <>
      <Navbar />
      <Toaster position="top-center" />

      <div className="ic-container">
        <div className="ic-nav-header">
          <h2 className="ic-title">My Network</h2>
          <div className="ic-tabs">
            <button className={`ic-tab ${activeTab === 'received' ? 'active' : ''}`} onClick={() => setActiveTab('received')}>
              Requests {pendingRequestsCount > 0 && <span className="ic-dot"></span>}
            </button>
            <button className={`ic-tab ${activeTab === 'sent' ? 'active' : ''}`} onClick={() => setActiveTab('sent')}>
              Sent
            </button>
            <button className={`ic-tab ${activeTab === 'contacts' ? 'active' : ''}`} onClick={() => setActiveTab('contacts')}>
              Contacts
            </button>
          </div>
        </div>

        <div className="ic-content">
          {loading ? (
            renderSkeleton()
          ) : displayData.length === 0 ? (
            <div className="ic-empty">
              <p>No {activeTab} connections found.</p>
            </div>
          ) : (
            <div className="ic-grid">
              {displayData.map((item) => (
                <Card key={item._id} item={item} profile={item.profile} status={item.status} type={item.type} onAction={handleRespond} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Interests;
