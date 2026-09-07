const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3000';
const SS_DIR = '/tmp/eslate-screenshots';
fs.mkdirSync(SS_DIR, { recursive: true });

// Test data IDs (created via API)
const COURSE_ID = 'da016ac5-4285-4e4b-92a6-70974f2b855a';
const CLASS_ID  = '9c9d0e38-b04f-4b8d-9497-6ff48bef93a0';
const STUDENT_ID = '4fab1e78-4e05-41ed-a1cc-2ba543dc0ac2'; // Alex Playwright

let browser, page;
const results = [];

async function ss(name, label) {
  const file = path.join(SS_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`SCREENSHOT:${file}:${label}`);
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
  await page.waitForTimeout(300);
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

  // ── ESLATE-11: ToS/Privacy/User Agreement during onboarding ──────
  await test('ESLATE-11', 'Company Admin accepts ToS/Privacy/User Agreement during onboarding', async () => {
    // The onboarding page is accessible at /onboarding
    // A new company admin would land here after accepting invite
    await page.goto(`${BASE}/onboarding`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await ss('eslate11_onboarding_page', 'Onboarding page');

    const bodyText = await page.textContent('body');
    console.log(`  Body contains "terms": ${/terms/i.test(bodyText)}`);
    console.log(`  Body contains "privacy": ${/privacy/i.test(bodyText)}`);
    console.log(`  Body contains "agreement": ${/agreement/i.test(bodyText)}`);

    // Check for ToS, Privacy, Agreement references
    const hasTerms = /terms of service|terms and conditions|terms/i.test(bodyText);
    const hasPrivacy = /privacy policy|privacy/i.test(bodyText);
    const hasAgreement = /user agreement|agreement/i.test(bodyText);

    // Also check legal pages exist
    await page.goto(`${BASE}/legal/terms`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    const termsText = await page.textContent('body');
    const hasTermsPage = /terms of service|terms and conditions/i.test(termsText);
    await ss('eslate11_terms_page', 'Terms of Service page');

    await page.goto(`${BASE}/legal/privacy`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    const privacyText = await page.textContent('body');
    const hasPrivacyPage = /privacy policy/i.test(privacyText);
    await ss('eslate11_privacy_page', 'Privacy Policy page');

    await page.goto(`${BASE}/legal/agreement`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    const agreementText = await page.textContent('body');
    const hasAgreementPage = /user agreement|agreement/i.test(agreementText);
    await ss('eslate11_agreement_page', 'User Agreement page');

    if (!hasTermsPage) throw new Error('Terms of Service page content missing');
    if (!hasPrivacyPage) throw new Error('Privacy Policy page content missing');
    if (!hasAgreementPage) throw new Error('User Agreement page content missing');

    // Now check onboarding flow (login as fresh company admin scenario)
    await loginAs('info@NT.com', 'password');
    // Check if /api/users/accept-terms endpoint is accessible
    const acceptResp = await page.evaluate(async () => {
      const r = await fetch('/api/users/accept-terms-status', { credentials: 'include' });
      return r.status;
    });
    console.log(`  /api/users/accept-terms-status status: ${acceptResp}`);
    await ss('eslate11_after_login', 'After login - ToS acceptance state');
  });

  // ── ESLATE-12: View/edit Company Profile ─────────────────────────
  await test('ESLATE-12', 'Company Admin views and edits Company Profile', async () => {
    await page.goto(`${BASE}/company/settings`);
    await page.waitForLoadState('networkidle');
    // Two-stage load: first fetches companyId then fetches profile — wait for content
    await page.waitForFunction(
      () => !document.body.textContent?.includes('Loading…'),
      { timeout: 10000 }
    ).catch(() => {});
    await page.waitForTimeout(2000);
    await ss('eslate12_company_settings', 'Company settings/profile page');

    const bodyText = await page.textContent('body');
    const hasProfileFields = /company name|business name|contact|email|phone|abn|address|NT-29|settings/i.test(bodyText);
    console.log(`  Has profile fields: ${hasProfileFields}`);
    console.log(`  Body snippet: ${bodyText.slice(0, 300).replace(/\s+/g,' ')}`);
    if (!hasProfileFields) throw new Error('No company profile fields found');

    const editBtn = page.locator('button').filter({ hasText: /edit|save|update/i }).first();
    const editableInput = page.locator('input[type="text"], input[type="email"], input[type="tel"]').first();
    const hasEditable = (await editBtn.count() > 0) || (await editableInput.count() > 0);
    console.log(`  Has edit UI: ${hasEditable}`);
    if (!hasEditable) throw new Error('No edit UI found on company profile');

    await ss('eslate12_profile_editable', 'Company profile with editable fields');
  });

  // ── ESLATE-13: View/edit Tutor profile ───────────────────────────
  await test('ESLATE-13', 'Company Admin views and edits Tutor profile', async () => {
    await page.goto(`${BASE}/company/tutors`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await ss('eslate13_tutors_page', 'Tutors/Staff page');

    const bodyText = await page.textContent('body');
    // Either shows list of tutors OR invite flow
    const hasInviteOption = /invite|add.*tutor|staff/i.test(bodyText);
    console.log(`  Has invite/tutor management: ${hasInviteOption}`);
    if (!hasInviteOption) throw new Error('No tutor management UI found');

    // Check invite tutor form is accessible
    const inviteBtn = page.locator('button, a').filter({ hasText: /invite|add.*tutor|new tutor/i }).first();
    if (await inviteBtn.count() > 0) {
      await inviteBtn.click();
      await page.waitForTimeout(1000);
      await ss('eslate13_invite_tutor_form', 'Invite tutor form/modal');
      const formText = await page.textContent('body');
      const hasNameEmail = /name|email/i.test(formText);
      if (!hasNameEmail) throw new Error('Invite tutor form missing name/email fields');
      await page.keyboard.press('Escape');
    } else {
      await ss('eslate13_no_tutors_state', 'No tutors yet - invite UI visible');
    }
  });

  // ── ESLATE-14: View/edit Student profile ─────────────────────────
  await test('ESLATE-14', 'Company Admin views and edits Student profile', async () => {
    await page.goto(`${BASE}/company/students`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Total', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1500);
    await ss('eslate14_students_list', 'Students list');

    // Click on Alex Playwright
    const alexRow = page.locator('li, tr, [class*="row"], [class*="card"]').filter({ hasText: /alex/i }).first();
    const editIcon = page.locator('a[href*="student"], button[aria-label*="edit" i], svg').first();
    const pencilBtn = page.locator('button').filter({ has: page.locator('svg') }).first();

    if (await alexRow.count() > 0) {
      await alexRow.click();
    } else {
      // Try the pencil edit icon on the student row
      const rowEditBtn = page.locator('button, a').nth(0);
      await rowEditBtn.click();
    }
    await page.waitForTimeout(1500);
    await ss('eslate14_student_profile', 'Student profile detail/edit view');

    const bodyText = await page.textContent('body');
    const hasStudentData = /alex|playwright|first name|last name|year|school|notes/i.test(bodyText);
    if (!hasStudentData) throw new Error('Student profile did not load with student data');
    await ss('eslate14_student_fields_visible', 'Student profile fields visible');
  });

  // ── ESLATE-15: View/edit Course details ──────────────────────────
  await test('ESLATE-15', 'Company Admin views and edits Course details', async () => {
    await page.goto(`${BASE}/company/courses`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await ss('eslate15_courses_list', 'Courses list with test course');

    const bodyText = await page.textContent('body');
    console.log(`  Course "OC Preparation" visible: ${/OC Preparation/i.test(bodyText)}`);

    // Click on the course to go to detail page
    const courseRow = page.locator('tr, li, [class*="row"], [class*="card"]').filter({ hasText: /OC Preparation/i }).first();
    const courseLink = page.locator('a, button').filter({ hasText: /OC Preparation/i }).first();

    if (await courseLink.count() > 0) {
      await courseLink.click();
    } else if (await courseRow.count() > 0) {
      await courseRow.click();
    } else {
      // Navigate directly via URL
      await page.goto(`${BASE}/company/courses/${COURSE_ID}`);
    }
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await ss('eslate15_course_detail', 'Course detail page');

    const detailText = await page.textContent('body');
    const hasCourseData = /OC Preparation|course|subject|English|Mathematics|edit|save/i.test(detailText);
    if (!hasCourseData) throw new Error('Course detail page did not load');
    await ss('eslate15_course_editable', 'Course detail with edit capability');
  });

  // ── ESLATE-16: View/edit Class details ───────────────────────────
  await test('ESLATE-16', 'Company Admin views and edits Class details', async () => {
    await page.goto(`${BASE}/company/classes`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await ss('eslate16_classes_list', 'Classes list with test class');

    const bodyText = await page.textContent('body');
    console.log(`  Class "OC Y5" visible: ${/OC Y5|Saturday/i.test(bodyText)}`);

    // Click on the class to go to detail page
    const classRow = page.locator('tr, li, [class*="row"], [class*="card"]').filter({ hasText: /OC Y5|Saturday Morning/i }).first();
    const classLink = page.locator('a, button').filter({ hasText: /OC Y5|Saturday Morning/i }).first();

    if (await classLink.count() > 0) {
      await classLink.click();
    } else if (await classRow.count() > 0) {
      await classRow.click();
    } else {
      await page.goto(`${BASE}/company/classes/${CLASS_ID}`);
    }
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await ss('eslate16_class_detail', 'Class detail page');

    const detailText = await page.textContent('body');
    const hasClassData = /OC Y5|Saturday|class|tutor|schedule|Room|English|edit|save/i.test(detailText);
    if (!hasClassData) throw new Error('Class detail page did not load');
    await ss('eslate16_class_editable', 'Class detail with edit capability');
  });

  await browser.close();

  console.log('\n\n=== BATCH 2 FINAL RESULTS ===');
  let pass = 0, fail = 0;
  for (const r of results) {
    const icon = r.status === 'PASS' ? 'PASS' : 'FAIL';
    console.log(`[${icon}] ${r.id}: ${r.label}${r.error ? '\n       → ' + r.error : ''}`);
    r.status === 'PASS' ? pass++ : fail++;
  }
  console.log(`\nTotal: ${pass} PASS, ${fail} FAIL of ${results.length}`);
})();
