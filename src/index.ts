import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>แบบสอบถามเรื่องการทบทวนหน้าที่และอำนาจของส่วนราชการภายใน สตง.</title>
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
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
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
        <div class="flex items-center gap-2 flex-shrink-0">
          <a href="/api/export" target="_blank" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition shadow-sm">
            ดาวน์โหลดผลลัพธ์ (Excel/CSV)
          </a>
        </div>
      </div>

      <!-- Instruction / Objective Card -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 bg-slate-50 p-5 rounded-xl border border-slate-200">
        <div class="space-y-4">
          <div>
            <h3 class="font-bold text-slate-900 text-sm mb-1 text-blue-700">วัตถุประสงค์</h3>
            <p class="leading-relaxed text-slate-600">
              เพื่อสำรวจการดำเนินงานตามหน้าที่และอำนาจที่กำหนดไว้ในปัจจุบัน ปัญหา/อุปสรรค ความเหมาะสมในการคงไว้หรือปรับปรุง และรวบรวมข้อเสนอหน้าที่และอำนาจใหม่ เพื่อใช้เป็นข้อมูลประกอบการทบทวนโครงสร้างส่วนราชการ
            </p>
          </div>
          <div class="pt-2 border-t border-slate-200">
            <h3 class="font-bold text-slate-900 text-sm mb-1">แหล่งข้อมูล</h3>
            <p class="leading-relaxed text-slate-600">
              ประกาศคณะกรรมการตรวจเงินแผ่นดิน เรื่อง การแบ่งส่วนราชการภายในและขอบเขตหน้าที่และอำนาจของส่วนราชการภายในสำนักงานการตรวจเงินแผ่นดิน พ.ศ. ๒๕๖๖ และไฟล์แก้ไข/เพิ่มเติมที่ได้รับ
            </p>
          </div>
        </div>

        <div class="space-y-2 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <h3 class="font-bold text-slate-900 text-sm mb-2">วิธีตอบแบบสอบถาม</h3>
          <ol class="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed">
            <li>พิจารณาหน้าที่และอำนาจแต่ละข้อจากข้อเท็จจริงของหน่วยงานในช่วงที่ผ่านมา แล้วเลือก <span class="font-semibold text-slate-800">“มี”</span> หรือ <span class="font-semibold text-slate-800">“ไม่มี”</span></li>
            <li>หากมีปัญหา/อุปสรรค โปรดระบุโดยสังเขป และพิจารณาว่าควร <span class="font-semibold text-slate-800">“คงไว้ / ปรับปรุง/แก้ไข / ไม่ควรคงไว้”</span></li>
            <li><span class="font-semibold text-slate-800">ส่วนที่ 2:</span> ให้เสนอหน้าที่และอำนาจใหม่ที่เห็นว่าควรกำหนดเพิ่มเติม พร้อมเหตุผลและรายละเอียดโดยสังเขป</li>
            <li>แบบสอบถามนี้จัดทำเพื่อเป็นข้อมูลประกอบการทบทวนโครงสร้าง <span class="text-rose-600 font-medium">มิใช่การประเมินผลการปฏิบัติงาน</span></li>
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
            placeholder="พิมพ์ชื่อสำนัก, จังหวัด หรือรหัสสำนัก (เช่น คดี, เชียงใหม่, 007)..."
            class="w-full p-3.5 pl-11 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white shadow-inner"
          />
          <svg class="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Autocomplete Suggestions List -->
        <div id="suggestionsList" class="hidden absolute z-30 left-0 right-0 mt-1.5 max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl divide-y divide-slate-100"></div>
      </div>
      <p class="text-xs text-slate-400">คลิกที่ผลลัพธ์เพื่อเปิดแบบสอบถามทันที</p>
    </section>

    <!-- Survey Form Container -->
    <div id="surveyContainer" class="hidden space-y-6">

      <div id="statusBanner" class="hidden p-4 rounded-xl text-sm font-medium"></div>

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

      <!-- ส่วนที่ 1: รายการอำนาจหน้าที่แบบ Card View กล่องใหญ่เต็มจอ -->
      <section class="space-y-4">
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="text-lg font-bold text-slate-900">ส่วนที่ 1: ทบทวนหน้าที่และอำนาจที่กำหนดไว้ในปัจจุบัน</h3>
          <p class="text-xs text-slate-500 mt-1">พิจารณาข้อเท็จจริงตามการปฏิบัติงาน ปัญหาอุปสรรค และความเหมาะสมในการคงไว้ <span class="text-rose-500 font-medium">(จำเป็นต้องเลือก "การดำเนินการ" และ "ความเห็นการคงไว้" ทุกข้อ)</span></p>
        </div>

        <div id="mandatesListContainer" class="space-y-4"></div>
      </section>

      <!-- ส่วนที่ 2: ข้อเสนอใหม่ -->
      <section class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-900">ส่วนที่ 2: ข้อเสนอหน้าที่และอำนาจใหม่ที่ควรเพิ่มเติม (ถ้ามี)</h3>
            <p class="text-xs text-slate-500 mt-0.5">ระบุภารกิจหรืออำนาจหน้าที่ที่เห็นควรให้กำหนดเพิ่มเติม พร้อมเหตุผลความจำเป็น</p>
          </div>
          <button type="button" id="btnAddProposal" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition">
            + เพิ่มข้อเสนอใหม่
          </button>
        </div>
        <div id="proposalsContainer" class="space-y-4"></div>
      </section>

      <!-- ส่วนที่ 3: ข้อมูลผู้ตอบ -->
      <section class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h3 class="text-lg font-bold text-slate-900">ส่วนที่ 3: ข้อมูลผู้ตอบแบบสอบถาม / ผู้ประสานงาน</h3>
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
        <div class="flex items-center gap-3">
          <button type="button" id="btnSaveDraft" class="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-sm font-semibold transition">
            บันทึกแบบร่าง
          </button>
          <button type="button" id="btnSubmit" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-md">
            ยืนยันส่งแบบสอบถาม
          </button>
        </div>
      </div>

    </div>

  </div>

  <script>
    let departmentsData = [];
    let currentDeptId = null;
    let currentDeptStatus = 'not_started';

    const deptSearchInput = document.getElementById('deptSearchInput');
    const suggestionsList = document.getElementById('suggestionsList');
    const surveyContainer = document.getElementById('surveyContainer');
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
    const btnSaveDraft = document.getElementById('btnSaveDraft');
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

    // ระบบค้นหาและแสดง Autocomplete Dropdown
    function renderSuggestions(searchText = '') {
  const q = searchText.trim().toLowerCase();

  let matches = departmentsData;

  if (q) {
    matches = departmentsData.filter(function(d) {
      return (
        d.name.toLowerCase().includes(q) ||
        d.id.includes(q)
      );
    });
  }

  if (matches.length === 0) {
    suggestionsList.innerHTML =
      '<div class="p-4 text-xs text-slate-400 text-center">ไม่พบสำนักที่ค้นหา</div>';

    suggestionsList.classList.remove('hidden');
    return;
  }

  suggestionsList.innerHTML = '';

  matches.forEach(function(d) {
    const item = document.createElement('div');

    item.className =
      'p-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between text-sm transition';

    let badgeHtml = '';

    if (d.status === 'submitted') {
      badgeHtml =
        '<span class="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-semibold">ส่งแล้ว</span>';
    } else if (d.status === 'draft') {
      badgeHtml =
        '<span class="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-semibold">กำลังร่าง</span>';
    }

    item.innerHTML =
      '<div class="flex items-center gap-2">' +
      '<span class="font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-bold">[' +
      d.id +
      ']</span>' +
      '<span class="font-medium text-slate-800">' +
      d.name +
      '</span>' +
      '</div>' +
      badgeHtml;

    item.addEventListener('click', function() {
      selectDepartment(d.id, d.name);
    });

    suggestionsList.appendChild(item);
  });

  suggestionsList.classList.remove('hidden');
}
  deptSearchInput.addEventListener('input', function(e) {
  renderSuggestions(e.target.value);
});

deptSearchInput.addEventListener('focus', function() {
  renderSuggestions('');
});

    // ซ่อน Dropdown เมื่อคลิกนอกกล่องค้นหา
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
      saveFeedback.textContent = 'กำลังโหลดข้อมูล...';
      try {
        const res = await fetch('/api/dept/' + deptId);
        const data = await res.json();
        
        currentDeptStatus = data.dept.status;
        deptCodeBadge.textContent = 'รหัส: ' + data.dept.id;
        deptNameDisplay.textContent = data.dept.name;
        deptRefDisplay.textContent = 'อ้างอิงหน้าที่และอำนาจ: ' + data.dept.articleRef;

        const isLocked = currentDeptStatus === 'submitted';
        updateLockUI(isLocked, data.dept);

        mandatesListContainer.innerHTML = '';
        data.mandates.forEach(function(m) {
          const resp = data.responses.find(function(r) { return r.mandate_id === m.id; }) || {};
          const card = document.createElement('div');
          card.className = 'bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4 hover:border-slate-300 transition mandate-card';
          card.dataset.mandateId = m.id;

          const actionYesChecked = resp.has_action === 'มี' ? 'checked' : '';
          const actionNoChecked = resp.has_action === 'ไม่มี' ? 'checked' : '';
          const disabledAttr = isLocked ? 'disabled' : '';

          card.innerHTML = 
            '<div class="flex items-start gap-3">' +
              '<span class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200">' + m.item_order + '</span>' +
              '<div class="text-sm font-medium text-slate-800 leading-relaxed pt-1">' + m.content + '</div>' +
            '</div>' +
            '<div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">' +
              '<div class="flex items-center gap-3">' +
                '<span class="text-xs font-semibold text-slate-600">การดำเนินการ: <span class="text-rose-500">*</span></span>' +
                '<label class="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer"><input type="radio" name="action_' + m.id + '" value="มี" ' + actionYesChecked + ' ' + disabledAttr + ' class="text-blue-600" /> มี</label>' +
                '<label class="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer"><input type="radio" name="action_' + m.id + '" value="ไม่มี" ' + actionNoChecked + ' ' + disabledAttr + ' class="text-blue-600" /> ไม่มี</label>' +
              '</div>' +
              '<div class="flex items-center gap-3">' +
                '<span class="text-xs font-semibold text-slate-600">ความเห็นการคงไว้: <span class="text-rose-500">*</span></span>' +
                '<select class="p-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-blue-500 w-full md:w-48" ' + disabledAttr + '>' +
                  '<option value="">-- โปรดเลือก --</option>' +
                  '<option value="คงไว้" ' + (resp.keep_status === 'คงไว้' ? 'selected' : '') + '>คงไว้</option>' +
                  '<option value="ปรับปรุง/แก้ไข" ' + (resp.keep_status === 'ปรับปรุง/แก้ไข' ? 'selected' : '') + '>ปรับปรุง/แก้ไข</option>' +
                  '<option value="ไม่ควรคงไว้" ' + (resp.keep_status === 'ไม่ควรคงไว้' ? 'selected' : '') + '>ไม่ควรคงไว้</option>' +
                '</select>' +
              '</div>' +
            '</div>' +
            '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
              '<div>' +
                '<label class="block text-xs font-semibold text-slate-600 mb-1">ปัญหา / อุปสรรคในการดำเนินการ (ถ้ามี)</label>' +
                '<textarea rows="3" class="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="ระบุปัญหาหรืออุปสรรค..." ' + disabledAttr + '>' + (resp.problems || '') + '</textarea>' +
              '</div>' +
              '<div>' +
                '<label class="block text-xs font-semibold text-slate-600 mb-1">ข้อเสนอแนะ / รายละเอียดเพิ่มเติม</label>' +
                '<textarea rows="3" class="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="ระบุข้อเสนอแนะเพิ่มเติม..." ' + disabledAttr + '>' + (resp.suggestion || '') + '</textarea>' +
              '</div>' +
            '</div>';

          mandatesListContainer.appendChild(card);
        });

        proposalsContainer.innerHTML = '';
        if (data.proposals && data.proposals.length > 0) {
          data.proposals.forEach(function(p) {
            addProposalRow(p.proposed_content, p.reason, isLocked);
          });
        }

        respName.value = data.dept.respondent_name || '';
        respPosition.value = data.dept.respondent_position || '';
        respPhone.value = data.dept.respondent_phone || '';

        respName.disabled = isLocked;
        respPosition.disabled = isLocked;
        respPhone.disabled = isLocked;

        surveyContainer.classList.remove('hidden');
        saveFeedback.textContent = '';
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการโหลดแบบสอบถาม');
      }
    }

    function updateLockUI(isLocked, dept) {
      if (isLocked) {
        statusBanner.className = 'p-4 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 block';
        statusBanner.textContent = 'แบบสอบถามนี้ส่งเรียบร้อยแล้ว เมื่อ ' + (dept.submitted_at || '-') + ' โดย ' + (dept.respondent_name || '-') + ' (สถานะ: ล็อกการแก้ไข)';
        btnSaveDraft.classList.add('hidden');
        btnSubmit.classList.add('hidden');
        btnAddProposal.classList.add('hidden');
      } else {
        if (currentDeptStatus === 'draft') {
          statusBanner.className = 'p-4 rounded-xl text-sm font-medium bg-amber-50 text-amber-800 border border-amber-200 block';
          statusBanner.textContent = 'แบบสอบถามนี้อยู่ระหว่างการบันทึกแบบร่าง สามารถแก้ไขและกดส่งได้เมื่อข้อมูลครบถ้วน';
        } else {
          statusBanner.className = 'hidden';
        }
        btnSaveDraft.classList.remove('hidden');
        btnSubmit.classList.remove('hidden');
        btnAddProposal.classList.remove('hidden');
      }
    }

    function addProposalRow(contentVal, reasonVal, isLocked) {
      contentVal = contentVal || '';
      reasonVal = reasonVal || '';
      isLocked = !!isLocked;

      const div = document.createElement('div');
      div.className = 'p-5 border border-slate-200 rounded-xl bg-slate-50 space-y-3 proposal-row';
      const disabledAttr = isLocked ? 'disabled' : '';

      let topHtml = '<div class="flex items-center justify-between"><span class="text-xs font-bold text-slate-700">ข้อเสนอหน้าที่และอำนาจใหม่</span>';
      if (!isLocked) {
        topHtml += '<button type="button" class="text-xs text-rose-600 hover:text-rose-800 font-semibold btn-del-proposal">ลบข้อนี้</button>';
      }
      topHtml += '</div>';

      div.innerHTML = topHtml +
        '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
          '<div>' +
            '<label class="block text-xs font-semibold text-slate-600 mb-1.5">ข้อความหน้าที่และอำนาจใหม่ที่ควรเพิ่มเติม</label>' +
            '<textarea rows="3" class="w-full p-2.5 border border-slate-300 rounded-lg text-xs prop-content bg-white" placeholder="ระบุข้อความอำนาจหน้าที่..." ' + disabledAttr + '>' + contentVal + '</textarea>' +
          '</div>' +
          '<div>' +
            '<label class="block text-xs font-semibold text-slate-600 mb-1.5">เหตุผลความจำเป็น / รายละเอียดโดยสังเขป</label>' +
            '<textarea rows="3" class="w-full p-2.5 border border-slate-300 rounded-lg text-xs prop-reason bg-white" placeholder="ระบุเหตุผลความจำเป็น..." ' + disabledAttr + '>' + reasonVal + '</textarea>' +
          '</div>' +
        '</div>';

      if (!isLocked) {
        const delBtn = div.querySelector('.btn-del-proposal');
        if (delBtn) {
          delBtn.onclick = function() { div.remove(); };
        }
      }

      proposalsContainer.appendChild(div);
    }

    btnAddProposal.onclick = function() { addProposalRow('', '', false); };

    function validateForm() {
      const cards = mandatesListContainer.querySelectorAll('.mandate-card');
      let isValid = true;
      let firstErrorCard = null;

      cards.forEach(function(c) {
        const actionRadio = c.querySelector('input[type="radio"]:checked');
        const keepSelect = c.querySelector('select');

        c.classList.remove('border-rose-500', 'bg-rose-50/20');

        const isActionChecked = !!actionRadio;
        const isKeepSelected = keepSelect && keepSelect.value !== '';

        if (!isActionChecked || !isKeepSelected) {
          isValid = false;
          c.classList.add('border-rose-500', 'bg-rose-50/20');
          if (!firstErrorCard) {
            firstErrorCard = c;
          }
        }
      });

      if (!isValid) {
        alert('กรุณาเลือก "การดำเนินการ" (มี หรือ ไม่มี) และ "ความเห็นการคงไว้" ให้ครบถ้วนทุกข้อ');
        if (firstErrorCard) {
          firstErrorCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return false;
      }

      const nameVal = respName.value.trim();
      const posVal = respPosition.value.trim();
      const phoneVal = respPhone.value.trim();

      if (!nameVal || !posVal || !phoneVal) {
        alert('กรุณากรอกข้อมูล "ส่วนที่ 3: ข้อมูลผู้ตอบแบบสอบถาม / ผู้ประสานงาน" (ชื่อ-นามสกุล, ตำแหน่ง, เบอร์โทรศัพท์) ให้ครบถ้วน');
        respName.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (!nameVal) respName.focus();
        else if (!posVal) respPosition.focus();
        else respPhone.focus();
        return false;
      }

      return true;
    }

    function collectPayload() {
      const cards = mandatesListContainer.querySelectorAll('.mandate-card');
      const responses = [];
      cards.forEach(function(c) {
        const mandateId = parseInt(c.dataset.mandateId, 10);
        const actionRadio = c.querySelector('input[type="radio"]:checked');
        const hasAction = actionRadio ? actionRadio.value : '';
        const keepSelect = c.querySelector('select');
        const keepStatus = keepSelect ? keepSelect.value : '';
        const textareas = c.querySelectorAll('textarea');
        const problems = textareas[0].value.trim();
        const suggestion = textareas[1].value.trim();

        responses.push({
          mandateId: mandateId,
          hasAction: hasAction,
          problems: problems,
          keepStatus: keepStatus,
          suggestion: suggestion
        });
      });

      const propRows = proposalsContainer.querySelectorAll('.proposal-row');
      const proposals = [];
      propRows.forEach(function(pr) {
        const cVal = pr.querySelector('.prop-content').value.trim();
        const rVal = pr.querySelector('.prop-reason').value.trim();
        if (cVal || rVal) {
          proposals.push({
            content: cVal,
            reason: rVal
          });
        }
      });

      return {
        respondentName: respName.value.trim(),
        respondentPosition: respPosition.value.trim(),
        respondentPhone: respPhone.value.trim(),
        responses: responses,
        proposals: proposals
      };
    }

    async function sendData(isSubmit) {
      if (!validateForm()) {
        return;
      }

      const payload = collectPayload();

      if (isSubmit) {
        const confirmSend = confirm('ยืนยันส่งแบบสอบถามของสำนักนี้หรือไม่?\\nเมื่อส่งแล้วจะไม่สามารถกลับมาแก้ไขได้');
        if (!confirmSend) return;
      }

      saveFeedback.textContent = isSubmit ? 'กำลังส่งแบบสอบถาม...' : 'กำลังบันทึกแบบร่าง...';
      btnSaveDraft.disabled = true;
      btnSubmit.disabled = true;

      try {
        const res = await fetch('/api/dept/' + currentDeptId + '/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            respondentName: payload.respondentName,
            respondentPosition: payload.respondentPosition,
            respondentPhone: payload.respondentPhone,
            responses: payload.responses,
            proposals: payload.proposals,
            isSubmit: isSubmit
          })
        });

        const result = await res.json();
        if (!res.ok) {
          alert(result.error || 'เกิดข้อผิดพลาดในการบันทึก');
          saveFeedback.textContent = '';
          btnSaveDraft.disabled = false;
          btnSubmit.disabled = false;
          return;
        }

        saveFeedback.textContent = isSubmit ? 'ส่งข้อมูลเรียบร้อยแล้ว' : 'บันทึกแบบร่างเรียบร้อยแล้ว';
        
        const dItem = departmentsData.find(function(d) { return d.id === currentDeptId; });
        if (dItem) {
          dItem.status = isSubmit ? 'submitted' : 'draft';
        }

        await loadDepartmentSurvey(currentDeptId);
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
        saveFeedback.textContent = '';
      } finally {
        btnSaveDraft.disabled = false;
        btnSubmit.disabled = false;
      }
    }

    btnSaveDraft.addEventListener('click', function() { sendData(false); });
    btnSubmit.addEventListener('click', function() { sendData(true); });

    initialize();
  </script>
</body>
</html>`);
});

// 2. API ดึงรายชื่อ 141 สำนัก พร้อมสถานะ
app.get('/api/depts', async (c) => {
  const query = 'SELECT id, name, status FROM departments ORDER BY CAST(id AS INTEGER) ASC, id ASC';
  const { results } = await c.env.DB.prepare(query).all();
  return c.json(results);
});

// 3. API ดึงข้อมูลแบบสอบถามประจำสำนัก
app.get('/api/dept/:id', async (c) => {
  const deptId = c.req.param('id');

  const dept = await c.env.DB.prepare(
    'SELECT id, name, article_ref as articleRef, status, respondent_name, respondent_position, respondent_phone, submitted_at FROM departments WHERE id = ?'
  ).bind(deptId).first();

  if (!dept) {
    return c.json({ error: 'ไม่พบข้อมูลส่วนราชการนี้' }, 404);
  }

  const mandates = await c.env.DB.prepare(
    'SELECT id, item_order, content FROM mandates WHERE dept_id = ? ORDER BY item_order ASC'
  ).bind(deptId).all();

  const responses = await c.env.DB.prepare(
    'SELECT mandate_id, has_action, problems, keep_status, suggestion FROM mandate_responses WHERE dept_id = ?'
  ).bind(deptId).all();

  const proposals = await c.env.DB.prepare(
    'SELECT item_order, proposed_content, reason FROM new_mandate_proposals WHERE dept_id = ? ORDER BY item_order ASC'
  ).bind(deptId).all();

  return c.json({
    dept: dept,
    mandates: mandates.results,
    responses: responses.results,
    proposals: proposals.results
  });
});

// 4. API บันทึกแบบร่าง และ ส่งแบบสอบถาม (Submit)
app.post('/api/dept/:id/save', async (c) => {
  const deptId = c.req.param('id');
  const body = await c.req.json();
  const { respondentName, respondentPosition, respondentPhone, responses, proposals, isSubmit } = body;

  const currentDept = await c.env.DB.prepare(
    'SELECT status FROM departments WHERE id = ?'
  ).bind(deptId).first<{ status: string }>();

  if (!currentDept) {
    return c.json({ error: 'ไม่พบข้อมูลส่วนราชการนี้' }, 404);
  }

  if (currentDept.status === 'submitted') {
    return c.json({ error: 'แบบสอบถามนี้ได้ส่งเรียบร้อยแล้ว ไม่สามารถแก้ไขได้' }, 403);
  }

  const statements: D1PreparedStatement[] = [];
  const now = new Date().toISOString();
  const newStatus = isSubmit ? 'submitted' : 'draft';

  // 4.1 อัปเดตข้อมูลสำนัก
  statements.push(
    c.env.DB.prepare(
      'UPDATE departments SET status = ?, respondent_name = ?, respondent_position = ?, respondent_phone = ?, submitted_at = CASE WHEN ? = 1 THEN ? ELSE submitted_at END, updated_at = ? WHERE id = ?'
    ).bind(newStatus, respondentName, respondentPosition, respondentPhone, isSubmit ? 1 : 0, now, now, deptId)
  );

  // 4.2 บันทึกคำตอบส่วนที่ 1
  if (Array.isArray(responses)) {
    for (const r of responses) {
      statements.push(
        c.env.DB.prepare(
          'INSERT INTO mandate_responses (dept_id, mandate_id, has_action, problems, keep_status, suggestion, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(dept_id, mandate_id) DO UPDATE SET has_action = excluded.has_action, problems = excluded.problems, keep_status = excluded.keep_status, suggestion = excluded.suggestion, updated_at = excluded.updated_at'
        ).bind(deptId, r.mandateId, r.hasAction, r.problems, r.keepStatus, r.suggestion, now)
      );
    }
  }

  // 4.3 บันทึกข้อเสนอใหม่ส่วนที่ 2
  statements.push(
    c.env.DB.prepare('DELETE FROM new_mandate_proposals WHERE dept_id = ?').bind(deptId)
  );

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

  return c.json({ success: true, status: newStatus });
});

// 5. API ส่งออกผลสรุปทั้งหมดเป็นไฟล์ CSV
app.get('/api/export', async (c) => {
  const query = `
    SELECT 
      d.id AS dept_id,
      d.name AS dept_name,
      d.status,
      d.respondent_name,
      d.respondent_position,
      d.respondent_phone,
      d.submitted_at,
      m.item_order,
      m.content AS mandate_content,
      COALESCE(r.has_action, '') AS has_action,
      COALESCE(r.problems, '') AS problems,
      COALESCE(r.keep_status, '') AS keep_status,
      COALESCE(r.suggestion, '') AS suggestion
    FROM departments d
    LEFT JOIN mandates m ON d.id = m.dept_id
    LEFT JOIN mandate_responses r ON d.id = r.dept_id AND m.id = r.mandate_id
    ORDER BY CAST(d.id AS INTEGER) ASC, m.item_order ASC
  `;

  const { results } = await c.env.DB.prepare(query).all();

  const escapeCsv = (str: unknown) => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return '"' + s + '"';
  };

  const headers = [
    'รหัสสำนัก',
    'ชื่อสำนัก',
    'สถานะ',
    'ชื่อผู้ตอบ',
    'ตำแหน่ง',
    'เบอร์โทรศัพท์',
    'วันที่ส่ง',
    'ข้อที่',
    'หน้าที่และอำนาจตามประกาศ',
    'การดำเนินการ',
    'ปัญหา/อุปสรรค',
    'ความเห็นการคงไว้',
    'ข้อเสนอแนะเพิ่มเติม'
  ];

  let csvRows = [headers.map(escapeCsv).join(',')];

  for (const row of results as any[]) {
    csvRows.push([
      escapeCsv(row.dept_id),
      escapeCsv(row.dept_name),
      escapeCsv(row.status === 'submitted' ? 'ส่งแล้ว' : (row.status === 'draft' ? 'กำลังร่าง' : 'ยังไม่เริ่ม')),
      escapeCsv(row.respondent_name),
      escapeCsv(row.respondent_position),
      escapeCsv(row.respondent_phone),
      escapeCsv(row.submitted_at),
      escapeCsv(row.item_order),
      escapeCsv(row.mandate_content),
      escapeCsv(row.has_action),
      escapeCsv(row.problems),
      escapeCsv(row.keep_status),
      escapeCsv(row.suggestion)
    ].join(','));
  }

  const csvContent = '\uFEFF' + csvRows.join('\r\n');

  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="stg_mandates_survey_results.csv"'
    }
  });
});

export default app;