import { Details, Viewer } from "./o.js";
import { getProjects } from "./querys.js";
import { queryfetcher, SEPARATOR as sep, decode } from "./helpers.js";

const staticArtworks = [
  {
    id: "static-1",
    name: "Olta Home",
    description: "A static interactive piece.",
    creator: { profile: { name: "Terence" } },
    editionSize: 1,
    symbol: "STATIC1",
    allow: "camera",
    lastAddedVersion: {
      animation: { url: "https://a7frsrbb25jdkt6rkwxhj6y44eh3rzyiffo6ait3kypjm7fqh5lq.arweave.net/B8sZRCHXUjVP0VWudPsc4Q-45wgpXeAie1YelnywP1c/" }
    },
    qrCodeUrl: "https://yourdomain.com/qr/artwork1"
  }
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
    project: 90,
    edition: 30,
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

// random button
const random = document.querySelector(".random");
random.addEventListener("click", () => {
  seed = getRandSeed(seed, currentProject().editionSize);
  viewer.setAttribute("url", getUrl());
  random.classList = "random spin";
  disableButtons();
});

// change button
const change = document.querySelector(".change");
change.addEventListener("click", () => {
  current = incrementLoop(current, options.projects.length);
  seed = getRandSeed(seed, currentProject().editionSize);

  isSeeded()
    ? random.removeAttribute("hidden")
    : random.setAttribute("hidden", "");

  viewer.setAttribute("url", getUrl());
  change.classList = "change spin";
  disableButtons();
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
        <input name="project" type="number" min="10" id="project-time" value="90">
        <small>seconds</small>
      </div>
      <div>
        <label for="edition-time">Edition Time</label>
        <input name="edition" type="number" min="5" id="edition-time" value="30">
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
        <input name="description" type="checkbox" id="project-description" checked>
        <label for="project-description">description</label>
      </div>
      <div>
        <input name="qrcode" type="checkbox" id="project-qr" checked>
        <label for="project-qr">qr code</label>
      </div>
    </fieldset>
  `;

  updateProjectInterval(90);
  updateEditionInterval(30);
}

function updateProjectInterval(seconds) {
  if (projectInterval) {
    clearInterval(projectInterval);
  }
  projectInterval = setInterval(() => {
    // colorTrace("FUCKKKK", "orange");
    current = incrementLoop(current, options.projects.length);
    seed = getRandSeed(seed, currentProject().editionSize);

    isSeeded()
      ? random.removeAttribute("hidden")
      : random.setAttribute("hidden", "");

    viewer.setAttribute("url", getUrl());
    change.classList = "change spin";
    disableButtons();
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
    random.classList = "random spin";
    disableButtons();
  }, seconds * 1000);
}

const spinner = document.querySelector(".spinner");

function disableButtons() {
  // TODO: show spinner
  random.setAttribute("disabled", "");
  change.setAttribute("disabled", "");
  setTimeout(() => {
    change.removeAttribute("disabled");
    random.removeAttribute("disabled");

    change.classList = "change";
    random.classList = "random";

    const { name, description, creator } = getDetails();
    console.log("olta", name);
    details.setAttribute("name", name);
    details.setAttribute("description", decode(description));
    details.setAttribute("creator", creator);
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

    alignQrCodeToRight();
  }, 2500);
}

function incrementLoop(current, length) {
  const next = current + 1;
  if (next >= length) return 0;

  return next;
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
  const projectsToAlignRight = ["PEER-INTO-THE-FLOW"];

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

(async function fetchProjects() {
  const resp = await queryfetcher(
    "https://gateway-arbitrum.network.thegraph.com/api/subgraphs/id/3eGGTUNpbmzMZx2UrHyDzWTKaQeawGpPPUuJQSxg3LZQ",
    getProjects()
  );

  optionsEl.showModal();

  // Filtering out the projects
  let filteredProjects = resp.projects.filter(
    (project) => !["Loop", "Don't Scroll"].includes(project.name)
  );

  // Adding new URLs for the QR code to specific projects
  filteredProjects.forEach((project) => {
    if (project.name === "Totems") {
      project.qrCodeUrl =
        "https://arweave.net/_mg8ZW1miexH22bD-LdiABnGH8n5X5smYYXbbDKocpA/?id=1&address=0xac771ff04287872ea43263703b43ad5b801e8a1e&seed=1";
    }
  });

  // Merge static artworks with dynamic ones
  projects = [...staticArtworks, ...filteredProjects];
  options.projects = projects.map((p) => p.id);

  renderOptions();

  seed = getRandSeed(seed, projects[current].editionSize);
  viewer.setAttribute("url", getUrl());
  disableButtons();
})();

function colorTrace(msg, color) {
  console.log("%c" + msg, "color:" + color + ";font-weight:bold;");
}

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    const video = document.createElement('video');
    video.autoplay = true;
    video.srcObject = stream;
    video.style.display = 'none';
    document.body.appendChild(video);

    // Add motion detection logic here
  })
  .catch(err => {
    alert('Camera access denied or not available.');
  });
