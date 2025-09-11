// feed.js
import { getData, createPip } from "./api.js";

function formatDK(ts) {
  const d = new Date((ts ?? "").replace(" ", "T"));
  return isNaN(d) ? "" : d.toLocaleString("da-DK");
}

function renderPip(pip, { place = "top" } = {}) {
  const template = document.getElementById("pip-template");
  const frag = template.content.cloneNode(true);
  frag.querySelector(".pip-name").textContent = pip.pipname ?? "Ukendt";
  frag.querySelector(".pip-text").textContent = pip.pipcontent ?? "";
  const t = frag.querySelector(".pip-time");
  if (t) {
    t.textContent = formatDK(pip.piptime);
    t.setAttribute("datetime", pip.piptime ?? "");
  }
  const feed = document.getElementById("feed");
  if (place === "bottom") feed.appendChild(frag);
  else feed.prepend(frag);
}

function setStatus(msg) {
  const s = document.getElementById("status");
  if (s) s.textContent = msg ?? "";
}

// Erstat "Hent ældre" knappen med en tekst
function showDoneMessage() {
  const btn = document.getElementById("loadMore");
  if (!btn) return;
  const wrap = btn.parentElement;
  const msg = document.createElement("p");
  msg.textContent = "Du er helt ajour.";
  msg.style.color = "var(--muted)";
  msg.style.margin = "8px 0";
  wrap.replaceChild(msg, btn);
  hasMore = false;
}

// --- State ---
let cursor = null;   // { before_time, before_id } (ældste på siden)
let hasMore = true;

// --- Initial load (3 nyeste) ---
(async function initial() {
  try {
    const { items, nextCursor, hasMore: more } = await getData(null, 3);
    // items er ASC (ældst->nyest). Prepend i ASC giver nyest øverst til sidst.
    items.forEach((p) => renderPip(p, { place: "top" }));

    cursor = nextCursor;
    hasMore = more;
    if (!hasMore) {
      showDoneMessage(); // kun nederst, ikke i statuslinjen
    }
  } catch (e) {
    console.error(e);
    setStatus("Kunne ikke hente pips.");
  }
})();

// --- Post nyt pip ---
document.getElementById("postBtn")?.addEventListener("click", async () => {
  const nameEl = document.getElementById("username");
  const msgEl  = document.getElementById("message");
  const pipname = nameEl?.value?.trim() ?? "";
  const pipcontent = msgEl?.value?.trim() ?? "";
  if (!pipname) return alert("Skriv et brugernavn");
  if (!pipcontent) return alert("Skriv en besked");

  try {
    await createPip(pipname, pipcontent);
    // Optimistisk prepend
    renderPip(
      { pipname, pipcontent, piptime: new Date().toISOString().slice(0,19).replace("T"," ") },
      { place: "top" }
    );
    msgEl.value = "";
    //bubbles=true betyder at eventet ikke kun sker lokalt, men "bobler op" til parent elementet. 
    msgEl.dispatchEvent(new Event("input", { bubbles: true }));
  } catch (e) {
    console.error(e);
    alert("Kunne ikke sende pip");
  }
});

// --- Hent ældre (append i bunden) ---
document.getElementById("loadMore")?.addEventListener("click", async (ev) => {
  const btn = ev.currentTarget;
  if (!hasMore) return;
  btn.disabled = true;

  try {
    const { items, nextCursor, hasMore: more } = await getData(cursor, 3);

    // items er ASC – render i DESC så hele listen forbliver nyest->ældst
    [...items].reverse().forEach((p) => renderPip(p, { place: "bottom" }));

    cursor = nextCursor;
    hasMore = more;

    if (!hasMore || items.length === 0) {
      showDoneMessage();
    } else {
      btn.disabled = false;
    }
  } catch (e) {
    console.error(e);
    setStatus("Fejl ved hentning af ældre pips.");
    btn.disabled = false;
  }
});
