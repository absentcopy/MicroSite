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

    const geometry = new THREE.IcosahedronGeometry(1.2, 0);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff6fa8,
      emissive: 0x442233,
      roughness: 0.2,
      metalness: 0.4,
      flatShading: true,
    });

    const solid = new THREE.Mesh(geometry, material);
    scene.add(solid);

    const keyLight = new THREE.PointLight(0xffffff, 1.3);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xffd3e6, 0.7);
    rimLight.position.set(-4, -3, -2);
    scene.add(rimLight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

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

      rotationBase += 0.01;

      solid.rotation.x = rotationBase + pointerY * 0.4;
      solid.rotation.y = rotationBase * 1.4 + pointerX * 0.6;

      solid.position.x = pointerX * 0.45;
      solid.position.y = -pointerY * 0.35;

      renderer.render(scene, camera);
    }

    handleResize();
    animate();
  }
})();

