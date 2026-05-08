/**
 * Onboard Help Center Theme — JavaScript
 */

document.addEventListener('DOMContentLoaded', function () {

  // --- Mobile nav toggle ---
  var menuToggle = document.querySelector('.menu-toggle');
  var headerNav = document.querySelector('.header-nav');

  if (menuToggle && headerNav) {
    menuToggle.addEventListener('click', function () {
      headerNav.classList.toggle('is-open');
      menuToggle.setAttribute(
        'aria-expanded',
        headerNav.classList.contains('is-open')
      );
    });
  }

  // --- Smooth scroll for same-page anchors ---
  var anchors = document.querySelectorAll('a[href^="#"]');
  anchors.forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href').slice(1);
      var target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Active sidebar highlight ---
  var sidebarLinks = document.querySelectorAll('.article-sidebar a, .sidenav-link');
  var currentPath = window.location.pathname;

  sidebarLinks.forEach(function (link) {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });

  // --- Article vote buttons ---
  var voteButtons = document.querySelectorAll('.article-vote-up, .article-vote-down');
  voteButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      voteButtons.forEach(function (b) { b.style.opacity = '0.5'; });
      this.style.opacity = '1';
    });
  });

  // ============================================================
  // ARTICLE PAGE
  // ============================================================
  var articlePage = document.querySelector('.article-page');
  if (articlePage) {
    var KICKERS = {
      'Getting Started': 'Setup',
      'Account': 'Account',
      'Team Management': 'Team',
      'Integrations': 'Connect',
      'Billing': 'Plan',
      'Troubleshooting': 'Fix it'
    };

    // Section kicker (left rail + article eyebrow)
    var railLabel = articlePage.querySelector('.rail-section');
    if (railLabel) {
      var name = railLabel.getAttribute('data-section-name') || '';
      var kicker = KICKERS[name];
      var kickerEl = railLabel.querySelector('.rail-kicker');
      if (kickerEl && kicker) kickerEl.textContent = kicker + ' · ';
    }
    var eyebrow = articlePage.querySelector('.article-eyebrow');
    var eyebrowKicker = articlePage.querySelector('.article-eyebrow-kicker');
    var eyebrowPos = articlePage.querySelector('.article-eyebrow-position');
    if (eyebrow && eyebrowKicker) {
      var sn = eyebrow.getAttribute('data-section-name') || '';
      var k = KICKERS[sn] || sn;
      eyebrowKicker.textContent = k;
    }

    // Position counter — find current article in rail-link list
    var railLinks = articlePage.querySelectorAll('.rail-link');
    var activeIndex = -1;
    railLinks.forEach(function (a, i) {
      if (a.classList.contains('is-active')) activeIndex = i;
    });
    if (activeIndex >= 0 && eyebrowPos) {
      var pad = function (n) { return String(n).padStart(2, '0'); };
      eyebrowPos.textContent = ' · Article ' + pad(activeIndex + 1) + ' of ' + pad(railLinks.length);
    }

    // Read time — count words in body
    var body = articlePage.querySelector('.article-body');
    var readEl = articlePage.querySelector('.article-meta-readtime b');
    if (body && readEl) {
      var words = (body.innerText || '').trim().split(/\s+/).length;
      var minutes = Math.max(1, Math.round(words / 220));
      readEl.textContent = minutes + ' min';
    }

    // Lede / drop cap on first paragraph if long enough
    if (body) {
      var firstP = body.querySelector(':scope > p');
      if (firstP && firstP.textContent.trim().length > 140) {
        firstP.classList.add('lede');
      }
    }

    // Auto-build TOC from h2s
    var toc = articlePage.querySelector('.toc');
    var tocList = articlePage.querySelector('.toc-list');
    if (body && toc && tocList) {
      var h2s = body.querySelectorAll('h2');
      var tocLinks = [];
      h2s.forEach(function (h, i) {
        var id = h.id || ('section-' + i);
        h.id = id;
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#' + id;
        a.textContent = h.textContent;
        li.appendChild(a);
        tocList.appendChild(li);
        tocLinks.push(a);
      });
      if (tocLinks.length >= 2) {
        toc.removeAttribute('hidden');
        var byId = {};
        tocLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            var id = entry.target.id;
            var link = byId[id];
            if (!link || !entry.isIntersecting) return;
            tocLinks.forEach(function (l) { l.classList.remove('is-active'); });
            link.classList.add('is-active');
          });
        }, { rootMargin: '-100px 0px -65% 0px', threshold: 0 });
        h2s.forEach(function (h) { observer.observe(h); });
      }
    }

    // Reading progress bar
    var rpBar = articlePage.querySelector('.rp-bar');
    if (rpBar) {
      var update = function () {
        var doc = document.documentElement;
        var max = doc.scrollHeight - doc.clientHeight;
        var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
        rpBar.style.width = Math.min(pct, 100) + '%';
      };
      window.addEventListener('scroll', update, { passive: true });
      update();
    }

    // Prev/Next pager from rail-link list — falls back to section/home at edges
    var pager = articlePage.querySelector('[data-pager]');
    if (pager) {
      var prev = activeIndex > 0 ? railLinks[activeIndex - 1] : null;
      var next = activeIndex >= 0 && activeIndex < railLinks.length - 1 ? railLinks[activeIndex + 1] : null;
      var prevA = pager.querySelector('.prev');
      var nextA = pager.querySelector('.next');
      var backLink = articlePage.querySelector('.back-link');
      var sectionHref = backLink ? backLink.getAttribute('href') : '/hc';
      var sectionName = articlePage.querySelector('.rail-section');
      sectionName = sectionName ? sectionName.getAttribute('data-section-name') : '';

      if (prevA) {
        if (prev) {
          prevA.href = prev.href;
          prevA.querySelector('.pager-title').textContent = prev.textContent.trim();
        } else {
          prevA.href = sectionHref;
          prevA.querySelector('.pager-title').textContent = sectionName ? 'All ' + sectionName : 'Back to section';
        }
        prevA.removeAttribute('hidden');
      }
      if (nextA) {
        if (next) {
          nextA.href = next.href;
          nextA.querySelector('.pager-title').textContent = next.textContent.trim();
        } else {
          nextA.href = '/hc';
          nextA.querySelector('.pager-title').textContent = 'Browse all topics';
        }
        nextA.removeAttribute('hidden');
      }
      pager.removeAttribute('hidden');
    }
  }

  // ============================================================
  // SEARCH RESULTS PAGE
  // ============================================================
  var searchPage = document.querySelector('.search-page');
  if (searchPage) {
    var rows = searchPage.querySelectorAll('.search-row');
    var pad = function (n) { return String(n).padStart(2, '0'); };
    rows.forEach(function (row, i) {
      var num = row.querySelector('.search-row-num');
      if (num) num.textContent = pad(i + 1);
    });
    var summary = searchPage.querySelector('[data-search-summary]');
    if (summary && rows.length) {
      summary.textContent = rows.length + (rows.length === 1 ? ' result on this page' : ' results on this page');
      summary.removeAttribute('hidden');
    }
    // Hide First/Last pagination items regardless of Zendesk's class names
    var pagItems = searchPage.querySelectorAll('.search-pagination a, .search-pagination li, .search-pagination span');
    pagItems.forEach(function (el) {
      var t = (el.textContent || '').trim().toLowerCase();
      if (t === 'first' || t === 'last' || t === '« first' || t === 'last »' || t === '«' || t === '»') {
        var li = el.closest('li');
        (li || el).style.display = 'none';
      }
    });
  }

  // ============================================================
  // HOME PAGE — chapter accordion
  // ============================================================

  var chapters = document.querySelectorAll('.chapter');
  if (!chapters.length) return;

  // Editorial kicker labels for known sections (graceful fallback for new sections)
  var KICKERS = {
    'Onboarding: How To': 'How-to',
    'Account': 'Account',
    'Troubleshooting': 'Fix it',
    'Document Management': 'Docs',
    'Onboard Software': 'Software',
    'Bureau Admins': 'Bureau',
    'Getting Started': 'Setup'
  };

  var totalChapters = chapters.length;
  var totalStr = String(totalChapters).padStart(2, '0');

  chapters.forEach(function (chapter, i) {
    // Numbering: 01 / 05
    var numEl = chapter.querySelector('.chapter-num');
    if (numEl) numEl.textContent = String(i + 1).padStart(2, '0') + ' / ' + totalStr;

    // Kicker label
    var name = chapter.getAttribute('data-section-name') || '';
    var kicker = KICKERS[name];
    var kickerEl = chapter.querySelector('.chapter-kicker');
    if (kickerEl && kicker) kickerEl.textContent = kicker;
    if (kickerEl && !kicker) kickerEl.style.display = 'none';
  });

  // --- Lazy-load section articles via Help Center API ---
  function loadSectionArticles(chapter) {
    var list = chapter.querySelector('.chapter-articles');
    if (!list || list.getAttribute('data-loaded') === 'true') return;
    var sectionId = list.getAttribute('data-section-articles');
    if (!sectionId) return;
    list.setAttribute('data-loaded', 'true');

    var locale = (document.documentElement.lang || 'en-us').toLowerCase();
    var url = '/api/v2/help_center/' + locale + '/sections/' + sectionId + '/articles.json?per_page=8&sort_by=position';

    fetch(url, { headers: { 'Accept': 'application/json' } })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var articles = (data && data.articles) || [];
        var count = (data && data.count) || articles.length;

        // Update tag count
        var countEl = chapter.querySelector('.chapter-count');
        if (countEl) countEl.textContent = count + (count === 1 ? ' article' : ' articles');

        // Update view-all label
        var viewAll = chapter.querySelector('.chapter-view-all');
        if (viewAll) viewAll.innerHTML = 'View all ' + count + ' articles &rarr;';

        if (!articles.length) {
          list.innerHTML = '<li class="chapter-articles-empty">No articles in this section yet.</li>';
          return;
        }

        list.innerHTML = articles.map(function () {
          return '<li><a class="chapter-article-link" href="">' +
            '<span></span>' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M5 12h14M13 6l6 6-6 6"/></svg>' +
            '</a></li>';
        }).join('');

        var links = list.querySelectorAll('.chapter-article-link');
        links.forEach(function (link, i) {
          link.setAttribute('href', articles[i].html_url);
          link.querySelector('span').textContent = articles[i].title;
        });
      })
      .catch(function () {
        list.innerHTML = '<li class="chapter-articles-empty">Unable to load articles.</li>';
      });
  }

  // Pre-fetch counts for all chapters so the tag row shows real numbers
  chapters.forEach(function (chapter) {
    var sectionId = chapter.querySelector('.chapter-articles');
    if (!sectionId) return;
    var id = sectionId.getAttribute('data-section-articles');
    if (!id) return;
    var locale = (document.documentElement.lang || 'en-us').toLowerCase();
    fetch('/api/v2/help_center/' + locale + '/sections/' + id + '/articles.json?per_page=1', {
      headers: { 'Accept': 'application/json' }
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var count = (data && data.count) || 0;
        var countEl = chapter.querySelector('.chapter-count');
        if (countEl) countEl.textContent = count + (count === 1 ? ' article' : ' articles');
      })
      .catch(function () { /* ignore */ });
  });

  // Toggle handlers
  var rows = document.querySelectorAll('.chapter-row');
  rows.forEach(function (row) {
    row.addEventListener('click', function () {
      var chapter = row.closest('.chapter');
      if (!chapter) return;
      var open = chapter.classList.toggle('is-open');
      row.setAttribute('aria-expanded', String(open));
      if (open) loadSectionArticles(chapter);
    });
  });

  // Auto-open the featured chapter
  var featured = document.querySelector('.chapter--featured');
  if (featured) {
    featured.classList.add('is-open');
    var featuredRow = featured.querySelector('.chapter-row');
    if (featuredRow) featuredRow.setAttribute('aria-expanded', 'true');
    loadSectionArticles(featured);
  }
});

// --- Category page: hydrate kicker labels for each section ---
document.addEventListener('DOMContentLoaded', function () {
  var catSections = document.querySelectorAll('.category-page .cat-section');
  if (!catSections.length) return;

  var KICKERS = {
    'Onboarding: How To': 'How-to',
    'Account': 'Account',
    'Troubleshooting': 'Fix it',
    'Document Management': 'Docs',
    'Onboard Software': 'Software',
    'Bureau Admins': 'Bureau',
    'Getting Started': 'Setup'
  };

  catSections.forEach(function (section) {
    var titleEl = section.querySelector('.cat-section-title');
    var kickerEl = section.querySelector('.cat-section-kicker');
    if (!titleEl || !kickerEl) return;
    var name = (titleEl.textContent || '').trim();
    var label = KICKERS[name];
    if (label) kickerEl.textContent = label;
  });
});
