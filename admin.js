import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

/* =========================
   LOAD GAMES
========================= */

window.loadGames = async function () {
  const table = document.getElementById("gameTable");
  table.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "games"));

  querySnapshot.forEach((docSnap) => {
    const game = docSnap.data();
    const id = docSnap.id;

    table.innerHTML += `
      <tr>
        <td class="p-2">
          <img src="${game.image}" class="w-16 h-16 object-cover mx-auto">
        </td>

        <td>${game.name}</td>
        <td>${game.category}</td>

        <td class="space-x-2">

          <button onclick="openEdit('${id}')"
          class="bg-yellow-500 text-white px-2 py-1 rounded">
          Edit
          </button>

          <button onclick="deleteGame('${id}')"
          class="bg-red-500 text-white px-2 py-1 rounded">
          Delete
          </button>

        </td>
      </tr>
    `;
  });
};

/* =========================
   ADD GAME
========================= */

window.addGame = function () {
  const name = document.getElementById("name").value;
  const category = document.getElementById("category").value;
  const desc = document.getElementById("desc").value;
  const file = document.getElementById("image").files[0];

  if (!name || !file) {
    alert("กรอกชื่อเกมและเลือกรูปก่อน");
    return;
  }

  const reader = new FileReader();

  reader.onload = async function () {
    await addDoc(collection(db, "games"), {
      name,
      category,
      desc,
      image: reader.result
    });

    document.getElementById("name").value = "";
    document.getElementById("desc").value = "";
    document.getElementById("image").value = "";

    loadGames();
  };

  reader.readAsDataURL(file);
};

/* =========================
   DELETE GAME
========================= */

window.deleteGame = async function (id) {
  if (!confirm("ต้องการลบเกมนี้หรือไม่?")) return;

  await deleteDoc(doc(db, "games", id));
  loadGames();
};

/* =========================
   OPEN EDIT
========================= */

window.openEdit = async function (id) {
  editID = id;

  const snap = await getDoc(doc(db, "games", id));
  const game = snap.data();

  document.getElementById("editName").value = game.name;
  document.getElementById("editCategory").value = game.category;
  document.getElementById("editDesc").value = game.desc;

  document.getElementById("editPopup").classList.remove("hidden");
};

/* =========================
   CLOSE EDIT
========================= */

window.closeEdit = function () {
  document.getElementById("editPopup").classList.add("hidden");
};

/* =========================
   SAVE EDIT
========================= */

window.saveEdit = async function () {
  const name = document.getElementById("editName").value;
  const category = document.getElementById("editCategory").value;
  const desc = document.getElementById("editDesc").value;

  let file = document.getElementById("editImage").files[0];

  if (file) {
    let reader = new FileReader();

    reader.onload = async function (e) {
      await updateDoc(doc(db, "games", editID), {
        name,
        category,
        desc,
        image: e.target.result
      });

      closeEdit();
      loadGames();
    };

    reader.readAsDataURL(file);
  } else {
    await updateDoc(doc(db, "games", editID), {
      name,
      category,
      desc
    });

    closeEdit();
    loadGames();
  }
};