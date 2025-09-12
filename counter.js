// counter.js
const MAX = 256;

function $(sel) {
  return document.querySelector(sel);
}

function ensureCounter() {
  const textarea = $("#message");
  const sendBtn = $("#postBtn");
  if (!textarea) return;

  // Sæt maxlength, så browseren også håndhæver grænsen
  textarea.setAttribute("maxlength", String(MAX));

  // Lav tæller-element under textarea (kun hvis det ikke findes)
  let meter = document.getElementById("charCounter");
  if (!meter) {
    meter = document.createElement("div");
    meter.id = "charCounter";
    meter.setAttribute("aria-live", "polite");
    meter.style.margin = "4px 2px 0 auto";
    meter.style.fontSize = ".9rem";
    meter.style.fontVariantNumeric = "tabular-nums";
    meter.style.color = "var(--muted)";
    // lille progress-bar bagved tallet
    meter.style.position = "relative";
    meter.style.padding = "2px 8px";
    meter.style.borderRadius = "999px";
    meter.style.background = "linear-gradient(90deg, #e5e7eb 0 0)"; // base
    meter.style.display = "inline-block";
    // Indsæt efter textarea
    textarea.insertAdjacentElement("afterend", meter);
  }

  function update() {
    // Sikr at paste ikke overskrider MAX (uafhængigt af maxlength)
    if (textarea.value.length > MAX) {
      textarea.value = textarea.value.slice(0, MAX);
    }
    const used = textarea.value.length;
    const left = MAX - used;

    // Tekst: “xx/256”
    meter.textContent = `${used}/${MAX}`;

    // Farver og progress
    const pct = (used / MAX) * 100;
    // baggrundsbar (lys) + “fyld” som gradient
    meter.style.background = `
      linear-gradient(90deg, #cbd5e1 ${pct}%, #e5e7eb ${pct}%)
    `;

    // farveskift på tekst
    if (left <= 0) {
      meter.style.color = "#b91c1c"; // red
    } else if (left <= 32) {
      meter.style.color = "#b45309"; // orange
    } else if (left <= 64) {
      meter.style.color = "#475569"; // grey
    } else {
      meter.style.color = "var(--muted)";
    }

    // Ddisable "Pip" hvis tomt
    if (sendBtn) sendBtn.disabled = used === 0;
  }

  // listener
  textarea.addEventListener("input", update);
  textarea.addEventListener("paste", (e) => {
    
    // klip ned manuelt ved paste (maxlength fanger det også, men dette er mere smooth)
    
    const text = e.clipboardData?.getData("text") ?? "";
    const room = MAX - textarea.value.length;
    if (room <= 0) {
      e.preventDefault();
      return;
    }
    if (text.length > room) {
      e.preventDefault();
      const selStart = textarea.selectionStart ?? textarea.value.length;
      const selEnd = textarea.selectionEnd ?? textarea.value.length;
      const before = textarea.value.slice(0, selStart);
      const after = textarea.value.slice(selEnd);
      textarea.value = before + text.slice(0, room) + after;
      // flyt caret
      const pos = before.length + Math.min(text.length, room);
      textarea.setSelectionRange(pos, pos);
      update();
    }
  });

  // Første render
  update();
}

// Kør når DOM er klar
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ensureCounter);
} else {
  ensureCounter();
}
