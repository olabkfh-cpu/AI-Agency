const LeadIntelligence = {

  analyze(business) {

    let score = 40;
    const gaps = [];
    let service = "QR Review System";

    // Website
    if (business.website) {
      score += 15;
    } else {
      gaps.push("Website");
      score += 5;
      service = "Professional Website";
    }

    // Phone
    if (business.phone) {
      score += 10;
    } else {
      gaps.push("Phone");
    }

    // Instagram
    if (business.instagram) {
      score += 10;
    } else {
      gaps.push("Instagram");
    }

    // Address
    if (business.address) {
      score += 5;
    } else {
      gaps.push("Address");
    }

    score = Math.min(score, 100);

    let priority = "Low";

    if (score >= 75) {
      priority = "High";
    } else if (score >= 55) {
      priority = "Medium";
    }

    const opportunity =
      this.generateOpportunity(
        business,
        gaps
      );

    return {
      score,
      priority,
      gaps,
      opportunity,
      service
    };
  },


  generateOpportunity(
    business,
    gaps
  ) {

    if (!business.website) {
      return "Improve the company's online presence with a professional website.";
    }

    if (!business.instagram) {
      return "Improve social media visibility and customer acquisition.";
    }

    return "Improve customer engagement and online reviews.";
  },


  enrichResults(results) {

    if (!Array.isArray(results)) {
      return [];
    }

    return results.map(
      (business) => ({
        ...business,

        intelligence:
          this.analyze(
            business
          )
      })
    );
  },


  getServiceRecommendation(
    business
  ) {

    const intelligence =
      this.analyze(
        business
      );

    return intelligence.service;
  },


  formatScore(score) {

    if (score >= 75) {
      return "High";
    }

    if (score >= 55) {
      return "Medium";
    }

    return "Low";
  }

};


window.LeadIntelligence =
  LeadIntelligence;
