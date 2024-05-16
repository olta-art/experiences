import { SEPARATOR as sep, ranger, queryfetcher } from "./helpers.js";

export class Viewer extends HTMLElement {
  // Specify observed attributes so that
  // attributeChangedCallback will work
  static get observedAttributes() {
    return ["url"];
  }

  constructor(options) {
    super();

    console.log(options);

    const iframe = ranger(`
      <iframe 
        scrolling="no"
        src="" 
        sandbox="allow-scripts allow-same-origin" 
        allow="camera *; fullscreen *; accelerometer *; gamepad *; gyroscope *; microphone *; xr-spatial-tracking *;"
        >
      </iframe>
    `);

    const style = ranger(`
    <style>
      iframe {
        transition: opacity 500ms;
        grid-area: one;
        width: calc(100% + 1em);
        height: calc(100% + 1em);
        border: none;
      }
    </style>
  `);

    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(style.cloneNode(true));
    shadow.appendChild(iframe.cloneNode(true));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(name, newValue);

    if (name === "url" && newValue) {
      const oldIframes = this.shadowRoot.querySelectorAll("iframe");
      oldIframes.forEach((f) => (f.className = "old"));

      const template = ranger(`
        <iframe
          scrolling="no"
          src="${newValue}"
          style="opacity: 0.0;"
          class="new"
          sandbox="allow-scripts allow-same-origin"
          allow="camera *; fullscreen *; accelerometer *; gamepad *; gyroscope *; microphone *; xr-spatial-tracking *;"
        />
      `);

      this.shadowRoot.appendChild(template.cloneNode(true));

      // HACK: no way of knowing content loaded without post-message
      setTimeout(() => {
        const newIframe = this.shadowRoot.querySelector(".new");
        console.log(newIframe);
        newIframe.style = "opacity: 1;";

        setTimeout(() => {
          const oldIframes = this.shadowRoot.querySelectorAll(".old");
          oldIframes.forEach((f) => f.remove());
        }, 500);
      }, 2000);
    }
    // updateStyle(this);
  }
}

export class Details extends HTMLElement {
  // Specify observed attributes so that
  // attributeChangedCallback will work
  static get observedAttributes() {
    return ["name", "creator", "description", "qrcode"];
  }

  constructor() {
    super();

    const template = document.getElementById("o-details");

    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "name" && newValue) {
      const slot = this.shadowRoot.querySelector('slot[name="name"]');
      slot.textContent = newValue;
    }
    if (name === "creator" && newValue) {
      const slot = this.shadowRoot.querySelector('slot[name="creator"]');
      slot.textContent = newValue;
    }
    if (name === "description" && newValue) {
      const slot = this.shadowRoot.querySelector('slot[name="description"]');
      slot.textContent = newValue;
    }
    if (name === "qrcode" && newValue) {
      const slot = this.shadowRoot.querySelector('slot[name="qrcode"]');
      const qrEl = document.createElement("div");
      qrEl.classList.add("qrcode");
      new QRCode(qrEl, {
        text: newValue,
        width: 128,
        height: 128,
      });

      slot.innerHTML = "";
      slot.append(qrEl);
    }
  }
}
