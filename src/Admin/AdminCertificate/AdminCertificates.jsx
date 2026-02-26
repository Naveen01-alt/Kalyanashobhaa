import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
// Import html2pdf for direct download (Requires: npm install html2pdf.js)
import html2pdf from "html2pdf.js"; 
import './AdminCertificates.css'; 

const AdminCertificates = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        "https://kalyanashobha-back.vercel.app/api/admin/users",
        { headers: { Authorization: token } }
      );
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: Generates PDF from HTML and downloads it directly
  const downloadCertificate = async (userId, userName) => {
    setProcessingId(userId);
    const loadToast = toast.loading("Downloading Certificate...");

    try {
      const token = localStorage.getItem("adminToken");

      // 1. Fetch the HTML content
      const response = await axios.get(
        `https://kalyanashobha-back.vercel.app/api/admin/user-certificate/${userId}`,
        {
          headers: { Authorization: token },
          responseType: "text", // We expect HTML string
        }
      );

      // 2. Create a temporary container for the HTML
      const element = document.createElement('div');
      element.innerHTML = response.data;
      
      // Optional: Add specific print styles to the container if needed
      element.style.width = '100%'; 
      
      // 3. Configure PDF options
      const options = {
        margin:       [10, 10],
        filename:     `${userName.replace(/\s+/g, '_')}_Certificate.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // 4. Generate and Save
      await html2pdf().set(options).from(element).save();

      toast.success("Download started!");

    } catch (error) {
      console.error(error);
      toast.error("Error generating PDF");
    } finally {
      toast.dismiss(loadToast);
      setProcessingId(null);
    }
  };

  return (
    <div className="admin-container">
      <h2 className="admin-title">User Certificates</h2>

      <div className="table-card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div> Loading user data...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Profile ID</th>
                  <th>User Name</th>
                  <th>Email Address</th>
                  <th>Legal Status</th>
                  <th style={{ textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td style={{ fontWeight: "600" }}>{user.uniqueId || "N/A"}</td>
                    <td>{user.firstName} {user.lastName}</td>
                    <td className="text-muted">{user.email}</td>
                    
                    {/* Status Badge */}
                    <td>
                      {user.digitalSignature ? (
                        <span className="badge badge-signed">✓ Signed</span>
                      ) : (
                        <span className="badge badge-pending">Pending</span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td style={{ textAlign: "center" }}>
                      {user.digitalSignature ? (
                        <button
                          className="btn-download"
                          onClick={() => downloadCertificate(user._id, user.firstName)}
                          disabled={processingId === user._id}
                        >
                          {processingId === user._id ? (
                             <span>Generating...</span>
                          ) : (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                              </svg>
                              Download PDF
                            </>
                          )}
                        </button>
                      ) : (
                        <button className="btn-disabled" disabled>
                          Not Available
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCertificates;
