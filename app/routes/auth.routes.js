import { checks } from "../middleware/index.js";
import { user_rules } from "../rules/users.rules.js";
import { agencies_rules } from "../rules/agencies.rules.js";
import { agencyUserSignIn, adminSignIn, providerUserSignIn, userSignIn, userSignUp } from "../controllers/auth.controller.js";

export default function (app) {
	// User Auth Routes 
	app.post("/auth/citizen/signup", [user_rules.forAddingCitizen], userSignUp);
	app.post("/auth/citizen/signin", [user_rules.forEmailLogin], userSignIn);

	app.post("/auth/admin/signin", [user_rules.forEmailLogin], adminSignIn);
	app.post("/auth/agency/signin", [agencies_rules.forFindingAgencyAlt, user_rules.forEmailLogin], agencyUserSignIn);
	app.post("/auth/provider/signin", [user_rules.forEmailLogin], providerUserSignIn);
};