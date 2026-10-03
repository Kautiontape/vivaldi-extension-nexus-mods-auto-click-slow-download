// Auto-clicks the free "Slow download" button on Nexus Mods download pages.
(() => {
  const TARGET_TEXT = 'slow download';
  const POLL_MS = 400;
  const POLL_FOR_MS = 20000;
  const RETRY_AFTER_MS = 4000;
  const URL_CHECK_MS = 1000;

  let currentHref = location.href;
  let pollTimer = null;
  let pollUntil = 0;

  const log = (msg) => console.log(`[nexus-slow-download] ${msg}`);

  // The document plus every shadow root under it. Nexus may render the download
  // panel inside web components, which a plain querySelectorAll can't see into.
  function collectRoots(root, out = []) {
    out.push(root);
    for (const el of root.querySelectorAll('*')) {
      let shadow = el.shadowRoot;
      if (!shadow && el.localName.includes('-')) {
        try { shadow = chrome.dom?.openOrClosedShadowRoot(el); } catch {}
      }
      if (shadow) collectRoots(shadow, out);
    }
    return out;
  }

  function isUsable(el) {
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  // Exact text match, so the "Slow download. Wait more." heading never counts.
  function findSlowButton() {
    for (const root of collectRoots(document)) {
      for (const el of root.querySelectorAll('button, a, [role="button"]')) {
        const text = el.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
        if (text === TARGET_TEXT && isUsable(el)) return el;
      }
    }
    return null;
  }

  function stopPolling() {
    clearInterval(pollTimer);
    pollTimer = null;
  }

  function poll() {
    if (Date.now() > pollUntil) return stopPolling();
    const button = findSlowButton();
    if (!button) return;

    stopPolling();
    button.click();
    log('clicked Slow download');

    // A click can be swallowed if the page hadn't finished wiring up its
    // handlers. If the button is still there and enabled later, try once more.
    const href = location.href;
    setTimeout(() => {
      if (location.href !== href) return;
      const again = findSlowButton();
      if (!again) return;
      again.click();
      log('clicked Slow download again (first click had no effect)');
    }, RETRY_AFTER_MS);
  }

  function startPolling() {
    stopPolling();
    pollUntil = Date.now() + POLL_FOR_MS;
    pollTimer = setInterval(poll, POLL_MS);
  }

  // Nexus navigates client-side, so rescan whenever the URL changes.
  setInterval(() => {
    if (location.href === currentHref) return;
    currentHref = location.href;
    startPolling();
  }, URL_CHECK_MS);

  // Wait for full load so the page's click handlers are attached.
  if (document.readyState === 'complete') startPolling();
  else window.addEventListener('load', startPolling, { once: true });
})();
