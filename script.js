 
 
 // --- FIREBASE INITIALIZATION (Web v9 Modular SDK) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCi_hufIZTzsYtdPGQtvtmKmAkkrydmn_A",
  authDomain: "abbah-83a7b.firebaseapp.com",
  databaseURL: "https://abbah-83a7b-default-rtdb.firebaseio.com",
  projectId: "abbah-83a7b",
  storageBucket: "abbah-83a7b.appspot.com",
  messagingSenderId: "379729759051",
  appId: "1:379729759051:web:e75528d61b02d1e4f536ce",
  measurementId: "G-H41J2WMR6S"
};

// Initialize Firebase and DB
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
// --- FIREBASE SAVE FUNCTION ---
async function saveReferralToFirebase(referralId, data) {
  try {
    const newRef = ref(db, 'referrals/' + referralId);
    await set(newRef, data);
    console.log('Saved to Firebase:', referralId);
    return true;
  } catch (err) {
    console.error('Firebase save failed', err);
    alert('⚠ Referral saved locally but Firebase failed.');
    return false;
  }
}


// DOM refs
  const refTypeRadios = document.getElementsByName('refType');
  const marketerSection = document.getElementById('referrerMarketer');
  const clinicSection = document.getElementById('referrerClinic');
  const form = document.getElementById('referralForm');
  const output = document.getElementById('output');
  const previewArea = document.getElementById('previewArea');
  const previewBtn = document.getElementById('previewBtn');
  const saveLocalBtn = document.getElementById('saveLocal');

  function updateReferrerView(){
    const type = document.querySelector('input[name="refType"]:checked').value;
    if(type === 'marketer'){
      marketerSection.classList.remove('hidden');
      clinicSection.classList.add('hidden');
    } else {
      marketerSection.classList.add('hidden');
      clinicSection.classList.remove('hidden');
    }
  }

  // initial
  updateReferrerView();
  refTypeRadios.forEach(r => r.addEventListener('change', updateReferrerView));

  function gatherFormData(){
    const refType = document.querySelector('input[name="refType"]:checked').value;
    const attachments = Array.from(document.getElementById('attachments').files).map(f => ({name:f.name,size:f.size}));

    const data = {
      referralDate: document.getElementById('refDate').value || new Date().toISOString().slice(0,10),
      referralType: refType,
      referrer: {},
      patient: {
        name: document.getElementById('patientName').value.trim(),
        dob: document.getElementById('patientDob').value || null,
        gender: document.getElementById('patientGender').value || null,
        phone: document.getElementById('patientPhone').value.trim(),
        email: document.getElementById('patientEmail').value.trim(),
        address: document.getElementById('patientAddress').value.trim(),
      },
      reason: document.getElementById('refReason').value.trim(),
      preferredClinic: document.getElementById('preferredClinic').value.trim(),
      urgency: document.getElementById('urgency').value,
      attachments,
      followUpPhone: document.getElementById('followPhone').value.trim(),
      commission: document.getElementById('commission').value || null,
      notes: document.getElementById('extraNotes').value.trim()
    };

    if(refType === 'marketer'){
      data.referrer = {
        type: 'marketer',
        name: document.getElementById('marketerName').value.trim(),
        id: document.getElementById('marketerId').value.trim(),
        phone: document.getElementById('marketerPhone').value.trim()
      };
    } else {
      data.referrer = {
        type: 'clinic',
        clinicName: document.getElementById('clinicName').value.trim(),
        contactPerson: document.getElementById('clinicContact').value.trim(),
        phone: document.getElementById('clinicPhone').value.trim()
      };
    }

    return data;
  }

  function validate(data){
    const errors = [];
    if(!data.patient.name) errors.push('Patient name is required.');
    if(!data.patient.phone) errors.push('Patient phone is required.');
    if(!data.reason) errors.push('Reason for referral is required.');
    // Basic phone char check
    if(data.patient.phone && !/^\+?[0-9 \-]{6,20}$/.test(data.patient.phone)) errors.push('Patient phone looks invalid.');
    return errors;
  }

  previewBtn.addEventListener('click', ()=>{
    const data = gatherFormData();
    const errors = validate(data);
    if(errors.length) {
      previewArea.textContent = 'Validation errors:\n- ' + errors.join('\n- ');
    } else {
      previewArea.textContent = JSON.stringify(data, null, 2);
    }
    output.classList.remove('hidden');
  });

  saveLocalBtn.addEventListener('click', ()=>{
    const data = gatherFormData();
    const errors = validate(data);
    if(errors.length){
      alert('Cannot save: ' + errors.join('\n'));
      return;
    }
    // save to localStorage as an array
    const key = 'patientReferrals';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push({...data, savedAt: new Date().toISOString()});
    localStorage.setItem(key, JSON.stringify(existing));
    alert('Saved locally. You can export or view saved referrals in console (localStorage key: ' + key + ').');
  });

 form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = gatherFormData();
  data.referralDate = new Date().toISOString().split("T")[0];

  const errors = validate(data);
  if (errors.length) {
    alert('Please fix errors:\n' + errors.join('\n'));
    return;
  }

  const referralId = 'REF-' + Date.now();
  data.referralId = referralId;

  const location = await new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => resolve(null)
    );
  });
  data.location = location;

  // ✅ This works now
  const savedOk = await saveReferralToFirebase(referralId, data);

  if (savedOk) {
    const slipWindow = window.open('', '_blank');
    slipWindow.document.write(`
      <h2 style="text-align:center;">SANYU HOSPITAL – Referral Slip</h2>
      <hr/>
      <p><b>Referral ID:</b> ${referralId}</p>
      <p><b>Date:</b> ${data.referralDate}</p>
      <p><b>Patient:</b> ${data.patient.name}</p>
      <p><b>Phone:</b> ${data.patient.phone}</p>
      <p><b>Reason:</b> ${data.reason}</p>
      <p><b>Urgency:</b> ${data.urgency}</p>
      <p><b>Referred By:</b> ${data.referrer.name || data.referrer.clinicName}</p>
      ${location ? `<p><b>Location:</b> Lat ${location.lat}, Lng ${location.lng}</p>` : ``}
      <hr/>
      <p style="font-size:13px;text-align:center;">Thank you for trusting Sanyu Hospital.</p>
    `);
   // slipWindow.print();
  }

  previewArea.textContent = JSON.stringify(data, null, 2);
  output.classList.remove('hidden');

  // Clear patient fields only
  [
    'patientName','patientDob','patientGender','patientPhone','patientEmail',
    'patientAddress','refReason','preferredClinic','urgency','attachments',
    'followPhone','commission','extraNotes'
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = el.type === 'file' ? null : '';
  });

  alert('Referral submitted successfully.');
});

  // small helper to export saved referrals as JSON file
  function exportSaved(){
    const key = 'patientReferrals';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const blob = new Blob([JSON.stringify(existing, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'referrals.json';
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  // Expose for console convenience
  window.ReferralForm = {gatherFormData, validate, exportSaved};

// Smooth fade‑in animation on scroll
const animatedItems=document.querySelectorAll('.section, h3, .row');
const observer=new IntersectionObserver((entries)=>{
 entries.forEach(e=>{if(e.isIntersecting){e.target.style.opacity=1;e.target.style.transform='translateY(0)';}})
},{threshold:0.1});
animatedItems.forEach(el=>{el.style.opacity=0;el.style.transform='translateY(15px)';el.style.transition='0.6s ease';observer.observe(el);});
