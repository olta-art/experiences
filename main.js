import { Details, Viewer } from "./o.js";
import { getPeerIntoFlowQuery, PEER_INTO_FLOW_ID } from "./querys.js";
import { queryfetcher, SEPARATOR as sep, decode } from "./helpers.js";

const staticArtworks = [
  {
    id: "Shadows-Touch-Across-Time",
    name: "Shadows Touch Across Time",
    description: "Motion interactive",
    creator: { profile: { name: "Epok.Tech" } },
    editionSize: 1,
    symbol: "SHADOWS_TOUCH_ACROSS_TIME",
    lastAddedVersion: {
      animation: { url: "https://epok.tech/shadows-touch-across-time-demo/?app.store.seed=false/" }
    },
    qrCodeUrl: "https://epok.tech"
  },

  {
    id: "Optical-Verlet",
    name: "Optical Verlet",
    description: "Motion interactive.",
    creator: { profile: { name: "XVI_JOJO" } },
    editionSize: 1,
    symbol: "OPTICAL_VERLET",
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
    symbol: "DISSOLVI",
    lastAddedVersion: {
      animation: { url: "https://dissolvi-olta.vercel.app/" }
    },
    qrCodeUrl: "https://x.com/seigneurrrr?lang=en"
  },

  {
    id: "Faded-Memories",
    name: "Faded Memories",
    description: "Interactive desktop artwork.",
    creator: { profile: { name: "Terence Reilly" } },
    editionSize: 1,
    symbol: "FADED_MEMORIES",
    lastAddedVersion: {
      animation: { url: "https://t53i3e4bahzkre6tmylkgv32exvfjvrwa5c5o4t6td46ja5kr63q.arweave.net/n3aNk4EB8qiT02YWo1d6JepU1jYHRddyfpj55IOqj7c/?id=1&address=0x8f676434eecd5c69e00e89d7c0421faf8dfea1d9&seed=1" }
    },
    qrCodeUrl: "https://www.terencereilly.com/"
  },

  // Add FIELDS as static artwork with reasonable edition size
  {
    id: "0x510da17477baa0a23858c59e9bf80b8d8ad1b6ee", // FIELDS
    name: "FIELDS",
    description: "Interactive digital artwork",
    creator: { profile: { name: "Tamrat" } },
    editionSize: 50, // Set reasonable max edition size for frontend randomization
    symbol: "FIELDS",
    lastAddedVersion: {
      animation: { url: "https://stuwcqhlpwieaoiat64p6t7l6pz6a64jeow2hg6tygmt5upahl2q.arweave.net/lOlhQOt9kEA5AJ-4_0_r8_Pge4kjraOb08GZPtHgOvU/?id=1&address=0x510da17477baa0a23858c59e9bf80b8d8ad1b6ee&seed=1" } // Replace with actual URL
    },
    qrCodeUrl: "https://olta.art/artwork/fields"
  },

  // Add Morphed Radiance as static artwork
  {
    id: "0xe94100850ee7507dd57eb1ba67dc0600b18122df", // Morphed Radiance
    name: "Morphed Radiance",
    description: "Interactive digital artwork",
    creator: { profile: { name: "Rangga Purnama Aji" } },
    editionSize: 1,
    symbol: "MORPHED_RADIANCE",
    lastAddedVersion: {
      animation: { url: "https://bipkxf4eghha655lznv66zhruy2ya3gfk3dsovbil6gscb2x4cwq.arweave.net/Ch6rl4Qxzg93q8tr72TxpjWAbMVWxydUKF-NIQdX4K0/" } // Replace with actual URL
    },
    qrCodeUrl: ""
  },

  // Add Peer into the Flow as static artwork (will be updated with real-time data from Graph API)
  {
    id: "0x6d24ce4c32e556313b431fb156edf2060680a998", // Peer into the Flow
    name: "Peer into the Flow",
    description: "Interactive digital artwork",
    creator: { profile: { name: "Epok.Tech" } },
    editionSize: 50, // Fallback edition size if Graph API fails
    symbol: "PEER_INTO_THE_FLOW",
    lastAddedVersion: {
      animation: { url: "https://yfhwavf2ac37wdgcee5p62jp4myyk4imhpdrvarmfhawg36firrq.arweave.net/wU9gVLoAt_sMwiE6_2kv4zGFcQw7xxqCLCnBY2_FRGM/?id=1&address=0x6d24ce4c32e556313b431fb156edf2060680a998&seed=3" }
    },
    qrCodeUrl: "https://olta.art/artwork/peerintotheflow",
    defaultSeed: 3 // Special property to always start with seed 3
  },

  // Add Meanwhile by Laureano Solis
  {
    id: "0x29b58c3146fc013913f987501d91ce1babcf8e32", // Meanwhile
    name: "Meanwhile",
    description: "Interactive digital artwork",
    creator: { profile: { name: "Laureano Solis" } },
    editionSize: 1,
    symbol: "MEANWHILE",
    lastAddedVersion: {
      animation: { url: "https://cufzenkyzw5pouhryamkb5au5usa63utcog4uo7uro5vsg7ojkoq.arweave.net/FQuSNVjNuvdQ8cAYoPQU7SQPbpMTjco79Iu7WRvuSp0/?id=1&address=0x29b58c3146fc013913f987501d91ce1babcf8e32&seed=1" }
    },
    qrCodeUrl: "https://olta.art/artwork/meanwhile"
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
    project: 30,
    edition: 30,
  },
  display: {
    name: true,
    creator: true,
    description: false,
    qr: true,
  },
};

// Navigation functions
// Function to ensure details panel is synchronized with current artwork
function ensureDetailsSync() {
  try {
    console.log('[SYNC] Ensuring details panel synchronization...');
    
    const currentProj = currentProject();
    if (!currentProj) {
      console.error('[SYNC] No current project found for sync check');
      return false;
    }
    
    // Check if details panel shows correct information
    if (details.shadowRoot) {
      const nameSlot = details.shadowRoot.querySelector('slot[name="name"]');
      const creatorSlot = details.shadowRoot.querySelector('slot[name="creator"]');
      
      const nameMatch = nameSlot && nameSlot.textContent === currentProj.name;
      const creatorMatch = creatorSlot && creatorSlot.textContent === (currentProj.creator?.profile?.name || '');
      
      if (!nameMatch || !creatorMatch) {
        console.warn('[SYNC] Details panel out of sync detected:', {
          expectedName: currentProj.name,
          actualName: nameSlot?.textContent,
          expectedCreator: currentProj.creator?.profile?.name,
          actualCreator: creatorSlot?.textContent
        });
        
        // Force update details panel
        updateDetailsPanel();
        return false;
      }
      
      console.log('[SYNC] Details panel is properly synchronized');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[SYNC] Error during sync check:', error);
    return false;
  }
}

// Enhanced navigation function with better synchronization
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
    console.error('[NAV] Navigation readiness check failed. Cannot navigate.');
    return;
  }
  
  // Move to previous artwork
  const previousIndex = decrementLoop(current, options.projects.length);
  console.log(`[NAV] Current index: ${current}, Previous index: ${previousIndex}, Total projects: ${options.projects.length}`);
  
  // Check if we're actually moving to a different artwork
  const currentArtwork = currentProject();
  const nextArtwork = projects[previousIndex];
  
  if (currentArtwork && nextArtwork) {
    console.log(`[NAV] Moving from: "${currentArtwork.name}" to: "${nextArtwork.name}"`);
    
    if (currentArtwork.id === nextArtwork.id) {
      console.warn('[NAV] WARNING: Next artwork is the same as current! This indicates a duplicate issue.');
    }
  }
  
  current = previousIndex;
  console.log('[NAV] New current index:', current);
  
  // Log the artwork we're navigating to
  const targetProject = currentProject();
  console.log(`[NAV] Navigating to: "${targetProject?.name}" (ID: ${targetProject?.id})`);
  
  if (!targetProject) {
    console.error('[NAV] No target project found! Cannot continue navigation.');
    return;
  }
  
  // Reset seed based on artwork type
  const currentProj = currentProject();
  if (currentProj && currentProj.defaultSeed) {
    // For Peer into the Flow, always start with seed 3
    seed = currentProj.defaultSeed;
    console.log(`[NAV] Reset to default seed ${seed} for ${currentProj.name}`);
  } else if (currentProj && currentProj.editionSize > 1) {
    // For multi-edition artworks like FIELDS, start with a random seed
    seed = getRandSeed(6, currentProj.editionSize);
    console.log(`[NAV] Reset to random seed ${seed} for multi-edition artwork ${currentProj.name} (editionSize: ${currentProj.editionSize})`);
  } else {
    // For single-edition artworks, start with seed 6
    seed = 6;
    console.log(`[NAV] Reset to default seed ${seed} for ${currentProj?.name || 'unknown'}`);
  }
  
  // Reset edition timer to give user time to appreciate the new artwork
  resetEditionTimer();
  
  const newUrl = getUrl();
  console.log('[NAV] New URL:', newUrl);
  
  if (!newUrl) {
    console.error('[NAV] Failed to generate URL for artwork:', targetProject.name);
    return;
  }
  
  // Update viewer first
  viewer.setAttribute("url", newUrl);
  
  // Wait a moment for viewer to update, then update details
  setTimeout(() => {
    updateDetailsPanel();
    
    // Double-check synchronization after a delay
    setTimeout(() => {
      ensureDetailsSync();
    }, 200);
  }, 100);
  
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
  
  // Move to next artwork
  const nextIndex = incrementLoop(current, options.projects.length);
  console.log(`[NAV] Current index: ${current}, Next index: ${nextIndex}, Total projects: ${options.projects.length}`);
  
  // Check if we're actually moving to a different artwork
  const currentArtwork = currentProject();
  const nextArtwork = projects[nextIndex];
  
  if (currentArtwork && nextArtwork) {
    console.log(`[NAV] Moving from: "${currentArtwork.name}" to: "${nextArtwork.name}"`);
    
    if (currentArtwork.id === nextArtwork.id) {
      console.warn('[NAV] WARNING: Next artwork is the same as current! This indicates a duplicate issue.');
    }
  }
  
  current = nextIndex;
  console.log('[NAV] New current index:', current);
  
  // Log the artwork we're navigating to
  const targetProject = currentProject();
  console.log(`[NAV] Navigating to: "${targetProject?.name}" (ID: ${targetProject?.id})`);
  
  // Reset seed based on artwork type
  const currentProj = currentProject();
  if (currentProj && currentProj.defaultSeed) {
    // For Peer into the Flow, always start with seed 3
    seed = currentProj.defaultSeed;
    console.log(`[NAV] Reset to default seed ${seed} for ${currentProj.name}`);
  } else if (currentProj && currentProj.editionSize > 1) {
    // For multi-edition artworks like FIELDS, start with a random seed
    seed = getRandSeed(6, currentProj.editionSize);
    console.log(`[NAV] Reset to random seed ${seed} for multi-edition artwork ${currentProj.name} (editionSize: ${currentProj.editionSize})`);
  } else {
    // For single-edition artworks, start with seed 6
    seed = 6;
    console.log(`[NAV] Reset to default seed ${seed} for ${currentProj?.name || 'unknown'}`);
  }
  
  // Reset edition timer to give user time to appreciate the new artwork
  resetEditionTimer();
  
  const newUrl = getUrl();
  console.log('[NAV] New URL:', newUrl);
  
  // Update viewer first
  viewer.setAttribute("url", newUrl);
  
  // Wait a moment for viewer to update, then update details
  setTimeout(() => {
    updateDetailsPanel();
    
    // Double-check synchronization after a delay
    setTimeout(() => {
      ensureDetailsSync();
    }, 200);
  }, 100);
  
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
  const projectsReady = projects && projects.length > 0;
  const optionsReady = options.projects && options.projects.length > 0;
  
  console.log('[NAV_READY] Navigation readiness check:', {
    projects: projects,
    projectsLength: projects?.length,
    projectsReady: projectsReady,
    options: options,
    optionsProjects: options.projects,
    optionsProjectsLength: options.projects?.length,
    optionsReady: optionsReady,
    overallReady: projectsReady && optionsReady
  });
  
  return projectsReady && optionsReady;
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

  updateProjectInterval(30);
  updateEditionInterval(30);
}

function updateProjectInterval(seconds) {
  if (projectInterval) {
    clearInterval(projectInterval);
  }
  projectInterval = setInterval(() => {
    // Move to next project sequentially
    current = incrementLoop(current, options.projects.length);
    
    // Reset seed based on artwork type
    const currentProj = currentProject();
    if (currentProj && currentProj.defaultSeed) {
      // For Peer into the Flow, always start with seed 3
      seed = currentProj.defaultSeed;
      console.log(`[AUTO_ADVANCE] Reset to default seed ${seed} for ${currentProj.name}`);
    } else {
      // For other artworks, start with seed 6
      seed = 6;
      console.log(`[AUTO_ADVANCE] Reset to default seed ${seed} for ${currentProj?.name || 'unknown'}`);
    }
    
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
    const currentProj = currentProject();
    if (!currentProj) {
      console.log('[EDITION_TIMER] No current project, skipping edition change');
      return;
    }
    
    const oldSeed = seed;
    seed = getRandSeed(seed, currentProj.editionSize);
    
    console.log(`[EDITION_TIMER] Edition change for "${currentProj.name}":`, {
      oldSeed: oldSeed,
      newSeed: seed,
      editionSize: currentProj.editionSize,
      artworkId: currentProj.id
    });
    
    viewer.setAttribute("url", getUrl());
    updateDetailsPanel();
    disableButtons();
  }, seconds * 1000);
}

// Function to reset edition timer when navigating manually
function resetEditionTimer() {
  console.log('[EDITION_TIMER] Resetting edition timer for new artwork');
  if (editionInterval) {
    clearInterval(editionInterval);
  }
  // Restart the edition timer with current timing
  updateEditionInterval(options.timing.edition);
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

  // Use new URL format: contractAddress/editionNumber
  // This creates cleaner URLs like: 0x6d24ce4c32e556313b431fb156edf2060680a998/6
  const finalUrl = `${url}?id=1&address=${address}/${seed}`;
  
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
  console.log('[CURRENT_PROJECT] currentProject called with current:', current);
  console.log('[CURRENT_PROJECT] options.projects:', options.projects);
  console.log('[CURRENT_PROJECT] projects array:', projects);
  
  if (!options.projects || options.projects.length === 0) {
    console.error('[CURRENT_PROJECT] options.projects is empty or undefined!');
    return null;
  }
  
  if (current === undefined || current === null) {
    console.error('[CURRENT_PROJECT] current index is undefined or null!');
    return null;
  }
  
  if (current < 0 || current >= options.projects.length) {
    console.error('[CURRENT_PROJECT] current index out of bounds:', current, 'max:', options.projects.length - 1);
    return null;
  }
  
  const id = options.projects[current];
  console.log("[CURRENT_PROJECT] PROJECT", current, id);
  
  if (!id) {
    console.error('[CURRENT_PROJECT] No project ID found for current index:', current);
    return null;
  }
  
  const proj = projects.find((p) => p.id == id);
  console.log('[CURRENT_PROJECT] Found project:', proj);
  
  if (!proj) {
    console.error('[CURRENT_PROJECT] No project found with ID:', id);
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

// Detect mobile device with enhanced detection
const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|webOS|Windows Phone/i.test(navigator.userAgent);
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isAndroid = /Android/.test(navigator.userAgent);

console.log('[MOBILE_DETECTION] User Agent:', navigator.userAgent);
console.log('[MOBILE_DETECTION] Is Mobile Device:', isMobile);
console.log('[MOBILE_DETECTION] Is iOS:', isIOS);
console.log('[MOBILE_DETECTION] Is Android:', isAndroid);
console.log('🚀 MOBILE FIX DEPLOYED - Mobile devices should default to Desktop Experiences');
console.log('🚀 Current default playlist:', isMobile ? 'desktop-experiences' : 'gesture-control');

// Function to ensure mobile-safe settings
function ensureMobileSafeSettings() {
  if (isMobile) {
    console.log('[MOBILE_SAFETY] Applying mobile-safe settings...');
    
    // Disable QR codes completely on mobile
    options.display.qr = false;
    
    // Disable any camera-related features
    if (cameraStream) {
      console.log('[MOBILE_SAFETY] Stopping camera stream on mobile');
      cameraStream.getTracks().forEach(track => {
        track.stop();
        console.log('[MOBILE_SAFETY] Camera track stopped:', track.kind);
      });
      cameraStream = null;
    }
    
    // Ensure no camera permissions are requested
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log('[MOBILE_SAFETY] Camera API available but will not be used on mobile');
    }
    
    console.log('[MOBILE_SAFETY] Mobile-safe settings applied');
  }
}

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
  
  // Disable QR codes and camera features on mobile
  options.display.qr = false;
  console.log('[MOBILE_FILTER] QR codes disabled on mobile device');
  
  // Ensure no camera access on mobile
  if (cameraStream) {
    console.log('[MOBILE_FILTER] Stopping any existing camera stream on mobile');
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
}

// Only request camera access once on mobile
let cameraStream = null;
async function requestCameraOnce() {
  if (isMobile) {
    console.log('[CAMERA] Mobile device detected - skipping camera request');
    return; // Do not request camera on mobile
  }
  
  if (!cameraStream) {
    try {
      console.log('[CAMERA] Requesting camera access for desktop device...');
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      console.log('[CAMERA] Camera access granted for desktop device');
      // Use cameraStream for gesture artworks
    } catch (err) {
      console.error('[CAMERA] Camera access error:', err);
    }
  }
}

// Define the playlists at the top of main.js
const gestureControlPlaylist = [
  "Shadows-Touch-Across-Time",
  "Optical-Verlet", 
  "Dissolvi"
];

// Simplified function to fetch only Peer into the Flow from Graph API
async function fetchPeerIntoFlow() {
  // Try multiple possible endpoints
  const endpoints = [
    "https://api.thegraph.com/subgraphs/name/olta-art/polygon-v1",
    "https://api.thegraph.com/subgraphs/name/olta-art/arbitrum-v1",
    "https://gateway-arbitrum.network.thegraph.com/api/subgraphs/id/3eGGTUNpbmzMZx2UrHyDzWTKa0eawGpPPUuJQSxg3LZQ"
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`[GRAPH_API] Trying endpoint: ${endpoint}`);
      
      const resp = await queryfetcher(endpoint, getPeerIntoFlowQuery());
      
      if (resp.projects && resp.projects.length > 0) {
        const peerIntoFlow = resp.projects[0];
        console.log(`[GRAPH_API] Successfully fetched Peer into the Flow from ${endpoint}:`, peerIntoFlow);
        
        // Update the static artwork with real-time data
        const staticPeerIntoFlow = staticArtworks.find(art => art.id === PEER_INTO_FLOW_ID);
        if (staticPeerIntoFlow) {
          // Update edition size and other dynamic data
          staticPeerIntoFlow.editionSize = peerIntoFlow.editionSize || 1;
          staticPeerIntoFlow.name = peerIntoFlow.name || staticPeerIntoFlow.name;
          staticPeerIntoFlow.description = peerIntoFlow.description || staticPeerIntoFlow.description;
          staticPeerIntoFlow.creator = peerIntoFlow.creator || staticPeerIntoFlow.creator;
          if (peerIntoFlow.lastAddedVersion?.animation?.url) {
            staticPeerIntoFlow.lastAddedVersion.animation.url = peerIntoFlow.lastAddedVersion.animation.url;
          }
          console.log(`[GRAPH_API] Updated Peer into the Flow with real-time data from ${endpoint}. Edition size:`, peerIntoFlow.editionSize);
        }
        return peerIntoFlow;
      } else {
        console.warn(`[GRAPH_API] No Peer into the Flow data returned from ${endpoint}`);
      }
    } catch (error) {
      console.error(`[GRAPH_API] Failed to fetch from ${endpoint}:`, error);
      continue; // Try next endpoint
    }
  }
  
  // If all endpoints fail, fall back to static data
  console.error('[GRAPH_API] All Graph API endpoints failed. Falling back to static data for Peer into the Flow');
  
  const staticPeerIntoFlow = staticArtworks.find(art => art.id === PEER_INTO_FLOW_ID);
  if (staticPeerIntoFlow) {
    // Set a reasonable edition size for frontend randomization
    staticPeerIntoFlow.editionSize = 50; // Fallback edition size
    console.log('[GRAPH_API] Using fallback edition size:', staticPeerIntoFlow.editionSize);
    console.log('[GRAPH_API] Static Peer into the Flow data:', {
      name: staticPeerIntoFlow.name,
      id: staticPeerIntoFlow.id,
      editionSize: staticPeerIntoFlow.editionSize
    });
  } else {
    console.error('[GRAPH_API] Could not find static Peer into the Flow artwork!');
  }
  
  console.log('[GRAPH_API] Fallback completed. Static artworks ready:', staticArtworks.map(a => a.name));
  
  return null;
}

// Main initialization function - simplified
(async function initializeApp() {
  try {
    console.log('[INIT] Starting app initialization...');
    console.log('[INIT] Device type:', isMobile ? 'Mobile' : 'Desktop');
    
    // Apply mobile-safe settings early
    ensureMobileSafeSettings();
    
    // Only request camera on desktop devices
    if (!isMobile) {
      console.log('[INIT] Desktop device detected - requesting camera access...');
      await requestCameraOnce();
    } else {
      console.log('[INIT] Mobile device detected - skipping camera request');
    }
    
    // Only fetch Peer into the Flow from Graph API with timeout
    console.log('[INIT] Starting Graph API fetch for Peer into the Flow...');
    
    // Add timeout to prevent hanging on Graph API
    const graphApiPromise = fetchPeerIntoFlow();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Graph API timeout')), 3000) // Reduced from 10000 to 3000 (3 seconds)
    );
    
    try {
      await Promise.race([graphApiPromise, timeoutPromise]);
      console.log('[INIT] Graph API fetch completed');
    } catch (error) {
      console.warn('[INIT] Graph API fetch failed or timed out, continuing with static data');
    }
    
    // All other artworks are now static and ready to use
    console.log('[INIT] App initialized with static artworks + real-time Peer into the Flow data');
    console.log('[INIT] Available static artworks:', staticArtworks.map(art => art.name));
    console.log('[INIT] Static artworks count:', staticArtworks.length);
    
    // Verify all required artworks are present
    const requiredArtworkIds = [
      '0x510da17477baa0a23858c59e9bf80b8d8ad1b6ee', // FIELDS
      '0x6d24ce4c32e556313b431fb156edf2060680a998', // Peer into the Flow
      '0xe94100850ee7507dd57eb1ba67dc0600b18122df', // Morphed Radiance
      'Faded-Memories'
      // Removed "Meanwhile" to fix duplication issues
    ];
    
    console.log('[INIT] Checking required artwork IDs...');
    let allArtworksFound = true;
    requiredArtworkIds.forEach(id => {
      const found = staticArtworks.find(art => art.id === id);
      if (found) {
        console.log(`[INIT] ✅ Found: ${found.name} (${id})`);
      } else {
        console.error(`[INIT] ❌ Missing: ${id}`);
        allArtworksFound = false;
      }
    });
    
    if (!allArtworksFound) {
      console.error('[INIT] Some required artworks are missing! Playlist may not work properly.');
    } else {
      console.log('[INIT] All required artworks found! ✅');
    }
    
    // Handle initial URL routing after everything is loaded
    console.log('[FINAL_INIT] Handling URL routing after all projects fully loaded');
    handleInitialUrlRouting();

    // Only render options if needed for UI
    renderOptions();

    // Set up periodic synchronization check to prevent details panel drift
    setInterval(() => {
      ensureDetailsSync();
    }, 5000); // Check every 5 seconds

    console.log('[INIT] App initialization completed successfully!');
    
  } catch (error) {
    console.error('[INIT] Critical error during app initialization:', error);
    
    // Emergency fallback - try to load playlist anyway
    console.log('[INIT] Attempting emergency playlist load...');
    try {
      handleInitialUrlRouting();
    } catch (fallbackError) {
      console.error('[INIT] Emergency fallback also failed:', fallbackError);
    }
  }
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
  try {
    console.log('[DETAILS] Updating details panel...');
    
    const currentProj = currentProject();
    if (!currentProj) {
      console.error('[DETAILS] No current project found!');
      return;
    }
    
    console.log('[DETAILS] Current project:', currentProj.name);
    
    const detailsObj = getDetails();
    if (!detailsObj) {
      console.error('[DETAILS] Failed to get details for project:', currentProj.name);
      return;
    }
    
    const { name, description, creator } = detailsObj;
    console.log('[DETAILS] Setting details:', { name, creator, description });
    
    // Update details with error handling for each attribute
    try {
      details.setAttribute("name", name || "");
      console.log('[DETAILS] Name set to:', name);
    } catch (e) {
      console.error('[DETAILS] Failed to set name:', e);
    }
    
    try {
      details.setAttribute("description", description || "");
      console.log('[DETAILS] Description set to:', description);
    } catch (e) {
      console.error('[DETAILS] Failed to set description:', e);
    }
    
    try {
      details.setAttribute("creator", creator || "");
      console.log('[DETAILS] Creator set to:', creator);
    } catch (e) {
      console.error('[DETAILS] Failed to set creator:', e);
    }
    
    // Set QR code attribute with better error handling and mobile safety
    try {
      if (isMobile) {
        // Disable QR codes on mobile devices
        details.setAttribute("qrcode", "");
        console.log('[DETAILS] QR code disabled on mobile device');
      } else if (currentProj.qrCodeUrl) {
        details.setAttribute("qrcode", currentProj.qrCodeUrl);
        console.log('[DETAILS] QR code set to:', currentProj.qrCodeUrl);
      } else {
        // fallback to artwork URL or project page
        const artworkUrl = currentProj.lastAddedVersion?.animation?.url;
        if (artworkUrl) {
          details.setAttribute("qrcode", artworkUrl);
          console.log('[DETAILS] QR code fallback to artwork URL:', artworkUrl);
        } else if (currentProj.id) {
          const fallbackUrl = `https://nft.olta.art/project/${currentProj.id}`;
          details.setAttribute("qrcode", fallbackUrl);
          console.log('[DETAILS] QR code fallback to project page:', fallbackUrl);
        }
      }
    } catch (e) {
      console.error('[DETAILS] Failed to set QR code:', e);
    }
    
    console.log('[DETAILS] Details panel update completed successfully');
    
    // Force a re-render of the details component
    setTimeout(() => {
      try {
        if (details.shadowRoot) {
          const nameSlot = details.shadowRoot.querySelector('slot[name="name"]');
          const creatorSlot = details.shadowRoot.querySelector('slot[name="creator"]');
          if (nameSlot && nameSlot.textContent !== name) {
            console.warn('[DETAILS] Name slot content mismatch, forcing update');
            nameSlot.textContent = name || "";
          }
          if (creatorSlot && creatorSlot.textContent !== creator) {
            console.warn('[DETAILS] Creator slot content mismatch, forcing update');
            creatorSlot.textContent = creator || "";
          }
        }
      } catch (e) {
        console.error('[DETAILS] Failed to force re-render:', e);
      }
    }, 100);
    
  } catch (error) {
    console.error('[DETAILS] Critical error updating details panel:', error);
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
    const defaultPlaylist = isMobile ? 'desktop-experiences' : 'gesture-control';
    playlistDropdown.value = defaultPlaylist;
    
    // Update playlist header immediately based on device type
    const playlistHeader = document.getElementById('playlist-header');
    if (playlistHeader) {
      const title = playlistHeader.querySelector('.playlist-title');
      const desc = playlistHeader.querySelector('.playlist-description');
      if (defaultPlaylist === 'desktop-experiences') {
        if (title) title.textContent = 'Desktop Experiences';
        if (desc) desc.textContent = 'Interactive digital artworks for desktop viewing';
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
      '0x510da17477baa0a23858c59e9bf80b8d8ad1b6ee', // FIELDS
      '0x6d24ce4c32e556313b431fb156edf2060680a998', // Peer into the Flow
      '0xe94100850ee7507dd57eb1ba67dc0600b18122df', // Morphed Radiance
      'Faded-Memories'
      // Removed "Meanwhile" to fix duplication issues
    ]
  }
};

// Default playlist - use desktop experiences on mobile to avoid camera/gesture issues
let currentPlaylistId = isMobile ? 'desktop-experiences' : 'gesture-control';

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
  console.log('[INIT_ROUTE] Available static artworks:', staticArtworks.length);
  console.log('[INIT_ROUTE] Static artwork names:', staticArtworks.map(a => a.name));
  
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
  
  // Default to desktop-experiences on mobile, gesture-control on desktop
  const defaultPlaylist = isMobile ? 'desktop-experiences' : 'gesture-control';
  console.log(`[INIT_ROUTE] Using default playlist for ${isMobile ? 'mobile' : 'desktop'}: ${defaultPlaylist}`);
  console.log(`[INIT_ROUTE] About to call switchPlaylist('${defaultPlaylist}')`);
  switchPlaylist(defaultPlaylist);
}

// Function to check for duplicate artworks in playlist
function checkForDuplicateArtworks(playlistProjects) {
  const seen = new Set();
  const duplicates = [];
  
  playlistProjects.forEach(project => {
    if (seen.has(project.id)) {
      duplicates.push(project.id);
    } else {
      seen.add(project.id);
    }
  });
  
  if (duplicates.length > 0) {
    console.warn('[DUPLICATE_CHECK] Found duplicate artworks:', duplicates);
    return true;
  }
  
  console.log('[DUPLICATE_CHECK] No duplicate artworks found');
  return false;
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
  
  // Use filteredStaticArtworks for mobile, regular staticArtworks for desktop
  const availableArtworks = isMobile ? filteredStaticArtworks : staticArtworks;
  
  console.log('[SWITCH] Available artworks:', availableArtworks.map(a => ({ id: a.id, name: a.name })));
  console.log('[SWITCH] Playlist artwork IDs:', playlist.artworks);
  console.log('[SWITCH] Total available artworks:', availableArtworks.length);
  console.log('[SWITCH] Total playlist artwork IDs:', playlist.artworks.length);
  
  // Build playlist from available artworks with STRICT duplicate prevention
  const playlistProjects = [];
  const seenIds = new Set();
  
  playlist.artworks.forEach(id => {
    // Skip if we've already seen this ID
    if (seenIds.has(id)) {
      console.warn(`[SWITCH] SKIPPING duplicate artwork ID: ${id}`);
      return;
    }
    
    const found = availableArtworks.find(project => project.id === id);
    if (!found) {
      console.warn(`[SWITCH] Artwork with ID ${id} not found in available artworks`);
    } else {
      console.log(`[SWITCH] Adding artwork: ${found.name} (${found.id})`);
      playlistProjects.push(found);
      seenIds.add(id); // Mark this ID as seen
    }
  });

  console.log('[SWITCH] Final playlist projects (after duplicate prevention):', playlistProjects.map(p => ({ id: p.id, name: p.name })));
  console.log('[SWITCH] Playlist projects length:', playlistProjects.length);

  // CRITICAL: Verify no duplicates exist
  const finalIds = playlistProjects.map(p => p.id);
  const uniqueIds = [...new Set(finalIds)];
  
  if (finalIds.length !== uniqueIds.length) {
    console.error('[SWITCH] CRITICAL: Duplicates still exist after prevention!');
    console.error('[SWITCH] Final IDs:', finalIds);
    console.error('[SWITCH] Unique IDs:', uniqueIds);
    
    // Force deduplication as emergency measure
    const emergencyProjects = [];
    const emergencySeen = new Set();
    
    playlistProjects.forEach(project => {
      if (!emergencySeen.has(project.id)) {
        emergencyProjects.push(project);
        emergencySeen.add(project.id);
      }
    });
    
    console.log('[SWITCH] Emergency deduplication applied');
    playlistProjects.length = 0;
    playlistProjects.push(...emergencyProjects);
  }

  // Set the projects arrays
  projects = playlistProjects;
  options.projects = projects.map(p => p.id);

  console.log('[SWITCH] Final projects array:', projects.map(p => ({ id: p.id, name: p.name })));
  console.log('[SWITCH] Final options.projects:', options.projects);
  console.log('[SWITCH] Current index before setting:', current);

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

  // Set initial seed based on artwork type
  const currentProj = currentProject();
  if (currentProj && currentProj.defaultSeed) {
    // For Peer into the Flow, always start with seed 3
    seed = currentProj.defaultSeed;
    console.log(`[INIT_ROUTE] Set initial seed ${seed} for ${currentProj.name}`);
  } else if (currentProj && currentProj.editionSize > 1) {
    // For multi-edition artworks like FIELDS, start with a random seed
    seed = getRandSeed(6, currentProj.editionSize);
    console.log(`[INIT_ROUTE] Set random seed ${seed} for multi-edition artwork ${currentProj.name} (editionSize: ${currentProj.editionSize})`);
  } else {
    // For single-edition artworks, start with seed 6
    seed = 6;
    console.log(`[INIT_ROUTE] Set initial seed ${seed} for ${currentProj?.name || 'unknown'}`);
  }

  // Update viewer and details
  if (projects.length > 0) {
    // Reset seed based on artwork type
    const currentProj = currentProject();
    if (currentProj && currentProj.defaultSeed) {
      // For Peer into the Flow, always start with seed 3
      seed = currentProj.defaultSeed;
      console.log(`[SWITCH] Reset to default seed ${seed} for ${currentProj.name}`);
    } else {
      // For other artworks, start with seed 6
      seed = 6;
      console.log(`[SWITCH] Reset to default seed ${seed} for ${currentProj?.name || 'unknown'}`);
    }
    
    if (currentProject().editionSize > 1) {
      seed = getRandSeed(seed, currentProject().editionSize);
    }
    
    // Update viewer first
    viewer.setAttribute("url", getUrl());
    
    // Wait for viewer to update, then update details with synchronization check
    setTimeout(() => {
      updateDetailsPanel();
      
      // Double-check synchronization after a delay
      setTimeout(() => {
        ensureDetailsSync();
      }, 200);
    }, 100);
    
    setCurrentProjectIdGlobal();
    updateGlobalVariables();
    
    // Reset edition timer when switching playlists
    resetEditionTimer();
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

// Add a comprehensive test function to diagnose issues
window.testPlaylistState = function() {
  console.log('=== PLAYLIST STATE DIAGNOSTIC ===');
  console.log('Current playlist ID:', currentPlaylistId);
  console.log('Projects array:', projects);
  console.log('Projects length:', projects?.length);
  console.log('Options projects:', options.projects);
  console.log('Options projects length:', options.projects?.length);
  console.log('Current index:', current);
  console.log('Navigation ready:', isNavigationReady());
  console.log('Available playlists:', Object.keys(playlists));
  
  if (projects && projects.length > 0) {
    console.log('Current project:', currentProject());
    console.log('All projects in playlist:');
    projects.forEach((p, i) => {
      console.log(`  ${i}: ${p.name} (${p.id})`);
    });
  }
  
  console.log('Static artworks:', staticArtworks.map(a => ({ name: a.name, id: a.id })));
  console.log('Filtered static artworks:', filteredStaticArtworks.map(a => ({ name: a.name, id: a.id })));
  console.log('=== END DIAGNOSTIC ===');
};

// Add a function to manually switch playlists for testing
window.forceSwitchPlaylist = function(playlistId) {
  console.log(`[FORCE_SWITCH] Manually switching to playlist: ${playlistId}`);
  switchPlaylist(playlistId);
};

// Add a function to manually load the desktop playlist if automatic loading fails
window.emergencyLoadDesktopPlaylist = function() {
  console.log('[EMERGENCY_LOAD] Manually loading desktop playlist...');
  
  // Check if static artworks are available
  if (!staticArtworks || staticArtworks.length === 0) {
    console.error('[EMERGENCY_LOAD] No static artworks available!');
    return;
  }
  
  console.log('[EMERGENCY_LOAD] Available static artworks:', staticArtworks.map(a => a.name));
  
  // Manually set up the desktop playlist (without Meanwhile)
  const desktopPlaylistIds = [
    '0x510da17477baa0a23858c59e9bf80b8d8ad1b6ee', // FIELDS
    '0x6d24ce4c32e556313b431fb156edf2060680a998', // Peer into the Flow
    '0xe94100850ee7507dd57eb1ba67dc0600b18122df', // Morphed Radiance
    'Faded-Memories'
    // Removed "Meanwhile" to fix duplication issues
  ];
  
  // Build playlist manually
  const playlistProjects = desktopPlaylistIds
    .map(id => staticArtworks.find(project => project.id === id))
    .filter(Boolean);
  
  console.log('[EMERGENCY_LOAD] Built playlist projects:', playlistProjects.map(p => p.name));
  
  if (playlistProjects.length === 0) {
    console.error('[EMERGENCY_LOAD] No playlist projects found!');
    return;
  }
  
  // Set up the playlist
  projects = playlistProjects;
  options.projects = projects.map(p => p.id);
  current = 0;
  currentPlaylistId = 'desktop-experiences';
  window.currentPlaylistId = currentPlaylistId;
  
  console.log('[EMERGENCY_LOAD] Playlist set up successfully!');
  console.log('[EMERGENCY_LOAD] Projects:', projects.map(p => p.name));
  console.log('[EMERGENCY_LOAD] Current index:', current);
  
  // Update viewer and details
  if (projects.length > 0) {
    const currentProj = currentProject();
    if (currentProj && currentProj.defaultSeed) {
      seed = currentProj.defaultSeed;
    } else {
      seed = 6;
    }
    
    viewer.setAttribute("url", getUrl());
    updateDetailsPanel();
    setCurrentProjectIdGlobal();
    updateGlobalVariables();
    
    console.log('[EMERGENCY_LOAD] Viewer and details updated successfully!');
  }
};

// Add a function to immediately clean up the current corrupted playlist
window.emergencyCleanupPlaylist = function() {
  console.log('[EMERGENCY_CLEANUP] Starting emergency playlist cleanup...');
  
  if (!projects || projects.length === 0) {
    console.log('[EMERGENCY_CLEANUP] No projects to clean up');
    return;
  }
  
  console.log(`[EMERGENCY_CLEANUP] Current playlist has ${projects.length} projects (likely corrupted)`);
  
  // Get the expected artwork IDs for the current playlist
  const expectedIds = playlists[currentPlaylistId]?.artworks || [];
  console.log('[EMERGENCY_CLEANUP] Expected artwork IDs:', expectedIds);
  
  // Build a clean playlist with only the expected artworks
  const cleanProjects = [];
  const seenIds = new Set();
  
  expectedIds.forEach(id => {
    if (seenIds.has(id)) {
      console.log(`[EMERGENCY_CLEANUP] Skipping duplicate expected ID: ${id}`);
      return;
    }
    
    const found = staticArtworks.find(art => art.id === id);
    if (found) {
      cleanProjects.push(found);
      seenIds.add(id);
      console.log(`[EMERGENCY_CLEANUP] Added: ${found.name} (${found.id})`);
    } else {
      console.warn(`[EMERGENCY_CLEANUP] Expected artwork not found: ${id}`);
    }
  });
  
  if (cleanProjects.length === 0) {
    console.error('[EMERGENCY_CLEANUP] No clean projects found!');
    return;
  }
  
  // Replace the corrupted playlist
  projects = cleanProjects;
  options.projects = projects.map(p => p.id);
  
  // Reset current index
  current = 0;
  
  console.log(`[EMERGENCY_CLEANUP] Playlist cleaned! Now has ${projects.length} unique artworks:`);
  projects.forEach((p, i) => {
    console.log(`  ${i}: ${p.name} (${p.id})`);
  });
  
  // Update viewer and details
  const currentProj = currentProject();
  if (currentProj && currentProj.defaultSeed) {
    seed = currentProj.defaultSeed;
  } else {
    seed = 6;
  }
  
  viewer.setAttribute("url", getUrl());
  updateDetailsPanel();
  setCurrentProjectIdGlobal();
  updateGlobalVariables();
  
  console.log('[EMERGENCY_CLEANUP] Viewer and details updated successfully!');
  console.log('[EMERGENCY_CLEANUP] Navigation should now work properly!');
};

// Add a function to check for duplicate artworks in the current playlist
window.checkCurrentPlaylistForDuplicates = function() {
  console.log('=== CURRENT PLAYLIST DUPLICATE CHECK ===');
  
  if (!projects || projects.length === 0) {
    console.log('No projects loaded in playlist');
    return;
  }
  
  console.log('Current playlist projects:');
  projects.forEach((project, index) => {
    console.log(`  ${index}: ${project.name} (${project.id})`);
  });
  
  // Check for duplicates
  const seen = new Set();
  const duplicates = [];
  
  projects.forEach((project, index) => {
    if (seen.has(project.id)) {
      duplicates.push({ index, project });
    } else {
      seen.add(project.id);
    }
  });
  
  if (duplicates.length > 0) {
    console.error('❌ DUPLICATE ARTWORKS FOUND:');
    duplicates.forEach(dup => {
      console.error(`  Index ${dup.index}: ${dup.project.name} (${dup.project.id})`);
    });
    
    // Show where the duplicates are
    console.log('Duplicate locations:');
    projects.forEach((project, index) => {
      if (duplicates.some(d => d.project.id === project.id)) {
        console.log(`  Index ${index}: ${project.name} (${project.id}) - DUPLICATE`);
      }
    });
  } else {
    console.log('✅ No duplicate artworks found');
  }
  
  // Check current index
  console.log(`Current index: ${current}`);
  if (current >= 0 && current < projects.length) {
    console.log(`Current artwork: ${projects[current].name} (${projects[current].id})`);
  } else {
    console.error(`❌ Current index ${current} is out of bounds!`);
  }
  
  console.log('=== END DUPLICATE CHECK ===');
};

// Add a function to manually fix the playlist by removing duplicates
window.fixPlaylistDuplicates = function() {
  console.log('[FIX] Attempting to fix playlist duplicates...');
  
  if (!projects || projects.length === 0) {
    console.log('[FIX] No projects to fix');
    return;
  }
  
  // Remove duplicates by keeping only the first occurrence
  const uniqueProjects = [];
  const seenIds = new Set();
  
  projects.forEach(project => {
    if (!seenIds.has(project.id)) {
      uniqueProjects.push(project);
      seenIds.add(project.id);
      console.log(`[FIX] Keeping: ${project.name} (${project.id})`);
    } else {
      console.log(`[FIX] Removing duplicate: ${project.name} (${project.id})`);
    }
  });
  
  // Update the playlist
  projects = uniqueProjects;
  options.projects = projects.map(p => p.id);
  
  // Reset current index if it's out of bounds
  if (current >= projects.length) {
    current = 0;
    console.log(`[FIX] Reset current index to 0 (was ${current})`);
  }
  
  console.log(`[FIX] Playlist fixed! Now has ${projects.length} unique artworks`);
  console.log('[FIX] Updated projects:', projects.map(p => p.name));
  
  // Update viewer and details
  if (projects.length > 0) {
    const currentProj = currentProject();
    if (currentProj && currentProj.defaultSeed) {
      seed = currentProj.defaultSeed;
    } else {
      seed = 6;
    }
    
    viewer.setAttribute("url", getUrl());
    updateDetailsPanel();
    setCurrentProjectIdGlobal();
    updateGlobalVariables();
    
    console.log('[FIX] Viewer and details updated successfully!');
  }
};

// Add a function to test FIELDS edition randomization
window.testFieldsRandomization = function() {
  console.log('=== FIELDS EDITION RANDOMIZATION TEST ===');
  
  // Find FIELDS artwork
  const fieldsArtwork = staticArtworks.find(art => art.id === '0x510da17477baa0a23858c59e9bf80b8d8ad1b6ee');
  
  if (!fieldsArtwork) {
    console.error('FIELDS artwork not found!');
    return;
  }
  
  console.log('FIELDS artwork details:', {
    name: fieldsArtwork.name,
    id: fieldsArtwork.id,
    editionSize: fieldsArtwork.editionSize,
    currentSeed: seed
  });
  
  // Test random seed generation
  console.log('Testing random seed generation:');
  for (let i = 0; i < 5; i++) {
    const testSeed = getRandSeed(seed, fieldsArtwork.editionSize);
    console.log(`  Test ${i + 1}: Current seed ${seed} → New seed ${testSeed}`);
  }
  
  // Show current URL
  const currentUrl = getUrl();
  console.log('Current FIELDS URL:', currentUrl);
  
  // Test edition change
  console.log('Simulating edition change...');
  const oldSeed = seed;
  seed = getRandSeed(seed, fieldsArtwork.editionSize);
  const newUrl = getUrl();
  
  console.log('Edition change result:', {
    oldSeed: oldSeed,
    newSeed: seed,
    oldUrl: currentUrl,
    newUrl: newUrl
  });
  
  console.log('=== END TEST ===');
};

