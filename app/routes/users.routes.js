import { checks } from "../middleware/index.js";
import { user_rules } from "../rules/users.rules.js";
import { agencies_rules } from "../rules/agencies.rules.js";
import { providers_rules } from "../rules/providers.rules.js";
import { default_rules } from "../rules/default.rules.js";
import {
	addUser, getUserProfile, rootGetUser, rootGetUsers, rootSearchUsers, updateUserAccessGranted, updateUserAccessRevoked, updateUserAccessSuspended, 
	updateUserDetails, userChangePassword, deleteUser
} from "../controllers/users.controller.js";

export default function (app) {
	app.get("/users", [checks.verifyToken, checks.isUser], rootGetUsers);
	app.get("/search/users", [checks.verifyToken, checks.isUser, default_rules.forSearching], rootSearchUsers);
	app.get("/user", [checks.verifyToken, checks.isUser, user_rules.forFindingUser], rootGetUser);

	app.get("/profile", [checks.verifyToken, checks.isUser], getUserProfile);

	app.post("/add/user", [checks.verifyToken, checks.isUser, agencies_rules.forAddingAgencyAlt, providers_rules.forAddingProviderAlt, user_rules.forAdding], addUser);
	
	app.put("/update/password", [checks.verifyToken, checks.isUser, user_rules.forFindingUser, user_rules.forChangingPassword], userChangePassword);
	app.put("/update/details", [checks.verifyToken, checks.isUser, user_rules.forFindingUser, user_rules.forUpdatingDetails], updateUserDetails);
	app.put("/update/agency", [checks.verifyToken, checks.isUser, user_rules.forFindingUser, agencies_rules.forFindingAgencyAlt], updateUserDetails);
	app.put("/update/provider", [checks.verifyToken, checks.isUser, user_rules.forFindingUser, providers_rules.forFindingProviderAlt], updateUserDetails);

	app.put("/user/access/grant", [checks.verifyToken, checks.isUser, user_rules.forFindingUser], updateUserAccessGranted);
	app.put("/user/access/suspend", [checks.verifyToken, checks.isUser, user_rules.forFindingUser], updateUserAccessSuspended);
	app.put("/user/access/revoke", [checks.verifyToken, checks.isUser, user_rules.forFindingUser], updateUserAccessRevoked);

	app.delete("/user", [checks.verifyToken, checks.isUser, user_rules.forFindingUser], deleteUser);
};
