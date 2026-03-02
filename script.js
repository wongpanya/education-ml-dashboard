const $ = (id) => document.getElementById(id);

const defaults = {
  student_id: 'S001', sex: 'F', age: 15, grade: 9, academic_year: 2566,
  ses_quintile: 1, distance_km: 12, internet_home: 0, device_access: 0,
  attendance_rate: 0.68, baseline_skill_reading: 45, baseline_skill_math: 40,
};

function getApiBase(){ return $('apiBase').value.trim().replace(/\/$/, ''); }
function nowText(){ return new Date().toLocaleString('th-TH'); }
function setPill(el, type, text){ el.className = 'pill ' + type; el.textContent = text; }

function getPayload(){
  return {
    student_id: $('student_id').value,
    sex: $('sex').value,
    age: Number($('age').value),
    grade: Number($('grade').value),
    academic_year: Number($('academic_year').value),
    ses_quintile: Number($('ses_quintile').value),
    distance_km: Number($('distance_km').value),
    internet_home: Number($('internet_home').value),
    device_access: Number($('device_access').value),
    attendance_rate: Number($('attendance_rate').value),
    baseline_skill_reading: Number($('baseline_skill_reading').value),
    baseline_skill_math: Number($('baseline_skill_math').value),
  };
}

function getPolicies(){
  const out = [];
  if ($('policy_scholarship').checked) out.push('scholarship');
  if ($('policy_internet').checked) out.push('internet');
  if ($('policy_remedial').checked) out.push('remedial');
  return out;
}

async function apiCall(path, payload, method='POST'){
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (method !== 'GET' && payload) opts.body = JSON.stringify(payload);
  const res = await fetch(getApiBase() + path, opts);
  const txt = await res.text();
  let data;
  try { data = JSON.parse(txt); } catch { data = { raw: txt }; }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

function fmtPct(v){ return (v===undefined||v===null||isNaN(v)) ? '-' : (Number(v)*100).toFixed(2)+'%'; }
function fmtNum(v){ return (v===undefined||v===null||isNaN(v)) ? '-' : Number(v).toFixed(2); }

function setRaw(data){ $('rawOutput').textContent = JSON.stringify(data, null, 2); }
function setPretty(html){ $('prettyOutput').innerHTML = html; }

function showTabs(tab){
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab===tab));
  $('prettyOutput').classList.toggle('hidden', tab !== 'pretty');
  $('rawOutput').classList.toggle('hidden', tab !== 'raw');
}

function renderDropoutCard(data){
  const p = Number(data.dropout_probability ?? data.dropout_risk_probability);
  $('riskPercent').textContent = isNaN(p) ? '-' : `${(p*100).toFixed(2)}%`;
  $('dropoutProb').textContent = fmtPct(p);
  $('dropoutThreshold').textContent = fmtPct(data.threshold_used);
  $('dropoutAction').textContent = data.recommended_action || '-';

  let badgeClass = 'badge-muted', label = data.risk_level || 'N/A';
  const risk = String(data.risk_level || '').toLowerCase();
  if (risk.includes('high')) badgeClass = 'badge-high';
  else if (risk.includes('med')) badgeClass = 'badge-mid';
  else if (risk.includes('low')) badgeClass = 'badge-low';
  $('riskBadge').className = `badge ${badgeClass}`;
  $('riskBadge').textContent = label;
}

function renderScoreCard(data){
  $('scoreReading').textContent = fmtNum(data.predicted_score_reading);
  $('scoreMath').textContent = fmtNum(data.predicted_score_math);
  $('scoreAvg').textContent = fmtNum(data.predicted_avg_score);
  $('scoreBand').textContent = data.performance_band || '-';
}

function renderPolicyCard(data){
  $('polRiskBefore').textContent = fmtNum(data.dropout_risk_before);
  $('polRiskAfter').textContent = fmtNum(data.dropout_risk_after);
  $('polRiskChange').textContent = fmtNum(data.dropout_risk_change);
  $('polReadingChange').textContent = fmtNum(data.reading_score_change);
  $('polApplied').textContent = Array.isArray(data.policies_applied) ? data.policies_applied.join(', ') : '-';
}

async function checkHealth(){
  $('lastCheck').textContent = 'กำลังตรวจสอบ...';
  try {
    const data = await apiCall('/health', null, 'GET');
    setPill($('apiStatus'), 'ok', 'Connected');
    const modelsReady = (data.models_ready === undefined) ? true : !!data.models_ready;
    setPill($('modelStatus'), modelsReady ? 'ok' : 'bad', modelsReady ? 'Models Ready' : 'Not Ready');
    $('lastCheck').textContent = nowText();
    setPretty(`<div><strong>เชื่อมต่อ API สำเร็จ ✅</strong></div><div>ตรวจสอบล่าสุด: ${$('lastCheck').textContent}</div>`);
    setRaw(data);
  } catch (e) {
    setPill($('apiStatus'), 'bad', 'Disconnected');
    setPill($('modelStatus'), 'neutral', '-');
    $('lastCheck').textContent = nowText();
    setPretty(`<div style="color:#b03860"><strong>เชื่อมต่อ API ไม่สำเร็จ ❌</strong></div><div>${e.message}</div>`);
    setRaw({ error: e.message });
  }
}

async function predictDropout(){
  try {
    const data = await apiCall('/predict/dropout', getPayload());
    renderDropoutCard(data);
    setPretty(`<h4 style="margin:0 0 8px;color:#5b3c9f">ผลคาดการณ์การหลุดออก</h4>
      <div>Risk Level: <strong>${data.risk_level ?? '-'}</strong></div>
      <div>Probability: <strong>${fmtPct(data.dropout_probability ?? data.dropout_risk_probability)}</strong></div>
      <div>Recommended Action: ${data.recommended_action ?? '-'}</div>`);
    setRaw(data);
    showTabs('pretty');
  } catch (e) {
    setPretty(`<div style="color:#b03860">Predict dropout ไม่สำเร็จ: ${e.message}</div>`);
    setRaw({ error: e.message });
  }
}

async function predictScore(){
  try {
    const payload = getPayload();
    const data = await apiCall('/predict/score', payload);
    renderScoreCard(data);
    setPretty(`<h4 style="margin:0 0 8px;color:#5b3c9f">ผลคาดการณ์คะแนน</h4>
      <div>Reading: <strong>${fmtNum(data.predicted_score_reading)}</strong></div>
      <div>Math: <strong>${fmtNum(data.predicted_score_math)}</strong></div>
      <div>Average: <strong>${fmtNum(data.predicted_avg_score)}</strong></div>
      <div>Band: <strong>${data.performance_band ?? '-'}</strong></div>`);
    setRaw(data);
    showTabs('pretty');
  } catch (e) {
    setPretty(`<div style="color:#b03860">Predict score ไม่สำเร็จ: ${e.message}</div>`);
    setRaw({ error: e.message });
  }
}

async function simulatePolicy(){
  try {
    const payload = { ...getPayload(), policies: getPolicies() };
    const data = await apiCall('/simulate/policy', payload);
    renderPolicyCard(data);
    setPretty(`<h4 style="margin:0 0 8px;color:#5b3c9f">ผลจำลองนโยบาย</h4>
      <div>Policies: <strong>${(data.policies_applied || []).join(', ')}</strong></div>
      <div>Dropout Risk: <strong>${fmtNum(data.dropout_risk_before)}</strong> → <strong>${fmtNum(data.dropout_risk_after)}</strong></div>
      <div>Risk Change: <strong>${fmtNum(data.dropout_risk_change)}</strong></div>
      <div>Reading Change: <strong>${fmtNum(data.reading_score_change)}</strong></div>`);
    setRaw(data);
    showTabs('pretty');
  } catch (e) {
    setPretty(`<div style="color:#b03860">Simulate policy ไม่สำเร็จ: ${e.message}</div>`);
    setRaw({ error: e.message });
  }
}

function resetForm(){
  Object.entries(defaults).forEach(([k,v]) => { if ($(k)) $(k).value = v; });
  $('policy_scholarship').checked = true;
  $('policy_internet').checked = true;
  $('policy_remedial').checked = true;
}

document.querySelectorAll('.tab').forEach(btn => btn.addEventListener('click', () => showTabs(btn.dataset.tab)));
$('healthBtn').addEventListener('click', checkHealth);
$('healthBtnTop').addEventListener('click', checkHealth);
$('btnDropout').addEventListener('click', predictDropout);
$('btnScore').addEventListener('click', predictScore);
$('btnPolicy').addEventListener('click', simulatePolicy);
$('btnReset').addEventListener('click', resetForm);

checkHealth();
