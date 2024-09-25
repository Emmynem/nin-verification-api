import { checks } from "../middleware/index.js";
import { providers_rules } from "../rules/providers.rules.js";
import { default_rules } from "../rules/default.rules.js";
import {
	addProvider, deleteProvider, publicGetProvider, publicGetProviders, publicSearchProviders, rootGetProvider, rootGetProviders, 
	rootGetProvidersSpecifically,  rootSearchProviders, updateProviderDetails
} from "../controllers/providers.controller.js";

export default function (app) {
	app.get("/providers", [checks.verifyToken, checks.isUser], rootGetProviders);
	app.get("/search/providers", [checks.verifyToken, checks.isUser, default_rules.forSearching], rootSearchProviders);
	app.get("/provider", [checks.verifyToken, checks.isUser, providers_rules.forFindingProviderInternal], rootGetProvider);

	app.get("/public/providers", publicGetProviders);
	app.get("/public/search/providers", [default_rules.forSearching], publicSearchProviders);
	app.get("/public/provider", [providers_rules.forFindingProvider], publicGetProvider);

	app.post("/add/provider", [checks.verifyToken, checks.isUser, providers_rules.forAdding], addProvider);

	app.put("/update/provider/details", [checks.verifyToken, checks.isUser, providers_rules.forFindingProvider, providers_rules.forUpdating], updateProviderDetails);

	app.delete("/provider", [checks.verifyToken, checks.isUser, providers_rules.forFindingProvider], deleteProvider);
};
