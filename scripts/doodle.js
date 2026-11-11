(function () {
  var canvas = document.getElementById('doodle-canvas');
  if (!canvas) return;
  if (window.matchMedia && window.matchMedia('(max-width: 800px), (hover: none), (pointer: coarse)').matches) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var drawing = false;
  var lastX = 0;
  var lastY = 0;
  var activePointerId = null;
  var pending = false;
  var startX = 0;
  var startY = 0;
  var prevW = 0;
  var prevH = 0;
  var prevDpr = 0;

  function isInteractiveTarget(target) {
    if (!target || !(target instanceof Element)) return false;
    return Boolean(target.closest(
      'a, button, input, textarea, select, summary, details, iframe, video, [role="button"], .playground-card-link-wrap, .talk-link'
    ));
  }

  function isTextTarget(target) {
    if (!target || !(target instanceof Element)) return false;
    return Boolean(target.closest(
      'p, h1, h2, h3, h4, h5, h6, li, blockquote, figcaption, em, strong, span, label, [contenteditable]'
    ));
  }

  function resize() {
    var dpr = window.devicePixelRatio || 1;
    var doc = document.documentElement;
    var w = Math.max(doc.scrollWidth, window.innerWidth);
    var h = Math.max(doc.scrollHeight, window.innerHeight);
    var nextW = Math.floor(w * dpr);
    var nextH = Math.floor(h * dpr);

    // Only grow (or change DPR) to avoid wiping drawings while scrolling.
    if (nextW <= prevW && nextH <= prevH && dpr === prevDpr) {
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      return;
    }

    var snapshot = null;
    if (prevW && prevH) {
      snapshot = document.createElement('canvas');
      snapshot.width = prevW;
      snapshot.height = prevH;
      var sctx = snapshot.getContext('2d');
      if (sctx) sctx.drawImage(canvas, 0, 0);
    }

    canvas.width = nextW;
    canvas.height = nextH;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(10, 10, 10, 0.65)';
    ctx.lineWidth = 2.4;

    if (snapshot) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(snapshot, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    prevW = nextW;
    prevH = nextH;
    prevDpr = dpr;
  }

  function start(e) {
    if (e.button !== 0 || activePointerId !== null) return;
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    if (isInteractiveTarget(e.target)) return;
    if (isTextTarget(e.target)) return; // allow text highlight/selection
    pending = true;
    activePointerId = e.pointerId;
    startX = e.pageX;
    startY = e.pageY;
    lastX = e.pageX;
    lastY = e.pageY;
  }

  function move(e) {
    if (activePointerId !== null && e.pointerId !== activePointerId) return;

    if (!drawing) {
      if (!pending) return;
      // Don't steal normal drags unless user moves a bit on non-text areas
      var dx = e.pageX - startX;
      var dy = e.pageY - startY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 6) return;
      var selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        pending = false;
        return;
      }
      drawing = true;
      pending = false;
    }

    if (activePointerId !== null && e.pointerId !== activePointerId) return;
    e.preventDefault();
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.pageX, e.pageY);
    ctx.stroke();
    lastX = e.pageX;
    lastY = e.pageY;
  }

  function end(e) {
    if (activePointerId !== null && e && e.pointerId !== activePointerId) return;
    drawing = false;
    pending = false;
    activePointerId = null;
  }

  document.addEventListener('selectstart', function (event) {
    if (drawing) event.preventDefault();
  });
  document.addEventListener('pointerdown', start, { capture: true });
  window.addEventListener('pointermove', move, { passive: false });
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);

  window.addEventListener('resize', resize);
  resize();
})();
