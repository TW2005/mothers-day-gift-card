(() => {
  const REQUIRED_PHOTO_COUNT = 3;

  const defaultConfig = {
    recipientName: "For Mom",
    headline: "Happy Mother's Day",
    messageLines: [
      "Thank you for everything you do.",
      "You are deeply loved every day."
    ],
    signature: "Love always",
    photos: ["", "", ""],
    palette: {
      washTop: "#ffe8dc",
      washBottom: "#f5f6df",
      washBlush: "#ffd8d7",
      ink: "#3f2b2a",
      accentSoft: "#e6af9f",
      accentGreen: "#8cb18d"
    }
  };

  const config = normalizeConfig(window.cardConfig);

  applyPalette(config.palette);
  renderTextContent(config);
  renderPhotoCollage(config.photos);
  renderFloralLayer();

  function normalizeConfig(rawConfig) {
    const safeSource = rawConfig && typeof rawConfig === "object" ? rawConfig : {};

    const messageLines = Array.isArray(safeSource.messageLines)
      ? safeSource.messageLines.filter((line) => typeof line === "string" && line.trim())
      : [];

    const photos = Array.isArray(safeSource.photos)
      ? safeSource.photos
          .filter((path) => typeof path === "string")
          .slice(0, REQUIRED_PHOTO_COUNT)
      : [];

    while (photos.length < REQUIRED_PHOTO_COUNT) {
      photos.push("");
    }

    return {
      recipientName:
        typeof safeSource.recipientName === "string" && safeSource.recipientName.trim()
          ? safeSource.recipientName.trim()
          : defaultConfig.recipientName,
      headline:
        typeof safeSource.headline === "string" && safeSource.headline.trim()
          ? safeSource.headline.trim()
          : defaultConfig.headline,
      messageLines: messageLines.length > 0 ? messageLines : defaultConfig.messageLines,
      signature:
        typeof safeSource.signature === "string" && safeSource.signature.trim()
          ? safeSource.signature.trim()
          : defaultConfig.signature,
      photos,
      palette: {
        ...defaultConfig.palette,
        ...(safeSource.palette && typeof safeSource.palette === "object"
          ? safeSource.palette
          : {})
      }
    };
  }

  function applyPalette(palette) {
    const paletteMap = {
      washTop: "--wash-top",
      washBottom: "--wash-bottom",
      washBlush: "--wash-blush",
      ink: "--ink",
      accentSoft: "--accent-soft",
      accentGreen: "--accent-green"
    };

    const root = document.documentElement;
    for (const [key, cssVariable] of Object.entries(paletteMap)) {
      const colorValue = palette[key];
      if (typeof colorValue === "string" && colorValue.trim()) {
        root.style.setProperty(cssVariable, colorValue.trim());
      }
    }
  }

  function renderTextContent(cardConfig) {
    const recipientNode = document.getElementById("recipient");
    const headlineNode = document.getElementById("headline");
    const messageNode = document.getElementById("message");
    const signatureNode = document.getElementById("signature");

    recipientNode.textContent = cardConfig.recipientName;
    headlineNode.textContent = cardConfig.headline;

    messageNode.replaceChildren(
      ...cardConfig.messageLines.map((line) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = line;
        return paragraph;
      })
    );

    signatureNode.textContent = cardConfig.signature;
  }

  function renderPhotoCollage(photoPaths) {
    const collageNode = document.getElementById("photo-collage");
    collageNode.textContent = "";

    photoPaths.forEach((path, index) => {
      const frame = document.createElement("figure");
      frame.className = `photo-frame slot-${index + 1}`;

      if (typeof path === "string" && path.trim().length > 0) {
        const image = document.createElement("img");
        image.src = path;
        image.alt = `Family photo ${index + 1}`;
        image.loading = index === 0 ? "eager" : "lazy";
        image.decoding = "async";
        image.addEventListener("error", () => {
          frame.replaceChildren(createPhotoFallback(index, path));
        });
        frame.appendChild(image);
      } else {
        frame.appendChild(createPhotoFallback(index, ""));
      }

      collageNode.appendChild(frame);
    });
  }

  function createPhotoFallback(index, originalPath) {
    const fallback = document.createElement("div");
    fallback.className = "photo-fallback";

    const title = document.createElement("strong");
    title.textContent = `Photo ${index + 1}`;

    const guidance = document.createElement("span");
    guidance.textContent = originalPath
      ? `Could not load ${originalPath}`
      : `Add an image path in card.config.js`;

    fallback.append(title, guidance);
    return fallback;
  }

  function renderFloralLayer() {
    const flowerLayer = document.getElementById("flora-layer");
    flowerLayer.textContent = "";

    const flowers = [
      { x: "6%", y: "4%", size: 96, delay: "0s", petal: "#f2ada0", center: "#f4ce81" },
      { x: "88%", y: "7%", size: 140, delay: "0.18s", petal: "#f6b7ab", center: "#f3cf83" },
      { x: "79%", y: "21%", size: 90, delay: "0.42s", petal: "#e3a1b8", center: "#f2cc79" },
      { x: "11%", y: "32%", size: 124, delay: "0.56s", petal: "#f6b3a7", center: "#f1c56f" },
      { x: "92%", y: "38%", size: 110, delay: "0.72s", petal: "#f6cab3", center: "#f0cb7c" },
      { x: "4%", y: "64%", size: 155, delay: "0.9s", petal: "#dca8be", center: "#f4d690" },
      { x: "84%", y: "71%", size: 124, delay: "1.1s", petal: "#f2ada0", center: "#f6d589" },
      { x: "15%", y: "82%", size: 118, delay: "1.28s", petal: "#f5c2ba", center: "#f2ca72" },
      { x: "50%", y: "90%", size: 142, delay: "1.46s", petal: "#e7b0c0", center: "#f4cf80" }
    ];

    flowers.forEach((flower, index) => {
      const flowerNode = document.createElement("div");
      flowerNode.className = "flower";
      flowerNode.style.left = flower.x;
      flowerNode.style.top = flower.y;
      flowerNode.style.setProperty("--size", `${flower.size}px`);
      flowerNode.style.setProperty("--delay", flower.delay);
      flowerNode.style.setProperty("--float-duration", `${12 + (index % 4) * 2.2}s`);
      flowerNode.style.setProperty("--sway-duration", `${5.5 + (index % 3) * 1.4}s`);
      flowerNode.style.setProperty("--petal", flower.petal);
      flowerNode.style.setProperty("--center", flower.center);
      flowerNode.innerHTML = flowerSvgTemplate();
      flowerLayer.appendChild(flowerNode);
    });
  }

  function flowerSvgTemplate() {
    return `
      <svg viewBox="0 0 80 80" role="presentation" aria-hidden="true" focusable="false">
        <g>
          <ellipse class="petal" cx="40" cy="14" rx="11" ry="21"></ellipse>
          <ellipse class="petal" cx="40" cy="14" rx="11" ry="21" transform="rotate(45 40 40)"></ellipse>
          <ellipse class="petal" cx="40" cy="14" rx="11" ry="21" transform="rotate(90 40 40)"></ellipse>
          <ellipse class="petal" cx="40" cy="14" rx="11" ry="21" transform="rotate(135 40 40)"></ellipse>
          <ellipse class="petal" cx="40" cy="14" rx="11" ry="21" transform="rotate(180 40 40)"></ellipse>
          <ellipse class="petal" cx="40" cy="14" rx="11" ry="21" transform="rotate(225 40 40)"></ellipse>
          <ellipse class="petal" cx="40" cy="14" rx="11" ry="21" transform="rotate(270 40 40)"></ellipse>
          <ellipse class="petal" cx="40" cy="14" rx="11" ry="21" transform="rotate(315 40 40)"></ellipse>
        </g>
        <circle class="flower-center" cx="40" cy="40" r="10"></circle>
      </svg>
    `;
  }
})();
