import React, { useState, useEffect } from 'react';
import Navbar from "../../Components/Navbar.jsx";
import toast, { Toaster } from 'react-hot-toast'; 
import './MyProfile.css';

// --- SKELETON LOADER ---
const ProfileSkeleton = () => (
  <div className="mp-container fade-in">
    <div className="mp-profile-sheet skeleton-sheet">
      <div className="mp-sheet-header">
        <div className="skeleton-avatar shimmer"></div>
        <div className="mp-header-text">
          <div className="skeleton-line title shimmer"></div>
          <div className="skeleton-line subtitle shimmer"></div>
        </div>
      </div>
      <div className="mp-divider"></div>
      <div className="mp-sheet-body">
        {[1, 2].map((section) => (
          <div key={section} className="mp-section-wrapper">
            <div className="skeleton-line section-title shimmer"></div>
            <div className="mp-details-grid">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="mp-data-field">
                  <div className="skeleton-line label shimmer"></div>
                  <div className="skeleton-line value shimmer"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MyProfile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  const API_BASE = "https://kalyanashobha-back.vercel.app/api/user";

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/my-profile`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': token }
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setFormData(data.user);
      }
    } catch (err) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const toastId = toast.loading("Updating profile...");

    try {
      const res = await fetch(`${API_BASE}/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        setUser(data.user);
        setIsEditing(false);
        toast.success("Profile updated successfully!", { id: toastId });
      } else {
        toast.error(data.message || "Update failed", { id: toastId });
      }
    } catch (err) {
      toast.error("Network error occurred", { id: toastId });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    return Math.abs(new Date(Date.now() - birthDate.getTime()).getUTCFullYear() - 1970);
  };

  return (
    <>
      <Navbar/>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: { fontFamily: "'Poppins', sans-serif", fontSize: '14px', color: '#1F2937' },
          success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
          error: { iconTheme: { primary: '#D32F2F', secondary: '#fff' } }
        }}
      />

      {loading ? (
        <ProfileSkeleton />
      ) : (
        <div className="mp-container fade-in">
          
          <div className="mp-profile-sheet">
            
            {/* 1. Header Section */}
            <div className="mp-sheet-header">
              <div className="mp-avatar-group">
                <img 
                  src={user?.photos?.[0] || "https://via.placeholder.com/150"} 
                  alt="Profile" 
                  className="mp-sheet-avatar" 
                />
                
                {/* Green Tick Icon (Only visual indicator of verification) */}
                {user?.isPaidMember && (
                  <div className="mp-verified-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="mp-header-text">
                <div className="mp-title-row">
                  <h1 className="mp-sheet-name">{user?.firstName} {user?.lastName}</h1>
                  {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="mp-icon-btn" title="Edit Profile">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                  )}
                </div>
                
                <div className="mp-meta-info">
                  <span className="mp-meta-item">ID: {user?.uniqueId || 'N/A'}</span>
                  {/* Pending/Verified Text Status removed completely as requested */}
                </div>
                
                {/* About Me Section Removed */}
              </div>
            </div>

            <div className="mp-divider"></div>

            {/* 2. Body Section */}
            <div className="mp-sheet-body">
              {!isEditing ? (
                /* --- VIEW MODE --- */
                <>
                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Basic Information</h3>
                    <div className="mp-details-grid">
                      <div className="mp-data-field">
                        <label>Age / DOB</label>
                        <p>{calculateAge(user?.dob)} Years <span className="text-muted">({new Date(user?.dob).toLocaleDateString()})</span></p>
                      </div>
                      <div className="mp-data-field">
                        <label>Gender</label>
                        <p>{user?.gender || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Height</label>
                        <p>{user?.height ? `${user.height} cm` : "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Marital Status</label>
                        <p>{user?.maritalStatus || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Religion</label>
                        <p>{user?.religion || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Community</label>
                        <p>{user?.community || "-"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mp-divider-subtle"></div>

                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Professional & Education</h3>
                    <div className="mp-details-grid">
                      <div className="mp-data-field">
                        <label>Qualification</label>
                        <p>{user?.highestQualification || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>College</label>
                        <p>{user?.collegeName || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Job Role</label>
                        <p>{user?.jobRole || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Company</label>
                        <p>{user?.companyName || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Annual Income</label>
                        <p>{user?.annualIncome || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Work Type</label>
                        <p>{user?.workType || "-"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mp-divider-subtle"></div>

                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Contact Details</h3>
                    <div className="mp-details-grid">
                      <div className="mp-data-field">
                        <label>Email</label>
                        <p>{user?.email}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Phone</label>
                        <p>{user?.mobileNumber}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Location</label>
                        <p>{user?.city}, {user?.state}, {user?.country}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* --- EDIT FORM --- */
                <form onSubmit={handleUpdate} className="mp-edit-container">
                  
                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Edit Personal Details</h3>
                    <div className="mp-edit-grid">
                      <div className="mp-input-wrap">
                        <label>Marital Status</label>
                        <select name="maritalStatus" value={formData.maritalStatus || ''} onChange={handleChange}>
                          <option value="Never Married">Never Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                      </div>
                      <div className="mp-input-wrap">
                        <label>Height (cm)</label>
                        <input name="height" type="number" value={formData.height || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Diet</label>
                        <select name="diet" value={formData.diet || ''} onChange={handleChange}>
                          <option value="Veg">Veg</option>
                          <option value="Non-Veg">Non-Veg</option>
                          <option value="Eggetarian">Eggetarian</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Edit Professional</h3>
                    <div className="mp-edit-grid">
                      <div className="mp-input-wrap">
                        <label>Qualification</label>
                        <input name="highestQualification" value={formData.highestQualification || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>College</label>
                        <input name="collegeName" value={formData.collegeName || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Job Role</label>
                        <input name="jobRole" value={formData.jobRole || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Income</label>
                        <input name="annualIncome" value={formData.annualIncome || ''} onChange={handleChange} />
                      </div>
                    </div>
                  </div>

                  <div className="mp-sheet-actions">
                    <button type="button" onClick={() => setIsEditing(false)} className="mp-btn-text">Cancel</button>
                    <button type="submit" className="mp-btn-solid">Save Changes</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyProfile;
