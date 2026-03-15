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
    access: {
      enabled: false,
      code: "",
      title: "Private Mother's Day Card",
      description: "Enter the passcode to open this card.",
      buttonLabel: "Open Card",
      errorText: "That passcode is not correct. Please try again."
    },
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

  const showCard = () => {
    applyPalette(config.palette);
    renderTextContent(config);
    renderFloralLayer();
  };

  if (config.access.enabled && config.access.code) {
    lockCard();
    renderAccessGate(config.access, () => {
      unlockCard();
      showCard();
    });
  } else {
    showCard();
  }

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

    const sourceAccess =
      safeSource.access && typeof safeSource.access === "object" ? safeSource.access : {};

    while (photos.length < REQUIRED_PHOTO_COUNT) {
      photos.push("");
    }

    const enabled =
      typeof sourceAccess.enabled === "boolean"
        ? sourceAccess.enabled
        : defaultConfig.access.enabled;

    const code =
      typeof sourceAccess.code === "string" && sourceAccess.code.trim()
        ? sourceAccess.code.trim()
        : defaultConfig.access.code;

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
      access: {
        enabled,
        code,
        title:
          typeof sourceAccess.title === "string" && sourceAccess.title.trim()
            ? sourceAccess.title.trim()
            : defaultConfig.access.title,
        description:
          typeof sourceAccess.description === "string" && sourceAccess.description.trim()
            ? sourceAccess.description.trim()
            : defaultConfig.access.description,
        buttonLabel:
          typeof sourceAccess.buttonLabel === "string" && sourceAccess.buttonLabel.trim()
            ? sourceAccess.buttonLabel.trim()
            : defaultConfig.access.buttonLabel,
        errorText:
          typeof sourceAccess.errorText === "string" && sourceAccess.errorText.trim()
            ? sourceAccess.errorText.trim()
            : defaultConfig.access.errorText
      },
      palette: {
        ...defaultConfig.palette,
        ...(safeSource.palette && typeof safeSource.palette === "object"
          ? safeSource.palette
          : {})
      }
    };
  }

  function lockCard() {
    document.body.classList.add("locked");
  }

  function unlockCard() {
    document.body.classList.remove("locked");
  }

  function renderAccessGate(accessConfig, onUnlock) {
    const gate = document.createElement("section");
    gate.className = "access-gate";
    gate.setAttribute("role", "dialog");
    gate.setAttribute("aria-modal", "true");
    gate.setAttribute("aria-label", "Card passcode prompt");

    const panel = document.createElement("div");
    panel.className = "access-panel";

    const title = document.createElement("h2");
    title.className = "access-title";
    title.textContent = accessConfig.title;

    const description = document.createElement("p");
    description.className = "access-description";
    description.textContent = accessConfig.description;

    const form = document.createElement("form");
    form.className = "access-form";

    const label = document.createElement("label");
    label.className = "sr-only";
    label.setAttribute("for", "access-code-input");
    label.textContent = "Passcode";

    const input = document.createElement("input");
    input.id = "access-code-input";
    input.className = "access-input";
    input.type = "password";
    input.placeholder = "Enter passcode";
    input.autocomplete = "off";
    input.required = true;

    const button = document.createElement("button");
    button.className = "access-button";
    button.type = "submit";
    button.textContent = accessConfig.buttonLabel;

    const error = document.createElement("p");
    error.className = "access-error";
    error.setAttribute("aria-live", "polite");

    form.append(label, input, button, error);
    panel.append(title, description, form);
    gate.appendChild(panel);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const enteredCode = input.value.trim();

      if (normalizeCode(enteredCode) === normalizeCode(accessConfig.code)) {
        gate.remove();
        onUnlock();
        return;
      }

      error.textContent = accessConfig.errorText;
      input.value = "";
      input.focus();
    });

    document.body.appendChild(gate);
    window.requestAnimationFrame(() => {
      input.focus();
    });
  }

  function normalizeCode(code) {
    return String(code || "")
      .trim()
      .toLowerCase();
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
    const headerNode = document.querySelector(".card-header");
    const footerNode = document.querySelector(".card-footer");
    const recipientNode = document.getElementById("recipient");
    const headlineNode = document.getElementById("headline");
    const messageNode = document.getElementById("message");
    const signatureNode = document.getElementById("signature");

    setOptionalText(recipientNode, cardConfig.recipientName);
    setOptionalText(headlineNode, cardConfig.headline);

    messageNode.replaceChildren(
      ...cardConfig.messageLines.map((line) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = line;
        return paragraph;
      })
    );

    setOptionalText(signatureNode, cardConfig.signature);

    headerNode.hidden = !cardConfig.recipientName && !cardConfig.headline;
    footerNode.hidden = !cardConfig.signature;
  }

  function setOptionalText(node, value) {
    const trimmedValue = typeof value === "string" ? value.trim() : "";
    node.textContent = trimmedValue;
    node.hidden = !trimmedValue;
  }

  function renderPhotoCollage(photoPaths) {
    const collageNode = document.getElementById("photo-collage");
    collageNode.textContent = "";

    photoPaths.forEach((path, index) => {
      const frame = document.createElement("figure");
      frame.className = `photo-frame slot-${index + 1}`;

      if (typeof path === "string" && path.trim().length > 0) {
        const image = document.createElement("img");
        image.addEventListener("error", () => {
          frame.replaceChildren(createPhotoFallback(index, path));
        });
        image.alt = `Family photo ${index + 1}`;
        image.loading = index === 0 ? "eager" : "lazy";
        image.decoding = "async";
        image.src = path;
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

    // Arranged as a soft border frame — corners + edges, not random scatter
    const flowers = [
      // Top-left cluster
      { x: "1%",  y: "1%",  size: 112, delay: "0s",    petal: "#f5b8a8", center: "#f6d07e", type: 0 },
      { x: "8%",  y: "6%",  size: 78,  delay: "0.22s", petal: "#dba8c2", center: "#f4cc80", type: 1 },
      // Top-right cluster
      { x: "84%", y: "1%",  size: 130, delay: "0.18s", petal: "#f0b5c4", center: "#f3cf88", type: 0 },
      { x: "92%", y: "10%", size: 84,  delay: "0.4s",  petal: "#f5c3a8", center: "#f5d07a", type: 1 },
      // Left edge
      { x: "0%",  y: "38%", size: 100, delay: "0.6s",  petal: "#e8a8bb", center: "#f4d28c", type: 1 },
      { x: "2%",  y: "58%", size: 88,  delay: "0.8s",  petal: "#f5b4a4", center: "#f6cf7c", type: 0 },
      // Right edge
      { x: "90%", y: "36%", size: 96,  delay: "0.5s",  petal: "#f2c4b2", center: "#f4d488", type: 0 },
      { x: "88%", y: "60%", size: 108, delay: "0.75s", petal: "#dcaac0", center: "#f5d890", type: 1 },
      // Bottom cluster
      { x: "3%",  y: "80%", size: 118, delay: "1.0s",  petal: "#f5b8c4", center: "#f4d07e", type: 0 },
      { x: "80%", y: "82%", size: 104, delay: "1.15s", petal: "#f0b0a4", center: "#f6d488", type: 1 },
      { x: "44%", y: "88%", size: 90,  delay: "1.3s",  petal: "#e8aec0", center: "#f5cf84", type: 0 },
    ];

    flowers.forEach((flower, index) => {
      const flowerNode = document.createElement("div");
      flowerNode.className = "flower";
      flowerNode.style.left = flower.x;
      flowerNode.style.top = flower.y;
      flowerNode.style.setProperty("--size", `${flower.size}px`);
      flowerNode.style.setProperty("--delay", flower.delay);
      flowerNode.style.setProperty("--float-duration", `${11 + (index % 5) * 1.8}s`);
      flowerNode.style.setProperty("--sway-duration", `${6 + (index % 4) * 1.2}s`);
      flowerNode.innerHTML = flowerSvgTemplate(flower.petal, flower.center, flower.type);
      flowerLayer.appendChild(flowerNode);
    });
  }

  function flowerSvgTemplate(petal, center, type) {
    if (type === 1) {
      // Soft round flower with pointed petals (like a daisy/cosmos)
      return `
        <svg viewBox="0 0 100 100" role="presentation" aria-hidden="true" focusable="false">
          <filter id="soft">
            <feGaussianBlur stdDeviation="0.6" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
          <g transform="translate(50,52)" filter="url(#soft)">
            <path d="M0,0 C-8,-10 -8,-30 0,-38 C8,-30 8,-10 0,0Z" fill="${petal}" fill-opacity="0.82" transform="rotate(0)"/>
            <path d="M0,0 C-8,-10 -8,-30 0,-38 C8,-30 8,-10 0,0Z" fill="${petal}" fill-opacity="0.76" transform="rotate(36)"/>
            <path d="M0,0 C-8,-10 -8,-30 0,-38 C8,-30 8,-10 0,0Z" fill="${petal}" fill-opacity="0.84" transform="rotate(72)"/>
            <path d="M0,0 C-8,-10 -8,-30 0,-38 C8,-30 8,-10 0,0Z" fill="${petal}" fill-opacity="0.78" transform="rotate(108)"/>
            <path d="M0,0 C-8,-10 -8,-30 0,-38 C8,-30 8,-10 0,0Z" fill="${petal}" fill-opacity="0.82" transform="rotate(144)"/>
            <path d="M0,0 C-8,-10 -8,-30 0,-38 C8,-30 8,-10 0,0Z" fill="${petal}" fill-opacity="0.80" transform="rotate(180)"/>
            <path d="M0,0 C-8,-10 -8,-30 0,-38 C8,-30 8,-10 0,0Z" fill="${petal}" fill-opacity="0.74" transform="rotate(216)"/>
            <path d="M0,0 C-8,-10 -8,-30 0,-38 C8,-30 8,-10 0,0Z" fill="${petal}" fill-opacity="0.84" transform="rotate(252)"/>
            <path d="M0,0 C-8,-10 -8,-30 0,-38 C8,-30 8,-10 0,0Z" fill="${petal}" fill-opacity="0.80" transform="rotate(288)"/>
            <path d="M0,0 C-8,-10 -8,-30 0,-38 C8,-30 8,-10 0,0Z" fill="${petal}" fill-opacity="0.76" transform="rotate(324)"/>
          </g>
          <circle cx="50" cy="52" r="11" fill="${center}" opacity="0.95"/>
          <circle cx="50" cy="52" r="6" fill="#fff9e8" opacity="0.55"/>
        </svg>
      `;
    }
    // Rounder, fuller flower (like a peony/ranunculus)
    return `
      <svg viewBox="0 0 100 100" role="presentation" aria-hidden="true" focusable="false">
        <g transform="translate(50,52)">
          <ellipse rx="10" ry="28" fill="${petal}" fill-opacity="0.70" transform="rotate(0) translate(0,-14)"/>
          <ellipse rx="10" ry="28" fill="${petal}" fill-opacity="0.68" transform="rotate(45) translate(0,-14)"/>
          <ellipse rx="10" ry="28" fill="${petal}" fill-opacity="0.72" transform="rotate(90) translate(0,-14)"/>
          <ellipse rx="10" ry="28" fill="${petal}" fill-opacity="0.68" transform="rotate(135) translate(0,-14)"/>
          <ellipse rx="10" ry="28" fill="${petal}" fill-opacity="0.70" transform="rotate(180) translate(0,-14)"/>
          <ellipse rx="10" ry="28" fill="${petal}" fill-opacity="0.66" transform="rotate(225) translate(0,-14)"/>
          <ellipse rx="10" ry="28" fill="${petal}" fill-opacity="0.72" transform="rotate(270) translate(0,-14)"/>
          <ellipse rx="10" ry="28" fill="${petal}" fill-opacity="0.68" transform="rotate(315) translate(0,-14)"/>
          <ellipse rx="7" ry="18" fill="${petal}" fill-opacity="0.88" transform="rotate(22) translate(0,-10)"/>
          <ellipse rx="7" ry="18" fill="${petal}" fill-opacity="0.88" transform="rotate(112) translate(0,-10)"/>
          <ellipse rx="7" ry="18" fill="${petal}" fill-opacity="0.88" transform="rotate(202) translate(0,-10)"/>
          <ellipse rx="7" ry="18" fill="${petal}" fill-opacity="0.88" transform="rotate(292) translate(0,-10)"/>
        </g>
        <circle cx="50" cy="52" r="12" fill="${center}" opacity="0.95"/>
        <circle cx="50" cy="52" r="6.5" fill="#fff8e0" opacity="0.5"/>
      </svg>
    `;
  }
})();
