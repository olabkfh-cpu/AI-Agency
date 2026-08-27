const appState = {
  leads: [],
  companies: [],
  conversations: [],
  deals: [],
  payments: [],
  services: [],
};

const selectors = {
  navLinks: document.querySelectorAll(".nav a"),
  statNumbers: document.querySelectorAll(".stat-number"),
};

function initializeApp() {
  setupNavigation();
  updateDashboard();
}

function setupNavigation() {
  selectors.navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      selectors.navLinks.forEach((item) => {
        item.classList.remove("active");
      });

      link.classList.add("active");

      console.log(`Navigation selected: ${link.textContent.trim()}`);
    });
  });
}

function updateDashboard() {
  const stats = [
    appState.leads.length,
    appState.conversations.length,
    0,
    appState.deals.length,
  ];

  selectors.statNumbers.forEach((element, index) => {
    element.textContent = stats[index] ?? 0;
  });
}

function addLead(lead) {
  if (!lead || typeof lead !== "object") {
    return;
  }

  appState.leads.push({
    id: crypto.randomUUID(),
    ...lead,
  });

  updateDashboard();
}

function addCompany(company) {
  if (!company || typeof company !== "object") {
    return;
  }

  appState.companies.push({
    id: crypto.randomUUID(),
    ...company,
  });
}

function addConversation(conversation) {
  if (!conversation || typeof conversation !== "object") {
    return;
  }

  appState.conversations.push({
    id: crypto.randomUUID(),
    ...conversation,
  });

  updateDashboard();
}

function addDeal(deal) {
  if (!deal || typeof deal !== "object") {
    return;
  }

  appState.deals.push({
    id: crypto.randomUUID(),
    ...deal,
  });

  updateDashboard();
}

function addPayment(payment) {
  if (!payment || typeof payment !== "object") {
    return;
  }

  appState.payments.push({
    id: crypto.randomUUID(),
    ...payment,
  });
}

function addService(service) {
  if (!service || typeof service !== "object") {
    return;
  }

  appState.services.push({
    id: crypto.randomUUID(),
    ...service,
  });
}

document.addEventListener("DOMContentLoaded", initializeApp);
