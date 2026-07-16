/* =========================================================
   Nayantharafanmade — pages.js
   Shared lightweight logic for the standalone content pages
   (gallery.html, movies.html, news.html, fanzone.html, search.html).
   Fetches structured data from /assets/data/*.json so content
   lives in one editable place instead of being duplicated in HTML.
   ========================================================= */

(function () {
  "use strict";

  function svgPlaceholder(colors, w, h) {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="' + colors[0] + '"/>' +
      '<stop offset="100%" stop-color="' + colors[1] + '"/>' +
      "</linearGradient></defs>" +
      '<rect width="100%" height="100%" fill="#0a0a0d"/>' +
      '<rect width="100%" height="100%" fill="url(#g)" opacity="0.55"/>' +
      '<text x="50%" y="50%" font-family="Georgia, serif" font-size="' + Math.round(w / 14) + '" fill="rgba(255,255,255,0.85)" text-anchor="middle" dominant-baseline="middle">N</text>' +
      "</svg>";
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  }

  function fetchJSON(path) {
    return fetch(path).then(function (r) {
      if (!r.ok) throw new Error("Failed to load " + path);
      return r.json();
    });
  }

  function setYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  function initNav() {
    var toggle = document.getElementById("navToggle");
    var menu = document.getElementById("navMenu");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("open");
        toggle.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
  }

  /* ---------------- Gallery page ---------------- */
  function initGalleryPage() {
    var wrap = document.getElementById("pageMasonry");
    if (!wrap) return;
    fetchJSON("assets/data/gallery.json").then(function (data) {
      var frag = document.createDocumentFragment();
      data.items.forEach(function (item) {
        var fig = document.createElement("figure");
        fig.className = "masonry-item";
        fig.dataset.cat = item.cat;
        var img = document.createElement("img");
        img.src = svgPlaceholder(item.colors, 400, 300);
        img.loading = "lazy";
        img.decoding = "async";
        img.alt = "Nayanthara fan gallery image — " + item.caption;
        fig.appendChild(img);
        frag.appendChild(fig);
      });
      wrap.appendChild(frag);
    }).catch(function () {
      wrap.innerHTML = '<p class="empty-state">Gallery data could not be loaded.</p>';
    });

    var filterBar = document.getElementById("pageGalleryFilters");
    if (filterBar) {
      filterBar.addEventListener("click", function (e) {
        var btn = e.target.closest(".filter-btn");
        if (!btn) return;
        filterBar.querySelectorAll(".filter-btn").forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        var filter = btn.dataset.filter;
        wrap.querySelectorAll(".masonry-item").forEach(function (item) {
          item.classList.toggle("is-hidden", filter !== "all" && item.dataset.cat !== filter);
        });
      });
    }
  }

  /* ---------------- Movies page ---------------- */
  function initMoviesPage() {
    var list = document.getElementById("pageTimeline");
    if (!list) return;
    fetchJSON("assets/data/movies.json").then(function (data) {
      window.__moviesData = data.movies;
      renderMoviePage(data.movies);
    }).catch(function () {
      list.innerHTML = '<p class="empty-state">Movie data could not be loaded.</p>';
    });

    var filterBar = document.getElementById("pageMovieFilters");
    var search = document.getElementById("pageMovieSearch");
    if (filterBar) {
      filterBar.addEventListener("click", function (e) {
        var btn = e.target.closest(".filter-btn");
        if (!btn) return;
        filterBar.querySelectorAll(".filter-btn").forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        applyMovieFilters();
      });
    }
    if (search) search.addEventListener("input", applyMovieFilters);

    function applyMovieFilters() {
      if (!window.__moviesData) return;
      var lang = filterBar ? (filterBar.querySelector(".is-active") || {}).dataset : {};
      var query = search ? search.value.trim().toLowerCase() : "";
      var filtered = window.__moviesData.filter(function (m) {
        var langOk = !lang.lang || lang.lang === "all" || m.lang === lang.lang;
        var qOk = !query || m.title.toLowerCase().indexOf(query) !== -1;
        return langOk && qOk;
      });
      renderMoviePage(filtered);
    }
  }

  function renderMoviePage(movies) {
    var list = document.getElementById("pageTimeline");
    list.innerHTML = "";
    if (!movies.length) {
      list.innerHTML = '<p class="empty-state">No movies match your search.</p>';
      return;
    }
    var frag = document.createDocumentFragment();
    movies.forEach(function (m) {
      var li = document.createElement("li");
      li.className = "timeline-item";
      li.innerHTML =
        '<div class="timeline-dot" aria-hidden="true"></div>' +
        '<div class="timeline-card">' +
          '<div class="timeline-poster" aria-hidden="true"><img loading="lazy" src="' +
            svgPlaceholder(["#8B5CF6", "#EC4899"], 128, 176) + '" alt=""></div>' +
          '<div class="timeline-body">' +
            '<span class="timeline-year">' + m.year + '</span>' +
            '<span class="timeline-lang">' + m.lang.charAt(0).toUpperCase() + m.lang.slice(1) + '</span>' +
            '<span class="timeline-lang" style="border-color:rgba(212,175,55,.4);color:var(--gold);">' + m.genre + '</span>' +
            '<h3 class="timeline-title">' + m.title + '</h3>' +
            '<p>' + m.synopsis + '</p>' +
          '</div>' +
        '</div>';
      frag.appendChild(li);
    });
    list.appendChild(frag);
  }

  /* ---------------- News page ---------------- */
  function initNewsPage() {
    var grid = document.getElementById("pageNewsGrid");
    if (!grid) return;
    fetchJSON("assets/data/news.json").then(function (data) {
      window.__newsData = data.articles;
      renderNewsPage(data.articles);
    }).catch(function () {
      grid.innerHTML = '<p class="empty-state">News data could not be loaded.</p>';
    });

    var search = document.getElementById("pageNewsSearch");
    var filterBar = document.getElementById("pageNewsFilters");
    function apply() {
      if (!window.__newsData) return;
      var query = search ? search.value.trim().toLowerCase() : "";
      var cat = filterBar ? (filterBar.querySelector(".is-active") || {}).dataset.cat : "all";
      var filtered = window.__newsData.filter(function (a) {
        var catOk = !cat || cat === "all" || a.category === cat;
        var qOk = !query || a.title.toLowerCase().indexOf(query) !== -1;
        return catOk && qOk;
      });
      renderNewsPage(filtered);
    }
    if (search) search.addEventListener("input", apply);
    if (filterBar) filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      filterBar.querySelectorAll(".filter-btn").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      apply();
    });
  }

  function renderNewsPage(articles) {
    var grid = document.getElementById("pageNewsGrid");
    grid.innerHTML = "";
    if (!articles.length) {
      grid.innerHTML = '<p class="empty-state">No news matches your search.</p>';
      return;
    }
    var frag = document.createDocumentFragment();
    articles.forEach(function (a) {
      var article = document.createElement("article");
      article.className = "news-card";
      article.id = a.id;
      var d = new Date(a.date);
      var dateLabel = d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
      article.innerHTML =
        '<span class="news-tag">' + a.category.charAt(0).toUpperCase() + a.category.slice(1) + '</span>' +
        '<h3>' + a.title + '</h3>' +
        '<p>' + a.summary + '</p>' +
        '<time datetime="' + a.date + '">' + dateLabel + '</time>';
      frag.appendChild(article);
    });
    grid.appendChild(frag);
  }

  /* ---------------- Fan Zone page (favorites reused) ---------------- */
  function initFavoritesOnPage() {
    document.querySelectorAll(".fav-btn").forEach(function (btn) {
      var id = btn.dataset.favId;
      var favs = [];
      try { favs = JSON.parse(localStorage.getItem("nfm-favorites") || "[]"); } catch (e) {}
      if (favs.indexOf(id) !== -1) { btn.classList.add("is-active"); btn.textContent = "♥"; }
      btn.addEventListener("click", function () {
        var list = [];
        try { list = JSON.parse(localStorage.getItem("nfm-favorites") || "[]"); } catch (e) {}
        var idx = list.indexOf(id);
        if (idx === -1) { list.push(id); btn.classList.add("is-active"); btn.textContent = "♥"; }
        else { list.splice(idx, 1); btn.classList.remove("is-active"); btn.textContent = "♡"; }
        localStorage.setItem("nfm-favorites", JSON.stringify(list));
      });
    });
  }

  /* ---------------- Global search page ---------------- */
  function initSearchPage() {
    var input = document.getElementById("pageSearchInput");
    var results = document.getElementById("pageSearchResults");
    if (!input) return;

    Promise.all([
      fetchJSON("assets/data/movies.json"),
      fetchJSON("assets/data/gallery.json"),
      fetchJSON("assets/data/news.json"),
      fetchJSON("assets/data/awards.json")
    ]).then(function (all) {
      var index = [];
      all[0].movies.forEach(function (m) { index.push({ group: "Movies", title: m.title, meta: m.year + " · " + m.lang, url: "movies.html" }); });
      all[1].items.forEach(function (g) { index.push({ group: "Gallery", title: g.caption, meta: g.cat, url: "gallery.html" }); });
      all[2].articles.forEach(function (n) { index.push({ group: "News", title: n.title, meta: n.date, url: "news.html#" + n.id }); });
      all[3].awards.forEach(function (a) { index.push({ group: "Awards", title: a.title, meta: "Recognition", url: "index.html#awards" }); });

      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q");
      if (initial) { input.value = initial; runSearch(initial); }

      input.addEventListener("input", function () { runSearch(input.value); });

      function runSearch(q) {
        q = q.trim().toLowerCase();
        if (!q) { results.innerHTML = '<p class="empty-state">Start typing to search movies, gallery, news and awards.</p>'; return; }
        var matches = index.filter(function (item) {
          return item.title.toLowerCase().indexOf(q) !== -1 || item.meta.toLowerCase().indexOf(q) !== -1;
        });
        if (!matches.length) { results.innerHTML = '<p class="empty-state">No results for "' + q + '".</p>'; return; }
        var html = "";
        matches.forEach(function (m) {
          html += '<a class="search-result-item" href="' + m.url + '" style="display:block;margin-bottom:.5rem;">' +
            m.title + '<small>' + m.group + ' · ' + m.meta + '</small></a>';
        });
        results.innerHTML = html;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setYear();
    initNav();
    initGalleryPage();
    initMoviesPage();
    initNewsPage();
    initFavoritesOnPage();
    initSearchPage();
  });
})();
