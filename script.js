import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"

const firebaseConfig = {
  apiKey: "AIzaSyAnug1LvphDK9nJE25Pxj6Loy9jbfw4LdM",
  authDomain: "boardgame-store-d6a50.firebaseapp.com",
  projectId: "boardgame-store-d6a50",
  storageBucket: "boardgame-store-d6a50.firebasestorage.app",
  messagingSenderId: "587237445477",
  appId: "1:587237445477:web:542283bb74a03c55de9b8c"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// --- ตัวแปรควบคุมข้อมูลและการแบ่งหน้า ---
let games = []           // ข้อมูลทั้งหมดจาก Firebase
let filteredGames = []   // ข้อมูลที่ผ่านการค้นหา/กรอง
let currentPage = 1;      // หน้าที่กำลังแสดงผล
const gamesPerPage = 20;  // จำกัดหน้าละ 20 เกม

/* =========================
   LOAD GAMES
========================= */
async function loadGames() {
  const querySnapshot = await getDocs(collection(db, "games"));
  games = [];

  querySnapshot.forEach((doc) => {
    games.push(doc.data());
  });
  // เรียงลำดับเกมตามชื่อ (A-Z และ ก-ฮ)
  games.sort((a, b) => {
    return (a.name || "").localeCompare((b.name || ""), 'th');
  });
  //
   console.log("games:", games);
  filteredGames = [...games];

  renderCategories(); // 
  renderGames();
}


/* =========================
   SHOW GAME CARDS (3 คอลัมน์ + ปุ่มอยู่ท้าย)
========================= */
/* =========================
   SHOW GAME CARDS (ฉบับแก้ไข: รูปบน ชื่อและปุ่มล่าง)
========================= */
function renderGames() {
  const container = document.getElementById("games");
  container.innerHTML = "";

  // คำนวณ Index สำหรับแบ่งหน้าละ 20 เกม
  const startIndex = (currentPage - 1) * gamesPerPage;
  const endIndex = startIndex + gamesPerPage;
  const paginatedItems = filteredGames.slice(startIndex, endIndex);

  paginatedItems.forEach((game, index) => {
    const actualIndex = startIndex + index;

    container.innerHTML += `
      <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden" 
           style="display: flex !important; flex-direction: column !important; height: 100% !important;">
        
        <div style="width: 100% !important; aspect-ratio: 16 / 9 !important; position: relative !important; overflow: hidden !important; background: #f3f4f6;">
          <img src="${game.image}" 
               style="position: absolute !important; inset: 0 !important; width: 100% !important; height: 100% !important; object-fit: cover !important;">
        </div>

        <div class="p-4" style="display: flex !important; flex-direction: column !important; flex-grow: 1 !important;">
          
          <div style="flex-grow: 1 !important;">
            <h3 class="font-bold text-lg text-gray-800 line-clamp-1" style="margin-bottom: 4px !important;">${game.name}</h3>
            <p class="text-sm text-indigo-600 font-medium">${game.category}</p>
          </div>

          <button onclick="showDetail(${actualIndex})" 
                  class="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg text-sm transition-colors font-medium"
                  style="border: none !important; cursor: pointer !important;">
            รายละเอียด
          </button>
        </div>

      </div>
    `;
  });

  renderPagination();
}

/* =========================
   PAGINATION 
========================= */
function renderPagination() {
  const paginationContainer = document.getElementById("pagination");
  if (!paginationContainer) return;

  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);

  if (totalPages <= 1) return;

  const wrapper = document.createElement("div");
  // จัดกลุ่มให้อยู่กลางและเว้นระยะห่างระหว่างปุ่ม (Gap)
  wrapper.style.display = "flex";
  wrapper.style.justifyContent = "center";
  wrapper.style.alignItems = "center";
  wrapper.style.gap = "8px"; // ระยะห่างระหว่างปุ่มตามรูปที่ 2
  wrapper.style.marginTop = "40px";
  wrapper.style.marginBottom = "20px";

  // ฟังก์ชันช่วยสร้างปุ่มเพื่อให้สไตล์เหมือนกันเป๊ะ
  const createBtn = (content, onClick, isDisable, isActive) => {
    const btn = document.createElement("button");
    btn.innerHTML = content;
    
    // สไตล์พื้นฐาน: กรอบสี่เหลี่ยม, พื้นหลังขาว, เส้นขอบเทาบาง
    btn.style.width = "40px";
    btn.style.height = "40px";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.cursor = isDisable ? "default" : "pointer";
    btn.style.borderRadius = "4px"; // มนเล็กน้อยแบบสี่เหลี่ยม
    btn.style.border = "1px solid #e5e7eb"; // สีเทาอ่อน (gray-200)
    btn.style.fontSize = "14px";
    btn.style.fontWeight = "500";
    btn.style.transition = "all 0.2s";

   // ... (โค้ดส่วนบนคงเดิม)

    if (isActive) {
      btn.style.backgroundColor = "#ef4444"; 
      btn.style.color = "white";
      btn.style.borderColor = "#ef4444";
    } else if (isDisable) {
      btn.style.backgroundColor = "#ffffff";
      btn.style.color = "#d1d5db";
      btn.style.borderColor = "#f3f4f6";
    } else {
      btn.style.backgroundColor = "#ffffff";
      btn.style.color = "#4b5563";
      // เอฟเฟกต์ตอน Hover เปลี่ยนเป็นขอบสีแดง
      btn.onmouseover = () => { 
        btn.style.borderColor = "#ef4444"; 
        btn.style.color = "#ef4444"; 
      };
      btn.onmouseout = () => { 
        btn.style.borderColor = "#e5e7eb"; 
        btn.style.color = "#4b5563"; 
      };
    }

// ... (โค้ดส่วนล่างคงเดิม)
    btn.onclick = isDisable ? null : onClick;
    return btn;
  };

  // 1. ปุ่มย้อนกลับ
  wrapper.appendChild(createBtn("❮", () => {
    currentPage--;
    renderGames();
    scrollToCategory();
  }, currentPage === 1));

  // 2. ปุ่มตัวเลข
  for (let i = 1; i <= totalPages; i++) {
    wrapper.appendChild(createBtn(i, () => {
      currentPage = i;
      renderGames();
      scrollToCategory();
    }, false, currentPage === i));
  }

  // 3. ปุ่มถัดไป
  wrapper.appendChild(createBtn("❯", () => {
    currentPage++;
    renderGames();
    scrollToCategory();
  }, currentPage === totalPages));

  paginationContainer.appendChild(wrapper);
}
/* =========================
   POPUP DETAIL
========================= */
/* =========================
   POPUP DETAIL
========================= */
window.showDetail = function(index) {
  const game = filteredGames[index];
  if (!game) return;

  // ใส่ข้อมูลลง popup
  document.getElementById("popupImg").src = game.image;
  document.getElementById("popupName").innerText = game.name;
  document.getElementById("popupCategory").innerText = game.category || "";
  document.getElementById("popupDesc").innerText =
    game.desc || "ไม่มีรายละเอียดเพิ่มเติมสำหรับเกมนี้";

  // เปิด popup
  document.getElementById("popup").classList.remove("hidden");

  // ล็อค scroll ด้านหลัง
  document.body.style.overflow = "hidden";
}

window.closePopup = function() {
  document.getElementById("popup").classList.add("hidden");

  // ปลดล็อค scroll
  document.body.style.overflow = "auto";
}
/* =========================
   SEARCH + FILTER
========================= */
window.filterGames = function() {
  const keyword = document.getElementById("search").value.toLowerCase();
  const category = document.getElementById("categoryFilter").value;

  // ค้นหาใหม่ให้กลับไปเริ่มหน้า 1
  currentPage = 1;

  filteredGames = games.filter(game => {
    const matchName = game.name.toLowerCase().includes(keyword);
    const matchCategory = category === "All" || game.category === category;
    return matchName && matchCategory;
  });

  renderGames();
}

loadGames();

/* =========================
   ฟังก์ชันเลื่อนหน้าจอขึ้น (Smooth Scroll)
========================= */
function scrollToCategory() {
  // พยายามหาตำแหน่งของ id="category" (หัวข้อประเภท) หรือ id="games" (รายการเกม)
  const target = document.getElementById('category') || document.getElementById('games');
  
  if (target) {
    window.scrollTo({ 
      top: target.offsetTop - 100, // เลื่อนขึ้นไปให้เหนือเป้าหมาย 100px เพื่อไม่ให้ติดขอบจอเกินไป
      behavior: 'smooth'           // เลื่อนแบบนุ่มนวล
    });
  }
}


function renderCategories() {
  const select = document.getElementById("categoryFilter");

  if (!select) {
    console.log("ไม่เจอ select ");
    return;
  }

  const categories = [...new Set(
    games.map(game => game.category)
  )].filter(cat => cat);

  console.log("categories:", categories);

  select.innerHTML = `<option value="All">เกมทั้งหมด</option>`;

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}