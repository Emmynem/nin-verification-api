import { check } from 'express-validator';
import moment from 'moment';
import { 
	default_status, default_delete_status, default_pending_status, validate_future_end_date, validate_past_date 
} from '../config/config.js';
import db from "../models/index.js";

const LOGS = db.logs;

export const logs_rules = {
	forFindingLog: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(unique_id => {
				return LOGS.findOne({ where: { unique_id: unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Vendor not found!');
				});
			})
	],
	forFindingLogViaType: [
		check('type', "Type is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 2, max: 50 })
			.withMessage("Invalid length (2 - 50) characters"),
	],
	forFiltering: [
		check('start_date', "Start Date is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(start_date => {
				const later = moment(start_date, "YYYY-MM-DD", true);
				return later.isValid();
			})
			.withMessage("Invalid start datetime format (YYYY-MM-DD)")
			.bail()
			.custom(start_date => !!validate_past_date(start_date))
			.withMessage("Invalid start datetime"),
		check('end_date', "End Date is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(end_date => {
				const later = moment(end_date, "YYYY-MM-DD", true);
				return later.isValid();
			})
			.withMessage("Invalid end datetime format (YYYY-MM-DD)")
			.bail()
			.custom((end_date, { req }) => !!validate_future_end_date(req.query.start_date || req.body.start_date || '', end_date)),
	],
	forFindingViaUserUniqueId: [
		check('user_unique_id', "User Unique ID is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
	],
};  