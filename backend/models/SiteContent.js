const mongoose = require('mongoose');

const SiteContentSchema = new mongoose.Schema({
    // HOME PAGE
    heroTitle: { type: String, default: "MOVING WAS NEVER\nSO EASY" },
    heroSubtitle: { type: String, default: "FAST & SECURE MOVE" },
    aboutTitle: { type: String, default: "TRANSPORT & LOGISTICS" },
    aboutDesc1: { type: String, default: "E-DROP is committed to revolutionizing transportation and logistics by providing simple, fast, and reliable solutions that connect people and businesses seamlessly." },
    aboutDesc2: { type: String, default: "We offer innovative services including eCab for quick and comfortable rides, eShip for secure parcel delivery, and eCargo for comprehensive freight and logistics." },
    contactPhone: { type: String, default: "+92 321-125687" },
    contactEmail: { type: String, default: "sachdeva@coin.sin" },
    contactLocation: { type: String, default: "Sadar Bazar, Peshawar, Kpk" },

    // ABOUT PAGE
    aboutPageStory: { type: String, default: "Our story started with a vision to connect Kohat with the world." },
    aboutPageMission: { type: String, default: "To provide the most reliable logistics network in the region." },
    aboutPageVision: { type: String, default: "To become the leading transport provider across Pakistan." },

    // SERVICE PAGES
    ecabHeroTitle: { type: String, default: "BOOK YOUR RIDE INSTANTLY" },
    ecabDescription: { type: String, default: "Comfortable and safe rides for your daily commute." },
    shippingHeroTitle: { type: String, default: "RELIABLE PARCEL DELIVERY" },
    shippingDescription: { type: String, default: "Fast door-to-door delivery for all your packages." },
    cargoHeroTitle: { type: String, default: "HEAVY LOGISTICS SOLUTIONS" },
    cargoDescription: { type: String, default: "Efficient freight management for your commercial needs." },

    // FAQ PAGE (Simple Version for now)
    faqGeneralTitle: { type: String, default: "GENERAL QUESTIONS" },
    faqSupportTitle: { type: String, default: "SUPPORT & HELP" },

    // LEGAL PAGES
    privacyPolicyContent: { type: String, default: "Your privacy is important to us. We collect minimal data..." },
    termsConditionsContent: { type: String, default: "By using E-Drop, you agree to our terms of service..." },

    // SOCIAL LINKS
    facebookLink: { type: String, default: "#" },
    twitterLink: { type: String, default: "#" },
    instagramLink: { type: String, default: "#" },
    linkedinLink: { type: String, default: "#" }

}, { timestamps: true });

module.exports = mongoose.model('SiteContent', SiteContentSchema);
