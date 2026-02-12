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
