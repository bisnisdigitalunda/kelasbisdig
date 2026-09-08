// ============================================================
// DIGITAL BUSINESS PASSPORT
// Google Sheets → Website connection
// ============================================================

// Published CSV endpoints for the three Google Sheets used by the Passport.
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vROu-VwOiztKC_a-ncHZqcjWniIVDVxVdmaN9sJ__n_mbM-IZF9-jnnomyl-zWb5oxk0rkVBlh5ovKP/pub?gid=866228631&single=true&output=csv";
const FORM_RESPONSES_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vROu-VwOiztKC_a-ncHZqcjWniIVDVxVdmaN9sJ__n_mbM-IZF9-jnnomyl-zWb5oxk0rkVBlh5ovKP/pub?gid=1097565551&single=true&output=csv";
const MISSION_PROGRESS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vROu-VwOiztKC_a-ncHZqcjWniIVDVxVdmaN9sJ__n_mbM-IZF9-jnnomyl-zWb5oxk0rkVBlh5ovKP/pub?gid=258025882&single=true&output=csv";

const MISSIONS = [
  ["Digital Explorer", 10, "🔎"],
  ["Digital Detective", 20, "🕵️"],
  ["Money Hunter", 20, "💰"],
  ["Platform Hunter", 20, "🌐"],
  ["Trend Spotter", 20, "📡"],
  ["AI Business Explorer", 20, "🤖"],
  ["Content Detective", 20, "📱"],
  ["Local Business Hero", 25, "🏪"],
  ["Idea Maker", 25, "💡"],
  ["Business Builder", 30, "🧩"],
  ["Innovator", 30, "🚀"]
];

const LEVELS = [
  "🌱 Digital Rookie",
  "⚡ Digital Pathfinder",
  "🔥 Digital Strategist",
  "🚀 Digital Catalyst",
  "👑 Digital Visionary"
];

function parseCSV(text) {
  text = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i + 1];
    if (ch === '"') {
      if (quoted && next === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === ',' && !quoted) {
      row.push(cell); cell = "";
    } else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && next === '\n') i++;
      row.push(cell);
      if (row.some(v => v.trim() !== "")) rows.push(row);
      row = []; cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    if (row.some(v => v.trim() !== "")) rows.push(row);
  }
  if (!rows.length) return [];
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).map(values => {
    const obj = {};
    headers.forEach((header, i) => obj[header] = (values[i] ?? "").trim());
    return obj;
  });
}

function getStudentId() {
  return new URLSearchParams(window.location.search).get("student");
}

function cleanId(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "-");
}

function numberFrom(value) {
  const n = Number(String(value || "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function levelIndex(levelText, xp) {
  const found = LEVELS.findIndex(level => levelText.toLowerCase().includes(level.replace(/^\S+\s/, "").toLowerCase()));
  if (found >= 0) return found + 1;
  if (xp <= 40) return 1;
  if (xp <= 80) return 2;
  if (xp <= 120) return 3;
  if (xp <= 180) return 4;
  return 5;
}

function escapeHTML(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function findHeader(student, label) {
  const key = Object.keys(student).find(k => k.trim().toLowerCase() === label.trim().toLowerCase());
  return key ? student[key] : "";
}

function getAchievementStatus(student, missionName) {
  return String(findHeader(student, missionName) || "").trim() === "🏆";
}

function getCompletedMissions(student) {
  return MISSIONS.filter(mission => getAchievementStatus(student, mission[0]));
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function renderError(message) {
  const page = document.getElementById("passportPage");
  if (!page) return;
  page.classList.add("passport-ready");
  page.innerHTML = `<section style="max-width:900px;margin:80px auto;padding:40px 24px;text-align:center"><div style="font-size:52px">🧭</div><h1>Digital Passport belum ditemukan</h1><p style="margin:16px auto;max-width:650px;line-height:1.7">${escapeHTML(message)}</p><a class="btn btn-primary" href="index.html">← Kembali ke Home</a></section>`;
}

async function fetchCSV(url) {
  const response = await fetch(url + (url.includes("?") ? "&" : "?") + "cache=" + Date.now(), { cache: "no-store" });
  if (!response.ok) throw new Error("CSV tidak dapat diakses");
  return parseCSV(await response.text());
}

async function loadStudents() { return fetchCSV(SHEET_CSV_URL); }

async function loadMissionProgress() {
  try { return await fetchCSV(MISSION_PROGRESS_CSV_URL); }
  catch (e) { console.warn("Mission Progress belum dapat dibaca:", e); return []; }
}

async function loadFormResponses() {
  try { return await fetchCSV(FORM_RESPONSES_CSV_URL); }
  catch (e) { console.warn("Form Responses 1 belum dapat dibaca:", e); return []; }
}

function renderNextAchievement(completed) {
  const el = document.getElementById("nextAchievement");
  if (!el) return;
  const next = MISSIONS.find(m => !completed.some(c => c[0] === m[0]));
  if (!next) {
    el.innerHTML = `<div class="next-achievement complete"><div class="next-icon">👑</div><div><span>ALL ACHIEVEMENTS UNLOCKED</span><h4>Digital Visionary</h4><p>Semua Digital Mission telah diselesaikan.</p></div></div>`;
    return;
  }
  el.innerHTML = `<div class="next-achievement"><div class="next-icon">${next[2]}</div><div><span>NEXT MILESTONE</span><h4>${escapeHTML(next[0])}</h4><p>Selesaikan mission berikutnya untuk membuka achievement ini.</p><strong>+${next[1]} XP</strong></div></div>`;
}

function renderAchievementCollection(completed) {
  const el = document.getElementById("badgeCollection");
  if (!el) return;
  setText("collectionCount", `${completed.length} / ${MISSIONS.length}`);
  el.innerHTML = completed.length
    ? completed.map(m => `<div class="collection-badge" title="${escapeHTML(m[0])}"><span>${m[2]}</span><b>${escapeHTML(m[0])}</b></div>`).join("")
    : `<div class="collection-empty">Belum ada badge. Selesaikan Digital Mission pertamamu untuk mulai membangun koleksi achievement.</div>`;
}

function findHeaderContains(row, terms) {
  const keys = Object.keys(row || {});
  const wanted = terms.map(t => t.toLowerCase());
  const key = keys.find(k => wanted.every(t => k.trim().toLowerCase().includes(t)));
  return key ? String(row[key] ?? "").trim() : "";
}

function sameStudent(row, student) {
  const name = findHeader(student, "Nama");
  const npm = findHeader(student, "NPM");
  const rowName = findHeader(row, "Nama") || findHeader(row, "Nama Lengkap");
  const rowNpm = findHeader(row, "NPM");
  if (npm && rowNpm && rowNpm === npm) return true;
  return !!(name && rowName && cleanId(rowName) === cleanId(name));
}

function renderDiscoveries(student, missionRows) {
  const el = document.getElementById("discoveries");
  if (!el) return;

  // Discovery is a student's actual finding/result, not a repeat of the
  // mission status. Therefore any non-empty Discovery / Hasil is shown.
  const relevant = missionRows.filter(r => sameStudent(r, student));
  const discoveries = relevant.map(r => ({
    mission: findHeader(r, "Mission") || "Digital Mission",
    result: findHeader(r, "Discovery / Hasil") || findHeaderContains(r, ["discovery"])
  })).filter(x => x.result);

  if (!discoveries.length) {
    el.innerHTML = `<div class="discovery-empty"><span>🔎</span><b>No discoveries recorded yet</b><p>Hasil eksplorasi mahasiswa akan muncul di sini setelah Discovery / Hasil diisi pada Mission Progress.</p></div>`;
    return;
  }

  el.innerHTML = discoveries.map(r =>
    `<article class="discovery"><span>${escapeHTML(r.mission.toUpperCase())}</span><p>“${escapeHTML(r.result)}”</p></article>`
  ).join("");
}

function renderBusinessIdea(student, formRows) {
  const el = document.getElementById("businessIdea");
  if (!el) return;

  const relevant = formRows.find(r => sameStudent(r, student));
  let idea = "";
  if (relevant) {
    // The Google Form question may contain helper text, e.g.:
    // “Kalau saya bisa membuat satu bisnis digital, ...”. Match the header
    // semantically instead of requiring one exact header string.
    idea = findHeaderContains(relevant, ["bisnis digital"]);
  }

  if (!idea) {
    el.innerHTML = `<div class="idea-empty"><span>💡</span><b>Your business idea will appear here.</b><p>Isi ide bisnis pada Digital Business Student Profile untuk menampilkannya di Passport.</p></div>`;
    return;
  }
  el.innerHTML = `<div class="idea-content"><span>INITIAL BUSINESS IDEA</span><p>“${escapeHTML(idea)}”</p></div>`;
}

function renderPassport(student, missionRows, formRows) {
  const page = document.getElementById("passportPage");
  if (page) page.classList.add("passport-ready");
  const name = findHeader(student, "Nama") || "Mahasiswa Bisnis Digital";
  const npm = findHeader(student, "NPM") || "-";
  const className = findHeader(student, "Kelas") || "-";
  const strength = findHeader(student, "Personal Strength") || "Belum diisi.";
  const xp = numberFrom(findHeader(student, "XP"));
  const progressText = findHeader(student, "Progress");
  const level = findHeader(student, "Level") || LEVELS[0];
  const completed = getCompletedMissions(student);
  const total = MISSIONS.length;
  const pct = Math.min(100, Math.round((xp / 240) * 100));
  const stage = levelIndex(level, xp);

  document.title = `${name} | Digital Business Passport`;
  setText("heroName", `${name}'s Digital Journey.`);
  setText("studentName", name);
  setText("studentClass", `S1 Bisnis Digital • Kelas ${className} • Semester 1`);
  setText("studentNim", `NPM • ${npm}`);
  setText("studentStrength", `Strength • ${strength}`);
  setText("profilePhoto", name.charAt(0).toUpperCase());
  setText("studentLevel", stage);
  setText("levelTitle", level.toUpperCase());
  setText("studentXP", xp);
  setText("missionDone", completed.length);
  setText("missionTotal", `of ${total} completed`);
  setText("achievementCount", completed.length);
  setText("journeyPercent", progressText || `${pct}%`);
  setText("journeyPercent2", progressText || `${pct}%`);
  const progressBar = document.getElementById("bigProgress");
  if (progressBar) progressBar.style.width = `${pct}%`;

  // Personal Strength remains here as a profile trait, not a mission result.
  const discoveries = document.getElementById("discoveries");
  if (discoveries) renderDiscoveries(student, missionRows);

  renderBusinessIdea(student, formRows);
  renderNextAchievement(completed);
  renderAchievementCollection(completed);

  const journeyList = document.getElementById("journeyList");
  if (journeyList) {
    journeyList.innerHTML = MISSIONS.map((m, i) => {
      const done = getAchievementStatus(student, m[0]);
      return `<div class="journey-item ${done ? "done" : ""}"><span class="journey-dot">${done ? "✓" : String(i + 1).padStart(2, "0")}</span><div><b>${m[2]} ${escapeHTML(m[0])}</b><small>${done ? "Mission completed" : "Not completed yet"}</small></div><span class="earned">${done ? "+" + m[1] + " XP" : "LOCKED"}</span></div>`;
    }).join("");
  }
}

async function renderFromGoogleSheets() {
  const requestedId = getStudentId();
  if (!requestedId) {
    renderError("Tambahkan Passport ID pada alamat halaman. Contoh: passport.html?student=aditya-pratama");
    return;
  }
  try {
    const [students, missionRows, formRows] = await Promise.all([loadStudents(), loadMissionProgress(), loadFormResponses()]);
    const target = cleanId(requestedId);
    const student = students.find(row => cleanId(findHeader(row, "Passport ID")) === target);
    if (!student) {
      renderError(`Passport ID “${requestedId}” tidak ada di STUDENT PASSPORT. Periksa kembali alamat URL.`);
      return;
    }
    renderPassport(student, missionRows, formRows);
  } catch (error) {
    console.error(error);
    renderError("Data Google Sheets belum dapat dimuat. Pastikan sheet sudah dipublikasikan sebagai CSV dan koneksi internet aktif.");
  }
}

renderFromGoogleSheets();
