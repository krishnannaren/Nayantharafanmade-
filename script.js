/* =========================================================
   Nayantharafanmade — script.js (v2 premium build)
   Vanilla JS + GSAP + Lenis. No frameworks, no jQuery.

   CONFIG: to enable LIVE YouTube data, set YT_API_KEY and
   YT_CHANNEL_ID below. Without a key, the section renders
   curated fallback cards so the site stays fully functional.
   ========================================================= */

(function () {
  "use strict";

  var CONFIG = {
    YT_API_KEY: "",                 // <-- add a YouTube Data API v3 key to go live
    YT_CHANNEL_ID: "",              // <-- add the channel ID for @nayantharafanmadeofficial
    YT_MAX_RESULTS: 6
  };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    setYear();
    initLoader();
    initNav();
    initLenis();
    initMouseGlow();
    buildGallery();
    initGalleryFilters();
    initLoadMore();
    initLightbox();
    initParticles();
    initScrollReveal();
    initSmoothAnchors();
    buildVideos();
    buildMovies();
    initMovieFilters();
    initNewsControls();
    initShareButtons();
    initSocialCounts();
    registerServiceWorker();
  }

  /* ---------------- Footer year ---------------- */
  function setYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------------- Loading screen ---------------- */
  function initLoader() {
    var loader = document.getElementById("loader");
    if (!loader) return;
    window.addEventListener("load", function () {
      setTimeout(function () {
        loader.classList.add("done");
        loader.addEventListener("transitionend", function () { loader.remove(); }, { once: true });
      }, 400);
    });
  }

  /* ---------------- Navbar ---------------- */
  function initNav() {
    var navbar = document.getElementById("navbar");
    var toggle = document.getElementById("navToggle");
    var menu = document.getElementById("navMenu");
    if (!navbar) return;

    function onScroll() {
      if (window.scrollY > 40) navbar.classList.add("scrolled");
      else navbar.classList.remove("scrolled");
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("open");
        toggle.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      menu.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          menu.classList.remove("open");
          toggle.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  /* ---------------- Lenis smooth scroll ---------------- */
  var lenisInstance = null;
  function initLenis() {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof window.Lenis === "undefined") return;
    try {
      lenisInstance = new window.Lenis({ duration: 1.1, smoothWheel: true });
      function raf(time) {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
      if (window.gsap && window.gsap.ticker) {
        gsap.ticker.add(function (time) { lenisInstance.raf(time * 1000); });
      }
    } catch (e) { /* Lenis unavailable — native scroll still works */ }
  }

  /* ---------------- Mouse-follow glow ---------------- */
  function initMouseGlow() {
    var hero = document.querySelector(".hero");
    var glow = document.getElementById("mouseGlow");
    if (!hero || !glow) return;
    if (window.matchMedia("(hover: none)").matches) return;
    hero.addEventListener("mousemove", function (e) {
      var rect = hero.getBoundingClientRect();
      glow.style.left = (e.clientX - rect.left) + "px";
      glow.style.top = (e.clientY - rect.top) + "px";
    });
  }

  /* ---------------- Smooth anchor scroll ---------------- */
  function initSmoothAnchors() {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (lenisInstance) {
          lenisInstance.scrollTo(target);
        } else {
          target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        }
        history.pushState(null, "", id);
      });
    });
  }

  /* ---------------- Gallery (masonry) ---------------- */
  var GALLERY_ITEMS = [
    { caption: "Red Carpet Elegance", cat: "red-carpet", h: 320, colors: ["#8B5CF6", "#EC4899"] },
    { caption: "On Set Candid", cat: "candid", h: 260, colors: ["#3B82F6", "#8B5CF6"] },
    { caption: "Award Night Glam", cat: "red-carpet", h: 380, colors: ["#D4AF37", "#EC4899"] },
    { caption: "Behind the Scenes", cat: "candid", h: 220, colors: ["#EC4899", "#3B82F6"] },
    { caption: "Classic Portrait", cat: "movie-stills", h: 340, colors: ["#8B5CF6", "#D4AF37"] },
    { caption: "Cinematic Still", cat: "movie-stills", h: 280, colors: ["#3B82F6", "#D4AF37"] },
    { caption: "Fan Art Tribute", cat: "fan-art", h: 360, colors: ["#EC4899", "#8B5CF6"] },
    { caption: "Premiere Look", cat: "red-carpet", h: 240, colors: ["#D4AF37", "#3B82F6"] },
    { caption: "Magazine Cover", cat: "movie-stills", h: 300, colors: ["#8B5CF6", "#EC4899"] },
    { caption: "Style Icon Moment", cat: "candid", h: 260, colors: ["#3B82F6", "#EC4899"] },
    { caption: "Golden Hour Frame", cat: "candid", h: 320, colors: ["#D4AF37", "#8B5CF6"] },
    { caption: "Screen Legend", cat: "movie-stills", h: 300, colors: ["#EC4899", "#D4AF37"] },
    { caption: "Digital Fan Painting", cat: "fan-art", h: 300, colors: ["#8B5CF6", "#3B82F6"] },
    { caption: "Community Sketch", cat: "fan-art", h: 260, colors: ["#D4AF37", "#EC4899"] },
    { caption: "Festival Appearance", cat: "red-carpet", h: 340, colors: ["#3B82F6", "#8B5CF6"] },
    { caption: "Quiet Moment", cat: "candid", h: 300, colors: ["#EC4899", "#D4AF37"] }
  ];

  var GALLERY_PAGE_SIZE = 8;
  var galleryRendered = 0;

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

  function buildGallery() {
    renderNextGalleryPage();
  }

  function renderNextGalleryPage() {
    var wrap = document.getElementById("masonry");
    if (!wrap) return;
    var next = GALLERY_ITEMS.slice(galleryRendered, galleryRendered + GALLERY_PAGE_SIZE);
    var frag = document.createDocumentFragment();

    next.forEach(function (item) {
      var fig = document.createElement("figure");
      fig.className = "masonry-item";
      fig.setAttribute("data-caption", item.caption);
      fig.setAttribute("data-cat", item.cat);
      fig.setAttribute("data-reveal", "");
      fig.setAttribute("tabindex", "0");
      fig.setAttribute("role", "button");
      fig.setAttribute("aria-label", "View " + item.caption);

      var img = document.createElement("img");
      var src = svgPlaceholder(item.colors, 400, item.h);
      img.src = src;
      img.loading = "lazy";
      img.decoding = "async";
      img.width = 400;
      img.height = item.h;
      img.alt = "Nayanthara fan gallery image — " + item.caption;

      fig.appendChild(img);
      function open() { openLightbox(fig); }
      fig.addEventListener("click", open);
      fig.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });
      frag.appendChild(fig);
    });

    wrap.appendChild(frag);
    galleryRendered += next.length;

    var loadMoreBtn = document.getElementById("loadMoreBtn");
    if (loadMoreBtn) loadMoreBtn.hidden = galleryRendered >= GALLERY_ITEMS.length;

    applyActiveGalleryFilter();

    if (window.gsap) {
      gsap.fromTo(next.length ? wrap.querySelectorAll("[data-reveal].is-visible, [data-reveal]:not(.is-visible)") : [], {}, {});
    }
    // Re-run reveal observer for newly added items if IO-based fallback is active
    if (window.__revealObserver) {
      wrap.querySelectorAll("[data-reveal]").forEach(function (el) { window.__revealObserver.observe(el); });
    }
  }

  function initLoadMore() {
    var btn = document.getElementById("loadMoreBtn");
    if (!btn) return;
    btn.addEventListener("click", renderNextGalleryPage);
  }

  var currentGalleryFilter = "all";
  function initGalleryFilters() {
    var bar = document.getElementById("galleryFilters");
    if (!bar) return;
    bar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      bar.querySelectorAll(".filter-btn").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      currentGalleryFilter = btn.dataset.filter;
      applyActiveGalleryFilter();
    });
  }

  function applyActiveGalleryFilter() {
    var items = document.querySelectorAll("#masonry .masonry-item");
    items.forEach(function (item) {
      var match = currentGalleryFilter === "all" || item.dataset.cat === currentGalleryFilter;
      item.classList.toggle("is-hidden", !match);
    });
  }

  /* ---------------- Lightbox with next/prev ---------------- */
  var lightbox, lightboxImg, lightboxCaption, lastFocused, lightboxIndex = -1;

  function visibleGalleryItems() {
    return Array.prototype.filter.call(
      document.querySelectorAll("#masonry .masonry-item"),
      function (el) { return !el.classList.contains("is-hidden"); }
    );
  }

  function initLightbox() {
    lightbox = document.getElementById("lightbox");
    lightboxImg = document.getElementById("lightboxImg");
    lightboxCaption = document.getElementById("lightboxCaption");
    var closeBtn = document.getElementById("lightboxClose");
    var prevBtn = document.getElementById("lightboxPrev");
    var nextBtn = document.getElementById("lightboxNext");
    if (!lightbox) return;

    closeBtn.addEventListener("click", closeLightbox);
    prevBtn.addEventListener("click", function () { stepLightbox(-1); });
    nextBtn.addEventListener("click", function () { stepLightbox(1); });
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") stepLightbox(-1);
      if (e.key === "ArrowRight") stepLightbox(1);
    });
  }

  function openLightbox(figureEl) {
    if (!lightbox) return;
    var items = visibleGalleryItems();
    lightboxIndex = items.indexOf(figureEl);
    lastFocused = document.activeElement;
    renderLightboxAt();
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("lightboxClose").focus();
  }

  function stepLightbox(dir) {
    var items = visibleGalleryItems();
    if (!items.length) return;
    lightboxIndex = (lightboxIndex + dir + items.length) % items.length;
    renderLightboxAt();
  }

  function renderLightboxAt() {
    var items = visibleGalleryItems();
    var el = items[lightboxIndex];
    if (!el) return;
    var img = el.querySelector("img");
    lightboxImg.style.opacity = 0;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = el.dataset.caption + " (" + (lightboxIndex + 1) + " / " + items.length + ")";
    requestAnimationFrame(function () {
      lightboxImg.style.transition = "opacity .35s ease, transform .35s ease";
      lightboxImg.style.transform = "scale(1)";
      lightboxImg.style.opacity = 1;
    });
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = "";
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  /* ---------------- Floating particles (hero canvas) ---------------- */
  function initParticles() {
    var canvas = document.getElementById("particles");
    if (!canvas) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var ctx = canvas.getContext("2d");
    var particles = [];
    var count = reduce ? 0 : (window.innerWidth < 700 ? 30 : 65);
    var colors = ["#8B5CF6", "#EC4899", "#D4AF37", "#3B82F6", "#ffffff"];

    function resize() {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
    }
    function makeParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: (Math.random() * 1.9 + 0.6) * devicePixelRatio,
        vy: (Math.random() * 0.26 + 0.06) * devicePixelRatio,
        vx: (Math.random() - 0.5) * 0.16 * devicePixelRatio,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2
      };
    }
    resize();
    window.addEventListener("resize", resize);
    for (var i = 0; i < count; i++) particles.push(makeParticle());

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(function (p) {
        p.y -= p.vy; p.x += p.vx;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (!reduce) requestAnimationFrame(tick);
    }
    if (!reduce) requestAnimationFrame(tick);
  }

  /* ---------------- Scroll reveal ---------------- */
  function initScrollReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      items.forEach(function (el, i) {
        gsap.fromTo(el, { opacity: 0, y: 32, scale: .98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out", delay: (i % 4) * 0.06,
            scrollTrigger: { trigger: el, start: "top 88%" } });
      });

      gsap.timeline({ defaults: { ease: "power3.out" } })
        .fromTo(".hero-card .eyebrow", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .7 })
        .fromTo(".reveal-word", { opacity: 0, y: 34, rotateX: -40 }, { opacity: 1, y: 0, rotateX: 0, duration: .9, stagger: .12 }, "-=.4")
        .fromTo(".hero-subtitle", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .8 }, "-=.5")
        .fromTo(".hero-actions", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .8 }, "-=.5");

      gsap.to(".glow-purple", { y: 40, scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } });
      gsap.to(".glow-pink", { y: -30, scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } });
      gsap.to(".glow-gold", { y: 25, scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      window.__revealObserver = io;
      items.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------------- Videos: YouTube Data API with fallback ---------------- */
  var FALLBACK_VIDEOS = [
    { title: "Best Moments Compilation", desc: "A glimpse into iconic on-screen moments, curated by fans.", listId: "PLexampleNayanthara1" },
    { title: "Interview Highlights", desc: "Memorable interview clips collected from public appearances.", listId: "PLexampleNayanthara2" },
    { title: "Trailer Roundup", desc: "The latest trailers from across her filmography.", listId: "PLexampleNayanthara3" }
  ];

  function buildVideos() {
    var grid = document.getElementById("videoGrid");
    var note = document.getElementById("videoApiNote");
    if (!grid) return;

    if (CONFIG.YT_API_KEY && CONFIG.YT_CHANNEL_ID) {
      fetchLatestYouTubeUploads()
        .then(function (videos) {
          if (!videos || !videos.length) throw new Error("empty");
          renderVideoCards(grid, videos, true);
          if (note) note.textContent = "Showing the latest uploads from @nayantharafanmadeofficial, updated live via the YouTube Data API.";
        })
        .catch(function () { renderFallbackVideos(grid); });
    } else {
      renderFallbackVideos(grid);
    }
  }

  function renderFallbackVideos(grid) {
    grid.innerHTML = "";
    renderVideoCards(grid, FALLBACK_VIDEOS.map(function (v) {
      return { title: v.title, desc: v.desc, embedUrl: "https://www.youtube.com/embed/videoseries?list=" + v.listId };
    }), false);
  }

  function renderVideoCards(grid, videos, live) {
    grid.innerHTML = "";
    var frag = document.createDocumentFragment();
    videos.forEach(function (v) {
      var card = document.createElement("article");
      card.className = "video-card";
      card.setAttribute("data-reveal", "");

      var embed = document.createElement("div");
      embed.className = "video-embed";
      var iframe = document.createElement("iframe");
      iframe.loading = "lazy";
      iframe.src = v.embedUrl;
      iframe.title = v.title;
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      embed.appendChild(iframe);

      var meta = document.createElement("div");
      meta.className = "video-meta";
      var h3 = document.createElement("h3");
      h3.textContent = v.title;
      var p = document.createElement("p");
      p.textContent = v.desc || "";
      meta.appendChild(h3);
      meta.appendChild(p);
      if (live && (v.views || v.publishedAt)) {
        var small = document.createElement("time");
        small.style.display = "block";
        small.style.marginTop = ".6rem";
        small.style.fontSize = ".72rem";
        small.style.color = "var(--muted)";
        small.textContent = (v.views ? v.views + " views" : "") + (v.publishedAt ? " · " + v.publishedAt : "");
        meta.appendChild(small);
      }

      card.appendChild(embed);
      card.appendChild(meta);
      frag.appendChild(card);
    });
    grid.appendChild(frag);
    if (window.__revealObserver) grid.querySelectorAll("[data-reveal]").forEach(function (el) { window.__revealObserver.observe(el); });
  }

  function fetchLatestYouTubeUploads() {
    var base = "https://www.googleapis.com/youtube/v3/search";
    var url = base + "?key=" + encodeURIComponent(CONFIG.YT_API_KEY) +
      "&channelId=" + encodeURIComponent(CONFIG.YT_CHANNEL_ID) +
      "&part=snippet&order=date&maxResults=" + CONFIG.YT_MAX_RESULTS + "&type=video";
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error("YouTube API error");
      return res.json();
    }).then(function (data) {
      return (data.items || []).map(function (item) {
        return {
          title: item.snippet.title,
          desc: item.snippet.description,
          embedUrl: "https://www.youtube.com/embed/" + item.id.videoId,
          publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString()
        };
      });
    });
  }

  /* ---------------- Movies: filmography timeline + language filter ---------------- */
  var MOVIES = [
    { year: 2024, title: "Featured Release", lang: "tamil", genre: "Drama", synopsis: "A standout recent performance that reaffirmed her range as a leading actress." },
    { year: 2023, title: "Telugu Crossover Hit", lang: "telugu", genre: "Action", synopsis: "A high-profile Telugu release that broadened her pan-South audience." },
    { year: 2022, title: "Career Milestone", lang: "tamil", genre: "Thriller", synopsis: "One of the defining roles that fans regularly cite as a career highlight." },
    { year: 2021, title: "Malayalam Festival Favorite", lang: "malayalam", genre: "Drama", synopsis: "A critically noted Malayalam project screened at regional festivals." },
    { year: 2019, title: "Hindi Debut Project", lang: "hindi", genre: "Family", synopsis: "An early Hindi-language collaboration that expanded her national reach." },
    { year: 2018, title: "Breakthrough Blockbuster", lang: "tamil", genre: "Action", synopsis: "A commercially and critically celebrated film that expanded her fanbase." },
    { year: 2015, title: "Telugu Ensemble Success", lang: "telugu", genre: "Comedy", synopsis: "A multi-starrer Telugu release remembered for its ensemble chemistry." },
    { year: 2010, title: "Early Career Highlight", lang: "malayalam", genre: "Romance", synopsis: "A formative Malayalam project that showcased early promise and screen presence." }
  ];

  var currentMovieLang = "all";
  var currentMovieQuery = "";

  function buildMovies() {
    var list = document.getElementById("movieTimeline");
    if (!list) return;
    renderMovies();
  }

  function renderMovies() {
    var list = document.getElementById("movieTimeline");
    if (!list) return;
    list.innerHTML = "";
    var frag = document.createDocumentFragment();
    var query = currentMovieQuery.trim().toLowerCase();
    var shown = 0;
    MOVIES.forEach(function (m) {
      if (currentMovieLang !== "all" && m.lang !== currentMovieLang) return;
      if (query && m.title.toLowerCase().indexOf(query) === -1) return;
      shown++;
      var li = document.createElement("li");
      li.className = "timeline-item";
      li.setAttribute("data-reveal", "");
      li.innerHTML =
        '<div class="timeline-dot" aria-hidden="true"></div>' +
        '<div class="timeline-card">' +
          '<div class="timeline-poster" aria-hidden="true"><img loading="lazy" src="' +
            svgPlaceholder(["#8B5CF6", "#EC4899"], 128, 176) + '" alt=""></div>' +
          '<div class="timeline-body">' +
            '<span class="timeline-year">' + m.year + '</span>' +
            '<span class="timeline-lang">' + capitalize(m.lang) + '</span>' +
            '<span class="timeline-lang" style="border-color:rgba(212,175,55,.4);color:var(--gold);">' + m.genre + '</span>' +
            '<h3 class="timeline-title">' + m.title + '</h3>' +
            '<p>' + m.synopsis + '</p>' +
          '</div>' +
        '</div>';
      frag.appendChild(li);
    });
    list.appendChild(frag);
    if (!shown) {
      var empty = document.createElement("li");
      empty.className = "timeline-empty";
      empty.style.cssText = "color:var(--muted);text-align:center;list-style:none;";
      empty.textContent = "No movies match your search.";
      list.appendChild(empty);
    }
    if (window.__revealObserver) list.querySelectorAll("[data-reveal]").forEach(function (el) { window.__revealObserver.observe(el); });
    else if (window.gsap && window.ScrollTrigger) {
      list.querySelectorAll("[data-reveal]").forEach(function (el, i) {
        gsap.fromTo(el, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: .8, ease: "power3.out", delay: (i % 4) * 0.06,
          scrollTrigger: { trigger: el, start: "top 90%" } });
      });
    }
  }

  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function initMovieFilters() {
    var bar = document.getElementById("movieFilters");
    var search = document.getElementById("movieSearch");
    if (bar) {
      bar.addEventListener("click", function (e) {
        var btn = e.target.closest(".filter-btn");
        if (!btn) return;
        bar.querySelectorAll(".filter-btn").forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        currentMovieLang = btn.dataset.lang;
        renderMovies();
      });
    }
    if (search) {
      search.addEventListener("input", function () {
        currentMovieQuery = search.value;
        renderMovies();
      });
    }
  }

  /* ---------------- News: search + category filter ---------------- */
  function initNewsControls() {
    var grid = document.getElementById("newsGrid");
    var searchInput = document.getElementById("newsSearch");
    var filterBar = document.getElementById("newsFilters");
    var emptyState = document.getElementById("newsEmpty");
    if (!grid) return;

    var activeCat = "all";

    function applyNewsFilters() {
      var query = (searchInput ? searchInput.value : "").trim().toLowerCase();
      var visibleCount = 0;
      grid.querySelectorAll(".news-card").forEach(function (card) {
        var matchesCat = activeCat === "all" || card.dataset.cat === activeCat;
        var matchesQuery = !query || card.dataset.title.toLowerCase().indexOf(query) !== -1;
        var show = matchesCat && matchesQuery;
        card.classList.toggle("is-hidden", !show);
        if (show) visibleCount++;
      });
      if (emptyState) emptyState.hidden = visibleCount !== 0;
    }

    if (searchInput) searchInput.addEventListener("input", applyNewsFilters);
    if (filterBar) {
      filterBar.addEventListener("click", function (e) {
        var btn = e.target.closest(".filter-btn");
        if (!btn) return;
        filterBar.querySelectorAll(".filter-btn").forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        activeCat = btn.dataset.cat;
        applyNewsFilters();
      });
    }
  }

  /* ---------------- Share buttons (Web Share API with clipboard fallback) ---------------- */
  function initShareButtons() {
    document.querySelectorAll(".share-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var shareData = {
          title: btn.dataset.shareTitle || document.title,
          text: btn.dataset.shareText || "",
          url: window.location.href
        };
        if (navigator.share) {
          navigator.share(shareData).catch(function () {});
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(shareData.url).then(function () {
            var original = btn.textContent;
            btn.textContent = "✓";
            setTimeout(function () { btn.textContent = original; }, 1500);
          });
        }
      });
    });
  }

  /* ---------------- Social follower counts (graceful fallback) ---------------- */
  // Live counters require authenticated APIs (YouTube Data API, Meta Graph API, etc.)
  // that cannot be safely called with public keys from client-side code. This function
  // is the integration point: wire in your own backend/proxy endpoint and it will
  // replace the "Fan Community" labels automatically.
  function initSocialCounts() {
    var endpoint = null; // e.g. "/api/social-counts" — set this once a backend exists
    if (!endpoint) return;
    fetch(endpoint).then(function (r) { return r.json(); }).then(function (counts) {
      document.querySelectorAll(".social-count").forEach(function (el) {
        var platform = el.dataset.platform;
        if (counts[platform]) el.textContent = counts[platform];
      });
    }).catch(function () {});
  }

  /* ---------------- Service worker (PWA offline support) ---------------- */
  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("/service-worker.js").catch(function () {});
      });
    }
  }

  /* =========================================================
     THEME SYSTEM — dark / light / auto, persisted in localStorage
     ========================================================= */
  function initTheme() {
    var toggle = document.getElementById("themeToggle");
    var iconDark = document.getElementById("themeIconDark");
    var iconLight = document.getElementById("themeIconLight");
    var stored = localStorage.getItem("nfm-theme"); // "dark" | "light" | null(auto)
    var mql = window.matchMedia("(prefers-color-scheme: light)");

    function effectiveTheme() {
      if (stored === "dark" || stored === "light") return stored;
      return mql.matches ? "light" : "dark";
    }

    function apply() {
      var theme = effectiveTheme();
      document.documentElement.setAttribute("data-theme", theme);
      if (iconDark && iconLight) {
        iconDark.hidden = theme === "light";
        iconLight.hidden = theme !== "light";
      }
    }

    apply();
    mql.addEventListener("change", function () { if (!stored) apply(); });

    if (toggle) {
      toggle.addEventListener("click", function () {
        var current = effectiveTheme();
        stored = current === "dark" ? "light" : "dark";
        localStorage.setItem("nfm-theme", stored);
        apply();
      });
    }
  }

  /* =========================================================
     CUSTOM CURSOR — glowing dot + magnetic ring
     ========================================================= */
  function initCustomCursor() {
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var dot = document.getElementById("cursorDot");
    var ring = document.getElementById("cursorRing");
    if (!dot || !ring) return;
    document.body.classList.add("has-custom-cursor");

    var mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px"; dot.style.top = my + "px";
    });

    function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    var magnetic = "a, button, .masonry-item, summary, input, textarea";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(magnetic)) ring.classList.add("is-magnetic");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(magnetic)) ring.classList.remove("is-magnetic");
    });
  }

  /* =========================================================
     GLOBAL SEARCH — indexes movies, gallery, news, awards, downloads
     ========================================================= */
  function buildSearchIndex() {
    var index = [];
    MOVIES.forEach(function (m) {
      index.push({ group: "Movies", title: m.title, meta: m.year + " · " + capitalize(m.lang) + " · " + m.genre, anchor: "#movies" });
    });
    GALLERY_ITEMS.forEach(function (g) {
      index.push({ group: "Gallery", title: g.caption, meta: capitalize(g.cat.replace("-", " ")), anchor: "#gallery" });
    });
    document.querySelectorAll(".news-card").forEach(function (card) {
      index.push({ group: "News", title: card.dataset.title, meta: card.querySelector("time") ? card.querySelector("time").textContent : "", anchor: "#news" });
    });
    document.querySelectorAll(".award-card h3").forEach(function (h) {
      index.push({ group: "Awards", title: h.textContent, meta: "Recognition", anchor: "#awards" });
    });
    ["Wallpapers", "Fan-Made Posters", "Quote Cards", "Fan Art Gallery"].forEach(function (t) {
      index.push({ group: "Downloads", title: t, meta: "Fan Zone", anchor: "#fanzone" });
    });
    return index;
  }

  function initGlobalSearch() {
    var trigger = document.getElementById("searchTrigger");
    var modal = document.getElementById("searchModal");
    var input = document.getElementById("globalSearchInput");
    var results = document.getElementById("searchResults");
    var closeBtn = document.getElementById("searchClose");
    if (!modal) return;
    var index = null;

    function open() {
      if (!index) index = buildSearchIndex();
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      input.value = "";
      results.innerHTML = '<p class="search-hint">Try "2018", "wallpapers", "awards" or a movie title.</p>';
      setTimeout(function () { input.focus(); }, 30);
    }
    function close() {
      modal.hidden = true;
      document.body.style.overflow = "";
      if (trigger) trigger.focus();
    }

    if (trigger) trigger.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault(); open();
      }
      if (e.key === "Escape" && !modal.hidden) close();
    });

    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      if (!q) {
        results.innerHTML = '<p class="search-hint">Try "2018", "wallpapers", "awards" or a movie title.</p>';
        return;
      }
      var matches = index.filter(function (item) {
        return item.title.toLowerCase().indexOf(q) !== -1 || (item.meta && item.meta.toLowerCase().indexOf(q) !== -1);
      }).slice(0, 24);

      if (!matches.length) {
        results.innerHTML = '<p class="search-hint">No matches for "' + escapeHtml(input.value) + '".</p>';
        return;
      }
      var groups = {};
      matches.forEach(function (m) { (groups[m.group] = groups[m.group] || []).push(m); });
      var html = "";
      Object.keys(groups).forEach(function (g) {
        html += '<div class="search-result-group">' + g + '</div>';
        groups[g].forEach(function (item) {
          html += '<a class="search-result-item" href="' + item.anchor + '">' + escapeHtml(item.title) +
            (item.meta ? '<small>' + escapeHtml(item.meta) + '</small>' : '') + '</a>';
        });
      });
      results.innerHTML = html;
    });

    results.addEventListener("click", function (e) {
      if (e.target.closest(".search-result-item")) close();
    });
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* =========================================================
     AI FAN ASSISTANT — rule-based search helper over local data
     (Not a live LLM: answers only from this site's own content.)
     ========================================================= */
  function initAIAssistant() {
    var fab = document.getElementById("aiFab");
    var panel = document.getElementById("aiPanel");
    var closeBtn = document.getElementById("aiClose");
    var form = document.getElementById("aiForm");
    var input = document.getElementById("aiInput");
    var messages = document.getElementById("aiMessages");
    if (!fab || !panel) return;

    function toggle(open) {
      panel.hidden = !open;
      fab.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) setTimeout(function () { input.focus(); }, 30);
    }
    fab.addEventListener("click", function () { toggle(panel.hidden); });
    closeBtn.addEventListener("click", function () { toggle(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) toggle(false); });

    function addMessage(text, who) {
      var div = document.createElement("div");
      div.className = "ai-msg ai-msg-" + who;
      div.textContent = text;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    function answer(query) {
      var q = query.toLowerCase();

      if (/award/.test(q)) {
        var names = Array.prototype.map.call(document.querySelectorAll(".award-card h3"), function (h) { return h.textContent; });
        return "Awards & honors featured on the site: " + names.join(", ") + ". See the Awards section for more.";
      }
      if (/news|latest|update/.test(q)) {
        var titles = Array.prototype.map.call(document.querySelectorAll(".news-card h3"), function (h) { return h.textContent; });
        return "Latest fan news: " + titles.slice(0, 3).join(" · ") + ". Full list in the News section.";
      }
      if (/wallpaper|poster|quote|fan art|download/.test(q)) {
        return "The Fan Zone has Wallpapers, Fan-Made Posters, Quote Cards and a Fan Art Gallery — all free for personal, non-commercial use, with share and favorite buttons.";
      }
      if (/gallery|photo|picture|image/.test(q)) {
        return "The Gallery has a filterable masonry grid (Red Carpet, Movie Stills, Candid, Fan Art) with a full-screen lightbox — tap any image or the Gallery filters to browse.";
      }
      var langMatch = q.match(/tamil|telugu|malayalam|hindi/);
      if (langMatch || /movie|film/.test(q)) {
        var lang = langMatch ? langMatch[0] : null;
        var list = MOVIES.filter(function (m) { return !lang || m.lang === lang; })
          .map(function (m) { return m.title + " (" + m.year + ")"; });
        return (lang ? capitalize(lang) + " titles: " : "Movies on the timeline: ") + list.join(", ") + ".";
      }
      if (/official|affiliat|real site/.test(q)) {
        return "No — Nayantharafanmade is an unofficial, fan-made tribute site, not affiliated with or endorsed by Nayanthara or her representatives.";
      }
      return "I can help you find movies, awards, gallery photos or fan news from this site — try asking things like \"Tamil movies\", \"awards\" or \"latest news\".";
    }

    function handleSubmit(e) {
      e.preventDefault();
      var q = input.value.trim();
      if (!q) return;
      addMessage(q, "user");
      input.value = "";
      setTimeout(function () { addMessage(answer(q), "bot"); }, 300);
    }
    form.addEventListener("submit", handleSubmit);
  }

  /* =========================================================
     COOKIE CONSENT
     ========================================================= */
  function initCookieConsent() {
    var banner = document.getElementById("cookieBanner");
    var accept = document.getElementById("cookieAccept");
    var decline = document.getElementById("cookieDecline");
    if (!banner) return;
    var choice = localStorage.getItem("nfm-cookie-consent");

    if (!choice) {
      banner.hidden = false;
    } else if (choice === "accepted") {
      loadAnalytics();
    }

    if (accept) accept.addEventListener("click", function () {
      localStorage.setItem("nfm-cookie-consent", "accepted");
      banner.hidden = true;
      loadAnalytics();
    });
    if (decline) decline.addEventListener("click", function () {
      localStorage.setItem("nfm-cookie-consent", "declined");
      banner.hidden = true;
    });
  }

  /* =========================================================
     ANALYTICS — gated behind consent; no-ops until IDs are set
     ========================================================= */
  function loadAnalytics() {
    var cfg = window.__ANALYTICS_CONFIG__ || {};
    if (cfg.GA4_MEASUREMENT_ID) {
      var s1 = document.createElement("script");
      s1.async = true;
      s1.src = "https://www.googletagmanager.com/gtag/js?id=" + cfg.GA4_MEASUREMENT_ID;
      document.head.appendChild(s1);
      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      gtag("js", new Date());
      gtag("config", cfg.GA4_MEASUREMENT_ID, { anonymize_ip: true });
      window.gtag = gtag;
    }
    if (cfg.CLARITY_PROJECT_ID) {
      (function (c, l, a, r, i, t, y) {
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
        t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
        y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
      })(window, document, "clarity", "script", cfg.CLARITY_PROJECT_ID);
    }
  }

  /* =========================================================
     FAVORITES / MY COLLECTION (localStorage)
     ========================================================= */
  var FAV_LABELS = { wallpapers: "Wallpapers", posters: "Fan-Made Posters", quotes: "Quote Cards", fanart: "Fan Art Gallery" };

  function getFavorites() {
    try { return JSON.parse(localStorage.getItem("nfm-favorites") || "[]"); } catch (e) { return []; }
  }
  function setFavorites(list) { localStorage.setItem("nfm-favorites", JSON.stringify(list)); }

  function renderCollection() {
    var listEl = document.getElementById("collectionList");
    var emptyEl = document.getElementById("collectionEmpty");
    if (!listEl) return;
    var favs = getFavorites();
    listEl.querySelectorAll("li:not(.collection-empty)").forEach(function (li) { li.remove(); });
    if (!favs.length) { if (emptyEl) emptyEl.hidden = false; return; }
    if (emptyEl) emptyEl.hidden = true;
    favs.forEach(function (id) {
      var li = document.createElement("li");
      li.innerHTML = (FAV_LABELS[id] || id) + ' <button data-remove="' + id + '" aria-label="Remove ' + (FAV_LABELS[id] || id) + '">&times;</button>';
      listEl.appendChild(li);
    });
  }

  function initFavorites() {
    document.querySelectorAll(".fav-btn").forEach(function (btn) {
      var id = btn.dataset.favId;
      var favs = getFavorites();
      if (favs.indexOf(id) !== -1) { btn.classList.add("is-active"); btn.textContent = "♥"; btn.setAttribute("aria-pressed", "true"); }
      btn.addEventListener("click", function () {
        var list = getFavorites();
        var idx = list.indexOf(id);
        if (idx === -1) {
          list.push(id); btn.classList.add("is-active"); btn.textContent = "♥"; btn.setAttribute("aria-pressed", "true");
        } else {
          list.splice(idx, 1); btn.classList.remove("is-active"); btn.textContent = "♡"; btn.setAttribute("aria-pressed", "false");
        }
        setFavorites(list);
        renderCollection();
      });
    });
    var collectionList = document.getElementById("collectionList");
    if (collectionList) {
      collectionList.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-remove]");
        if (!btn) return;
        var id = btn.dataset.remove;
        var list = getFavorites().filter(function (x) { return x !== id; });
        setFavorites(list);
        var favBtn = document.querySelector('.fav-btn[data-fav-id="' + id + '"]');
        if (favBtn) { favBtn.classList.remove("is-active"); favBtn.textContent = "♡"; favBtn.setAttribute("aria-pressed", "false"); }
        renderCollection();
      });
    }
    renderCollection();
  }

  /* =========================================================
     AMBIENT AUDIO TOGGLE (optional, muted by default, no autoplay)
     ========================================================= */
  function initAmbientAudio() {
    var btn = document.getElementById("audioToggle");
    var stateEl = document.getElementById("audioState");
    if (!btn) return;
    var audioCtx = null, oscillator = null, gainNode = null, playing = false;

    function start() {
      // Lightweight generative ambient pad using the Web Audio API —
      // avoids shipping a large licensed audio file while still giving
      // an optional cinematic background tone. Fully user-initiated (never autoplays).
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      gainNode = audioCtx.createGain();
      gainNode.gain.value = 0.04;
      gainNode.connect(audioCtx.destination);
      [110, 165, 220].forEach(function (freq) {
        var osc = audioCtx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        osc.connect(gainNode);
        osc.start();
      });
      playing = true;
    }
    function stop() {
      if (audioCtx) { audioCtx.close(); audioCtx = null; }
      playing = false;
    }

    btn.addEventListener("click", function () {
      if (playing) { stop(); } else { start(); }
      btn.setAttribute("aria-pressed", playing ? "true" : "false");
      if (stateEl) stateEl.textContent = playing ? "On" : "Off";
    });
  }

  /* =========================================================
     BUTTON RIPPLE EFFECT
     ========================================================= */
  function initRipple() {
    document.querySelectorAll(".btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        var rect = btn.getBoundingClientRect();
        var ripple = document.createElement("span");
        ripple.className = "ripple";
        ripple.style.left = (e.clientX - rect.left) + "px";
        ripple.style.top = (e.clientY - rect.top) + "px";
        btn.appendChild(ripple);
        ripple.addEventListener("animationend", function () { ripple.remove(); });
      });
    });
  }

  /* =========================================================
     SPLIT-TEXT HEADING ANIMATION (SplitType + GSAP, graceful fallback)
     ========================================================= */
  function initSplitText() {
    if (typeof window.SplitType === "undefined" || !window.gsap) return;
    document.querySelectorAll(".section-head h2").forEach(function (heading) {
      var split = new window.SplitType(heading, { types: "words" });
      gsap.fromTo(split.words, { opacity: 0, y: 24 }, {
        opacity: 1, y: 0, duration: .7, stagger: .06, ease: "power3.out",
        scrollTrigger: { trigger: heading, start: "top 88%" }
      });
    });
  }

  /* ---------------- Wire up new v3 features on load ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initCustomCursor();
    initGlobalSearch();
    initAIAssistant();
    initCookieConsent();
    initFavorites();
    initAmbientAudio();
    initRipple();
    setTimeout(initSplitText, 50);
  });
})();
