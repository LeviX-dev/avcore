import db from "../database/db.js";

/* ===============================
   SCHEDULE MASTER
================================ */

export const createSchedule = async (req,res)=>{
 try{

  const { schedule_name, description } = req.body;

  const [r] = await db.query(`
   INSERT INTO schedules_master
   (schedule_name, description, status, created_at)
   VALUES (?, ?, 'active', NOW())
  `,[schedule_name, description]);

  res.json({
   success:true,
   schedule_id:r.insertId
  });

 }catch(err){
  res.status(500).json({ success:false, error:err.message });
 }
};

export const getAllSchedules1 = async (req,res)=>{
 try{

  const [rows] = await db.query(`
   SELECT sm.*,
   COUNT(stpm.map_id) process_count
   FROM schedules_master sm
   LEFT JOIN schedule_type_process_map stpm
   ON sm.schedule_id = stpm.schedule_id
   GROUP BY sm.schedule_id
   ORDER BY sm.schedule_id DESC
  `);

  res.json({ success:true, data:rows });

 }catch(err){
  res.status(500).json({ success:false, error:err.message });
 }
};

export const getAllSchedules = async (req,res)=>{
 try{

  const [rows] = await db.query(`
   SELECT sm.*,
   COUNT(stpm.map_id) process_count
   FROM schedules_master sm
   LEFT JOIN schedule_type_process_map stpm
   ON sm.schedule_id = stpm.schedule_id
   GROUP BY sm.schedule_id
   ORDER BY sm.schedule_id ASC
  `);

  res.json({ success:true, data:rows });

 }catch(err){
  res.status(500).json({ success:false, error:err.message });
 }
};

export const getScheduleById = async (req,res)=>{
 try{

  const { id } = req.params;

  const [rows] = await db.query(
   `SELECT * FROM schedules_master WHERE schedule_id=?`,
   [id]
  );

  res.json({ success:true, data:rows[0] });

 }catch(err){
  res.status(500).json({ success:false, error:err.message });
 }
};

export const deleteSchedule = async (req,res)=>{
 try{

  const { id } = req.params;

  await db.query("START TRANSACTION");

  await db.query(
   "DELETE FROM schedule_type_process_map WHERE schedule_id=?",
   [id]
  );

  await db.query(
   "DELETE FROM schedules_master WHERE schedule_id=?",
   [id]
  );

  await db.query("COMMIT");

  res.json({ success:true });

 }catch(err){
  await db.query("ROLLBACK");
  res.status(500).json({ success:false, error:err.message });
 }
};


export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { schedule_name, description, status } = req.body;

    await db.query(`
      UPDATE schedules_master
      SET schedule_name = ?,
          description = ?,
          status = ?,
          updated_at = NOW()
      WHERE schedule_id = ?
    `, [schedule_name, description, status, id]);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


/* ===============================
   SCHEDULE MAPPING
================================ */

export const saveScheduleMapping = async (req,res)=>{
 try{

  const { schedule_id, mappings } = req.body;

  await db.query("START TRANSACTION");

  await db.query(
   "DELETE FROM schedule_type_process_map WHERE schedule_id=?",
   [schedule_id]
  );

  for(const m of mappings){
   for(const pid of m.process_ids){

    await db.query(`
     INSERT INTO schedule_type_process_map
     (schedule_id,type_id,process_id,created_at)
     VALUES (?,?,?,NOW())
    `,[schedule_id,m.type_id,pid]);

   }
  }

  await db.query("COMMIT");

  res.json({ success:true });

 }catch(err){
  await db.query("ROLLBACK");
  res.status(500).json({ success:false, error:err.message });
 }
};

export const getScheduleMappingWithDetails = async (req,res)=>{
 try{

  const { scheduleId } = req.params;

  const [rows] = await db.query(`
   SELECT stpm.*, et.type_name, pe.process_name
   FROM schedule_type_process_map stpm
   JOIN execution_type et ON et.type_id=stpm.type_id
   JOIN process_execution pe ON pe.process_id=stpm.process_id
   WHERE stpm.schedule_id=?
   ORDER BY et.type_name
  `,[scheduleId]);

  res.json({ success:true, data:rows });

 }catch(err){
  res.status(500).json({ success:false, error:err.message });
 }
};

/* ===============================
   MASTER DATA
================================ */

export const getTypes1 = async (req,res)=>{
 const [rows] = await db.query(`
  SELECT * FROM execution_type
  WHERE status='active'
  ORDER BY type_name
 `);

 res.json({ success:true, data:rows });
}; 

export const getTypes = async (req,res)=>{
 const [rows] = await db.query(`
  SELECT * FROM execution_type
  WHERE status='active'
  ORDER BY type_id ASC  -- Changed from type_name to type_id ASC for oldest first
 `);

 res.json({ success:true, data:rows });
};


export const getProcessesByType1 = async (req,res)=>{
 const { typeId } = req.params;

 const [rows] = await db.query(`
  SELECT pe.*
  FROM process_execution pe
  JOIN process_type_mapping ptm
  ON ptm.process_id = pe.process_id
  WHERE ptm.type_id=? AND pe.status='active'
  ORDER BY pe.process_name
 `,[typeId]);

 res.json({ success:true, data:rows });
};



// Update getProcessesByType to show oldest first
export const getProcessesByType = async (req,res)=>{
 const { typeId } = req.params;

 const [rows] = await db.query(`
  SELECT pe.*
  FROM process_execution pe
  JOIN process_type_mapping ptm
  ON ptm.process_id = pe.process_id
  WHERE ptm.type_id=? AND pe.status='active'
  ORDER BY pe.process_id ASC  -- Added ORDER BY for oldest first
 `,[typeId]);

 res.json({ success:true, data:rows });
};





export const updateScheduleStatus = async (req,res)=>{
 try{

  const { id } = req.params;
  const { status } = req.body;

  await db.query(`
    UPDATE schedules_master
    SET status = ?, updated_at = NOW()
    WHERE schedule_id = ?
  `,[status, id]);

  res.json({ success:true });

 }catch(err){
  res.status(500).json({ success:false, error:err.message });
 }
};

