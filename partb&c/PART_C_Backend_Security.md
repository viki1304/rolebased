# PART C — Backend Debug & Security

## 🔎 Given Code

```js
app.get('/api/admin/reports', verifyToken, async (req, res) => {

  const { category } = req.query;

  try {
    const query = "SELECT * FROM reports WHERE category = '" + category + "'";
    const result = await db.query(query);

    if (result.rows.length === 0) {
      res.send("No reports found");
    } else {
      res.json(result.rows);
    }

  } catch (e) {
    res.status(500).json({ error: "Check DB" });
  }
});
```

## ✅ 1️⃣ Security Vulnerabilities & Bad Practices

### ❌ 1. SQL Injection
User can pass:
```
?category=' OR 1=1 --
```
This modifies query and exposes all data.
**Very critical vulnerability.**

### ❌ 2. No Role Check
Route is `/api/admin/reports` but it only checks token, not role.
Any logged-in user can access admin reports.

### ❌ 3. String Query Concatenation
Unsafe and outdated method.

### ❌ 4. Bad API Response
`res.send("No reports found")`
Should return:
*   Proper status code
*   JSON format

### ❌ 5. No Input Validation
No validation on `category`.

## ✅ 2️⃣ Refactored Secure Version

```js
app.get('/api/admin/reports', verifyToken, async (req, res) => {
  const { category } = req.query;

  // Role check
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }

  // Input validation
  if (!category || typeof category !== "string") {
    return res.status(400).json({ message: "Invalid category parameter" });
  }

  try {
    const query = "SELECT * FROM reports WHERE category = $1";
    const result = await db.query(query, [category]);

    return res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
});
```

## ✅ 3️⃣ How Changes Improve Security

### 🔐 Parameterized Queries (`$1`)
*   Prevents SQL Injection
*   Database treats input as value, not executable code

### 🔐 Role-Based Access Control
*   Only admins can access reports
*   Prevents privilege escalation

### 🔐 Input Validation
*   Blocks malformed requests
*   Prevents unexpected behavior

### 🔐 Proper Status Codes
*   200 → success
*   400 → bad request
*   403 → forbidden
*   500 → server error

Improves:
*   API design
*   Debugging
*   Client-side handling
