import db from "../database/db.js";

/**
 =========================================A=========
 EXECUTION TYPE CONTROLLERS
 ==================================================
*/

/**
 ✅ Add Execution Type
*/
export const addExecutionType = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { type_name, status } = req.body;

    if (!type_name) {
      return res.status(400).json({ error: "Type name required" });
    }

    const createdBy = req.session.user.id;

    const [result] = await db.query(`
      INSERT INTO execution_type(type_name,status,created_by)
      VALUES(?,?,?)
    `, [type_name, status || "active", createdBy]);

    res.status(201).json({
      message: "Execution type created",
      type_id: result.insertId
    });

  } catch (error) {
    console.error("Add Execution Type Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


/**
 ✅ Get Execution Types WITH Process Count
*/
export const getExecutionTypes1 = async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT 
        et.*,
        u.name AS created_by_name,
        COUNT(ptm.process_id) AS process_count
      FROM execution_type et
      LEFT JOIN users u 
        ON u.user_id = et.created_by
      LEFT JOIN process_type_mapping ptm 
        ON ptm.type_id = et.type_id
      GROUP BY et.type_id
      ORDER BY et.created_at DESC
    `);

    res.json(rows);

  } catch (error) {
    console.error("Get Execution Types Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


export const getExecutionTypes2 = async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT 
        et.*,
        u.name AS created_by_name,
        COUNT(ptm.process_id) AS process_count
      FROM execution_type et
      LEFT JOIN users u 
        ON u.user_id = et.created_by
      LEFT JOIN process_type_mapping ptm 
        ON ptm.type_id = et.type_id
      GROUP BY et.type_id
      ORDER BY 
        (et.type_id = 1) DESC,
        et.created_at DESC
    `);

    res.json(rows);

  } catch (error) {
    console.error("Get Execution Types Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getExecutionTypes = async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT 
        et.*,
        u.name AS created_by_name,
        COUNT(ptm.process_id) AS process_count
      FROM execution_type et
      LEFT JOIN users u 
        ON u.user_id = et.created_by
      LEFT JOIN process_type_mapping ptm 
        ON ptm.type_id = et.type_id
      GROUP BY et.type_id
      ORDER BY 
        et.created_at ASC
    `);

    res.json(rows);

  } catch (error) {
    console.error("Get Execution Types Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


/**
 ✅ Update Execution Type
*/
export const updateExecutionType = async (req, res) => {
  try {

    const { id } = req.params;
    const { type_name, status } = req.body;

    const updateData = {};

    if (type_name !== undefined) updateData.type_name = type_name;
    if (status !== undefined) updateData.status = status;

    updateData.updated_at = new Date();

    const [result] = await db.query(
      "UPDATE execution_type SET ? WHERE type_id = ?",
      [updateData, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Type not found" });
    }

    res.json({ message: "Execution type updated" });

  } catch (error) {
    console.error("Update Execution Type Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


/**
 ✅ Delete Execution Type (Safe Delete)
*/
export const deleteExecutionType = async (req, res) => {
  try {

    const { id } = req.params;

    const [mapping] = await db.query(
      "SELECT * FROM process_type_mapping WHERE type_id = ?",
      [id]
    );

    if (mapping.length > 0) {
      return res.status(400).json({
        error: "Cannot delete. Type is mapped to processes."
      });
    }

    await db.query(
      "DELETE FROM execution_type WHERE type_id = ?",
      [id]
    );

    res.json({ message: "Execution type deleted" });

  } catch (error) {
    console.error("Delete Execution Type Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};



/**
 ==================================================
 PROCESS CONTROLLERS
 ==================================================
*/

/**
 ✅ Add Process WITH Type Mapping
*/
export const addProcess = async (req, res) => {
  try {

    if (!req.session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { process_name, description, type_id } = req.body;

    if (!process_name || !type_id) {
      return res.status(400).json({
        error: "Process name and type required"
      });
    }

    const createdBy = req.session.user.id;

    await db.query("START TRANSACTION");

    const [processResult] = await db.query(`
      INSERT INTO process_execution
      (process_name,description,created_by)
      VALUES(?,?,?)
    `, [process_name, description || null, createdBy]);

    const processId = processResult.insertId;

    await db.query(`
      INSERT INTO process_type_mapping(process_id,type_id)
      VALUES(?,?)
    `, [processId, type_id]);

    await db.query("COMMIT");

    res.status(201).json({
      message: "Process created",
      process_id: processId
    });

  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Add Process Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


/**
 ✅ Get Processes By Type
*/
export const getProcessesByType1 = async (req, res) => {
  try {

    const { typeId } = req.params;

    const [rows] = await db.query(`
      SELECT 
        pe.*,
        u.name AS created_by_name
      FROM process_execution pe
      JOIN process_type_mapping ptm 
        ON ptm.process_id = pe.process_id
      LEFT JOIN users u 
        ON u.user_id = pe.created_by
      WHERE ptm.type_id = ?
      ORDER BY pe.created_at DESC
    `, [typeId]);

    res.json(rows);

  } catch (error) {
    console.error("Get Processes By Type Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


export const getProcessesByType2 = async (req, res) => {
  try {

    const { typeId } = req.params;

    const [rows] = await db.query(`
      SELECT 
        pe.*,
        u.name AS created_by_name
      FROM process_execution pe
      JOIN process_type_mapping ptm 
        ON ptm.process_id = pe.process_id
      LEFT JOIN users u 
        ON u.user_id = pe.created_by
      WHERE ptm.type_id = ?
      ORDER BY 
        (pe.process_id = 28) DESC,
        pe.created_at DESC
    `, [typeId]);

    res.json(rows);

  } catch (error) {
    console.error("Get Processes By Type Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


export const getProcessesByType = async (req, res) => {
  try {

    const { typeId } = req.params;

    const [rows] = await db.query(`
      SELECT 
        pe.*,
        u.name AS created_by_name
      FROM process_execution pe
      JOIN process_type_mapping ptm 
        ON ptm.process_id = pe.process_id
      LEFT JOIN users u 
        ON u.user_id = pe.created_by
      WHERE ptm.type_id = ?
      ORDER BY 
        pe.created_at ASC
    `, [typeId]);

    res.json(rows);

  } catch (error) {
    console.error("Get Processes By Type Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


/**
 ✅ Update Process Details
*/
export const updateProcess = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const { process_name, description, status } = req.body;

    // Check if process exists
    const [existing] = await db.query(
      "SELECT * FROM process_execution WHERE process_id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Process not found" });
    }

    // Build update object dynamically
    const updateData = {};
    if (process_name !== undefined) updateData.process_name = process_name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    updateData.updated_at = new Date();

    // Update the process
    await db.query(
      "UPDATE process_execution SET ? WHERE process_id = ?",
      [updateData, id]
    );

    res.json({ 
      message: "Process updated successfully",
      process_id: id 
    });

  } catch (error) {
    console.error("Update Process Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 ✅ Toggle Process Status
*/
export const toggleProcessStatus = async (req, res) => {
  try {

    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT status FROM process_execution WHERE process_id = ?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Process not found" });
    }

    const newStatus = rows[0].status === "active"
      ? "inactive"
      : "active";

    await db.query(
      "UPDATE process_execution SET status=? WHERE process_id=?",
      [newStatus, id]
    );

    res.json({
      message: "Status updated",
      status: newStatus
    });

  } catch (error) {
    console.error("Toggle Status Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


/**
 ✅ Delete Process
*/
export const deleteProcess = async (req, res) => {
  try {

    const { id } = req.params;

    await db.query("START TRANSACTION");

    await db.query(
      "DELETE FROM process_type_mapping WHERE process_id=?",
      [id]
    );

    await db.query(
      "DELETE FROM process_execution WHERE process_id=?",
      [id]
    );

    await db.query("COMMIT");

    res.json({ message: "Process deleted" });

  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Delete Process Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


export const addChecklist = async (req,res)=>{
 try{
   if(!req.session.user){
      return res.status(401).json({error:"Unauthorized"})
   }

   const {checklist_name,status} = req.body

   if(!checklist_name){
      return res.status(400).json({error:"Checklist name required"})
   }

   const createdBy = req.session.user.id

   const [result] = await db.query(`
      INSERT INTO execution_checklist
      (checklist_name,status,created_by)
      VALUES(?,?,?)
   `,[checklist_name,status || 'active',createdBy])

   res.status(201).json({
      message:"Checklist created",
      checklist_id: result.insertId
   })

 }catch(error){
   console.error("Add Checklist Error:",error)
   res.status(500).json({error:"Server error"})
 }
}

export const getChecklists1 = async (req,res)=>{
 try{
   const [rows] = await db.query(`
      SELECT
         c.*,
         u.name AS created_by_name,
         COUNT(ci.item_id) AS item_count
      FROM execution_checklist c
      LEFT JOIN users u
        ON u.user_id = c.created_by
      LEFT JOIN checklist_items ci
        ON ci.checklist_id = c.checklist_id
      GROUP BY c.checklist_id
      ORDER BY c.created_at DESC
   `)

   res.json(rows)

 }catch(error){
   console.error("Get Checklist Error:",error)
   res.status(500).json({error:"Server error"})
 }
}


export const getChecklists = async (req,res)=>{
 try{
   const [rows] = await db.query(`
      SELECT
         c.*,
         u.name AS created_by_name,
         COUNT(ci.item_id) AS item_count
      FROM execution_checklist c
      LEFT JOIN users u
        ON u.user_id = c.created_by
      LEFT JOIN checklist_items ci
        ON ci.checklist_id = c.checklist_id
      GROUP BY c.checklist_id
      ORDER BY 
        (c.checklist_id = 28) DESC,
        c.created_at DESC
   `)

   res.json(rows)

 }catch(error){
   console.error("Get Checklist Error:",error)
   res.status(500).json({error:"Server error"})
 }
}


export const updateChecklist = async (req,res)=>{
 try{
   const {id} = req.params
   const {checklist_name,status} = req.body

   const updateData = {}

   if(checklist_name!==undefined) updateData.checklist_name = checklist_name
   if(status!==undefined) updateData.status = status

   updateData.updated_at = new Date()

   await db.query(
     "UPDATE execution_checklist SET ? WHERE checklist_id=?",
     [updateData,id]
   )

   res.json({message:"Checklist updated"})

 }catch(error){
   console.error("Update Checklist Error:",error)
   res.status(500).json({error:"Server error"})
 }
}

export const addChecklistItem = async (req,res)=>{
 try{
   if(!req.session.user){
      return res.status(401).json({error:"Unauthorized"})
   }

   const {item_name,checklist_id,status} = req.body

   if(!item_name || !checklist_id){
      return res.status(400).json({error:"Item name and checklist ID required"})
   }

   const createdBy = req.session.user.id

   const [result] = await db.query(`
      INSERT INTO checklist_items
      (item_name,checklist_id,status,created_by)
      VALUES(?,?,?,?)
   `,[item_name,checklist_id,status || 'active',createdBy])

   res.status(201).json({
      message:"Checklist item added",
      item_id: result.insertId
   })

 }catch(error){
   console.error("Add Checklist Item Error:",error)
   res.status(500).json({error:"Server error"})
 }
}

export const getChecklistItemsByChecklist1 = async (req,res)=>{
 try{
   const {checklistId} = req.params

   const [rows] = await db.query(`
      SELECT
         ci.*,
         u.name AS created_by_name
      FROM checklist_items ci
      LEFT JOIN users u
        ON u.user_id = ci.created_by
      WHERE ci.checklist_id = ?
      ORDER BY ci.created_at DESC
   `,[checklistId])

   res.json(rows)

 }catch(error){
   console.error("Get Checklist Items Error:",error)
   res.status(500).json({error:"Server error"})
 }
}


export const getChecklistItemsByChecklist = async (req,res)=>{
 try{
   const {checklistId} = req.params

   const [rows] = await db.query(`
      SELECT
         ci.*,
         u.name AS created_by_name
      FROM checklist_items ci
      LEFT JOIN users u
        ON u.user_id = ci.created_by
      WHERE ci.checklist_id = ?
      ORDER BY 
        (ci.item_id = 1) DESC,
        ci.created_at DESC
   `,[checklistId])

   res.json(rows)

 }catch(error){
   console.error("Get Checklist Items Error:",error)
   res.status(500).json({error:"Server error"})
 }
}



export const updateChecklistItem = async (req,res)=>{
 try{
   const {id} = req.params
   const {item_name,status} = req.body

   if(!item_name && !status){
      return res.status(400).json({error:"No fields to update"})
   }

   const updateData = {}
   if(item_name !== undefined) updateData.item_name = item_name
   if(status !== undefined) updateData.status = status
   updateData.updated_at = new Date()

   await db.query(
     "UPDATE checklist_items SET ? WHERE item_id=?",
     [updateData,id]
   )

   res.json({message:"Checklist item updated successfully"})

 }catch(error){
   console.error("Update Checklist Item Error:",error)
   res.status(500).json({error:"Server error"})
 }
}

export const toggleChecklistItemStatus = async (req,res)=>{
 try{
   const {id} = req.params

   const [rows] = await db.query(
      "SELECT status FROM checklist_items WHERE item_id=?",
      [id]
   )

   if(!rows.length){
      return res.status(404).json({error:"Item not found"})
   }

   const newStatus = rows[0].status === "active"
      ? "inactive"
      : "active"

   await db.query(
      "UPDATE checklist_items SET status=?, updated_at=? WHERE item_id=?",
      [newStatus, new Date(), id]
   )

   res.json({
      message:"Status updated",
      status:newStatus
   })

 }catch(error){
   console.error("Toggle Checklist Item Error:",error)
   res.status(500).json({error:"Server error"})
 }
}

export const deleteChecklistItem = async (req,res)=>{
 try{
   const {id} = req.params

   const [result] = await db.query(
      "DELETE FROM checklist_items WHERE item_id=?",
      [id]
   )

   if(result.affectedRows === 0){
      return res.status(404).json({error:"Item not found"})
   }

   res.json({message:"Checklist item deleted successfully"})

 }catch(error){
   console.error("Delete Checklist Item Error:",error)
   res.status(500).json({error:"Server error"})
 }
}



export const getPreExecutionChecklistsWithItems = async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT 
        ec.checklist_id,
        ec.checklist_name,
        ci.item_id,
        ci.item_name
      FROM execution_checklist ec
      LEFT JOIN checklist_items ci 
        ON ci.checklist_id = ec.checklist_id
      WHERE ec.checklist_type = 'pre_execution'
        AND ec.status = 'active'
      ORDER BY 
        (ec.checklist_id = 1) DESC,   -- your main checklist first
        ec.checklist_id,
        ci.item_id
    `);

    const checklistsMap = {};

    rows.forEach(row => {
      if (!checklistsMap[row.checklist_id]) {
        checklistsMap[row.checklist_id] = {
          checklist_id: row.checklist_id,
          checklist_name: row.checklist_name,
          items: []
        };
      }

      if (row.item_id) {
        checklistsMap[row.checklist_id].items.push({
          item_id: row.item_id,
          item_name: row.item_name
        });
      }
    });

    res.json({
      success: true,
      data: Object.values(checklistsMap)
    });

  } catch (error) {
    console.error("Get Pre Execution Checklist Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getExecutionChecklistsWithItems = async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT 
        ec.checklist_id,
        ec.checklist_name,
        ci.item_id,
        ci.item_name
      FROM execution_checklist ec
      LEFT JOIN checklist_items ci 
        ON ci.checklist_id = ec.checklist_id
      WHERE ec.checklist_type = 'execution'
        AND ec.status = 'active'
      ORDER BY 
        ec.checklist_id,
        ci.item_id
    `);

    const checklistsMap = {};

    rows.forEach(row => {
      if (!checklistsMap[row.checklist_id]) {
        checklistsMap[row.checklist_id] = {
          checklist_id: row.checklist_id,
          checklist_name: row.checklist_name,
          items: []
        };
      }

      if (row.item_id) {
        checklistsMap[row.checklist_id].items.push({
          item_id: row.item_id,
          item_name: row.item_name
        });
      }
    });

    res.json({
      success: true,
      data: Object.values(checklistsMap)
    });

  } catch (error) {
    console.error("Get Execution Checklist Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
