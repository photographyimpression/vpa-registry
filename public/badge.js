/**
 * VPA Registry Badge Overlay Script
 * Add this to any website to display VPA certification badges on product images.
 * Usage: <script src="https://vparegistry.com/badge.js" data-vpa-id="VPA-XXXXXX"></script>
 */
(function () {
  'use strict';

  var script = document.currentScript;
  if (!script) return;

  var vpaId = script.getAttribute('data-vpa-id');
  var selector = script.getAttribute('data-selector') || '.product img, .product-image img, [data-product] img';
  var position = script.getAttribute('data-position') || 'bottom-right';
  var size = script.getAttribute('data-size') || '64';
  var baseUrl = script.getAttribute('data-base-url') || 'https://vparegistry.com';

  if (!vpaId) {
    console.warn('VPA Badge: Missing data-vpa-id attribute');
    return;
  }

  var badgeSize = parseInt(size, 10) || 64;
  var verifyUrl = baseUrl + '/id/' + vpaId;

  var styleId = 'vpa-badge-styles';
  if (!document.getElementById(styleId)) {
    var style = document.createElement('style');
    style.id = styleId;
    style.textContent = [
      '.vpa-badge-wrap { position: relative; display: inline-block; }',
      '.vpa-badge-wrap img { display: block; }',
      '.vpa-badge-link { position: absolute; z-index: 10; text-decoration: none; transition: transform 0.2s ease; }',
      '.vpa-badge-link:hover { transform: scale(1.1); }',
      '.vpa-badge-icon { display: flex; align-items: center; justify-content: center; border-radius: 8px; background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); box-shadow: 0 2px 8px rgba(0,0,0,0.3); padding: 4px 8px; gap: 4px; }',
      '.vpa-badge-shield { width: 20px; height: 20px; }',
      '.vpa-badge-text { color: #d4a843; font-family: system-ui, -apple-system, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; line-height: 1; }',
    ].join('\n');
    document.head.appendChild(style);
  }

  var posMap = {
    'top-left': 'top: 8px; left: 8px;',
    'top-right': 'top: 8px; right: 8px;',
    'bottom-left': 'bottom: 8px; left: 8px;',
    'bottom-right': 'bottom: 8px; right: 8px;',
  };
  var posStyle = posMap[position] || posMap['bottom-right'];

  var shieldSvg = '<svg class="vpa-badge-shield" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">'
    + '<path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="#d4a843"/>'
    + '<path d="M10 15.5l-3.5-3.5 1.41-1.41L10 12.67l5.59-5.59L17 8.5l-7 7z" fill="#1a1a1a"/>'
    + '</svg>';

  function addBadge(img) {
    if (img.closest('.vpa-badge-wrap')) return;
    if (img.naturalWidth < 50 || img.naturalHeight < 50) return;

    var wrapper = document.createElement('span');
    wrapper.className = 'vpa-badge-wrap';
    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);

    var link = document.createElement('a');
    link.className = 'vpa-badge-link';
    link.href = verifyUrl;
    link.target = '_blank';
    link.rel = 'noopener';
    link.title = 'VPA Verified Product';
    link.setAttribute('style', posStyle);
    link.innerHTML = '<span class="vpa-badge-icon">' + shieldSvg + '<span class="vpa-badge-text">VPA</span></span>';

    wrapper.appendChild(link);
  }

  function processImages() {
    var images = document.querySelectorAll(selector);
    images.forEach(function (img) {
      if (img.complete && img.naturalWidth > 0) {
        addBadge(img);
      } else {
        img.addEventListener('load', function () { addBadge(img); }, { once: true });
      }
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processImages);
  } else {
    processImages();
  }

  // Watch for dynamically added images
  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(function (mutations) {
      var hasNew = mutations.some(function (m) { return m.addedNodes.length > 0; });
      if (hasNew) processImages();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
