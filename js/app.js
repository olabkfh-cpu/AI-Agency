/* =========================================================
   AI AGENCY — APP.JS
   Core CRM
   Navigation + Leads + Dashboard + LocalStorage
========================================================= */

const STORAGE_KEY = "ai_agency_leads";

const App = {

  state: {
    currentPage: "dashboard",
    leads: []
  },


  /* =======================================================
     INIT
  ======================================================= */

  init() {

    this.loadLeads();

    this.setupNavigation();

    this.setupPageLinks();

    this.setupLeadModal();

    this.setupLeadSearch();

    this.renderLeads();

    this.updateDashboard();

    this.showPage(
      this.state.currentPage,
      false
    );

    console.log("AI Agency App initialized.");

  },


  /* =======================================================
     STORAGE
  ======================================================= */

  loadLeads() {

    try {

      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!saved) {

        this.state.leads = [];

        return;

      }

      const parsed =
        JSON.parse(saved);

      this.state.leads =
        Array.isArray(parsed)
          ? parsed
          : [];

    } catch (error) {

      console.error(
        "Failed to load leads:",
        error
      );

      this.state.leads = [];

    }

  },


  saveLeads() {

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          this.state.leads
        )
      );

    } catch (error) {

      console.error(
        "Failed to save leads:",
        error
      );

    }

  },


  /* =======================================================
     NAVIGATION
  ======================================================= */

  setupNavigation() {

    document
      .querySelectorAll(
        ".nav-link"
      )
      .forEach(
        (link) => {

          link.addEventListener(
            "click",
            (event) => {

              event.preventDefault();

              const page =
                link.dataset.page;

              if (!page) return;

              this.showPage(page);

            }
          );

        }
      );

  },


  setupPageLinks() {

    document
      .querySelectorAll(
        "[data-page-link]"
      )
      .forEach(
        (link) => {

          link.addEventListener(
            "click",
            (event) => {

              event.preventDefault();

              const page =
                link.dataset.pageLink;

              if (!page) return;

              this.showPage(page);

            }
          );

        }
      );

  },


  showPage(
    page,
    updateHeader = true
  ) {

    const target =
      document.getElementById(
        `${page}-page`
      );

    if (!target) {

      console.warn(
        `Page not found: ${page}`
      );

      return;

    }


    document
      .querySelectorAll(
        ".page"
      )
      .forEach(
        (section) => {

          section.classList.remove(
            "active-page"
          );

        }
      );


    target.classList.add(
      "active-page"
    );


    document
      .querySelectorAll(
        ".nav-link"
      )
      .forEach(
        (link) => {

          link.classList.toggle(
            "active",
            link.dataset.page === page
          );

        }
      );


    this.state.currentPage =
      page;


    if (updateHeader) {

      this.updatePageHeader(
        page
      );

    }


    if (page === "dashboard") {

      this.updateDashboard();

    }


    if (page === "leads") {

      this.renderLeads();

    }

  },


  updatePageHeader(page) {

    const headers = {

      dashboard: [
        "Dashboard",
        "Here's what's happening with your agency."
      ],

      discovery: [
        "Company Discovery",
        "Find potential companies automatically."
      ],

      leads: [
        "Leads",
        "Manage and qualify potential clients."
      ],

      companies: [
        "Companies",
        "Company intelligence."
      ],

      outreach: [
        "Outreach",
        "Manage your client outreach."
      ],

      conversations: [
        "Conversations",
        "Manage client conversations."
      ],

      deals: [
        "Deals",
        "Track your opportunities."
      ],

      payments: [
        "Payments",
        "Manage payment activity."
      ],

      services: [
        "Services",
        "Manage your agency services."
      ],

      settings: [
        "Settings",
        "Configure your agency."
      ]

    };


    const data =
      headers[page] ||
      headers.dashboard;


    this.setText(
      "page-title",
      data[0]
    );


    this.setText(
      "page-subtitle",
      data[1]
    );

  },


  /* =======================================================
     LEAD MODAL
  ======================================================= */

  setupLeadModal() {

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


    if (!modal) return;


    const closeModal = () => {

      modal.classList.remove(
        "open"
      );

      modal.setAttribute(
        "aria-hidden",
        "true"
      );

    };


    const openModal = () => {

      modal.classList.add(
        "open"
      );

      modal.setAttribute(
        "aria-hidden",
        "false"
      );

      const firstInput =
        form?.querySelector(
          "input"
        );

      if (firstInput) {

        setTimeout(
          () => firstInput.focus(),
          50
        );

      }

    };


    if (openButton) {

      openButton.addEventListener(
        "click",
        openModal
      );

    }


    if (closeButton) {

      closeButton.addEventListener(
        "click",
        closeModal
      );

    }


    if (cancelButton) {

      cancelButton.addEventListener(
        "click",
        closeModal
      );

    }


    modal.addEventListener(
      "click",
      (event) => {

        if (
          event.target === modal
        ) {

          closeModal();

        }

      }
    );


    document.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key === "Escape" &&
          modal.classList.contains("open")
        ) {

          closeModal();

        }

      }
    );


    if (form) {

      form.addEventListener(
        "submit",
        (event) => {

          event.preventDefault();

          const added =
            this.addManualLead(
              form
            );

          if (added) {

            form.reset();

            closeModal();

          }

        }
      );

    }

  },


  /* =======================================================
     MANUAL LEAD
  ======================================================= */

  addManualLead(form) {

    const data =
      new FormData(form);


    const lead = {

      id:
        this.createId(
          "manual"
        ),

      name:
        this.clean(
          data.get("company")
        ),

      company:
        this.clean(
          data.get("company")
        ),

      industry:
        this.clean(
          data.get("industry")
        ) || "Unknown",

      city:
        this.clean(
          data.get("city")
        ) || "Unknown",

      address: "",

      email:
        this.clean(
          data.get("email")
        ),

      phone: "",

      website:
        this.clean(
          data.get("website")
        ),

      instagram: "",

      latitude: null,

      longitude: null,

      mapUrl: "",

      score: 0,

      priority: "Medium",

      recommendedService:
        "Professional Website",

      opportunities: [],

      status: "new",

      source: "Manual",

      addedAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()

    };


    if (!lead.name) {

      alert(
        "Company name is required."
      );

      return false;

    }


    if (
      this.isDuplicate(
        lead.name
      )
    ) {

      alert(
        "This company is already in Leads."
      );

      return false;

    }


    lead.score =
      this.calculateLeadScore(
        lead
      );


    lead.priority =
      this.getPriority(
        lead.score
      );


    lead.opportunities =
      this.buildOpportunities(
        lead
      );


    this.state.leads.unshift(
      lead
    );


    this.saveLeads();

    this.renderLeads();

    this.updateDashboard();


    alert(
      `${lead.name} added to Leads.`
    );


    return true;

  },


  /* =======================================================
     DISCOVERY → LEADS
  ======================================================= */

  addDiscoveredLead(business) {

    if (!business) {

      console.error(
        "No business supplied."
      );

      return false;

    }


    const name =
      this.clean(
        business.name ||
        business.company
      );


    if (!name) {

      alert(
        "Company name is missing."
      );

      return false;

    }


    if (
      this.isDuplicate(name)
    ) {

      alert(
        `${name} is already in Leads.`
      );

      return false;

    }


    const analysis =
      business.analysis || {};


    const lead = {

      id:
        business.id ||
        this.createId(
          "discovery"
        ),

      name,

      company: name,

      industry:
        this.clean(
          business.industry
        ) || "Business",

      city:
        this.clean(
          business.city
        ) || "Unknown",

      address:
        this.clean(
          business.address
        ),

      email:
        this.clean(
          business.email
        ),

      phone:
        this.clean(
          business.phone
        ),

      website:
        this.clean(
          business.website
        ),

      instagram:
        this.clean(
          business.instagram
        ),

      latitude:
        business.latitude ??
        null,

      longitude:
        business.longitude ??
        null,

      mapUrl:
        business.mapUrl ||
        "",

      score:
        Number(
          analysis.score
        ) ||
        this.calculateLeadScore(
          business
        ),

      priority:
        analysis.priority ||
        "Medium",

      recommendedService:
        analysis.service ||
        "Professional Website",

      opportunities:
        Array.isArray(
          analysis.opportunities
        )
          ? analysis.opportunities
          : this.buildOpportunities(
              business
            ),

      status: "new",

      source: "Discovery",

      addedAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()

    };


    lead.priority =
      this.getPriority(
        lead.score
      );


    this.state.leads.unshift(
      lead
    );


    this.saveLeads();

    this.renderLeads();

    this.updateDashboard();


    alert(
      `${name} added to Leads.`
    );


    return true;

  },


  /* =======================================================
     DUPLICATES
  ======================================================= */

  isDuplicate(name) {

    const normalized =
      this.normalize(name);


    if (!normalized) {
      return false;
    }


    return this.state.leads.some(
      (lead) => {

        const leadName =
          this.normalize(
            lead.name ||
            lead.company ||
            ""
          );

        return (
          leadName ===
          normalized
        );

      }
    );

  },


  /* =======================================================
     SCORE
  ======================================================= */

  calculateLeadScore(data) {

    let score = 40;


    if (data.website) {

      score += 20;

    } else {

      score += 5;

    }


    if (data.instagram) {

      score += 15;

    }


    if (data.phone) {

      score += 10;

    }


    if (
      data.address ||
      data.city
    ) {

      score += 5;

    }


    if (data.email) {

      score += 5;

    }


    return Math.min(
      score,
      100
    );

  },


  getPriority(score) {

    if (score >= 80) {

      return "High";

    }


    if (score >= 60) {

      return "Medium";

    }


    return "Low";

  },


  buildOpportunities(business) {

    const opportunities = [];


    if (!business.website) {

      opportunities.push(
        "No professional website detected"
      );

    }


    if (!business.instagram) {

      opportunities.push(
        "Instagram presence not detected"
      );

    }


    if (!business.phone) {

      opportunities.push(
        "No phone number detected"
      );

    }


    if (!business.email) {

      opportunities.push(
        "No email detected"
      );

    }


    return opportunities;

  },


  /* =======================================================
     LEAD SEARCH
  ======================================================= */

  setupLeadSearch() {

    const search =
      document.getElementById(
        "lead-search"
      );

    const filter =
      document.getElementById(
        "lead-filter"
      );


    if (search) {

      search.addEventListener(
        "input",
        () => {

          this.renderLeads();

        }
      );

    }


    if (filter) {

      filter.addEventListener(
        "change",
        () => {

          this.renderLeads();

        }
      );

    }

  },


  getFilteredLeads() {

    const search =
      document.getElementById(
        "lead-search"
      );

    const filter =
      document.getElementById(
        "lead-filter"
      );


    const query =
      search
        ? this.normalize(
            search.value
          )
        : "";


    const status =
      filter
        ? filter.value
        : "all";


    return this.state.leads.filter(
      (lead) => {

        const searchable = [

          lead.name,

          lead.company,

          lead.industry,

          lead.city,

          lead.address,

          lead.email,

          lead.phone

        ]
          .map(
            (value) =>
              this.normalize(value)
          )
          .join(" ");


        const matchesSearch =
          !query ||
          searchable.includes(
            query
          );


        const matchesStatus =
          status === "all" ||
          lead.status === status;


        return (
          matchesSearch &&
          matchesStatus
        );

      }
    );

  },


  /* =======================================================
     RENDER LEADS
  ======================================================= */

  renderLeads() {

    const body =
      document.getElementById(
        "leads-table-body"
      );

    const empty =
      document.getElementById(
        "leads-empty"
      );


    if (!body) return;


    const leads =
      this.getFilteredLeads();


    body.innerHTML = "";


    if (!leads.length) {

      if (empty) {

        empty.style.display =
          "flex";

      }

      return;

    }


    if (empty) {

      empty.style.display =
        "none";

    }


    leads.forEach(
      (lead) => {

        const row =
          document.createElement(
            "tr"
          );


        row.innerHTML = `

          <td>
            <strong>
              ${this.escapeHTML(
                lead.name ||
                lead.company ||
                "Unknown"
              )}
            </strong>
          </td>

          <td>
            ${this.escapeHTML(
              lead.industry ||
              "Unknown"
            )}
          </td>

          <td>
            ${this.escapeHTML(
              lead.city ||
              "Unknown"
            )}
          </td>

          <td>

            <select
              class="lead-status-select"
              data-id="${this.escapeHTML(
                lead.id
              )}"
            >

              ${this.statusOption(
                "new",
                "New",
                lead.status
              )}

              ${this.statusOption(
                "qualified",
                "Qualified",
                lead.status
              )}

              ${this.statusOption(
                "interested",
                "Interested",
                lead.status
              )}

              ${this.statusOption(
                "negotiating",
                "Negotiating",
                lead.status
              )}

              ${this.statusOption(
                "payment",
                "Payment Pending",
                lead.status
              )}

            </select>

          </td>

          <td>

            <strong>
              ${Number(
                lead.score || 0
              )}
            </strong>

            / 100

          </td>

          <td>

            <button
              type="button"
              class="secondary-button lead-delete"
              data-id="${this.escapeHTML(
                lead.id
              )}"
            >
              Remove
            </button>

          </td>

        `;


        body.appendChild(
          row
        );

      }
    );


    this.setupLeadRowActions();

  },


  statusOption(
    value,
    label,
    current
  ) {

    return `
      <option
        value="${value}"
        ${
          current === value
            ? "selected"
            : ""
        }
      >
        ${label}
      </option>
    `;

  },


  /* =======================================================
     ROW ACTIONS
  ======================================================= */

  setupLeadRowActions() {

    document
      .querySelectorAll(
        ".lead-status-select"
      )
      .forEach(
        (select) => {

          select.addEventListener(
            "change",
            () => {

              this.updateLeadStatus(
                select.dataset.id,
                select.value
              );

            }
          );

        }
      );


    document
      .querySelectorAll(
        ".lead-delete"
      )
      .forEach(
        (button) => {

          button.addEventListener(
            "click",
            () => {

              this.removeLead(
                button.dataset.id
              );

            }
          );

        }
      );

  },


  updateLeadStatus(
    id,
    status
  ) {

    const lead =
      this.state.leads.find(
        (item) =>
          String(item.id) ===
          String(id)
      );


    if (!lead) return;


    lead.status =
      status;


    lead.updatedAt =
      new Date().toISOString();


    this.saveLeads();

    this.renderLeads();

    this.updateDashboard();

  },


  removeLead(id) {

    const lead =
      this.state.leads.find(
        (item) =>
          String(item.id) ===
          String(id)
      );


    if (!lead) return;


    const name =
      lead.name ||
      lead.company ||
      "this lead";


    if (
      !confirm(
        `Remove ${name} from Leads?`
      )
    ) {

      return;

    }


    this.state.leads =
      this.state.leads.filter(
        (item) =>
          String(item.id) !==
          String(id)
      );


    this.saveLeads();

    this.renderLeads();

    this.updateDashboard();

  },


  /* =======================================================
     DASHBOARD
  ======================================================= */

  updateDashboard() {

    const leads =
      this.state.leads;


    this.setText(
      "total-leads",
      leads.length
    );


    this.setText(
      "active-conversations",
      leads.filter(
        (lead) =>
          [
            "interested",
            "negotiating",
            "payment"
          ].includes(
            lead.status
          )
      ).length
    );


    this.setText(
      "interested-leads",
      leads.filter(
        (lead) =>
          lead.status ===
          "interested"
      ).length
    );


    this.setText(
      "total-deals",
      leads.filter(
        (lead) =>
          lead.status ===
          "negotiating"
      ).length
    );


    this.setText(
      "pipeline-new",
      this.countStatus("new")
    );


    this.setText(
      "pipeline-qualified",
      this.countStatus("qualified")
    );


    this.setText(
      "pipeline-interested",
      this.countStatus("interested")
    );


    this.setText(
      "pipeline-negotiating",
      this.countStatus("negotiating")
    );


    this.setText(
      "pipeline-payment",
      this.countStatus("payment")
    );


    this.renderRecentActivity();

  },


  countStatus(status) {

    return this.state.leads.filter(
      (lead) =>
        lead.status === status
    ).length;

  },


  /* =======================================================
     RECENT ACTIVITY
  ======================================================= */

  renderRecentActivity() {

    const container =
      document.getElementById(
        "recent-activity"
      );


    if (!container) return;


    const recent =
      [...this.state.leads]
        .sort(
          (a, b) =>
            new Date(
              b.updatedAt ||
              b.addedAt ||
              0
            ) -
            new Date(
              a.updatedAt ||
              a.addedAt ||
              0
            )
        )
        .slice(0, 5);


    if (!recent.length) {

      container.innerHTML = `

        <div class="empty-state">

          <div class="empty-icon">
            AI
          </div>

          <strong>
            No activity yet
          </strong>

          <p>
            Your latest agency activity will appear here.
          </p>

        </div>

      `;

      return;

    }


    container.innerHTML =
      recent
        .map(
          (lead) => `

            <div
              class="activity-item"
            >

              <div class="activity-icon">
                AI
              </div>

              <div class="activity-text">

                <strong>
                  ${this.escapeHTML(
                    lead.name ||
                    lead.company ||
                    "Unknown"
                  )}
                </strong>

                <p>
                  ${this.escapeHTML(
                    lead.source ||
                    "Unknown"
                  )}
                </p>

              </div>

              <span class="time">
                ${this.escapeHTML(
                  this.formatStatus(
                    lead.status
                  )
                )}
              </span>

            </div>

          `
        )
        .join("");

  },


  /* =======================================================
     HELPERS
  ======================================================= */

  createId(prefix) {

    return (
      `${prefix}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`
    );

  },


  clean(value) {

    return String(
      value || ""
    ).trim();

  },


  normalize(value) {

    return String(
      value || ""
    )
      .toLowerCase()
      .trim();

  },


  formatStatus(status) {

    const labels = {

      new: "New",

      qualified: "Qualified",

      interested: "Interested",

      negotiating: "Negotiating",

      payment: "Payment Pending"

    };


    return (
      labels[status] ||
      "New"
    );

  },


  setText(
    id,
    value
  ) {

    const element =
      document.getElementById(
        id
      );


    if (element) {

      element.textContent =
        value;

    }

  },


  escapeHTML(value) {

    return String(
      value ?? ""
    )
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

};


/* =========================================================
   GLOBAL
========================================================= */

window.App =
  App;


/* Discovery can call this directly */
window.addDiscoveredLead =
  function (business) {

    return App.addDiscoveredLead(
      business
    );

  };


/* =========================================================
   START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    App.init();

  }
);
