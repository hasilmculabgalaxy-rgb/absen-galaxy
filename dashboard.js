
/* dashboard.js */
async function seedDemo() {
  const emps = [
    { name: 'Ariyan', email: 'ariyan@example.com', role: 'admin' },
    { name: 'Sari', email: 'sari@example.com', role: 'hrd' },
    { name: 'Budi', email: 'budi@example.com', role: 'employee' }
  ];
  for(const e of emps){
    await supabase.from('employees').upsert({ email: e.email, name: e.name, role: e.role }, { onConflict: 'email' });
  }
  alert('Demo employees created. Create auth accounts via Register for matching emails.');
  loadSummary();
}

async function loadSummary(){
  const userSession = await getSessionUser();
  if(!userSession) { window.location.href='index.html'; return; }
  document.getElementById('user-email').innerText = userSession.email;
  const empRes = await supabase.from('employees').select('*').eq('email', userSession.email).maybeSingle();
  const emp = empRes.data;
  document.getElementById('user-role-display').innerText = emp ? emp.role : 'employee (not registered)';
  if(emp && (emp.role==='hrd' || emp.role==='admin')) document.getElementById('link-admin').classList.remove('hidden');
  const att = await supabase.from('attendance').select('id', { count: 'exact' });
  const leaves = await supabase.from('leaves').select('id', { count: 'exact' });
  const tasks = await supabase.from('tasks').select('id', { count: 'exact' });
  document.getElementById('summary').innerHTML = `
    <div class="p-3 border rounded"><div class="text-sm text-gray-500">Total Absen</div><div class="text-xl font-bold">${att.count||0}</div></div>
    <div class="p-3 border rounded"><div class="text-sm text-gray-500">Pengajuan Cuti</div><div class="text-xl font-bold">${leaves.count||0}</div></div>
    <div class="p-3 border rounded"><div class="text-sm text-gray-500">Tugas</div><div class="text-xl font-bold">${tasks.count||0}</div></div>
  `;
  const h = await supabase.from('attendance').select('*').order('created_at', {ascending:false}).limit(8);
  document.getElementById('history').innerHTML = '<h3 class="font-semibold">Recent Attendance</h3>' + (h.data||[]).map(a=>`<div class="p-2 border rounded">${a.type} — ${a.created_at} ${a.photo_url?'<a class="text-blue-600" href="'+a.photo_url+'" target="_blank">photo</a>':''}</div>`).join('');
}

document.addEventListener('DOMContentLoaded', ()=>{
  const btnSeed = document.getElementById('btn-seed-demo');
  if(btnSeed) btnSeed.addEventListener('click', seedDemo);
  const btnExport = document.getElementById('btn-export-csv');
  if(btnExport) btnExport.addEventListener('click', async ()=>{
    const res = await supabase.from('attendance').select('*');
    const rows = res.data || [];
    const csv = ['id,employee_id,type,created_at,photo_url', ...rows.map(r=>`${r.id},${r.employee_id},${r.type},${r.created_at},${r.photo_url||''}`)].join('\n');
    const blob = new Blob([csv], {type:'text/csv'}); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='attendance.csv'; a.click();
  });
  loadSummary();
});
