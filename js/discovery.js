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

  async start(form) {
    if (this.state.running) return;

    const data = new FormData(form);

    this.state.industry =
      String(data.get("industry") || "").trim();

    this.state.location =
      String(data.get("location") || "").trim();

    this.state.limit = Math.min(
      Math.max(Number(data.get("limit") || 25), 1),
      100
    );

    this.state.requirements = Array.from(
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
    this.state.results = [];

    this.updateStatus("Searching...");

    try {
      const results = await this.searchOpenStreetMap();

      this.state.results = results;

      this.renderResults(results);

      this.updateStatus(
        `Found ${results.length} results.`
      );

    } catch (error) {
      console.error("Discovery error:", error);

      this.updateStatus(
        "Search failed. Please try again."
      );

      this.renderError();

    } finally {
      this.state.running = false;
    }
  },

  async searchOpenStreetMap() {

    const query = `
[out:json][timeout:25];

area["name"="${this.state.location}"]["boundary"="administrative"]->.searchArea;

(
  nwr["amenity"="restaurant"](area.searchArea);
  nwr["amenity"="cafe"](area.searchArea);
  nwr["amenity"="fast_food"](area.searchArea);
);

out center tags;
`;

    const response = await fetch(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded"
        },
        body:
          "data=" +
          encodeURIComponent(query)
      }
    );

    if (!response.ok) {
      throw new Error(
        `Overpass API error: ${response.status}`
      );
    }

    const data = await response.json();

    const elements = Array.isArray(data.elements)
      ? data.elements
      : [];

    return elements
      .map((element) => {

        const tags = element.tags || {};

        const lat =
          element.lat ??
          element.center?.lat ??
          null;

        const lon =
          element.lon ??
          element.center?.lon ??
          null;

        return {
          id: `${element.type}-${element.id}`,

          name:
            tags.name ||
            "Unnamed business",

          type:
            tags.amenity ||
            "business",

          address:
            tags["addr:street"]
              ? `${tags["addr:street"]}${
                  tags["addr:housenumber"]
                    ? " " + tags["addr:housenumber"]
                    : ""
                }`
              : "",

          phone:
            tags.phone ||
            tags["contact:phone"] ||
            "",

          website:
            tags.website ||
            tags["contact:website"] ||
            "",

          instagram:
            tags["contact:instagram"] ||
            "",

          latitude: lat,

          longitude: lon,

          mapsUrl:
            lat && lon
              ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`
              : ""
        };
      })
      .filter((business) => business.name)
      .slice(0, this.state.limit);
  },

  renderResults(results) {

    const container =
      document.getElementById(
        "discovery-results"
      );

    if (!container) return;

    if (!results.length) {

      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔎</div>

          <strong>
            No businesses found
          </strong>

          <p>
            Try another city or industry.
          </p>
        </div>
      `;

      return;
    }

    container.innerHTML = `
      <div style="display:grid; gap:12px;">

        ${results.map((business) => `

          <div
            class="card"
            style="
              padding:16px;
              border:1px solid rgba(255,255,255,.06);
            "
          >

            <div
              style="
                display:flex;
                justify-content:space-between;
                gap:15px;
                align-items:flex-start;
              "
            >

              <div>

                <strong
                  style="
                    display:block;
                    font-size:15px;
                    margin-bottom:6px;
                  "
                >
                  ${this.escapeHTML(business.name)}
                </strong>

                <div
                  style="
                    color:#888;
                    font-size:12px;
                  "
                >
                  ${this.escapeHTML(
                    business.address ||
                    "Address unavailable"
                  )}
                </div>

              </div>

              <span
                style="
                  font-size:11px;
                  padding:5px 8px;
                  border-radius:6px;
                  background:rgba(255,255,255,.06);
                  color:#aaa;
                "
              >
                ${this.escapeHTML(
                  business.type
                )}
              </span>

            </div>


            <div
              style="
                display:flex;
                gap:15px;
                flex-wrap:wrap;
                margin-top:12px;
                color:#888;
                font-size:11px;
              "
            >

              ${
                business.phone
                  ? `<span>📞 ${this.escapeHTML(
                      business.phone
                    )}</span>`
                  : ""
              }

              ${
                business.website
                  ? `<span>🌐 Website</span>`
                  : ""
              }

              ${
                business.instagram
                  ? `<span>📸 Instagram</span>`
                  : ""
              }

            </div>


            ${
              business.mapsUrl
                ? `
                  <div style="margin-top:12px;">
                    <a
                      href="${business.mapsUrl}"
                      target="_blank"
                      rel="noopener noreferrer"
                      style="
                        font-size:11px;
                        color:inherit;
                      "
                    >
                      View on OpenStreetMap →
                    </a>
                  </div>
                `
                : ""
            }

          </div>

        `).join("")}

      </div>
    `;
  },

  renderError() {

    const container =
      document.getElementById(
        "discovery-results"
      );

    if (!container) return;

    container.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">
          !
        </div>

        <strong>
          Discovery failed
        </strong>

        <p>
          The data source could not be reached.
          Try again in a moment.
        </p>

      </div>
    `;
  },

  updateStatus(message) {

    const status =
      document.getElementById(
        "discovery-status"
      );

    if (status) {
      status.textContent = message;
    }
  },

  escapeHTML(value) {

    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
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
