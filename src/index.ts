// หมายเหตุ: ต้องรันคำสั่ง npm install xlsx ก่อนใช้งานโค้ดนี้
import { Hono } from 'hono';
import * as XLSX from 'xlsx';

type Bindings = {
  DB: D1Database;
  ADMIN_PASSWORD?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// =========================================================================
// Helper Function: แปลงวันที่เป็นเวลาไทย (Asia/Bangkok)
// =========================================================================
function formatThaiDate(isoString: string | null | undefined): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;

    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Bangkok',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    
    let str = new Intl.DateTimeFormat('th-TH', options).format(d);
    // ปรับให้ได้ฟอร์แมต "DD/MM/YYYY HH:mm:ss น."
    str = str.replace(/,/g, '').replace(' เวลา ', ' ');
    return str + ' น.';
  } catch (e) {
    return isoString;
  }
}

// =========================================================================
// Middleware สำหรับป้องกันหน้า Admin และการ Export (Basic Auth)
// =========================================================================
const adminAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  const expectedPassword = c.env.ADMIN_PASSWORD;

  // ถ้าไม่มีการตั้งค่า ADMIN_PASSWORD ให้ล็อกดาวน์ทันทีด้วย Error 500
  if (!expectedPassword) {
    return new Response('ADMIN_PASSWORD secret is not configured', { status: 500 });
  }

  // Username คือ admin
  const expectedAuth = 'Basic ' + btoa(`admin:${expectedPassword}`);
  
  if (authHeader !== expectedAuth) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin Area (User: admin)"' }
    });
  }
  await next();
};

app.use('/admin', adminAuth);
app.use('/admin/*', adminAuth);
app.use('/api/admin/*', adminAuth);
app.use('/api/export', adminAuth);
app.use('/api/export/*', adminAuth);

// =========================================================================
// 1. หน้าหลักสำหรับผู้ตอบแบบสอบถาม (Survey UI)
// =========================================================================
app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>แบบทบทวนหน้าที่และอำนาจของส่วนราชการภายใน สตง.</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Sarabun', sans-serif; }
  </style>
</head>
<body class="bg-slate-100 text-slate-800 min-h-screen">
  <div class="max-w-5xl mx-auto px-4 py-8 space-y-6">

    <!-- Header -->
    <header class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div class="border-b border-slate-100 pb-6">
        <span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
          สำนักงานการตรวจเงินแผ่นดิน
        </span>
        <h1 class="text-2xl font-bold text-slate-900 mt-2">
          แบบสอบถามเรื่องการทบทวนหน้าที่และอำนาจของส่วนราชการภายใน สตง.
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          เพื่อใช้เป็นข้อมูลประกอบการทบทวนโครงสร้างการแบ่งส่วนราชการภายใน สตง. (จำนวน 141 สำนัก)
        </p>
      </div>

      <!-- Instruction / Objective Card -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 bg-slate-50 p-5 rounded-xl border border-slate-200">
        <div class="space-y-4">
          <div>
            <h3 class="font-bold text-slate-900 text-sm mb-1 text-blue-700">วัตถุประสงค์</h3>
            <p class="leading-relaxed text-slate-600">
              เพื่อสำรวจการปฏิบัติงานตามหน้าที่และอำนาจที่กำหนดไว้ในประกาศ คตง. เรื่อง การแบ่งส่วนราชการภายในและขอบเขตหน้าที่และอำนาจของส่วนราชการภายใน สตง. พ.ศ. 2566 รวมถึงปัญหาอุปสรรค ความเห็นในการคงไว้ ไม่ควรคงไว้ หรือต้องปรับปรุงแก้ไข และให้แสดงความคิดเห็นเกี่ยวกับหน้าที่และอำนาจที่เห็นว่าควรปรับปรุงแก้ไข หรือกำหนดเพิ่มเติม เพื่อใช้เป็นข้อมูลประกอบการพิจารณาทบทวนโครงสร้างการแบ่งส่วนราชการภายในของ สตง.
            </p>
          </div>
          <div class="pt-2 border-t border-slate-200">
            <h3 class="font-bold text-slate-900 text-sm mb-1">แหล่งข้อมูล</h3>
            <p class="leading-relaxed text-slate-600">
              ประกาศคณะกรรมการตรวจเงินแผ่นดิน เรื่อง การแบ่งส่วนราชการภายในและขอบเขตหน้าที่และอำนาจของส่วนราชการภายในสำนักงานการตรวจเงินแผ่นดิน พ.ศ. 2566
            </p>
          </div>
        </div>

        <div class="space-y-2 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <h3 class="font-bold text-slate-900 text-sm mb-2">วิธีตอบแบบสอบถาม</h3>
          <ol class="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed">
            <li>การปฏิบัติงานตามหน้าที่และอำนาจแต่ละข้อตามข้อเท็จจริงของหน่วยงานในช่วงที่ผ่านมา แล้วเลือก<span class="font-semibold text-slate-800">“มี”</span> หรือ <span class="font-semibold text-slate-800">“ไม่มี”</span></li>
            <li>หากมีปัญหาอุปสรรค โปรดระบุโดยสังเขป และให้ความเห็นว่า <span class="font-semibold text-slate-800">“ควรคงไว้ ไม่ควรคงไว้ หรือต้องปรับปรุงแก้ไข”</span></li>
            <li><span class="font-semibold text-slate-800">ส่วนที่ 2:</span> ให้แสดงความคิดเห็นเกี่ยวกับหน้าที่และอำนาจที่เห็นว่าควรแก้ไขปรับปรุงหรือกำหนดเพิ่มเติม พร้อมเหตุผลและรายละเอียดโดยสังเขป</li>
            <li>แบบสอบถามนี้จัดทำเพื่อเป็นข้อมูลประกอบการพิจารณาทบทวนโครงสร้างการแบ่งส่วนราชการภายในของสตง.เท่านั้น<span class="text-rose-600 font-medium">มิใช่การประเมินผลการปฏิบัติงานแต่อย่างใด</span></li>
          </ol>
        </div>
      </div>
    </header>

    <!-- Unified Search Box -->
    <section class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-3">
      <h2 class="text-base font-bold text-slate-900">ค้นหาและเลือกสำนักของท่าน</h2>
      <div class="relative">
        <div class="relative">
          <input
            type="text"
            id="deptSearchInput"
            autocomplete="off"
            placeholder="พิมพ์ชื่อสำนักเพื่อค้นหา หรือเลือกจากรายชื่อสำนักที่ปรากฎ (เช่น สำนักบริหารทรัพยากรบุคคล , สำนักตรวจเงินแผ่นดินจังหวัด...)"
            class="w-full p-3.5 pl-11 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white shadow-inner"
          />
          <svg class="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div id="suggestionsList" class="hidden absolute z-30 left-0 right-0 mt-1.5 max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl divide-y divide-slate-100"></div>
      </div>
      <p class="text-xs text-slate-400">คลิกที่ช่องด้านบนเพื่อเลือกสำนัก</p>
    </section>

    <!-- Survey Form Container -->
    <div id="surveyContainer" class="hidden space-y-6">

      <div id="statusBanner" class="hidden"></div>

      <!-- Dept Header Card -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <span id="deptCodeBadge" class="text-xs font-mono font-bold px-2.5 py-1 bg-blue-100 text-blue-800 rounded"></span>
            <h2 id="deptNameDisplay" class="text-xl font-bold text-slate-900"></h2>
          </div>
          <p id="deptRefDisplay" class="text-xs text-slate-500 mt-1.5"></p>
        </div>
        <button type="button" id="btnChangeDept" class="text-xs text-blue-600 hover:text-blue-800 font-semibold self-start sm:self-auto">
          เปลี่ยนสำนัก
        </button>
      </div>

      <!-- Survey Form Area (ซ่อนเมื่อส่งแล้ว) -->
      <div id="surveyFormArea" class="space-y-6">
        <!-- ส่วนที่ 1: รายการอำนาจหน้าที่ -->
        <section class="space-y-4">
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 class="text-lg font-bold text-slate-900">ส่วนที่ 1: ทบทวนหน้าที่และอำนาจที่กำหนดไว้ในปัจจุบัน</h3>
            <p class="text-xs text-slate-500 mt-1">พิจารณาข้อเท็จจริงจากการปฏิบัติงาน ปัญหาอุปสรรค และแสดงความเห็น <span class="text-rose-500 font-medium"> (จำเป็นต้องเลือกตอบตามหัวข้อ "การดำเนินการ" และ "ความเห็น" ทุกข้อ)</span></p>
          </div>
          <div id="mandatesListContainer" class="space-y-4"></div>
        </section>

        <!-- ส่วนที่ 2: ข้อเสนอใหม่ -->
        <section class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-slate-900">ส่วนที่ 2: ส่วนที่ 2: ข้อเสนอหน้าที่และอำนาจใหม่ที่ควรเพิ่มเติม (ถ้ามี)</h3>
              <p class="text-xs text-slate-500 mt-0.5">ระบุหน้าที่และอำนาจหรือภารกิจที่เห็นควรให้กำหนดเพิ่มเติม พร้อมเหตุผลความจำเป็น</p>
            </div>
            <button type="button" id="btnAddProposal" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition">
              + เพิ่มข้อเสนอใหม่
            </button>
          </div>
          <div id="proposalsContainer" class="space-y-4"></div>
        </section>

        <!-- ส่วนที่ 3: ข้อมูลผู้ตอบ -->
        <section class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h3 class="text-lg font-bold text-slate-900">ส่วนที่ 3: ข้อมูลผู้ตอบแบบสอบถาม </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">ชื่อ - นามสกุล <span class="text-rose-500">*</span></label>
              <input type="text" id="respName" class="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="เช่น นายสมชาย ใจดี" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">ตำแหน่ง <span class="text-rose-500">*</span></label>
              <input type="text" id="respPosition" class="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="เช่น ผู้อำนวยการสำนัก..." />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">เบอร์โทรศัพท์ติดต่อ <span class="text-rose-500">*</span></label>
              <input type="text" id="respPhone" class="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="เช่น 02-xxx-xxxx ต่อ xxx" />
            </div>
          </div>
        </section>

        <!-- Action Bar -->
        <div class="sticky bottom-4 bg-white/95 backdrop-blur border border-slate-200 p-4 rounded-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div id="saveFeedback" class="text-xs font-semibold text-slate-600"></div>
          <div class="flex items-center gap-3 w-full sm:w-auto">
            <button type="button" id="btnSubmit" class="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition shadow-md">
              ยืนยันส่งแบบสอบถาม
            </button>
          </div>
        </div>
      </div>

    </div>

  </div>

  <script>
    let departmentsData = [];
    let currentDeptId = null;

    const deptSearchInput = document.getElementById('deptSearchInput');
    const suggestionsList = document.getElementById('suggestionsList');
    const surveyContainer = document.getElementById('surveyContainer');
    const surveyFormArea = document.getElementById('surveyFormArea');
    const statusBanner = document.getElementById('statusBanner');
    const deptCodeBadge = document.getElementById('deptCodeBadge');
    const deptNameDisplay = document.getElementById('deptNameDisplay');
    const deptRefDisplay = document.getElementById('deptRefDisplay');
    const mandatesListContainer = document.getElementById('mandatesListContainer');
    const proposalsContainer = document.getElementById('proposalsContainer');
    const btnAddProposal = document.getElementById('btnAddProposal');
    const btnChangeDept = document.getElementById('btnChangeDept');
    const respName = document.getElementById('respName');
    const respPosition = document.getElementById('respPosition');
    const respPhone = document.getElementById('respPhone');
    const btnSubmit = document.getElementById('btnSubmit');
    const saveFeedback = document.getElementById('saveFeedback');

    async function initialize() {
      try {
        const res = await fetch('/api/depts');
        departmentsData = await res.json();
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการโหลดรายชื่อสำนัก');
      }
    }

    function renderSuggestions(searchText = '') {
      const q = searchText.trim().toLowerCase();
      let matches = departmentsData;

      if (q) {
        matches = departmentsData.filter(function(d) {
          return d.name.toLowerCase().includes(q) || d.id.includes(q);
        });
      }

      if (matches.length === 0) {
        suggestionsList.innerHTML = '<div class="p-4 text-xs text-slate-400 text-center">ไม่พบสำนักที่ค้นหา</div>';
        suggestionsList.classList.remove('hidden');
        return;
      }

      suggestionsList.innerHTML = '';
      matches.forEach(function(d) {
        const item = document.createElement('div');
        item.className = 'p-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between text-sm transition';
        
        let badgeHtml = '';
        if (d.status === 'submitted') {
          badgeHtml = '<span class="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-semibold">ส่งแล้ว</span>';
        }

        item.innerHTML = 
          '<div class="flex items-center gap-2">' +
            '<span class="font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-bold">[' + d.id + ']</span>' +
            '<span class="font-medium text-slate-800">' + d.name + '</span>' +
          '</div>' + badgeHtml;

        item.addEventListener('click', function() {
          selectDepartment(d.id, d.name);
        });

        suggestionsList.appendChild(item);
      });

      suggestionsList.classList.remove('hidden');
    }

    deptSearchInput.addEventListener('input', function(e) { renderSuggestions(e.target.value); });
    deptSearchInput.addEventListener('focus', function() { renderSuggestions(''); });

    document.addEventListener('click', function(e) {
      if (!deptSearchInput.contains(e.target) && !suggestionsList.contains(e.target)) {
        suggestionsList.classList.add('hidden');
      }
    });

    async function selectDepartment(deptId, deptName) {
      currentDeptId = deptId;
      deptSearchInput.value = '[' + deptId + '] ' + deptName;
      suggestionsList.classList.add('hidden');
      await loadDepartmentSurvey(deptId);
    }

    btnChangeDept.addEventListener('click', function() {
      surveyContainer.classList.add('hidden');
      deptSearchInput.value = '';
      renderSuggestions('');
      deptSearchInput.focus();
    });

    async function loadDepartmentSurvey(deptId) {
      surveyContainer.classList.add('hidden');
      saveFeedback.textContent = '';
      
      try {
        const res = await fetch('/api/dept/' + deptId);
        const data = await res.json();
        
        deptCodeBadge.textContent = 'รหัส: ' + data.dept.id;
        deptNameDisplay.textContent = data.dept.name;
        deptRefDisplay.textContent = 'อ้างอิงหน้าที่และอำนาจ: ' + data.dept.articleRef;

        if (data.dept.status === 'submitted') {
          // สำนักส่งแล้ว ล็อกทุกอย่างและซ่อนฟอร์ม ไม่แสดงข้อมูลใดๆ
          statusBanner.className = 'p-8 rounded-xl text-center bg-emerald-50 border border-emerald-200 block';
          statusBanner.innerHTML = 
            '<div class="text-4xl mb-3">✅</div>' +
            '<h3 class="text-xl font-bold text-emerald-800">สำนักนี้ได้ส่งแบบสอบถามเรียบร้อยแล้ว</h3>' +
            '<p class="text-sm font-medium text-emerald-600 mt-2">วันที่ส่ง: ' + (data.dept.submitted_at || '-') + '</p>' +
            '<p class="text-xs text-slate-500 mt-6">หากต้องการแก้ไขข้อมูล กรุณาติดต่อผู้ดูแลระบบ</p>';
          
          surveyFormArea.classList.add('hidden');
        } else {
          // สำนักยังไม่ส่ง แสดงฟอร์ม
          statusBanner.className = 'hidden';
          surveyFormArea.classList.remove('hidden');
          
          mandatesListContainer.innerHTML = '';
          data.mandates.forEach(function(m) {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4 hover:border-slate-300 transition mandate-card';
            card.dataset.mandateId = m.id;

            card.innerHTML = 
              '<div class="flex items-start gap-3">' +
                '<span class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200">' + m.item_order + '</span>' +
                '<div class="text-sm font-medium text-slate-800 leading-relaxed pt-1">' + m.content + '</div>' +
              '</div>' +
              '<div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">' +
                '<div class="flex items-center gap-3">' +
                  '<span class="text-xs font-semibold text-slate-600">การปฏิบัติงาน: <span class="text-rose-500">*</span></span>' +
                  '<label class="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer"><input type="radio" name="action_' + m.id + '" value="มี" class="text-blue-600" /> มี</label>' +
                  '<label class="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer"><input type="radio" name="action_' + m.id + '" value="ไม่มี" class="text-blue-600" /> ไม่มี</label>' +
                '</div>' +
                '<div class="flex items-center gap-3">' +
                  '<span class="text-xs font-semibold text-slate-600">ข้อคิดเห็นต่อหน้าที่และอำนาจนี้: <span class="text-rose-500">*</span></span>' +
                  '<select class="p-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-blue-500 w-full md:w-48 keep-select">' +
                    '<option value="">-- โปรดเลือก --</option>' +
                    '<option value="คงไว้">คงไว้</option>' +
                    '<option value="ปรับปรุง/แก้ไข">ปรับปรุง/แก้ไข</option>' +
                    '<option value="ไม่ควรคงไว้">ไม่ควรคงไว้</option>' +
                  '</select>' +
                '</div>' +
              '</div>' +
              '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
                '<div>' +
                  '<label class="block text-xs font-semibold text-slate-600 mb-1">ปัญหา / อุปสรรคในการปฏิบัติงาน (ถ้ามี)</label>' +
                  '<textarea rows="3" class="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="ระบุปัญหาหรืออุปสรรค..."></textarea>' +
                '</div>' +
                '<div>' +
                  '<label class="block text-xs font-semibold text-slate-600 mb-1">ข้อเสนอแนะ / รายละเอียดเพิ่มเติม</label>' +
                  '<textarea rows="3" class="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="ระบุข้อเสนอแนะเพิ่มเติม..."></textarea>' +
                '</div>' +
              '</div>';

            mandatesListContainer.appendChild(card);
          });

          proposalsContainer.innerHTML = '';
          
          respName.value = '';
          respPosition.value = '';
          respPhone.value = '';
          
          btnSubmit.disabled = false;
        }

        surveyContainer.classList.remove('hidden');
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลสำนัก');
      }
    }

    function addProposalRow() {
      const div = document.createElement('div');
      div.className = 'p-5 border border-slate-200 rounded-xl bg-slate-50 space-y-3 proposal-row';

      div.innerHTML = 
        '<div class="flex items-center justify-between"><span class="text-xs font-bold text-slate-700">ข้อเสนอหน้าที่และอำนาจใหม่</span>' +
        '<button type="button" class="text-xs text-rose-600 hover:text-rose-800 font-semibold btn-del-proposal">ลบข้อนี้</button></div>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
          '<div>' +
            '<label class="block text-xs font-semibold text-slate-600 mb-1.5">ข้อความหน้าที่และอำนาจใหม่ที่ควรเพิ่มเติม</label>' +
            '<textarea rows="3" class="w-full p-2.5 border border-slate-300 rounded-lg text-xs prop-content bg-white" placeholder="ระบุข้อความอำนาจหน้าที่..."></textarea>' +
          '</div>' +
          '<div>' +
            '<label class="block text-xs font-semibold text-slate-600 mb-1.5">เหตุผลความจำเป็น / รายละเอียดโดยสังเขป</label>' +
            '<textarea rows="3" class="w-full p-2.5 border border-slate-300 rounded-lg text-xs prop-reason bg-white" placeholder="ระบุเหตุผลความจำเป็น..."></textarea>' +
          '</div>' +
        '</div>';

      div.querySelector('.btn-del-proposal').addEventListener('click', function() { div.remove(); });
      proposalsContainer.appendChild(div);
    }

    btnAddProposal.addEventListener('click', function() { addProposalRow(); });

    async function submitSurvey() {
      // 1. Validation ส่วนที่ 1
      const cards = mandatesListContainer.querySelectorAll('.mandate-card');
      let isValid = true;
      let firstErrorCard = null;

      cards.forEach(function(c) {
        const actionRadio = c.querySelector('input[type="radio"]:checked');
        const keepSelect = c.querySelector('.keep-select');
        c.classList.remove('border-rose-500', 'bg-rose-50/20');

        if (!actionRadio || !keepSelect.value) {
          isValid = false;
          c.classList.add('border-rose-500', 'bg-rose-50/20');
          if (!firstErrorCard) {
            firstErrorCard = c;
          }
        }
      });

      if (!isValid) {
        alert('กรุณาเลือก "การปฏิบัติงาน" (มี หรือ ไม่มี) และ "ข้อคิดเห็นต่อหน้าที่และอำนาจนี้" ให้ครบถ้วนทุกข้อ');
        if (firstErrorCard) firstErrorCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // 2. Validation ส่วนที่ 3
      const rName = respName.value.trim();
      const rPos = respPosition.value.trim();
      const rPhone = respPhone.value.trim();

      if (!rName || !rPos || !rPhone) {
        alert('โปรดระบุข้อมูลส่วนที่ 3 (ชื่อ, ตำแหน่ง, เบอร์โทรศัพท์) ให้ครบถ้วน');
        respName.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (!rName) respName.focus();
        else if (!rPos) respPosition.focus();
        else respPhone.focus();
        return;
      }

      // 3. Confirm
      const confirmSend = confirm('ยืนยันส่งแบบสอบถามของสำนักนี้หรือไม่?\\nเมื่อส่งแล้วจะไม่สามารถกลับมาแก้ไขได้อีก');
      if (!confirmSend) return;

      // 4. Collect Data
      const responses = [];
      cards.forEach(function(c) {
        const textareas = c.querySelectorAll('textarea');
        responses.push({
          mandateId: parseInt(c.dataset.mandateId, 10),
          hasAction: c.querySelector('input[type="radio"]:checked').value,
          keepStatus: c.querySelector('.keep-select').value,
          problems: textareas[0].value.trim(),
          suggestion: textareas[1].value.trim()
        });
      });

      const proposals = [];
      proposalsContainer.querySelectorAll('.proposal-row').forEach(function(pr) {
        const cVal = pr.querySelector('.prop-content').value.trim();
        const rVal = pr.querySelector('.prop-reason').value.trim();
        if (cVal || rVal) {
          proposals.push({ content: cVal, reason: rVal });
        }
      });

      const payload = {
        respondentName: rName,
        respondentPosition: rPos,
        respondentPhone: rPhone,
        responses: responses,
        proposals: proposals
      };

      // 5. Send to API
      saveFeedback.textContent = 'กำลังส่งข้อมูล...';
      btnSubmit.disabled = true;

      try {
        const res = await fetch('/api/dept/' + currentDeptId + '/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await res.json();
        if (!res.ok) {
          alert(result.error || 'เกิดข้อผิดพลาดในการบันทึก');
          saveFeedback.textContent = '';
          btnSubmit.disabled = false;
          return;
        }

        // อัปเดต Data ภายในให้รู้ว่าส่งแล้ว แล้วโหลดหน้าของสำนักนี้ใหม่เพื่อให้โชว์ป้ายล็อก
        const dItem = departmentsData.find(d => d.id === currentDeptId);
        if (dItem) dItem.status = 'submitted';
        
        await loadDepartmentSurvey(currentDeptId);
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
        saveFeedback.textContent = '';
        btnSubmit.disabled = false;
      }
    }

    btnSubmit.addEventListener('click', submitSurvey);

    initialize();
  </script>
</body>
</html>`);
});

// =========================================================================
// 2. หน้า Dashboard สำหรับผู้ดูแลระบบ (Admin)
// =========================================================================
app.get('/admin', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ระบบติดตามแบบสอบถาม สตง. (Admin Dashboard)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Sarabun', sans-serif; }
  </style>
</head>
<body class="bg-slate-100 text-slate-800 min-h-screen">
  <div class="max-w-6xl mx-auto px-4 py-8 space-y-6">

    <!-- Header -->
    <header class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">
            Admin Dashboard
          </span>
          <span class="text-xs text-slate-400">|</span>
          <span class="text-xs font-medium text-slate-500">สำนักงานการตรวจเงินแผ่นดิน</span>
        </div>
        <h1 class="text-2xl font-bold text-slate-900 mt-2">
          ระบบติดตามสถานะการตอบแบบสอบถาม (141 สำนัก)
        </h1>
      </div>
      <div class="flex items-center gap-3">
        <a href="/" target="_blank" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition border border-slate-300">
          เปิดหน้าแบบสอบถาม
        </a>
        <!-- ดาวน์โหลดเป็นไฟล์ Excel ไฟล์เดียว 2 Sheets -->
        <a href="/api/export" target="_blank" class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition shadow-sm flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          ดาวน์โหลด Excel
        </a>
      </div>
    </header>

    <!-- KPI Metrics Cards -->
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
        <div class="text-sm font-semibold text-slate-500">สำนักทั้งหมด</div>
        <div id="statTotal" class="text-4xl font-bold text-slate-900 mt-1">141</div>
      </div>
      <div class="bg-white p-6 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm flex flex-col items-center justify-center">
        <div class="text-sm font-semibold text-emerald-700">ส่งข้อมูลแล้ว</div>
        <div class="flex items-baseline gap-2 mt-1">
          <span id="statSubmitted" class="text-4xl font-bold text-emerald-600">0</span>
          <span id="statPct" class="text-sm font-bold text-emerald-500 bg-emerald-100 px-2 py-0.5 rounded-full">0%</span>
        </div>
      </div>
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
        <div class="text-sm font-semibold text-slate-500">ยังไม่ส่ง</div>
        <div id="statNotStarted" class="text-4xl font-bold text-slate-600 mt-1">141</div>
      </div>
    </div>

    <!-- Filter and Search Bar -->
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="relative w-full md:w-96">
        <input type="text" id="adminSearchInput" placeholder="ค้นหารหัส หรือชื่อสำนัก..." class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
      </div>
      <div class="flex items-center gap-2">
        <button type="button" class="btn-filter px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 text-white" data-filter="all">ทั้งหมด</button>
        <button type="button" class="btn-filter px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200" data-filter="submitted">ส่งแล้ว</button>
        <button type="button" class="btn-filter px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200" data-filter="not_started">ยังไม่ส่ง</button>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-xs">
            <tr>
              <th class="p-4 w-16 text-center">รหัส</th>
              <th class="p-4">ชื่อส่วนราชการ</th>
              <th class="p-4 w-28 text-center">สถานะ</th>
              <th class="p-4">วันที่ส่ง / ผู้ตอบ</th>
              <th class="p-4 w-48 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody id="adminTableBody" class="divide-y divide-slate-100 font-medium">
            <tr><td colspan="5" class="p-8 text-center text-slate-400">กำลังโหลดข้อมูล...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>

  <script>
    let adminList = [];
    let currentFilter = 'all';

    const adminTableBody = document.getElementById('adminTableBody');
    const adminSearchInput = document.getElementById('adminSearchInput');
    const filterButtons = document.querySelectorAll('.btn-filter');

    async function loadAdminData() {
      try {
        const res = await fetch('/api/admin/summary');
        const data = await res.json();
        adminList = data.departments || [];

        const total = adminList.length;
        const submitted = adminList.filter(d => d.status === 'submitted').length;
        const notStarted = total - submitted;

        document.getElementById('statTotal').textContent = total;
        document.getElementById('statSubmitted').textContent = submitted;
        document.getElementById('statNotStarted').textContent = notStarted;
        document.getElementById('statPct').textContent = ((submitted / total) * 100).toFixed(1) + '%';

        renderTable();
      } catch (err) {
        adminTableBody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-rose-500 font-semibold">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>';
      }
    }

    function renderTable() {
      const q = adminSearchInput.value.trim().toLowerCase();
      
      const filtered = adminList.filter(function(d) {
        const matchQuery = d.id.includes(q) || d.name.toLowerCase().includes(q) || (d.respondent_name && d.respondent_name.toLowerCase().includes(q));
        const matchStatus = currentFilter === 'all' ? true : d.status === currentFilter;
        return matchQuery && matchStatus;
      });

      if (filtered.length === 0) {
        adminTableBody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-slate-400">ไม่พบข้อมูล</td></tr>';
        return;
      }

      adminTableBody.innerHTML = '';
      filtered.forEach(function(d) {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50 transition';

        const isSubmitted = d.status === 'submitted';
        const badgeHtml = isSubmitted 
          ? '<span class="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs">ส่งแล้ว</span>'
          : '<span class="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full font-bold text-xs">ยังไม่ส่ง</span>';

        const respondentHtml = isSubmitted 
          ? '<div class="text-xs text-slate-500 mb-0.5">' + (d.submitted_at || '-') + '</div><div class="text-slate-800 font-semibold">' + (d.respondent_name || '-') + '</div>'
          : '<span class="text-slate-400">-</span>';

        const actionHtml = isSubmitted
          ? '<div class="flex items-center justify-center gap-2">' +
              '<a href="/admin/view/' + d.id + '" target="_blank" class="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition">ดูข้อมูล</a>' +
              '<button type="button" onclick="resetDept(\\'' + d.id + '\\')" class="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition">รีเซ็ต</button>' +
            '</div>'
          : '<span class="text-xs text-slate-400">-</span>';

        tr.innerHTML = 
          '<td class="p-4 text-center font-mono font-bold text-slate-500">' + d.id + '</td>' +
          '<td class="p-4 font-bold text-slate-800">' + d.name + '</td>' +
          '<td class="p-4 text-center">' + badgeHtml + '</td>' +
          '<td class="p-4">' + respondentHtml + '</td>' +
          '<td class="p-4 text-center">' + actionHtml + '</td>';

        adminTableBody.appendChild(tr);
      });
    }

    window.resetDept = async function(deptId) {
      if (!confirm('ยืนยันการรีเซ็ตข้อมูลหรือไม่?\\nข้อมูลทั้งหมดของสำนักนี้จะถูกลบทิ้งอย่างถาวร!')) return;
      
      try {
        const res = await fetch('/api/admin/reset/' + deptId, { method: 'POST' });
        if (res.ok) {
          alert('รีเซ็ตข้อมูลสำนัก ' + deptId + ' เรียบร้อยแล้ว');
          loadAdminData();
        } else {
          alert('เกิดข้อผิดพลาดในการรีเซ็ต');
        }
      } catch (err) {
        alert('การเชื่อมต่อล้มเหลว');
      }
    };

    adminSearchInput.addEventListener('input', renderTable);

    filterButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        filterButtons.forEach(b => b.className = 'btn-filter px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200');
        this.className = 'btn-filter px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 text-white';
        currentFilter = this.dataset.filter;
        renderTable();
      });
    });

    loadAdminData();
  </script>
</body>
</html>`);
});

// =========================================================================
// 3. API สำหรับ Client (หน้าเว็บหลัก)
// =========================================================================

// ดึงรายชื่อไปใส่ Dropdown
app.get('/api/depts', async (c) => {
  const query = "SELECT id, name, CASE WHEN status='submitted' THEN 'submitted' ELSE 'not_started' END as status FROM departments ORDER BY CAST(id AS INTEGER) ASC, id ASC";
  const { results } = await c.env.DB.prepare(query).all();
  return c.json(results);
});

// โหลดข้อมูลแบบสอบถามประจำสำนัก
app.get('/api/dept/:id', async (c) => {
  const deptId = c.req.param('id');
  const dept = await c.env.DB.prepare(
    'SELECT id, name, article_ref as articleRef, status, submitted_at FROM departments WHERE id = ?'
  ).bind(deptId).first();

  if (!dept) return c.json({ error: 'ไม่พบข้อมูลส่วนราชการนี้' }, 404);

  // แปลงเวลาให้เป็นไทย
  dept.submitted_at = formatThaiDate(dept.submitted_at as string);

  // การปกป้องข้อมูล: ถ้าสำนักส่งแล้ว ห้ามโหลดคำตอบเดิมและข้อมูลติดต่อส่งกลับไปให้หน้าบ้านเด็ดขาด
  if (dept.status === 'submitted') {
    return c.json({ dept: dept, mandates: [], responses: [], proposals: [] });
  }

  const mandates = await c.env.DB.prepare(
    'SELECT id, item_order, content FROM mandates WHERE dept_id = ? ORDER BY item_order ASC'
  ).bind(deptId).all();

  return c.json({ dept: dept, mandates: mandates.results });
});

// บันทึกและส่งแบบสอบถาม (ทำกระบวนการ 5 ขั้นตอนแบบครบถ้วน ไม่ซ้ำซ้อน)
app.post('/api/dept/:id/submit', async (c) => {
  const deptId = c.req.param('id');
  const body = await c.req.json();
  const { respondentName, respondentPosition, respondentPhone, responses, proposals } = body;

  const currentDept = await c.env.DB.prepare('SELECT status FROM departments WHERE id = ?').bind(deptId).first<{ status: string }>();
  if (!currentDept) return c.json({ error: 'ไม่พบข้อมูลส่วนราชการนี้' }, 404);
  if (currentDept.status === 'submitted') return c.json({ error: 'แบบสอบถามนี้ได้ส่งเรียบร้อยแล้ว' }, 403);

  const statements: D1PreparedStatement[] = [];
  const now = new Date().toISOString();

  // ขั้นที่ 1: UPDATE departments
  statements.push(
    c.env.DB.prepare(
      "UPDATE departments SET status = 'submitted', respondent_name = ?, respondent_position = ?, respondent_phone = ?, submitted_at = ?, updated_at = ? WHERE id = ?"
    ).bind(respondentName, respondentPosition, respondentPhone, now, now, deptId)
  );

  // ขั้นที่ 2: DELETE mandate_responses เดิม
  statements.push(
    c.env.DB.prepare('DELETE FROM mandate_responses WHERE dept_id = ?').bind(deptId)
  );

  // ขั้นที่ 3: INSERT mandate_responses ใหม่
  if (Array.isArray(responses)) {
    for (const r of responses) {
      statements.push(
        c.env.DB.prepare(
          'INSERT INTO mandate_responses (dept_id, mandate_id, has_action, problems, keep_status, suggestion, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(deptId, r.mandateId, r.hasAction, r.problems, r.keepStatus, r.suggestion, now)
      );
    }
  }

  // ขั้นที่ 4: DELETE new_mandate_proposals เดิม
  statements.push(
    c.env.DB.prepare('DELETE FROM new_mandate_proposals WHERE dept_id = ?').bind(deptId)
  );

  // ขั้นที่ 5: INSERT new_mandate_proposals ใหม่
  if (Array.isArray(proposals)) {
    for (let i = 0; i < proposals.length; i++) {
      statements.push(
        c.env.DB.prepare(
          'INSERT INTO new_mandate_proposals (dept_id, item_order, proposed_content, reason) VALUES (?, ?, ?, ?)'
        ).bind(deptId, i + 1, proposals[i].content, proposals[i].reason)
      );
    }
  }

  await c.env.DB.batch(statements);
  return c.json({ success: true });
});

// =========================================================================
// 4. API สำหรับ Admin Dashboard (Protected by adminAuth)
// =========================================================================

app.get('/api/admin/summary', async (c) => {
  try {
    const query = `SELECT id, name, status, respondent_name, respondent_position, respondent_phone, submitted_at FROM departments ORDER BY CAST(id AS INTEGER) ASC, id ASC`;
    const { results } = await c.env.DB.prepare(query).all();
    
    // แปลงวันที่เป็นเวลาไทยสำหรับแสดงในหน้า Dashboard
    const formattedResults = results?.map((d: any) => ({
      ...d,
      submitted_at: formatThaiDate(d.submitted_at)
    }));

    return c.json({ departments: formattedResults || [] });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/api/admin/reset/:id', async (c) => {
  const deptId = c.req.param('id');
  const statements = [
    c.env.DB.prepare('DELETE FROM mandate_responses WHERE dept_id = ?').bind(deptId),
    c.env.DB.prepare('DELETE FROM new_mandate_proposals WHERE dept_id = ?').bind(deptId),
    c.env.DB.prepare(
      "UPDATE departments SET status = 'not_started', respondent_name = NULL, respondent_position = NULL, respondent_phone = NULL, submitted_at = NULL, updated_at = ? WHERE id = ?"
    ).bind(new Date().toISOString(), deptId)
  ];
  await c.env.DB.batch(statements);
  return c.json({ success: true });
});

// สร้างหน้า HTML สำหรับดูข้อมูลสำนักเดียว
app.get('/admin/view/:id', async (c) => {
  const deptId = c.req.param('id');
  const dept = await c.env.DB.prepare('SELECT * FROM departments WHERE id = ?').bind(deptId).first();
  if (!dept) return c.text('Not found', 404);

  // แปลงเวลาให้เป็นไทย
  dept.submitted_at = formatThaiDate(dept.submitted_at as string);

  const mandates = await c.env.DB.prepare('SELECT id, item_order, content FROM mandates WHERE dept_id = ? ORDER BY item_order ASC').bind(deptId).all();
  const responses = await c.env.DB.prepare('SELECT mandate_id, has_action, problems, keep_status, suggestion FROM mandate_responses WHERE dept_id = ?').bind(deptId).all();
  const proposals = await c.env.DB.prepare('SELECT item_order, proposed_content, reason FROM new_mandate_proposals WHERE dept_id = ? ORDER BY item_order ASC').bind(deptId).all();

  let html = `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"><title>ข้อมูลสำนัก ${dept.id}</title><script src="https://cdn.tailwindcss.com"></script><link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet"><style>body{font-family:'Sarabun',sans-serif;}</style></head><body class="bg-slate-100 p-8"><div class="max-w-4xl mx-auto space-y-6">`;
  
  html += `<div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
    <h1 class="text-xl font-bold text-slate-900">[${dept.id}] ${dept.name}</h1>
    <div class="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
      <div><strong>ผู้ตอบ:</strong> ${dept.respondent_name || '-'}</div>
      <div><strong>ตำแหน่ง:</strong> ${dept.respondent_position || '-'}</div>
      <div><strong>เบอร์โทรศัพท์:</strong> ${dept.respondent_phone || '-'}</div>
      <div><strong>วันที่ส่ง:</strong> ${dept.submitted_at || '-'}</div>
    </div>
  </div>`;

  html += `<h2 class="text-lg font-bold text-slate-800 mt-8 mb-4">ส่วนที่ 1: รายการอำนาจหน้าที่</h2><div class="space-y-4">`;
  mandates.results.forEach((m: any) => {
    const r = responses.results.find((r: any) => r.mandate_id === m.id) || {};
    html += `<div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
      <div class="font-semibold text-slate-800 mb-3">${m.item_order}. ${m.content}</div>
      <div class="grid grid-cols-2 gap-4 text-sm bg-blue-50/50 p-3 rounded-lg mb-3">
        <div><strong>การปฏิบัติงาน:</strong> <span class="${r.has_action === 'มี' ? 'text-emerald-600' : 'text-rose-600'} font-bold">${r.has_action || '-'}</span></div>
        <div><strong>ความเห็น:</strong> <span class="font-bold text-blue-700">${r.keep_status || '-'}</span></div>
      </div>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div><strong>ปัญหา/อุปสรรค:</strong><div class="mt-1 text-slate-600">${r.problems || '-'}</div></div>
        <div><strong>ข้อเสนอแนะ:</strong><div class="mt-1 text-slate-600">${r.suggestion || '-'}</div></div>
      </div>
    </div>`;
  });
  html += `</div>`;

  html += `<h2 class="text-lg font-bold text-slate-800 mt-8 mb-4">ส่วนที่ 2: ข้อเสนออำนาจหน้าที่ใหม่</h2><div class="space-y-4">`;
  if (!proposals.results || proposals.results.length === 0) {
    html += `<div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 text-center text-slate-500 text-sm">ไม่มีข้อเสนอเพิ่มเติม</div>`;
  } else {
    proposals.results.forEach((p: any, idx: number) => {
      html += `<div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 text-sm">
        <div class="font-bold text-slate-800 mb-2">ข้อเสนอที่ ${idx + 1}</div>
        <div class="mb-2"><strong>ข้อความที่เสนอ:</strong> <span class="text-slate-600">${p.proposed_content || '-'}</span></div>
        <div><strong>เหตุผลความจำเป็น:</strong> <span class="text-slate-600">${p.reason || '-'}</span></div>
      </div>`;
    });
  }
  html += `</div>`;

  html += `</div></body></html>`;
  return c.html(html);
});

// =========================================================================
// 5. API ส่งออกเป็นไฟล์ Excel 1 ไฟล์ (มี 2 Worksheets แยกข้อมูลชัดเจน)
// =========================================================================
app.get('/api/export', async (c) => {

  // Worksheet 1: ผลการทบทวนหน้าที่และอำนาจ
  const queryPart1 = `
    SELECT d.id AS dept_id, d.name AS dept_name, d.status, d.respondent_name, d.respondent_position, d.respondent_phone, d.submitted_at,
      m.item_order, m.content AS mandate_content,
      COALESCE(r.has_action, '') AS has_action, COALESCE(r.problems, '') AS problems, COALESCE(r.keep_status, '') AS keep_status, COALESCE(r.suggestion, '') AS suggestion
    FROM departments d
    LEFT JOIN mandates m ON d.id = m.dept_id
    LEFT JOIN mandate_responses r ON d.id = r.dept_id AND m.id = r.mandate_id
    ORDER BY CAST(d.id AS INTEGER) ASC, m.item_order ASC
  `;
  const { results: resultsPart1 } = await c.env.DB.prepare(queryPart1).all();

  const headersPart1 = ['รหัสสำนัก', 'ชื่อสำนัก', 'สถานะ', 'ชื่อผู้ตอบ', 'ตำแหน่ง', 'เบอร์โทรศัพท์', 'วันที่ส่ง', 'ข้อที่', 'หน้าที่และอำนาจตามประกาศ', 'การปฏิบัติงาน', 'ปัญหา/อุปสรรค', 'ข้อคิดเห็นต่อหน้าที่และอำนาจนี้', 'ข้อเสนอแนะเพิ่มเติม'];
  const dataPart1 = [headersPart1];
  for (const row of (resultsPart1 || [])) {
    dataPart1.push([
      row.dept_id, row.dept_name, row.status === 'submitted' ? 'ส่งแล้ว' : 'ยังไม่ส่ง',
      row.respondent_name, row.respondent_position, row.respondent_phone, formatThaiDate(row.submitted_at as string),
      row.item_order, row.mandate_content, row.has_action, row.problems, row.keep_status, row.suggestion
    ]);
  }

  // Worksheet 2: ข้อเสนออำนาจหน้าที่ใหม่
  const queryPart2 = `
    SELECT p.dept_id, d.name AS dept_name, d.status, d.respondent_name, d.respondent_position, d.respondent_phone, d.submitted_at, 
           p.item_order, p.proposed_content, p.reason 
    FROM new_mandate_proposals p
    JOIN departments d ON p.dept_id = d.id
    ORDER BY CAST(p.dept_id AS INTEGER) ASC, p.item_order ASC
  `;
  const { results: resultsPart2 } = await c.env.DB.prepare(queryPart2).all();

  const headersPart2 = ['รหัสสำนัก', 'ชื่อสำนัก', 'สถานะ', 'ชื่อผู้ตอบ', 'ตำแหน่ง', 'เบอร์โทรศัพท์', 'วันที่ส่ง', 'ลำดับข้อเสนอ', 'ข้อความที่เสนอ', 'เหตุผลความจำเป็น'];
  const dataPart2 = [headersPart2];
  for (const row of (resultsPart2 || [])) {
    dataPart2.push([
      row.dept_id, row.dept_name, row.status === 'submitted' ? 'ส่งแล้ว' : 'ยังไม่ส่ง',
      row.respondent_name, row.respondent_position, row.respondent_phone, formatThaiDate(row.submitted_at as string),
      row.item_order, row.proposed_content, row.reason
    ]);
  }

  // สร้างไฟล์ Excel (.xlsx) ด้วยไลบรารี xlsx
  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.aoa_to_sheet(dataPart1);
  const ws2 = XLSX.utils.aoa_to_sheet(dataPart2);

  XLSX.utils.book_append_sheet(wb, ws1, "ผลการทบทวนหน้าที่และอำนาจ");
  XLSX.utils.book_append_sheet(wb, ws2, "ข้อเสนออำนาจหน้าที่ใหม่");

  // สร้าง buffer เป็น Array สำหรับ Response
  const excelBuffer = XLSX.write(
    wb,
    {
      bookType: 'xlsx',
      type: 'buffer'
    }
  );
  

  return new Response(excelBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="stg_mandates_survey_results.xlsx"'
    }
  });
});

export default app;