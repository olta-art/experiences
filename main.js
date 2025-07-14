import { Details, Viewer } from "./o.js";
import { getProjects } from "./querys.js";
import { queryfetcher, SEPARATOR as sep, decode } from "./helpers.js";

const staticArtworks = [
  {
    id: "Shadows-Touch-Across-Time",
    name: "Shadows Touch Across Time",
    description: "Motion interactive",
    creator: { profile: { name: "Epok.Tech" } },
    editionSize: 1,
    symbol: "STATIC1",
    lastAddedVersion: {
      animation: { url: "https://epok.tech/shadows-touch-across-time-demo/" }
    },
    qrCodeUrl: "https://epok.tech"
  },

  {
    id: "Optical-Verlet",
    name: "Optical Verlet",
    description: "Motion interactive.",
    creator: { profile: { name: "XVI_JOJO" } },
    editionSize: 1,
    symbol: "STATIC1",
    lastAddedVersion: {
      animation: { url: "https://a7frsrbb25jdkt6rkwxhj6y44eh3rzyiffo6ait3kypjm7fqh5lq.arweave.net/B8sZRCHXUjVP0VWudPsc4Q-45wgpXeAie1YelnywP1c/" }
    },
    qrCodeUrl: "https://xvi-jojo.com"
  },

  {
    id: "Dissolvi",
    name: "Dissolvi",
    description: "Motion interactive.",
    creator: { profile: { name: "Omar Lobato" } },
    editionSize: 1,
    symbol: "STATIC1",
    lastAddedVersion: {
      animation: { url: "https://dissolvi-olta.vercel.app/" }
    },
    qrCodeUrl: "https://omar-lobato.com"
  },

  {
    id: "Faded-Memories",
    name: "Faded Memories",
    description: "Interactive desktop artwork.",
    creator: { profile: { name: "Artist Name" } },
    editionSize: 1,
    symbol: "STATIC2",
    lastAddedVersion: {
      animation: { url: "https://faded-memories-artwork-url.com/" }
    },
    qrCodeUrl: "https://artist-website.com"
  }
  
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

// Navigation functions
function navigateToPrevious() {
  console.log('[NAV] navigateToPrevious called', { 
    current, 
    projectsLength: projects.length, 
    optionsProjectsLength: options.projects.length,
    optionsProjects: options.projects,
    projects: projects.map(p => p.name)
  });
  
  if (!isNavigationReady()) {
    console.error('[NAV] Navigation not ready! Projects:', projects?.length, 'Options:', options.projects?.length);
    return;
  }
  
  current = decrementLoop(current, options.projects.length);
  console.log('[NAV] New current index:', current);
  
  const newUrl = getUrl();
  console.log('[NAV] New URL:', newUrl);
  
  viewer.setAttribute("url", newUrl);
  updateDetailsPanel();
  change.classList = "change spin";
  disableButtons();
  setCurrentProjectIdGlobal();
  updateGlobalVariables();
  showArtworkChangeFeedback('Artwork changed (via Previous button)');
  updateUrlParam();
  
  // --- Extra logging for debugging ---
  console.log('[NAV] After navigateToPrevious:', {
    current,
    previousDisabled: previous.disabled,
    changeDisabled: change.disabled
  });
}

function navigateToNext() {
  console.log('[NAV] navigateToNext called', { 
    current, 
    projectsLength: projects.length, 
    optionsProjectsLength: options.projects.length,
    optionsProjects: options.projects,
    projects: projects.map(p => p.name)
  });
  
  if (!isNavigationReady()) {
    console.error('[NAV] Navigation not ready! Projects:', projects?.length, 'Options:', options.projects?.length);
    return;
  }
  
  current = incrementLoop(current, options.projects.length);
  console.log('[NAV] New current index:', current);
  
  const newUrl = getUrl();
  console.log('[NAV] New URL:', newUrl);
  
  viewer.setAttribute("url", newUrl);
  updateDetailsPanel();
  change.classList = "change spin";
  disableButtons();
  setCurrentProjectIdGlobal();
  updateGlobalVariables();
  showArtworkChangeFeedback('Artwork changed (via Next button)');
  updateUrlParam();
  
  // --- Extra logging for debugging ---
  console.log('[NAV] After navigateToNext:', {
    current,
    previousDisabled: previous.disabled,
    changeDisabled: change.disabled
  });
}

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
  navigateToPrevious();
});

// change button
const change = document.querySelector(".change");
change.addEventListener("click", () => {
  navigateToNext();
});

// --- URL Param Playlist Router Integration ---

function updateUrlParam(replace = false) {
  const proj = currentProject();
  if (proj && proj.id) {
    const url = `?artwork=${encodeURIComponent(proj.id)}`;
    if (replace) {
      window.history.replaceState({ artworkId: proj.id }, '', url);
    } else {
      window.history.pushState({ artworkId: proj.id }, '', url);
    }
  }
}

function getIndexFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const artworkId = params.get('artwork');
  if (!artworkId) return 0;
  const idx = options.projects.findIndex(id => id === artworkId);
  return idx >= 0 ? idx : 0;
}

// --- END URL Param Playlist Router Integration ---

// Function to update global variables
function updateGlobalVariables() {
  window.current = current;
  window.options = options;
  window.projects = projects;
  window.viewer = viewer;
  window.getUrl = getUrl;
  window.incrementLoop = incrementLoop;
  window.decrementLoop = decrementLoop;
  window.disableButtons = disableButtons;
  window.setCurrentProjectIdGlobal = setCurrentProjectIdGlobal;
  }

// Function to check if navigation is ready
function isNavigationReady() {
  return projects && projects.length > 0 && options.projects && options.projects.length > 0;
}

// Expose navigation functions globally
window.navigatePrevious = navigateToPrevious;
window.navigateNext = navigateToNext;
window.isNavigationReady = isNavigationReady;

// Add a test function to verify navigation is working
window.testNavigation = function() {
  console.log('=== NAVIGATION TEST ===');
  console.log('Current index:', current);
  console.log('Projects:', projects.map(p => p.name));
  console.log('Options projects:', options.projects);
  console.log('Navigation ready:', isNavigationReady());
  console.log('Navigate functions available:', {
    navigatePrevious: typeof window.navigatePrevious,
    navigateNext: typeof window.navigateNext,
    isNavigationReady: typeof window.isNavigationReady
  });
  
  // Test the navigation functions
  console.log('Testing navigation functions...');
  if (isNavigationReady()) {
    console.log('✅ Navigation is ready');
    console.log('Current project:', currentProject()?.name);
  } else {
    console.log('❌ Navigation is not ready');
  }
};

// Expose other necessary variables and functions globally
window.current = current;
window.options = options;
window.projects = projects;
window.viewer = viewer;
window.getUrl = getUrl;
window.incrementLoop = incrementLoop;
window.decrementLoop = decrementLoop;
window.disableButtons = disableButtons;
window.setCurrentProjectIdGlobal = setCurrentProjectIdGlobal;
window.updateGlobalVariables = updateGlobalVariables;

// Listen for custom navigation events from top nav buttons
window.addEventListener('navigatePrevious', () => {
  console.log('Main.js: navigatePrevious event received');
  navigateToPrevious();
});

window.addEventListener('navigateNext', () => {
  console.log('Main.js: navigateNext event received');
  navigateToNext();
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
    updateDetailsPanel(); // <-- ADD THIS LINE
    change.classList = "change spin";
    disableButtons();
    setCurrentProjectIdGlobal();
    updateGlobalVariables(); // <-- ADD THIS LINE TOO
    updateUrlParam(true);
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
    updateDetailsPanel(); // <-- ADD THIS LINE
    // Note: Random button removed - edition cycling handled differently now
    disableButtons();
  }, seconds * 1000);
}

const spinner = document.querySelector(".spinner");

// Only disable/enable the visible nav buttons
function disableButtons() {
  const prevBtn = document.getElementById('nav-prev-btn');
  const nextBtn = document.getElementById('nav-next-btn');
  
  if (prevBtn) {
    prevBtn.setAttribute("disabled", "");
  }
  if (nextBtn) {
    nextBtn.setAttribute("disabled", "");
  }
  
  setTimeout(() => {
    if (prevBtn) {
      prevBtn.removeAttribute("disabled");
    }
    if (nextBtn) {
      nextBtn.removeAttribute("disabled");
    }
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
  console.log('getUrl called');
  console.log('projects:', projects);
  console.log('projects.length:', projects.length);
  
  if (!projects || projects.length == 0) {
    console.error('No projects available!');
    return;
  }

  const currentProj = currentProject();
  if (!currentProj) {
    console.error('currentProject() returned null!');
    return;
  }
  
  console.log('Current project:', currentProj);
  
  const url = currentProj.lastAddedVersion.animation.url.replace(
    "http:",
    "https:"
  );
  console.log('Base URL:', url);

  const address = currentProj.id;
  console.log('Address:', address);
  console.log('Seed:', seed);

  const finalUrl = `${url}?id=1&seed=${seed}&address=${address}`;
  console.log('Final URL:', finalUrl);

  return finalUrl;
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
  console.log('currentProject called with current:', current);
  console.log('options.projects:', options.projects);
  console.log('projects array:', projects);
  
  if (!options.projects || options.projects.length === 0) {
    console.error('options.projects is empty or undefined!');
    return null;
  }
  
  const id = options.projects[current];
  console.log("PROJECT", current, id);
  
  if (!id) {
    console.error('No project ID found for current index:', current);
    return null;
  }
  
  const proj = projects.find((p) => p.id == id);
  console.log('Found project:', proj);
  
  if (!proj) {
    console.error('No project found with ID:', id);
    return null;
  }
  
  return proj;
}

function alignQrCodeToRight() {
  // Insert the project symbol property inside the array
  // so it's QR code and Artist Name will be aligned to the right
  const projectsToAlignRight = ["PEER-INTO-THE-FLOW"]; // Added back "PEER-INTO-THE-FLOW"

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

// List of gesture/spatial controlled artwork names to exclude on mobile
const gestureArtworkNames = [
  "Optical Verlet",
  "Dissolvi"
  // Add more gesture artwork names here as needed
];

// Filter out gesture artworks from staticArtworks on mobile
let filteredStaticArtworks = staticArtworks;
if (isMobile) {
  filteredStaticArtworks = staticArtworks.filter(
    (art) => !gestureArtworkNames.includes(art.name)
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

// Define the playlists at the top of main.js
const gestureControlPlaylist = [
  "Shadows-Touch-Accross-Time",
  "Optical-Verlet",
  "Dissolvi"
];

const desktopPlaylist = [
  "FIELDS",
  "Meanwhile",
  "Morphed Radiance",
  "Faded Memories"
];

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

  // On mobile, filter out gesture artworks by name
  if (isMobile) {
    filteredProjects = filteredProjects.filter(
      (project) => !gestureArtworkNames.includes(project.name)
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

  // Adding QR code URLs for specific projects to link to artist websites
  filteredProjects.forEach((project) => {
    // Map project names to artist websites and social media
    const artistWebsites = {
      "Totems": "https://arweave.net/_mg8ZW1miexH22bD-LdiABnGH8n5X5smYYXbbDKocpA/?id=1&address=0xac771ff04287872ea43263703b43ad5b801e8a1e&seed=1",
      "Peer into the Flow": "https://twitter.com/peerintotheflow",
      "Sacred Moth": "https://twitter.com/sacredmoth_art",
      "FIELDS": "https://twitter.com/fields_art",
      "Morphed Radiance": "https://twitter.com/morphed_radiance",
      "Your New Project": "https://artist-website.com",
      // For projects without specific artist websites, link to their artwork directly
      // or to a general portfolio/collection page
    };
    
    if (artistWebsites[project.name]) {
      project.qrCodeUrl = artistWebsites[project.name];
    } else {
      // For projects without specific artist websites, create a more meaningful QR code
      // that links to the actual artwork or a collection page
      const artworkUrl = project.lastAddedVersion?.animation?.url;
      if (artworkUrl) {
        // Use the actual artwork URL as the QR code
        project.qrCodeUrl = artworkUrl;
      }
    }
  });

  // After fetching and filtering all projects into the 'projects' array:
  function getProjectById(id) {
    return filteredProjects.find(p => p.id === id);
  }

  // Combine API projects with static artworks
  const allAvailableProjects = [...filteredProjects, ...staticArtworks];
  
  // Build the ordered playlist using the combined projects
  const orderedProjects = [
    ...gestureControlPlaylist.map(id => allAvailableProjects.find(p => p.id === id)),
    ...desktopPlaylist.map(id => allAvailableProjects.find(p => p.id === id))
  ].filter(Boolean); // Remove any not found

  projects = orderedProjects.length > 0 ? orderedProjects : staticArtworks;
  
  // Make filteredProjects available globally for playlist switching
  window.filteredProjects = filteredProjects;
  options.projects = projects.map(p => p.id);
  console.log("=== PROJECT LOADING DEBUG ===");
  console.log("Filtered projects from API:", filteredProjects.map(p => p.name));
  console.log("Static artworks:", staticArtworks.map(p => p.name));
  console.log("Combined all projects:", allAvailableProjects.map(p => p.name));
  console.log("Final projects array:", projects.map(p => p.name));
  console.log("Options projects (IDs):", options.projects);
  console.log("=== END DEBUG ===");

  current = getIndexFromUrl();
  if (!projects[current]) current = 0;

  renderOptions();

  if (!projects.length) {
    console.error("No projects to display!");
    return;
  }
  if (!projects[current]) {
    console.error("Current project is undefined!");
    return;
  }

  seed = getRandSeed(seed, projects[current].editionSize);
  viewer.setAttribute("url", getUrl());
  updateDetailsPanel(); // <-- add this
  disableButtons();
  setCurrentProjectIdGlobal();
  
  // Don't initialize playlist here - will be done in DOMContentLoaded
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

// Function to show artwork change feedback
function showArtworkChangeFeedback(message) {
  const feedback = document.getElementById('nav-feedback');
  if (feedback) {
    feedback.textContent = message;
    feedback.classList.add('show');
    
    // Remove the show class after animation completes
    setTimeout(() => {
      feedback.classList.remove('show');
    }, 1500);
  }
  
  // Console feedback with artwork info
  const currentArtwork = currentProject();
  if (currentArtwork) {
    console.log(`🎨 ${message} - Now viewing: "${currentArtwork.name}" by ${currentArtwork.creator?.profile?.name || 'Unknown Artist'}`);
  }
}

// --- Handle browser back/forward navigation ---
window.addEventListener('popstate', () => {
  const idx = getIndexFromUrl();
  if (typeof idx === 'number' && idx >= 0 && idx < options.projects.length) {
    current = idx;
    viewer.setAttribute("url", getUrl());
    setCurrentProjectIdGlobal();
    updateGlobalVariables();
    showArtworkChangeFeedback('Artwork changed (via browser navigation)');
  }
});
// --- END popstate ---



// Add this function near your other helpers
function updateDetailsPanel() {
  const detailsObj = getDetails();
  if (!detailsObj) return;
  const { name, description, creator } = detailsObj;
  details.setAttribute("name", name || "");
  details.setAttribute("description", description || "");
  details.setAttribute("creator", creator || "");
  // Set QR code attribute
  if (currentProject() && currentProject().qrCodeUrl) {
    details.setAttribute("qrcode", currentProject().qrCodeUrl);
  } else {
    // fallback to artwork URL or project page
    const artworkUrl = currentProject() && currentProject().lastAddedVersion?.animation?.url;
    if (artworkUrl) {
      details.setAttribute("qrcode", artworkUrl);
    } else if (currentProject()) {
      details.setAttribute("qrcode", `https://nft.olta.art/project/${currentProject().id}`);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Attach event listeners to visible nav buttons
  const prevBtn = document.getElementById('nav-prev-btn');
  const nextBtn = document.getElementById('nav-next-btn');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      console.log('Previous button clicked');
      if (window.isNavigationReady && window.isNavigationReady()) {
        window.navigatePrevious && window.navigatePrevious();
      } else {
        console.error('Navigation not ready when previous button clicked');
      }
    });
  } else {
    console.error('Previous button not found!');
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      console.log('Next button clicked');
      if (window.isNavigationReady && window.isNavigationReady()) {
        window.navigateNext && window.navigateNext();
      } else {
        console.error('Navigation not ready when next button clicked');
      }
    });
  } else {
    console.error('Next button not found!');
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      console.log('Left arrow pressed');
      window.navigatePrevious && window.navigatePrevious();
    } else if (e.key === 'ArrowRight') {
      console.log('Right arrow pressed');
      window.navigateNext && window.navigateNext();
    }
  });

  const playlistButtons = document.querySelectorAll('.playlist-btn');
  playlistButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      playlistButtons.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      btn.classList.add('active');
      // Switch playlist using your global function
      const playlistId = btn.getAttribute('data-playlist');
      if (window.switchPlaylist) {
        window.switchPlaylist(playlistId);
      }
      // Update playlist header (optional, if not handled in switchPlaylist)
      const playlistHeader = document.getElementById('playlist-header');
      if (playlistHeader) {
        const title = playlistHeader.querySelector('.playlist-title');
        const desc = playlistHeader.querySelector('.playlist-description');
        if (playlistId === 'gesture-control') {
          title.textContent = 'Gesture Control – Interactive Experiences';
          desc.textContent = 'Motion-controlled digital artworks that respond to your movements';
        } else if (playlistId === 'desktop-experiences') {
          title.textContent = 'Desktop Experiences';
          desc.textContent = 'Interactive digital artworks for desktop viewing';
        }
      }
    });
  });
  // Optionally, set the first button as active on load
  if (playlistButtons[0]) playlistButtons[0].classList.add('active');
  
  // Initialize with the default playlist after everything is loaded
  setTimeout(() => {
    if (window.switchPlaylist) {
      console.log('Initializing with gesture-control playlist...');
      window.switchPlaylist('gesture-control');
    } else {
      console.error('switchPlaylist function not available');
    }
  }, 500);
});

// Define playlists
const playlists = {
  'gesture-control': {
    name: 'Gesture Control – Interactive Experiences',
    description: 'Motion-controlled digital artworks that respond to your movements',
    artworks: ['Shadows Touch Across Time', 'Optical Verlet', 'Dissolvi']
  },
  'desktop-experiences': {
    name: 'Desktop Experiences',
    description: 'Interactive digital artworks for desktop viewing',
    artworks: ['FIELDS', 'Faded Memories']
  }
};

let currentPlaylistId = 'gesture-control'; // Default

function switchPlaylist(playlistId) {
  const playlist = playlists[playlistId];
  if (!playlist) {
    console.error('Playlist not found:', playlistId);
    return;
  }
  currentPlaylistId = playlistId;
  
  // Get all available projects (from API and static)
  let allProjects;
  if (window.filteredProjects && window.filteredProjects.length > 0) {
    // Combine API projects with static artworks
    allProjects = [...window.filteredProjects, ...staticArtworks];
  } else if (projects.length > 0) {
    allProjects = projects;
  } else {
    allProjects = staticArtworks;
  }
  
  // Debug: Log all available project names
  console.log('=== SWITCH PLAYLIST DEBUG ===');
  console.log('All available projects:', allProjects.map(p => p.name));
  console.log('Looking for playlist artworks:', playlist.artworks);
  console.log('Playlist ID:', playlistId);
  
  // Filter projects based on playlist artworks
  const playlistProjects = allProjects.filter(project =>
    playlist.artworks.includes(project.name)
  );

  console.log('Playlist projects found:', playlistProjects.map(p => p.name));

  // Update the current projects array
  projects = playlistProjects;
  options.projects = projects.map(p => p.id);

  // Reset to first artwork and ensure current is valid
  current = 0;
  if (current >= projects.length) current = 0;
  
  // For Gesture Control playlist, always start from the first artwork (Shadows Touch Accross Time)
  if (playlistId === 'gesture-control') {
    current = 0;
  }

  // Update viewer and details
  if (projects.length > 0) {
    viewer.setAttribute("url", getUrl());
    updateDetailsPanel();
    setCurrentProjectIdGlobal();
    updateGlobalVariables();
  } else {
    console.warn('No projects found for playlist:', playlistId);
  }

  // Update URL
  updateUrlParam();

  // Update playlist header if present
  const playlistHeader = document.getElementById('playlist-header');
  if (playlistHeader) {
    const title = playlistHeader.querySelector('.playlist-title');
    const desc = playlistHeader.querySelector('.playlist-description');
    if (title) title.textContent = playlist.name;
    if (desc) desc.textContent = playlist.description;
  }

  console.log(`Switched to ${playlist.name} with ${projects.length} artworks`);
}
window.switchPlaylist = switchPlaylist;

