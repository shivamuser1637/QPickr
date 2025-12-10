const textarea = document.getElementById('questionsInput');
const pickBtn = document.getElementById('pickBtn');
const resultText = document.getElementById('resultText');
const remainingCount = document.getElementById('remainingCount');
const copyBtn = document.getElementById('copyBtn');
const saveBtn = document.getElementById('saveBtn');
const saveLocal = document.getElementById('saveLocal');
const clearBtn = document.getElementById('clear');
const loadSample = document.getElementById('loadSample');
const fileInput = document.getElementById('fileInput');
const noRepeat = document.getElementById('noRepeat');

function loadQuestionsFromText(text){
  const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  return lines;
}

function getQuestions(){
  return loadQuestionsFromText(textarea.value);
}

function updateRemaining(count){ 
  remainingCount.textContent = count; 
}

let pool = [];

function resetPool(){ 
  pool = getQuestions().slice(); 
}

function pickRandom(){
  let items = getQuestions();
  if(items.length === 0){
    resultText.innerHTML = '<span style="color:var(--muted)">No questions provided.</span>';
    updateRemaining(0);
    return;
  }

  if(noRepeat.checked){
    if(pool.length === 0) resetPool();
    const idx = Math.floor(Math.random() * pool.length);
    const q = pool.splice(idx, 1)[0];
    resultText.textContent = q;
    updateRemaining(pool.length);
  } else {
    const idx = Math.floor(Math.random() * items.length);
    resultText.textContent = items[idx];
    updateRemaining(items.length);
  }
}

// event listeners
pickBtn.addEventListener('click', pickRandom);

copyBtn.addEventListener('click', ()=>{
  const text = resultText.textContent;
  if(!text) return;
  navigator.clipboard.writeText(text).then(()=>{
    const original = copyBtn.textContent;
    copyBtn.textContent = 'Copied ✓';
    setTimeout(()=>copyBtn.textContent = original, 1200);
  }).catch(()=>alert('Copy failed — try selecting text manually.'));
});

saveBtn.addEventListener('click', ()=>{
  const questions = textarea.value;
  const blob = new Blob([questions], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'questions.txt';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

saveLocal.addEventListener('click', ()=>{
  localStorage.setItem('qpickr_questions', textarea.value || '');
  const prev = saveLocal.textContent;
  saveLocal.textContent = 'Saved ✓';
  setTimeout(()=> saveLocal.textContent = prev, 1200);
});

window.addEventListener('load', ()=>{
  const saved = localStorage.getItem('qpickr_questions');
  if(saved) textarea.value = saved;
  updateRemaining(getQuestions().length);
  resetPool();
});

textarea.addEventListener('input', ()=>{
  updateRemaining(getQuestions().length);
  resetPool();
});

clearBtn.addEventListener('click', ()=>{
  textarea.value='';
  updateRemaining(0);
  resetPool();
});

loadSample.addEventListener('click', ()=>{
  textarea.value = `What is Agile?
Explain As-Is and To-Be
What metrics do you track as a BA in Agile?
How do you plan your release?
How will you ensure no requirement is missed?
In strict timeline how will you complete project?
Stakeholder asking technical requirement but not visible — how do you handle?
Stakeholder asking technical requirement but not feasible — how do you handle?
What you check before giving UAT to client?
What is scope creep and how do you handle it?
What is Change Request vs Enhancement?`;
  updateRemaining(getQuestions().length);
  resetPool();
});

fileInput.addEventListener('change', e=>{
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = ev=>{
    textarea.value = ev.target.result;
    updateRemaining(getQuestions().length);
    resetPool();
  };
  reader.readAsText(f);
});

textarea.addEventListener('keydown', (e)=>{
  if((e.ctrlKey || e.metaKey) && e.key === 'Enter'){
    e.preventDefault();
    pickRandom();
  }
});
