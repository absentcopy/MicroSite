(() => {
  const statusLineEl = document.getElementById("statusLine");
  if (statusLineEl) {
    const fallbackLines = [
      {
        title: "This site is a sandbox. Expect broken things, strange experiments, and the occasional delightful bug.",
        url: "",
      },
      {
        title: "Internet mood: gently chaotic, frequently confusing, occasionally wonderful.",
        url: "",
      },
    ];

    const headlines = [];
    let index = 0;

    function truncate(text, max) {
      if (!text) return "";
      if (text.length <= max) return text;
      return text.slice(0, max - 1).trimEnd() + "…";
    }

    function renderLine() {
      const pool = headlines.length ? headlines : fallbackLines;
      if (!pool.length) return;
      const item = pool[index % pool.length];
      index += 1;

      const text = truncate(item.title || "", 110);
      if (!item.url) {
        statusLineEl.textContent = text;
      } else {
        const safeHref = item.url;
        statusLineEl.innerHTML = `<a href="${safeHref}" target="_blank" rel="noopener noreferrer" class="link-pink">${text}</a>`;
      }
    }

    async function fetchHeadlines() {
      try {
        const res = await fetch(
          "https://www.reddit.com/r/collapse/.json?limit=25",
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("Bad response");
        const data = await res.json();
        const children =
          data && data.data && Array.isArray(data.data.children)
            ? data.data.children
            : [];

        const items = children
          .map((c) => c && c.data)
          .filter(Boolean)
          .filter((d) => !d.stickied && !d.locked && !d.over_18)
          .map((d) => {
            const title = d.title || "";
            const permalink = d.permalink || "";
            const url = permalink
              ? `https://www.reddit.com${permalink}`
              : "https://www.reddit.com/r/collapse/";
            return { title, url };
          })
          .filter((h) => h.title);

        headlines.length = 0;
        items.slice(0, 10).forEach((h) => {
          headlines.push(h);
        });
      } catch {
        // fall back to local lines
      }
    }

    renderLine();
    fetchHeadlines();
    setInterval(renderLine, 9000);
    setInterval(fetchHeadlines, 5 * 60 * 1000);
  }

  const modeToggle = document.getElementById("modeToggle");
  if (modeToggle) {
    modeToggle.addEventListener("click", () => {
      document.body.classList.toggle("controls-open");
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

  const heroRoot = document.getElementById("hero3dRoot");

  if (heroRoot && window.THREE) {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      heroRoot.clientWidth / Math.max(heroRoot.clientHeight, 1),
      0.1,
      100
    );
    camera.position.z = 3.2;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(heroRoot.clientWidth, Math.max(heroRoot.clientHeight, 1));
    heroRoot.appendChild(renderer.domElement);
    renderer.domElement.style.filter = "blur(1.1px)";

    const group = new THREE.Group();
    scene.add(group);

    const baseGeometry = new THREE.IcosahedronGeometry(0.22, 0);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0xdde2df,
      roughness: 0.4,
      metalness: 0.45,
      flatShading: true,
    });

    const solids = [];
    const velocities = [];
    let speedMultiplier = 1;
    const defaultCount = 90;

    function rebuildSolids(count) {
      while (group.children.length) {
        group.remove(group.children[0]);
      }
      solids.length = 0;
      velocities.length = 0;

      const clamped = Math.max(10, Math.min(count, 200));

      for (let i = 0; i < clamped; i += 1) {
        const mesh = new THREE.Mesh(baseGeometry, baseMaterial.clone());
        mesh.position.set(
          (Math.random() - 0.5) * 4,
          2.5 + Math.random() * 2.5,
          (Math.random() - 0.5) * 4
        );
        const s = 0.7 + Math.random() * 0.6;
        mesh.scale.set(s, s, s);
        group.add(mesh);
        solids.push(mesh);

        velocities.push({
          x: (Math.random() - 0.5) * 0.01,
          y: -0.01 - Math.random() * 0.015,
          z: (Math.random() - 0.5) * 0.01,
        });
      }

      const label = document.getElementById("ballCountLabel");
      if (label) label.textContent = String(clamped);
    }

    rebuildSolids(defaultCount);

    group.rotation.set(-0.6, 0.7, 0.1);

    const keyLight = new THREE.PointLight(0xffffff, 1.4);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xffd3e6, 0.9);
    rimLight.position.set(-4, -3, -2);
    scene.add(rimLight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff4df, 1.1);
    sun.position.set(-2.5, 5.0, 3.0);
    scene.add(sun);

    let pointerX = 0;
    let pointerY = 0;

    function updatePointer(e) {
      const rect = heroRoot.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      pointerX = (x - 0.5) * 2;
      pointerY = (y - 0.5) * 2;
    }

    window.addEventListener("pointermove", updatePointer);

    function handleResize() {
      const w = heroRoot.clientWidth || 1;
      const h = heroRoot.clientHeight || 1;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    window.addEventListener("resize", handleResize);

    let rotationBase = 0;

    function animate() {
      requestAnimationFrame(animate);

      rotationBase += 0.0006 * speedMultiplier;
      group.rotation.y += 0.0004 * speedMultiplier;

      const cursorWorldX = pointerX * 1.5;
      const cursorWorldY = -pointerY * 1.2;

      for (let i = 0; i < solids.length; i += 1) {
        const mesh = solids[i];
        const vel = velocities[i];

        mesh.position.x += vel.x * speedMultiplier;
        mesh.position.y += vel.y * speedMultiplier;
        mesh.position.z += vel.z * speedMultiplier;

        const dx = mesh.position.x - cursorWorldX;
        const dy = mesh.position.y - cursorWorldY;
        const distSq = dx * dx + dy * dy;
        const range = 0.9;
        if (distSq < range * range) {
          const dist = Math.sqrt(distSq) || 0.0001;
          const strength = ((range - dist) / range) * 0.06;
          mesh.position.x += (dx / dist) * strength;
          mesh.position.y += (dy / dist) * strength;
        }

        if (mesh.position.y < -3.2) {
          mesh.position.y = 3.5 + Math.random() * 2.0;
          mesh.position.x = (Math.random() - 0.5) * 4;
          mesh.position.z = (Math.random() - 0.5) * 4;
        }

        mesh.rotation.x += (0.002 + vel.y * -0.4) * speedMultiplier;
        mesh.rotation.y += (0.002 + vel.x * 8) * speedMultiplier;
      }

      renderer.render(scene, camera);
    }

    handleResize();
    animate();

    const ballSlider = document.getElementById("ballCountControl");
    if (ballSlider) {
      ballSlider.value = String(defaultCount);
      ballSlider.addEventListener("input", (e) => {
        const target = e.target;
        const value = parseInt(target.value, 10);
        rebuildSolids(Number.isNaN(value) ? defaultCount : value);
      });
    }

    const speedSlider = document.getElementById("speedControl");
    if (speedSlider) {
      speedSlider.addEventListener("input", (e) => {
        const target = e.target;
        const v = parseInt(target.value, 10);
        const normalized = Number.isNaN(v) ? 100 : Math.max(30, Math.min(v, 170));
        const t = (normalized - 30) / (170 - 30);
        speedMultiplier = 0.35 + t * 1.65;
        const label = document.getElementById("speedLabel");
        if (label) label.textContent = `${speedMultiplier.toFixed(1)}×`;

        const blurMin = 0.4;
        const blurMax = 2.2;
        const blur = blurMin + (blurMax - blurMin) * t;
        renderer.domElement.style.filter = `blur(${blur.toFixed(2)}px)`;
      });
    }
  }

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("honeydew-night");
    });
  }
})();

