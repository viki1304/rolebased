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
