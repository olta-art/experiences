import { Details, Viewer } from "./o.js";
import { getProjects } from "./querys.js";
import { queryfetcher, SEPARATOR as sep, decode } from "./helpers.js";

const staticArtworks = [
  {
    id: "static-4",
    name: "Shadows Touch Accross Time",
    description: "Motion interactive",
    creator: { profile: { name: "Epok.Tech" } },
    editionSize: 1,
    symbol: "STATIC1",
    lastAddedVersion: {
      animation: { url: "https://epok.tech/shadows-touch-across-time-demo/" }
    },
    qrCodeUrl: "https://yourdomain.com/qr/artwork1"
  },

  {
    id: "static-1",
    name: "Optical Verlet",
    description: "Motion interactive.",
    creator: { profile: { name: "XVI_JOJO" } },
    editionSize: 1,
    symbol: "STATIC1",
    lastAddedVersion: {
      animation: { url: "https://a7frsrbb25jdkt6rkwxhj6y44eh3rzyiffo6ait3kypjm7fqh5lq.arweave.net/B8sZRCHXUjVP0VWudPsc4Q-45wgpXeAie1YelnywP1c/" }
    },
    qrCodeUrl: "https://yourdomain.com/qr/artwork1"
  },

  {
    id: "static-3",
    name: "Dissolvi",
    description: "Motion interactive.",
    creator: { profile: { name: "Omar Lobato" } },
    editionSize: 1,
    symbol: "STATIC1",
    lastAddedVersion: {
      animation: { url: "https://dissolvi-olta.vercel.app/" }
    },
    qrCodeUrl: "https://yourdomain.com/qr/artwork1"
  }
  

  
  // Optical Verlet - Artwork 
  // https://a7frsrbb25jdkt6rkwxhj6y44eh3rzyiffo6ait3kypjm7fqh5lq.arweave.net/B8sZRCHXUjVP0VWudPsc4Q-45wgpXeAie1YelnywP1c/

  // Peer into the Flow - Artwork 
  // https://yfhwavf2ac37wdgcee5p62jp4myyk4imhpdrvarmfhawg36firrq.arweave.net/wU9gVLoAt_sMwiE6_2kv4zGFcQw7xxqCLCnBY2_FRGM/?id=1&address=0x6d24ce4c32e556313b431fb156edf2060680a998&seed=9
  
  // Shadows Touch Accross Time
  // https://epok.tech/shadows-touch-across-time-demo/
  
  // Add more static artworks as needed
];

if ("customElements" in window) {
  customElements.define("o-viewer", Viewer);
  customElements.define("o-details", Details);
}

let projects = [];

let seed = 1;
let current = 0;

let projectInterval;
let editionInterval;

const options = {
  projects: [],
  timing: {
    project: 45,
    edition: 45,
  },
  display: {
    name: true,
    creator: true,
    description: false,
    qr: true,
  },
};

// viewer
const viewer = document.createElement("o-viewer");
viewer.setAttribute("url", "");
viewer.classList = "o-viewer";
document.body.appendChild(viewer);

// details
const details = document.createElement("o-details");
details.classList = "o-details";
document.body.appendChild(details);

// previous button
const previous = document.querySelector(".previous");
previous.addEventListener("click", () => {
  current = decrementLoop(current, options.projects.length);
  
  // For artworks with multiple editions, keep random option available
  // but don't auto-randomize - let user control this
  if (currentProject().editionSize > 1) {
    // Note: We removed the random button, so this is just for reference
    // You could add a different control here if needed
  }

  viewer.setAttribute("url", getUrl());
  previous.classList = "previous spin";
  disableButtons();
  setCurrentProjectIdGlobal();
});

// change button
const change = document.querySelector(".change");
change.addEventListener("click", () => {
  current = incrementLoop(current, options.projects.length);
  
  // Google Analytics event for testing
  if (typeof gtag === 'function') {
    gtag('event', 'next_project_clicked', {
      'event_category': 'engagement',
      'event_label': 'Next Project Button'
    });
  }

  // Note: Random edition functionality removed - users can use Previous/Next buttons
  // to navigate through projects manually

  viewer.setAttribute("url", getUrl());
  change.classList = "change spin";
  disableButtons();
  setCurrentProjectIdGlobal();
});

const optionsEl = document.querySelector("dialog.options");
const optionsForm = optionsEl.querySelector("#options-form");
const closeButton = optionsEl.querySelector("button.close");
closeButton.addEventListener("click", () => optionsEl.close());
document.addEventListener("keyup", ({ key }) => {
  if (key.toLowerCase() === "o") {
    optionsEl.hasAttribute("open") ? optionsEl.close() : optionsEl.showModal();
  }
});

optionsForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);

  // Display the key/value pairs
  for (const [k, v] of f.entries()) {
    console.log(`${k}, ${v}`);
  }
});

optionsForm.addEventListener("change", (e) => {
  console.log(
    e.target.value,
    e.target.checked,
    e.target.name,
    e.target.closest("fieldset").name
  );
  const field = e.target.closest("fieldset").name;
  const name = e.target.name;
  const v = e.target.value == "on" ? e.target.checked : e.target.value;

  switch (field) {
    case "projects":
      const i = options.projects.findIndex((p) => p == name);
      if (i == -1 && v) {
        options.projects.push(name);
      } else if ((i == 0 || i) && !v) {
        options.projects.splice(i, 1);
      }
      break;

    case "timing":
      options.timing[name] = parseInt(v);
      // update
      if (name == "project") {
        updateProjectInterval(v);
      }

      if (name == "edition") {
        updateEditionInterval(v);
      }

      break;

    case "display":
      options.display[name] = v;
      // update
      const el = details.shadowRoot.querySelector(`slot[name="${name}"]`);
      v ? el.removeAttribute("hidden") : el.setAttribute("hidden", true);
      break;

    default:
      break;
  }
});

function renderOptions() {
  let projectOptions = [];
  for (const p of projects) {
    projectOptions.push(`
      <div>
        <input name="${p.id}" type="checkbox" id="${p.id}" checked>
        <label for="${p.id}">${p.name} | ${p.creator.profile.name}</label>
      </div>
    `);
  }

  optionsForm.innerHTML = `
    <fieldset name="projects">
      <legend>Projects</legend>
      ${projectOptions.join("") ?? ""}
    </fieldset>

    <fieldset name="timing">
    <legend>Timing</legend>
      <div>
        <label for="project-time">Project Time</label>
        <input name="project" type="number" min="10" id="project-time" value="45">
        <small>seconds</small>
      </div>
      <div>
        <label for="edition-time">Edition Time</label>
        <input name="edition" type="number" min="5" id="edition-time" value="45">
        <small>seconds</small>
      </div>
    </fieldset>

    <fieldset name="display">
    <legend>Display</legend>
      <div>
        <input name="name" type="checkbox" id="project-name" checked>
        <label for="project-name">name</label>
      </div>
      <div>
        <input name="creator" type="checkbox" id="project-creator" checked>
        <label for="project-creator">creator</label>
      </div>
      <div>
        <input name="description" type="checkbox" id="project-description">
        <label for="project-description">description</label>
      </div>
      <div>
        <input name="qrcode" type="checkbox" id="project-qr" checked>
        <label for="project-qr">qr code</label>
      </div>
    </fieldset>
  `;

  updateProjectInterval(45);
  updateEditionInterval(45);
}

function updateProjectInterval(seconds) {
  if (projectInterval) {
    clearInterval(projectInterval);
  }
  projectInterval = setInterval(() => {
    // Move to next project sequentially
    current = incrementLoop(current, options.projects.length);
    
    // Note: Random edition functionality removed - users can use Previous/Next buttons
    // to navigate through projects manually

    viewer.setAttribute("url", getUrl());
    change.classList = "change spin";
    disableButtons();
    setCurrentProjectIdGlobal();
  }, seconds * 1000);

  updateEditionInterval(options.timing.edition);
}

function updateEditionInterval(seconds) {
  if (editionInterval) {
    clearInterval(editionInterval);
  }
  editionInterval = setInterval(() => {
    seed = getRandSeed(seed, currentProject().editionSize);
    viewer.setAttribute("url", getUrl());
    // Note: Random button removed - edition cycling handled differently now
    disableButtons();
  }, seconds * 1000);
}

const spinner = document.querySelector(".spinner");

function disableButtons() {
  // TODO: show spinner
  previous.setAttribute("disabled", "");
  change.setAttribute("disabled", "");
  setTimeout(() => {
    change.removeAttribute("disabled");
    previous.removeAttribute("disabled");

    change.classList = "change";
    previous.classList = "previous";

    const { name, description, creator } = getDetails();
    console.log("olta", name);
    
    // Only set attributes if they are enabled in display options
    if (options.display.name) {
      details.setAttribute("name", name);
    }
    if (options.display.description) {
      details.setAttribute("description", decode(description));
    }
    if (options.display.creator) {
      details.setAttribute("creator", creator);
    }
    if (options.display.qr) {
      if (currentProject().qrCodeUrl) {
        details.setAttribute("qrcode", currentProject().qrCodeUrl);
      } else {
        details.setAttribute(
          "qrcode",
          `https://metamask.app.link/dapp/nft.olta.art/project/${
            currentProject().id
          }`
        );
      }
    }

    alignQrCodeToRight();
  }, 2500);
}

function incrementLoop(current, length) {
  const next = current + 1;
  if (next >= length) return 0;

  return next;
}

function decrementLoop(current, length) {
  const prev = current - 1;
  if (prev < 0) return length - 1;

  return prev;
}

function getRandSeed(seed, editionSize) {
  if (editionSize == 1) return "1";

  const s = Math.floor(Math.random() * editionSize) + 1;
  if (seed === s) {
    return getRandSeed(seed, editionSize);
  } else {
    return s;
  }
}

function getUrl() {
  if (!projects || projects.length == 0) return;

  const url = currentProject().lastAddedVersion.animation.url.replace(
    "http:",
    "https:"
  );

  const address = currentProject().id;

  return `${url}?id=1&seed=${seed}&address=${address}`;
}

function isSeeded() {
  return currentProject().editionSize > 1;
}

function getDetails() {
  if (!projects || projects.length == 0) return;

  console.log(currentProject());
  const { name, description, creator } = currentProject();

  return {
    name,
    description,
    creator: creator.profile.name,
  };
}

function currentProject() {
  const id = options.projects[current];
  console.log("PROJECT", current, id);
  const proj = projects.find((p) => p.id == id);
  console.log(proj);
  return proj;
}

function alignQrCodeToRight() {
  // Insert the project symbol property inside the array
  // so it's QR code and Artist Name will be aligned to the right
  const projectsToAlignRight = []; // Removed "PEER-INTO-THE-FLOW"

  let oDetails = document.getElementsByClassName("o-details")[0];
  let detailsPanel = details.shadowRoot.getElementById("details-panel");
  let currentProjectSymbol = currentProject().symbol;

  if (projectsToAlignRight.includes(currentProjectSymbol)) {
    // Align to the right side of the screen
    oDetails.style.position = "absolute";
    oDetails.style.width = "-webkit-fill-available";
    detailsPanel.style.flexDirection = "row-reverse";
  } else {
    // Switch back to previous appearance
    oDetails.style.position = "inherit";
    oDetails.style.width = "auto";
    detailsPanel.style.flexDirection = "row";
  }
}

function setCurrentProjectIdGlobal() {
  const proj = currentProject();
  if (proj && proj.id) {
    window.currentProjectId = proj.id;
    // Dispatch a custom event so index.html can listen for artwork changes
    window.dispatchEvent(new CustomEvent('artworkChanged', { detail: { id: proj.id } }));
  }
}

// Detect mobile device
const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Filter out 'Shadows Touch Accross Time' from staticArtworks on mobile
let filteredStaticArtworks = staticArtworks;
if (isMobile) {
  filteredStaticArtworks = staticArtworks.filter(
    (art) => !(art.name === "Shadows Touch Accross Time" && art.creator?.profile?.name === "Epok.Tech")
  );
  options.display.qr = false;
}

// Only request camera access once on mobile
let cameraStream = null;
async function requestCameraOnce() {
  if (isMobile) return; // Do not request camera on mobile
  if (!cameraStream) {
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Use cameraStream for gesture artworks
    } catch (err) {
      console.error('Camera access error:', err);
    }
  }
}

(async function fetchProjects() {
  await requestCameraOnce();
  const resp = await queryfetcher(
    "https://gateway-arbitrum.network.thegraph.com/api/subgraphs/id/3eGGTUNpbmzMZx2UrHyDzWTKaQeawGpPPUuJQSxg3LZQ",
    getProjects()
  );

  // Filtering out the projects
  let filteredProjects = resp.projects.filter(
    (project) => !["Loop", "Don't Scroll", "Totems", "FORM", "Fragmented Existence", "Choose your Words", "Lesson 1", "The Drop", "THE DROP", "Portal | One"].includes(project.name)
  );

  // On mobile, filter out 'Shadows Touch Accross Time' by Epok.Tech
  if (isMobile) {
    filteredProjects = filteredProjects.filter(
      (project) => !(project.name === "Shadows Touch Accross Time" && project.creator?.profile?.name === "Epok.Tech")
    );
  }

  // Reorder projects: move "Sacred Moth" after "Peer into the Flow"
  const peerIntoFlowIndex = filteredProjects.findIndex(p => p.name === "Peer into the Flow");
  const sacredMothIndex = filteredProjects.findIndex(p => p.name === "Sacred Moth");
  
  if (peerIntoFlowIndex !== -1 && sacredMothIndex !== -1) {
    // Remove Sacred Moth from its current position
    const sacredMoth = filteredProjects.splice(sacredMothIndex, 1)[0];
    // Insert it after Peer into the Flow
    const insertIndex = peerIntoFlowIndex + 1;
    filteredProjects.splice(insertIndex, 0, sacredMoth);
  }

  // Adding new URLs for the QR code to specific projects
  filteredProjects.forEach((project) => {
    if (project.name === "Totems") {
      project.qrCodeUrl =
        "https://arweave.net/_mg8ZW1miexH22bD-LdiABnGH8n5X5smYYXbbDKocpA/?id=1&address=0xac771ff04287872ea43263703b43ad5b801e8a1e&seed=1";
    }
  });

  // Merge filtered static and dynamic artworks
  projects = [...filteredStaticArtworks, ...filteredProjects];
  options.projects = projects.map((p) => p.id);

  renderOptions();

  seed = getRandSeed(seed, projects[current].editionSize);
  viewer.setAttribute("url", getUrl());
  disableButtons();
  setCurrentProjectIdGlobal();
})();

function colorTrace(msg, color) {
  console.log("%c" + msg, "color:" + color + ";font-weight:bold;");
}

// For gesture artworks, use cameraStream instead of requesting again

// fullscreen button
const fullscreenBtn = document.querySelector(".fullscreen");
fullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.log(`Error attempting to enable fullscreen: ${err.message}`);
    });
    fullscreenBtn.style.display = 'none';
  } else {
    document.exitFullscreen();
  }
});

// Listen for fullscreen change event
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    fullscreenBtn.style.display = ''; // Show button when exiting fullscreen
  }
});

const firebaseConfig = {
  apiKey: "AIzaSyDDEb8UeIk6D0pxl_IWEMADqhLz4ZEsA2g",
  authDomain: "olta-70b79.firebaseapp.com",
  databaseURL: "https://olta-70b79-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "olta-70b79",
  storageBucket: "olta-70b79.appspot.com",
  messagingSenderId: "1009481982599",
  appId: "1:1009481982599:web:c625bd9f64d9625fae8e22"
};
