import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Modal from "./Modal";
import { API_BASE_URL } from "../config";
import "../index.css";

const RequestList = ({ onStatusChange, refreshTrigger }) => {
  const [requests, setRequests] = useState([]);
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);

  // Search and Pagination State
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8; 

  // Modal States
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [itemToCancel, setItemToCancel] = useState(null);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [newQuantity, setNewQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/requests?search=${search}&page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setRequests(data.data || (Array.isArray(data) ? data : []));
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchRequests();
  }, [user, refreshTrigger, search, page]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    setProcessing(true);
    try {
        const res = await fetch(`${API_BASE_URL}/requests/${editItem.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({ quantity: parseInt(newQuantity) }),
        });

        if (res.ok) {
            addToast("Request updated successfully", "success");
            setShowEditModal(false);
            fetchRequests();
        }
    } catch (error) {
        addToast("Error updating request", "error");
    } finally {
        setProcessing(false);
    }
  };

  const confirmCancel = async () => {
    if (!itemToCancel) return;
    try {
        const res = await fetch(`${API_BASE_URL}/requests/${itemToCancel}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${user.token}` },
        });

        if (res.ok) {
            addToast("Request cancelled", "success");
            setShowCancelModal(false);
            fetchRequests();
        }
    } catch (error) {
        addToast("Error cancelling request", "error");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/requests/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        addToast(`Request ${status.toLowerCase()}`, "success");
        fetchRequests();
        if (onStatusChange) onStatusChange();
      }
    } catch (error) {
      addToast("Error updating status", "error");
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'Pending').toLowerCase();
    if (s === 'approved') return <span className="badge badge-approved">Approved</span>;
    if (s === 'rejected') return <span className="badge badge-rejected">Rejected</span>;
    return <span className="badge badge-pending">Pending</span>;
  };

  if (loading && requests.length === 0) {
    return (
      <div className="card"><div className="flex-center" style={{ padding: '2rem' }}><div className="spinner"></div></div></div>
    );
  }

  return (
    <div className="card">
      <div className="card-header" style={{ flexDirection: 'column', gap: '1rem', alignItems: 'stretch' }}>
        <div className="flex-between">
            <h2 className="card-title">Activity Log</h2>
            <div className="text-muted" style={{ fontSize: '0.813rem' }}>
              Page {page} of {totalPages || 1}
            </div>
        </div>

        <div className="search-bar">
            <input 
              type="text" 
              className="input search-input" 
              placeholder="Search by user or item..." 
              value={search}
              onChange={handleSearchChange}
            />
        </div>
      </div>
      
      {requests.length === 0 ? (
        <div style={{ padding: '4rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <p className="text-muted">{search ? 'No results found' : 'No requests yet'}</p>
          {search && <button className="btn btn-secondary mt-2" onClick={() => {setSearch(""); setPage(1);}}>Clear Search</button>}
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Equipment</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="flex" style={{ alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', color: 'white' }}>
                          {r.user_name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: '600' }}>{r.user_name}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: '500' }}>{r.equipment_name}</td>
                    <td><span className="badge badge-primary">{r.quantity}</span></td>
                    <td>{getStatusBadge(r.status)}</td>
                    <td className="text-muted">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td>
                      {user.role === 'admin' ? (
                        r.status === 'Pending' ? (
                          <div className="flex" style={{ gap: '0.5rem' }}>
                            <button onClick={() => updateStatus(r.id, "Approved")} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Approve</button>
                            <button onClick={() => updateStatus(r.id, "Rejected")} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Reject</button>
                          </div>
                        ) : <span className="text-muted">Processed</span>
                      ) : (
                        r.status === 'Pending' ? (
                          <div className="flex" style={{ gap: '0.5rem' }}>
                            <button onClick={() => {setEditItem(r); setNewQuantity(r.quantity); setShowEditModal(true);}} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Edit</button>
                            <button onClick={() => {setItemToCancel(r.id); setShowCancelModal(true);}} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Cancel</button>
                          </div>
                        ) : <span className="text-muted">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination-footer">
              <button className="btn btn-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} className={`page-btn ${page === n ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
                ))}
              </div>
              <button className="btn btn-secondary" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}

      {/* Shared Modals */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        title="Edit Request Quantity"
        footer={
          <>
            <button onClick={() => setShowEditModal(false)} className="btn btn-secondary" disabled={processing}>Cancel</button>
            <button onClick={handleUpdate} className="btn btn-primary" disabled={processing}>
              {processing ? 'Saving...' : 'Update Request'}
            </button>
          </>
        }
      >
        <p className="text-muted mb-4">Update the quantity for your request of <b>{editItem?.equipment_name}</b>.</p>
        <div className="input-group">
            <label className="input-label">New Quantity</label>
            <input className="input" type="number" value={newQuantity} onChange={e => setNewQuantity(e.target.value)} min="1" />
        </div>
      </Modal>

      <Modal 
        isOpen={showCancelModal} 
        onClose={() => setShowCancelModal(false)} 
        title="Cancel Request"
        footer={
          <>
            <button onClick={() => setShowCancelModal(false)} className="btn btn-secondary">Don't Cancel</button>
            <button onClick={confirmCancel} className="btn btn-danger">Yes, Cancel It</button>
          </>
        }
      >
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: 'var(--danger)', 
              width: '4rem', 
              height: '4rem', 
              borderRadius: '1rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.5rem',
              transform: 'rotate(-5deg)'
            }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Cancel Request?</h3>
            <p className="text-muted" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
              Are you sure you want to withdraw your request for this equipment? This action cannot be reversed.
            </p>
        </div>
      </Modal>
    </div>
  );
};

export default RequestList;
