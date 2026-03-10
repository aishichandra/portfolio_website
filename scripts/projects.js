/**
 * Simple CMS: load projects from data/projects.json and render Selected work + Interactives grids.
 * To add or edit projects, edit data/projects.json.
 */

(function () {
  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function renderTags(tags) {
    if (!tags || !tags.length) return '';
    return tags.map(function (t) {
      return '<span class="tag">' + escapeHtml(t) + '</span>';
    }).join(' ');
  }

  function renderSelectedWork(items) {
    var html = '';
    items.forEach(function (item) {
      var wideClass = item.wide ? ' grid-item--wide grid-item--spotlight' : '';
      var thumb = '';
      if (item.image) {
        thumb = '<div class="grid-thumb"><img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.imageAlt || '') + '"></div>';
      } else {
        thumb = '<div class="grid-thumb"><div class="grid-thumb-placeholder" aria-hidden="true"></div></div>';
      }
      var more = item.more
        ? '<p class="grid-item-more">' + escapeHtml(item.more) + '</p>'
        : '';
      html +=
        '<a class="grid-item' + wideClass + '" href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener">' +
          '<div class="grid-block">' + thumb +
            '<div class="grid-block-text">' +
              '<h3 class="grid-item-title">' + escapeHtml(item.title) + '</h3>' +
              '<p class="grid-item-desc">' + escapeHtml(item.description) + '</p>' + more +
              '<p class="grid-item-tags">' + renderTags(item.tags) + '</p>' +
            '</div>' +
          '</div>' +
        '</a>';
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
              '<p class="grid-item-tags">' + renderTags(item.tags) + '</p>' +
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
      html += '<a class="talk-link" href="' + escapeHtml(link.url) + '" target="_blank" rel="noopener">' + escapeHtml(link.label) + '</a>';
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

  function loadSpeaking(containerEl) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/speaking.json', true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status !== 200) {
        if (containerEl) containerEl.innerHTML = '<p>Could not load speaking data. Check <code>data/speaking.json</code>.</p>';
        return;
      }
      try {
        var data = JSON.parse(xhr.responseText);
        if (containerEl && data.talks) {
          containerEl.innerHTML = renderSpeaking(data.talks);
          var seeLess = containerEl.querySelector('.talk-see-less');
          if (seeLess) {
            seeLess.addEventListener('click', function () {
              var details = this.closest('details');
              if (details) details.removeAttribute('open');
            });
          }
        }
      } catch (e) {
        if (containerEl) containerEl.innerHTML = '<p>Invalid speaking data.</p>';
      }
    };
    xhr.send();
  }

  function loadProjects() {
    var selectedEl = document.getElementById('selected-work-grid');
    var interactivesEl = document.getElementById('interactives-grid');
    var speakingEl = document.getElementById('speaking-content');

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/projects.json', true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status !== 200) {
        if (selectedEl) selectedEl.innerHTML = '<p>Could not load projects. Check <code>data/projects.json</code>.</p>';
        return;
      }
      try {
        var data = JSON.parse(xhr.responseText);
        if (selectedEl && data.selectedWork) {
          selectedEl.innerHTML = renderSelectedWork(data.selectedWork);
        }
        if (interactivesEl && data.interactives) {
          interactivesEl.innerHTML = renderInteractives(data.interactives);
        }
      } catch (e) {
        if (selectedEl) selectedEl.innerHTML = '<p>Invalid projects data.</p>';
      }
    };
    xhr.send();

    if (speakingEl) loadSpeaking(speakingEl);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProjects);
  } else {
    loadProjects();
  }
})();
