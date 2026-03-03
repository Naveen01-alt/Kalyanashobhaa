import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { 
  Users, CreditCard, Heart, LogOut, Link as LinkIcon, 
  Plus, X, Clock, ChevronRight, Activity, Bell
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import './AgentPortal.css'; 

const API_BASE = "https://kalyanashobha-back.vercel.app/api/agent";
const PUBLIC_API_BASE = "https://kalyanashobha-back.vercel.app/api/public";

// --- CONSTANTS ---
const EDU_OPTIONS = [
  "B.Tech", "M.Tech", "MBA", "MCA", "MBBS", "MD", "B.Com", "M.Com", "B.Sc", "M.Sc", 
  "B.A", "M.A", "Ph.D", "Diploma", "Inter/12th", "SSC/10th", "Other"
];

// --- SKELETON LOADERS ---
const StatSkeleton = () => (
  <div className="ks-skeleton-grid">
    {[1, 2, 3].map((i) => (
      <div key={i} className="ks-skeleton-card">
        <div className="ks-sk-line short"></div>
        <div className="ks-sk-line big"></div>
      </div>
    ))}
  </div>
);

const TableSkeleton = () => (
  <div className="ks-skeleton-table">
    <div className="ks-sk-header"></div>
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="ks-sk-row">
        <div className="ks-sk-cell"></div>
        <div className="ks-sk-cell"></div>
        <div className="ks-sk-cell"></div>
      </div>
    ))}
  </div>
);

const AgentDashboard = () => {
  const navigate = useNavigate();

  // 1. State
  const [token, setToken] = useState(localStorage.getItem('agentToken'));
  const [agentInfo, setAgentInfo] = useState(JSON.parse(localStorage.getItem('agentInfo') || 'null'));
  const [activeTab, setActiveTab] = useState('overview'); 
  const [stats, setStats] = useState({ totalReferrals: 0, paidReferrals: 0, pendingApprovals: 0 });
  const [usersList, setUsersList] = useState([]);
  const [memPayments, setMemPayments] = useState([]);
  const [intPayments, setIntPayments] = useState([]);
  const [interestsStatus, setInterestsStatus] = useState([]); 
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Dynamic Community States
  const [masterCommunities, setMasterCommunities] = useState([]); 
  const [availableSubCommunities, setAvailableSubCommunities] = useState([]);

  // UI States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showImageModal, setShowImageModal] = useState(null); 
  const [regLoading, setRegLoading] = useState(false);

  // Registration Data - FULL STATE
  const [regData, setRegData] = useState({
    profileFor: 'Myself', firstName: '', lastName: '', gender: 'Male', dob: '', 
    maritalStatus: 'Never Married', height: '', diet: 'Veg',
    religion: 'Hindu', community: '', caste: '', subCommunity: '', 
    country: 'India', state: 'Telangana', city: '', 
    highestQualification: '', collegeName: '', workType: 'Private', 
    jobRole: '', companyName: '', annualIncome: '',
    mobileNumber: '', email: '', password: ''
  });
  
  

  // 2. Effects
  useEffect(()=>{setIsDrawerOpen(false);},
[activeTab]);
  useEffect(() => {
    if (!token) {
      navigate('/agent/login', { replace: true });
      return;
    }
    fetchAllData();
    fetchCommunities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  const fetchAllData = async () => {
    setDashboardLoading(true);
    try {
      const headers = { Authorization: token };
      const [sRes, uRes, mpRes, ipRes, isRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard/stats`, { headers }),
        fetch(`${API_BASE}/users`, { headers }), 
        fetch(`${API_BASE}/payments/registrations`, { headers }),
        fetch(`${API_BASE}/payments/interests`, { headers }),
        fetch(`${API_BASE}/users/interests`, { headers }) 
      ]);

      const [sData, uData, mpData, ipData, isData] = await Promise.all([
        sRes.json(), uRes.json(), mpRes.json(), ipRes.json(), isRes.json()
      ]);

      if(sData.success) setStats(sData.stats);
      if(uData.success) setUsersList(uData.users);
      if(mpData.success) setMemPayments(mpData.payments);
      if(ipData.success) setIntPayments(ipData.payments);
      if(isData.success) setInterestsStatus(isData.data);

    } catch (error) {
      console.error("Fetch Error", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setDashboardLoading(false);
    }
  };

  const fetchCommunities = async () => {
    try {
      const response = await fetch(`${PUBLIC_API_BASE}/get-all-communities`);
      const data = await response.json();
      if (data.success) {
        setMasterCommunities(data.data);
      }
    } catch (err) {
      console.error("Failed to load communities", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('agentToken');
    localStorage.removeItem('agentInfo');
    navigate('/agent/login', { replace: true });
  };

  const copyLink = () => {
    const link = `${window.location.origin}/registration?refId=${agentInfo?.id || agentInfo?._id}&refName=${encodeURIComponent(agentInfo?.name)}`;
    navigator.clipboard.writeText(link);
    toast.success("Referral Link Copied!"); 
  };

  const renderStatusBadge = (status, isBoolean = false) => {
    if (isBoolean) {
      return status ? <span className="ks-badge ks-badge-success">Active</span> : <span className="ks-badge ks-badge-pending">Pending</span>;
    }
    const s = status?.toLowerCase() || '';
    if (s.includes('success') || s.includes('accepted')) return <span className="ks-badge ks-badge-success">{status}</span>;
    if (s.includes('reject') || s.includes('decline')) return <span className="ks-badge ks-badge-danger">{status}</span>;
    return <span className="ks-badge ks-badge-pending">{status || 'Pending'}</span>;
  };

  const handleRegChange = (e) => {
    const { name, value } = e.target;

    if (name === 'community') {
      // Update community and reset caste/subcommunity
      setRegData({ ...regData, community: value, caste: '', subCommunity: '' });
      
      // Filter sub-communities based on selected community
      const found = masterCommunities.find(c => c.name === value);
      if (found) {
        setAvailableSubCommunities(found.subCommunities || []);
      } else {
        setAvailableSubCommunities([]);
      }
    } else {
      setRegData({ ...regData, [name]: value });
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    const toastId = toast.loading("Registering new client...");

    const payload = {
      ...regData,
      subCommunity: regData.caste, // Correcting subCommunity to match Caste
      height: parseFloat(regData.height) || 0,
      referredByAgentId: agentInfo?.id || agentInfo?._id,
      referredByAgentName: agentInfo?.name,
      referralType: "manual"
    };

    try {
      const res = await fetch(`${API_BASE}/register-user`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        toast.update(toastId, { render: "User Successfully Registered!", type: "success", isLoading: false, autoClose: 3000 });
        setIsDrawerOpen(false);
        // Reset to initial state
        setRegData({ 
          profileFor: 'Myself', firstName: '', lastName: '', gender: 'Male', dob: '', 
          maritalStatus: 'Never Married', height: '', diet: 'Veg',
          religion: 'Hindu', community: '', caste: '', subCommunity: '', 
          country: 'India', state: 'Telangana', city: '', 
          highestQualification: '', collegeName: '', workType: 'Private', 
          jobRole: '', companyName: '', annualIncome: '',
          mobileNumber: '', email: '', password: ''
        });
        setAvailableSubCommunities([]); // Reset available sub-communities
        fetchAllData(); 
      } else {
        toast.update(toastId, { render: data.message || "Registration Failed", type: "error", isLoading: false, autoClose: 3000 });
      }
    } catch (error) { 
        toast.update(toastId, { render: "Network Error", type: "error", isLoading: false, autoClose: 3000 });
    } finally { setRegLoading(false); }
  };

  if (!token) return null; 

  return (
    <div className="ks-crm-layout">
      <ToastContainer position="top-center" theme="colored" />

      {/* --- MOBILE HEADER (Visible only on Mobile) --- */}
      <header className="ks-mobile-header">
        <div className="ks-mob-brand">
          <div className="ks-brand-logo">K</div>
          <span className="ks-mob-title">Agent Portal</span>
        </div>
        <button className="ks-mob-logout" onClick={handleLogout}>
          <LogOut size={20} />
        </button>
      </header>

      {/* --- SIDEBAR / BOTTOM NAV --- */}
      <aside className="ks-crm-sidebar">
        <div className="ks-sidebar-brand desktop-only">
          <div className="ks-brand-logo">K</div>
          <div className="ks-brand-text">
            <h2>KalyanaShobha</h2>
            <span>Agent Portal</span>
          </div>
        </div>

        <div className="ks-agent-identity desktop-only">
          <div className="ks-agent-avatar">{agentInfo?.name?.charAt(0) || 'A'}</div>
          <div className="ks-agent-meta">
            <span className="ks-agent-name">{agentInfo?.name}</span>
            <span className="ks-agent-id">ID: {agentInfo?.agentCode || 'AGENT'}</span>
          </div>
        </div>

        <nav className="ks-sidebar-nav">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            <Clock size={20} /> <span>Overview</span>
          </button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
            <Users size={20} /> <span>Directory</span>
          </button>
          <button className={activeTab === 'mem_payments' ? 'active' : ''} onClick={() => setActiveTab('mem_payments')}>
            <CreditCard size={20} /> <span>Membership</span>
          </button>
          <button className={activeTab === 'int_payments' ? 'active' : ''} onClick={() => setActiveTab('int_payments')}>
            <Heart size={20} /> <span>Requests</span>
          </button>
          <button className={activeTab === 'int_status' ? 'active' : ''} onClick={() => setActiveTab('int_status')}>
            <Activity size={20} /> <span>Activity</span>
          </button>
        </nav>

        <div className="ks-sidebar-footer desktop-only">
          <button className="ks-logout-btn" onClick={handleLogout}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="ks-crm-main">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="ks-animate-fade">
            <header className="ks-page-header">
              <h1>Dashboard Overview</h1>
              <button className="ks-btn-outline" onClick={copyLink}>
                <LinkIcon size={16} /> <span className="desktop-text">Copy Invite Link</span><span className="mobile-text">Copy Link</span>
              </button>
            </header>

            {dashboardLoading ? <StatSkeleton /> : (
              <div className="ks-metric-grid">
                 <div className="ks-metric-card">
                    <span className="ks-metric-label">Total Referrals</span>
                    <span className="ks-metric-val">{stats.totalReferrals}</span>
                 </div>
                 <div className="ks-metric-card">
                    <span className="ks-metric-label">Paid Conversions</span>
                    <span className="ks-metric-val text-gold">{stats.paidReferrals}</span>
                 </div>
                 <div className="ks-metric-card">
                    <span className="ks-metric-label">Pending Action</span>
                    <span className="ks-metric-val text-danger">{stats.pendingApprovals}</span>
                 </div>
              </div>
            )}
          </div>
        )}

        {/* DIRECTORY TAB */}
        {activeTab === 'users' && (
          <div className="ks-animate-fade">
            <header className="ks-page-header">
               <h1>Client Directory</h1>
               <button className="ks-btn-primary" onClick={() => setIsDrawerOpen(true)}>
                 <Plus size={16} /> <span>Register Client</span>
               </button>
            </header>

            {dashboardLoading ? <TableSkeleton /> : (
              <div className="ks-data-table-wrapper">
                <table className="ks-data-table">
                  <thead><tr><th>Client Profile</th><th>Contact</th><th>Status</th><th>Registered</th></tr></thead>
                  <tbody>
                    {usersList.length === 0 && <tr><td colSpan="4" className="ks-empty">No clients found.</td></tr>}
                    {usersList.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div className="ks-cell-primary">{u.firstName} {u.lastName}</div>
                          <div className="ks-cell-secondary">{u.uniqueId}</div>
                        </td>
                        <td>
                          <div className="ks-cell-primary">{u.mobileNumber}</div>
                        </td>
                        <td>{renderStatusBadge(u.isPaidMember, true)}</td>
                        <td className="ks-cell-secondary">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MEMBERSHIP PAYMENTS */}
        {activeTab === 'mem_payments' && (
          <div className="ks-animate-fade">
            <header className="ks-page-header"><h1>Membership Log</h1></header>

            {dashboardLoading ? <TableSkeleton /> : (
              <div className="ks-data-table-wrapper">
                <table className="ks-data-table">
                  <thead><tr><th>Client</th><th>Amount</th><th>UTR / Ref</th><th>Proof</th><th>Status</th></tr></thead>
                  <tbody>
                    {memPayments.length === 0 && <tr><td colSpan="5" className="ks-empty">No transactions.</td></tr>}
                    {memPayments.map(p => (
                      <tr key={p._id}>
                        <td className="ks-cell-primary">{p.userId?.firstName} {p.userId?.lastName}</td>
                        <td className="ks-cell-primary">₹{p.amount?.toLocaleString()}</td>
                        <td className="ks-font-mono">{p.utrNumber}</td>
                        <td><button className="ks-link-btn" onClick={() => setShowImageModal(p.screenshotUrl)}>View</button></td>
                        <td>{renderStatusBadge(p.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* INTEREST PAYMENTS */}
        {activeTab === 'int_payments' && (
          <div className="ks-animate-fade">
            <header className="ks-page-header"><h1>Interest Payments</h1></header>

            {dashboardLoading ? <TableSkeleton /> : (
              <div className="ks-data-table-wrapper">
                <table className="ks-data-table">
                  <thead><tr><th>From</th><th>To</th><th>Amount</th><th>Proof</th><th>Status</th></tr></thead>
                  <tbody>
                    {intPayments.length === 0 && <tr><td colSpan="5" className="ks-empty">No transactions.</td></tr>}
                    {intPayments.map(p => (
                      <tr key={p._id}>
                        <td className="ks-cell-primary">{p.senderId?.firstName}</td>
                        <td className="ks-cell-primary">{p.receiverId?.firstName}</td>
                        <td className="ks-cell-primary">₹{p.amount?.toLocaleString()}</td>
                        <td><button className="ks-link-btn" onClick={() => setShowImageModal(p.screenshotUrl)}>View</button></td>
                        <td>{renderStatusBadge(p.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* INTEREST STATUS */}
        {activeTab === 'int_status' && (
          <div className="ks-animate-fade">
            <header className="ks-page-header"><h1>Match Activity</h1></header>

            {dashboardLoading ? <TableSkeleton /> : (
              <div className="ks-data-table-wrapper">
                <table className="ks-data-table">
                  <thead><tr><th>Direction</th><th>My Client</th><th>Match Profile</th><th>Date</th><th>Status</th></tr></thead>
                  <tbody>
                    {interestsStatus.length === 0 && <tr><td colSpan="5" className="ks-empty">No activity.</td></tr>}
                    {interestsStatus.map(item => (
                      <tr key={item.interestId}>
                        <td>
                          <span className={`ks-dir-badge ${item.direction === 'Sent' ? 'sent' : 'received'}`}>
                            {item.direction === 'Sent' ? '↗' : '↙'}
                          </span>
                        </td>
                        <td>
                          <div className="ks-cell-primary">{item.myClient?.firstName} {item.myClient?.lastName}</div>
                          <div className="ks-cell-secondary">{item.myClient?.uniqueId}</div>
                        </td>
                        <td>
                          <div className="ks-cell-primary">{item.matchProfile?.firstName} {item.matchProfile?.lastName}</div>
                          <div className="ks-cell-secondary">{item.matchProfile?.uniqueId}</div>
                        </td>
                        <td className="ks-cell-secondary">
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td>{renderStatusBadge(item.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* --- REGISTRATION DRAWER --- */}
      <div className={`ks-drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)}></div>
      <div className={`ks-drawer-panel ${isDrawerOpen ? 'open' : ''}`} >
        
        <div className="ks-drawer-header">
          <div><h2>New Registration</h2><p>Add new profile</p></div>
          <button className="ks-icon-btn" onClick={() => setIsDrawerOpen(false)}><X size={24} /></button>
        </div>

        <div className="ks-drawer-body">
          <form id="ks-agent-reg-form" onSubmit={handleRegisterSubmit}>
            
            {/* 1. Account */}
            <div className="ks-form-section">
              <h3>Account Credentials</h3>
              <div className="ks-form-grid">
                <div className="ks-input-wrap"><label>Email Address</label><input type="email" name="email" value={regData.email} onChange={handleRegChange} required /></div>
                <div className="ks-input-wrap"><label>Mobile Number</label><input type="tel" name="mobileNumber" value={regData.mobileNumber} onChange={handleRegChange} required /></div>
                <div className="ks-input-wrap ks-col-span-2"><label>Temporary Password</label><input type="text" name="password" value={regData.password} onChange={handleRegChange} required /></div>
              </div>
            </div>

            {/* 2. Personal */}
            <div className="ks-form-section">
              <h3>Personal Details</h3>
              <div className="ks-form-grid">
                <div className="ks-input-wrap"><label>Profile For</label><select name="profileFor" value={regData.profileFor} onChange={handleRegChange}><option>Myself</option><option>Son</option><option>Daughter</option><option>Brother</option><option>Sister</option><option>Relative</option><option>Client</option></select></div>
                <div className="ks-input-wrap"><label>Gender</label><select name="gender" value={regData.gender} onChange={handleRegChange}><option>Male</option><option>Female</option></select></div>
                <div className="ks-input-wrap"><label>First Name</label><input type="text" name="firstName" value={regData.firstName} onChange={handleRegChange} required /></div>
                <div className="ks-input-wrap"><label>Last Name</label><input type="text" name="lastName" value={regData.lastName} onChange={handleRegChange} required /></div>
                <div className="ks-input-wrap"><label>DOB</label><input type="date" name="dob" value={regData.dob} onChange={handleRegChange} required /></div>
                <div className="ks-input-wrap"><label>Height (e.g. 5.8)</label><input type="number" step="0.1" name="height" value={regData.height} onChange={handleRegChange} required /></div>
                <div className="ks-input-wrap"><label>Marital Status</label><select name="maritalStatus" value={regData.maritalStatus} onChange={handleRegChange}><option>Never Married</option><option>Divorced</option><option>Widowed</option></select></div>
                <div className="ks-input-wrap"><label>Diet</label><select name="diet" value={regData.diet} onChange={handleRegChange}><option>Veg</option><option>Non-Veg</option><option>Eggetarian</option></select></div>
              </div>
            </div>

            {/* 3. Cultural - DYNAMIC DATA BINDING HERE */}
            <div className="ks-form-section">
              <h3>Socio-Cultural</h3>
              <div className="ks-form-grid">
                <div className="ks-input-wrap">
                  <label>Religion</label>
                  <select name="religion" value={regData.religion} onChange={handleRegChange}>
                    <option>Hindu</option><option>Muslim</option><option>Christian</option><option>Sikh</option><option>Other</option>
                  </select>
                </div>
                <div className="ks-input-wrap">
                  <label>Community</label>
                  <select name="community" value={regData.community} onChange={handleRegChange} required>
                    <option value="" disabled>Select Community</option>
                    {masterCommunities.map((c, idx) => (
                      <option key={idx} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="ks-input-wrap ks-col-span-2">
                  <label>Caste / Sub-Community</label>
                  <select name="caste" value={regData.caste} onChange={handleRegChange} required>
                    <option value="" disabled>Select Caste</option>
                    {availableSubCommunities.map((sub, idx) => {
                      const val = typeof sub === 'string' ? sub : sub.name;
                      return <option key={idx} value={val}>{val}</option>;
                    })}
                  </select>
                </div>
              </div>
            </div>

            {/* 4. Professional */}
            <div className="ks-form-section">
              <h3>Education & Career</h3>
              <div className="ks-form-grid">
                <div className="ks-input-wrap"><label>Education</label><select name="highestQualification" value={regData.highestQualification} onChange={handleRegChange}><option value="">Select</option>{EDU_OPTIONS.map(o=><option key={o}>{o}</option>)}</select></div>
                <div className="ks-input-wrap"><label>College/University</label><input type="text" name="collegeName" value={regData.collegeName} onChange={handleRegChange} /></div>
                <div className="ks-input-wrap"><label>Work Sector</label><select name="workType" value={regData.workType} onChange={handleRegChange}><option>Private</option><option>Government</option><option>Business</option><option>Self-Employed</option></select></div>
                <div className="ks-input-wrap"><label>Job Role</label><input type="text" name="jobRole" value={regData.jobRole} onChange={handleRegChange} /></div>
                <div className="ks-input-wrap"><label>Company Name</label><input type="text" name="companyName" value={regData.companyName} onChange={handleRegChange} /></div>
                <div className="ks-input-wrap"><label>Annual Income</label><input type="text" name="annualIncome" placeholder="e.g. 6-8 LPA" value={regData.annualIncome} onChange={handleRegChange} /></div>
              </div>
            </div>

            {/* 5. Location */}
            <div className="ks-form-section">
              <h3>Current Location</h3>
              <div className="ks-form-grid">
                <div className="ks-input-wrap"><label>Country</label><input type="text" name="country" value={regData.country} onChange={handleRegChange} /></div>
                <div className="ks-input-wrap"><label>State</label><input type="text" name="state" value={regData.state} onChange={handleRegChange} required /></div>
                <div className="ks-input-wrap ks-col-span-2"><label>City</label><input type="text" name="city" value={regData.city} onChange={handleRegChange} required /></div>
              </div>
            </div>

          </form>
        </div>

        <div className="ks-drawer-footer">
          <button className="ks-btn-outline" onClick={() => setIsDrawerOpen(false)}>Cancel</button>
          <button type="submit" form="ks-agent-reg-form" className="ks-btn-primary" disabled={regLoading}>{regLoading ? 'Processing...' : 'Register'}</button>
        </div>
      </div>

      {/* MODAL */}
      {showImageModal && (
        <div className="ks-modal-overlay" onClick={() => setShowImageModal(null)}>
          <div className="ks-image-modal">
            <button className="ks-close-abs" onClick={() => setShowImageModal(null)}><X size={24} /></button>
            <img src={showImageModal} alt="Proof" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
