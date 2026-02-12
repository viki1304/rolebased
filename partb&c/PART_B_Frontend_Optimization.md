# PART B — Frontend Debug & Optimization

## 🔎 Given Code

```jsx
const SearchUsers = () => { 
  const [users, setUsers] = useState([]); 
  const [term, setTerm] = useState(""); 
 
  useEffect(() => { 
    const loadData = async () => { 
      const res = await fetch(`https://api.example.com/users?q=${term}`); 
      const data = await res.json(); 
      setUsers(data); 
    }; 
    loadData(); 
  }, [term]); 
 
  return ( 
    <div> 
      <input type="text" value={term} onChange={(e) => 
setTerm(e.target.value)} /> 
      {users.map((u) => ( 
        <div key={Math.random()}>{u.name}</div> 
      ))} 
    </div> 
  ); 
};
```

## ✅ 1️⃣ Three Major Issues

### ❌ Issue 1: API called on every keystroke (No debounce)
*   Every character typed triggers a fetch.
*   Causes excessive API calls.
*   Bad for performance and server load.

### ❌ Issue 2: `key={Math.random()}`
*   React keys must be stable.
*   `Math.random()` generates new key every render.
*   Causes full re-render of list.
*   Breaks React reconciliation.
*   Very bad practice.

### ❌ Issue 3: No error handling / No cleanup
*   No loading state
*   No error handling
*   No cancellation of previous requests
*   Can cause race conditions

## ✅ 2️⃣ Refactored Version

Here is a production-ready improved version:

```jsx
import { useState, useEffect } from "react";

const SearchUsers = () => {
  const [users, setUsers] = useState([]);
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!term) {
      setUsers([]);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `https://api.example.com/users?q=${term}`,
          { signal }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }, 500); // debounce 500ms

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [term]);

  return (
    <div>
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search users..."
      />

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {users.map((u) => (
        <div key={u.id}>{u.name}</div>
      ))}
    </div>
  );
};

export default SearchUsers;
```

## ✅ 3️⃣ How the Fixes Improve Performance & Reliability

### 🚀 Debouncing (500ms delay)
*   Reduces API calls dramatically
*   Prevents server overload
*   Improves UX
*   Only calls API when user pauses typing

### 🚀 Stable Keys (`u.id`)
*   Enables proper React reconciliation
*   Prevents unnecessary re-renders
*   Improves performance

### 🚀 AbortController
*   Cancels previous API calls
*   Prevents race conditions
*   Avoids memory leaks

### 🚀 Error Handling
*   Improves reliability
*   Handles network failures
*   Prevents app crashes

### 🚀 Loading State
*   Improves user experience
*   Makes UI responsive and professional
