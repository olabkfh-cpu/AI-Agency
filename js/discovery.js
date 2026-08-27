const discoveryState = {
  isRunning: false,
  results: [],
  settings: {
    industry: "",
    location: "",
    limit: 25,
    requirements: [],
  },
};


/* =========================
   INITIALIZATION
========================= */

document.addEventListener(
  "DOMContentLoaded",
  initializeDiscovery
);


function initializeDiscovery() {
  setupDiscoveryForm();
  renderDiscoveryResults();
}


/* =========================
   FORM
========================= */

function setupDiscoveryForm() {
  const form =
    document.getElementById(
      "discovery-form"
    );

  if (!form) {
    return;
  }

  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      startDiscovery(form);
    }
  );
}


/* =========================
   START DISCOVERY
========================= */

function startDiscovery(form) {
  if (discoveryState.isRunning) {
    return;
  }

  const formData =
    new FormData(form);

  const industry =
    String(
      formData.get("industry") || ""
    ).trim();

  const location =
    String(
      formData.get("location") || ""
    ).trim();

  const limit =
    Number(
      formData.get("limit") || 25
    );


  if (!industry || !location) {
    showDiscoveryMessage(
      "Please enter an industry and location."
    );

    return;
  }


  discoveryState.settings = {
    industry,
    location,
    limit: Math.min(
      Math.max(limit, 1),
      100
    ),
    requirements:
      getSelectedRequirements(),
  };


  discoveryState.isRunning =
    true;

  renderDiscoveryStatus();

  /*
   * IMPORTANT:
   *
   * At this stage we do NOT pretend
   * to search the internet.
   *
   * The real discovery provider will
   * be connected later through a backend.
   */

  simulateDiscoveryPreparation();
}


/* =========================
   PREPARATION
========================= */

function simulateDiscoveryPreparation() {
  const status =
    document.getElementById(
      "discovery-status"
    );

  if (status) {
    status.textContent =
      "Preparing discovery...";
  }


  setTimeout(() => {

    discoveryState.isRunning =
      false;

    showDiscoveryMessage(
      "Discovery configuration is ready. A real search provider will be connected in the next stage."
    );

    renderDiscoveryStatus();

  }, 900);
}


/* =========================
   REQUIREMENTS
========================= */

function getSelectedRequirements() {
  const checkboxes =
    document.querySelectorAll(
      'input[name="requirements"]:checked'
    );

  return Array.from(
    checkboxes
  ).map(
    (checkbox) =>
      checkbox.value
  );
}


/* =========================
   RESULTS
========================= */

function renderDiscoveryResults() {
  const container =
    document.getElementById(
      "discovery-results"
    );

  if (!container) {
    return;
  }

  if (
    discoveryState.results.length ===
    0
  ) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          AI
        </div>

        <strong>
          No companies discovered yet
        </strong>

        <p>
          Configure your discovery criteria
          and start a search.
        </p>
      </div>
    `;

    return;
  }


  container.innerHTML = "";


  discoveryState.results.forEach(
    (company) => {

      const item =
        document.createElement(
          "div"
        );

      item.className =
        "activity-item";


      item.innerHTML = `
        <div class="activity-icon">
          ${escapeDiscoveryHtml(
            company.industry
              ?.substring(0, 2)
              .toUpperCase() ||
              "CO"
          )}
        </div>

        <div class="activity-text">
          <strong>
            ${escapeDiscoveryHtml(
              company.name
            )}
          </strong>

          <p>
            ${escapeDiscoveryHtml(
              company.location
            )}
          </p>
        </div>

        <div class="time">
          ${company.score || 0}/100
        </div>
      `;


      container.appendChild(
        item
      );
    }
  );
}


/* =========================
   STATUS
========================= */

function renderDiscoveryStatus() {
  const status =
    document.getElementById(
      "discovery-status"
    );

  if (!status) {
    return;
  }

  if (
    discoveryState.isRunning
  ) {
    status.textContent =
      "Discovery is preparing...";
  } else {
    status.textContent =
      "Ready";
  }
}


function showDiscoveryMessage(
  message
) {
  const status =
    document.getElementById(
      "discovery-status"
    );

  if (status) {
    status.textContent =
      message;
  }
}


/* =========================
   PUBLIC API
========================= */

window.AIAgencyDiscovery = {
  getState() {
    return {
      ...discoveryState,
      settings: {
        ...discoveryState.settings,
      },
      results: [
        ...discoveryState.results,
      ],
    };
  },

  setResults(results) {
    if (!Array.isArray(results)) {
      return;
    }

    discoveryState.results =
      results;

    renderDiscoveryResults();
  },

  clearResults() {
    discoveryState.results = [];

    renderDiscoveryResults();
  },
};


/* =========================
   SECURITY HELPER
========================= */

function escapeDiscoveryHtml(
  value
) {
  return String(value ?? "")
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}
