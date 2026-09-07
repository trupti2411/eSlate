const { chromium } = require('playwright');
const BASE = 'https://dev.eslate.com.au';

const COMPANIES = [
  { name:'BrightMinds Tutoring', adminEmail:'admin@brightminds.test', adminFirst:'Sophia', adminLast:'Chen', adminPass:'BrightPass1!', tutorFirst:'James', tutorLast:'Wilson', tutorEmail:'james.wilson@brightminds.test' },
  { name:'EduEdge Academy', adminEmail:'admin@eduedge.test', adminFirst:'Marcus', adminLast:'Johnson', adminPass:'EduEdge1!', tutorFirst:'Priya', tutorLast:'Sharma', tutorEmail:'priya.sharma@eduedge.test' },
  { name:'Summit Learning Centre', adminEmail:'admin@summitlearn.test', adminFirst:'Rachel', adminLast:'Thompson', adminPass:'Summit1!', tutorFirst:'David', tutorLast:'Park', tutorEmail:'david.park@summitlearn.test' },
  { name:'NextGen Tutors', adminEmail:'admin@nextgentutor.test', adminFirst:'Aisha', adminLast:'Patel', adminPass:'NextGen1!', tutorFirst:'Liam', tutorLast:'OBrien', tutorEmail:'liam.obrien@nextgentutor.test' },
  { name:'Pinnacle Education', adminEmail:'admin@pinnacledu.test', adminFirst:'Oliver', adminLast:'Kim', adminPass:'Pinnacle1!', tutorFirst:'Zoe', tutorLast:'Martinez', tutorEmail:'zoe.martinez@pinnacledu.test' },
];
const COURSE_TEMPLATES = [
  { name:'OC Preparation', description:'Opportunity Class entrance preparation', yearGroupCode:'Y5', subjects:[1,2,5] },
  { name:'Selective School Prep', description:'Selective high school entrance exam preparation', yearGroupCode:'Y6', subjects:[1,2] },
  { name:'NAPLAN Year 3', description:'NAPLAN readiness for Year 3', yearGroupCode:'Y3', subjects:[1,2] },
  { name:'NAPLAN Year 5', description:'NAPLAN readiness for Year 5', yearGroupCode:'Y5', subjects:[2,3] },
  { name:'Primary Mathematics', description:'Core mathematics for primary students', yearGroupCode:'Y4', subjects:[2] },
  { name:'English Writing Skills', description:'Creative and analytical writing', yearGroupCode:'Y4', subjects:[6,1] },
  { name:'Science Fundamentals', description:'Key science concepts and experiments', yearGroupCode:'Y5', subjects:[4] },
];
const CLASS_SCHEDULES = [
  {day:'Saturday',startTime:'09:00',endTime:'10:30'},{day:'Saturday',startTime:'11:00',endTime:'12:30'},
  {day:'Sunday',startTime:'09:00',endTime:'10:30'},{day:'Monday',startTime:'16:00',endTime:'17:00'},
  {day:'Tuesday',startTime:'16:00',endTime:'17:00'},{day:'Wednesday',startTime:'16:30',endTime:'17:30'},
  {day:'Thursday',startTime:'16:30',endTime:'17:30'},
];
const DAY_MAP = {Sunday:0,Monday:1,Tuesday:2,Wednesday:3,Thursday:4,Friday:5,Saturday:6};
const STUDENT_FIRSTS=['Emma','Liam','Olivia','Noah','Ava','Ethan','Sophia','Mason','Isabella','William','Mia','James','Charlotte','Benjamin','Amelia','Lucas','Harper','Henry','Evelyn','Alexander'];
const STUDENT_LASTS=['Smith','Jones','Williams','Brown','Taylor','Davis','Wilson','Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Garcia','Martinez','Robinson','Clark','Lewis','Lee'];
const PARENT_FIRSTS=['Jennifer','Michael','Patricia','Robert','Linda','David','Barbara','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Charles','Karen','Christopher','Lisa','Daniel','Nancy','Matthew'];
const SCHOOLS=['Riverside Primary','Oakdale Public School','Greenfield Academy','Maplewood Primary','Sunridge Public School','Hilltop Grammar','Lakeside Primary','Woodlands Academy','Parkview Public School'];
const YEAR_GROUPS=['Y3','Y4','Y5','Y6','Y7'];
const RELS=['Mother','Father','Guardian','Grandmother','Grandfather'];

function makeStudents(ci) {
  return STUDENT_FIRSTS.map((fn,i)=>{ const ln=STUDENT_LASTS[(i+ci*3)%STUDENT_LASTS.length]; const pf=PARENT_FIRSTS[i%PARENT_FIRSTS.length]; const yg=YEAR_GROUPS[i%YEAR_GROUPS.length]; const ph=String(400000000+ci*20000+i*1000).slice(0,9);
    return {first_name:fn,last_name:ln,year_group_code:yg,school:SCHOOLS[i%SCHOOLS.length],address:`${10+i} Test St, Sydney NSW 200${i%10}`,date_of_birth:`${2015-parseInt(yg.slice(1))}-0${(i%9)+1}-15`,learning_goals:'Improve exam technique.',notes:null,
      parents:[{name:`${pf} ${ln}`,relationship:RELS[i%RELS.length],email:`${pf.toLowerCase()}.${ln.toLowerCase()}${ci}${i}@parent.test`,phone:`04${ph}`,is_primary:true}]};
  });
}
const LIBRARY_TEMPLATES=[
  {title:'Reading Comprehension Practice',description:'Reading passages with comprehension questions.',instructions:'Read carefully and answer all questions.',subjects:['English'],yearGroups:['Y4','Y5','Y6'],estimatedDuration:45,maxMarks:20,
    questions:[{questionText:'What is the main idea? Provide two pieces of evidence.',questionType:'subjective',maxMarks:6},{questionText:"Author's purpose?",questionType:'mcq',maxMarks:2,options:['To inform','To persuade','To entertain','To describe'],answerKey:'To inform'},{questionText:'Identify two language techniques in paragraph 2.',questionType:'subjective',maxMarks:8},{questionText:'Summarise key events in 4–6 sentences.',questionType:'subjective',maxMarks:4}]},
  {title:'Mathematics Problem Solving Set',description:'Mixed problem solving.',instructions:'Show all working.',subjects:['Mathematics'],yearGroups:['Y4','Y5','Y6'],estimatedDuration:40,maxMarks:25,
    questions:[{questionText:'Calculate: 4,327 + 2,891 − 1,456.',questionType:'subjective',maxMarks:3},{questionText:'Rectangle 14cm × 8cm area?',questionType:'mcq',maxMarks:2,options:['112 cm²','44 cm²','22 cm²','96 cm²'],answerKey:'112 cm²'},{questionText:'Car 60km/h for 2.5h. Distance?',questionType:'subjective',maxMarks:5},{questionText:'Next three: 5,11,19,29,…',questionType:'subjective',maxMarks:3},{questionText:'4.25 kg to grams.',questionType:'mcq',maxMarks:2,options:['425 g','4250 g','42500 g','4.25 g'],answerKey:'4250 g'},{questionText:'Bag: 5 red,3 blue,4 green. P(green)?',questionType:'subjective',maxMarks:5},{questionText:'Solve: 3x+9=30.',questionType:'subjective',maxMarks:5}]},
  {title:'Persuasive Writing Task',description:'Structured persuasive essay.',instructions:'Write 250–350 words with intro, two body paragraphs, conclusion.',subjects:['Writing','English'],yearGroups:['Y5','Y6','Y7'],estimatedDuration:50,maxMarks:20,
    questions:[{questionText:'TOPIC: "Schools should ban smartphones during school hours." Argue FOR or AGAINST with two well-developed arguments.',questionType:'subjective',maxMarks:20}]},
];

let page;

async function api(method, path, body) {
  const r = await page.evaluate(async ({method,path,body,base})=>{
    const cr = await fetch(`${base}/api/auth/csrf-token`,{credentials:'include'});
    const {csrfToken} = await cr.json();
    const res = await fetch(`${base}${path}`,{method,credentials:'include',headers:{'Content-Type':'application/json','x-csrf-token':csrfToken},body:body?JSON.stringify(body):undefined});
    const text = await res.text();
    let data; try{data=JSON.parse(text);}catch{data={_raw:text.slice(0,300)};}
    return {status:res.status,ok:res.ok,data};
  },{method,path,body,base:BASE});
  if(!r.ok) throw new Error(`${method} ${path} → ${r.status}: ${JSON.stringify(r.data).slice(0,200)}`);
  return r.data;
}

async function loginAs(email,pass) {
  await page.goto(`${BASE}/auth`,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('input[type="email"]',{timeout:20000});
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(pass);
  await page.locator('button[type="submit"]').click();
  // Wait for redirect away from /auth
  await page.waitForFunction(()=>!window.location.pathname.includes('/auth'),{timeout:20000}).catch(()=>{});
  await page.waitForTimeout(2000);
}

async function doLogout() {
  await page.evaluate(async(base)=>{
    const cr=await fetch(`${base}/api/auth/csrf-token`,{credentials:'include'});
    const {csrfToken}=await cr.json();
    await fetch(`${base}/api/auth/logout`,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-csrf-token':csrfToken}});
  },BASE);
  await page.waitForTimeout(1000);
}

(async()=>{
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  eSlate Dev Seeder — dev.eslate.com.au');
  console.log('═══════════════════════════════════════════════════\n');
  const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
  const ctx = await browser.newContext({viewport:{width:1280,height:800}});
  page = await ctx.newPage();
  page.setDefaultTimeout(25000);
  const allData=[];

  for(let ci=0;ci<COMPANIES.length;ci++){
    const def=COMPANIES[ci]; const cd={name:def.name,courses:[],classes:[],students:[],libraryItems:[]};
    console.log(`\n──────────────────────────────────────────`);
    console.log(`  [${ci+1}/5] ${def.name}`);
    console.log(`──────────────────────────────────────────`);

    await loginAs('admin@eslate.com','password');
    const invite=await api('POST','/api/admin/businesses/invite',{type:'multi_tutor',name:def.name,owner_email:def.adminEmail,owner_first_name:def.adminFirst,owner_last_name:def.adminLast});
    cd.id=invite.business_id;
    console.log(`  ✓ Company: ${cd.id}`);
    await api('POST','/api/onboarding/accept-business-invite',{token:invite.token,password:def.adminPass,first_name:def.adminFirst,last_name:def.adminLast});
    console.log(`  ✓ Admin activated: ${def.adminEmail}`);

    await doLogout(); await loginAs(def.adminEmail,def.adminPass);

    try{ await api('POST','/api/admin/create-tutor',{email:def.tutorEmail,firstName:def.tutorFirst,lastName:def.tutorLast,companyId:cd.id,specialization:'Exam Preparation',qualifications:'BEd'}); console.log(`  ✓ Tutor: ${def.tutorEmail}`); }catch(e){console.log(`  ⚠ Tutor: ${e.message}`);}

    let termId;
    try{
      const yr=await api('POST',`/api/companies/${cd.id}/academic-years`,{yearNumber:2026,name:'2026',isActive:true});
      await api('POST',`/api/companies/${cd.id}/academic-auto-setup`,{yearId:yr.id,state:'NSW',division:'Eastern'});
      const terms=await api('GET',`/api/companies/${cd.id}/academic-terms`,null);
      const t3=terms.find(t=>t.name==='Term 3')||terms[0]; termId=t3?.id;
      console.log(`  ✓ Terms set up — using ${t3?.name}`);
    }catch(e){console.log(`  ⚠ Terms: ${e.message}`);}

    console.log(`  Creating 7 courses...`);
    for(const tpl of COURSE_TEMPLATES){
      try{ const c=await api('POST','/api/courses',{name:tpl.name,description:tpl.description,subject_ids:tpl.subjects,year_group_code:tpl.yearGroupCode}); cd.courses.push({id:c.id,name:tpl.name}); console.log(`    ✓ ${tpl.name}`); }catch(e){console.log(`    ⚠ ${tpl.name}: ${e.message}`);}
    }
    console.log(`  Creating classes...`);
    for(let i=0;i<cd.courses.length;i++){
      const co=cd.courses[i]; const sc=CLASS_SCHEDULES[i%CLASS_SCHEDULES.length];
      if(!termId) continue;
      try{ const cls=await api('POST','/api/classes',{name:`${co.name} – ${sc.day} ${sc.startTime}`,course_id:co.id,term_ids:[termId],capacity:12,location:`Room ${i+1}`,schedule_day_of_week:DAY_MAP[sc.day],schedule_start_time:sc.startTime,schedule_end_time:sc.endTime,status:'active'}); cd.classes.push({id:cls.id,name:cls.name}); console.log(`    ✓ ${cls.name}`); }catch(e){console.log(`    ⚠ ${co.name}: ${e.message}`);}
    }
    console.log(`  Creating 20 students...`);
    for(const sDef of makeStudents(ci)){
      try{ const r=await api('POST',`/api/businesses/${cd.id}/students`,sDef); cd.students.push({id:r.student.id,fullName:`${sDef.first_name} ${sDef.last_name}`,yearGroup:sDef.year_group_code,parentEmail:sDef.parents[0].email,parentPhone:sDef.parents[0].phone,parentName:sDef.parents[0].name}); process.stdout.write('.'); }catch(e){process.stdout.write('✗');}
    }
    console.log(`\n  ✓ ${cd.students.length}/20 students`);

    console.log(`  Creating 3 library items...`);
    for(const tpl of LIBRARY_TEMPLATES){
      try{ const item=await api('POST','/api/assignment-library',{companyId:cd.id,title:tpl.title,description:tpl.description,instructions:tpl.instructions,subjects:tpl.subjects,yearGroups:tpl.yearGroups,estimatedDuration:tpl.estimatedDuration,maxMarks:tpl.maxMarks,questions:tpl.questions}); await api('POST',`/api/assignment-library/${item.id}/publish`,{}); cd.libraryItems.push({id:item.id,title:tpl.title,maxMarks:tpl.maxMarks}); console.log(`    ✓ "${tpl.title}" published`); }catch(e){console.log(`    ⚠ "${tpl.title}": ${e.message}`);}
    }
    console.log(`  Allocating to students...`);
    const sIds=cd.students.map(s=>s.id).filter(Boolean); const today=new Date(); let tot=0;
    for(let li=0;li<cd.libraryItems.length;li++){
      const item=cd.libraryItems[li]; const due=new Date(today); due.setDate(due.getDate()+14+li*7);
      try{ const r=await api('POST',`/api/assignment-library/${item.id}/allocate`,{targetType:'students',studentIds:sIds,dueAt:due.toISOString(),allowResubmission:false,studentNote:'Complete all questions carefully.'}); tot+=r.allocated||0; console.log(`    ✓ "${item.title}" → ${r.allocated} students`); }catch(e){console.log(`    ⚠ ${e.message}`);}
    }
    console.log(`  ✓ ${tot} allocations (none completed)`);
    allData.push({def,cd}); await doLogout();
    console.log(`  ✓ DONE: ${def.name}`);
  }

  await browser.close();
  console.log('\n\n═══════════════════════════════════════════════════');
  console.log('  COMPLETE — dev.eslate.com.au');
  console.log('═══════════════════════════════════════════════════\n');
  for(const {def,cd} of allData){
    console.log(`${cd.name}`);
    console.log(`  Admin:  ${def.adminEmail} / ${def.adminPass}`);
    console.log(`  Tutor:  ${def.tutorEmail} / TempPass123!`);
    console.log(`  ID:     ${cd.id}`);
    console.log(`  ${cd.courses.length} courses · ${cd.classes.length} classes · ${cd.students.length} students · ${cd.libraryItems.length} assignments\n`);
  }
  console.log('✓ All done!\n');
})().catch(e=>{console.error('✗ FAILED:',e.message,e.stack);process.exit(1);});
