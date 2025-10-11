
/* tasks.js */
let map, userMarker, officeCircle;
let currentMode = 'office';

function initMap() {
  if(map) return;
  map = L.map('map').setView([0,0],2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  navigator.geolocation.getCurrentPosition(pos=> map.setView([pos.coords.latitude,pos.coords.longitude],14));
}

async function loadTasksList(){
  const res = await supabase.from('tasks').select('*').order('created_at', {ascending:false});
  const container = document.getElementById('tasks-list');
  container.innerHTML = (res.data||[]).map(t=>`<div class="p-2 border rounded"><b>${t.title}</b><div class="text-sm text-gray-500">target: ${t.target_lat||''}, ${t.target_lng||''} | radius ${t.radius} m</div></div>`).join('');
  const sel = document.getElementById('task-select');
  sel.innerHTML = '<option value="">-- pilih tugas --</option>' + (res.data||[]).map(t=>`<option value="${t.id}">${t.title}</option>`).join('');
}

async function setOfficeHere(){
  navigator.geolocation.getCurrentPosition(async pos=>{
    const lat = pos.coords.latitude, lng = pos.coords.longitude;
    await supabase.from('office').upsert([{ id:1, lat, lng, radius:100 }], { onConflict: 'id' });
    alert('Office set at ' + lat.toFixed(5)+','+lng.toFixed(5));
    loadOffice();
  });
}

async function loadOffice(){
  const r = await supabase.from('office').select('*').maybeSingle();
  if(r.data){
    if(officeCircle) map.removeLayer(officeCircle);
    officeCircle = L.circle([r.data.lat, r.data.lng], {radius: r.data.radius||100}).addTo(map);
    map.setView([r.data.lat, r.data.lng], 14);
  }
}

async function doAttendance(){
  const ses = await supabase.auth.getUser();
  if(!ses || !ses.data.user) return alert('Login dulu');
  navigator.geolocation.getCurrentPosition(async pos=>{
    const lat = pos.coords.latitude, lng = pos.coords.longitude;
    let photo_url = null;
    const f = document.getElementById('selfie-file').files[0];
    if(f){
      const path = `photos/${ses.data.user.id}/${Date.now()}_${f.name}`;
      const up = await supabase.storage.from('photos').upload(path, f, { upsert:false });
      if(up.error) return alert('Upload error: ' + up.error.message);
      photo_url = supabase.storage.from('photos').getPublicUrl(up.data.path).data.publicUrl;
    }
    const emp = await supabase.from('employees').select('id').eq('email', ses.data.user.email).maybeSingle();
    const payload = { employee_id: emp.data ? emp.data.id : null, type: currentMode, photo_url, location_lat: lat, location_lng: lng };
    if(currentMode === 'task') payload.task_id = document.getElementById('task-select').value || null;
    const { error } = await supabase.from('attendance').insert([payload]);
    if(error) return alert('Error insert attendance: ' + error.message);
    document.getElementById('absen-msg').innerText = 'Absen tersimpan';
    loadTasksList();
  }, err=> alert('Gagal ambil lokasi: ' + err.message), { enableHighAccuracy: true });
}

document.addEventListener('DOMContentLoaded', ()=>{
  initMap();
  loadTasksList();
  document.getElementById('btn-set-office').addEventListener('click', setOfficeHere);
  document.getElementById('btn-absen').addEventListener('click', doAttendance);
  const modeText = document.getElementById('mode-text');
  modeText.addEventListener('click', ()=>{
    currentMode = currentMode === 'office' ? 'task' : 'office';
    modeText.innerText = currentMode === 'office' ? 'Office' : 'Task';
  });
});
