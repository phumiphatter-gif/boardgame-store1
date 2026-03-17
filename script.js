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

let games = []

/* =========================
   LOAD GAMES
========================= */

async function loadGames(){

const querySnapshot = await getDocs(collection(db,"games"))

games = []

querySnapshot.forEach((doc)=>{

games.push(doc.data())

})

renderGames(games)

}

loadGames()


/* =========================
   SHOW GAME CARDS
========================= */

function renderGames(list){

const container = document.getElementById("games")

container.innerHTML=""

list.forEach((game,index)=>{

container.innerHTML+=`

<div class="bg-white rounded shadow">

<img src="${game.image}"
class="w-full h-40 object-cover">

<div class="p-4">

<h3 class="font-bold text-lg">${game.name}</h3>

<p class="text-gray-500">
${game.category}
</p>

<button
onclick="showDetail(${index})"
class="mt-3 bg-indigo-500 text-white px-3 py-1 rounded">

รายละเอียด

</button>

</div>

</div>

`

})

}


/* =========================
   POPUP DETAIL
========================= */

window.showDetail = function(index){

const game = games[index]

document.getElementById("popupImg").src = game.image
document.getElementById("popupName").innerText = game.name
document.getElementById("popupCategory").innerText = game.category
document.getElementById("popupDesc").innerText = game.desc || ""

document.getElementById("popup").classList.remove("hidden")

}

window.closePopup = function(){

document.getElementById("popup").classList.add("hidden")

}


/* =========================
   SEARCH + FILTER
========================= */

window.filterGames = function(){

const keyword =
document.getElementById("search").value.toLowerCase()

const category =
document.getElementById("categoryFilter").value

let filtered = games.filter(game=>{

const matchName =
game.name.toLowerCase().includes(keyword)

const matchCategory =
category==="All" || game.category===category

return matchName && matchCategory

})

renderGames(filtered)

}