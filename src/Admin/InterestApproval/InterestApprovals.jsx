import React, { useState, useEffect } from "react";
import { Check, X, Eye, Clock, ArrowRight, Filter, RefreshCw, User } from "lucide-react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import the CSS file
import "./InterestApprovals.css"; 

export default function InterestApprovals() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PendingPaymentVerification"); 
  const [selectedImage, setSelectedImage] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // Fetch Data
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        `https://kalyanashobha-back.vercel.app/api/admin/interest/requests?status=${activeTab}`,
        { headers: { Authorization: token } }
      );
      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching interests", error);
      toast.error("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const handleFullApproval = async (paymentId, interestId) => {
    setProcessingId(paymentId);
    const toastId = toast.loading("Verifying payment & approving...");

    const token = localStorage.getItem("adminToken");
    const headers = { Authorization: token };

    try {
      // STEP 1: Verify Payment
      await axios.post(
        "https://kalyanashobha-back.vercel.app/api/admin/payment/interest/verify",
        { paymentId, action: "approve" },
        { headers }
      );

      // STEP 2: Approve Content
      if (interestId) {
        await axios.post(
          "https://kalyanashobha-back.vercel.app/api/admin/interest/approve-content",
          { interestId, action: "approve" },
          { headers }
        );
      }

      toast.update(toastId, { 
        render: "Request Approved Successfully", 
        type: "success", 
        isLoading: false, 
        autoClose: 3000 
      });

      fetchRequests(); 
      window.dispatchEvent(new Event("interestUpdated")); 

    } catch (error) {
      toast.update(toastId, { 
        render: "Action failed. Please try again.", 
        type: "error", 
        isLoading: false, 
        autoClose: 3000 
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejection = async (paymentId) => {
    setProcessingId(paymentId);
    const toastId = toast.loading("Rejecting request...");

    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        "https://kalyanashobha-back.vercel.app/api/admin/payment/interest/verify",
        { paymentId, action: "reject" },
        { headers: { Authorization: token } }
      );

      toast.update(toastId, { 
        render: "Request Rejected", 
        type: "success", 
        isLoading: false, 
        autoClose: 3000 
      });

      fetchRequests();
      window.dispatchEvent(new Event("interestUpdated"));
    } catch (error) {
      toast.update(toastId, { 
        render: "Rejection failed", 
        type: "error", 
        isLoading: false, 
        autoClose: 3000 
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="ia-layout">
      <ToastContainer position="top-right" theme="colored" />

      {/* HEADER */}
      <div className="ia-header">
        <div className="ia-title-group">
            <h2>Interest Request Approvals</h2>
            <p>Verify payment proofs and forward interest requests to users.</p>
        </div>
        <button className="ia-refresh-btn" onClick={fetchRequests}>
            <RefreshCw size={14}/> Refresh
        </button>
      </div>

      {/* TABS */}
      <div className="ia-tabs-container">
        <div className="ia-tabs">
            <button 
                className={`ia-tab ${activeTab === "PendingPaymentVerification" ? "active" : ""}`} 
                onClick={() => setActiveTab("PendingPaymentVerification")}
            >
            Pending Review
            {activeTab === "PendingPaymentVerification" && <span className="ia-tab-dot"></span>}
            </button>
            <button 
                className={`ia-tab ${activeTab === "Success" ? "active" : ""}`} 
                onClick={() => setActiveTab("Success")}
            >
            Approved History
            </button>
            <button 
                className={`ia-tab ${activeTab === "Rejected" ? "active" : ""}`} 
                onClick={() => setActiveTab("Rejected")}
            >
            Rejected
            </button>
        </div>
      </div>

      {/* CONTENT TABLE */}
      <div className="ia-content">
        {loading ? (
            /* SKELETON LOADER */
           <div className="ia-skeleton-stack">
              {[1, 2, 3, 4].map(i => (
                  <div key={i} className="ia-skeleton-row">
                      <div className="sk-box sk-date"></div>
                      <div className="sk-box sk-flow"></div>
                      <div className="sk-box sk-amount"></div>
                      <div className="sk-box sk-action"></div>
                  </div>
              ))}
           </div>
        ) : requests.length === 0 ? (
          <div className="ia-empty-state">
             <div className="ia-empty-icon"><Filter size={32}/></div>
             <h3>No requests found</h3>
             <p>There are no {activeTab === 'PendingPaymentVerification' ? 'pending' : activeTab.toLowerCase()} requests.</p>
          </div>
        ) : (
          <div className="ia-table-container">
            <table className="ia-table">
                <thead>
                <tr>
                    <th>Date</th>
                    <th>Transaction Flow (Sender → Receiver)</th>
                    <th>Amount</th>
                    <th>Payment Proof</th>
                    <th>Status</th>
                    {activeTab === "PendingPaymentVerification" && <th align="right">Actions</th>}
                </tr>
                </thead>
                <tbody>
                {requests.map((req) => (
                    <tr key={req._id} className={processingId === req._id ? "ia-row-processing" : ""}>
                    <td data-label="Date">
                        <div className="ia-date-cell">
                            <Clock size={14} className="ia-icon-sub"/>
                            <span className="ia-date-text">
                                {new Date(req.date).toLocaleDateString()}
                                <small>{new Date(req.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                            </span>
                        </div>
                    </td>
                    <td data-label="Flow">
                        <div className="ia-flow-cell">
                             <div className="ia-user-mini">
                                <div className="ia-avatar-xs">{req.sender?.firstName?.[0] || "S"}</div>
                                <div className="ia-user-text">
                                    <span className="name">{req.sender?.firstName}</span>
                                    <span className="id">{req.sender?.uniqueId}</span>
                                </div>
                             </div>
                             <div className="ia-flow-arrow"><ArrowRight size={14}/></div>
                             <div className="ia-user-mini">
                                <div className="ia-avatar-xs receiver">{req.receiver?.firstName?.[0] || "R"}</div>
                                <div className="ia-user-text">
                                    <span className="name">{req.receiver?.firstName}</span>
                                    <span className="id">{req.receiver?.uniqueId}</span>
                                </div>
                             </div>
                        </div>
                    </td>
                    <td data-label="Amount">
                        <div className="ia-amount-badge">
                           Rs. {req.amount?.toLocaleString()}
                        </div>
                    </td>
                    <td data-label="Proof">
                        <div className="ia-proof-group">
                            <span className="ia-utr">UTR: {req.utrNumber}</span>
                            <button 
                                className="ia-view-btn" 
                                onClick={() => setSelectedImage(req.screenshotUrl)}
                            >
                                <Eye size={12} /> Check Screen
                            </button>
                        </div>
                    </td>
                    <td data-label="Status">
                        <span className={`ia-status-badge ${req.status}`}>
                           {req.status === 'PendingPaymentVerification' ? 'Review Needed' : req.status}
                        </span>
                    </td>

                    {activeTab === "PendingPaymentVerification" && (
                        <td data-label="Actions" align="right">
                        <div className="ia-actions">
                            <button 
                                className="ia-btn-approve" 
                                onClick={() => handleFullApproval(req._id, req.interestId)}
                                disabled={processingId === req._id}
                                title="Approve"
                            >
                                {processingId === req._id ? <div className="spinner-sm"></div> : <Check size={18} />}
                            </button>
                            <button 
                                className="ia-btn-reject" 
                                onClick={() => handleRejection(req._id)}
                                disabled={processingId === req._id}
                                title="Reject"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        </td>
                    )}
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        )}
      </div>

      {/* IMAGE MODAL */}
      {selectedImage && (
        <div className="ia-modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="ia-modal-anim">
            <div className="ia-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="ia-modal-header">
                    <h3>Payment Screenshot</h3>
                    <button className="ia-modal-close" onClick={() => setSelectedImage(null)}>
                        <X size={20}/>
                    </button>
                </div>
                <div className="ia-modal-body">
                    <img src={selectedImage} alt="Proof" />
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
