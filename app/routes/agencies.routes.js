import { checks } from "../middleware/index.js";
import { agencies_rules } from "../rules/agencies.rules.js";
import { default_rules } from "../rules/default.rules.js";
import {
	addAgency, deleteAgency, publicGetAgencies, publicGetAgency, publicSearchAgencies, rootGetAgencies, rootGetAgenciesSpecifically, 
	rootGetAgency, rootSearchAgencies, updateAgencyDetails
} from "../controllers/agencies.controller.js";

export default function (app) {
	app.get("/agencies", [checks.verifyToken, checks.isUser], rootGetAgencies);
	app.get("/search/agencies", [checks.verifyToken, checks.isUser, default_rules.forSearching], rootSearchAgencies);
	app.get("/agency", [checks.verifyToken, checks.isUser, agencies_rules.forFindingAgencyInternal], rootGetAgency);

	app.get("/public/agencies", publicGetAgencies);
	app.get("/public/search/agencies", [default_rules.forSearching], publicSearchAgencies);
	app.get("/public/agency", [agencies_rules.forFindingAgency], publicGetAgency);

	app.post("/add/agency", [checks.verifyToken, checks.isUser, agencies_rules.forAdding], addAgency);

	app.put("/update/agency/details", [checks.verifyToken, checks.isUser, agencies_rules.forFindingAgency, agencies_rules.forUpdating], updateAgencyDetails);

	app.delete("/agency", [checks.verifyToken, checks.isUser, agencies_rules.forFindingAgency], deleteAgency);
};
