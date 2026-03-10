/**
 * Load Greece gallery from data/greece.json.
 * Edit the "images" array to reorder. Add "span": "full" to any item to make it span both columns.
 */
(function () {
  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function loadGreece() {
    var container = document.getElementById('greece-gallery');
    if (!container) return;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/greece.json');
    xhr.onload = function () {
      if (xhr.status !== 200) return;
      try {
        var data = JSON.parse(xhr.responseText);
        var images = data.images || [];
        var left = '';
        var right = '';
        images.forEach(function (img, i) {
          var smallClass = img.small ? ' greece-gallery-item--small' : '';
          var itemHtml =
            '<div class="greece-gallery-item' + smallClass + '">' +
              '<img src="' + escapeHtml(img.src) + '" alt="' + escapeHtml(img.alt || '') + '">' +
            '</div>';
          if (i % 2 === 0) left += itemHtml;
          else right += itemHtml;
        });
        container.innerHTML =
          '<div class="greece-gallery-col">' + left + '</div>' +
          '<div class="greece-gallery-col">' + right + '</div>';
      } catch (e) {}
    };
    xhr.send();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadGreece);
  } else {
    loadGreece();
  }
})();
