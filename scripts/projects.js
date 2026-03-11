/**
 * Simple CMS: load projects from data/projects.json and render Selected work + Interactives grids.
 * To add or edit projects, edit data/projects.json.
 * Bump CACHE_VERSION when you change data/*.json so browsers fetch fresh data.
 */
(function () {
  var CACHE_VERSION = '1';
  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function renderTags(tags) {
    if (!tags || !tags.length) return '';
    // Don't show tags when the only tag is "writing"
    if (tags.length === 1 && String(tags[0]).toLowerCase() === 'writing') return '';
    return tags.map(function (t) {
      return '<span class="tag">' + escapeHtml(t) + '</span>';
    }).join(' ');
  }

  function renderTagsBlock(tags) {
    var content = renderTags(tags);
    return content ? '<p class="grid-item-tags">' + content + '</p>' : '';
  }

  function renderSelectedWork(items) {
    var html = '';
    items.forEach(function (item, i) {
      var wideClass = item.wide ? ' grid-item--wide grid-item--spotlight' : '';
      var thumb = '';
      var imgAttrs = ' loading="lazy" decoding="async"';
      if (i === 0 && item.image) imgAttrs = ' fetchpriority="high" decoding="async"';
      if (item.image) {
        thumb =
          '<a class="grid-thumb" href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener">' +
            '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.imageAlt || '') + '"' + imgAttrs + '>' +
          '</a>';
      } else {
        thumb =
          '<a class="grid-thumb" href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener">' +
            '<div class="grid-thumb-placeholder" aria-hidden="true"></div>' +
          '</a>';
      }
      var desc = item.descriptionHtml || (item.description ? escapeHtml(item.description) : '');
      var more = item.moreHtml
        ? '<p class="grid-item-more">' + item.moreHtml + '</p>'
        : (item.more ? '<p class="grid-item-more">' + escapeHtml(item.more) + '</p>' : '');
      var linksBlock = renderTalkLinks(item.links);
      html +=
        '<div class="grid-item' + wideClass + '">' +
          '<div class="grid-block">' + thumb +
            '<div class="grid-block-text">' +
              '<h3 class="grid-item-title">' +
                '<a href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener">' + escapeHtml(item.title) + '</a>' +
              '</h3>' +
              '<p class="grid-item-desc">' + desc + '</p>' + more +
              renderTagsBlock(item.tags) + linksBlock +
            '</div>' +
          '</div>' +
        '</div>';
    });
    return html;
  }

  function renderInteractives(items) {
    var html = '';
    items.forEach(function (item) {
      html +=
        '<a class="grid-item" href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener">' +
          '<div class="grid-block">' +
            '<div class="grid-block-text">' +
              '<h3 class="grid-item-title">' + escapeHtml(item.title) + '</h3>' +
              '<p class="grid-item-desc">' + escapeHtml(item.description) + '</p>' +
              renderTagsBlock(item.tags) +
            '</div>' +
          '</div>' +
        '</a>';
    });
    return html;
  }

  function renderTalkLinks(links) {
    if (!links || !links.length) return '';
    var html = '<p class="talk-links">';
    links.forEach(function (link) {
      var label = (link.label || '').toLowerCase();
      if (label === 'github') {
        html +=
          '<a class="talk-link talk-link--icon" href="' + escapeHtml(link.url) + '" target="_blank" rel="noopener" aria-label="GitHub">' +
            '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
              '<path d="M8 0C3.58 0 0 3.73 0 8.33c0 3.68 2.29 6.8 5.47 7.9.4.08.55-.18.55-.39 0-.19-.01-.82-.01-1.49-2.01.38-2.53-.51-2.69-.99-.09-.25-.48-.99-.82-1.19-.28-.16-.68-.55-.01-.56.63-.01 1.08.6 1.23.85.72 1.27 1.87.91 2.33.69.07-.54.28-.91.51-1.12-1.78-.21-3.64-.93-3.64-4.12 0-.91.31-1.65.82-2.23-.08-.21-.36-1.06.08-2.2 0 0 .67-.22 2.2.85.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.08 2.2-.85 2.2-.85.44 1.14.16 1.99.08 2.2.51.58.82 1.32.82 2.23 0 3.2-1.87 3.91-3.65 4.12.29.27.54.8.54 1.61 0 1.16-.01 2.1-.01 2.39 0 .21.15.47.55.39 3.18-1.1 5.47-4.22 5.47-7.9C16 3.73 12.42 0 8 0Z"></path>' +
            '</svg>' +
          '</a>';
      } else {
        html += '<a class="talk-link" href="' + escapeHtml(link.url) + '" target="_blank" rel="noopener">' + escapeHtml(link.label) + '</a>';
      }
    });
    return html + '</p>';
  }

  var VISIBLE_TALKS = 3;

  function renderOneTalk(t) {
    var titleBlock = '<h3 class="talk-title"><a href="' + escapeHtml(t.titleUrl) + '" target="_blank" rel="noopener">' + escapeHtml(t.title) + '</a></h3>';
    var descBlock = '<p class="talk-desc">' + escapeHtml(t.desc) + '</p>';
    var linksBlock = renderTalkLinks(t.links);
    return '<div class="talk-main"><div class="talk-org">' + escapeHtml(t.org) + '</div>' + titleBlock + descBlock + linksBlock + '</div>';
  }

  function renderSpeaking(talks) {
    if (!talks || !talks.length) return '';
    var visible = talks.slice(0, VISIBLE_TALKS);
    var more = talks.slice(VISIBLE_TALKS);
    var html = '';
    var listItems = [];
    var firstDone = false;
    visible.forEach(function (t) {
      var mainBlock = renderOneTalk(t);
      if (t.spotlight && t.videoEmbed) {
        html += '<div class="talk-spotlight">' +
          '<div class="talk-date-col">' + escapeHtml(t.date) + '</div>' +
          mainBlock +
          '<div class="talk-spotlight-video"><div class="video-embed">' +
          '<iframe src="https://www.youtube.com/embed/' + escapeHtml(t.videoEmbed) + '" title="' + escapeHtml(t.title) + '" frameborder="0" allowfullscreen></iframe>' +
          '</div></div></div>';
      } else if (!firstDone) {
        html += '<div class="talk-item"><div class="talk-date-col">' + escapeHtml(t.date) + '</div>' + mainBlock + '</div>';
        firstDone = true;
      } else {
        listItems.push('<li class="talk-item"><div class="talk-date-col">' + escapeHtml(t.date) + '</div>' + mainBlock + '</li>');
      }
    });
    if (listItems.length) {
      html += '<ul class="talk-list">' + listItems.join('') + '</ul>';
    }
    if (more.length > 0) {
      var moreList = more.map(function (t) {
        var mainBlock = renderOneTalk(t);
        return '<li class="talk-item"><div class="talk-date-col">' + escapeHtml(t.date) + '</div>' + mainBlock + '</li>';
      }).join('');
      html += '<details class="talk-more-details">' +
        '<summary class="talk-see-more">See more</summary>' +
        '<div class="talk-more"><ul class="talk-list">' + moreList + '</ul>' +
        '<div class="talk-less-wrap"><button type="button" class="talk-see-less" aria-label="Collapse">See less</button></div></div>' +
        '</details>';
    }
    return html;
  }

  function applySpeaking(containerEl, data) {
    if (!containerEl || !data.talks) return;
    containerEl.innerHTML = renderSpeaking(data.talks);
    var seeLess = containerEl.querySelector('.talk-see-less');
    if (seeLess) {
      seeLess.addEventListener('click', function () {
        var details = this.closest('details');
        if (details) details.removeAttribute('open');
      });
    }
  }

  function loadProjects() {
    var selectedEl = document.getElementById('selected-work-grid');
    var interactivesEl = document.getElementById('interactives-grid');
    var speakingEl = document.getElementById('speaking-content');

    if (!selectedEl && !interactivesEl && !speakingEl) return;

    var projectsPromise = fetch('data/projects.json?v=' + CACHE_VERSION).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });

    var speakingPromise = speakingEl
      ? fetch('data/speaking.json?v=' + CACHE_VERSION).then(function (r) {
          if (!r.ok) throw new Error(r.status);
          return r.json();
        })
      : Promise.resolve(null);

    projectsPromise
      .then(function (data) {
        if (selectedEl && data.selectedWork) {
          selectedEl.innerHTML = renderSelectedWork(data.selectedWork);
          selectedEl.removeAttribute('aria-busy');
        }
        if (interactivesEl && data.interactives) {
          interactivesEl.innerHTML = renderInteractives(data.interactives);
        }
      })
      .catch(function () {
        if (selectedEl) {
          selectedEl.innerHTML = '<p>Could not load projects. Check <code>data/projects.json</code>.</p>';
          selectedEl.removeAttribute('aria-busy');
        }
      });

    speakingPromise
      .then(function (data) {
        if (data) applySpeaking(speakingEl, data);
      })
      .catch(function () {
        if (speakingEl) speakingEl.innerHTML = '<p>Could not load speaking data. Check <code>data/speaking.json</code>.</p>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProjects);
  } else {
    loadProjects();
  }
})();
