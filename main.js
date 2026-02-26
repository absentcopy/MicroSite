(() => {
  const statusLines = [
    "Brewing ideas in the background…",
    "Tuning pixels and vibes…",
    "Wandering the honeydew fields…",
    "Shipping small things often.",
  ];

  const statusLineEl = document.getElementById("statusLine");
  if (statusLineEl) {
    let i = 0;
    setInterval(() => {
      i = (i + 1) % statusLines.length;
      statusLineEl.textContent = statusLines[i];
    }, 6000);
  }

  const modeToggle = document.getElementById("modeToggle");
  if (modeToggle) {
    modeToggle.addEventListener("click", () => {
      document.body.classList.toggle("honeydew-night");
    });
  }

  const blogListEl = document.getElementById("blogList");
  const blogMetaEl = document.getElementById("blogMeta");

  if (blogListEl) {
    fetch("blog.json", { cache: "no-cache" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load blog.json");
        return res.json();
      })
      .then((posts) => {
        if (!Array.isArray(posts) || posts.length === 0) {
          blogListEl.innerHTML =
            '<p class="blog-empty">No posts yet. Edit <code>blog.json</code> to add your first entry.</p>';
          if (blogMetaEl) blogMetaEl.textContent = "0 posts · JSON powered";
          return;
        }

        posts
          .slice()
          .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
          .reverse()
          .forEach((post) => {
            const article = document.createElement("article");
            article.className = "blog-post";

            const title = document.createElement("div");
            title.className = "blog-title";
            title.textContent = post.title || "Untitled post";

            const meta = document.createElement("div");
            meta.className = "blog-meta";
            const date = post.date || "";
            const tags = Array.isArray(post.tags) ? post.tags.join(", ") : "";
            meta.textContent = [date, tags].filter(Boolean).join(" · ");

            const body = document.createElement("div");
            body.className = "blog-body";
            body.textContent =
              post.body ||
              "No body text yet. Edit this entry inside blog.json.";

            article.appendChild(title);
            article.appendChild(meta);
            article.appendChild(body);

            blogListEl.appendChild(article);
          });

        if (blogMetaEl) {
          blogMetaEl.textContent = `${posts.length} ${
            posts.length === 1 ? "post" : "posts"
          } · JSON powered`;
        }
      })
      .catch(() => {
        blogListEl.innerHTML =
          '<p class="blog-empty">Could not load <code>blog.json</code>. Make sure it exists in the same folder as <code>index.html</code>.</p>';
        if (blogMetaEl) blogMetaEl.textContent = "Error loading posts";
      });
  }
})();

