import React, { useState, useEffect } from 'react';
import "./Payments.css";
import Navbar from "../../Components/Navbar.jsx";

// --- SKELETON LOADER ---
const PaymentSkeleton = () => (
  <div className="pmt-content">
    <div className="pmt-row pmt-header-row skeleton-header">
      <div className="skeleton-line shimmer" style={{width: '60px'}}></div>
      <div className="skeleton-line shimmer" style={{width: '80px'}}></div>
      <div className="skeleton-line shimmer" style={{width: '120px'}}></div>
      <div className="skeleton-line shimmer" style={{width: '80px'}}></div>
    </div>
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="pmt-row pmt-data-row skeleton-row">
        <div className="pmt-col"><div className="skeleton-line shimmer" style={{width: '80px', height: '14px'}}></div></div>
        <div className="pmt-col"><div className="skeleton-line shimmer" style={{width: '60px', height: '14px'}}></div></div>
        <div className="pmt-col"><div className="skeleton-line shimmer" style={{width: '100px', height: '14px'}}></div></div>
        <div className="pmt-col"><div className="skeleton-line shimmer" style={{width: '70px', height: '24px', borderRadius: '12px'}}></div></div>
      </div>
    ))}
  </div>
);

const Payments = () => {
  const [activeTab, setActiveTab] = useState('membership'); 
  const [history, setHistory] = useState({ membership: [], interest: [] });
  const [loading, setLoading] = useState(true);

  const API_BASE = "https://kalyanashobha-back.vercel.app/api";

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/user/payment-history`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token 
        }
      });
      const data = await res.json();
      if (data.success) {
        setHistory({
          membership: data.membershipHistory || [],
          interest: data.interestHistory || []
        });
      }
    } catch (err) {
      console.error("Network Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentList = activeTab === 'membership' ? history.membership : history.interest;

  const getStatusType = (status) => {
    const s = status ? status.toLowerCase() : 'pending';
    if (['success', 'approved', 'paid', 'completed'].includes(s)) return 'success';
    if (['failed', 'rejected', 'cancelled'].includes(s)) return 'failed';
    return 'pending';
  };

  return (
    <>
      <Navbar/>

      <div className="pmt-dashboard fade-in">
        
        {/* Header Section */}
        <div className="pmt-header">
          <h2 className="pmt-title">Transaction History</h2>
          
          <div className="pmt-tabs-wrapper">
            <button 
              className={`pmt-tab ${activeTab === 'membership' ? 'active' : ''}`} 
              onClick={() => setActiveTab('membership')}
            >
              Membership
            </button>
            <button 
              className={`pmt-tab ${activeTab === 'interest' ? 'active' : ''}`} 
              onClick={() => setActiveTab('interest')}
            >
              Interest Requests
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="pmt-table-container">
          
          {loading ? (
            <PaymentSkeleton />
          ) : (
            <div className="pmt-content">
              
              {/* Desktop Table Header */}
              <div className="pmt-row pmt-header-row">
                <div className="pmt-col pmt-col-date">Date</div>
                <div className="pmt-col pmt-col-amount">Amount</div>
                <div className="pmt-col pmt-col-ref">Reference ID</div>
                {activeTab === 'interest' && <div className="pmt-col pmt-col-user">Recipient</div>}
                <div className="pmt-col pmt-col-status">Status</div>
              </div>

              {/* Data Rows */}
              {currentList.length > 0 ? (
                currentList.map((pay) => (
                  <div key={pay._id} className="pmt-row pmt-data-row">
                    
                    {/* Date */}
                    <div className="pmt-col pmt-col-date" data-label="Date">
                      <div className="pmt-cell-wrap">
                        <span className="pmt-text-primary">
                          {pay.date ? new Date(pay.date).toLocaleDateString('en-IN', { 
                            day: 'numeric', month: 'short', year: 'numeric'
                          }) : '-'}
                        </span>
                        <span className="pmt-text-secondary">
                          {pay.date ? new Date(pay.date).toLocaleTimeString('en-IN', { 
                            hour: '2-digit', minute:'2-digit'
                          }) : ''}
                        </span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="pmt-col pmt-col-amount" data-label="Amount">
                      <div className="pmt-cell-wrap">
                        <span className="pmt-amount">
                          ₹{parseFloat(pay.amount).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Reference */}
                    <div className="pmt-col pmt-col-ref" data-label="Reference ID">
                      <div className="pmt-cell-wrap">
                        <span className="pmt-ref-badge">{pay.utrNumber || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Recipient (Conditional) */}
                    {activeTab === 'interest' && (
                      <div className="pmt-col pmt-col-user" data-label="Recipient">
                        <div className="pmt-cell-wrap">
                          <span className="pmt-text-primary">{pay.receiverId?.firstName || "Unknown"}</span>
                        </div>
                      </div>
                    )}

                    {/* Status */}
                    <div className="pmt-col pmt-col-status" data-label="Status">
                      <div className="pmt-cell-wrap">
                        <span className={`pmt-status-pill ${getStatusType(pay.status)}`}>
                          {pay.status || 'Pending'}
                        </span>
                      </div>
                    </div>

                  </div>
                ))
              ) : (
                <div className="pmt-empty-state">
                  <p>No transaction history found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Payments;
