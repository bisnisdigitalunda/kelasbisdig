const missions = [
  {
    id: 1, icon:"🔎", title:"Digital Explorer", xp:10, status:"available",
    short:"Petakan aktivitas digital yang kamu lakukan setiap hari.",
    intro:"Temukan bahwa aktivitas digital sehari-hari sebenarnya terhubung dengan bisnis.",
    find:["Catat minimal 5 aktivitas digital yang kamu lakukan dalam sehari.","Untuk setiap aktivitas, identifikasi platform atau bisnis yang terlibat.","Tulis siapa yang menurutmu mendapatkan nilai atau pendapatan dari aktivitas tersebut."],
    proof:"Buat satu halaman ringkasan atau visual sederhana berisi temuanmu."
  },
  {
    id: 2, icon:"🕵️", title:"Digital Detective", xp:20, status:"available",
    short:"Bongkar satu bisnis digital yang sering kamu gunakan.",
    intro:"Pilih satu bisnis digital. Jangan hanya ceritakan apa yang kamu lihat—bongkar cara kerjanya.",
    find:["Apa yang ditawarkan?","Siapa penggunanya?","Masalah apa yang diselesaikan?","Mengapa orang memilihnya?"],
    proof:"Sertakan screenshot/link sumber dan analisis singkat."
  },
  {
    id: 3, icon:"💰", title:"Money Hunter", xp:20, status:"available",
    short:"Cari tahu dari mana sebuah platform mendapatkan uang.",
    intro:"Platform gratis bukan berarti tidak menghasilkan uang. Cari tahu model pendapatannya.",
    find:["Identifikasi sumber pendapatan.","Siapa yang membayar?","Apa yang sebenarnya dijual?","Mengapa model tersebut masuk akal?"],
    proof:"Buat diagram sederhana: User → Value → Revenue."
  },
  {
    id: 4, icon:"🌐", title:"Platform Hunter", xp:20, status:"locked",
    short:"Petakan ekosistem sebuah platform digital.",
    intro:"Pilih platform yang memiliki banyak layanan dan cari hubungan antar-layanannya.",
    find:["Identifikasi layanan utama.","Siapa saja pihak yang terlibat?","Bagaimana pengguna berpindah dari satu layanan ke layanan lain?"],
    proof:"Buat peta ekosistem sederhana."
  },
  {
    id: 5, icon:"📡", title:"Trend Spotter", xp:20, status:"locked",
    short:"Cari tren digital dan buktikan apakah pasar benar-benar tertarik.",
    intro:"Jangan percaya hanya karena sesuatu terlihat viral. Cari data atau bukti minat pasar.",
    find:["Pilih satu tren.","Cari bukti pertumbuhannya.","Bandingkan dengan tren lain.","Tentukan apakah tren tersebut peluang atau hanya hype."],
    proof:"Sertakan sumber data dan kesimpulanmu."
  },
  {
    id: 6, icon:"🤖", title:"AI Business Explorer", xp:20, status:"locked",
    short:"Temukan penggunaan AI dalam aktivitas bisnis nyata.",
    intro:"Cari contoh AI yang membantu pemasaran, layanan, produksi, analisis, atau pekerjaan bisnis.",
    find:["Siapa yang menggunakan AI?","Masalah apa yang dibantu?","Apa manfaatnya?","Apa risikonya?"],
    proof:"Tampilkan contoh nyata dan pendapatmu."
  },
  {
    id: 7, icon:"📱", title:"Content Detective", xp:20, status:"locked",
    short:"Bongkar mengapa sebuah konten mampu menarik perhatian.",
    intro:"Pilih satu konten yang menurutmu berhasil. Bedah strategi di baliknya.",
    find:["Apa hook-nya?","Siapa target audiensnya?","Apa pesan utamanya?","Apa CTA-nya?"],
    proof:"Sertakan link/screenshot dan hasil bedah konten."
  },
  {
    id: 8, icon:"🏪", title:"Local Business Hero", xp:25, status:"locked",
    short:"Temukan UMKM lokal yang sedang bertransformasi secara digital.",
    intro:"Keluar dari layar. Temui atau amati bisnis nyata di sekitarmu.",
    find:["Bagaimana bisnis tersebut berpromosi?","Platform digital apa yang digunakan?","Apa perubahan setelah menggunakan digital?","Apa tantangannya?"],
    proof:"Dokumentasi observasi/foto dengan izin dan hasil wawancara singkat."
  },
  {
    id: 9, icon:"💡", title:"Idea Maker", xp:25, status:"locked",
    short:"Temukan masalah nyata dan ubah menjadi ide solusi digital.",
    intro:"Ide bisnis yang baik sering dimulai dari masalah yang benar-benar ada.",
    find:["Temukan satu masalah.","Siapa yang mengalami?","Mengapa masalah itu penting?","Bagaimana solusi digitalmu membantu?"],
    proof:"Buat problem-solution statement satu halaman."
  },
  {
    id: 10, icon:"🧩", title:"Business Builder", xp:30, status:"locked",
    short:"Bangun model bisnis sederhana dari ide yang kamu pilih.",
    intro:"Satukan temuanmu menjadi sebuah model bisnis yang dapat dijelaskan.",
    find:["Tentukan customer segment.","Value proposition.","Channels.","Revenue stream.","Key activities dan resources."],
    proof:"Buat Business Model Canvas dan presentasikan."
  }
];

const grid = document.getElementById("missionGrid");
const detailWrap = document.getElementById("missionDetail");
const detailContent = document.getElementById("detailContent");
const completedCount = document.getElementById("completedCount");
const totalCount = document.getElementById("totalCount");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

totalCount.textContent = missions.length;

// Demo state: change IDs here to simulate completed missions.
const completed = new Set([]);

function renderMissions(filter="all"){
  grid.innerHTML = "";
  missions.forEach(m => {
    const isCompleted = completed.has(m.id);
    const status = isCompleted ? "completed" : m.status;
    if(filter !== "all" && filter !== status) return;

    const statusLabel = isCompleted ? "COMPLETED" : status === "locked" ? "LOCKED" : "AVAILABLE";
    const buttonLabel = isCompleted ? "✓ Completed" : status === "locked" ? "🔒 Locked" : "Start Mission";
    const buttonClass = isCompleted ? "completed-btn" : status === "locked" ? "locked-btn" : "";

    const card = document.createElement("article");
    card.className = `mission-tile ${status}`;
    card.innerHTML = `
      <div class="tile-top">
        <span class="mission-number">MISSION ${String(m.id).padStart(2,"0")}</span>
        <span class="status ${status}">${statusLabel}</span>
      </div>
      <div class="tile-icon">${m.icon}</div>
      <h3>${m.title}</h3>
      <p>${m.short}</p>
      <div class="tile-bottom">
        <span class="tile-xp">⭐ +${m.xp} XP</span>
        <button class="start-btn ${buttonClass}" ${status==="locked" || isCompleted ? "disabled" : ""}>${buttonLabel}</button>
      </div>`;
    const btn = card.querySelector("button");
    if(!btn.disabled) btn.addEventListener("click",()=>openMission(m));
    grid.appendChild(card);
  });
  updateProgress();
}

function updateProgress(){
  const done = completed.size;
  const pct = Math.round(done / missions.length * 100);
  completedCount.textContent = done;
  progressBar.style.width = pct + "%";
  progressText.textContent = done === 0 ? "Your journey is just beginning." :
    done === missions.length ? "All missions completed. Amazing journey!" :
    `${pct}% complete — keep exploring.`;
}

function openMission(m){
  detailContent.innerHTML = `
    <div class="detail-head">
      <div class="detail-icon">${m.icon}</div>
      <div><small>MISSION ${String(m.id).padStart(2,"0")}</small><h2>${m.title}</h2><span class="detail-xp">⭐ +${m.xp} XP</span></div>
    </div>
    <p class="detail-intro">${m.intro}</p>
    <div class="detail-block"><b>🔎 FIND & EXPLORE</b><ul>${m.find.map(x=>`<li>${x}</li>`).join("")}</ul></div>
    <div class="detail-block"><b>📸 PROOF OF DISCOVERY</b><p style="font-size:12px;color:#667188;margin-top:7px">${m.proof}</p></div>
    <div class="detail-block"><b>🎯 MISSION GOAL</b><p style="font-size:12px;color:#667188;margin-top:7px">Bawa hasil temuanmu ke kelas dan bersiap menjelaskan apa yang kamu pelajari.</p></div>
    <div class="detail-actions">
      <button class="detail-close" id="detailCloseBtn">Tutup</button>
      <button class="detail-submit" id="demoCompleteBtn">Demo: Tandai Selesai</button>
    </div>`;
  detailWrap.classList.add("show");
  document.getElementById("detailCloseBtn").onclick = closeMission;
  document.getElementById("demoCompleteBtn").onclick = ()=>{
    completed.add(m.id);
    closeMission();
    renderMissions(document.querySelector(".filter.active").dataset.filter);
  };
}

function closeMission(){ detailWrap.classList.remove("show"); }
document.getElementById("closeDetail").onclick = closeMission;
detailWrap.addEventListener("click",e=>{if(e.target===detailWrap)closeMission()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeMission()});

document.querySelectorAll(".filter").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    renderMissions(btn.dataset.filter);
  });
});

renderMissions();
