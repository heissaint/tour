// ---------- 1. DATA ----------
// Each show is an object. Change these and the page updates itself.
const shows = [
  {
    id: 1,
    date: "Nov 14",
    venue: "The Harbour Hall",
    city: "Lagos",
    price: 45,
    soldOut: false,
  },
  {
    id: 2,
    date: "Nov 21",
    venue: "Palm Court Arena",
    city: "Accra",
    price: 40,
    soldOut: false,
  },
  {
    id: 3,
    date: "Nov 28",
    venue: "Lakeside Theatre",
    city: "Nairobi",
    price: 38,
    soldOut: true,
  },
  {
    id: 4,
    date: "Dec 05",
    venue: "The Glasshouse",
    city: "London",
    price: 60,
    soldOut: false,
  },
  {
    id: 5,
    date: "Dec 12",
    venue: "Dockyard Live",
    city: "Berlin",
    price: 55,
    soldOut: false,
  },
];

const plans = [
  {
    id: "p1",
    name: "Listener",
    price: 25,
    perks: ["Presale ticket access", "Fan club badge"],
  },
  {
    id: "p2",
    name: "Regular",
    price: 60,
    perks: ["Everything in Listener", "Limited vinyl drops"],
  },
  {
    id: "p3",
    name: "Front row",
    price: 140,
    perks: ["Everything in Regular", "Soundcheck lottery entry"],
  },
];

// The cart: keys are item ids, values are { name, price, qty }
let cart = {};

// ---------- 2. HELPERS ----------
const $ = (id) => document.getElementById(id);
const money = (n) => "$" + n.toFixed(0);

// ---------- 3. RENDER THE SHOWS ----------
function renderShows() {
  const chosen = $("filter").value;
  const list = $("showList");
  list.innerHTML = "";

  shows
    .filter((s) => chosen === "all" || s.city === chosen)
    .forEach((s) => {
      const li = document.createElement("li");
      li.className = "flex flex-wrap items-center justify-between gap-4 py-5";
      li.innerHTML = `
        <div class="flex items-center gap-6">
          <span class="font-display font-bold text-xl w-20">${s.date}</span>
          <div>
            <p class="font-bold">${s.venue}</p>
            <p class="text-sm text-sand/70">${s.city}</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sand/80">${money(s.price)}</span>
          ${
            s.soldOut
              ? '<span class="rounded-full border border-sand/30 px-4 py-1.5 text-sm text-sand/50">Sold out</span>'
              : `<button data-add="${s.id}" class="rounded-full bg-glass px-4 py-1.5 text-sm font-bold text-night hover:bg-lamp focus:outline-none focus-visible:ring-2 focus-visible:ring-lamp">Add ticket</button>`
          }
        </div>`;
      list.appendChild(li);
    });
}

function fillFilter() {
  const cities = [...new Set(shows.map((s) => s.city))];
  cities.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    $("filter").appendChild(opt);
  });
}

function renderPlans() {
  $("plans").innerHTML = plans
    .map(
      (p) => `
    <div class="rounded-2xl border border-glass/30 p-6 flex flex-col">
      <h3 class="font-display font-bold text-xl">${p.name}</h3>
      <p class="mt-2 text-3xl font-bold text-lamp">${money(p.price)}<span class="text-sm font-normal text-sand/70"> a year</span></p>
      <ul class="mt-4 space-y-2 text-sm text-sand/80 flex-1">
        ${p.perks.map((perk) => `<li>${perk}</li>`).join("")}
      </ul>
      <button data-plan="${p.id}" class="mt-6 rounded-full border border-lamp py-2 font-medium text-lamp hover:bg-lamp hover:text-night focus:outline-none focus-visible:ring-2 focus-visible:ring-lamp">Join ${p.name}</button>
    </div>`,
    )
    .join("");
}

// ---------- 4. CART LOGIC ----------
function addToCart(key, name, price) {
  if (cart[key]) {
    cart[key].qty += 1;
  } else {
    cart[key] = { name, price, qty: 1 };
  }
  renderCart();
  openDrawer();
}

function changeQty(key, amount) {
  cart[key].qty += amount;
  if (cart[key].qty <= 0) delete cart[key];
  renderCart();
}

function renderCart() {
  const keys = Object.keys(cart);
  let total = 0;
  let count = 0;

  if (keys.length === 0) {
    $("cartList").innerHTML =
      '<li class="text-sand/70">Your cart is empty. Add a ticket from the tour dates.</li>';
  } else {
    $("cartList").innerHTML = keys
      .map((k) => {
        const item = cart[k];
        total += item.price * item.qty;
        count += item.qty;
        return `
        <li class="flex items-center justify-between gap-3">
          <div>
            <p class="font-bold">${item.name}</p>
            <p class="text-sm text-sand/70">${money(item.price)} each</p>
          </div>
          <div class="flex items-center gap-2">
            <button data-minus="${k}" class="h-8 w-8 rounded-full border border-sand/40 hover:border-lamp" aria-label="Remove one">-</button>
            <span class="w-5 text-center">${item.qty}</span>
            <button data-plus="${k}" class="h-8 w-8 rounded-full border border-sand/40 hover:border-lamp" aria-label="Add one">+</button>
          </div>
        </li>`;
      })
      .join("");
  }

  $("cartTotal").textContent = money(total);
  $("cartCount").textContent = count;
  $("checkoutBtn").disabled = keys.length === 0;
}

// ---------- 5. DRAWER AND MODAL ----------
function openDrawer() {
  $("drawer").classList.remove("translate-x-full");
  $("overlay").classList.remove("hidden");
}
function closeDrawer() {
  $("drawer").classList.add("translate-x-full");
  $("overlay").classList.add("hidden");
}

function openModal() {
  closeDrawer();
  $("checkoutForm").classList.remove("hidden");
  $("success").classList.add("hidden");
  $("formError").classList.add("hidden");
  $("modal").classList.remove("hidden");
  $("name").focus();
}
function closeModal() {
  $("modal").classList.add("hidden");
}

// ---------- 6. EVENTS ----------
$("filter").addEventListener("change", renderShows);

// One listener on the whole page catches clicks on buttons created by JS
document.addEventListener("click", (e) => {
  const t = e.target;
  if (t.dataset.add) {
    const show = shows.find((s) => s.id === Number(t.dataset.add));
    addToCart("show-" + show.id, `${show.city} · ${show.date}`, show.price);
  }
  if (t.dataset.plan) {
    const plan = plans.find((p) => p.id === t.dataset.plan);
    addToCart(plan.id, `Fan club: ${plan.name}`, plan.price);
  }
  if (t.dataset.plus) changeQty(t.dataset.plus, 1);
  if (t.dataset.minus) changeQty(t.dataset.minus, -1);
});

$("openCart").addEventListener("click", openDrawer);
$("closeCart").addEventListener("click", closeDrawer);
$("overlay").addEventListener("click", closeDrawer);
$("checkoutBtn").addEventListener("click", openModal);
$("cancelBtn").addEventListener("click", () => {
  closeModal();
  openDrawer();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
    closeDrawer();
  }
});

$("checkoutForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("name").value.trim();
  const email = $("email").value.trim();
  const err = $("formError");

  if (name === "") {
    err.textContent = "Enter your full name.";
    err.classList.remove("hidden");
    return;
  }
  if (!email.includes("@") || !email.includes(".")) {
    err.textContent = "Enter a valid email address, like name@example.com.";
    err.classList.remove("hidden");
    return;
  }

  $("successText").textContent = `Thanks, ${name}. we sent a confirmation to ${email}`;
  $("checkoutForm").classList.add("hidden");
  $("success").classList.remove("hidden");
  cart = {};
  renderCart();
  $("checkoutForm").reset();
});

$("doneBtn").addEventListener("click", closeModal);

// ---------- 7. START ----------
fillFilter();
renderShows();
renderPlans();
renderCart();
