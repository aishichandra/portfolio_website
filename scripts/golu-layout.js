'use strict';

const editButton = document.getElementById('golu-edit');
const help = document.getElementById('golu-edit-help');
const galleries = [...document.querySelectorAll('[data-photo-gallery]')];
const storageKey = 'tiny-golu-2026-layout';
let savedLayout = {};
let storageAvailable = true;

try {
  savedLayout = JSON.parse(localStorage.getItem(storageKey)) || {};
} catch {
  savedLayout = {};
}

function photoId(photo) {
  return photo.querySelector('img').getAttribute('src');
}

function photoSpan(photo, gallery) {
  const savedSpan = Number(photo.style.getPropertyValue('--photo-span'));
  if (savedSpan) return savedSpan;
  if (gallery.classList.contains('golu-row--two')) return 3;
  if (matchMedia('(max-width: 600px)').matches) return 6;
  return 2;
}

function setSpan(photo, span) {
  photo.style.setProperty('--photo-span', Math.max(2, Math.min(6, span)));
}

function saveLayout() {
  const layout = Object.fromEntries(galleries.map(gallery => [
    gallery.dataset.photoGallery,
    [...gallery.children].map(photo => ({
      id: photoId(photo),
      span: Number(photo.style.getPropertyValue('--photo-span'))
    }))
  ]));

  try {
    localStorage.setItem(storageKey, JSON.stringify(layout));
  } catch {
    storageAvailable = false;
  }
}

function movePhoto(photo, target, gallery) {
  if (!target || target === photo || target.parentElement !== gallery) return;
  const photos = [...gallery.children];
  const afterTarget = photos.indexOf(photo) < photos.indexOf(target);
  gallery.insertBefore(photo, afterTarget ? target.nextSibling : target);
}

function addHandle(controls, label, className, onDrag, onArrow) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  button.setAttribute('aria-label', label + ' ' + controls.parentElement.querySelector('img').alt);
  controls.append(button);

  button.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary) return;
    button.setPointerCapture(event.pointerId);
    onDrag(event, button);
  });
  button.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    onArrow(['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1);
    button.focus();
    saveLayout();
  });
}

for (const gallery of galleries) {
  const photos = new Map([...gallery.children].map(photo => [photoId(photo), photo]));
  const galleryKey = gallery.dataset.photoGallery;
  const previousProgress = galleryKey === 'progress-v2' && Array.isArray(savedLayout.progress)
    ? savedLayout.progress.map(({ id }) => ({ id }))
    : undefined;
  const saved = savedLayout[galleryKey] ?? previousProgress;
  if (Array.isArray(saved)) {
    for (const { id, span } of saved) {
      const photo = photos.get(id);
      if (!photo) continue;
      if (Number.isInteger(span) && span >= 2 && span <= 6) setSpan(photo, span);
      gallery.append(photo);
      photos.delete(id);
    }
    gallery.append(...photos.values());
  }

  if (galleryKey === 'progress-v2') {
    const hanuman = gallery.querySelector('img[src$="/progress-IMG_3877.jpg"]');
    const sita = gallery.querySelector('img[src$="/progress-IMG_3899.jpg"]');
    if (hanuman && sita) {
      hanuman.closest('figure').after(sita.closest('figure'));
    }
  }

  if (!editButton) continue;

  for (const photo of gallery.children) {
    const controls = document.createElement('div');
    controls.className = 'photo-layout-controls';
    controls.hidden = true;
    photo.append(controls);

    const image = photo.querySelector('img');
    image.draggable = false;
    image.addEventListener('pointerdown', event => {
      if (controls.hidden || event.button !== 0) return;
      image.setPointerCapture(event.pointerId);
      image.addEventListener('pointerup', end => {
        const target = document.elementFromPoint(end.clientX, end.clientY)?.closest('.greece-gallery-item');
        movePhoto(photo, target, gallery);
        saveLayout();
      }, { once: true, signal: cancelOnPointerLoss(image) });
    });

    function addAction(label, action) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.setAttribute('aria-label', label + ': ' + image.alt);
      button.addEventListener('click', () => {
        action();
        button.focus();
        saveLayout();
      });
      controls.append(button);
    }

    addAction('Earlier', () => movePhoto(photo, photo.previousElementSibling, gallery));
    addAction('Later', () => movePhoto(photo, photo.nextElementSibling, gallery));
    addAction('Smaller', () => setSpan(photo, photoSpan(photo, gallery) - 1));
    addAction('Larger', () => setSpan(photo, photoSpan(photo, gallery) + 1));

    addHandle(controls, 'Resize', 'photo-resize', (start, button) => {
      const span = photoSpan(photo, gallery);
      const grid = gallery.closest('.golu-finished') || gallery;
      const gap = parseFloat(getComputedStyle(grid).columnGap);
      const column = (grid.clientWidth + gap) / 6;
      const signal = cancelOnPointerLoss(button);
      button.addEventListener('pointermove', event => {
        setSpan(photo, span + Math.round((event.clientX - start.clientX) / column));
      }, { signal });
      button.addEventListener('lostpointercapture', saveLayout, { once: true });
    }, step => setSpan(photo, photoSpan(photo, gallery) + step));
  }
}

function cancelOnPointerLoss(button) {
  const controller = new AbortController();
  button.addEventListener('lostpointercapture', () => controller.abort(), { once: true });
  return controller.signal;
}

if (editButton) {
  editButton.hidden = false;
  editButton.addEventListener('click', () => {
    const editing = editButton.getAttribute('aria-pressed') === 'false';
    editButton.setAttribute('aria-pressed', String(editing));
    editButton.textContent = editing ? 'Done editing' : 'Edit photo layout';
    help.hidden = !editing;
    for (const gallery of galleries) gallery.classList.toggle('photo-layout-editing', editing);
    for (const controls of document.querySelectorAll('.photo-layout-controls')) {
      controls.hidden = !editing;
    }
    if (!editing) {
      saveLayout();
      editButton.textContent = storageAvailable ? 'Edit photo layout' : 'Edit photo layout (saving unavailable)';
    }
  });
}
