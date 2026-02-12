import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { API_BASE_URL } from "../config";
import "../index.css";

const AdminPanel = ({ onAction }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  // Equipment State
  const [equipName, setEquipName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loadingEquip, setLoadingEquip] = useState(false);

  // User State
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loadingUser, setLoadingUser] = useState(false);

  const addEquipment = async () => {
    if (!equipName || !quantity) {
      addToast("Please fill in all required fields", "warning");
      return;
    }

    setLoadingEquip(true);
    try {
      const res = await fetch(`${API_BASE_URL}/equipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ name: equipName, description, quantity: parseInt(quantity) }),
      });

      if (res.ok) {
        addToast("Equipment added successfully!", "success");
        setEquipName("");
        setDescription("");
        setQuantity("");
        if (onAction) onAction();
      } else {
        const data = await res.json();
        addToast(data.message || "Failed to add equipment", "error");
      }
    } catch (error) {
      console.error(error);
      addToast("Error adding equipment", "error");
    } finally {
      setLoadingEquip(false);
    }
  };

  const addUser = async (e) => {
    e.preventDefault();
    if (!userName || !email || !password) {
        addToast("Please fill in all required fields", "warning");
        return;
    }

    setLoadingUser(true);
    try {
        const res = await fetch(`${API_BASE_URL}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({ name: userName, email, password, role }),
        });

        if (res.ok) {
            addToast("User created successfully!", "success");
            setUserName("");
            setEmail("");
            setPassword("");
            setRole("user");
        } else {
            const data = await res.json();
            addToast(data.message || "Failed to create user", "error");
        }
    } catch (error) {
        console.error(error);
        addToast("Error creating user", "error");
    } finally {
        setLoadingUser(false);
    }
  };

  return (
    <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
        {/* Equipment Card */}
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">Add New Equipment</h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><path d="M20 12v10H4V12"/><path d="m2 7 10 5 10-5-10-5z"/><path d="m12 22 5-10"/><path d="M12 22 7 12"/></svg>
            </div>
            <div className="grid" style={{ gap: '1rem' }}>
                <div className="input-group">
                    <label className="input-label">Equipment Name</label>
                    <input className="input" placeholder="e.g. Laptop" value={equipName} onChange={e => setEquipName(e.target.value)} />
                </div>
                <div className="input-group">
                    <label className="input-label">Description</label>
                    <input className="input" placeholder="Short description..." value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div className="input-group">
                    <label className="input-label">Initial Quantity</label>
                    <input className="input" type="number" placeholder="0" value={quantity} onChange={e => setQuantity(e.target.value)} />
                </div>
                <button onClick={addEquipment} className="btn btn-primary" disabled={loadingEquip} style={{ width: '100%', marginTop: '0.5rem' }}>
                    {loadingEquip ? "Adding..." : "Add Equipment"}
                </button>
            </div>
        </div>

        {/* User Card */}
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">Register New User</h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            </div>
            <form onSubmit={addUser} className="grid" style={{ gap: '1rem' }}>
                <div className="input-group">
                    <label className="input-label">Full Name</label>
                    <input className="input" placeholder="John Doe" value={userName} onChange={e => setUserName(e.target.value)} />
                </div>
                <div className="input-group">
                    <label className="input-label">Email Address</label>
                    <input className="input" type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="grid grid-2" style={{ gap: '1rem' }}>
                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Account Role</label>
                        <select className="input" value={role} onChange={e => setRole(e.target.value)}>
                            <option value="user">User</option>
                            <option value="admin">Admin Panel</option>
                        </select>
                    </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loadingUser} style={{ width: '100%', marginTop: '0.5rem' }}>
                    {loadingUser ? "Creating Account..." : "Create User Account"}
                </button>
            </form>
        </div>
    </div>
  );
};

export default AdminPanel;
