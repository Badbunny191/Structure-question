import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// 1. หน้าแสดงผลเว็บแอปพลิเคชัน (Frontend Single Page)
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
<body class="bg-slate-50 text-slate-800 min-h-screen">
  <div class="max-w-6xl mx-auto px-4 py-8 space-y-6">

    <header class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
            สำนักงานการตรวจเงินแผ่นดิน
          </span>
          <h1 class="text-2xl font-bold text-slate-900 mt-2">
            แบบทบทวนหน้าที่และอำนาจของส่วนราชการภายใน สตง.
          </h1>
          <p class="text-sm text-slate-500 mt-1">
            เพื่อใช้เป็นข้อมูลประกอบการทบทวนโครงสร้างส่วนราชการ (จำนวน 141 สำนัก)
          </p>
        </div>
        <div class="flex items-center gap-2">
          <a href="/api/export" target="_blank" class="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition shadow-sm">
            ดาวน์โหลดผลลัพธ์ (Excel/CSV)
          </a>
        </div>
      </div>
    </header>

    <section class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
      <h2 class="text-base font-bold text-slate-900">เลือกส่วนราชการ / สำนักของท่าน</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">ค้นหาชื่อสำนักหรือจังหวัด</label>
          <input type="text" id="deptSearchInput" placeholder="พิมพ์คำค้น เช่น วินัย, เชียงใหม่, ภูมิภาคที่ 1..." class="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">รายชื่อสำนัก (141 สำนัก)</label>
          <select id="deptSelect" class="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
            <option value="">-- โปรดเลือกสำนัก --</option>
          </select>
        </div>
      </div>
    </section>

    <div id="surveyContainer" class="hidden space-y-6">

      <div id="statusBanner" class="hidden p-4 rounded-xl text-sm font-medium"></div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex items-center gap-3">
          <span id="deptCodeBadge" class="text-xs font-mono font-bold px-2.5 py-1 bg-blue-100 text-blue-800 rounded"></span>
          <h2 id="deptNameDisplay" class="text-xl font-bold text-slate-900"></h2>
        </div>
        <p id="deptRefDisplay" class="text-xs text-slate-500 mt-1"></p>
      </div>

      <section class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div>
          <h3 class="text-lg font-bold text-slate-900">ส่วนที่ 1: ทบทวนหน้าที่และอำนาจที่กำหนดไว้ในปัจจุบัน</h3>
          <p class="text-xs text-slate-500">พิจารณาข้อเท็จจริงตามการปฏิบัติงาน ปัญหาอุปสรรค และความเหมาะสมในการคงไว้</p>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse">
            <thead>
              <tr class="bg-slate-100 text-slate-700 text-xs border-b border-slate-200">
                <th class="p-3 w-12 text-center">ข้อ</th>
                <th class="p-3 w-2/5">หน้าที่และอำนาจตามประกาศ</th>
                <th class="p-3 w-32 text-center">การดำเนินการ</th>
                <th class="p-3">ปัญหา / อุปสรรค</th>
                <th class="p-3 w-36 text-center">ความเห็นการคงไว้</th>
                <th class="p-3">ข้อเสนอแนะเพิ่มเติม</th>
              </tr>
            </thead>
            <tbody id="mandatesTableBody" class="divide-y divide-slate-100"></tbody>
          </table>
        </div>
      </section>

      <section class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-900">ส่วนที่ 2: ข้อเสนอหน้าที่และอำนาจใหม่ที่ควรเพิ่มเติม (ถ้ามี)</h3>
            <p class="text-xs text-slate-500">ระบุภารกิจหรืออำนาจหน้าที่ที่เห็นควรให้กำหนดเพิ่มเติม พร้อมเหตุผลความจำเป็น</p>
          </div>
          <button type="button" id="btnAddProposal" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition">
            + เพิ่มข้อเสนอ
          </button>
        </div>
        <div id="proposalsContainer" class="space-y-3"></div>
      </section>

      <section class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h3 class="text-lg font-bold text-slate-900">ส่วนที่ 3: ข้อมูลผู้ตอบแบบสอบถาม / ผู้ประสานงาน</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">ชื่อ - นามสกุล <span class="text-rose-500">*</span></label>
            <input type="text" id="respName" class="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="เช่น นายสมชาย ใจดี" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">ตำแหน่ง <span class="text-rose-500">*</span></label>
            <input type="text" id="respPosition" class="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="เช่น นักทรัพยากรบุคคลชำนาญการพิเศษ" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">เบอร์โทรศัพท์ติดต่อ <span class="text-rose-500">*</span></label>
            <input type="text" id="respPhone" class="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="เช่น 02-xxx-xxxx ต่อ xxx" />
          </div>
        </div>
      </section>

      <div class="sticky bottom-4 bg-white/95 backdrop-blur border border-slate-200 p-4 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div id="saveFeedback" class="text-xs font-medium text-slate-600"></div>
        <div class="flex items-center gap-3">
          <button type="button" id="btnSaveDraft" class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-sm font-semibold transition">
            บันทึกแบบร่าง
          </button>
          <button type="button" id="btnSubmit" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm">
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
    const deptSelect = document.getElementById('deptSelect');
    const surveyContainer = document.getElementById('surveyContainer');
    const statusBanner = document.getElementById('statusBanner');
    const deptCodeBadge = document.getElementById('deptCodeBadge');
    const deptNameDisplay = document.getElementById('deptNameDisplay');
    const deptRefDisplay = document.getElementById('deptRefDisplay');
    const mandatesTableBody = document.getElementById('mandatesTableBody');
    const proposalsContainer = document.getElementById('proposalsContainer');
    const btnAddProposal = document.getElementById('btnAddProposal');
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
        renderDeptOptions(departmentsData);
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการโหลดรายชื่อสำนัก');
      }
    }

    function renderDeptOptions(list) {
      deptSelect.innerHTML = '<option value="">-- โปรดเลือกสำนัก --</option>';
      list.forEach(dept => {
        const opt = document.createElement('option');
        opt.value = dept.id;
        let badge = dept.status === 'submitted' ? ' [ส่งแล้ว]' : (dept.status === 'draft' ? ' [กำลังร่าง]' : '');
        opt.textContent = dept.id + ': ' + dept.name + badge;
        deptSelect.appendChild(opt);
      });
    }

    deptSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      const filtered = departmentsData.filter(d => d.name.toLowerCase().includes(q) || d.id.includes(q));
      renderDeptOptions(filtered);
    });

    deptSelect.addEventListener('change', async (e) => {
      currentDeptId = e.target.value;
      if (!currentDeptId) {
        surveyContainer.classList.add('hidden');
        return;
      }
      await loadDepartmentSurvey(currentDeptId);
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

        mandatesTableBody.innerHTML = '';
        data.mandates.forEach(m => {
          const resp = data.responses.find(r => r.mandate_id === m.id) || {};
          const tr = document.createElement('tr');
          tr.className = 'hover:bg-slate-50 transition';
          tr.dataset.mandateId = m.id;

          const actionYesChecked = resp.has_action === 'มี' ? 'checked' : '';
          const actionNoChecked = resp.has_action === 'ไม่มี' ? 'checked' : '';
          const disabledAttr = isLocked ? 'disabled' : '';

          tr.innerHTML = '<td class="p-3 text-center font-medium text-slate-500">' + m.item_order + '</td>' +
            '<td class="p-3 text-slate-700 text-xs leading-relaxed">' + m.content + '</td>' +
            '<td class="p-3 text-center">' +
              '<div class="inline-flex gap-2 text-xs">' +
                '<label class="flex items-center gap-1 cursor-pointer"><input type="radio" name="action_' + m.id + '" value="มี" ' + actionYesChecked + ' ' + disabledAttr + ' /> มี</label>' +
                '<label class="flex items-center gap-1 cursor-pointer"><input type="radio" name="action_' + m.id + '" value="ไม่มี" ' + actionNoChecked + ' ' + disabledAttr + ' /> ไม่มี</label>' +
              '</div>' +
            '</td>' +
            '<td class="p-3"><textarea rows="2" class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500" placeholder="ระบุถ้ามี..." ' + disabledAttr + '>' + (resp.problems || '') + '</textarea></td>' +
            '<td class="p-3 text-center">' +
              '<select class="w-full p-1.5 border border-slate-300 rounded text-xs bg-white" ' + disabledAttr + '>' +
                '<option value="">-- เลือก --</option>' +
                '<option value="คงไว้" ' + (resp.keep_status === 'คงไว้' ? 'selected' : '') + '>คงไว้</option>' +
                '<option value="ปรับปรุง/แก้ไข" ' + (resp.keep_status === 'ปรับปรุง/แก้ไข' ? 'selected' : '') + '>ปรับปรุง/แก้ไข</option>' +
                '<option value="ไม่ควรคงไว้" ' + (resp.keep_status === 'ไม่ควรคงไว้' ? 'selected' : '') + '>ไม่ควรคงไว้</option>' +
              '</select>' +
            '</td>' +
            '<td class="p-3"><textarea rows="2" class="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500" placeholder="ระบุเพิ่มเติม..." ' + disabledAttr + '>' + (resp.suggestion || '') + '</textarea></td>';

          mandatesTableBody.appendChild(tr);
        });

        proposalsContainer.innerHTML = '';
        if (data.proposals && data.proposals.length > 0) {
          data.proposals.forEach(p => addProposalRow(p.proposed_content, p.reason, isLocked));
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

    function addProposalRow(contentVal = '', reasonVal = '', isLocked = false) {
      const div = document.createElement('div');
      div.className = 'p-4 border border-slate-200 rounded-lg bg-slate-50/50 space-y-3 proposal-row';
      const disabledAttr = isLocked ? 'disabled' : '';

      div.innerHTML = '<div class="flex items-center justify-between">' +
          '<span class="text-xs font-bold text-slate-700">ข้อเสนอใหม่</span>' +
          (!isLocked ? '<button type="button" class="text-xs text-rose-600 hover:text-rose-800 font-semibold" onclick="this.closest(\x27.proposal-row\x27).remove()">ลบข้อนี้</button>' : '') +
        '</div>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 gap-3">' +
          '<div>' +
            '<label class="block text-xs font-medium text-slate-600 mb-1">ข้อเสนอหน้าที่และอำนาจใหม่</label>' +
            '<textarea rows="2" class="w-full p-2 border border-slate-300 rounded text-xs prop-content bg-white" placeholder="ระบุข้อความอำนาจหน้าที่..." ' + disabledAttr + '>' + contentVal + '</textarea>' +
          '</div>' +
          '<div>' +
            '<label class="block text-xs font-medium text-slate-600 mb-1">เหตุผลความจำเป็น / รายละเอียดโดยสังเขป</label>' +
            '<textarea rows="2" class="w-full p-2 border border-slate-300 rounded text-xs prop-reason bg-white" placeholder="ระบุเหตุผล..." ' + disabledAttr + '>' + reasonVal + '</textarea>' +
          '</div>' +
        '</div>';

      proposalsContainer.appendChild(div);
    }

    btnAddProposal.addEventListener('click', () => addProposalRow());

    function collectPayload() {
      const rows = mandatesTableBody.querySelectorAll('tr');
      const responses = [];
      rows.forEach(r => {
        const mandateId = parseInt(r.dataset.mandateId, 10);
        const actionRadio = r.querySelector('input[type="radio"]:checked');
        const hasAction = actionRadio ? actionRadio.value : '';
        const problems = r.querySelectorAll('textarea')[0].value.trim();
        const keepStatus = r.querySelector('select').value;
        const suggestion = r.querySelectorAll('textarea')[1].value.trim();

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
      propRows.forEach(pr => {
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
      const payload = collectPayload();

      if (isSubmit) {
        if (!payload.respondentName || !payload.respondentPosition || !payload.respondentPhone) {
          alert('โปรดระบุข้อมูลส่วนที่ 3 (ชื่อ, ตำแหน่ง, เบอร์โทรศัพท์) ให้ครบถ้วนก่อนส่งแบบสอบถาม');
          return;
        }
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
            ...payload,
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
        
        const dItem = departmentsData.find(d => d.id === currentDeptId);
        if (dItem) {
          dItem.status = isSubmit ? 'submitted' : 'draft';
          renderDeptOptions(departmentsData);
          deptSelect.value = currentDeptId;
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

    btnSaveDraft.addEventListener('click', () => sendData(false));
    btnSubmit.addEventListener('click', () => sendData(true));

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

// 5. API ส่งออกผลสรุปทั้งหมดเป็นไฟล์ CSV (เปิดภาษาไทยใน Excel ได้ทันที)
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