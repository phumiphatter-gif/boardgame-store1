import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAnug1LvphDK9nJE25Pxj6Loy9jbfw4LdM",
  authDomain: "boardgame-store-d6a50.firebaseapp.com",
  projectId: "boardgame-store-d6a50",
  storageBucket: "boardgame-store-d6a50.firebasestorage.app",
  messagingSenderId: "587237445477",
  appId: "1:587237445477:web:542283bb74a03c55de9b8c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let editID = null;
let editCatID = null;

/* CATEGORY FUNCTIONS */
window.loadCategories = async function () {
  const catTable = document.getElementById("catTable");
  const catSelect = document.getElementById("category");
  const editCatSelect = document.getElementById("editCategory");
  const totalCatText = document.getElementById("totalCategories");

  catTable.innerHTML = ""; catSelect.innerHTML = ""; if(editCatSelect) editCatSelect.innerHTML = "";
  
  const querySnapshot = await getDocs(collection(db, "categories"));
  let count = 0;

  querySnapshot.forEach((docSnap) => {
    const cat = docSnap.data().name; const id = docSnap.id; count++;
    catTable.innerHTML += `<tr class="border-b">
        <td class="p-2 border pl-4">${cat}</td>
        <td class="p-2 border text-center space-x-2">
          <button onclick="openEditCat('${id}', '${cat}')" class="bg-yellow-500 text-white px-2 py-1 rounded text-xs">Edit</button>
          <button onclick="deleteCategory('${id}')" class="bg-red-500 text-white px-2 py-1 rounded text-xs">Delete</button>
        </td></tr>`;
    const option = `<option value="${cat}">${cat}</option>`;
    catSelect.innerHTML += option; if(editCatSelect) editCatSelect.innerHTML += option;
  });
  totalCatText.innerText = count;
};

window.addCategory = async function () {
  const input = document.getElementById("newCatInput");
  if (!input.value.trim()) return alert("กรุณากรอกชื่อหมวดหมู่");
  await addDoc(collection(db, "categories"), { name: input.value.trim() });
  input.value = ""; await loadCategories();
};

window.openEditCat = (id, name) => {
  editCatID = id; document.getElementById("editCatName").value = name;
  document.getElementById("editCatPopup").classList.remove("hidden");
};
window.closeEditCat = () => document.getElementById("editCatPopup").classList.add("hidden");

window.saveEditCat = async function () {
  await updateDoc(doc(db, "categories", editCatID), { name: document.getElementById("editCatName").value });
  closeEditCat(); loadCategories(); loadGames();
};

window.deleteCategory = async function (id) {
  if (confirm("ลบหมวดหมู่หรือไม่?")) { await deleteDoc(doc(db, "categories", id)); loadCategories(); }
};

/* GAME FUNCTIONS */
window.loadGames = async function () {
  const table = document.getElementById("gameTable");
  table.innerHTML = ""; 
  await loadCategories(); // โหลดหมวดหมู่
  
  const querySnapshot = await getDocs(collection(db, "games"));
  let gameCount = 0;

  // 1. เก็บข้อมูลลง Array ก่อนเพื่อเตรียม Sort
  let gamesList = [];
  querySnapshot.forEach((docSnap) => {
    gamesList.push({ id: docSnap.id, ...docSnap.data() });
  });

  // 2. เรียงลำดับชื่อเกม A-Z และ ก-ฮ
  gamesList.sort((a, b) => {
    const nameA = (a.name || "").toLowerCase();
    const nameB = (b.name || "").toLowerCase();
    return nameA.localeCompare(nameB, 'th');
  });

  // 3. วนลูปสร้างแถวจากข้อมูลที่เรียงลำดับแล้ว
  gamesList.forEach((game) => {
    const id = game.id; 
    gameCount++;
    table.innerHTML += `<tr class="border-b">
        <td class="p-2"><img src="${game.image}" class="w-16 h-16 object-cover mx-auto rounded shadow"></td>
        <td class="font-medium">${game.name}</td>
        <td>${game.category}</td>
        <td class="space-x-2">
          <button onclick="openEdit('${id}')" class="bg-yellow-500 text-white px-2 py-1 rounded text-sm">Edit</button>
          <button onclick="deleteGame('${id}')" class="bg-red-500 text-white px-2 py-1 rounded text-sm">Delete</button>
        </td></tr>`;
  });

  document.getElementById("totalGames").innerText = gameCount;
};




window.addGame = function () {
  const btn = document.getElementById("addBtn");
  const file = document.getElementById("image").files[0];
  if (!document.getElementById("name").value || !file) return alert("ข้อมูลไม่ครบ");
  btn.innerText = "กำลังอัปโหลด..."; btn.disabled = true;
  const reader = new FileReader();
  reader.onload = async function () {
    await addDoc(collection(db, "games"), { 
        name: document.getElementById("name").value, 
        category: document.getElementById("category").value, 
        desc: document.getElementById("desc").value, 
        image: reader.result 
    });
    btn.innerText = "Add Game"; btn.disabled = false; 
    document.getElementById("name").value = ""; document.getElementById("image").value = ""; 
    loadGames();
  };
  reader.readAsDataURL(file);
};

window.deleteGame = async function (id) { if (confirm("ลบเกมหรือไม่?")) { await deleteDoc(doc(db, "games", id)); loadGames(); } };
window.openEdit = async function (id) {
  editID = id; const snap = await getDoc(doc(db, "games", id)); const game = snap.data();
  document.getElementById("editName").value = game.name; document.getElementById("editCategory").value = game.category;
  document.getElementById("editDesc").value = game.desc; document.getElementById("editPopup").classList.remove("hidden");
};
window.closeEdit = () => document.getElementById("editPopup").classList.add("hidden");
window.saveEdit = async function () {
  const data = { name: document.getElementById("editName").value, category: document.getElementById("editCategory").value, desc: document.getElementById("editDesc").value };
  const file = document.getElementById("editImage").files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async function (e) { data.image = e.target.result; await updateDoc(doc(db, "games", editID), data); closeEdit(); loadGames(); };
    reader.readAsDataURL(file);
  } else { await updateDoc(doc(db, "games", editID), data); closeEdit(); loadGames(); }
};