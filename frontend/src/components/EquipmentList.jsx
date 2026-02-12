import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Modal from "./Modal";
import { API_BASE_URL } from "../config";
import "../index.css";

const EquipmentList = ({ refreshTrigger, onAction }) => {
  const [equipment, setEquipment] = useState([]);
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // Search and Pagination State
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6; 

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [requestQty, setRequestQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [updating, setUpdating] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/equipment?search=${search}&page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setEquipment(data.data || (Array.isArray(data) ? data : []));
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchEquipment();
  }, [user, refreshTrigger, search, page]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const openRequestModal = (item) => {
    setSelectedItem(item);
    setRequestQty(1);
    setShowModal(true);
  };

  const handleRequestSubmit = async () => {
    if (!selectedItem) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ equipment_id: selectedItem.id, quantity: parseInt(requestQty) }),
      });
      
      if (res.ok) {
        addToast("Request submitted successfully!", "success");
        setShowModal(false);
        if (onAction) onAction();
      } else {
        const data = await res.json();
        addToast(data.message || "Failed to submit request", "error");
      }
    } catch (error) {
      addToast("Error submitting request", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    setUpdating(true);
    try {
        const res = await fetch(`${API_BASE_URL}/equipment/${editItem.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify(editItem),
        });

        if (res.ok) {
            addToast("Equipment updated successfully", "success");
            setShowEditModal(false);
            if (onAction) onAction();
        }
    } catch (error) {
        addToast("Error updating equipment", "error");
    } finally {
        setUpdating(false);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
        const res = await fetch(`${API_BASE_URL}/equipment/${itemToDelete.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${user.token}` },
        });

        if (res.ok) {
            addToast("Equipment deleted successfully", "success");
            setShowDeleteModal(false);
            if (onAction) onAction();
        }
    } catch (error) {
        addToast("Error deleting equipment", "error");
    } finally {
        setDeleting(false);
    }
  };

  if (loading && equipment.length === 0) {
    return (
      <div className="card"><div className="flex-center" style={{ padding: '2rem' }}><div className="spinner"></div></div></div>
    );
  }

  return (
    <>
      <div className="card">
        <div className="card-header" style={{ flexDirection: 'column', gap: '1rem', alignItems: 'stretch' }}>
          <div className="flex-between">
            <h2 className="card-title">Inventory</h2>
            <div className="text-muted" style={{ fontSize: '0.813rem' }}>
              Page {page} of {totalPages || 1}
            </div>
          </div>
          
          <div className="search-bar">
            <input 
              type="text" 
              className="input search-input" 
              placeholder="Search equipment by name or description..." 
              value={search}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        
        {equipment.length === 0 ? (
          <div style={{ padding: '4rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted" style={{ opacity: '0.3', marginBottom: '1rem' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p className="text-muted">{search ? 'No results matching your search' : 'Inventory is empty'}</p>
            {search && <button className="btn btn-secondary mt-2" onClick={() => {setSearch(""); setPage(1);}}>Clear Search</button>}
          </div>
        ) : (
          <>
            <div className="grid grid-2">
              {equipment.map((item) => (
                <div key={item.id} className="card" style={{ padding: '1.25rem' }}>
                  <div className="flex-between mb-2">
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '700' }}>{item.name}</h3>
                    <div className={`badge ${item.quantity > 5 ? 'badge-primary' : item.quantity > 0 ? 'badge-pending' : 'badge-rejected'}`}>
                      {item.quantity} in stock
                    </div>
                  </div>
                  <p className="text-muted mb-4" style={{ minHeight: '3em' }}>{item.description || 'No description available'}</p>
                  
                  <div className="flex" style={{ gap: '0.75rem' }}>
                    {user.role === "user" ? (
                      item.quantity > 0 ? (
                        <button onClick={() => openRequestModal(item)} className="btn btn-primary" style={{ width: '100%' }}>
                          Request Access
                        </button>
                      ) : (
                        <button className="btn btn-secondary" style={{ width: '100%' }} disabled>Out of Stock</button>
                      )
                    ) : (
                      <>
                        <button onClick={() => {setEditItem({...item}); setShowEditModal(true);}} className="btn btn-secondary" style={{ flex: 1 }}>Edit</button>
                        <button onClick={() => {setItemToDelete(item); setShowDeleteModal(true);}} className="btn btn-danger" style={{ flex: 1 }}>Delete</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
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
      </div>

      {/* Shared Modals */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={`Request ${selectedItem?.name}`}
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="btn btn-secondary" disabled={submitting}>Cancel</button>
            <button onClick={handleRequestSubmit} className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Processing...' : 'Confirm Request'}
            </button>
          </>
        }
      >
        <p className="text-muted mb-4">You are requesting access to this equipment. Available stock: {selectedItem?.quantity}</p>
        <div className="input-group">
          <label className="input-label">Quantity Needed</label>
          <input type="number" className="input" value={requestQty} onChange={(e) => setRequestQty(parseInt(e.target.value) || 1)} min="1" max={selectedItem?.quantity} />
        </div>
      </Modal>

      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        title="Edit Inventory Item"
        footer={
          <>
            <button onClick={() => setShowEditModal(false)} className="btn btn-secondary" disabled={updating}>Cancel</button>
            <button onClick={handleUpdate} className="btn btn-primary" disabled={updating}>
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <div className="grid" style={{ gap: '1.25rem' }}>
          <div className="input-group">
            <label className="input-label">Item Name</label>
            <input className="input" value={editItem?.name} onChange={e => setEditItem({ ...editItem, name: e.target.value })} />
          </div>
          <div className="input-group">
            <label className="input-label">Description</label>
            <input className="input" value={editItem?.description} onChange={e => setEditItem({ ...editItem, description: e.target.value })} />
          </div>
          <div className="input-group">
            <label className="input-label">Stock Quantity</label>
            <input className="input" type="number" value={editItem?.quantity} onChange={e => setEditItem({ ...editItem, quantity: parseInt(e.target.value) || 0 })} />
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        title="Confirm Deletion"
        footer={
          <>
            <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary" disabled={deleting}>Cancel</button>
            <button onClick={confirmDelete} className="btn btn-danger" disabled={deleting}>
              {deleting ? 'Removing...' : 'Permanently Delete'}
            </button>
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
              transform: 'rotate(5deg)'
            }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Delete "{itemToDelete?.name}"?</h3>
            <p className="text-muted" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
              This action is permanent and cannot be undone. All pending requests for this item will be automatically cancelled.
            </p>
        </div>
      </Modal>
    </>
  );
};

export default EquipmentList;
