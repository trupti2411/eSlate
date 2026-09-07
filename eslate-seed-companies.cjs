/**
 * eSlate Multi-Company Seeder
 * Creates 5 tutoring companies, each with:
 *   - 1 company admin + 1 tutor
 *   - Academic year + 4 NSW terms (auto-setup)
 *   - 7 courses (different subjects/year groups)
 *   - 1 class per course (different schedules)
 *   - 20 students with parent contacts
 *   - 3 published assignment library items
 *   - 3 assignments allocated to each student (not completed)
 */

const BASE = 'http://localhost:3000';

// Subject IDs from the DB (fixed, seeded at startup)
const SUBJECTS = {
  English: 1,
  Mathematics: 2,
  Reading: 3,
  Science: 4,
  ThinkingSkills: 5,
  Writing: 6,
};

// Day of week: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
const DAY_MAP = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };

// ── HTTP helpers ──────────────────────────────────────────────────────────────
let cookies = '';

async function getCsrf() {
  const r = await fetch(`${BASE}/api/auth/csrf-token`, {
    headers: cookies ? { Cookie: cookies } : {},
  });
  saveCookies(r);
  const d = await r.json();
  return d.csrfToken;
}

function saveCookies(response) {
  const hdrs = response.headers.getSetCookie?.() || [];
  if (!hdrs.length) return;
  const map = {};
  cookies.split('; ').forEach(c => {
    const eq = c.indexOf('=');
    if (eq > 0) map[c.slice(0, eq).trim()] = c.slice(eq + 1);
  });
  hdrs.forEach(hdr => {
    const part = hdr.split(';')[0];
    const eq = part.indexOf('=');
    if (eq > 0) map[part.slice(0, eq).trim()] = part.slice(eq + 1);
  });
  cookies = Object.entries(map).map(([k, v]) => `${k}=${v}`).join('; ');
}

async function api(method, path, body) {
  const csrf = await getCsrf();
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrf,
      ...(cookies ? { Cookie: cookies } : {}),
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  saveCookies(r);
  const text = await r.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { _raw: text }; }
  if (!r.ok) {
    throw new Error(`${method} ${path} → HTTP ${r.status}: ${JSON.stringify(data).slice(0, 300)}`);
  }
  return data;
}

async function login(email, password) {
  const csrf = await getCsrf();
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrf,
      ...(cookies ? { Cookie: cookies } : {}),
    },
    body: JSON.stringify({ email, password }),
  });
  saveCookies(r);
  const data = await r.json();
  if (!r.ok) throw new Error(`Login failed for ${email}: ${JSON.stringify(data)}`);
  return data;
}

async function logout() {
  const csrf = await getCsrf();
  await fetch(`${BASE}/api/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf, Cookie: cookies },
  });
  cookies = '';
}

// ── Company definitions ───────────────────────────────────────────────────────
const COMPANIES = [
  {
    name: 'BrightMinds Tutoring',
    adminEmail: 'admin@brightminds.test',
    adminFirst: 'Sophia',
    adminLast: 'Chen',
    adminPass: 'BrightPass1!',
    tutorFirst: 'James',
    tutorLast: 'Wilson',
    tutorEmail: 'james.wilson@brightminds.test',
  },
  {
    name: 'EduEdge Academy',
    adminEmail: 'admin@eduedge.test',
    adminFirst: 'Marcus',
    adminLast: 'Johnson',
    adminPass: 'EduEdge1!',
    tutorFirst: 'Priya',
    tutorLast: 'Sharma',
    tutorEmail: 'priya.sharma@eduedge.test',
  },
  {
    name: 'Summit Learning Centre',
    adminEmail: 'admin@summitlearn.test',
    adminFirst: 'Rachel',
    adminLast: 'Thompson',
    adminPass: 'Summit1!',
    tutorFirst: 'David',
    tutorLast: 'Park',
    tutorEmail: 'david.park@summitlearn.test',
  },
  {
    name: 'NextGen Tutors',
    adminEmail: 'admin@nextgentutor.test',
    adminFirst: 'Aisha',
    adminLast: 'Patel',
    adminPass: 'NextGen1!',
    tutorFirst: 'Liam',
    tutorLast: 'OBrien',
    tutorEmail: 'liam.obrien@nextgentutor.test',
  },
  {
    name: 'Pinnacle Education',
    adminEmail: 'admin@pinnacledu.test',
    adminFirst: 'Oliver',
    adminLast: 'Kim',
    adminPass: 'Pinnacle1!',
    tutorFirst: 'Zoe',
    tutorLast: 'Martinez',
    tutorEmail: 'zoe.martinez@pinnacledu.test',
  },
];

// ── Course templates (7 per company — same set, different company) ─────────────
const COURSE_TEMPLATES = [
  { name: 'OC Preparation', description: 'Opportunity Class entrance preparation for Year 4-5 students', yearGroupCode: 'Y5', subjects: [SUBJECTS.English, SUBJECTS.Mathematics, SUBJECTS.ThinkingSkills] },
  { name: 'Selective School Prep', description: 'Selective high school entrance exam preparation', yearGroupCode: 'Y6', subjects: [SUBJECTS.English, SUBJECTS.Mathematics] },
  { name: 'NAPLAN Year 3', description: 'NAPLAN readiness program for Year 3 students', yearGroupCode: 'Y3', subjects: [SUBJECTS.English, SUBJECTS.Mathematics] },
  { name: 'NAPLAN Year 5', description: 'NAPLAN readiness program for Year 5 students', yearGroupCode: 'Y5', subjects: [SUBJECTS.Mathematics, SUBJECTS.Reading] },
  { name: 'Primary Mathematics', description: 'Core mathematics skills for primary school students', yearGroupCode: 'Y4', subjects: [SUBJECTS.Mathematics] },
  { name: 'English Writing Skills', description: 'Creative and analytical writing for primary students', yearGroupCode: 'Y4', subjects: [SUBJECTS.Writing, SUBJECTS.English] },
  { name: 'Science Fundamentals', description: 'Introduction to key science concepts and experiments', yearGroupCode: 'Y5', subjects: [SUBJECTS.Science] },
];

// ── Class schedule templates (one per course) ─────────────────────────────────
const CLASS_SCHEDULES = [
  { day: 'Saturday', startTime: '09:00', endTime: '10:30' },
  { day: 'Saturday', startTime: '11:00', endTime: '12:30' },
  { day: 'Sunday', startTime: '09:00', endTime: '10:30' },
  { day: 'Monday', startTime: '16:00', endTime: '17:00' },
  { day: 'Tuesday', startTime: '16:00', endTime: '17:00' },
  { day: 'Wednesday', startTime: '16:30', endTime: '17:30' },
  { day: 'Thursday', startTime: '16:30', endTime: '17:30' },
];

// ── Student data ──────────────────────────────────────────────────────────────
const STUDENT_FIRSTS = [
  'Emma','Liam','Olivia','Noah','Ava','Ethan','Sophia','Mason',
  'Isabella','William','Mia','James','Charlotte','Benjamin','Amelia',
  'Lucas','Harper','Henry','Evelyn','Alexander',
];
const STUDENT_LASTS = [
  'Smith','Jones','Williams','Brown','Taylor','Davis','Wilson','Anderson',
  'Thomas','Jackson','White','Harris','Martin','Thompson','Garcia',
  'Martinez','Robinson','Clark','Lewis','Lee',
];
const PARENT_FIRSTS = [
  'Jennifer','Michael','Patricia','Robert','Linda','David','Barbara',
  'Richard','Susan','Joseph','Jessica','Thomas','Sarah','Charles',
  'Karen','Christopher','Lisa','Daniel','Nancy','Matthew',
];
const SCHOOLS = [
  'Riverside Primary School','Oakdale Public School','Greenfield Academy',
  'Maplewood Primary','Sunridge Public School','Hilltop Grammar School',
  'Lakeside Primary','Woodlands Academy','Parkview Public School',
];
const YEAR_GROUPS = ['Y3','Y4','Y5','Y6','Y7'];
const RELATIONSHIPS = ['Mother','Father','Guardian','Grandmother','Grandfather'];

function makeStudents(companyIdx) {
  return STUDENT_FIRSTS.map((firstName, i) => {
    const lastName = STUDENT_LASTS[(i + companyIdx * 3) % STUDENT_LASTS.length];
    const parentFirst = PARENT_FIRSTS[i % PARENT_FIRSTS.length];
    const yearGroup = YEAR_GROUPS[i % YEAR_GROUPS.length];
    const school = SCHOOLS[i % SCHOOLS.length];
    const rel = RELATIONSHIPS[i % RELATIONSHIPS.length];
    const phoneNum = String(400000000 + companyIdx * 20000 + i * 1000).slice(0, 9);
    return {
      first_name: firstName,
      last_name: lastName,
      year_group_code: yearGroup,
      school: school,
      address: `${10 + i} Test Street, Sydney NSW 200${i % 10}`,
      date_of_birth: `${2015 - parseInt(yearGroup.slice(1))}-0${(i % 9) + 1}-15`,
      learning_goals: `Improve ${['reading','maths','writing','comprehension','problem-solving'][i % 5]} skills.`,
      notes: null,
      parents: [{
        name: `${parentFirst} ${lastName}`,
        relationship: rel,
        email: `${parentFirst.toLowerCase()}.${lastName.toLowerCase()}${companyIdx}${i}@parent.test`,
        phone: `04${phoneNum}`,
        is_primary: true,
      }],
    };
  });
}

// ── Assignment library templates ──────────────────────────────────────────────
const LIBRARY_TEMPLATES = [
  {
    title: 'Reading Comprehension Practice',
    description: 'Reading passages with comprehension questions covering inference, analysis and vocabulary.',
    instructions: 'Read each passage carefully and answer all questions. Show your reasoning for extended response questions.',
    subjects: ['English'],
    yearGroups: ['Y4','Y5','Y6'],
    estimatedDuration: 45,
    maxMarks: 20,
    questions: [
      { questionText: 'What is the main idea of the passage? Provide at least two pieces of evidence from the text to support your answer.', questionType: 'subjective', maxMarks: 6 },
      { questionText: 'Which of the following best describes the author\'s purpose?', questionType: 'mcq', maxMarks: 2, options: ['To inform','To persuade','To entertain','To describe'], answerKey: 'To inform' },
      { questionText: 'Identify two language techniques used in paragraph 2 and explain the effect each creates.', questionType: 'subjective', maxMarks: 8 },
      { questionText: 'Write 4–6 sentences summarising the key events or ideas in the passage, in your own words.', questionType: 'subjective', maxMarks: 4 },
    ],
  },
  {
    title: 'Mathematics Problem Solving Set',
    description: 'Mixed problem solving covering number operations, measurement, geometry and probability.',
    instructions: 'Attempt all questions. Show all working clearly. Circle your answer for multiple choice.',
    subjects: ['Mathematics'],
    yearGroups: ['Y4','Y5','Y6'],
    estimatedDuration: 40,
    maxMarks: 25,
    questions: [
      { questionText: 'Calculate: 4,327 + 2,891 − 1,456. Show all working.', questionType: 'subjective', maxMarks: 3 },
      { questionText: 'A rectangle has a length of 14 cm and a width of 8 cm. What is its area?', questionType: 'mcq', maxMarks: 2, options: ['112 cm²','44 cm²','22 cm²','96 cm²'], answerKey: '112 cm²' },
      { questionText: 'A car travels at 60 km/h for 2.5 hours. How many kilometres does it travel? Show your working.', questionType: 'subjective', maxMarks: 5 },
      { questionText: 'Write the next three terms in this sequence: 5, 11, 19, 29, …', questionType: 'subjective', maxMarks: 3 },
      { questionText: 'Convert 4.25 kg to grams.', questionType: 'mcq', maxMarks: 2, options: ['425 g','4250 g','42 500 g','4.25 g'], answerKey: '4250 g' },
      { questionText: 'A bag contains 5 red, 3 blue and 4 green marbles. What is the probability of selecting a green marble? Write your answer as a fraction in its simplest form.', questionType: 'subjective', maxMarks: 5 },
      { questionText: 'Solve for x: 3x + 9 = 30. Show your working.', questionType: 'subjective', maxMarks: 5 },
    ],
  },
  {
    title: 'Persuasive Writing Task',
    description: 'Students produce a structured persuasive essay demonstrating language techniques and logical argument.',
    instructions: 'Write a persuasive essay of 250–350 words. Include an introduction, at least two body paragraphs with evidence, and a conclusion. Use at least two persuasive techniques (e.g. rhetorical questions, statistics, emotive language).',
    subjects: ['Writing','English'],
    yearGroups: ['Y5','Y6','Y7'],
    estimatedDuration: 50,
    maxMarks: 20,
    questions: [
      { questionText: 'TOPIC: "Schools should ban smartphones during school hours." Write a persuasive essay arguing either FOR or AGAINST this statement. State your position clearly and support it with at least two well-developed arguments.', questionType: 'subjective', maxMarks: 20 },
    ],
  },
];

// ── Main seeder ───────────────────────────────────────────────────────────────
(async () => {
  const fs = require('fs');
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  eSlate Multi-Company Test Data Seeder');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const allCompanyData = [];

  for (let ci = 0; ci < COMPANIES.length; ci++) {
    const def = COMPANIES[ci];
    const cd = { name: def.name, courses: [], classes: [], students: [], libraryItems: [] };
    console.log(`\n──────────────────────────────────────────────────────`);
    console.log(`  [${ci+1}/5] ${def.name}`);
    console.log(`──────────────────────────────────────────────────────`);

    // ── Step 1: Platform admin creates company ────────────────────────────────
    await login('admin@eslate.com', 'password');
    const invite = await api('POST', '/api/admin/businesses/invite', {
      type: 'multi_tutor',
      name: def.name,
      owner_email: def.adminEmail,
      owner_first_name: def.adminFirst,
      owner_last_name: def.adminLast,
    });
    cd.id = invite.business_id;
    console.log(`  ✓ Company created: ${cd.id}`);

    // Accept invite → activates user + company
    await api('POST', '/api/onboarding/accept-business-invite', {
      token: invite.token,
      password: def.adminPass,
      first_name: def.adminFirst,
      last_name: def.adminLast,
    });
    console.log(`  ✓ Admin account activated: ${def.adminEmail}`);

    // ── Step 2: Login as company admin ────────────────────────────────────────
    await logout();
    await login(def.adminEmail, def.adminPass);

    // ── Step 3: Create tutor ──────────────────────────────────────────────────
    try {
      const tr = await api('POST', '/api/admin/create-tutor', {
        email: def.tutorEmail,
        firstName: def.tutorFirst,
        lastName: def.tutorLast,
        companyId: cd.id,
        specialization: 'Primary & Secondary Exam Preparation',
        qualifications: 'Bachelor of Education (Primary)',
      });
      cd.tutorId = tr.user?.id;
      console.log(`  ✓ Tutor created: ${def.tutorEmail}`);
    } catch(e) { console.log(`  ⚠ Tutor: ${e.message}`); }

    // ── Step 4: Academic year + auto-setup 4 NSW terms ────────────────────────
    let termId;
    try {
      const yr = await api('POST', `/api/companies/${cd.id}/academic-years`, {
        yearNumber: 2026,
        name: '2026',
        description: 'Academic Year 2026',
        isActive: true,
      });
      console.log(`  ✓ Academic year 2026: ${yr.id}`);

      await api('POST', `/api/companies/${cd.id}/academic-auto-setup`, {
        yearId: yr.id,
        state: 'NSW',
        division: 'Eastern',
      });

      // Fetch the created terms and use Term 3 (current one: Jul–Sep 2026)
      const terms = await api('GET', `/api/companies/${cd.id}/academic-terms`, null);
      const term3 = terms.find(t => t.name === 'Term 3') || terms.find(t => t.name === 'Term 2') || terms[0];
      termId = term3?.id;
      cd.terms = terms.map(t => ({ id: t.id, name: t.name, start: t.startDate, end: t.endDate }));
      console.log(`  ✓ 4 NSW terms created — using "${term3?.name}" (${termId}) for classes`);
    } catch(e) { console.log(`  ⚠ Academic setup: ${e.message}`); }

    // ── Step 5: Create 7 courses ──────────────────────────────────────────────
    console.log(`  Creating 7 courses...`);
    for (let i = 0; i < COURSE_TEMPLATES.length; i++) {
      const tpl = COURSE_TEMPLATES[i];
      try {
        const course = await api('POST', '/api/courses', {
          name: tpl.name,
          description: tpl.description,
          subject_ids: tpl.subjects,
          year_group_code: tpl.yearGroupCode,
        });
        cd.courses.push({ id: course.id, name: tpl.name, yearGroup: tpl.yearGroupCode });
        process.stdout.write(`    ✓ ${tpl.name}\n`);
      } catch(e) { console.log(`    ⚠ Course "${tpl.name}": ${e.message}`); }
    }

    // ── Step 6: Create 1 class per course ─────────────────────────────────────
    console.log(`  Creating 1 class per course...`);
    for (let i = 0; i < cd.courses.length; i++) {
      const course = cd.courses[i];
      const sched = CLASS_SCHEDULES[i % CLASS_SCHEDULES.length];
      if (!termId) { console.log(`    ⚠ No termId, skipping class for ${course.name}`); continue; }
      try {
        const cls = await api('POST', '/api/classes', {
          name: `${course.name} – ${sched.day} ${sched.startTime}`,
          course_id: course.id,
          term_ids: [termId],
          capacity: 12,
          location: `Room ${i + 1}`,
          schedule_day_of_week: DAY_MAP[sched.day],
          schedule_start_time: sched.startTime,
          schedule_end_time: sched.endTime,
          status: 'active',
        });
        cd.classes.push({ id: cls.id, name: cls.name, courseId: course.id, day: sched.day, time: sched.startTime });
        process.stdout.write(`    ✓ ${cls.name || course.name}\n`);
      } catch(e) { console.log(`    ⚠ Class for "${course.name}": ${e.message}`); }
    }

    // ── Step 7: Create 20 students with parent contacts ───────────────────────
    console.log(`  Creating 20 students with parent contacts...`);
    const studentDefs = makeStudents(ci);
    for (let i = 0; i < studentDefs.length; i++) {
      const sDef = studentDefs[i];
      try {
        const res = await api('POST', `/api/businesses/${cd.id}/students`, sDef);
        cd.students.push({
          id: res.student.id,
          firstName: sDef.first_name,
          lastName: sDef.last_name,
          fullName: `${sDef.first_name} ${sDef.last_name}`,
          yearGroup: sDef.year_group_code,
          school: sDef.school,
          parentName: sDef.parents[0].name,
          parentRelationship: sDef.parents[0].relationship,
          parentEmail: sDef.parents[0].email,
          parentPhone: sDef.parents[0].phone,
        });
        process.stdout.write('.');
      } catch(e) {
        process.stdout.write('✗');
        console.log(`\n    ⚠ Student ${sDef.first_name} ${sDef.last_name}: ${e.message}`);
      }
    }
    console.log(`\n  ✓ ${cd.students.length}/20 students created`);

    // ── Step 8: Create 3 library assignment items ─────────────────────────────
    console.log(`  Creating 3 assignment library items...`);
    for (const tpl of LIBRARY_TEMPLATES) {
      try {
        const item = await api('POST', '/api/assignment-library', {
          companyId: cd.id,
          title: tpl.title,
          description: tpl.description,
          instructions: tpl.instructions,
          subjects: tpl.subjects,
          yearGroups: tpl.yearGroups,
          estimatedDuration: tpl.estimatedDuration,
          maxMarks: tpl.maxMarks,
          questions: tpl.questions,
        });
        // Publish so it can be allocated
        await api('POST', `/api/assignment-library/${item.id}/publish`, {});
        cd.libraryItems.push({ id: item.id, title: tpl.title, maxMarks: tpl.maxMarks });
        console.log(`    ✓ "${tpl.title}" → published`);
      } catch(e) { console.log(`    ⚠ Library item "${tpl.title}": ${e.message}`); }
    }

    // ── Step 9: Allocate all 3 assignments to each student (not completed) ────
    console.log(`  Allocating assignments to students...`);
    const studentIds = cd.students.map(s => s.id).filter(Boolean);
    const today = new Date();
    let totalAlloc = 0;
    for (let li = 0; li < cd.libraryItems.length; li++) {
      const item = cd.libraryItems[li];
      const due = new Date(today);
      due.setDate(due.getDate() + 14 + li * 7); // due in 2, 3, 4 weeks
      try {
        const res = await api('POST', `/api/assignment-library/${item.id}/allocate`, {
          targetType: 'students',
          studentIds: studentIds,
          dueAt: due.toISOString(),
          allowResubmission: false,
          studentNote: 'Complete all questions carefully. Show full working for maths. Assignments will be marked by your tutor.',
        });
        totalAlloc += res.allocated || 0;
        console.log(`    ✓ "${item.title}" → ${res.allocated} students (due ${due.toDateString()})`);
      } catch(e) { console.log(`    ⚠ Allocate "${item.title}": ${e.message}`); }
    }
    console.log(`  ✓ Total allocations: ${totalAlloc} (0 completed — manual testing ready)`);

    allCompanyData.push({ def, cd });
    await logout();
    console.log(`  ✓ DONE: ${def.name}\n`);
  }

  // ── Final summary ─────────────────────────────────────────────────────────
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('  TEST DATA SUMMARY — ALL 5 COMPANIES');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const jsonOut = [];

  for (const { def, cd } of allCompanyData) {
    console.log(`┌─────────────────────────────────────────────────────────────`);
    console.log(`│  ${cd.name}`);
    console.log(`│  Company ID:    ${cd.id}`);
    console.log(`│  Admin:         ${def.adminEmail}  /  ${def.adminPass}`);
    console.log(`│  Tutor:         ${def.tutorEmail}  /  TempPass123!`);
    console.log(`│`);
    console.log(`│  COURSES (${cd.courses.length}):`);
    for (const c of cd.courses) console.log(`│    [${c.id}]  ${c.name}  (${c.yearGroup})`);
    console.log(`│`);
    console.log(`│  CLASSES (${cd.classes.length}):`);
    for (const c of cd.classes) console.log(`│    [${c.id}]  ${c.name}  — ${c.day} ${c.time}`);
    console.log(`│`);
    console.log(`│  ASSIGNMENT LIBRARY (${cd.libraryItems.length} items, all published):`);
    for (const li of cd.libraryItems) console.log(`│    [${li.id}]  ${li.title}  (${li.maxMarks} marks)`);
    console.log(`│`);
    console.log(`│  STUDENTS (${cd.students.length}) — all have 3 unsubmitted assignments:`);
    for (let i = 0; i < cd.students.length; i++) {
      const s = cd.students[i];
      console.log(`│   ${String(i+1).padStart(2)}. ${s.fullName.padEnd(28)} [${s.id}]  ${s.yearGroup}  ${s.school}`);
      console.log(`│       Parent: ${s.parentName} (${s.parentRelationship})  ${s.parentEmail}  ${s.parentPhone}`);
    }
    console.log(`└─────────────────────────────────────────────────────────────\n`);

    jsonOut.push({
      companyName: cd.name,
      companyId: cd.id,
      adminEmail: def.adminEmail,
      adminPassword: def.adminPass,
      tutorEmail: def.tutorEmail,
      tutorPassword: 'TempPass123!',
      courses: cd.courses,
      classes: cd.classes,
      libraryItems: cd.libraryItems,
      students: cd.students,
    });
  }

  const outFile = '/tmp/eslate-seed-summary.json';
  require('fs').writeFileSync(outFile, JSON.stringify(jsonOut, null, 2));
  console.log(`JSON summary saved → ${outFile}`);
  console.log('\n✓ Seeding complete!\n');

})().catch(err => {
  console.error('\n✗ SEEDER FAILED:', err.message);
  console.error(err.stack);
  process.exit(1);
});
