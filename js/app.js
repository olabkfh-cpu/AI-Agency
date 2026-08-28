/* =========================================================
   AI AGENCY — APP.JS
   Leads + Dashboard + Navigation + Local Storage
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

  },


  /* =======================================================
     STORAGE
  ======================================================= */

  loadLeads() {

    try {

      const saved =
        localStorage.getItem(STORAGE_KEY);

      this.state.leads =
        saved
          ? JSON.parse(saved)
          : [];

      if (!Array.isArray(this.state.leads)) {
        this.state.leads = [];
      }

    } catch (error) {

      console.error(
        "Could not load leads:",
        error
      );

      this.state.leads = [];

    }

  },


  saveLeads() {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(this.state.leads)
    );

  },


  /* =======================================================
     NAVIGATION
  ======================================================= */

  setupNavigation() {

    const links =
      document.querySelectorAll(
        ".nav-link"
      );

    links.forEach((link) => {

      link.addEventListener(
        "click",
        (event) => {

          event.preventDefault();

          const page =
            link.dataset.page;

          if (page) {
            this.showPage(page);
          }

        }
      );

    });

  },


  setupPageLinks() {

    document.querySelectorAll(
      "[data-page-link]"
    ).forEach((link) => {

      link.addEventListener(
        "click",
        (event) => {

          event.preventDefault();

          this.showPage(
            link.dataset.pageLink
          );

        }
      );

    });

  },


  showPage(page) {

    const pages =
      document.querySelectorAll(
        ".page"
      );

    pages.forEach((section) => {

      section.classList.remove(
        "active-page"
      );

    });


    const target =
      document.getElementById(
        `${page}-page`
      );

    if (target) {

      target.classList.add(
        "active-page"
      );

    }


    document.querySelectorAll(
      ".nav-link"
    ).forEach((link) => {

      link.classList.toggle(
        "active",
        link.dataset.page === page
      );

    });


    this.state.currentPage =
      page;


    this.updatePageHeader(
      page
    );


    if (page === "leads") {
      this.renderLeads();
    }

    if (page === "dashboard") {
      this.updateDashboard();
    }

  },


  updatePageHeader(page) {

    const title =
      document.getElementById(
        "page-title"
      );

    const subtitle =
      document.getElementById(
        "page-subtitle"
      );


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


    if (title) {
      title.textContent =
        data[0];
    }


    if (subtitle) {
      subtitle.textContent =
        data[1];
    }

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


    if (openButton) {

      openButton.addEventListener(
        "click",
        () => {

          if (modal) {
            modal.classList.add(
              "show"
            );
          }

        }
      );

    }


    const closeModal = () => {

      if (modal) {

        modal.classList.remove(
          "show"
        );

      }

    };


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


    if (modal) {

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

    }


    if (form) {

      form.addEventListener(
        "submit",
        (event) => {

          event.preventDefault();

          this.addManualLead(
            form
          );

          form.reset();

          closeModal();

        }
      );

    }

  },


  /* =======================================================
     ADD MANUAL LEAD
  ======================================================= */

  addManualLead(form) {

    const data =
      new FormData(form);


    const company =
      String(
        data.get("company") || ""
      ).trim();


    const industry =
      String(
        data.get("industry") || ""
      ).trim();


    const city =
      String(
        data.get("city") || ""
      ).trim();


    const email =
      String(
        data.get("email") || ""
      ).trim();


    const website =
      String(
        data.get("website") || ""
      ).trim();


    if (!company) {
      return;
    }


    const exists =
      this.state.leads.some(
        (lead) =>
          this.normalize(
            lead.name || lead.company
          ) ===
          this.normalize(company)
      );


    if (exists) {

      alert(
        "This company is already in Leads."
      );

      return;

    }


    const lead = {

      id:
        `manual-${Date.now()}`,

      name:
        company,

      company:
        company,

      industry:
        industry || "Unknown",

      city:
        city || "Unknown",

      email:
        email,

      website:
        website,

      instagram:
        "",

      phone:
        "",

      status:
        "new",

      score:
        this.calculateLeadScore({
          website,
          email,
          phone: "",
          instagram: "",
          address: city
        }),

      source:
        "Manual",

      addedAt:
        new Date().toISOString()

    };


    this.state.leads.unshift(
      lead
    );


    this.saveLeads();

    this.renderLeads();

    this.updateDashboard();

  },


  /* =======================================================
     ADD DISCOVERED BUSINESS
  ======================================================= */

  addDiscoveredLead(business) {

    if (!business) {
      return;
    }


    const companyName =
      business.name ||
      business.company ||
      "Unknown company";


    const exists =
      this.state.leads.some(
        (lead) =>
          this.normalize(
            lead.name ||
            lead.company
          ) ===
          this.normalize(
            companyName
          )
      );


    if (exists) {

      alert(
        `${companyName} is already in Leads.`
      );

      return;

    }


    const analysis =
      business.analysis || {};


    const lead = {

      id:
        business.id ||
        `discovered-${Date.now()}`,

      name:
        companyName,

      company:
        companyName,

      industry:
        business.industry ||
        "Restaurant",

      city:
        business.city ||
        "",

      address:
        business.address ||
        "",

      phone:
        business.phone ||
        "",

      website:
        business.website ||
        "",

      instagram:
        business.instagram ||
        "",

      email:
        business.email ||
        "",

      latitude:
        business.latitude ||
        null,

      longitude:
        business.longitude ||
        null,

      mapUrl:
        business.mapUrl ||
        "",

      score:
        analysis.score ||
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
        analysis.opportunities ||
        [],

      status:
        "new",

      source:
        "Discovery",

      addedAt:
        new Date().toISOString()

    };


    this.state.leads.unshift(
      lead
    );


    this.saveLeads();

    this.renderLeads();

    this.updateDashboard();


    alert(
      `${companyName} added to Leads.`
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


  /* =======================================================
     SEARCH + FILTER
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


    const searchValue =
      search
        ? this.normalize(
            search.value
          )
        : "";


    const filterValue =
      filter
        ? filter.value
        : "all";


    return this.state.leads.filter(
      (lead) => {

        const name =
          this.normalize(
            lead.name ||
            lead.company ||
            ""
          );


        const industry =
          this.normalize(
            lead.industry ||
            ""
          );


        const city =
          this.normalize(
            lead.city ||
            ""
          );


        const matchesSearch =
          !searchValue ||
          name.includes(searchValue) ||
          industry.includes(searchValue) ||
          city.includes(searchValue);


        const matchesFilter =
          filterValue === "all" ||
          lead.status === filterValue;


        return (
          matchesSearch &&
          matchesFilter
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


    if (!body) {
      return;
    }


    const leads =
      this.getFilteredLeads();


    body.innerHTML = "";


    if (!leads.length) {

      if (empty) {
        empty.style.display =
          "block";
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
        ${current === value ? "selected" : ""}
      >
        ${label}
      </option>
    `;

  },


  /* =======================================================
     LEAD ROW ACTIONS
  ======================================================= */

  setupLeadRowActions() {

    document.querySelectorAll(
      ".lead-status-select"
    ).forEach(
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


    document.querySelectorAll(
      ".lead-delete"
    ).forEach(
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


    if (!lead) {
      return;
    }


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


    if (!lead) {
      return;
    }


    const confirmed =
      confirm(
        `Remove ${lead.name || lead.company} from Leads?`
      );


    if (!confirmed) {
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
      leads.filter(
        (lead) =>
          lead.status ===
          "new"
      ).length
    );


    this.setText(
      "pipeline-qualified",
      leads.filter(
        (lead) =>
          lead.status ===
          "qualified"
      ).length
    );


    this.setText(
      "pipeline-interested",
      leads.filter(
        (lead) =>
          lead.status ===
          "interested"
      ).length
    );


    this.setText(
      "pipeline-negotiating",
      leads.filter(
        (lead) =>
          lead.status ===
          "negotiating"
      ).length
    );


    this.setText(
      "pipeline-payment",
      leads.filter(
        (lead) =>
          lead.status ===
          "payment"
      ).length
    );


    this.renderRecentActivity();

  },


  /* =======================================================
     RECENT ACTIVITY
  ======================================================= */

  renderRecentActivity() {

    const container =
      document.getElementById(
        "recent-activity"
      );


    if (!container) {
      return;
    }


    const recent =
      [...this.state.leads]
        .sort(
          (a, b) =>
            new Date(
              b.addedAt || 0
            ) -
            new Date(
              a.addedAt || 0
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
      recent.map(
        (lead) => `

          <div
            style="
              display:flex;
              justify-content:space-between;
              align-items:center;
              gap:15px;
              padding:12px 0;
              border-bottom:1px solid rgba(255,255,255,.05);
            "
          >

            <div>

              <strong>
                ${this.escapeHTML(
                  lead.name ||
                  lead.company ||
                  "Unknown"
                )}
              </strong>

              <div
                style="
                  color:#888;
                  font-size:11px;
                  margin-top:4px;
                "
              >
                Added from
                ${this.escapeHTML(
                  lead.source ||
                  "Unknown"
                )}
              </div>

            </div>


            <span
              style="
                font-size:11px;
                color:#999;
              "
            >
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


  normalize(value) {

    return String(
      value || ""
    )
      .toLowerCase()
      .trim();

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
      value || ""
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
   GLOBAL ACCESS
========================================================= */

window.App = App;


/* =========================================================
   CONNECT DISCOVERY → LEADS
========================================================= */

window.addDiscoveredLead =
  function (business) {

    App.addDiscoveredLead(
      business
    );

  };


/* =========================================================
   START APP
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    App.init();

  }
);
