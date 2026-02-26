import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from "../Components/Navbar.jsx";
import './Interests.css';

const Interests = () => {
  const [activeTab, setActiveTab] = useState('received'); // received | sent | accepted
  const [sentList, setSentList] = useState([]);
  const [receivedList, setReceivedList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Neutral Gender Avatar
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
        fetch(`${API_BASE}/interests/sent`, { 
          headers: { 'Content-Type': 'application/json', 'Authorization': token } 
        }),
        fetch(`${API_BASE}/interests/received`, { 
          headers: { 'Content-Type': 'application/json', 'Authorization': token } 
        })
      ]);

      const dataSent = await resSent.json();
      const dataRec = await resRec.json();

      if (dataSent.success) setSentList(dataSent.data || []);
      if (dataRec.success) setReceivedList(dataRec.data || []);

    } catch (err) {
      console.error("Error fetching interests:", err);
      if (!isBackground) toast.error("Could not load data");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (interestId, action) => {
    // Custom Toast with Confirmation
    toast((t) => (
      <div className="toast-confirm">
        <span>{action === 'accept' ? 'Accept' : 'Decline'} this request?</span>
        <div className="toast-actions">
          <button 
            className="toast-btn confirm"
            onClick={() => performAction(interestId, action, t.id)}
          >
            Yes
          </button>
          <button 
            className="toast-btn cancel"
            onClick={() => toast.dismiss(t.id)}
          >
            No
          </button>
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
        fetchInterests(true); // Background refresh
      } else {
        toast.error(data.message || "Action failed", { id: loadingToast });
      }
    } catch (err) {
      toast.error("Network error", { id: loadingToast });
    }
  };

  // --- RENDER HELPERS ---

  const renderSkeleton = () => {
    return (
      <div className="ic-grid">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="ic-card skeleton-card">
            <div className="sk-header">
              <div className="sk-avatar shimmer"></div>
              <div className="sk-info">
                <div className="sk-line w-60 shimmer"></div>
                <div className="sk-line w-40 shimmer"></div>
              </div>
            </div>
            <div className="sk-body">
              <div className="sk-line w-80 shimmer"></div>
              <div className="sk-line w-50 shimmer"></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const Card = ({ profile, status, type, onAction, item }) => {
    const isAccepted = status === 'Accepted';
    
    return (
      <div className="ic-card fade-in">
        <div className="ic-header">
          <img 
            src={profile?.avatar || neutralAvatar} 
            alt="User" 
            className="ic-avatar" 
          />
          <div className="ic-user-info">
            <h3 className="ic-name">{profile?.firstName || profile?.name || "Unknown"} {profile?.lastName || ""}</h3>
            <p className="ic-role">{profile?.jobRole || "Member"}</p>
            {isAccepted && <span className="ic-badge connected">Connected</span>}
          </div>
        </div>

        <div className="ic-body">
       
          <div className="ic-row">
            <span className="ic-label">ID</span>
            <span className="ic-value highlight">{profile?.uniqueId || "N/A"}</span>
          </div>
          
          {isAccepted && (
             <>
               <div className="ic-row">
                 <span className="ic-label">Mobile</span>
                 <span className="ic-value">{profile?.mobileNumber || profile?.mobile || "Hidden"}</span>
               </div>
               <div className="ic-row">
                 <span className="ic-label">Email</span>
                 <span className="ic-value small-text">{profile?.email || "Hidden"}</span>
               </div>
             </>
          )}

          {type === 'sent' && !isAccepted && (
            <div className="ic-row">
               <span className="ic-label">Status</span>
               <span className={`ic-status-pill ${status?.toLowerCase()}`}>{status}</span>
            </div>
          )}
        </div>

        {type === 'received' && !isAccepted && (
          <div className="ic-actions">
            <button onClick={() => onAction(item._id, 'accept')} className="ic-btn btn-accept">Accept</button>
            <button onClick={() => onAction(item._id, 'decline')} className="ic-btn btn-decline">Decline</button>
          </div>
        )}
      </div>
    );
  };

  const getDisplayData = () => {
    if (activeTab === 'received') {
      return receivedList.filter(i => i.status !== 'Accepted').map(item => ({
        ...item, profile: item.senderId, type: 'received'
      }));
    }
    if (activeTab === 'sent') {
      return sentList.filter(i => i.status !== 'Accepted').map(item => ({
        ...item, profile: item.receiverProfile, type: 'sent'
      }));
    }
    if (activeTab === 'accepted') {
      const acceptedSent = sentList.filter(i => i.status === 'Accepted').map(i => ({ ...i, profile: i.receiverProfile }));
      const acceptedRec = receivedList.filter(i => i.status === 'Accepted').map(i => ({ ...i, profile: i.senderId }));
      return [...acceptedSent, ...acceptedRec].map(item => ({ ...item, type: 'accepted' }));
    }
    return [];
  };

  const displayData = getDisplayData();

  return (
    <>
      <Navbar />
      <Toaster position="top-center" />
      
      <div className="ic-container">
        <div className="ic-nav-header">
          <h2 className="ic-title">My Network</h2>
          <div className="ic-tabs">
            <button 
              className={`ic-tab ${activeTab === 'received' ? 'active' : ''}`} 
              onClick={() => setActiveTab('received')}
            >
              Requests {receivedList.filter(i => i.status !== 'Accepted').length > 0 && <span className="ic-dot"></span>}
            </button>
            <button 
              className={`ic-tab ${activeTab === 'sent' ? 'active' : ''}`} 
              onClick={() => setActiveTab('sent')}
            >
              Sent
            </button>
            <button 
              className={`ic-tab ${activeTab === 'accepted' ? 'active' : ''}`} 
              onClick={() => setActiveTab('accepted')}
            >
              Contacts
            </button>
          </div>
        </div>

        <div className="ic-content">
          {loading ? (
            renderSkeleton()
          ) : displayData.length === 0 ? (
            <div className="ic-empty">
              <p>No connections found.</p>
            </div>
          ) : (
            <div className="ic-grid">
              {displayData.map((item) => (
                <Card 
                  key={item._id} 
                  item={item}
                  profile={item.profile} 
                  status={item.status} 
                  type={item.type} 
                  onAction={handleRespond} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Interests;
