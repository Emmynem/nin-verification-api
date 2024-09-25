import { checks } from "../middleware/index.js";
import { agencies_rules } from "../rules/agencies.rules.js";
import { providers_rules } from "../rules/providers.rules.js";
import { verification_rules } from "../rules/verifications.rules.js";
import { default_rules } from "../rules/default.rules.js";
import {
	addVerification, deleteVerification, rootGetVerification, rootGetVerifications, 
	rootGetVerificationsSpecifically, rootSearchVerifications, verifyIdentity, agencyGetVerifications, agencySearchVerifications, agencyGetVerification, 
	agencyGetVerificationsSpecifically, providerGetVerification, providerGetVerifications, providerGetVerificationsSpecifically, providerSearchVerifications,
	publicVerifyIdentity
} from "../controllers/verifications.controller.js";

export default function (app) {
	app.get("/verifications", [checks.verifyToken, checks.isUser], rootGetVerifications);
	app.get("/verifications/via/agency", [checks.verifyToken, checks.isUser, agencies_rules.forFindingAgencyAlt], rootGetVerificationsSpecifically);
	app.get("/verifications/via/provider", [checks.verifyToken, checks.isUser, providers_rules.forFindingProviderAlt], rootGetVerificationsSpecifically);
	app.get("/verifications/via/type", [checks.verifyToken, checks.isUser, verification_rules.forFindingType], rootGetVerificationsSpecifically);
	app.get("/search/verifications", [checks.verifyToken, checks.isUser, default_rules.forSearching], rootSearchVerifications);
	app.get("/verification", [checks.verifyToken, checks.isUser, verification_rules.forFindingVerification], rootGetVerification);
	
	app.get("/agency/verifications", [checks.verifyAgencyToken, checks.isAgencyUser], agencyGetVerifications);
	app.get("/agency/verifications/via/type", [checks.verifyAgencyToken, checks.isAgencyUser, verification_rules.forFindingType], agencyGetVerificationsSpecifically);
	app.get("/agency/search/verifications", [checks.verifyAgencyToken, checks.isAgencyUser, default_rules.forSearching], agencySearchVerifications);
	app.get("/agency/verification", [checks.verifyAgencyToken, checks.isAgencyUser, verification_rules.forFindingVerification], agencyGetVerification);

	app.get("/provider/verifications", [checks.verifyProviderToken, checks.isProviderUser], providerGetVerifications);
	app.get("/provider/verifications/via/type", [checks.verifyProviderToken, checks.isProviderUser, verification_rules.forFindingType], providerGetVerificationsSpecifically);
	app.get("/provider/search/verifications", [checks.verifyProviderToken, checks.isProviderUser, default_rules.forSearching], providerSearchVerifications);
	app.get("/provider/verification", [checks.verifyProviderToken, checks.isProviderUser, verification_rules.forFindingVerification], providerGetVerification);

	app.post("/public/verify/identity", [agencies_rules.forAddingAgencyAlt, providers_rules.forAddingProviderAlt, verification_rules.forFindingType, verification_rules.forFindingIdentificationId], publicVerifyIdentity);

	app.post("/add/verification", [checks.verifyToken, checks.isCitizenUser, verification_rules.forAdding], addVerification);

	app.post("/verify/identity", [checks.verifyToken, checks.isUser, agencies_rules.forAddingAgencyAlt, providers_rules.forAddingProviderAlt, verification_rules.forFindingType, verification_rules.forFindingIdentificationId], verifyIdentity);

	app.delete("/verification", [checks.verifyToken, checks.isUser, verification_rules.forFindingVerification], deleteVerification);
};
