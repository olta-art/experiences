import { SEPARATOR as sep, ranger, queryfetcher } from "./helpers.js";

export class Viewer extends HTMLElement {
  // Specify observed attributes so that
  // attributeChangedCallback will work
  static get observedAttributes() {
    return ["url"];
  }

  constructor(options) {
    super();

    const iframe = ranger(`
      <iframe 
        scrolling="no"
        src="" 
        allow="camera *; fullscreen *; accelerometer *; gamepad *; 
        gyroscope *; microphone *; xr-spatial-tracking *;"
        >
      </iframe>
    `);


    // <iframe 
    // style="height:700px; width:100%; overflow: hidden;" src="https://yfhwavf2ac37wdgcee5p62jp4myyk4imhpdrvarmfhawg36firrq.arweave.net/wU9gVLoAt_sMwiE6_2kv4zGFcQw7xxqCLCnBY2_FRGM/?id=1&address=0x6d24ce4c32e556313b431fb156edf2060680a998&seed=9" 
    // frameborder="0"
    // scrolling="no"
    // allowfullscreen="allowfullscreen" ></iframe>

    const style = ranger(`
    <style>
      iframe {
        transition: opacity 500ms;
        grid-area: one;
        width: calc(100% + 1em);
        height: calc(100% + 1em);
        border: none;
        /* pointer-events: none !important; */
      }
    </style>
  `);

    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(style.cloneNode(true));
    shadow.appendChild(iframe.cloneNode(true));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log('[o-viewer] attributeChangedCallback', { name, oldValue, newValue });

    if (name === "url" && newValue && oldValue !== newValue) {
      const iframe = this.shadowRoot.querySelector("iframe");
      if (iframe) {
        iframe.src = newValue;
        iframe.style.opacity = "1";
      }
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
      
      // Create a container for the QR code
      const qrContainer = document.createElement("div");
      qrContainer.classList.add("qrcode-container");
      
      // Create the QR code element
      const qrEl = document.createElement("div");
      qrEl.classList.add("qrcode");
      
      // Generate the QR code
      new QRCode(qrEl, {
        text: newValue,
        width: 128,
        height: 128,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });

      // Make the QR code clickable
      qrContainer.style.cursor = "pointer";
      qrContainer.title = "Click to visit artist website";
      qrContainer.addEventListener("click", () => {
        window.open(newValue, "_blank");
      });

      // Clear the slot and add the new QR code
      slot.innerHTML = "";
      qrContainer.appendChild(qrEl);
      slot.append(qrContainer);
    }
  }
}
