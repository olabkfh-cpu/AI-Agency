const STORAGE_KEY = "ai_agency_data";

const appState = {
  leads: [],
  companies: [],
  conversations: [],
  deals: [],
  payments: [],
  services: [],
};

const pageNames = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Here's what's happening with your agency.",
  },

  leads: {
    title: "Leads",
    subtitle: "Manage and qualify potential clients.",
  },

  companies: {
    title: "Companies",
    subtitle: "Manage your company database.",
  },

  outreach: {
    title: "Outreach",
    subtitle: "Prepare and manage client outreach.",
  },

  conversations: {
    title: "Conversations",
    subtitle: "Manage your client conversations.",
  },

  deals: {
    title: "Deals",
    subtitle: "Track your sales opportunities.",
  },

  payments: {
    title: "Payments",
    subtitle: "Track payments and transactions.",
  },

  services: {
    title: "Services",
    subtitle: "Manage the services your agency offers.",
  },

  settings: {
    title: "Settings",
    subtitle: "Manage your agency configuration.",
  },
};


/* =========================
   INITIALIZATION
========================= */

document.addEventListener("DOMContentLoaded", initializeApp);

function initializeApp() {
  loadData();

  setupNavigation();
  setupLeadModal();
  setupLeadSearch();
  setupLeadFilter();

  renderLeads();
  updateDashboard();
}


/* =========================
   LOCAL STORAGE
========================= */

function saveData() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(appState)
    );
  } catch (error) {
    console.error(
      "Could not save application data:",
      error
    );
  }
}


function loadData() {
  try {
    const savedData =
      localStorage.getItem(STORAGE_KEY);

    if (!savedData) {
      return;
    }

    const parsedData =
      JSON.parse(savedData);

    appState.leads =
      Array.isArray(parsedData.leads)
        ? parsedData.leads
        : [];

    appState.companies =
      Array.isArray(parsedData.companies)
        ? parsedData.companies
        : [];

    appState.conversations =
      Array.isArray(parsedData.conversations)
        ? parsedData.conversations
        : [];

    appState.deals =
      Array.isArray(parsedData.deals)
        ? parsedData.deals
        : [];

    appState.payments =
      Array.isArray(parsedData.payments)
        ? parsedData.payments
        : [];

    appState.services =
      Array.isArray(parsedData.services)
        ? parsedData.services
        : [];

  } catch (error) {
    console.error(
      "Could not load application data:",
      error
    );
  }
}


/* =========================
   NAVIGATION
========================= */

function setupNavigation() {
  const navLinks =
    document.querySelectorAll(
      ".nav-link"
    );

  navLinks.forEach((link) => {
    link.addEventListener(
      "click",
      (event) => {
        event.preventDefault();

        const page =
          link.dataset.page;

        if (!page) {
          return;
        }

        navigateTo(page);
      }
    );
  });
}


function navigateTo(page) {
  const navLinks =
    document.querySelectorAll(
      ".nav-link"
    );

  const pages =
    document.querySelectorAll(
      ".page"
    );

  navLinks.forEach((link) => {
    link.classList.toggle(
      "active",
      link.dataset.page === page
    );
  });

  pages.forEach((section) => {
    section.classList.remove(
      "active-page"
    );
  });

  const selectedPage =
    document.getElementById(
      `${page}-page`
    );

  if (selectedPage) {
    selectedPage.classList.add(
      "active-page"
    );
  }

  updatePageHeader(page);
}


function updatePageHeader(page) {
  const pageTitle =
    document.getElementById(
      "page-title"
    );

  const pageSubtitle =
    document.getElementById(
      "page-subtitle"
    );

  const content =
    pageNames[page];

  if (!content) {
    return;
  }

  if (pageTitle) {
    pageTitle.textContent =
      content.title;
  }

  if (pageSubtitle) {
    pageSubtitle.textContent =
      content.subtitle;
  }
}


/* =========================
   DASHBOARD
========================= */

function updateDashboard() {
  updateElement(
    "total-leads",
    appState.leads.length
  );

  updateElement(
    "active-conversations",
    appState.conversations.length
  );

  const interestedCount =
    appState.leads.filter(
      (lead) =>
        lead.status === "interested"
    ).length;

  updateElement(
    "interested-leads",
    interestedCount
  );

  updateElement(
    "total-deals",
    appState.deals.length
  );

  updatePipeline();
}


function updatePipeline() {
  const pipeline = {
    new: 0,
    qualified: 0,
    interested: 0,
    negotiating: 0,
    payment: 0,
  };

  appState.leads.forEach(
    (lead) => {
      if (
        pipeline[lead.status] !==
        undefined
      ) {
        pipeline[lead.status]++;
      }
    }
  );

  updateElement(
    "pipeline-new",
    pipeline.new
  );

  updateElement(
    "pipeline-qualified",
    pipeline.qualified
  );

  updateElement(
    "pipeline-interested",
    pipeline.interested
  );

  updateElement(
    "pipeline-negotiating",
    pipeline.negotiating
  );

  updateElement(
    "pipeline-payment",
    pipeline.payment
  );
}


/* =========================
   LEAD MODAL
========================= */

function setupLeadModal() {
  const openButton =
    document.getElementById(
      "add-lead-button"
    );

  const modal =
    document.getElementById(
      "lead-modal"
    );

  const closeButton =
    document.getElementById(
      "close-lead-modal"
    );

  const cancelButton =
    document.getElementById(
      "cancel-lead"
    );

  const form =
    document.getElementById(
      "lead-form"
    );


  if (
    !openButton ||
    !modal ||
    !form
  ) {
    return;
  }


  openButton.addEventListener(
    "click",
    openLeadModal
  );


  if (closeButton) {
    closeButton.addEventListener(
      "click",
      closeLeadModal
    );
  }


  if (cancelButton) {
    cancelButton.addEventListener(
      "click",
      closeLeadModal
    );
  }


  modal.addEventListener(
    "click",
    (event) => {
      if (
        event.target === modal
      ) {
        closeLeadModal();
      }
    }
  );


  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      createLeadFromForm(form);

      closeLeadModal();

      form.reset();
    }
  );
}


function openLeadModal() {
  const modal =
    document.getElementById(
      "lead-modal"
    );

  if (!modal) {
    return;
  }

  modal.classList.add("open");

  setTimeout(() => {
    document
      .getElementById(
        "company-name"
      )
      ?.focus();
  }, 50);
}


function closeLeadModal() {
  const modal =
    document.getElementById(
      "lead-modal"
    );

  if (!modal) {
    return;
  }

  modal.classList.remove("open");
}


/* =========================
   CREATE LEAD
========================= */

function createLeadFromForm(form) {
  const formData =
    new FormData(form);

  const lead = {
    id: generateId(),

    company: String(
      formData.get("company") ||
        ""
    ).trim(),

    industry: String(
      formData.get("industry") ||
        ""
    ).trim(),

    city: String(
      formData.get("city") ||
        ""
    ).trim(),

    email: String(
      formData.get("email") ||
        ""
    ).trim(),

    website: String(
      formData.get("website") ||
        ""
    ).trim(),

    status: "new",

    score: calculateLeadScore({
      industry: String(
        formData.get("industry") ||
          ""
      ),

      website: String(
        formData.get("website") ||
          ""
      ),

      email: String(
        formData.get("email") ||
          ""
      ),
    }),

    createdAt:
      new Date().toISOString(),
  };


  appState.leads.unshift(
    lead
  );


  saveData();

  renderLeads();

  updateDashboard();

  addActivity(
    "New lead added",
    `${lead.company} was added to your pipeline.`
  );
}


/* =========================
   LEAD SCORING
========================= */

function calculateLeadScore(data) {
  let score = 50;

  if (
    data.website.trim()
  ) {
    score += 10;
  }

  if (
    data.email.trim()
  ) {
    score += 10;
  }

  if (
    data.industry.trim()
  ) {
    score += 10;
  }

  const highPotentialIndustries = [
    "restaurant",
    "hotel",
    "perfume",
    "parfum",
    "immobilier",
    "real estate",
    "clinic",
    "beauty",
    "cosmetic",
    "solar",
    "energy",
  ];

  const industry =
    data.industry
      .trim()
      .toLowerCase();

  if (
    highPotentialIndustries.some(
      (item) =>
        industry.includes(item)
    )
  ) {
    score += 10;
  }

  return Math.min(
    score,
    100
  );
}


/* =========================
   RENDER LEADS
========================= */

function renderLeads() {
  const tableBody =
    document.getElementById(
      "leads-table-body"
    );

  const emptyState =
    document.getElementById(
      "leads-empty"
    );

  if (
    !tableBody ||
    !emptyState
  ) {
    return;
  }


  const searchInput =
    document.getElementById(
      "lead-search"
    );

  const filterSelect =
    document.getElementById(
      "lead-filter"
    );


  const searchTerm =
    searchInput?.value
      ?.trim()
      .toLowerCase() || "";


  const filter =
    filterSelect?.value ||
    "all";


  const filteredLeads =
    appState.leads.filter(
      (lead) => {

        const matchesSearch =
          !searchTerm ||
          lead.company
            .toLowerCase()
            .includes(searchTerm) ||
          lead.industry
            .toLowerCase()
            .includes(searchTerm) ||
          lead.city
            .toLowerCase()
            .includes(searchTerm);


        const matchesFilter =
          filter === "all" ||
          lead.status === filter;


        return (
          matchesSearch &&
          matchesFilter
        );
      }
    );


  tableBody.innerHTML = "";


  if (
    filteredLeads.length === 0
  ) {
    emptyState.style.display =
      "flex";

    return;
  }


  emptyState.style.display =
    "none";


  filteredLeads.forEach(
    (lead) => {

      const row =
        document.createElement(
          "tr"
        );


      row.innerHTML = `
        <td class="company-cell">
          ${escapeHtml(
            lead.company
          )}
        </td>

        <td>
          ${escapeHtml(
            lead.industry
          )}
        </td>

        <td>
          ${escapeHtml(
            lead.city
          )}
        </td>

        <td>
          <span class="status ${getStatusClass(
            lead.status
          )}">
            ${getStatusLabel(
              lead.status
            )}
          </span>
        </td>

        <td class="score">
          ${lead.score}
        </td>

        <td>
          <button
            class="table-action"
            data-lead-id="${lead.id}"
          >
            View
          </button>
        </td>
      `;


      const viewButton =
        row.querySelector(
          ".table-action"
        );


      if (viewButton) {
        viewButton.addEventListener(
          "click",
          () => {
            viewLead(
              lead.id
            );
          }
        );
      }


      tableBody.appendChild(
        row
      );
    }
  );
}


/* =========================
   SEARCH
========================= */

function setupLeadSearch() {
  const input =
    document.getElementById(
      "lead-search"
    );

  if (!input) {
    return;
  }

  input.addEventListener(
    "input",
    renderLeads
  );
}


/* =========================
   FILTER
========================= */

function setupLeadFilter() {
  const select =
    document.getElementById(
      "lead-filter"
    );

  if (!select) {
    return;
  }

  select.addEventListener(
    "change",
    renderLeads
  );
}


/* =========================
   VIEW LEAD
========================= */

function viewLead(leadId) {
  const lead =
    appState.leads.find(
      (item) =>
        item.id === leadId
    );

  if (!lead) {
    return;
  }


  const message = [
    `Company: ${lead.company}`,
    `Industry: ${lead.industry}`,
    `City: ${lead.city}`,
    `Email: ${
      lead.email ||
      "Not provided"
    }`,
    `Website: ${
      lead.website ||
      "Not provided"
    }`,
    `Status: ${getStatusLabel(
      lead.status
    )}`,
    `Score: ${lead.score}`,
  ].join("\n");


  alert(message);
}


/* =========================
   ACTIVITY
========================= */

function addActivity(
  title,
  description
) {
  const container =
    document.getElementById(
      "recent-activity"
    );

  if (!container) {
    return;
  }


  const emptyState =
    container.querySelector(
      ".empty-state"
    );


  if (emptyState) {
    emptyState.remove();
  }


  const item =
    document.createElement(
      "div"
    );


  item.className =
    "activity-item";


  item.innerHTML = `
    <div class="activity-icon">
      AI
    </div>

    <div class="activity-text">
      <strong>
        ${escapeHtml(title)}
      </strong>

      <p>
        ${escapeHtml(
          description
        )}
      </p>
    </div>

    <div class="time">
      Now
    </div>
  `;


  container.prepend(item);
}


/* =========================
   STATUS
========================= */

function getStatusLabel(status) {
  const labels = {
    new: "New",
    qualified: "Qualified",
    interested: "Interested",
    negotiating: "Negotiating",
    payment: "Payment Pending",
  };

  return (
    labels[status] ||
    "Unknown"
  );
}


function getStatusClass(status) {
  const classes = {
    new: "status-new",
    qualified:
      "status-qualified",
    interested:
      "status-interested",
    negotiating:
      "status-negotiating",
    payment:
      "status-payment",
  };

  return (
    classes[status] ||
    "status-new"
  );
}


/* =========================
   HELPERS
========================= */

function updateElement(
  id,
  value
) {
  const element =
    document.getElementById(id);

  if (element) {
    element.textContent =
      value;
  }
}


function generateId() {
  if (
    typeof crypto !==
      "undefined" &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .substring(2)
  );
}


function escapeHtml(value) {
  return String(value)
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
