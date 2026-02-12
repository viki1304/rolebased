const db = require("../config/db");

exports.getRequests = async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let baseQuery = `
      FROM requests r
      JOIN users u ON r.user_id = u.id
      JOIN equipment e ON r.equipment_id = e.id
      WHERE r.deleted_at IS NULL AND e.deleted_at IS NULL
    `;
    let params = [];
    let paramCount = 1;

    // If not admin, only show own requests
    if (req.user.role !== 'admin') {
      baseQuery += ` AND r.user_id = $${paramCount}`;
      params.push(req.user.id);
      paramCount++;
    }

    if (search) {
      baseQuery += ` AND (u.name ILIKE $${paramCount} OR e.name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Get total count
    const countResult = await db.query(`SELECT COUNT(*) ${baseQuery}`, params);
    const total = parseInt(countResult.rows[0].count);

    const query = `
      SELECT r.*, u.name AS user_name, e.name AS equipment_name
      ${baseQuery}
      ORDER BY r.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    params.push(limit);
    params.push(offset);

    const result = await db.query(query, params);

    res.json({
      data: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createRequest = async (req, res) => {
  const { equipment_id, quantity } = req.body;
  const client = await db.connect();

  try {
    // Start transaction
    await client.query('BEGIN');

    // Check availability
    const equipmentRes = await client.query('SELECT quantity FROM equipment WHERE id = $1 FOR UPDATE', [equipment_id]);
    if (equipmentRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: "Equipment not found" });
    }

    const availableQty = equipmentRes.rows[0].quantity;
    if (quantity > availableQty) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: "Not enough quantity available" });
    }

    // Create request (do NOT deduct quantity yet)
    await client.query(
      "INSERT INTO requests (user_id, equipment_id, quantity, status) VALUES ($1,$2,$3, 'Pending')",
      [req.user.id, equipment_id, quantity]
    );

    await client.query('COMMIT');

    res.status(201).json({ message: "Request submitted" });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

exports.updateRequestStatus = async (req, res) => {
  const { status } = req.body;
  const requestId = req.params.id;
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // Get current request status and details
    const requestRes = await client.query("SELECT * FROM requests WHERE id = $1 FOR UPDATE", [requestId]);
    if (requestRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Request not found" });
    }

    const request = requestRes.rows[0];
    const currentStatus = request.status;

    // Handle Quantity Logic
    if (status === 'Approved' && currentStatus !== 'Approved') {
        // Approve: Deduct Quantity
        const equipRes = await client.query("SELECT quantity FROM equipment WHERE id = $1 FOR UPDATE", [request.equipment_id]);
        
        if (equipRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Equipment not found" });
        }

        if (equipRes.rows[0].quantity < request.quantity) {
             await client.query('ROLLBACK');
             return res.status(400).json({ message: "Not enough stock to approve request" });
        }

        await client.query("UPDATE equipment SET quantity = quantity - $1 WHERE id = $2", [request.quantity, request.equipment_id]);
    
    } else if (status === 'Rejected' && currentStatus === 'Approved') {
        // Rejecting an already approved request: Add Quantity Back
        await client.query("UPDATE equipment SET quantity = quantity + $1 WHERE id = $2", [request.quantity, request.equipment_id]);
    }

    // Update Status
    await client.query(
      "UPDATE requests SET status=$1 WHERE id=$2",
      [status, requestId]
    );

    await client.query('COMMIT');

    res.json({ message: "Status updated" });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

exports.updateRequestDetails = async (req, res) => {
    const { quantity } = req.body;
    const requestId = req.params.id;
    const userId = req.user.id; // From token

    try {
        // Check if request exists and belongs to user
        const check = await db.query("SELECT * FROM requests WHERE id = $1 AND deleted_at IS NULL", [requestId]);
        
        if (check.rows.length === 0) {
            return res.status(404).json({ message: "Request not found" });
        }

        const request = check.rows[0];

        if (request.user_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (request.status !== 'Pending') {
            return res.status(400).json({ message: "Cannot edit processed requests" });
        }

        // Update
        await db.query("UPDATE requests SET quantity = $1 WHERE id = $2", [quantity, requestId]);

        res.json({ message: "Request updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.deleteRequest = async (req, res) => {
    const requestId = req.params.id;
    const userId = req.user.id;

    try {
        const check = await db.query("SELECT * FROM requests WHERE id = $1 AND deleted_at IS NULL", [requestId]);
        
        if (check.rows.length === 0) {
            return res.status(404).json({ message: "Request not found" });
        }

        const request = check.rows[0];

        if (request.user_id !== userId && req.user.role !== 'admin') {
             return res.status(403).json({ message: "Unauthorized" });
        }

        if (request.status !== 'Pending' && req.user.role !== 'admin') {
             return res.status(400).json({ message: "Cannot cancel processed requests" });
        }

        // Soft delete
        await db.query("UPDATE requests SET deleted_at = NOW() WHERE id = $1", [requestId]);

        res.json({ message: "Request cancelled" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
