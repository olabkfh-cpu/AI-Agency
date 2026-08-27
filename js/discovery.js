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

    this.state.industry = String(
      data.get("industry") || ""
    ).trim();

    this.state.location = String(
      data.get("location") || ""
    ).trim();

    this.state.limit = Math.min(
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

    if (
      !this.state.industry ||
      !this.state.location
    ) {
      this.updateStatus(
        "Please enter an industry and location."
      );
      return;
    }

    this.state.running = true;
    this.state.results = [];

    this.updateStatus("Finding location...");

    try {
      const areaId =
        await this.findLocation();

      if (!areaId) {
        throw new Error(
          "Location not found."
        );
      }

      this.updateStatus(
        "Searching businesses..."
      );

      const results =
        await this.searchBusinesses(
          areaId
        );

      this.state.results = results;

      this.renderResults(results);

      this.updateStatus(
        `Found ${results.length} results.`
      );

    } catch (error) {

      console.error(
        "Discovery error:",
        error
      );

      this.updateStatus(
        "Search failed."
      );

      this.renderError(
        error.message
      );

    } finally {
      this.state.running = false;
    }
  },

  async findLocation() {

    const query =
      encodeURIComponent(
        this.state.location
      );

    const url =
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`;

    const response =
      await fetch(url, {
        headers: {
          "Accept":
            "application/json"
        }
      });

    if (!response.ok) {
      throw new Error(
        `Location service error: ${response.status}`
      );
    }

    const data =
      await response.json();

    if (
      !Array.isArray(data) ||
      data.length === 0
    ) {
      return null;
    }

    return {
      lat: Number(data[0].lat),
      lon: Number(data[0].lon)
    };
  },

  async searchBusinesses(location) {

    const lat =
      location.lat;

    const lon =
      location.lon;

    const radius = 10000;

    const query = `
[out:json][timeout:30];

(
  nwr["amenity"="restaurant"](around:${radius},${lat},${lon});
  nwr["amenity"="cafe"](around:${radius},${lat},${lon});
  nwr["amenity"="fast_food"](around:${radius},${lat},${lon});
);

out center tags;
`;

    const response =
      await fetch(
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
        `Search service error: ${response.status}`
      );
    }

    const data =
      await response.json();

    const elements =
      Array.isArray(data.elements)
        ? data.elements
        : [];

    return elements
      .map((element) => {

        const tags =
          element.tags || {};

        const lat =
          element.lat ??
          element.center?.lat ??
          null;

        const lon =
          element.lon ??
          element.center?.lon ??
          null;

        return {

          id:
            `${element.type}-${element.id}`,

          name:
            tags.name ||
            "Unnamed business",

          type:
            tags.amenity ||
            "business",

          address:
            this.buildAddress(tags),

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

          latitude:
            lat,

          longitude:
            lon,

          mapUrl:
            lat && lon
              ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`
              : ""
        };
      })

      .filter(
        (business) =>
          business.name !==
          "Unnamed business"
      )

      .slice(
        0,
        this.state.limit
      );
  },

  buildAddress(tags) {

    const parts = [];

    if (tags["addr:housenumber"]) {
      parts.push(
        tags["addr:housenumber"]
      );
    }

    if (tags["addr:street"]) {
      parts.push(
        tags["addr:street"]
      );
    }

    if (tags["addr:city"]) {
      parts.push(
        tags["addr:city"]
      );
    }

    return parts.join(", ");
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

          <div class="empty-icon">
            🔎
          </div>

          <strong>
            No businesses found
          </strong>

          <p>
            Try another location or search again.
          </p>

        </div>
      `;

      return;
    }

    container.innerHTML = `
      <div
        style="
          display:grid;
          gap:12px;
        "
      >

        ${results.map(
          (business) => `

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
                  ${this.escapeHTML(
                    business.name
                  )}
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
                  ? `
                    <span>
                      📞 ${this.escapeHTML(
                        business.phone
                      )}
                    </span>
                  `
                  : ""
              }

              ${
                business.website
                  ? `
                    <span>
                      🌐 Website
                    </span>
                  `
                  : ""
              }

              ${
                business.instagram
                  ? `
                    <span>
                      📸 Instagram
                    </span>
                  `
                  : ""
              }

            </div>

            ${
              business.mapUrl
                ? `
                  <div
                    style="
                      margin-top:12px;
                    "
                  >

                    <a
                      href="${business.mapUrl}"
                      target="_blank"
                      rel="noopener noreferrer"
                      style="
                        font-size:11px;
                        color:inherit;
                      "
                    >
                      View location →
                    </a>

                  </div>
                `
                : ""
            }

          </div>

        `
        ).join("")}

      </div>
    `;
  },

  renderError(message) {

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
          ${this.escapeHTML(
            message ||
            "Please try again."
          )}
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
      status.textContent =
        message;
    }
  },

  escapeHTML(value) {

    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
};


document.addEventListener(
  "DOMContentLoaded",
  () => {
    DiscoveryEngine.init();
  }
);


window.DiscoveryEngine =
  DiscoveryEngine;
