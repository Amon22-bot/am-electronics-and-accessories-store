(() => {
  "use strict";
  const descriptionSelectors = [".top-selling-details > p", ".phone-cover-details > p", ".new-arrival-details > p", ".screen-protector-description", ".product-description", ".smartwatch-description", ".chargers-cables-description", ".shop-product-details > p", ".product-card-description"].join(", ");
  function xmlText(value) { return String(value || "Electronics accessory").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function demoImage(title) {
    const name = String(title || "").toLowerCase();
    let shape;
    if (/headphone|earbud|earpod/.test(name)) shape = '<path d="M230 255v-28a90 90 0 0 1 180 0v28" fill="none" stroke="#fff" stroke-width="24" stroke-linecap="round"/><rect x="215" y="245" width="48" height="100" rx="20" fill="#fff"/><rect x="378" y="245" width="48" height="100" rx="20" fill="#ff9f43"/>';
    else if (/watch/.test(name)) shape = '<path d="M285 155h70l18 55H267zM267 325h106l-18 55h-70z" fill="#dce9ff"/><rect x="255" y="200" width="130" height="135" rx="38" fill="#fff"/><rect x="271" y="216" width="98" height="103" rx="25" fill="#3154a5"/><circle cx="320" cy="268" r="27" fill="#ff9f43"/>';
    else if (/speaker|sound/.test(name)) shape = '<rect x="255" y="155" width="130" height="205" rx="36" fill="#fff"/><circle cx="320" cy="225" r="39" fill="#6e88c9"/><circle cx="320" cy="225" r="19" fill="#ff9f43"/><circle cx="320" cy="310" r="26" fill="#6e88c9"/><circle cx="320" cy="310" r="10" fill="#ff9f43"/>';
    else if (/charger|cable|power bank/.test(name)) shape = '<rect x="255" y="165" width="130" height="145" rx="28" fill="#fff"/><path d="M290 165v-30m30 30v-30m30 175v35c0 46 76 45 76 4" fill="none" stroke="#ff9f43" stroke-width="16" stroke-linecap="round"/><circle cx="320" cy="235" r="24" fill="#6681c5"/>';
    else if (/game|playstation|console|ps[45]/.test(name)) shape = '<rect x="250" y="165" width="140" height="195" rx="25" fill="#fff"/><path d="M274 195h92v135h-92z" fill="#4d69ad"/><circle cx="350" cy="175" r="5" fill="#ff9f43"/><path d="M205 335c0-30 23-52 52-52h126c29 0 52 22 52 52v12c0 20-22 31-39 20l-39-27h-74l-39 27c-17 11-39 0-39-20z" fill="#ff9f43"/><path d="M250 325h25m-12-12v25m123-13h2m20 0h2" stroke="#21345f" stroke-width="8" stroke-linecap="round"/>';
    else shape = '<rect x="250" y="145" width="140" height="225" rx="30" fill="#fff"/><rect x="266" y="162" width="108" height="180" rx="18" fill="#4564ac"/><circle cx="320" cy="352" r="8" fill="#ff9f43"/><path d="M390 235h10" stroke="#ff9f43" stroke-width="9" stroke-linecap="round"/>';
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#17264a"/><stop offset="1" stop-color="#4967ad"/></linearGradient></defs><rect width="640" height="480" rx="32" fill="url(#g)"/><circle cx="510" cy="92" r="120" fill="#fff" opacity=".07"/><circle cx="100" cy="400" r="130" fill="#ff9f43" opacity=".12"/><ellipse cx="320" cy="385" rx="150" ry="22" fill="#0c1730" opacity=".28"/>' + shape + '<text x="320" y="445" text-anchor="middle" fill="#fff" font-family="Arial,sans-serif" font-size="18" font-weight="600">' + xmlText(title).slice(0,36) + '</text></svg>';
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  }
  function titleOf(card, image) { return card.querySelector("h3, .product-name, .shop-product-name-link, [data-product-name]")?.textContent?.trim() || card.dataset.name || image?.alt || "Electronics accessory"; }
  function enhance(card) {
    const image = card.querySelector("img");
    if (!image) return;
    const title = titleOf(card, image);
    function useDemo() { if (image.dataset.demoImageApplied === "true") return; image.dataset.demoImageApplied = "true"; image.src = demoImage(title); image.alt = image.alt || title + " demo image"; image.classList.add("demo-product-image"); }
    image.addEventListener("error", useDemo, {once:true});
    if (!image.getAttribute("src") || (image.complete && image.naturalWidth === 0)) useDemo();
    const description = card.querySelector(descriptionSelectors);
    if (description && (!description.textContent.trim() || /^(contact us for more information\.?|description unavailable\.?)$/i.test(description.textContent.trim()))) {
      description.textContent = "A demo listing for " + titleOf(card, image) + ", included to show how products appear in the store.";
    }
  }
  function scan(root) {
    (root || document).querySelectorAll("article, [data-product-id], [class*='product-card'], [class*='-card']").forEach((card) => {
      if (card.querySelector("img") && card.querySelector("h3, .product-name, .shop-product-name-link, [data-product-name]")) enhance(card);
    });
  }
  function start() {
    scan(document);
    new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => {
      if (node.nodeType === 1) { if (node.matches?.("article, [data-product-id], [class*='product-card'], [class*='-card']")) enhance(node); scan(node); }
    }))).observe(document.body, {childList:true, subtree:true, characterData:true});
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, {once:true}); else start();
})();
