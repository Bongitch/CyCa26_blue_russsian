// 1) Single post: adds .is-portrait to the hero figure when the image is portrait,
//    so CSS can switch to a wrapped layout without inline scripts.
// 2) Homepage: syncs the main hero image height to match the "Latest" column height.

(function () {
    // ------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------
    function raf(fn) {
        requestAnimationFrame(function () {
            requestAnimationFrame(fn);
        });
    }

    function pxToNumber(value) {
        var n = parseFloat(value);
        return Number.isFinite(n) ? n : 0;
    }

    function debounce(fn, wait) {
        var t = null;
        return function () {
            var ctx = this;
            var args = arguments;
            clearTimeout(t);
            t = setTimeout(function () {
                fn.apply(ctx, args);
            }, wait);
        };
    }

    // ------------------------------------------------------------
    // SINGLE POST: portrait marker
    // ------------------------------------------------------------
    function markPortrait(figure, img) {
        if (!figure || !img) return;
        var isPortrait = img.naturalHeight > img.naturalWidth;
        figure.classList.toggle("is-portrait", isPortrait);
    }

    function initSinglePostPortrait() {
        var figure = document.querySelector(".single-article .article-figure");
        if (!figure) return;

        var img = figure.querySelector("img.article-hero-img");
        if (!img) return;

        if (img.complete) {
            markPortrait(figure, img);
            return;
        }

        img.addEventListener(
            "load",
            function () {
                markPortrait(figure, img);
            },
            { once: true }
        );
    }

    // ------------------------------------------------------------
    // HOMEPAGE: sync hero image height to "Latest" column
    // ------------------------------------------------------------
    function syncHomepageHeroHeight() {
        // Only makes sense on lg+ where columns are side-by-side.
        if (window.innerWidth < 992) {
            // If we previously synced, reset.
            var oldMedia = document.querySelector(".home-hero .home-feature-wide .home-feature-media.is-synced");
            if (oldMedia) {
                oldMedia.classList.remove("is-synced");
                oldMedia.style.removeProperty("--sync-h");
            }
            return;
        }

        var heroRow = document.querySelector(".home-hero");
        if (!heroRow) return;

        // Latest column = first <aside> inside home-hero (your layout has one aside there)
        var latestCol = heroRow.querySelector("aside");
        if (!latestCol) return;

        // Main hero card + media wrapper
        var card = heroRow.querySelector(".home-feature-wide");
        var media = heroRow.querySelector(".home-feature-wide .home-feature-media");
        if (!card || !media) return;

        var latestH = latestCol.getBoundingClientRect().height;
        if (!latestH || latestH < 10) return;

        // Subtract card vertical padding/borders so the IMAGE area matches latest height visually
        var cs = window.getComputedStyle(card);
        var padY = pxToNumber(cs.paddingTop) + pxToNumber(cs.paddingBottom);
        var borderY = pxToNumber(cs.borderTopWidth) + pxToNumber(cs.borderBottomWidth);

        var target = Math.round(latestH - padY - borderY);

        // Safety clamp (prevents absurdly small height)
        if (target < 240) target = 240;

        media.classList.add("is-synced");
        media.style.setProperty("--sync-h", target + "px");
    }

    function initHomepageHeroSync() {
        var heroRow = document.querySelector(".home-hero");
        if (!heroRow) return;

        var latestCol = heroRow.querySelector("aside");
        var card = heroRow.querySelector(".home-feature-wide");
        var media = heroRow.querySelector(".home-feature-wide .home-feature-media");
        if (!latestCol || !card || !media) return;

        // Initial sync after layout settles (fonts/images/bootstrap)
        raf(syncHomepageHeroHeight);

        // Re-sync on resize (debounced)
        window.addEventListener("resize", debounce(syncHomepageHeroHeight, 120));

        // Re-sync when Latest/card size changes (e.g., fonts wrap, images load, etc.)
        if ("ResizeObserver" in window) {
            var ro = new ResizeObserver(function () {
                syncHomepageHeroHeight();
            });
            ro.observe(latestCol);
            ro.observe(card);
        }
    }

    // ------------------------------------------------------------
    // Boot
    // ------------------------------------------------------------
    function init() {
        initSinglePostPortrait();
        initHomepageHeroSync();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
