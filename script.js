
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
    prevPage: 'ก่อนหน้า', nextPage: 'ถัดไป', pageInfo: 'หน้า', rowsRange: 'แสดง', ofTotal: 'จาก', recordsWord: 'รายการ',
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
    prevPage: 'Previous', nextPage: 'Next', pageInfo: 'Page', rowsRange: 'Showing', ofTotal: 'of', recordsWord: 'records',
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
let currentMode = 'single';
let lastBatchData = null;
let batchTablePage = 1;
const batchTablePageSize = 10;

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
  applyStaticI18n();
  if (lastBatchData) renderBatchSummaryCard(lastBatchData);
  if ($('prettyOutput') && $('prettyOutput').textContent.trim()==='') setPretty(currentMode==='batch' ? t('batchPrompt') : t('prettyPrompt'));
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

function escHtml(v){ return String(v ?? '').replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }


function setMode(mode){
  currentMode = mode;
  document.body.classList.toggle('single-hidden', mode === 'batch');
}

function applyStaticI18n(){
  const map = {
    batchAnalyzeTitle: {th:'วิเคราะห์เป็นกลุ่ม (Batch Report)', en:'Batch Analysis (Batch Report)'},
    includePolicy: {th:'รวมการจำลองนโยบาย', en:'Include Policy Simulation'},
    includeCluster: {th:'รวมการจัดกลุ่มความเสี่ยง', en:'Include Cluster Assignment'},
    returnDetailed: {th:'ส่งกลับข้อมูลรายรายการ', en:'Return Detailed Records'},
    batchRequiredCols: {th:'คอลัมน์ที่ต้องมี: student_id, sex, age, grade, academic_year, ses_quintile, distance_km, internet_home, device_access, attendance_rate, baseline_skill_reading, baseline_skill_math', en:'Required columns: student_id, sex, age, grade, academic_year, ses_quintile, distance_km, internet_home, device_access, attendance_rate, baseline_skill_reading, baseline_skill_math'},
    analyzeFile: {th:'Analyze File', en:'Analyze File'},
    batchSummaryPanelTitle: {th:'สรุปรายงานภาพรวม (Batch)', en:'Batch Overview Summary'},
    batchTotalRows: {th:'จำนวนทั้งหมด', en:'Total Rows'},
    batchValidRows: {th:'ข้อมูลใช้ได้', en:'Valid Rows'},
    batchInvalidRows: {th:'ข้อมูลผิดพลาด', en:'Invalid Rows'},
    batchHighRiskCount: {th:'จำนวนเสี่ยงสูง', en:'High Risk Count'},
    batchAtRiskRate: {th:'อัตราเสี่ยง', en:'At-risk Rate'},
    batchAvgDropout: {th:'เฉลี่ยความเสี่ยงหลุดออก', en:'Avg Dropout Prob'},
    batchAvgReading: {th:'คะแนนอ่านเฉลี่ย', en:'Avg Reading'},
    batchAvgMath: {th:'คะแนนคณิตเฉลี่ย', en:'Avg Math'},
    batchAvgScore: {th:'คะแนนเฉลี่ยรวม', en:'Avg Score'},
    batchAvgRiskChange: {th:'การเปลี่ยนแปลงความเสี่ยงเฉลี่ย', en:'Avg Risk Change'},
    batchAvgReadingChange: {th:'การเปลี่ยนแปลงคะแนนอ่านเฉลี่ย', en:'Avg Reading Change'},
    batchAvgMathChange: {th:'การเปลี่ยนแปลงคะแนนคณิตเฉลี่ย', en:'Avg Math Change'},
    batchPoliciesSimulated: {th:'นโยบายที่จำลอง', en:'Policies Simulated'},
    topRiskStudents: {th:'นักเรียนเสี่ยงสูงสุด', en:'Top Risk Students'},
    topRiskPreview: {th:'ตัวอย่างรายชื่อเสี่ยงสูง', en:'Top Risk Students (preview)'},
    prettyTab: {th:'Pretty Result', en:'Pretty Result'},
    rawTab: {th:'Raw JSON', en:'Raw JSON'},
    downloadCsv: {th:'ดาวน์โหลดรายงาน (CSV)', en:'Download Report (CSV)'},
    prevPageBtn: {th:'ก่อนหน้า', en:'Previous'},
    nextPageBtn: {th:'ถัดไป', en:'Next'}
  };
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (map[key]) el.textContent = map[key][currentLang];
  });
}

function buildBatchCsv(){
  if (!lastBatchData) return null;
  const rows = [];
  const s = lastBatchData.summary || {};
  rows.push(['Section','Key','Value']);
  rows.push(['summary','total_rows', s.total_rows ?? '']);
  rows.push(['summary','valid_rows', s.valid_rows ?? '']);
  rows.push(['summary','invalid_rows', s.invalid_rows ?? '']);
  rows.push(['summary','high_risk_count', s.risk_counts?.High ?? '']);
  rows.push(['summary','medium_risk_count', s.risk_counts?.Medium ?? '']);
  rows.push(['summary','low_risk_count', s.risk_counts?.Low ?? '']);
  rows.push(['summary','at_risk_rate', s.at_risk_rate ?? '']);
  rows.push(['summary','avg_dropout_probability', s.avg_dropout_probability ?? '']);
  rows.push(['summary','avg_predicted_reading', s.avg_predicted_reading ?? '']);
  rows.push(['summary','policies_simulated', Array.isArray(s.policies_simulated) ? s.policies_simulated.join('|') : '']);
  rows.push([]);
  rows.push(['records','student_id','risk_level','dropout_probability','predicted_reading','predicted_math','predicted_avg_score']);
  const recs = Array.isArray(lastBatchData.records) ? lastBatchData.records : (Array.isArray(lastBatchData.top_risk_students) ? lastBatchData.top_risk_students : []);
  recs.forEach(r => rows.push(['records', r.student_id ?? '', r.risk_level ?? '', r.dropout_probability ?? '', r.predicted_score_reading ?? r.predicted_reading ?? '', r.predicted_score_math ?? r.predicted_math ?? '', r.predicted_avg_score ?? '']));
  return '\ufeff' + rows.map(cols => cols.map(v => {
    const cell = String(v ?? '');
    return /[\",\n]/.test(cell) ? '\"' + cell.replace(/\"/g, '\"\"') + '\"' : cell;
  }).join(',')).join('\n');
}

function downloadBatchCsv(){
  const csv = buildBatchCsv();
  if (!csv) return;
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
  a.href = url; a.download = `education-ml-batch-report-${ts}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}



function updateBatchPagerMeta(total){
  const totalPages = Math.max(1, Math.ceil((total||0) / batchTablePageSize));
  if (batchTablePage > totalPages) batchTablePage = totalPages;
  if (batchTablePage < 1) batchTablePage = 1;
  const start = total ? ((batchTablePage - 1) * batchTablePageSize) + 1 : 0;
  const end = total ? Math.min(total, start + batchTablePageSize - 1) : 0;
  const info = $('batchPageInfo');
  if (info) info.textContent = `${t('pageInfo')} ${batchTablePage} / ${totalPages}`;
  const range = $('batchRowsRange');
  if (range) range.textContent = total ? `${t('rowsRange')} ${start}-${end} ${t('ofTotal')} ${total} ${t('recordsWord')}` : '-';
  const prev = $('batchPrevPage');
  const next = $('batchNextPage');
  if (prev) prev.disabled = batchTablePage <= 1;
  if (next) next.disabled = batchTablePage >= totalPages;
}

function renderBatchTopRiskTablePaged(rows){
  const total = Array.isArray(rows) ? rows.length : 0;
  if (!total) {
    $('batchTopRiskTable').innerHTML = '<span class="muted-note">-</span>';
    updateBatchPagerMeta(0);
    return;
  }
  updateBatchPagerMeta(total);
  const startIdx = (batchTablePage - 1) * batchTablePageSize;
  const pageRows = rows.slice(startIdx, startIdx + batchTablePageSize);
  const tableHead = currentLang==='th'
    ? '<tr><th>#</th><th>รหัสนักเรียน</th><th>ความเสี่ยง</th><th>ความน่าจะเป็น</th><th>คะแนนเฉลี่ย</th></tr>'
    : '<tr><th>#</th><th>Student ID</th><th>Risk</th><th>Prob</th><th>Avg Score</th></tr>';
  const html = [`<table class="batch-table"><thead>${tableHead}</thead><tbody>`];
  pageRows.forEach((r, i) => {
    html.push(`<tr><td>${startIdx+i+1}</td><td>${escHtml(r.student_id)}</td><td>${escHtml(r.risk_level || '-')}</td><td class="num">${escHtml(fmtPct(r.dropout_probability))}</td><td class="num">${escHtml(fmtNum(r.predicted_avg_score))}</td></tr>`);
  });
  html.push('</tbody></table>');
  $('batchTopRiskTable').innerHTML = html.join('');
}

function renderBatchSummaryCard(data){
  lastBatchData = data || null;
  batchTablePage = 1;
  const s = data?.summary || {};
  $('batchTotalRows').textContent = s.total_rows ?? '-';
  $('batchValidRows').textContent = s.valid_rows ?? '-';
  $('batchInvalidRows').textContent = s.invalid_rows ?? '-';
  $('batchHighRiskCount').textContent = s.risk_counts?.High ?? '-';
  $('batchAtRiskRate').textContent = fmtPct(s.at_risk_rate);
  $('batchAvgRisk').textContent = fmtPct(s.avg_dropout_probability);
  $('batchAvgReading').textContent = fmtNum(s.avg_predicted_reading);
  if ($('batchAvgMath')) $('batchAvgMath').textContent = fmtNum(s.avg_predicted_math);
  if ($('batchAvgScore')) $('batchAvgScore').textContent = fmtNum(s.avg_predicted_score);
  if ($('batchAvgRiskChange')) $('batchAvgRiskChange').textContent = fmtNum(s.avg_dropout_risk_change);
  if ($('batchAvgReadingChange')) $('batchAvgReadingChange').textContent = fmtNum(s.avg_reading_score_change);
  if ($('batchAvgMathChange')) $('batchAvgMathChange').textContent = fmtNum(s.avg_math_score_change);
  $('batchPolicies').textContent = Array.isArray(s.policies_simulated) && s.policies_simulated.length ? s.policies_simulated.join(', ') : '-';

  const counts = {
    High: Number(s.risk_counts?.High || 0),
    Medium: Number(s.risk_counts?.Medium || 0),
    Low: Number(s.risk_counts?.Low || 0),
  };
  const total = Math.max(0, Number(s.valid_rows || 0));
  const highPct = total ? (counts.High / total) * 100 : 0;
  const mediumPct = total ? (counts.Medium / total) * 100 : 0;
  const lowPct = total ? (counts.Low / total) * 100 : 0;
  const d = $('batchRiskDonut');
  if (d) {
    const highDeg = highPct * 3.6;
    const medDeg = mediumPct * 3.6;
    d.style.background = `conic-gradient(#ea5a7e 0 ${highDeg}deg, #f4c34d ${highDeg}deg ${highDeg+medDeg}deg, #59c79b ${highDeg+medDeg}deg 360deg)`;
    $('batchRiskDonutCenter').innerHTML = `${fmtPct(s.at_risk_rate).replace('%','')}<small style="display:block;font-weight:600;font-size:.72rem;color:#7566a1;">${currentLang==='th'?'เสี่ยง':'at risk'}</small>`;
    $('batchRiskDonutCaption').textContent = currentLang==='th' ? 'สัดส่วนความเสี่ยง' : 'Risk distribution';
  }
  const legendLabel = { High: currentLang==='th' ? 'สูง' : 'High', Medium: currentLang==='th' ? 'ปานกลาง' : 'Medium', Low: currentLang==='th' ? 'ต่ำ' : 'Low' };
  $('batchRiskLegend').innerHTML = ['High','Medium','Low'].map(k => {
    const pct = total ? ((counts[k]/total)*100).toFixed(0) : 0;
    return `<div class="legend-row"><div class="legend-left"><span class="risk-dot ${k.toLowerCase()}"></span><span>${legendLabel[k]}</span></div><strong>${counts[k]} (${pct}%)</strong></div>`;
  }).join('');

  const rows = Array.isArray(data.top_risk_students) ? data.top_risk_students : [];
  if (!rows.length) {
    $('batchTopRiskBars').innerHTML = '<span class="muted-note">-</span>';
    renderBatchTopRiskTablePaged([]);
  } else {
    renderBatchTopRiskTablePaged(rows);
    const maxP = Math.max(...rows.slice(0,5).map(r=>Number(r.dropout_probability||0)), 1);
    $('batchTopRiskBars').innerHTML = `<div class="bar-list">${rows.slice(0,5).map(r => {
      const p = Number(r.dropout_probability||0);
      const w = Math.max(3, (p/maxP)*100);
      return `<div class="bar-row"><div>${escHtml(r.student_id)}</div><div class="bar-track"><div class="bar-fill" style="width:${w}%"></div></div><div class="bar-value">${fmtPct(p)}</div></div>`;
    }).join('')}</div>`;
  }

  const dlBtn = $('btnDownloadCsv');
  if (dlBtn) dlBtn.disabled = false;
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
      <div>${currentLang==='th'?'คะแนนอ่านเฉลี่ย':'Avg Reading'}: <strong>${fmtNum(summary.avg_predicted_reading)}</strong></div>
      <div>${currentLang==='th'?'จำนวนกลุ่มเสี่ยง (สูง/กลาง/ต่ำ)':'Risk counts (H/M/L)'}: <strong>${summary.risk_counts?.High ?? 0}</strong> / <strong>${summary.risk_counts?.Medium ?? 0}</strong> / <strong>${summary.risk_counts?.Low ?? 0}</strong></div>
      ${summary.avg_reading_score_change!==undefined?`<div>${currentLang==='th'?'การเปลี่ยนแปลงคะแนนอ่านเฉลี่ย':'Avg Reading Change'}: <strong>${fmtNum(summary.avg_reading_score_change)}</strong></div>`:''}
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
  setMode('single');
  await runWithValidation('/predict/dropout', async () => {
    const data = await apiCall('/predict/dropout', getPayload());
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
  setMode('single');
  await runWithValidation('/predict/score', async () => {
    const data = await apiCall('/predict/score', getPayload());
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
  setMode('single');
  await runWithValidation('/simulate/policy', async () => {
    const payload = { ...getPayload(), policies: getPolicies() };
    const data = await apiCall('/simulate/policy', payload);
    renderPolicyCard(data);
    setPretty(`<h4 style="margin:0 0 8px;color:#5b3c9f">Policy Simulation</h4>
      <div>Policies: <strong>${(data.policies_applied || []).join(', ')}</strong></div>
      <div>Dropout Risk: <strong>${fmtNum(data.dropout_risk_before)}</strong> → <strong>${fmtNum(data.dropout_risk_after)}</strong></div>
      <div>Risk Change: <strong>${fmtNum(data.dropout_risk_change)}</strong></div>
      <div>Reading: <strong>${fmtNum(data.reading_score_before)}</strong> → <strong>${fmtNum(data.reading_score_after)}</strong> (Δ ${fmtNum(data.reading_score_change)})</div>
      <div>Policies Applied: <strong>${(data.policies_applied || []).join(', ') || '-'}</strong></div>`);
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
$('btnDownloadCsv')?.addEventListener('click', downloadBatchCsv);
$('langTh')?.addEventListener('click', () => setLanguage('th'));
$('langEn')?.addEventListener('click', () => setLanguage('en'));
$('batchPrevPage')?.addEventListener('click', () => { if (!lastBatchData) return; batchTablePage = Math.max(1, batchTablePage - 1); renderBatchTopRiskTablePaged(lastBatchData.top_risk_students || []); });
$('batchNextPage')?.addEventListener('click', () => { if (!lastBatchData) return; batchTablePage = batchTablePage + 1; renderBatchTopRiskTablePaged(lastBatchData.top_risk_students || []); });
Object.keys(rules).forEach(id => $(id)?.addEventListener('input', () => validateField(id, rules[id])));
$('consent_truthful')?.addEventListener('change', () => validateForm(false));

setLanguage('th');
resetForm();
setMode('single');
setPretty(I18N[currentLang].prettyPrompt);
checkHealth();
