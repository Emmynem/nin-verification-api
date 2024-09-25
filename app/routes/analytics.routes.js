import { checks } from "../middleware/index.js";
import { default_rules } from "../rules/default.rules.js";
import { getAnalytics, getFilteredAnalytics, getAgencyAnalytics, getProviderAnalytics } from "../controllers/analytics.controller.js";

export default function (app) {
	app.get("/analytics", [checks.verifyToken, checks.isUser], getAnalytics);
	app.get("/filter/analytics", [checks.verifyToken, checks.isUser, default_rules.forFiltering], getFilteredAnalytics);
	
	app.get("/agency/analytics", [checks.verifyAgencyToken, checks.isAgencyUser], getAgencyAnalytics);
	app.get("/provider/analytics", [checks.verifyProviderToken, checks.isProviderUser], getProviderAnalytics);
};