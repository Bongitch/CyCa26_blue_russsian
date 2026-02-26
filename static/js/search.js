document.addEventListener("DOMContentLoaded", () => {
    let index = [];
    let indexLoaded = false;
    let indexError = false;

    const basePath =
        document.querySelector('meta[name="hugo-baseurl"]')?.getAttribute("content") || "/";

    // Ensure trailing slash
    const base = basePath.endsWith("/") ? basePath : basePath + "/";

    // Cache-bust index.json using the build stamp from baseof.html: <body data-build="...">
    const buildStamp =
        document.body?.dataset?.build || String(Date.now());

    const indexUrlObj = new URL(base + "index.json", window.location.origin);
    indexUrlObj.searchParams.set("v", buildStamp);
    const indexUrl = indexUrlObj.toString();

    const toArr = (v) => (Array.isArray(v) ? v : v ? [v] : []);
    const lc = (v) => String(v ?? "").toLowerCase();

    function countOccurrences(haystack, needle) {
        if (!needle) return 0;
        let count = 0;
        let pos = 0;
        while (true) {
            const idx = haystack.indexOf(needle, pos);
            if (idx === -1) break;
            count++;
            pos = idx + needle.length;
        }
        return count;
    }

    function scorePost(post, query) {
        const title = lc(post.title);
        const body = lc(post.body);
        const tagsArr = toArr(post.tags).map(lc);

        let score = 0;

        // Title scoring
        if (title === query) score += 100;
        else if (title.startsWith(query)) score += 70;
        else if (title.includes(query)) score += 50;

        // Tag scoring
        if (tagsArr.some((t) => t === query)) score += 35;
        else if (tagsArr.some((t) => t.includes(query))) score += 20;

        // Body scoring
        if (body.includes(query)) {
            score += 10;
            // small bonus for repeated occurrences (capped)
            score += Math.min(10, countOccurrences(body, query));
        }

        return score;
    }

    function scoreAuthor(author, query, postCount) {
        const name = lc(author.name);
        const desc = lc(author.description);

        let score = 0;

        if (name === query) score += 100;
        else if (name.startsWith(query)) score += 70;
        else if (name.includes(query)) score += 50;

        if (desc.includes(query)) {
            score += 10;
            score += Math.min(5, countOccurrences(desc, query));
        }

        // Small bonus so active authors appear slightly higher when relevance is similar
        score += Math.min(20, postCount);

        return score;
    }

    const renderPost = (post) => {
        const tags = toArr(post.tags);
        const dateStr = post.date ? new Date(post.date).toLocaleDateString("en-US") : "";
        return `
      <div class="col-md-12">
        <div class="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative">
          ${
            post.image
                ? `<div class="col-md-3">
                   <img src="${post.image}" alt="${post.title ?? ""}" class="img-fluid">
                 </div>`
                : ""
        }
          <div class="col-md-9 d-flex flex-column justify-content-center p-3">
            <strong class="d-inline-block mb-2 text-truncate">${tags.join(" | ")}</strong>
            <h3 class="mb-0">
              <a class="icon-link gap-1 icon-link-hover stretched-link" href="${post.permalink}">${post.title ?? ""}</a>
            </h3>
            <p class="mt-2 text-body-secondary">${dateStr}</p>
            <p class="post-description-truncation">${post.body ?? ""}</p>
          </div>
        </div>
      </div>
    `;
    };

    const renderAuthor = (author, postCount) => {
        return `
      <div class="col-md-6 mb-4">
        <div class="row g-0 border rounded overflow-hidden flex-md-row shadow-sm h-md-250 position-relative">
          <div class="col-md-4 d-flex align-items-center justify-content-center p-3 author-image-container">
            ${
            author.avatar
                ? `<img src="${author.avatar}" alt="${author.name ?? ""}" class="img-fluid">`
                : `<div class="avatar"><div class="user-icon"><span></span></div></div>`
        }
          </div>
          <div class="col-md-8 d-flex flex-column justify-content-center p-4">
            <h3 class="mb-0">
              <a class="icon-link gap-1 icon-link-hover stretched-link" href="${author.permalink}">${author.name ?? ""}</a>
            </h3>
            <strong class="mt-1">počet příspěvků: ${postCount}</strong>
            <p class="post-description-truncation">${author.description ?? ""}</p>
          </div>
        </div>
      </div>
    `;
    };

    function runSearch(inputEl) {
        const role = inputEl.dataset.role;
        const query = lc(inputEl.value).trim();

        // TAGS: filters already-rendered badges on /tags/
        if (role === "search-tag") {
            const tagContainer = document.getElementById("tag-container");
            const resultsElement = document.getElementById("tag-search-results");
            if (!tagContainer || !resultsElement) return;

            if (!query) {
                tagContainer.style.display = "block";
                resultsElement.innerHTML = "";
                return;
            }

            // Hide the full list, show filtered badges in the results element
            tagContainer.style.display = "none";

            const allBadges = Array.from(tagContainer.querySelectorAll("a"));
            const matches = allBadges.filter((a) => lc(a.textContent).includes(query));

            resultsElement.innerHTML = matches.length
                ? matches.map((a) => a.outerHTML).join(" ")
                : `<span class="text-muted">No results.</span>`;

            return;
        }

        // POSTS
        if (role === "search-post") {
            const postContainer = document.getElementById("post-container");
            const resultsElement = document.getElementById("search-results");
            if (!postContainer || !resultsElement) return;

            if (!query) {
                postContainer.style.display = "block";
                resultsElement.innerHTML = "";
                return;
            }

            postContainer.style.display = "none";

            if (indexError) {
                resultsElement.innerHTML = `<p class="text-danger">Failed to load search index.</p>`;
                return;
            }
            if (!indexLoaded) {
                resultsElement.innerHTML = `<p class="text-muted">Loading search index...</p>`;
                return;
            }

            const postResults = index
                .filter((item) => item.type === "post")
                .map((post) => {
                    const title = lc(post.title);
                    const body = lc(post.body);
                    const tags = toArr(post.tags).map(lc).join(" ");

                    const matches =
                        title.includes(query) || body.includes(query) || tags.includes(query);

                    if (!matches) return null;

                    const score = scorePost(post, query);
                    return { post, score };
                })
                .filter(Boolean)
                .sort((a, b) => b.score - a.score)
                .map((x) => x.post);

            resultsElement.innerHTML = postResults.length
                ? postResults.map(renderPost).join("")
                : `<p class="text-muted">No results.</p>`;

            return;
        }

        // AUTHORS
        if (role === "search-author") {
            const authorContainer = document.getElementById("author-container");
            const resultsElement = document.getElementById("author-search-results");
            if (!authorContainer || !resultsElement) return;

            if (!query) {
                authorContainer.style.display = "block";
                resultsElement.innerHTML = "";
                return;
            }

            authorContainer.style.display = "none";

            if (indexError) {
                resultsElement.innerHTML = `<p class="text-danger">Failed to load search index.</p>`;
                return;
            }
            if (!indexLoaded) {
                resultsElement.innerHTML = `<p class="text-muted">Loading search index...</p>`;
                return;
            }

            // Count posts per author (case-insensitive)
            const authorPostCounts = index.reduce((acc, item) => {
                if (item.type !== "post") return acc;
                toArr(item.authors).forEach((a) => {
                    const key = lc(a);
                    acc[key] = (acc[key] || 0) + 1;
                });
                return acc;
            }, {});

            const authorResultsHtml = index
                .filter((item) => item.type === "author")
                .map((author) => {
                    const postCount = authorPostCounts[lc(author.name)] || 0;

                    const name = lc(author.name);
                    const desc = lc(author.description);

                    const matches = name.includes(query) || desc.includes(query);
                    if (!matches || postCount === 0) return null;

                    const score = scoreAuthor(author, query, postCount);
                    return { author, score, postCount };
                })
                .filter(Boolean)
                .sort((a, b) => b.score - a.score)
                .map((x) => renderAuthor(x.author, x.postCount))
                .join("");

            resultsElement.innerHTML =
                authorResultsHtml || `<p class="text-muted">No results.</p>`;
            return;
        }

        console.error("Unhandled search role:", role);
    }

    // Attach listeners
    const inputs = Array.from(document.querySelectorAll("[data-role]"));
    inputs.forEach((el) => el.addEventListener("input", () => runSearch(el)));

    // Load index and then refresh searches (so you don't get stuck on "Loading...")
    fetch(indexUrl, { cache: "no-store" })
        .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status} while loading ${indexUrl}`);
            return res.json();
        })
        .then((data) => {
            index = Array.isArray(data) ? data : [];
            indexLoaded = true;

            // Re-run searches if user already typed something
            inputs.forEach((el) => {
                if (lc(el.value).trim()) runSearch(el);
            });
        })
        .catch((err) => {
            console.error("Error loading index.json:", err);
            indexLoaded = false;
            indexError = true;

            // If user already typed, show an error instead of "Loading..."
            inputs.forEach((el) => {
                if (lc(el.value).trim()) runSearch(el);
            });
        });
});
