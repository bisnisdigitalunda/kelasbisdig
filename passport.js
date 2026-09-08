// ============================================================
// DIGITAL BUSINESS PASSPORT
// Google Sheets → Website connection
// ============================================================

const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vROu-VwOiztKC_a-ncHZqcjWniIVDVxVdmaN9sJ__n_mbM-IZF9-jnnomyl-zWb5oxk0rkVBlh5ovKP/pub?gid=866228631&single=true&output=csv";

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

// CSV parser that handles quoted fields and commas inside answers.
function parseCSV(text) {
  text = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"') {
      if (quoted && next === '"') {
        cell += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (ch === ',' && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && next === '\n') i++;
      row.push(cell);
      if (row.some(value => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }

  if (cell !== "" || row.length) {
    row.push(cell);
    if (row.some(value => value.trim() !== "")) rows.push(row);
  }

  if (!rows.length) return [];

  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).map(values => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = (values[i] ?? "").trim();
    });
    return obj;
  });
}

function getStudentId() {
  return new URLSearchParams(window.location.search).get("student");
}

function cleanId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function numberFrom(value) {
  const n = Number(String(value || "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function levelIndex(levelText, xp) {
  const found = LEVELS.findIndex(level =>
    levelText.toLowerCase().includes(level.replace(/^\S+\s/, "").toLowerCase())
  );
  if (found >= 0) return found + 1;
  if (xp <= 40) return 1;
  if (xp <= 80) return 2;
  if (xp <= 120) return 3;
  if (xp <= 180) return 4;
  return 5;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getAchievementStatus(student, missionName) {
  // The CSV uses the actual mission names as column headers (H:R),
  // not spreadsheet letters such as H, I, J...
  const value = findHeader(student, missionName);
  return String(value || "").trim() === "🏆";
}

function getCompletedMissions(student) {
  return MISSIONS.filter(mission => getAchievementStatus(student, mission[0]));
}

function findHeader(student, label) {
  const key = Object.keys(student).find(k => k.trim().toLowerCase() === label.trim().toLowerCase());
  return key ? student[key] : "";
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function renderError(message) {
  const page = document.getElementById("passportPage");
  if (!page) return;
  page.classList.add("passport-ready");
  page.innerHTML = `
    <section style="max-width:900px;margin:80px auto;padding:40px 24px;text-align:center">
      <div style="font-size:52px">🧭</div>
      <h1>Digital Passport belum ditemukan</h1>
      <p style="margin:16px auto;max-width:650px;line-height:1.7">${escapeHTML(message)}</p>
      <a class="btn btn-primary" href="index.html">← Kembali ke Home</a>
    </section>`;
}

async function loadStudents() {
  const response = await fetch(SHEET_CSV_URL + "&cache=" + Date.now(), {
    method: "GET",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Google Sheets tidak dapat diakses.");
  }

  const csv = await response.text();
  return parseCSV(csv);
}

function renderPassport(student) {
  const page = document.getElementById("passportPage");
  if (page) page.classList.add("passport-ready");
  const name = findHeader(student, "Nama") || "Mahasiswa Bisnis Digital";
  const npm = findHeader(student, "NPM") || "-";
  const className = findHeader(student, "Kelas") || "-";
  const strength = findHeader(student, "Personal Strength") || "Belum diisi.";
  const xp = numberFrom(findHeader(student, "XP"));
  const progressText = findHeader(student, "Progress");
  const level = findHeader(student, "Level") || LEVELS[0];
  const passportId = findHeader(student, "Passport ID");
  const completed = getCompletedMissions(student);
  const total = MISSIONS.length;
  const pct = Math.min(100, Math.round((xp / 240) * 100));
  const achievementCount = completed.length;
  const stage = levelIndex(level, xp);

  document.title = `${name} | Digital Business Passport`;
  setText("heroName", `${name}'s Digital Journey.`);
  setText("studentName", name);
  setText("studentClass", `S1 Bisnis Digital • Kelas ${className} • Semester 1`);
  setText("studentNim", `NPM • ${npm}`);
  setText("profilePhoto", name.charAt(0).toUpperCase());
  setText("studentLevel", stage);
  setText("levelTitle", level.toUpperCase());
  setText("studentXP", xp);
  setText("missionDone", achievementCount);
  setText("missionTotal", `of ${total} completed`);
  setText("achievementCount", achievementCount);
  setText("journeyPercent", `${pct}%`);
  setText("journeyPercent2", `${pct}%`);

  const progressBar = document.getElementById("bigProgress");
  if (progressBar) progressBar.style.width = `${pct}%`;

  // Show Personal Strength inside the discovery area.
  const discoveries = document.getElementById("discoveries");
  if (discoveries) {
    discoveries.innerHTML = `
      <div class="discovery">
        <span>PERSONAL STRENGTH</span>
        <p>${escapeHTML(strength)}</p>
      </div>
      ${completed.map(m => `
        <div class="discovery">
          <span>${escapeHTML(m[0].toUpperCase())}</span>
          <p>Mission selesai • <strong>+${m[1]} XP</strong></p>
        </div>`).join("")}
    `;
  }

  // Business idea is taken from the Mission Progress sheet when available.
  // STUDENT PASSPORT itself does not contain the discovery/idea text, so we keep
  // this section informative rather than inventing student data.
  const idea = document.getElementById("businessIdea");
  if (idea) {
    idea.innerHTML = `
      <p>💡 Ide bisnis dan hasil discovery akan ditampilkan di sini setelah data Mission Progress terhubung ke website.</p>
      <small>Passport ID: ${escapeHTML(passportId)}</small>`;
  }

  const journeyList = document.getElementById("journeyList");
  if (journeyList) {
    journeyList.innerHTML = MISSIONS.map((m, i) => {
      const done = getAchievementStatus(student, m[0]);
      return `<div class="journey-item ${done ? "done" : ""}">
        <span class="journey-dot">${done ? "✓" : String(i + 1).padStart(2, "0")}</span>
        <div><b>${m[2]} ${escapeHTML(m[0])}</b><small>${done ? "Mission completed" : "Not completed yet"}</small></div>
        <span class="earned">${done ? "+" + m[1] + " XP" : "LOCKED"}</span>
      </div>`;
    }).join("");
  }

  const badgeList = document.getElementById("badgeList");
  if (badgeList) {
    const unlocked = completed.map(m =>
      `<div class="passport-badge"><div class="badge-symbol">${m[2]}</div><b>${escapeHTML(m[0])}</b><small>UNLOCKED</small></div>`
    ).join("");
    const locked = Array.from({ length: Math.max(0, 4 - achievementCount) }, () =>
      `<div class="passport-badge locked"><div class="badge-symbol">🔒</div><b>Achievement Locked</b><small>KEEP EXPLORING</small></div>`
    ).join("");
    badgeList.innerHTML = unlocked + locked;
  }

  // Show the original Progress value from Google Sheets if it exists.
  const progressLabel = document.querySelector(".journey-percent");
  if (progressLabel && progressText) progressLabel.textContent = progressText;
}

async function renderFromGoogleSheets() {
  const requestedId = getStudentId();

  if (!requestedId) {
    renderError("Tambahkan Passport ID pada alamat halaman. Contoh: passport.html?student=aditya-pratama");
    return;
  }

  try {
    const students = await loadStudents();
    const target = cleanId(requestedId);
    const student = students.find(row => cleanId(findHeader(row, "Passport ID")) === target);

    if (!student) {
      renderError(`Passport ID “${requestedId}” tidak ada di STUDENT PASSPORT. Periksa kembali alamat URL.`);
      return;
    }

    renderPassport(student);
  } catch (error) {
    console.error(error);
    renderError("Data Google Sheets belum dapat dimuat. Pastikan sheet sudah dipublikasikan sebagai CSV dan koneksi internet aktif.");
  }
}

renderFromGoogleSheets();
