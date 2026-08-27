const DiscoveryEngine = {
  state: {
    running: false,
    industry: "",
    location: "",
    limit: 25,
    requirements: [],
    results: []
  },

  init() {
    const form = document.getElementById("discovery-form");

    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.start(form);
    });

    this.updateStatus("Ready");
  },

  start(form) {
    if (this.state.running) return;

    const data = new FormData(form);

    this.state.industry =
      String(data.get("industry") || "").trim();

    this.state.location =
      String(data.get("location") || "").trim();

    this.state.limit =
      Math.min(
        Math.max(
          Number(data.get("limit") || 25),
          1
        ),
        100
      );

    this.state.requirements =
      Array.from(
        document.querySelectorAll(
          'input[name="requirements"]:checked'
        )
      ).map((input) => input.value);

    if (!this.state.industry || !this.state.location) {
      this.updateStatus(
        "Please enter an industry and location."
      );
      return;
    }

    this.state.running = true;

    this.updateStatus(
      "Preparing discovery..."
    );

    /*
      IMPORTANT:
      This is the preparation layer.

      We are NOT pretending to search
      the internet yet.

      The real discovery source will be
      connected after this layer is tested.
    */

    setTimeout(() => {
      this.state.running = false;

      this.updateStatus(
        `Ready to search for ${this.state.limit} ${this.state.industry} in ${this.state.location}.`
      );

      console.log(
        "Discovery request:",
        {
          industry: this.state.industry,
          location: this.state.location,
          limit: this.state.limit,
          requirements: this.state.requirements
        }
      );
    }, 700);
  },

  updateStatus(message) {
    const status =
      document.getElementById("discovery-status");

    if (status) {
      status.textContent = message;
    }
  },

  getRequest() {
    return {
      industry: this.state.industry,
      location: this.state.location,
      limit: this.state.limit,
      requirements: [
        ...this.state.requirements
      ]
    };
  }
};


document.addEventListener(
  "DOMContentLoaded",
  () => {
    DiscoveryEngine.init();
  }
);


window.DiscoveryEngine = DiscoveryEngine;
