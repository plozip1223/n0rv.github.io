function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function ensureHeadingIds(headings) {
  const used = new Map();

  for (const heading of headings) {
    if (heading.id) continue;

    const base = slugify(heading.textContent || "section") || "section";
    const current = used.get(base) || 0;
    const next = current + 1;
    used.set(base, next);

    heading.id = current === 0 ? base : `${base}-${next}`;
  }
}

function buildToc() {
  const toc = document.getElementById("toc");
  const article = document.querySelector(".article");
  if (!toc || !article) return;

  const headings = Array.from(article.querySelectorAll("h2, h3"));
  if (headings.length === 0) return;

  ensureHeadingIds(headings);
  toc.innerHTML = "";

  for (const heading of headings) {
    const level = heading.tagName === "H3" ? 3 : 2;
    const a = document.createElement("a");
    a.href = `#${heading.id}`;
    a.textContent = heading.textContent || "";
    a.dataset.level = String(level);
    toc.appendChild(a);
  }
}

async function copyText(text) {
  // Prefer async clipboard API when available.
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Fallback for file:// or non-secure contexts.
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.top = "-1000px";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

function addCopyButtons() {
  const blocks = Array.from(document.querySelectorAll("pre > code"));
  for (const code of blocks) {
    const pre = code.parentElement;
    if (!pre || pre.querySelector(":scope > .copy-btn")) continue;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    btn.addEventListener("click", async () => {
      try {
        await copyText(code.textContent || "");
        btn.textContent = "Copied";
        window.setTimeout(() => (btn.textContent = "Copy"), 900);
      } catch {
        btn.textContent = "Failed";
        window.setTimeout(() => (btn.textContent = "Copy"), 900);
      }
    });

    pre.appendChild(btn);
  }
}

function syncTitle() {
  const h1 = document.querySelector(".article h1");
  const title = (h1?.textContent || "Writeup").trim();
  document.title = title;

  const pageTitle = document.getElementById("pageTitle");
  if (pageTitle) pageTitle.textContent = title;
}

function main() {
  syncTitle();
  buildToc();
  addCopyButtons();
}

document.addEventListener("DOMContentLoaded", main);
