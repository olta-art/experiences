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
  },
  
  // Adding the missing API projects as static artworks for now
  // Using working URLs that can be embedded in iframes
  {
    id: "0x510da17477ba0a23858c59e9bf80b8d8ad1b6ee",
    name: "FIELDS",
    description: "Interactive digital artwork",
    creator: { profile: { name: "Artist" } },
    editionSize: 1,
    symbol: "STATIC3",
    lastAddedVersion: {
      animation: { url: "https://dissolvi-olta.vercel.app/" }
    },
    qrCodeUrl: "https://nft.olta.art/project/0x510da17477ba0a23858c59e9bf80b8d8ad1b6ee"
  },
  
  {
    id: "0x6d24ce4c32e556313b431fb156edf2060680a998",
    name: "Peer into the Flow",
    description: "Interactive digital artwork",
    creator: { profile: { name: "Artist" } },
    editionSize: 66, // Changed to 66 editions to cycle through different ones
    symbol: "API_EDITIONS", // Changed to indicate this has editions
    lastAddedVersion: {
      animation: { url: "https://epok.tech/shadows-touch-across-time-demo/" }
    },
    qrCodeUrl: "https://nft.olta.art/project/0x6d24ce4c32e556313b431fb156edf2060680a998"
  },
  
  {
    id: "0x29b58c3146fc013913f987501d91ce1babcf8e32",
    name: "Meanwhile",
    description: "Interactive digital artwork",
    creator: { profile: { name: "Artist" } },
    editionSize: 1,
    symbol: "STATIC5",
    lastAddedVersion: {
      animation: { url: "https://nft.olta.art/project/0x29b58c3146fc013913f987501d91ce1babcf8e32" }
    },
    qrCodeUrl: "https://nft.olta.art/project/0x29b58c3146fc013913f987501d91ce1babcf8e32"
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
  
  // IMPORTANT: Reset seed to 1 when moving to a new project
  // This prevents cycling through editions of the same project
  seed = 1;
  console.log('[NAV] Reset seed to 1 for new project');
  
  // IMPORTANT: Allow Peer into the Flow to cycle through editions, but keep other static artworks static
  const currentProj = currentProject();
  const isRealApiProject = currentProj && 
                          currentProj.id.startsWith('0x') && 
                          currentProj.editionSize > 1 && 
                          !currentProj.symbol?.startsWith('STATIC') &&
                          !currentProj.name?.includes('Meanwhile'); // Keep Meanwhile as static
  
  if (isRealApiProject) {
    seed = getRandSeed(seed, currentProj.editionSize);
    console.log('[NAV] New real API project has multiple editions, set seed to:', seed);
  } else {
    // Force seed to 1 for all static artworks and known single-edition projects
    seed = 1;
    console.log('[NAV] Static artwork or single edition - forcing seed to 1');
    console.log('[NAV] Project details:', {
      name: currentProj?.name,
      symbol: currentProj?.symbol,
      editionSize: currentProj?.editionSize,
      id: currentProj?.id
    });
  }
  const newUrl = getUrl();
  console.log('[NAV] New URL:', newUrl);
  
  viewer.setAttribute("url", newUrl);
  
  // Force details panel update with a small delay to ensure viewer has loaded
  setTimeout(() => {
    updateDetailsPanel();
    console.log('[NAV] Details panel updated after delay');
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
  
  const oldCurrent = current;
  current = incrementLoop(current, options.projects.length);
  console.log('[NAV] Index changed from', oldCurrent, 'to', current);
  
  // Debug the current project lookup
  console.log('[NAV] Looking for project at index', current);
  console.log('[NAV] options.projects[current]:', options.projects[current]);
  console.log('[NAV] projects array:', projects.map(p => ({ id: p.id, name: p.name })));
  
  const currentProj = currentProject();
  console.log('[NAV] currentProject() result:', currentProj);
  
  // IMPORTANT: Reset seed to 1 when moving to a new project
  // This prevents cycling through editions of the same project
  seed = 1;
  console.log('[NAV] Reset seed to 1 for new project');
  
  // IMPORTANT: Allow Peer into the Flow to cycle through editions, but keep other static artworks static
  const isRealApiProject = currentProj && 
                          currentProj.id.startsWith('0x') && 
                          currentProj.editionSize > 1 && 
                          !currentProj.symbol?.startsWith('STATIC') &&
                          !currentProj.name?.includes('Meanwhile'); // Keep Meanwhile as static
  
  if (isRealApiProject) {
    seed = getRandSeed(seed, currentProj.editionSize);
    console.log('[NAV] New real API project has multiple editions, set seed to:', seed);
  } else {
    // Force seed to 1 for all static artworks and known single-edition projects
    seed = 1;
    console.log('[NAV] Static artwork or single edition - forcing seed to 1');
    console.log('[NAV] Project details:', {
      name: currentProj?.name,
      symbol: currentProj?.symbol,
      editionSize: currentProj?.editionSize,
      id: currentProj?.id
    });
  }
  
  const newUrl = getUrl();
  console.log('[NAV] New URL:', newUrl);
  
  if (newUrl) {
    viewer.setAttribute("url", newUrl);
    
    // Force details panel update with a small delay to ensure viewer has loaded
    setTimeout(() => {
      updateDetailsPanel();
      console.log('[NAV] Details panel updated after delay');
    }, 100);
    
    change.classList = "change spin";
    disableButtons();
    setCurrentProjectIdGlobal();
    updateGlobalVariables();
    showArtworkChangeFeedback('Artwork changed (via Next button)');
    updateUrlParam();
  } else {
    console.error('[NAV] getUrl() returned null - cannot update viewer');
    // Revert the current index if we can't get a URL
    current = oldCurrent;
  }
  
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
  const ready = projects && projects.length > 0 && options.projects && options.projects.length > 0;
  console.log('[NAV_READY] Navigation ready check:', {
    projects: !!projects,
    projectsLength: projects?.length || 0,
    optionsProjects: !!options.projects,
    optionsProjectsLength: options.projects?.length || 0,
    ready: ready
  });
  return ready;
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
  
  // Test getUrl function
  console.log('=== TESTING getUrl ===');
  const testUrl = getUrl();
  console.log('getUrl() result:', testUrl);
  
  // Test currentProject function
  console.log('=== TESTING currentProject ===');
  const testProject = currentProject();
  console.log('currentProject() result:', testProject);
  
  // Test project lookup
  console.log('=== TESTING PROJECT LOOKUP ===');
  if (options.projects && options.projects[current]) {
    const projectId = options.projects[current];
    console.log('Project ID at current index:', projectId);
    const foundProject = projects.find(p => p.id === projectId);
    console.log('Found project:', foundProject);
  }
};

// Add a function to test navigation buttons directly
window.testNavigationButtons = function() {
  console.log('=== TESTING NAVIGATION BUTTONS ===');
  
  // Check if buttons exist in DOM
  const prevBtn = document.querySelector('.previous');
  const nextBtn = document.querySelector('.change');
  console.log('Buttons found:', { prevBtn: !!prevBtn, nextBtn: !!nextBtn });
  
  // Check if event listeners are attached
  if (prevBtn) {
    console.log('Previous button event listeners:', prevBtn.onclick);
  }
  if (nextBtn) {
    console.log('Next button event listeners:', nextBtn.onclick);
  }
  
  // Test manual navigation function calls
  console.log('Testing manual navigation...');
  try {
    console.log('Calling navigateToPrevious...');
    navigateToPrevious();
  } catch (error) {
    console.error('Error calling navigateToPrevious:', error);
  }
  
  // Wait a bit then test next
  setTimeout(() => {
    try {
      console.log('Calling navigateToNext...');
      navigateToNext();
    } catch (error) {
      console.error('Error calling navigateToNext:', error);
    }
  }, 1000);
  
  console.log('=== END NAVIGATION BUTTON TEST ===');
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

// Add a test function to check if artwork URLs are working
window.testArtworkUrls = function() {
  console.log('=== ARTWORK URL TEST ===');
  
  if (!projects || projects.length === 0) {
    console.log('❌ No projects available');
    return;
  }
  
  projects.forEach((project, index) => {
    console.log(`[${index}] ${project.name}:`);
    console.log(`  ID: ${project.id}`);
    console.log(`  Animation URL: ${project.lastAddedVersion?.animation?.url || 'MISSING'}`);
    console.log(`  QR URL: ${project.qrCodeUrl || 'MISSING'}`);
    
    // Test if the URL can be loaded
    if (project.lastAddedVersion?.animation?.url) {
      const testUrl = project.lastAddedVersion.animation.url;
      console.log(`  Testing URL: ${testUrl}`);
      
      // Try to create an iframe to test if it loads
      const testFrame = document.createElement('iframe');
      testFrame.style.display = 'none';
      testFrame.src = testUrl;
      testFrame.onload = () => console.log(`  ✅ ${project.name} URL loaded successfully`);
      testFrame.onerror = () => console.log(`  ❌ ${project.name} URL failed to load`);
      
      // Set a timeout to remove the test frame
      setTimeout(() => {
        if (testFrame.parentNode) {
          testFrame.parentNode.removeChild(testFrame);
        }
      }, 5000);
      
      document.body.appendChild(testFrame);
    }
  });
};

// Add a simple navigation test function
window.testNavigationSimple = function() {
  console.log('=== SIMPLE NAVIGATION TEST ===');
  console.log('Current state:', {
    current,
    projectsLength: projects?.length || 0,
    optionsProjectsLength: options?.projects?.length || 0,
    currentProject: currentProject()?.name || 'None'
  });
  
  // Test if we can get the next index
  if (options?.projects?.length > 0) {
    const nextIndex = incrementLoop(current, options.projects.length);
    console.log('Next index would be:', nextIndex);
    console.log('Next project ID would be:', options.projects[nextIndex]);
    
    // Test if we can find the next project
    const nextProject = projects?.find(p => p.id === options.projects[nextIndex]);
    console.log('Next project found:', nextProject?.name || 'Not found');
  }
  
  // Test getUrl function
  try {
    const testUrl = getUrl();
    console.log('getUrl() result:', testUrl);
  } catch (error) {
    console.error('getUrl() error:', error);
  }
};

// Add a function to check playlist contents
window.checkPlaylists = function() {
  console.log('=== PLAYLIST CHECK ===');
  console.log('Current playlist ID:', window.currentPlaylistId);
  console.log('Current playlist:', playlists[window.currentPlaylistId]);
  
  console.log('\nAll playlist definitions:');
  Object.entries(playlists).forEach(([id, playlist]) => {
    console.log(`\n${id}:`);
    console.log(`  Name: ${playlist.name}`);
    console.log(`  Description: ${playlist.description}`);
    console.log(`  Artworks: ${playlist.artworks.join(', ')}`);
    
    // Check if Dissolvi is in this playlist
    const hasDissolvi = playlist.artworks.includes('Dissolvi');
    if (hasDissolvi) {
      console.log(`  ⚠️  DISSOLVI FOUND IN ${id.toUpperCase()} PLAYLIST`);
    }
  });
  
  console.log('\nCurrent projects array:');
  if (projects && projects.length > 0) {
    projects.forEach((project, index) => {
              console.log(`  [${index}] ${project.name} (${project.id})`);
    });
  } else {
    console.log('  No projects loaded');
  }
  
  console.log('\nCurrent options.projects:');
  if (options && options.projects && options.projects.length > 0) {
    options.projects.forEach((projectId, index) => {
      console.log(`  [${index}] ${projectId}`);
    });
  } else {
    console.log('  No options.projects loaded');
  }
};

// Add a function to test playlist switching
window.testPlaylistSwitch = function(playlistId) {
  console.log('=== TESTING PLAYLIST SWITCH ===');
  console.log('Attempting to switch to:', playlistId);
  
  // Check if the function exists
  if (typeof window.switchPlaylist === 'function') {
    console.log('✅ switchPlaylist function is available');
    
    // Check if the playlist exists
    if (playlists[playlistId]) {
      console.log('✅ Playlist exists:', playlists[playlistId]);
      
      // Try to switch
      try {
        window.switchPlaylist(playlistId);
        console.log('✅ switchPlaylist called successfully');
        
        // Check if it worked
        setTimeout(() => {
          console.log('=== AFTER SWITCH CHECK ===');
          console.log('Current playlist ID:', window.currentPlaylistId);
          console.log('Current projects count:', projects?.length || 0);
          console.log('Current project names:', projects?.map(p => p.name) || []);
        }, 1000);
        
      } catch (error) {
        console.error('❌ Error calling switchPlaylist:', error);
      }
    } else {
      console.error('❌ Playlist not found:', playlistId);
      console.log('Available playlists:', Object.keys(playlists));
    }
  } else {
    console.error('❌ switchPlaylist function not available');
    console.log('Available functions:', Object.keys(window).filter(k => k.includes('playlist')));
  }
};

// Add a function to test Graph Protocol API manually
window.testGraphAPI = async function() {
  console.log('=== TESTING GRAPH PROTOCOL API ===');
  
  const endpoints = [
    {
      name: 'Arbitrum Gateway',
      url: 'https://gateway-arbitrum.network.thegraph.com/api/subgraphs/id/3eGGTUNpbmzMZx2UrHyDzWTKaQeawGpPPUuJQSxg3LZQ'
    },
    {
      name: 'Arbitrum Direct',
      url: 'https://api.thegraph.com/subgraphs/name/olta-art/arbitrum-v1'
    },
    {
      name: 'Polygon Direct',
      url: 'https://api.thegraph.com/subgraphs/name/olta-art/polygon-v1'
    }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing ${endpoint.name}: ${endpoint.url}`);
      
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer d11db1e253bf0c5eb89cb8ecf5f82a15`
        },
        body: JSON.stringify({
          query: `{
            projects(first: 10) {
              id
              name
              creator {
                name
                profile {
                  name
                }
              }
              editionSize
              lastAddedVersion {
                animation {
                  url
                }
              }
            }
          }`
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint.name} - Status: ${response.status}`);
        console.log(`✅ ${endpoint.name} - Projects found: ${data?.data?.projects?.length || 0}`);
        
        if (data?.data?.projects) {
          data.data.projects.forEach((project, index) => {
            console.log(`  [${index}] ${project.name} (${project.id}) - Editions: ${project.editionSize}`);
          });
        }
      } else {
        console.error(`❌ ${endpoint.name} - Status: ${response.status}`);
        console.error(`❌ ${endpoint.name} - Status Text: ${response.statusText}`);
      }
      
    } catch (error) {
      console.error(`❌ ${endpoint.name} - Error:`, error.message);
    }
  }
  
  console.log('\n=== END GRAPH API TEST ===');
};

// Add a function to debug playlist building and Dissolvi filtering
window.debugPlaylistFiltering = function(playlistId = 'desktop-experiences') {
  console.log('=== DEBUGGING PLAYLIST FILTERING ===');
  console.log('Playlist ID:', playlistId);
  
  // Check current playlist definition
  const playlist = playlists[playlistId];
  if (playlist) {
    console.log('Playlist definition:', playlist);
    console.log('Artworks in playlist definition:', playlist.artworks);
  }
  
  // Check all available projects
  console.log('\nAll available projects:');
  if (window.filteredProjects) {
    console.log('API projects:', window.filteredProjects.map(p => ({ id: p.id, name: p.name })));
  }
  if (filteredStaticArtworks) {
    console.log('Static artworks:', filteredStaticArtworks.map(p => ({ id: p.id, name: p.name })));
  }
  
  // Check if Dissolvi exists in any of these arrays
  const allProjects = [...(window.filteredProjects || []), ...filteredStaticArtworks];
  const dissolviInProjects = allProjects.filter(p => p.name === 'Dissolvi' || p.id === 'Dissolvi');
  console.log('\nDissolvi found in projects:', dissolviInProjects);
  
  // Check current projects array
  console.log('\nCurrent projects array:', projects?.map(p => ({ id: p.id, name: p.name })));
  
  // Check if Dissolvi is in current projects
  const dissolviInCurrent = projects?.filter(p => p.name === 'Dissolvi' || p.id === 'Dissolvi') || [];
  console.log('Dissolvi in current projects:', dissolviInCurrent);
  
  console.log('=== END DEBUG ===');
};

// Add a function to test details panel updates
window.testDetailsPanel = function() {
  console.log('=== TESTING DETAILS PANEL ===');
  
  // Check current project
  const currentProj = currentProject();
  console.log('Current project:', currentProj);
  
  // Check details element
  const detailsElement = document.querySelector('o-details');
  console.log('Details element found:', !!detailsElement);
  
  if (detailsElement) {
    console.log('Details element attributes:');
    console.log('  name:', detailsElement.getAttribute('name'));
    console.log('  creator:', detailsElement.getAttribute('creator'));
    console.log('  description:', detailsElement.getAttribute('description'));
    console.log('  qrcode:', detailsElement.getAttribute('qrcode'));
  }
  
  // Test getDetails function
  const detailsObj = getDetails();
  console.log('getDetails result:', detailsObj);
  
  // Test updateDetailsPanel function
  console.log('Calling updateDetailsPanel...');
  updateDetailsPanel();
  
  // Check if attributes were updated
  setTimeout(() => {
    if (detailsElement) {
      console.log('=== AFTER UPDATE CHECK ===');
      console.log('Updated attributes:');
      console.log('  name:', detailsElement.getAttribute('name'));
      console.log('  creator:', detailsElement.getAttribute('creator'));
      console.log('  description:', detailsElement.getAttribute('description'));
      console.log('  qrcode:', detailsElement.getAttribute('qrcode'));
    }
  }, 500);
};

// Add a function to find the source of Polygon API calls
window.findPolygonSource = function() {
  console.log('=== SEARCHING FOR POLYGON API SOURCE ===');
  
  // Search through all scripts
  const scripts = document.querySelectorAll('script');
  console.log('Found', scripts.length, 'script tags');
  
  scripts.forEach((script, index) => {
    if (script.textContent && script.textContent.includes('polygon-v1')) {
      console.error(`[FOUND] Polygon reference in script ${index}:`, script);
      console.error('[FOUND] Script content preview:', script.textContent.substring(0, 200));
    }
  });
  
  // Search through all inline event handlers
  const allElements = document.querySelectorAll('*');
  allElements.forEach((element, index) => {
    const attributes = element.attributes;
    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      if (attr.value && attr.value.includes('polygon-v1')) {
        console.error(`[FOUND] Polygon reference in ${element.tagName} ${attr.name}:`, attr.value);
      }
    }
  });
  
  // Check if any global functions contain Polygon references
  const globalFunctions = Object.getOwnPropertyNames(window).filter(name => 
    typeof window[name] === 'function' && 
    window[name].toString().includes('polygon-v1')
  );
  
  if (globalFunctions.length > 0) {
    console.error('[FOUND] Global functions with Polygon references:', globalFunctions);
  }
  
  console.log('=== END SEARCH ===');
};

// Add Ethereum wallet error handling to prevent crashes from embedded artworks
window.handleEthereumErrors = function() {
  console.log('[ETHEREUM] Setting up error handling for embedded artworks');
  
  // Mock ethereum object to prevent crashes
  if (typeof window.ethereum === 'undefined') {
    window.ethereum = {
      isConnected: () => false,
      request: () => Promise.reject(new Error('Wallet not connected')),
      on: () => {},
      removeListener: () => {},
      isMetaMask: false,
      selectedAddress: null,
      networkVersion: '1',
      chainId: '0x1'
    };
    console.log('[ETHEREUM] Created mock ethereum object');
  }
  
  // Override ethereum.isConnected to prevent errors
  if (window.ethereum && typeof window.ethereum.isConnected !== 'function') {
    window.ethereum.isConnected = () => false;
    console.log('[ETHEREUM] Fixed ethereum.isConnected function');
  }
  
  // Add global error handler for Ethereum-related errors
  window.addEventListener('error', (event) => {
    if (event.message && (
      event.message.includes('ethereum') || 
      event.message.includes('sfx.js') || 
      event.message.includes('state.js')
    )) {
      console.warn('[ETHEREUM] Caught Ethereum-related error:', event.message);
      event.preventDefault();
      return false;
    }
  });
  
  // Add unhandled rejection handler for Ethereum promises
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && (
      event.reason.message && event.reason.message.includes('ethereum')
    )) {
      console.warn('[ETHEREUM] Caught Ethereum promise rejection:', event.reason.message);
      event.preventDefault();
      return false;
    }
  });
  
  console.log('[ETHEREUM] Error handling setup complete');
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
  
  // Check if the artwork URL exists and is accessible
  if (!currentProj.lastAddedVersion?.animation?.url) {
    console.error('No animation URL found for project:', currentProj.name);
    // Try to provide a fallback URL
    const fallbackUrl = `https://nft.olta.art/project/${currentProj.id}`;
    console.log('Using fallback URL:', fallbackUrl);
    return fallbackUrl;
  }
  
  const url = currentProj.lastAddedVersion.animation.url.replace(
    "http:",
    "https:"
  );
  console.log('Base URL:', url);

  // Check if this is a true API project or a static artwork
  // We need to distinguish between real API projects and static artworks with 0x IDs
  const isRealApiProject = currentProj.id.startsWith('0x') && 
                          currentProj.editionSize > 1 && 
                          !currentProj.symbol?.startsWith('STATIC') &&
                          !currentProj.name?.includes('Meanwhile'); // Keep Meanwhile as static
  
  if (isRealApiProject) {
    // This is a real API project with multiple editions
    const address = currentProj.id;
    console.log('Real API project - Address:', address);
    console.log('Real API project - Seed:', seed);
    
    const finalUrl = `${url}?id=1&seed=${seed}&address=${address}`;
    console.log('Real API project - Final URL:', finalUrl);
    return finalUrl;
  } else {
    // This is a static artwork (including those with 0x IDs but single editions)
    console.log('Static artwork - returning URL directly:', url);
    console.log('Static artwork details:', {
      id: currentProj.id,
      symbol: currentProj.symbol,
      editionSize: currentProj.editionSize
    });
    return url;
  }
}

function isSeeded() {
  return currentProject().editionSize > 1;
}

function getDetails() {
  console.log('[DETAILS] getDetails called');
  
  if (!projects || projects.length == 0) {
    console.error('[DETAILS] No projects available');
    return null;
  }

  const currentProj = currentProject();
  console.log('[DETAILS] currentProject result:', currentProj);
  
  if (!currentProj) {
    console.error('[DETAILS] currentProject returned null');
    return null;
  }

  // Safely extract properties with fallbacks
  const name = currentProj.name || 'Unknown Artwork';
  const description = currentProj.description || 'Interactive digital artwork';
  const creator = currentProj.creator?.profile?.name || currentProj.creator?.name || 'Unknown Artist';
  
  console.log('[DETAILS] Extracted details:', { name, description, creator });

  return {
    name,
    description,
    creator,
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
console.log('🚀 Current default playlist: gesture-control');

// Set up Ethereum error handling to prevent crashes from embedded artworks
if (typeof window.handleEthereumErrors === 'function') {
  window.handleEthereumErrors();
} else {
  console.log('[ETHEREUM] handleEthereumErrors function not available yet');
}

// List of gesture/spatial controlled artwork names to exclude on mobile
// Note: Dissolvi is EXCLUDED from mobile because it's gesture-controlled
const gestureArtworkNames = [
  "Shadows Touch Across Time",
  "Optical Verlet",
  "Dissolvi"  // Added Dissolvi to exclude from mobile
  // Add more gesture artwork names here as needed
];

// Filter out gesture artworks from staticArtworks on mobile
// Make this globally accessible so switchPlaylist can use it
window.filteredStaticArtworks = staticArtworks;
if (isMobile) {
  console.log('[MOBILE_FILTER] Original static artworks:', staticArtworks.map(art => art.name));
  console.log('[MOBILE_FILTER] Artworks to exclude:', gestureArtworkNames);
  
  window.filteredStaticArtworks = staticArtworks.filter(
    (art) => !gestureArtworkNames.includes(art.name)
  );
  
  console.log('[MOBILE_FILTER] Filtered static artworks:', window.filteredStaticArtworks.map(art => art.name));
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



(async function fetchProjects() {
  await requestCameraOnce();
  let resp;
  
  // Try multiple Graph Protocol endpoints to find the right one
  const endpoints = [
    {
      name: 'Arbitrum Gateway',
      url: 'https://gateway-arbitrum.network.thegraph.com/api/subgraphs/id/3eGGTUNpbmzMZx2UrHyDzWTKaQeawGpPPUuJQSxg3LZQ',
      description: 'Current endpoint'
    },
    {
      name: 'Arbitrum Direct',
      url: 'https://api.thegraph.com/subgraphs/name/olta-art/arbitrum-v1',
      description: 'Direct Arbitrum subgraph'
    },
    {
      name: 'Polygon Direct',
      url: 'https://api.thegraph.com/subgraphs/name/olta-art/polygon-v1',
      description: 'Direct Polygon subgraph'
    }
  ];
  
  console.log('[API] Starting Graph Protocol API calls...');
  console.log('[API] Will try', endpoints.length, 'endpoints to find working one');
  
  let successfulResponse = null;
  let workingEndpoint = null;
  
  for (const endpoint of endpoints) {
    try {
      console.log(`[API] Trying ${endpoint.name}: ${endpoint.url}`);
      console.log(`[API] Description: ${endpoint.description}`);
      
      resp = await queryfetcher(endpoint.url, getProjects());
      
      if (resp && resp.projects && resp.projects.length > 0) {
        console.log(`[API] ✅ SUCCESS with ${endpoint.name}!`);
        console.log(`[API] Found ${resp.projects.length} projects`);
        
        // Check if we got the projects we need
        const requiredProjects = [
          '0x6d24ce4c32e556313b431fb156edf2060680a998', // Peer into the Flow
          '0x29b58c3146fc013913f987501d91ce1babcf8e32', // Meanwhile
          '0xe94100850ee7507dd57eb1ba67dc0600b18122df'  // Morphed Radiance
        ];
        
        const foundProjects = requiredProjects.filter(id => 
          resp.projects.find(p => p.id === id)
        );
        
        console.log(`[API] Found ${foundProjects.length}/${requiredProjects.length} required projects:`, foundProjects);
        
        if (foundProjects.length >= 2) { // At least 2 projects found
          successfulResponse = resp;
          workingEndpoint = endpoint;
          console.log(`[API] ✅ Endpoint ${endpoint.name} has sufficient projects - using this one!`);
          break;
        } else {
          console.log(`[API] ⚠️ Endpoint ${endpoint.name} found only ${foundProjects.length} required projects, trying next...`);
        }
      } else {
        console.log(`[API] ⚠️ Endpoint ${endpoint.name} returned no projects or invalid response`);
      }
      
    } catch (error) {
      console.error(`[API] ❌ Error with ${endpoint.name}:`, error.message);
      if (error.message.includes('CORS') || error.message.includes('blocked')) {
        console.log(`[API] CORS/blocking issue with ${endpoint.name}, trying next...`);
      }
    }
  }
  
  if (successfulResponse && workingEndpoint) {
    console.log(`[API] 🎯 Using successful response from ${workingEndpoint.name}`);
    resp = successfulResponse;
    
    // Log detailed project information
    console.log('[API] Final response structure:', {
      hasData: !!resp,
      hasProjects: !!resp?.projects,
      projectCount: resp?.projects?.length || 0,
      workingEndpoint: workingEndpoint.name
    });
    
    if (resp?.projects && resp.projects.length > 0) {
      console.log('[API] All projects found:');
      resp.projects.forEach((project, index) => {
        console.log(`[API] [${index}] ${project.name} (${project.id})`);
        console.log(`[API]   Creator: ${project.creator?.profile?.name || 'Unknown'}`);
        console.log(`[API]   Editions: ${project.editionSize || 'Unknown'}`);
        console.log(`[API]   Has Animation: ${!!project.lastAddedVersion?.animation?.url}`);
      });
    }
  } else {
    console.error('[API] ❌ All endpoints failed - no projects fetched');
    resp = { projects: [] };
  }
  
  console.log('[API] Final response:', resp);
  
  // Safety check: Ensure no Polygon API calls can happen
  if (typeof window !== 'undefined') {
    // Intercept all network requests to find the source of Polygon API calls
    const originalFetch = window.fetch;
    const originalXHR = window.XMLHttpRequest;
    
    // Override fetch to catch Polygon API calls
    window.fetch = function(...args) {
      const url = args[0];
      if (typeof url === 'string' && url.includes('polygon-v1')) {
        console.error('[INTERCEPT] Polygon API call detected via fetch:', url);
        console.error('[INTERCEPT] Call stack:', new Error().stack);
        console.error('[INTERCEPT] Arguments:', args);
        // Block the call
        return Promise.reject(new Error('Polygon API call blocked'));
      }
      return originalFetch.apply(this, args);
    };
    
    // Override XMLHttpRequest to catch Polygon API calls
    const originalOpen = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function(method, url, ...args) {
      if (typeof url === 'string' && url.includes('polygon-v1')) {
        console.error('[INTERCEPT] Polygon API call detected via XMLHttpRequest:', url);
        console.error('[INTERCEPT] Call stack:', new Error().stack);
        console.error('[INTERCEPT] Method:', method);
        // Block the call
        return;
      }
      return originalOpen.apply(this, [method, url, ...args]);
    };
    
    console.log('[SAFETY] Network request interception enabled for Polygon API calls');
  }

  // Filtering out the projects - with robust error handling
  if (!resp.projects || !Array.isArray(resp.projects)) {
    console.warn('[FILTER] No projects array in response, using empty array');
    resp.projects = [];
  }
  
  console.log('[FILTER] Projects before filtering:', resp.projects.map(p => ({ id: p.id, name: p.name })));
  
  let filteredProjects = resp.projects.filter(
    (project) => !["Loop", "Don't Scroll", "Totems", "FORM", "Fragmented Existence", "Choose your Words", "Lesson 1", "The Drop", "THE DROP", "Portal | One"].includes(project.name)
  );
  
  console.log('[FILTER] Projects after filtering:', filteredProjects.map(p => ({ id: p.id, name: p.name })));
  console.log('[FILTER] Looking for FIELDS project specifically:', filteredProjects.find(p => p.name === 'FIELDS'));
  
  // FIELDS-specific debugging
  const fieldsProject = filteredProjects.find(p => p.id === '0x510da17477ba0a23858c59e9bf80b8d8ad1b6ee');
  console.log('[FIELDS_DEBUG] FIELDS project by ID:', fieldsProject);
  console.log('[FIELDS_DEBUG] FIELDS project by name:', filteredProjects.find(p => p.name === 'FIELDS'));
  console.log('[FIELDS_DEBUG] All project IDs:', filteredProjects.map(p => p.id));
  console.log('[FIELDS_DEBUG] All project names:', filteredProjects.map(p => p.name));
  
  // Check specific projects we need
  console.log('[PROJECT_DEBUG] Looking for specific projects:');
  console.log('[PROJECT_DEBUG] FIELDS (0x510da17477ba0a23858c59e9bf80b8d8ad1b6ee):', filteredProjects.find(p => p.id === '0x510da17477ba0a23858c59e9bf80b8d8ad1b6ee'));
  console.log('[PROJECT_DEBUG] Peer into the Flow (0x6d24ce4c32e556313b431fb156edf2060680a998):', filteredProjects.find(p => p.id === '0x6d24ce4c32e556313b431fb156edf2060680a998'));
  console.log('[PROJECT_DEBUG] Meanwhile (0x29b58c3146fc013913f987501d91ce1babcf8e32):', filteredProjects.find(p => p.id === '0x29b58c3146fc013913f987501d91ce1babcf8e32'));
  console.log('[PROJECT_DEBUG] Morphed Radiance (0xe94100850ee7507dd57eb1ba67dc0600b18122df):', filteredProjects.find(p => p.id === '0xe94100850ee7507dd57eb1ba67dc0600b18122df'));
  
  // Enhanced FIELDS debugging
  console.log('[FIELDS_SPECIFIC] === FIELDS DEBUGGING ===');
  console.log('[FIELDS_SPECIFIC] Looking for FIELDS by exact ID:', '0x510da17477ba0a23858c59e9bf80b8d8ad1b6ee');
  console.log('[FIELDS_SPECIFIC] Looking for FIELDS by name "FIELDS":', filteredProjects.find(p => p.name === 'FIELDS'));
  console.log('[FIELDS_SPECIFIC] Looking for FIELDS by name "Fields":', filteredProjects.find(p => p.name === 'Fields'));
  console.log('[FIELDS_SPECIFIC] Looking for FIELDS by name containing "field":', filteredProjects.find(p => p.name.toLowerCase().includes('field')));
  console.log('[FIELDS_SPECIFIC] All project names that might be FIELDS:', filteredProjects.filter(p => p.name.toLowerCase().includes('field')).map(p => ({ id: p.id, name: p.name })));
  console.log('[FIELDS_SPECIFIC] === END FIELDS DEBUGGING ===');
  
  // Check if any projects are being returned at all
  console.log('[PROJECT_DEBUG] Total projects returned from API:', filteredProjects.length);
  console.log('[PROJECT_DEBUG] All API project IDs:', filteredProjects.map(p => p.id));
  console.log('[PROJECT_DEBUG] All API project names:', filteredProjects.map(p => p.name));
  
  // Check if the issue is with the subgraph query itself
  if (filteredProjects.length === 0) {
    console.warn('[PROJECT_DEBUG] ⚠️ No projects returned from API - subgraph might be empty or query failing');
  } else {
    console.log('[PROJECT_DEBUG] ✅ API returned projects, checking individual ones...');
  }

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
      "Peer into the Flow": "https://nft.olta.art/project/0x6d24ce4c32e556313b431fb156edf2060680a998",
      "Sacred Moth": "",
      "FIELDS": "https://nft.olta.art/project/0x510da17477ba0a23858c59e9bf80b8d8ad1b6ee",
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
  
  // Debug what we have available
  console.log('[AVAILABLE_DEBUG] API projects count:', filteredProjects.length);
  console.log('[AVAILABLE_DEBUG] Static artworks count:', filteredStaticArtworks.length);
  console.log('[AVAILABLE_DEBUG] Combined total:', allAvailableProjects.length);
  console.log('[AVAILABLE_DEBUG] API project IDs:', filteredProjects.map(p => p.id));
  console.log('[AVAILABLE_DEBUG] Static artwork IDs:', filteredStaticArtworks.map(p => p.id));
  
  // (You can keep orderedProjects if you want for debugging, but don't assign to global state)
  const orderedProjects = [
    ...gestureControlPlaylist.map(id => allAvailableProjects.find(p => p.id === id)),
    ...desktopPlaylist.map(id => allAvailableProjects.find(p => p.id === id))
  ].filter(Boolean);

  // Make filteredProjects available globally for playlist switching
  window.filteredProjects = filteredProjects;
  
  // Test if we can access the projects we need
  console.log('[TEST] Testing project access:');
  console.log('[TEST] FIELDS accessible:', !!filteredProjects.find(p => p.id === '0x510da17477ba0a23858c59e9bf80b8d8ad1b6ee'));
  console.log('[TEST] Peer into the Flow accessible:', !!filteredProjects.find(p => p.id === '0x6d24ce4c32e556313b431fb156edf2060680a998'));
  console.log('[TEST] Meanwhile accessible:', !!filteredProjects.find(p => p.id === '0x29b58c3146fc013913f987501d91ce1babcf8e32'));

  // Optionally: log for debugging
  console.log("=== PROJECT LOADING DEBUG ===");
  console.log("Raw API response projects:", resp.projects?.map(p => ({ id: p.id, name: p.name })) || 'No projects');
  console.log("Filtered projects from API:", filteredProjects.map(p => ({ id: p.id, name: p.name })));
  console.log("Static artworks (original):", staticArtworks.map(p => p.name));
  console.log("Static artworks (filtered for mobile):", filteredStaticArtworks.map(p => p.name));
  console.log("Is mobile device:", isMobile);
  console.log("Combined all projects:", allAvailableProjects.map(p => ({ id: p.id, name: p.name })));
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
  console.log('[UPDATE_DETAILS] updateDetailsPanel called');
  
  const detailsObj = getDetails();
  if (!detailsObj) {
    console.error('[UPDATE_DETAILS] getDetails returned null, cannot update panel');
    return;
  }
  
  const { name, description, creator } = detailsObj;
  console.log('[UPDATE_DETAILS] Setting attributes:', { name, description, creator });
  
  // Update the details panel attributes
  details.setAttribute("name", name || "");
  details.setAttribute("description", description || "");
  details.setAttribute("creator", creator || "");
  
  // Set QR code attribute
  const currentProj = currentProject();
  if (currentProj && currentProj.qrCodeUrl) {
    details.setAttribute("qrcode", currentProj.qrCodeUrl);
    console.log('[UPDATE_DETAILS] Set QR code to:', currentProj.qrCodeUrl);
  } else {
    // fallback to artwork URL or project page
    const artworkUrl = currentProj && currentProj.lastAddedVersion?.animation?.url;
    if (artworkUrl) {
      details.setAttribute("qrcode", artworkUrl);
      console.log('[UPDATE_DETAILS] Set QR code to artwork URL:', artworkUrl);
    } else if (currentProj) {
      const fallbackUrl = `https://nft.olta.art/project/${currentProj.id}`;
      details.setAttribute("qrcode", fallbackUrl);
      console.log('[UPDATE_DETAILS] Set QR code to fallback URL:', fallbackUrl);
    }
  }
  
  console.log('[UPDATE_DETAILS] Details panel updated successfully');
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
    // Set default selection to gesture-control
    const defaultPlaylist = 'gesture-control';
    playlistDropdown.value = defaultPlaylist;
    
    // Update playlist header immediately
    const playlistHeader = document.getElementById('playlist-header');
    if (playlistHeader) {
      const title = playlistHeader.querySelector('.playlist-title');
      const desc = playlistHeader.querySelector('.playlist-description');
      if (title) title.textContent = 'Gesture Control – Interactive Experiences';
      if (desc) desc.textContent = 'Motion-controlled digital artworks that respond to your movements';
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
      '0x6d24ce4c32e556313b431fb156edf2060680a998', // Peer into the Flow
      '0x29b58c3146fc013913f987501d91ce1babcf8e32', // Meanwhile
      '0xe94100850ee7507dd57eb1ba67dc0600b18122df', // Morphed Radiance
      'Faded-Memories' // Moved to the end
    ]
  },

};

// Default playlist - use gesture-control on all devices
let currentPlaylistId = 'gesture-control';

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
  console.log('[INIT_ROUTE] Is mobile device:', isMobile);
  console.log('[INIT_ROUTE] Available playlists:', Object.keys(playlists));
  
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
  
  // Default to gesture-control on all devices
  const defaultPlaylist = 'gesture-control';
  console.log(`[INIT_ROUTE] Using default playlist: ${defaultPlaylist}`);
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
    allProjects = [...window.filteredProjects, ...window.filteredStaticArtworks];
  } else if (projects.length > 0) {
    allProjects = projects;
  } else {
    allProjects = window.filteredStaticArtworks;
  }
  
    // Build playlist by ID (not name) - ONLY include artworks defined for this specific playlist
  let playlistProjects = playlist.artworks
    .map(id => allProjects.find(project => project.id === id))
    .filter(Boolean);
    
  // IMPORTANT: Double-check that no unwanted artworks are included
  // Filter out any artworks that shouldn't be in this playlist
  playlistProjects = playlistProjects.filter(project => {
    // For desktop-experiences playlist, exclude gesture-controlled artworks
    if (playlistId === 'desktop-experiences') {
      const gestureArtworks = ['Dissolvi', 'Shadows-Touch-Across-Time', 'Optical-Verlet'];
      if (gestureArtworks.includes(project.name)) {
        console.log(`[FILTER] Excluding gesture artwork "${project.name}" from desktop playlist`);
        return false;
      }
      
      // Also check by ID to be extra safe
      if (project.id === 'Dissolvi') {
        console.log(`[FILTER] Excluding Dissolvi by ID from desktop playlist`);
        return false;
      }
    }
    
    
    
    return true;
  });
  
  // EXTRA SAFETY: Force remove Dissolvi from desktop playlist
  if (playlistId === 'desktop-experiences') {
    const beforeCount = playlistProjects.length;
    playlistProjects = playlistProjects.filter(project => project.name !== 'Dissolvi' && project.id !== 'Dissolvi');
    const afterCount = playlistProjects.length;
    if (beforeCount !== afterCount) {
      console.log(`[EXTRA_FILTER] Removed ${beforeCount - afterCount} Dissolvi instances from ${playlistId}`);
    }
  }
  
  console.log(`[FILTER] After filtering: ${playlistProjects.length} artworks`);
  
  // Debug logging for troubleshooting URL issues
  console.log('[DEBUG] Final playlist projects:', playlistProjects.map(p => p.id));
  console.log('[DEBUG] options.projects:', playlistProjects.map(p => p.id));
  console.log('[DEBUG] URL param:', new URLSearchParams(window.location.search).get('artwork'));
  console.log('[DEBUG] All available projects:', allProjects.map(p => ({ id: p.id, name: p.name })));
  console.log('[DEBUG] Looking for these artwork IDs:', playlist.artworks);

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

