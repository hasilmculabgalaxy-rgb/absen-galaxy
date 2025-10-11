
/* admin.js */
let adminMap;
async function loadEmployeesList(){
  const res = await supabase.from('employees').select('*').order('name');
  const el = document.getElementById('employees-list');
  el.innerHTML = (res.data || []).map(e=>`<div class="p-2 border rounded"><b>${e.name}</b> ${e.email || ''} <div class="text-sm text-gray-500">role: ${e.role}</div></div>`).join('');
  const sel = document.getElementById('select-emp');
  sel.innerHTML = (res.data || []).map(e=>`<option value="${e.id}">${e.name} (${e.role})</option>`).join('');
}

async function assignTask(){
  const assignee = document.getElementById('select-emp').value;
  const title = document.getElementById('task-title').value;
  const lat = parseFloat(document.getElementById('task-lat').value);
  const lng = parseFloat(document.getElementById('task-lng').value);
  const radius = parseInt(document.getElementById('task-radius').value) || 100;
  if(!assignee || !title || isNaN(lat) || isNaN(lng)) return alert('Isi semua field');
  const { error } = await supabase.from('tasks').insert([{ employee_id: assignee, title, target_lat: lat, target_lng: lng, radius }]);
  if(error) return alert('Error assign: ' + error.message);
  alert('Tugas ditambahkan');
  loadTasksPending();
}

async function loadTasksPending(){
  const res = await supabase.from('tasks').select('*').order('created_at', {ascending:false});
  const el = document.getElementById('leaves-pending');
  el.innerHTML = '<h4 class="font-semibold">Tasks</h4>' + (res.data||[]).map(t=>`<div class="p-2 border rounded"><b>${t.title}</b> for ${t.employee_id} <div>${t.target_lat},${t.target_lng}</div></div>`).join('');
}

function initAdminMap(){
  if(adminMap) return;
  adminMap = L.map('map').setView([0,0],2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(adminMap);
  navigator.geolocation.getCurrentPosition(pos=> adminMap.setView([pos.coords.latitude,pos.coords.longitude],12));
}

async function loadLeavesPending(){
  const res = await supabase.from('leaves').select('*').eq('status','pending').order('created_at', {ascending:false});
  const el = document.getElementById('leaves-pending');
  el.innerHTML = (res.data||[]).map(l=>`<div class="p-2 border rounded"><b>${l.type}</b> ${l.start_date}→${l.end_date} <div><button data-id="${l.id}" class="approve bg-green-500 px-2 py-1 rounded mt-2">Approve</button> <button data-id="${l.id}" class="reject bg-red-500 px-2 py-1 rounded mt-2">Reject</button></div></div>`).join('');
  document.querySelectorAll('.approve').forEach(b=> b.addEventListener('click', async ev=>{ const id = ev.target.dataset.id; await supabase.from('leaves').update({ status:'approved' }).eq('id', id); alert('approved'); loadLeavesPending(); }));
  document.querySelectorAll('.reject').forEach(b=> b.addEventListener('click', async ev=>{ const id = ev.target.dataset.id; await supabase.from('leaves').update({ status:'rejected' }).eq('id', id); alert('rejected'); loadLeavesPending(); }));
}

document.addEventListener('DOMContentLoaded', ()=>{
  initAdminMap();
  loadEmployeesList();
  loadTasksPending();
  loadLeavesPending();
  document.getElementById('btn-assign')?.addEventListener('click', assignTask);
});
