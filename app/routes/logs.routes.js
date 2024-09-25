import { checks } from "../middleware/index.js";
import { logs_rules } from "../rules/logs.rules.js";
import { rootGetLogs, rootGetLogsSpecifically, rootFilterLogs, clearExpiredLogs, clearFilteredLogs, filterLogs, getLogs, getLogsSpecifically } from "../controllers/logs.controller.js";

export default function (app) {
	app.get("/logs", [checks.verifyToken, checks.isUser], rootGetLogs);
	app.get("/logs/via/type", [checks.verifyToken, checks.isUser, logs_rules.forFindingLogViaType], rootGetLogsSpecifically);
	app.get("/logs/via/user", [checks.verifyToken, checks.isUser, logs_rules.forFindingViaUserUniqueId], rootGetLogsSpecifically);
	app.get("/logs/filter", [checks.verifyToken, checks.isUser, logs_rules.forFiltering], rootFilterLogs);
	
	app.delete("/clear/expired/logs", [checks.verifyToken, checks.isUser, logs_rules.forFiltering], clearExpiredLogs);
	app.delete("/clear/filtered/logs", [checks.verifyToken, checks.isUser, logs_rules.forFiltering], clearFilteredLogs);
};