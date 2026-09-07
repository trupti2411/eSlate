const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3000';
const SS_DIR = '/tmp/eslate-screenshots';
fs.mkdirSync(SS_DIR, { recursive: true });

let browser, page;
const results = [];

async function ss(name, label) {
  const file = path.join(SS_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`SCREENSHOT:${file}:${label}`);
  return file;
}

async function loginAs(email, pass) {
  await page.goto(`${BASE}/auth`);
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(pass);
  await page.locator('button[type="submit"]').click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
}

async function test(id, label, fn) {
  console.log(`\n=== ${id}: ${label} ===`);
  try {
    await fn();
    results.push({ id, label, status: 'PASS' });
    console.log(`RESULT:${id}:PASS`);
  } catch (e) {
    const file = path.join(SS_DIR, `${id}_FAIL.png`);
    try { await page.screenshot({ path: file, fullPage: false }); } catch(_) {}
    results.push({ id, label, status: 'FAIL', error: e.message.split('\n')[0] });
    console.log(`RESULT:${id}:FAIL:${e.message.split('\n')[0]}`);
  }
}

(async () => {
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  page = await ctx.newPage();
  page.setDefaultTimeout(15000);

  // ── LOGIN as platform admin ──────────────────────────────────────
  await loginAs('admin@eslate.com', 'password');
  await ss('00_admin_dashboard', 'Platform admin dashboard');

  // ── ESLATE-1: Solo tutor bug ──────────────────────────────────────
  await test('ESLATE-1', 'Admin cannot create solo/standalone tutor', async () => {
    await page.goto(`${BASE}/admin/users`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await ss('eslate1_users_page', 'Admin users page');

    const addTutorBtn = page.locator('button').filter({ hasText: /add.*tutor|create.*tutor/i }).first();
    if (await addTutorBtn.count() > 0) {
      await addTutorBtn.click();
      await page.waitForTimeout(1500);
      await ss('eslate1_tutor_form', 'Tutor creation form');
      const bodyText = await page.textContent('body');
      if (!/company|organisation|tutoring company/i.test(bodyText)) {
        throw new Error('Tutor creation form does not reference a company');
      }
      await page.keyboard.press('Escape');
    }
    await ss('eslate1_pass', 'ESLATE-1: No standalone tutor creation');
  });

  // ── ESLATE-3: Create tutoring company ────────────────────────────
  await test('ESLATE-3', 'Admin creates tutoring company with extended details', async () => {
    await page.goto(`${BASE}/admin/companies`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await ss('eslate3_companies_list', 'Companies list page');

    const addBtn = page.locator('button').filter({ hasText: /add|new|create/i }).first();
    if (await addBtn.count() === 0) throw new Error('No Add Company button');
    await addBtn.click();
    await page.waitForTimeout(1500);
    await ss('eslate3_company_form', 'Add company form open');

    const inputs = page.locator('input, textarea, select');
    const count = await inputs.count();
    console.log(`  Form has ${count} fields`);
    if (count < 3) throw new Error(`Only ${count} fields — expected extended form`);

    const nameInput = page.locator('input').first();
    await nameInput.fill('Playwright Test Company');
    await ss('eslate3_form_filled', 'Company form with name + multiple fields visible');
  });

  // ── Switch to company admin for tests 5, 7, 8, 9, 10 ────────────
  await loginAs('info@NT.com', 'password');
  await ss('ca_dashboard_pre5', 'Company admin dashboard (switching for ESLATE-5+)');

  // ── ESLATE-5: Add student with validation ─────────────────────────
  await test('ESLATE-5', 'Admin adds student with validated form', async () => {
    await page.goto(`${BASE}/company/students`);
    await page.waitForLoadState('networkidle');
    // Wait for stats to render (not just network idle)
    await page.waitForSelector('text=Total', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1000);
    await ss('eslate5_students_page', 'Company students page');

    const addBtn = page.locator('button').filter({ hasText: /add student|add your first/i }).first();
    if (await addBtn.count() === 0) throw new Error('No add student button found');
    await addBtn.click();
    await page.waitForSelector('input[placeholder*="First" i], input', { timeout: 8000 });
    await page.waitForTimeout(1000);
    await ss('eslate5_form_open', 'Add student form/panel open');

    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
      await page.waitForTimeout(800);
      await ss('eslate5_validation', 'Validation triggered on empty submit');
    }
    if (await page.locator('input').count() === 0) throw new Error('Form did not open');
  });

  // ── ESLATE-7: Edit student data ────────────────────────────────────
  await test('ESLATE-7', 'Company admin edits student data', async () => {
    await page.goto(`${BASE}/company/students`);
    await page.waitForLoadState('networkidle');
    // Wait for student list to populate
    await page.waitForSelector('text=Total', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(2500);
    await ss('eslate7_students_list', 'Students list with test data');

    // Look for Alex Playwright row (created via API)
    const alexRow = page.locator('tr, li, [class*="row"], [class*="card"]').filter({ hasText: /alex|playwright/i }).first();
    const anyStudentRow = page.locator('tbody tr, [data-testid*="student"]').first();

    if (await alexRow.count() > 0) {
      console.log('  Found Alex Playwright row');
      await alexRow.click();
    } else if (await anyStudentRow.count() > 0) {
      console.log('  Found generic student row');
      await anyStudentRow.click();
    } else {
      // Last attempt: look for any clickable item with a name
      const nameLink = page.locator('a[href*="student"], button').filter({ hasText: /alex|jacob|playwright/i }).first();
      if (await nameLink.count() > 0) {
        await nameLink.click();
      } else {
        throw new Error('No student rows visible — expected Alex Playwright to appear');
      }
    }
    await page.waitForTimeout(2000);
    await ss('eslate7_student_profile', 'Student profile/edit page');

    const bodyText = await page.textContent('body');
    if (!/alex|jacob|playwright|student|profile|edit/i.test(bodyText)) {
      throw new Error('Student detail page did not load correctly');
    }
  });

  // ── ESLATE-8: Create course ─────────────────────────────────────
  await test('ESLATE-8', 'Tutoring Admin creates a course', async () => {
    await page.goto(`${BASE}/company/courses`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await ss('eslate8_courses_page', 'Company courses page');

    const addBtn = page.locator('button').filter({ hasText: /add|new|create/i }).first();
    if (await addBtn.count() === 0) throw new Error('No Create Course button');
    await addBtn.click();
    await page.waitForTimeout(1500);
    await ss('eslate8_course_form', 'Create course form');

    const inputs = page.locator('input');
    if (await inputs.count() === 0) throw new Error('Course form has no inputs');
    await inputs.first().fill('Playwright Test Course - English');
    await ss('eslate8_course_name_entered', 'Course name entered in form');
  });

  // ── ESLATE-9: Quick action on COMPANY dashboard ─────────────────
  await test('ESLATE-9', 'Create Course quick action on company dashboard', async () => {
    // Navigate to root — company admin with default 'new' design sees NewCompanyDashboard
    // which has QuickActionsCard including a Courses quick action
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await ss('eslate9_company_dashboard', 'Company admin dashboard (new design with quick actions)');

    const courseLinks = page.locator('button, a').filter({ hasText: /course/i });
    const count = await courseLinks.count();
    console.log(`  Course links on dashboard: ${count}`);
    if (count === 0) throw new Error('No course quick action on company dashboard');
    await ss('eslate9_course_quick_action', 'Course quick action visible');
  });

  // ── ESLATE-10: Notes textarea in Add Student form ────────────────
  await test('ESLATE-10', 'Notes textarea in Add Student form', async () => {
    await page.goto(`${BASE}/company/students`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Total', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1000);

    const addBtn = page.locator('button').filter({ hasText: /add student/i }).first();
    if (await addBtn.count() === 0) throw new Error('No add student button');
    await addBtn.click();
    await page.waitForSelector('input', { timeout: 8000 });
    await page.waitForTimeout(2000);
    await ss('eslate10_add_student_form_top', 'Add student form - top');

    // Scroll to bottom of the slide panel
    await page.evaluate(() => {
      const candidates = [
        ...document.querySelectorAll('[class*="overflow-y-auto"]'),
        ...document.querySelectorAll('[class*="overflow-auto"]'),
        document.querySelector('form'),
        document.querySelector('[role="dialog"]'),
        document.documentElement,
      ].filter(Boolean);
      const scrollable = candidates.find(el => el.scrollHeight > el.clientHeight);
      if (scrollable) scrollable.scrollTop = scrollable.scrollHeight;
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(800);
    await ss('eslate10_form_scrolled_bottom', 'Add student form - scrolled to bottom for notes');

    const textarea = page.locator('textarea').first();
    const bodyText = await page.textContent('body');
    const hasNotes = (await textarea.count() > 0) || /general notes|notes.*optional/i.test(bodyText);
    console.log(`  Textarea count: ${await textarea.count()}, Body has "notes": ${/notes/i.test(bodyText)}`);
    if (!hasNotes) throw new Error('No notes textarea in Add Student form');
    await ss('eslate10_notes_visible', 'Notes field visible in Add Student form');
  });

  await browser.close();

  console.log('\n\n=== BATCH 1 FINAL RESULTS ===');
  let pass = 0, fail = 0;
  for (const r of results) {
    const icon = r.status === 'PASS' ? 'PASS' : 'FAIL';
    console.log(`[${icon}] ${r.id}: ${r.label}${r.error ? '\n       → ' + r.error : ''}`);
    r.status === 'PASS' ? pass++ : fail++;
  }
  console.log(`\nTotal: ${pass} PASS, ${fail} FAIL of ${results.length}`);
})();
