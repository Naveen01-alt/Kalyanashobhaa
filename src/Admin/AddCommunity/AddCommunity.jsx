import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FiPlus, FiX, FiLayers, FiList, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import './AddCommunity.css';

const AdminCommunityManager = () => {
  const [activeTab, setActiveTab] = useState('create'); 
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [existingCommunities, setExistingCommunities] = useState([]);

  const [communityInput, setCommunityInput] = useState(''); 
  const [subInput, setSubInput] = useState('');
  const [subCommunities, setSubCommunities] = useState([]);

  const getAuthToken = () => localStorage.getItem('adminToken'); 

  const fetchCommunities = async () => {
    setFetching(true);
    try {
      const response = await fetch('https://kalyanashobha-back.vercel.app/api/public/get-all-communities');
      const data = await response.json();
      if (data.success) {
        setExistingCommunities(data.data); 
      }
    } catch (error) {
      console.error("Failed to fetch communities", error);
      toast.error("Could not load existing communities.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleSubKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = subInput.trim();
      if (val && !subCommunities.includes(val)) {
        setSubCommunities([...subCommunities, val]);
        setSubInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setSubCommunities(subCommunities.filter(tag => tag !== tagToRemove));
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setCommunityInput('');
    setSubCommunities([]);
    setSubInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!communityInput.trim()) {
      toast.error(activeTab === 'create' ? "Community Name is required" : "Please select a Community");
      return;
    }

    setLoading(true);
    const token = getAuthToken();
    let url = '';
    let payload = {};

    if (activeTab === 'create') {
      url = 'https://kalyanashobha-back.vercel.app/api/admin/add-community';
      
      if (communityInput.includes(',')) {
        const communities = communityInput.split(',').map(s => s.trim()).filter(s => s);
        payload = { community: communities }; 
      } else {
        payload = { community: communityInput.trim() };
      }
    } else {
      url = 'https://kalyanashobha-back.vercel.app/api/admin/add-sub-community';
      
      if (subCommunities.length === 0) {
        toast.error("Please add at least one sub-community.");
        setLoading(false);
        return;
      }

      payload = {
        communityName: communityInput.trim(),
        subCommunities: subCommunities 
      };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || "Saved Successfully");
        setCommunityInput('');
        setSubCommunities([]);
        setSubInput('');
        fetchCommunities(); 
      } else {
        throw new Error(data.message || "Request failed");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const isBulkMode = activeTab === 'create' && communityInput.includes(',');

  return (
    <div className="admin-cm-wrapper">
      <Toaster position="top-right" />
      
      <div className="admin-cm-panel">
        <div className="admin-cm-top">
          <div className="admin-cm-top-inner">
             <h2>Community Master Data</h2>
             <button onClick={fetchCommunities} className="admin-cm-refresh" title="Refresh List">
               <FiRefreshCw className={fetching ? 'spin' : ''} />
             </button>
          </div>
          <p>Manage religions, communities, and castes.</p>
        </div>

        <div className="admin-cm-nav">
          <button 
            className={`admin-cm-tab ${activeTab === 'create' ? 'active-tab' : ''}`}
            onClick={() => handleTabSwitch('create')}
          >
            <FiLayers /> Create Community
          </button>
          <button 
            className={`admin-cm-tab ${activeTab === 'append' ? 'active-tab' : ''}`}
            onClick={() => handleTabSwitch('append')}
          >
            <FiList /> Add Sub-Communities
          </button>
        </div>

        <div className="admin-cm-content">
          {activeTab === 'create' ? (
            <div className="admin-cm-alert">
              <FiCheckCircle /> 
              <span>
                <strong>Create Mode:</strong> Type a new name to create, or comma-separated names (e.g., <em>Jain, Sikh</em>) to bulk create.
              </span>
            </div>
          ) : (
            <div className="admin-cm-alert alert-warn">
              <FiCheckCircle /> 
              <span>
                <strong>Append Mode:</strong> Select an existing community from the list to add new sub-communities to it.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off">
            
            {activeTab === 'create' && (
              <div className="admin-cm-group">
                <label htmlFor="sys-comm-entry">Community Name</label>
                <input 
                  id="sys-comm-entry"
                  type="text" 
                  name="sys_entry_val_rnd"    // Random-looking name to avoid autofill triggers
                  autoComplete="new-password" // Often forces browsers to drop email/address suggestions
                  spellCheck="false"
                  data-lpignore="true"
                  data-form-type="other"      // Tells Dashlane/others to ignore
                  className="admin-cm-text-field no-autofill-icons"
                  placeholder="e.g. Hindu OR Hindu, Sikh, Jain"
                  value={communityInput}
                  onChange={(e) => setCommunityInput(e.target.value)}
                />
              </div>
            )}

            {activeTab === 'append' && (
              <>
                <div className="admin-cm-group">
                  <label htmlFor="sys-comm-select">Select Existing Community</label>
                  <div className="admin-cm-select-box">
                    <select 
                      id="sys-comm-select"
                      className="admin-cm-text-field" 
                      value={communityInput}
                      onChange={(e) => setCommunityInput(e.target.value)}
                    >
                      <option value="">-- Select Existing Community --</option>
                      {existingCommunities.map((comm) => (
                        <option key={comm._id} value={comm.name}>
                          {comm.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="admin-cm-group">
                  <label htmlFor="sys-sub-entry">Sub-Communities / Castes</label>
                  <div className="admin-cm-tags-area">
                    {subCommunities.map((tag, index) => (
                      <span key={index} className="admin-cm-badge">
                        {tag} <FiX onClick={() => removeTag(tag)} />
                      </span>
                    ))}
                    <input 
                      id="sys-sub-entry"
                      type="text" 
                      name="sys_sub_entry_rnd"
                      autoComplete="new-password"
                      spellCheck="false"
                      data-lpignore="true"
                      data-form-type="other"
                      className="admin-cm-tag-entry no-autofill-icons"
                      placeholder={subCommunities.length > 0 ? "Add another..." : "Type and press Enter (e.g. Brahmin)"}
                      value={subInput}
                      onChange={(e) => setSubInput(e.target.value)}
                      onKeyDown={handleSubKeyDown}
                      disabled={!communityInput} 
                    />
                  </div>
                  <small>Press <strong>Enter</strong> or <strong>Comma</strong> to add a tag. (Select a community first)</small>
                </div>
              </>
            )}

            <button type="submit" className="admin-cm-action-btn" disabled={loading}>
              {loading ? <span className="admin-cm-spinner"></span> : (
                <>
                   <FiPlus /> 
                   {activeTab === 'create' 
                     ? (isBulkMode ? "Bulk Create Communities" : "Add Community") 
                     : "Add Sub-Communities"
                   }
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCommunityManager;
