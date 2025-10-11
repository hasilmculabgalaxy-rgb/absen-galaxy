
/* app.js - global supabase client & auth helpers */
const SUPABASE_URL = "https://pudhwubaoabhxcmfysgh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1ZGh3dWJhb2FiaHhjbWZ5c2doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMzQzMDAsImV4cCI6MjA3NTcxMDMwMH0.TAFdpLAXJ49mi2gOd9DMFnm_8ykmpKyT8LFoMVswYdY";
const supabaseJsGlobal = typeof supabaseJs !== 'undefined' ? supabaseJs : null;
const supabase = supabaseJsGlobal && supabaseJsGlobal.createClient ? supabaseJsGlobal.createClient(SUPABASE_URL, SUPABASE_KEY) : (typeof supabase !== 'undefined' ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null);

async function registerUser(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
}

async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

async function getSessionUser() {
  const { data } = await supabase.auth.getSession();
  if(data && data.session) return data.session.user;
  return null;
}

async function signOut() {
  await supabase.auth.signOut();
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', ()=>{
  // wire auth buttons on index page
  const btnReg = document.getElementById('btn-register');
  const btnLogin = document.getElementById('btn-login');
  const btnReadme = document.getElementById('btn-open-readme');
  if(btnReg) btnReg.addEventListener('click', async ()=>{
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if(!email || !password) return alert('Isi email & password');
    const res = await registerUser(email,password);
    if(res.error) return alert('Register error: ' + res.error.message);
    alert('Registered. Check email verification. Now login.');
  });
  if(btnLogin) btnLogin.addEventListener('click', async ()=>{
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if(!email || !password) return alert('Isi email & password');
    const res = await loginUser(email,password);
    if(res.error) return alert('Login error: ' + res.error.message);
    window.location.href = 'dashboard.html';
  });
  if(btnReadme) btnReadme.addEventListener('click', ()=> window.open('README.md'));

  // wire logout buttons
  const btnLogout = document.querySelectorAll('#btn-logout');
  btnLogout.forEach(b=> b.addEventListener('click', ()=> signOut()));
});
