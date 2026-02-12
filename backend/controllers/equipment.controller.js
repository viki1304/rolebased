const db = require("../config/db");

exports.getAllEquipment = async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = "SELECT * FROM equipment WHERE deleted_at IS NULL";
    let params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Get total count for pagination
    const countQuery = query.replace("SELECT *", "SELECT COUNT(*)");
    const totalResult = await db.query(countQuery, params);
    const total = parseInt(totalResult.rows[0].count);

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
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

exports.createEquipment = async (req, res) => {
  const { name, description, quantity } = req.body;

  try {
    await db.query(
      "INSERT INTO equipment (name, description, quantity) VALUES ($1,$2,$3)",
      [name, description, quantity]
    );

    res.status(201).json({ message: "Equipment added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateEquipment = async (req, res) => {
    const { name, description, quantity } = req.body;
    const { id } = req.params;

    try {
        const result = await db.query(
            "UPDATE equipment SET name=$1, description=$2, quantity=$3 WHERE id=$4 RETURNING *",
            [name, description, quantity, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Equipment not found" });
        }

        res.json({ message: "Equipment updated", equipment: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.deleteEquipment = async (req, res) => {
    const { id } = req.params;
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // 1. Soft delete the equipment
        const equipResult = await client.query(
            "UPDATE equipment SET deleted_at = NOW() WHERE id=$1 RETURNING id",
            [id]
        );

        if (equipResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Equipment not found" });
        }

        // 2. Soft delete any PENDING requests for this equipment
        // We mark them as deleted because the resource they requested is gone
        await client.query(
            "UPDATE requests SET deleted_at = NOW() WHERE equipment_id = $1 AND status = 'Pending'",
            [id]
        );

        await client.query('COMMIT');
        res.json({ message: "Equipment deleted and pending requests cancelled" });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ message: "Server error" });
    } finally {
        client.release();
    }
};
