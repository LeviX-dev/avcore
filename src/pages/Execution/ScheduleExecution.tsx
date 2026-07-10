import React,{useEffect,useState} from "react";
import axios from "axios";
import { BASE_URL } from "../../../public/config";
import { useNavigate } from "react-router-dom";

export default function ScheduleExecution(){

 const [data,setData]=useState([]);
 const [name,setName]=useState("");
 const [desc,setDesc]=useState("");

 const navigate = useNavigate();

 const load = async ()=>{
  const r = await axios.get(
   BASE_URL+"api/get/schedules",
   { withCredentials:true }
  );
  setData(r.data.data || []);
 };

 useEffect(()=>{ load(); },[]);

 const save = async ()=>{
  await axios.post(
   BASE_URL+"api/schedule",
   { schedule_name:name, description:desc },
   { withCredentials:true }
  );
  setName("");
  setDesc("");
  load();
 };

 return(
 <div className="p-4">

  <h2 className="text-xl font-bold mb-4">Schedule Master</h2>

  <div className="flex gap-2 mb-4">
   <input
    value={name}
    onChange={e=>setName(e.target.value)}
    placeholder="Schedule Name"
    className="border p-2"
   />

   <input
    value={desc}
    onChange={e=>setDesc(e.target.value)}
    placeholder="Description"
    className="border p-2"
   />

   <button
    onClick={save}
    className="bg-blue-600 text-white px-4"
   >
    Add
   </button>
  </div>

  <table className="w-full border">
   <thead>
    <tr>
     <th>#</th>
     <th>Name</th>
     <th>Process Count</th>
     <th>Status</th>
     <th>Action</th>
    </tr>
   </thead>

   <tbody>
   {data.map((d,i)=>(
    <tr key={d.schedule_id}>
     <td>{i+1}</td>
     <td>{d.schedule_name}</td>
     <td>{d.process_count}</td>
     <td>{d.status}</td>

     <td>
      <button
       onClick={()=>navigate(`/execution/schedule-settings/${d.schedule_id}`)}
       className="bg-gray-600 text-white px-2"
      >
       ⚙
      </button>
     </td>
    </tr>
   ))}
   </tbody>
  </table>

 </div>
 );
}
