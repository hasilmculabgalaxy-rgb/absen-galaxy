
/* leave.js */
async function submitLeave(){
  const ses = await supabase.auth.getUser();
  if(!ses || !ses.data.user) return alert('Login dulu');
  const type = document.getElementById('leave-type').value;
  const start = document.getElementById('leave-start').value;
  const end = document.getElementById('leave-end').value;
  const reason = document.getElementById('leave-reason').value;
  const f = document.getElementById('leave-file').files[0];
  let doc_url = null;
  if(f){
    const path = `docs/${ses.data.user.id}/${Date.now()}_${f.name}`;
    const up = await supabase.storage.from('photos').upload(path, f, { upsert:false });
    if(up.error) return alert('Upload doc error: ' + up.error.message);
    doc_url = supabase.storage.from('photos').getPublicUrl(up.data.path).data.publicUrl;
  }
  const days = (new Date(end) - new Date(start)) / (1000*60*60*24) + 1;
  let status = 'pending'; if(type==='sick' && days<=2) status='approved';
  const emp = await supabase.from('employees').select('id').eq('email', ses.data.user.email).maybeSingle();
  const payload = { employee_id: emp.data ? emp.data.id : null, type, start_date: start, end_date: end, reason, document_url: doc_url, status };
  const { error } = await supabase.from('leaves').insert([payload]);
  if(error) return alert('Error submit leave: ' + error.message);
  document.getElementById('leave-msg').innerText = 'Pengajuan tersimpan. Status: ' + status;
  loadMyLeaves();
}

async function loadMyLeaves(){
  const ses = await supabase.auth.getUser();
  if(!ses || !ses.data.user) return;
  const emp = await supabase.from('employees').select('id').eq('email', ses.data.user.email).maybeSingle();
  const res = await supabase.from('leaves').select('*').eq('employee_id', emp.data ? emp.data.id : null).order('created_at', {ascending:false});
  const container = document.getElementById('leaves-list');
  container.innerHTML = (res.data || []).map(l=>`<div class="p-2 border rounded"><b>${l.type}</b> ${l.start_date} → ${l.end_date} <div>Status: ${l.status}</div></div>`).join('');
}

document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('btn-submit-leave').addEventListener('click', submitLeave);
  loadMyLeaves();
  document.getElementById('btn-my-leaves')?.addEventListener('click', loadMyLeaves);
});
