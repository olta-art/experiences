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
  // Note: to add url about Artwork on Olta and direct people there with QR code

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
    qrCodeUrl: "https://x.com/xvijojo"
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
    qrCodeUrl: "https://x.com/seigneurrrr?lang=en"
  },
   // Note: to add url about Artwork on Olta and direct people there with QR code

  {
    id: "Faded-Memories",
    name: "Faded Memories",
    description: "Interactive desktop artwork.",
    creator: { profile: { name: "Terence Reilly" } },
    editionSize: 1,
    symbol: "STATIC2",
    lastAddedVersion: {
      animation: { url: "https://t53i3e4bahzkre6tmylkgv32exvfjvrwa5c5o4t6td46ja5kr63q.arweave.net/n3aNk4EB8qiT02YWo1d6JepU1jYHRddyfpj55IOqj7c/?id=1&address=0x8f676434eecd5c69e00e89d7c0421faf8dfea1d9&seed=1" }
    },
    qrCodeUrl: "https://www.terencereilly.com/"
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
  
  if (currentProject() && currentProject().editionSize > 1) {
    seed = getRandSeed(seed, currentProject().editionSize);
  }
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
  
  if (currentProject() && currentProject().editionSize > 1) {
    seed = getRandSeed(seed, currentProject().editionSize);
  }
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

// Add a test function to verify sharing functionality
window.testSharing = function() {
  console.log('=== SHARING TEST ===');
  console.log('window.currentProjectId:', window.currentProjectId);
  console.log('currentProject():', currentProject());
  console.log('Current URL param:', new URLSearchParams(window.location.search).get('artwork'));
  console.log('Projects array:', projects.map(p => ({ id: p.id, name: p.name })));
  console.log('Options projects:', options.projects);
  console.log('Current index:', current);
  
  if (currentProject()) {
    const proj = currentProject();
    console.log('✅ Current project details:', {
      id: proj.id,
      name: proj.name,
      creator: proj.creator?.profile?.name
    });
  } else {
    console.log('❌ No current project found');
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
  console.log('[GLOBAL_ID] Setting current project ID globally:', proj);
  if (proj && proj.id) {
    window.currentProjectId = proj.id;
    console.log('[GLOBAL_ID] window.currentProjectId set to:', window.currentProjectId);
    // Dispatch a custom event so index.html can listen for artwork changes
    window.dispatchEvent(new CustomEvent('artworkChanged', { detail: { id: proj.id } }));
  } else {
    console.error('[GLOBAL_ID] Failed to set currentProjectId - no project or no ID');
  }
}

// Detect mobile device
const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
console.log('[MOBILE_DETECTION] User Agent:', navigator.userAgent);
console.log('[MOBILE_DETECTION] Is Mobile Device:', isMobile);
console.log('🚀 MOBILE OPTIMIZED DEPLOYED - Mobile devices now get a curated mobile playlist');
console.log('🚀 Current default playlist:', isMobile ? 'mobile-optimized' : 'gesture-control');

// List of gesture/spatial controlled artwork names to exclude on mobile
// Note: Dissolvi is kept for mobile, others are excluded
const gestureArtworkNames = [
  "Shadows Touch Across Time",
  "Optical Verlet"
  // Dissolvi is intentionally removed from this list to keep it on mobile
  // Add more gesture artwork names here as needed
];

// Filter out gesture artworks from staticArtworks on mobile
let filteredStaticArtworks = staticArtworks;
if (isMobile) {
  console.log('[MOBILE_FILTER] Original static artworks:', staticArtworks.map(art => art.name));
  console.log('[MOBILE_FILTER] Artworks to exclude:', gestureArtworkNames);
  
  filteredStaticArtworks = staticArtworks.filter(
    (art) => !gestureArtworkNames.includes(art.name)
  );
  
  console.log('[MOBILE_FILTER] Filtered static artworks:', filteredStaticArtworks.map(art => art.name));
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
  "Shadows-Touch-Across-Time",
  "Optical-Verlet", 
  "Dissolvi"
];

const desktopPlaylist = [
  "FIELDS",
  "Meanwhile",
  "Morphed Radiance",
  "Faded Memories"
];

// Mobile-optimized playlist - artworks that work well on mobile
const mobilePlaylist = [
  "Faded-Memories",  // Your desktop artwork that works on mobile
  "Dissolvi"         // This one works on mobile (you mentioned it's kept)
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
      "Peer into the Flow": "https://olta.art/artwork/peerintotheflow",
      "Sacred Moth": "",
      "FIELDS": "https://olta.art/artwork/fields",
      "Morphed Radiance": "https://nft.olta.art/project/0xe94100850ee7507dd57eb1ba67dc0600b18122df",
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

  // Combine API projects with static artworks (use filtered version for mobile)
  const allAvailableProjects = [...filteredProjects, ...filteredStaticArtworks];
  
  // (You can keep orderedProjects if you want for debugging, but don't assign to global state)
  const orderedProjects = [
    ...gestureControlPlaylist.map(id => allAvailableProjects.find(p => p.id === id)),
    ...desktopPlaylist.map(id => allAvailableProjects.find(p => p.id === id))
  ].filter(Boolean);

  // Make filteredProjects available globally for playlist switching
  window.filteredProjects = filteredProjects;

  // Optionally: log for debugging
  console.log("=== PROJECT LOADING DEBUG ===");
  console.log("Filtered projects from API:", filteredProjects.map(p => p.name));
  console.log("Static artworks (original):", staticArtworks.map(p => p.name));
  console.log("Static artworks (filtered for mobile):", filteredStaticArtworks.map(p => p.name));
  console.log("Is mobile device:", isMobile);
  console.log("Combined all projects:", allAvailableProjects.map(p => p.name));
  console.log("Ordered projects (for debug):", orderedProjects.map(p => p.name));
  console.log('All available project IDs:', allAvailableProjects.map(p => p.id));
  console.log("=== END DEBUG ===");

  // NOW handle initial URL routing after ALL projects (API + static) are loaded
  console.log('[FINAL_INIT] Handling URL routing after all projects fully loaded');
  handleInitialUrlRouting();

  // Only render options if needed for UI
  renderOptions();

  // Do NOT set projects, options.projects, or current here!
  // Do NOT update viewer, details, or URL here!
  // All playlist setup and initial state will be handled by URL routing above
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
      if (window.isNavigationReady && window.isNavigationReady()) {
        window.navigatePrevious && window.navigatePrevious();
      }
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (window.isNavigationReady && window.isNavigationReady()) {
        window.navigateNext && window.navigateNext();
      }
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      window.navigatePrevious && window.navigatePrevious();
    } else if (e.key === 'ArrowRight') {
      window.navigateNext && window.navigateNext();
    }
  });

  // Playlist dropdown logic
  const playlistDropdown = document.getElementById('playlist-dropdown');
  if (playlistDropdown) {
    // Set default selection based on device type
    const defaultPlaylist = isMobile ? 'mobile-optimized' : 'gesture-control';
    playlistDropdown.value = defaultPlaylist;
    
    // Update playlist header immediately based on device type
    const playlistHeader = document.getElementById('playlist-header');
    if (playlistHeader) {
      const title = playlistHeader.querySelector('.playlist-title');
      const desc = playlistHeader.querySelector('.playlist-description');
      if (defaultPlaylist === 'mobile-optimized') {
        if (title) title.textContent = 'Mobile Optimized';
        if (desc) desc.textContent = 'Touch-friendly artworks optimized for mobile devices';
      } else {
        if (title) title.textContent = 'Gesture Control – Interactive Experiences';
        if (desc) desc.textContent = 'Motion-controlled digital artworks that respond to your movements';
      }
    }
    
    playlistDropdown.addEventListener('change', (e) => {
      const playlistId = playlistDropdown.value;
      if (window.switchPlaylist) {
        window.switchPlaylist(playlistId);
      }
      // Update playlist header
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
        } else if (playlistId === 'mobile-optimized') {
          title.textContent = 'Mobile Optimized';
          desc.textContent = 'Touch-friendly artworks optimized for mobile devices';
        }
      }
    });
  }

  // DO NOT call switchPlaylist here - wait for final URL routing
  console.log('[INIT] Projects loaded, waiting for final URL routing...');
});

// Define playlists
const playlists = {
  'gesture-control': {
    name: 'Gesture Control – Interactive Experiences',
    description: 'Motion-controlled digital artworks that respond to your movements',
    artworks: ['Shadows-Touch-Across-Time', 'Optical-Verlet', 'Dissolvi']
  },
  'desktop-experiences': {
    name: 'Desktop Experiences',
    description: 'Interactive digital artworks for desktop viewing',
    artworks: [
      '0x510da17477ba0a23858c59e9bf80b8d8ad1b6ee', // FIELDS
      'Faded-Memories',
      '0xe94100850ee7507dd57eb1ba67dc0600b18122df' // Morphed Radiance
    ]
  },
  'mobile-optimized': {
    name: 'Mobile Optimized',
    description: 'Touch-friendly artworks optimized for mobile devices',
    artworks: ['Faded-Memories', 'Dissolvi']
  }
};

// Default playlist - use mobile-optimized on mobile, gesture-control on desktop
let currentPlaylistId = isMobile ? 'mobile-optimized' : 'gesture-control';

// Function to detect which playlist contains a given artwork ID
function getPlaylistForArtwork(artworkId) {
  console.log('[PLAYLIST_DETECT] Looking for artwork:', artworkId);
  console.log('[PLAYLIST_DETECT] Available playlists:', Object.keys(playlists));
  
  for (const [playlistId, playlist] of Object.entries(playlists)) {
    console.log(`[PLAYLIST_DETECT] Checking ${playlistId}:`, playlist.artworks);
    // Check both exact match and case-insensitive match
    const found = playlist.artworks.find(id => 
      id === artworkId || id.toLowerCase() === artworkId.toLowerCase()
    );
    if (found) {
      console.log(`[PLAYLIST_DETECT] Found artwork in playlist: ${playlistId}`);
      return playlistId;
    }
  }
  console.log('[PLAYLIST_DETECT] Artwork not found in any playlist');
  return null;
}

// Function to handle initial URL routing
function handleInitialUrlRouting() {
  const params = new URLSearchParams(window.location.search);
  const artworkId = params.get('artwork');
  const playlistParam = params.get('playlist');
  
  console.log('[INIT_ROUTE] URL params:', { artworkId, playlistParam });
  console.log('[INIT_ROUTE] Available projects - API:', window.filteredProjects?.length || 0, 'Static:', staticArtworks.length);
  
  if (artworkId) {
    // If there's an artwork ID, find which playlist it belongs to
    const correctPlaylist = getPlaylistForArtwork(artworkId);
    console.log('[INIT_ROUTE] Artwork belongs to playlist:', correctPlaylist);
    
    if (correctPlaylist) {
      // Switch to the correct playlist first
      console.log('[INIT_ROUTE] Switching to playlist:', correctPlaylist);
      switchPlaylist(correctPlaylist);
      return;
    } else {
      console.log('[INIT_ROUTE] Artwork not found in any playlist, using default');
    }
  }
  
  if (playlistParam) {
    // If there's a playlist parameter, use that
    console.log('[INIT_ROUTE] Switching to playlist from URL:', playlistParam);
    switchPlaylist(playlistParam);
    return;
  }
  
  // Default to mobile-optimized on mobile, gesture-control on desktop
  const defaultPlaylist = isMobile ? 'mobile-optimized' : 'gesture-control';
  console.log(`[INIT_ROUTE] Using default playlist for ${isMobile ? 'mobile' : 'desktop'}: ${defaultPlaylist}`);
  switchPlaylist(defaultPlaylist);
}

function switchPlaylist(playlistId) {
  console.log('[SWITCH] Switching to playlist:', playlistId);
  const playlist = playlists[playlistId];
  if (!playlist) {
    console.error('Playlist not found:', playlistId);
    return;
  }
  currentPlaylistId = playlistId;
  window.currentPlaylistId = currentPlaylistId;
  
  // Get all available projects (from API and static)
  let allProjects;
  if (window.filteredProjects && window.filteredProjects.length > 0) {
    // Combine API projects with static artworks (use filtered version for mobile)
    allProjects = [...window.filteredProjects, ...filteredStaticArtworks];
  } else if (projects.length > 0) {
    allProjects = projects;
  } else {
    allProjects = filteredStaticArtworks;
  }
  
  // Build playlist by ID (not name)
  const playlistProjects = playlist.artworks
    .map(id => allProjects.find(project => project.id === id))
    .filter(Boolean);

  // Debug logging for troubleshooting URL issues
  console.log('[DEBUG] playlistProjects:', playlistProjects.map(p => p.id));
  console.log('[DEBUG] options.projects:', playlistProjects.map(p => p.id));
  console.log('[DEBUG] URL param:', new URLSearchParams(window.location.search).get('artwork'));

  projects = playlistProjects;
  options.projects = projects.map(p => p.id);

  // Set current based on URL param if present
  const params = new URLSearchParams(window.location.search);
  const artworkId = params.get('artwork');
  let idx = 0;
  if (artworkId) {
    idx = options.projects.findIndex(id => id.toLowerCase() === artworkId.toLowerCase());
    if (idx === -1) {
      idx = 0;
    }
  }
  current = idx;

  // For Gesture Control or Desktop Experiences playlist, always start from the first artwork if no artwork param
  if ((playlistId === 'gesture-control' || playlistId === 'desktop-experiences') && !artworkId) {
    current = 0;
  }

  // Update viewer and details
  if (projects.length > 0) {
    if (currentProject().editionSize > 1) {
      seed = getRandSeed(seed, currentProject().editionSize);
    }
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

  // Update playlist dropdown to match current playlist
  const playlistDropdown = document.getElementById('playlist-dropdown');
  if (playlistDropdown && playlistDropdown.value !== playlistId) {
    playlistDropdown.value = playlistId;
  }

  console.log(`Switched to ${playlist.name} with ${projects.length} artworks`);
}
window.switchPlaylist = switchPlaylist;
window.currentPlaylistId = currentPlaylistId;

