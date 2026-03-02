
const $ = (id) => document.getElementById(id);

const defaults = {
  student_id: 'S001', sex: 'F', age: 15, grade: 9, academic_year: 2566,
  ses_quintile: 1, distance_km: 12, internet_home: 0, device_access: 0,
  attendance_rate: 0.68, baseline_skill_reading: 45, baseline_skill_math: 40,
};

const I18N = {
  th: {
    checkApiHealth: 'ตรวจสอบ API', connected: 'เชื่อมต่อแล้ว', disconnected: 'เชื่อมต่อไม่ได้', modelsReady: 'โมเดลพร้อมใช้งาน', modelsNotReady: 'โมเดลยังไม่พร้อม',
    lastCheckPending: 'กำลังตรวจสอบ...', healthOk: 'เชื่อมต่อ API สำเร็จ ✅', healthFail: 'เชื่อมต่อ API ไม่สำเร็จ ❌',
    consentRequired: 'กรุณาติ๊กยืนยันว่าข้อมูลเป็นข้อมูลจริงก่อนคำนวณ',
    invalidForm: 'กรุณาแก้ไขข้อมูลที่กรอกไม่ถูกต้องก่อนส่ง',
    consentText: 'ข้าพเจ้ารับรองว่าข้อมูลเป็นข้อมูลจริงและอยู่ในช่วงที่สมเหตุสมผล',
    consentNote: 'หมายเหตุ: ระบบไม่สามารถพิสูจน์ความจริงของข้อมูลได้ทั้งหมด แต่จะตรวจสอบช่วงข้อมูลและความสมเหตุสมผลเบื้องต้น',
    prettyPrompt: 'กดปุ่มด้านซ้ายเพื่อเริ่มคาดการณ์',
    batchPrompt: 'เลือกไฟล์ CSV/Excel แล้วกด Analyze File เพื่อสร้างรายงานภาพรวม',
    batchFail: 'วิเคราะห์ไฟล์ไม่สำเร็จ',
    batchNoFile: 'กรุณาเลือกไฟล์ก่อน',
    batchSummaryTitle: 'สรุปรายงานภาพรวม (หลายรายการ)',
    predictDropoutFail: 'คาดการณ์การหลุดออกไม่สำเร็จ', predictScoreFail: 'คาดการณ์คะแนนไม่สำเร็จ', policyFail: 'จำลองนโยบายไม่สำเร็จ',
    riskNone: 'ยังไม่มีผล', high:'สูง', medium:'ปานกลาง', low:'ต่ำ',
    fieldErrors: {
      student_id: 'กรุณากรอกรหัสนักเรียน', age: 'อายุต้องอยู่ระหว่าง 5–30 ปี', grade: 'ชั้นเรียนต้องอยู่ระหว่าง 1–20', academic_year: 'ปีการศึกษาต้องอยู่ระหว่าง 2555–2585',
      ses_quintile: 'SES Quintile ต้องเป็นเลข 1–5', distance_km: 'ระยะทางต้องอยู่ระหว่าง 0–300 กม.', attendance_rate: 'Attendance ต้องอยู่ระหว่าง 0–1',
      baseline_skill_reading: 'คะแนนอ่านต้องอยู่ระหว่าง 0–100', baseline_skill_math: 'คะแนนคณิตต้องอยู่ระหว่าง 0–100'
    }
  },
  en: {
    checkApiHealth: 'Check API Health', connected: 'Connected', disconnected: 'Disconnected', modelsReady: 'Models Ready', modelsNotReady: 'Models Not Ready',
    lastCheckPending: 'Checking...', healthOk: 'API connected ✅', healthFail: 'API connection failed ❌',
    consentRequired: 'Please confirm the data is truthful before running prediction.',
    invalidForm: 'Please fix invalid fields before submitting.',
    consentText: 'I confirm the entered information is truthful and within realistic ranges.',
    consentNote: 'Note: The system cannot fully verify truthfulness, but it validates ranges and basic plausibility.',
    prettyPrompt: 'Click a button on the left to start prediction',
    batchPrompt: 'Choose a CSV/Excel file and click Analyze File to generate an overview report',
    batchFail: 'Batch analysis failed',
    batchNoFile: 'Please choose a file first',
    batchSummaryTitle: 'Batch Overview Report',
    predictDropoutFail: 'Predict dropout failed', predictScoreFail: 'Predict score failed', policyFail: 'Policy simulation failed',
    riskNone: 'No result yet', high:'High', medium:'Medium', low:'Low',
    fieldErrors: {
      student_id: 'Student ID is required', age: 'Age must be between 5 and 30', grade: 'Grade must be between 1 and 20', academic_year: 'Academic year must be between 2555 and 2585',
      ses_quintile: 'SES Quintile must be 1–5', distance_km: 'Distance must be between 0 and 300 km', attendance_rate: 'Attendance must be between 0 and 1',
      baseline_skill_reading: 'Reading score must be 0–100', baseline_skill_math: 'Math score must be 0–100'
    }
  }
};
let currentLang = 'th';

function t(key){ return I18N[currentLang][key] ?? key; }
function nowText(){ return new Date().toLocaleString(currentLang === 'th' ? 'th-TH' : 'en-US'); }
function getApiBase(){ return $('apiBase').value.trim().replace(/\/$/, ''); }
function setPill(el, type, text){ el.className = 'pill ' + type; el.textContent = text; }
function fmtPct(v){ return (v===undefined||v===null||isNaN(v)) ? '-' : (Number(v)*100).toFixed(2)+'%'; }
function fmtNum(v){ return (v===undefined||v===null||isNaN(v)) ? '-' : Number(v).toFixed(2); }
function setRaw(data){ $('rawOutput').textContent = JSON.stringify(data, null, 2); }
function setPretty(html){ $('prettyOutput').innerHTML = html; }
function showTabs(tab){ document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab===tab)); $('prettyOutput').classList.toggle('hidden', tab !== 'pretty'); $('rawOutput').classList.toggle('hidden', tab !== 'raw'); }
function alertBox(msg, type='error'){ const el=$('formAlert'); if(!msg){el.className='form-alert hidden';el.textContent='';return;} el.className='form-alert'+(type==='info'?' info':''); el.textContent=msg; }

function setLanguage(lang){
  currentLang = lang;
  document.documentElement.lang = lang;
  $('langTh')?.classList.toggle('active', lang==='th');
  $('langEn')?.classList.toggle('active', lang==='en');
  document.querySelector('[data-i18n="checkApiHealth"]')?.replaceChildren(document.createTextNode(t('checkApiHealth')));
  document.querySelectorAll('[data-i18n="consentText"]').forEach(el => el.textContent = t('consentText'));
  document.querySelectorAll('[data-i18n="consentNote"]').forEach(el => el.textContent = t('consentNote'));
  if ($('prettyOutput') && $('prettyOutput').textContent.trim()==='') setPretty(t('prettyPrompt'));
}

function parseNum(id){
  const v = $(id).value;
  if (v === '' || v === '-' || v === null) return NaN;
  return Number(v);
}

function validateField(id, rule){
  const field = $(id);
  if (!field) return null;
  let err = '';
  let val = field.value?.trim?.() ?? field.value;
  if (rule.required && (val === '' || val === '-' || val == null)) err = I18N[currentLang].fieldErrors[id] || 'Required';
  const numVal = rule.type === 'number' ? Number(val) : null;
  if (!err && rule.type === 'number') {
    if (Number.isNaN(numVal)) err = I18N[currentLang].fieldErrors[id] || 'Invalid number';
    if (!err && rule.min !== undefined && numVal < rule.min) err = I18N[currentLang].fieldErrors[id];
    if (!err && rule.max !== undefined && numVal > rule.max) err = I18N[currentLang].fieldErrors[id];
    if (!err && rule.integer && !Number.isInteger(numVal)) err = I18N[currentLang].fieldErrors[id];
  }
  field.classList.toggle('invalid', !!err);
  let small = field.parentElement.querySelector('.error-text');
  if (!small) {
    small = document.createElement('div');
    small.className = 'error-text';
    field.parentElement.appendChild(small);
  }
  small.textContent = err;
  return err;
}

const rules = {
  student_id:{required:true},
  age:{required:true,type:'number',integer:true,min:5,max:30},
  grade:{required:true,type:'number',integer:true,min:1,max:20},
  academic_year:{required:true,type:'number',integer:true,min:2555,max:2585},
  ses_quintile:{required:true,type:'number',integer:true,min:1,max:5},
  distance_km:{required:true,type:'number',min:0,max:300},
  attendance_rate:{required:true,type:'number',min:0,max:1},
  baseline_skill_reading:{required:true,type:'number',min:0,max:100},
  baseline_skill_math:{required:true,type:'number',min:0,max:100},
};

function validateForm(showAlert=true){
  let errors = [];
  for (const [id,rule] of Object.entries(rules)) {
    const e = validateField(id, rule);
    if (e) errors.push(e);
  }
  if (!$('consent_truthful').checked) errors.push(t('consentRequired'));
  if (showAlert) alertBox(errors[0] || '', errors.length ? 'error':'');
  return { valid: errors.length===0, errors };
}

function getPayload(){
  return {
    student_id: $('student_id').value.trim(),
    sex: $('sex').value, // already M/F
    age: parseNum('age'),
    grade: parseNum('grade'),
    academic_year: parseNum('academic_year'),
    ses_quintile: parseNum('ses_quintile'),
    distance_km: parseNum('distance_km'),
    internet_home: Number($('internet_home').value),
    device_access: Number($('device_access').value),
    attendance_rate: parseNum('attendance_rate'),
    baseline_skill_reading: parseNum('baseline_skill_reading'),
    baseline_skill_math: parseNum('baseline_skill_math'),
    consent_truthful: true
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


async function apiCallForm(path, formData){
  const res = await fetch(getApiBase() + path, { method:'POST', body: formData });
  const txt = await res.text();
  let data;
  try { data = JSON.parse(txt); } catch { data = { raw: txt }; }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

function escHtml(v){ return String(v ?? '').replace(/[&<>\"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;' }[m])); }

function setMode(mode){
  document.body.classList.remove('mode-single','mode-batch');
  document.body.classList.add(mode === 'batch' ? 'mode-batch' : 'mode-single');
  const singlePanel = document.querySelector('.layout-grid .panel:nth-child(2)');
  if (singlePanel) singlePanel.classList.toggle('dimmed-panel', mode === 'batch');
}

function renderBatchSummaryCard(data){
  const s = data?.summary || {};
  const riskCounts = s.risk_counts || {};
  $('batchTotalRows').textContent = s.total_rows ?? '-';
  $('batchValidRows').textContent = s.valid_rows ?? '-';
  $('batchInvalidRows').textContent = s.invalid_rows ?? '-';
  $('batchHighRiskCount').textContent = riskCounts.High ?? '-';
  $('batchAtRiskRate').textContent = fmtPct(s.at_risk_rate);
  $('batchAvgRisk').textContent = fmtPct(s.avg_dropout_probability);
  $('batchAvgReading').textContent = fmtNum(s.avg_predicted_reading);
  if ($('batchPolicies')) $('batchPolicies').textContent = Array.isArray(s.policies_simulated) && s.policies_simulated.length ? s.policies_simulated.join(', ') : '-';

  const h = Number(riskCounts.High || 0), m = Number(riskCounts.Medium || 0), l = Number(riskCounts.Low || 0);
  const total = Math.max(1, h + m + l);
  const hp = (h / total) * 100, mp = (m / total) * 100, lp = (l / total) * 100;
  const setArc = (id, pct, offset) => {
    const el = $(id); if (!el) return offset;
    el.setAttribute('stroke-dasharray', `${pct} ${Math.max(0,100-pct)}`);
    el.setAttribute('stroke-dashoffset', String(25 - offset));
    return offset + pct;
  };
  let offset = 0; offset = setArc('donutHigh', hp, offset); offset = setArc('donutMed', mp, offset); setArc('donutLow', lp, offset);
  if ($('donutCenterText')) $('donutCenterText').textContent = `${(s.at_risk_rate!=null?fmtPct(s.at_risk_rate):fmtPct(h/Math.max(1,h+m+l)))}
At-risk`;
  if ($('legendHigh')) $('legendHigh').textContent = `${h} (${Math.round(hp)}%)`;
  if ($('legendMed')) $('legendMed').textContent = `${m} (${Math.round(mp)}%)`;
  if ($('legendLow')) $('legendLow').textContent = `${l} (${Math.round(lp)}%)`;

  const rows = Array.isArray(data.top_risk_students) ? data.top_risk_students : [];
  if (!rows.length) {
    $('batchTopRiskTable').innerHTML = '<span class="muted-note">-</span>';
    if ($('batchTopRiskBars')) $('batchTopRiskBars').innerHTML = '<span class="muted-note">-</span>';
    return;
  }
  const html = [`<table class="batch-table"><thead><tr><th>#</th><th>Student ID</th><th>Risk</th><th>Prob</th><th>Avg Score</th></tr></thead><tbody>`];
  rows.slice(0,10).forEach((r, i) => {
    html.push(`<tr><td>${i+1}</td><td>${escHtml(r.student_id)}</td><td>${escHtml(r.risk_level || '-')}</td><td class="num">${escHtml(fmtPct(r.dropout_probability))}</td><td class="num">${escHtml(fmtNum(r.predicted_avg_score))}</td></tr>`);
  });
  html.push('</tbody></table>');
  $('batchTopRiskTable').innerHTML = html.join('');

  const bars = rows.slice(0,5).map((r)=>{
    const p = Number(r.dropout_probability||0)*100;
    return `<div class="risk-bar-row"><div class="name">${escHtml(r.student_id||'-')}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(0,Math.min(100,p)).toFixed(1)}%"></div></div><div class="val">${fmtPct(r.dropout_probability)}</div></div>`;
  });
  if ($('batchTopRiskBars')) $('batchTopRiskBars').innerHTML = bars.join('');
}

async function runBatchReport(){
  if (!$('consent_truthful').checked) {
    alertBox(t('consentRequired'));
    setPretty(`<div style="color:#b03860">${t('consentRequired')}</div>`);
    setRaw({ error: t('consentRequired') });
    return;
  }
  const file = $('batchFile')?.files?.[0];
  if (!file) {
    alertBox(t('batchNoFile'));
    setPretty(`<div style="color:#b03860">${t('batchNoFile')}</div>`);
    setRaw({ error: t('batchNoFile') });
    return;
  }
  try {
    alertBox('');
    setPretty(`<div>${t('batchPrompt')}</div><div>${currentLang==='th'?'กำลังประมวลผลไฟล์...':'Processing file...'}</div>`);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('include_policy', String($('batchIncludePolicy')?.checked ?? true));
    fd.append('include_cluster', String($('batchIncludeCluster')?.checked ?? false));
    fd.append('return_records', String($('batchReturnRecords')?.checked ?? true));
    fd.append('max_rows', '2000');
    fd.append('policies', JSON.stringify(getPolicies()));
    const data = await apiCallForm('/batch/report', fd);
    setMode('batch');
    renderBatchSummaryCard(data);
    const summary = data.summary || {};
    const invalidPreview = Array.isArray(data.invalid_rows_preview) && data.invalid_rows_preview.length
      ? `<div style="margin-top:8px"><strong>Invalid rows preview:</strong> ${data.invalid_rows_preview.slice(0,3).map(r=>`#${r.row_number} ${escHtml(r.student_id||'')} (${escHtml(r.error)})`).join('<br>')}</div>`
      : '';
    setPretty(`<h4 style="margin:0 0 8px;color:#5b3c9f">${t('batchSummaryTitle')}</h4>
      <div>Total: <strong>${summary.total_rows ?? '-'}</strong> | Valid: <strong>${summary.valid_rows ?? '-'}</strong> | Invalid: <strong>${summary.invalid_rows ?? '-'}</strong></div>
      <div>At-risk rate: <strong>${fmtPct(summary.at_risk_rate)}</strong> | Avg dropout prob: <strong>${fmtPct(summary.avg_dropout_probability)}</strong></div>
      <div>Avg Reading: <strong>${fmtNum(summary.avg_predicted_reading)}</strong></div>
      <div>Risk counts (H/M/L): <strong>${summary.risk_counts?.High ?? 0}</strong> / <strong>${summary.risk_counts?.Medium ?? 0}</strong> / <strong>${summary.risk_counts?.Low ?? 0}</strong></div>
      ${invalidPreview}`);
    setRaw(data);
    showTabs('pretty');
  } catch (e) {
    setPretty(`<div style="color:#b03860">${t('batchFail')}: ${e.message}</div>`);
    setRaw({ error: e.message });
  }
}

function renderDropoutCard(data){
  const p = Number(data.dropout_probability ?? data.dropout_risk_probability);
  const threshold = Number(data.threshold_used);
  const atRisk = (typeof data.at_risk_flag === 'boolean') ? data.at_risk_flag : (Number.isFinite(p) && Number.isFinite(threshold) ? p >= threshold : false);
  let riskLabel = String(data.risk_level || '').trim();
  if (!riskLabel) riskLabel = atRisk ? t('high') : t('low');

  $('riskPercent').textContent = isNaN(p) ? '-' : `${(p*100).toFixed(2)}%`;
  $('dropoutProb').textContent = fmtPct(p);
  $('dropoutThreshold').textContent = fmtPct(data.threshold_used);
  $('dropoutAction').textContent = data.recommended_action || '-';

  let badgeClass = 'badge-muted';
  const lower = riskLabel.toLowerCase();
  if (atRisk || lower.includes('high')) badgeClass = 'badge-high';
  else if (lower.includes('med')) badgeClass = 'badge-mid';
  else if (lower.includes('low')) badgeClass = 'badge-low';
  $('riskBadge').className = `badge ${badgeClass}`;
  $('riskBadge').textContent = riskLabel;

  // warn if backend sends inconsistent values
  if (Number.isFinite(p) && Number.isFinite(threshold)) {
    const contradiction = (atRisk === false && lower.includes('high')) || (atRisk === true && lower.includes('low'));
    if (contradiction) {
      alertBox(currentLang === 'th' ? 'API ส่งผลลัพธ์ไม่สอดคล้องกัน (risk_level vs threshold) ระบบจะแสดงค่าตาม at_risk_flag/threshold เป็นหลัก' : 'API returned inconsistent values (risk_level vs threshold). UI prioritizes at_risk_flag/threshold.', 'info');
    }
  }
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
  if ($('polReadingBefore')) $('polReadingBefore').textContent = fmtNum(data.reading_score_before);
  if ($('polReadingAfter')) $('polReadingAfter').textContent = fmtNum(data.reading_score_after);
  if ($('polMathBefore')) $('polMathBefore').textContent = fmtNum(data.math_score_before);
  if ($('polMathAfter')) $('polMathAfter').textContent = fmtNum(data.math_score_after);
  if ($('polMathChange')) $('polMathChange').textContent = fmtNum(data.math_score_change);
  $('polApplied').textContent = Array.isArray(data.policies_applied) ? data.policies_applied.join(', ') : '-';
}

async function checkHealth(){
  $('lastCheck').textContent = t('lastCheckPending');
  try {
    const data = await apiCall('/health', null, 'GET');
    setPill($('apiStatus'), 'ok', t('connected'));
    const modelsReady = (data.models_ready === undefined) ? true : !!data.models_ready;
    setPill($('modelStatus'), modelsReady ? 'ok' : 'bad', modelsReady ? t('modelsReady') : t('modelsNotReady'));
    $('lastCheck').textContent = nowText();
    setPretty(`<div><strong>${t('healthOk')}</strong></div><div>${$('lastCheck').textContent}</div>`);
    setRaw(data);
  } catch (e) {
    setPill($('apiStatus'), 'bad', t('disconnected'));
    setPill($('modelStatus'), 'neutral', '-');
    $('lastCheck').textContent = nowText();
    setPretty(`<div style="color:#b03860"><strong>${t('healthFail')}</strong></div><div>${e.message}</div>`);
    setRaw({ error: e.message });
  }
}

async function runWithValidation(path, runner, failText){
  const state = validateForm(true);
  if (!state.valid) {
    setPretty(`<div style="color:#b03860">${t('invalidForm')}</div>`);
    setRaw({ error: state.errors[0] });
    return;
  }
  try {
    alertBox('');
    await runner();
  } catch (e) {
    setPretty(`<div style="color:#b03860">${failText}: ${e.message}</div>`);
    setRaw({ error: e.message });
  }
}

async function predictDropout(){
  await runWithValidation('/predict/dropout', async () => {
    const data = await apiCall('/predict/dropout', getPayload());
    setMode('single');
    renderDropoutCard(data);
    const p = data.dropout_probability ?? data.dropout_risk_probability;
    setPretty(`<h4 style="margin:0 0 8px;color:#5b3c9f">Dropout Prediction</h4>
      <div>Risk Level: <strong>${data.risk_level ?? '-'}</strong></div>
      <div>Probability: <strong>${fmtPct(p)}</strong></div>
      <div>Threshold: <strong>${fmtPct(data.threshold_used)}</strong></div>
      <div>Recommended Action: ${data.recommended_action ?? '-'}</div>`);
    setRaw(data);
    showTabs('pretty');
  }, t('predictDropoutFail'));
}

async function predictScore(){
  await runWithValidation('/predict/score', async () => {
    const data = await apiCall('/predict/score', getPayload());
    setMode('single');
    renderScoreCard(data);
    setPretty(`<h4 style="margin:0 0 8px;color:#5b3c9f">Score Prediction</h4>
      <div>Reading: <strong>${fmtNum(data.predicted_score_reading)}</strong></div>
      <div>Math: <strong>${fmtNum(data.predicted_score_math)}</strong></div>
      <div>Average: <strong>${fmtNum(data.predicted_avg_score)}</strong></div>
      <div>Band: <strong>${data.performance_band ?? '-'}</strong></div>`);
    setRaw(data);
    showTabs('pretty');
  }, t('predictScoreFail'));
}

async function simulatePolicy(){
  await runWithValidation('/simulate/policy', async () => {
    const payload = { ...getPayload(), policies: getPolicies() };
    const data = await apiCall('/simulate/policy', payload);
    setMode('single');
    renderPolicyCard(data);
    setPretty(`<h4 style="margin:0 0 8px;color:#5b3c9f">Policy Simulation</h4>
      <div>Policies: <strong>${(data.policies_applied || []).join(', ')}</strong></div>
      <div>Dropout Risk: <strong>${fmtNum(data.dropout_risk_before)}</strong> → <strong>${fmtNum(data.dropout_risk_after)}</strong></div>
      <div>Risk Change: <strong>${fmtNum(data.dropout_risk_change)}</strong></div>
      <div>Reading: <strong>${fmtNum(data.reading_score_before)}</strong> → <strong>${fmtNum(data.reading_score_after)}</strong> (Δ ${fmtNum(data.reading_score_change)})</div>
`);
    setRaw(data);
    showTabs('pretty');
  }, t('policyFail'));
}

function resetForm(){
  Object.entries(defaults).forEach(([k,v]) => { if ($(k)) $(k).value = v; });
  $('policy_scholarship').checked = true;
  $('policy_internet').checked = true;
  $('policy_remedial').checked = true;
  $('consent_truthful').checked = false;
  if ($('batchFile')) $('batchFile').value = '';
  if ($('batchIncludePolicy')) $('batchIncludePolicy').checked = true;
  if ($('batchIncludeCluster')) $('batchIncludeCluster').checked = false;
  if ($('batchReturnRecords')) $('batchReturnRecords').checked = true;
  alertBox('');
  document.querySelectorAll('.invalid').forEach(el=>el.classList.remove('invalid'));
  document.querySelectorAll('.error-text').forEach(el=>el.textContent='');
  setMode('single');
}

// events
Array.from(document.querySelectorAll('.tab')).forEach(btn => btn.addEventListener('click', () => showTabs(btn.dataset.tab)));
$('healthBtn').addEventListener('click', checkHealth);
$('healthBtnTop').addEventListener('click', checkHealth);
$('btnDropout').addEventListener('click', predictDropout);
$('btnScore').addEventListener('click', predictScore);
$('btnPolicy').addEventListener('click', simulatePolicy);
$('btnReset').addEventListener('click', resetForm);
$('btnBatch')?.addEventListener('click', runBatchReport);
$('langTh')?.addEventListener('click', () => setLanguage('th'));
$('langEn')?.addEventListener('click', () => setLanguage('en'));
Object.keys(rules).forEach(id => $(id)?.addEventListener('input', () => validateField(id, rules[id])));
$('consent_truthful')?.addEventListener('change', () => validateForm(false));

setLanguage('th');
resetForm();
setPretty(I18N[currentLang].prettyPrompt);
checkHealth();
