import { validationResult, matchedData } from 'express-validator';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, BadRequestError, logger } from '../common/index.js';
import { check_length_TEXT, default_delete_status, default_status, false_status, paginate, tag_root, true_status, return_all_letters_uppercase, timestamp_str_alt } from '../config/config.js';
import db from "../models/index.js";

const LOGS = db.logs;
const USERS = db.users;
const Op = db.Sequelize.Op;

export async function rootGetLogs(req, res) {
	const total_records = await LOGS.count();
	const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	LOGS.findAndCountAll({
		attributes: { exclude: ['id'] },
		order: [
			[orderBy, sortBy]
		],
		include: [
			{
				model: USERS,
				attributes: ['fullname', 'role', 'email', 'access', 'login_timestamp']
			}
		],
		distinct: true,
		offset: pagination.start,
		limit: pagination.limit
	}).then(logs => {
		if (!logs || logs.length == 0) {
			SuccessResponse(res, { unique_id: tag_root, text: "Logs Not found" }, []);
		} else {
			SuccessResponse(res, { unique_id: tag_root, text: "Logs loaded" }, { ...logs, pages: pagination.pages });
		}
	}).catch(err => {
		ServerError(res, { unique_id: tag_root, text: err.message }, null);
	});
};

export async function rootGetLogsSpecifically(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await LOGS.count({ where: { ...payload } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		LOGS.findAndCountAll({
			attributes: { exclude: ['id'] },
			where: {
				...payload
			},
			order: [
				[orderBy, sortBy]
			],
			include: [
				{
					model: USERS,
					attributes: ['fullname', 'role', 'email', 'access', 'login_timestamp']
				}
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(logs => {
			if (!logs || logs.length == 0) {
				SuccessResponse(res, { unique_id: tag_root, text: "Logs Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: tag_root, text: "Logs loaded" }, { ...logs, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		});
	}
};

export async function rootFilterLogs(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await LOGS.count({
			where: {
				createdAt: {
					[Op.gte]: timestamp_str_alt(new Date(payload.start_date).setHours(0, 0, 0, 0)),
					[Op.lte]: timestamp_str_alt(new Date(payload.end_date).setHours(23, 59, 59, 0))
				} 
			} 
		});
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		LOGS.findAndCountAll({
			attributes: { exclude: ['id'] },
			where: {
				createdAt: {
					[Op.gte]: timestamp_str_alt(new Date(payload.start_date).setHours(0, 0, 0, 0)),
					[Op.lte]: timestamp_str_alt(new Date(payload.end_date).setHours(23, 59, 59, 0))
				}
			},
			order: [
				[orderBy, sortBy]
			],
			include: [
				{
					model: USERS,
					attributes: ['fullname', 'role', 'email', 'access', 'login_timestamp']
				}
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(logs => {
			if (!logs || logs.length == 0) {
				SuccessResponse(res, { unique_id: tag_root, text: "Filtered Logs Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: tag_root, text: "Filtered Logs loaded" }, { ...logs, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		});
	}
};

export async function getLogs(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const user_type = req.USER_TYPE;

	const total_records = await LOGS.count();
	const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	LOGS.findAndCountAll({
		attributes: { exclude: ['id'] },
		order: [
			[orderBy, sortBy]
		],
		include: [
			{
				model: USERS,
				attributes: ['fullname', 'role', 'email', 'access', 'login_timestamp']
			}
		],
		distinct: true,
		offset: pagination.start,
		limit: pagination.limit
	}).then(logs => {
		if (!logs || logs.length == 0) {
			SuccessResponse(res, { unique_id: tag_root, text: "Logs Not found" }, []);
		} else {
			const log_data = {
				user_unique_id: user_unique_id,
				type: "Logs",
				action: `Viewed all logs | page = ${req.query.page || req.body.page}, size = ${req.query.size || req.body.size}, pages = ${pagination.pages}, total = ${total_records}`
			};
			addLog(log_data);
			SuccessResponse(res, { unique_id: tag_root, text: "Logs loaded" }, { ...logs, pages: pagination.pages });
		}
	}).catch(err => {
		ServerError(res, { unique_id: tag_root, text: err.message }, null);
	});
};

export async function getLogsSpecifically(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const user_type = req.USER_TYPE;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await LOGS.count({ where: { ...payload } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		LOGS.findAndCountAll({
			attributes: { exclude: ['id'] },
			where: {
				...payload
			},
			order: [
				[orderBy, sortBy]
			],
			include: [
				{
					model: USERS,
					attributes: ['fullname', 'role', 'email', 'access', 'login_timestamp']
				}
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(logs => {
			if (!logs || logs.length == 0) {
				SuccessResponse(res, { unique_id: tag_root, text: "Logs Not found" }, []);
			} else {
				const log_data = {
					user_unique_id: user_unique_id,
					type: "Logs",
					action: `Viewed all logs specifically | page = ${req.query.page || req.body.page}, size = ${req.query.size || req.body.size}, pages = ${pagination.pages}, total = ${total_records}`
				};
				addLog(log_data);
				SuccessResponse(res, { unique_id: tag_root, text: "Logs loaded" }, { ...logs, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		});
	}
};

export async function filterLogs(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const user_type = req.USER_TYPE;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await LOGS.count({
			where: {
				createdAt: {
					[Op.gte]: timestamp_str_alt(new Date(payload.start_date).setHours(0, 0, 0, 0)),
					[Op.lte]: timestamp_str_alt(new Date(payload.end_date).setHours(23, 59, 59, 0))
				}
			}
		});
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		LOGS.findAndCountAll({
			attributes: { exclude: ['id'] },
			where: {
				createdAt: {
					[Op.gte]: timestamp_str_alt(new Date(payload.start_date).setHours(0, 0, 0, 0)),
					[Op.lte]: timestamp_str_alt(new Date(payload.end_date).setHours(23, 59, 59, 0))
				}
			},
			order: [
				[orderBy, sortBy]
			],
			include: [
				{
					model: USERS,
					attributes: ['fullname', 'role', 'email', 'access', 'login_timestamp']
				}
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(logs => {
			if (!logs || logs.length == 0) {
				SuccessResponse(res, { unique_id: tag_root, text: "Filtered Logs Not found" }, []);
			} else {
				const log_data = {
					user_unique_id: user_unique_id,
					type: "Logs",
					action: `Filtered all logs | start = ${payload.start_date}, end = ${payload.end_date} | page = ${req.query.page || req.body.page}, size = ${req.query.size || req.body.size}, pages = ${pagination.pages}, total = ${total_records}`
				};
				addLog(log_data);
				SuccessResponse(res, { unique_id: tag_root, text: "Filtered Logs loaded" }, { ...logs, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		});
	}
};

export async function addLog(data, transaction) {

	let msg;
	let param;
	const log_expiring = moment().add(1, 'month').toDate();

	if (data.user_unique_id === "" || data.user_unique_id === undefined) {
		msg = "User Unique ID is required";
		param = "user_unique_id";
		logger.warn({ unique_id: data.user_unique_id, text: `Logs | Validation Error Occured - ${param} : ${msg}` });
	} else if (data.type === "" || data.type === undefined) {
		msg = "Type is required";
		param = "type";
		logger.warn({ unique_id: data.user_unique_id, text: `Logs | Validation Error Occured - ${param} : ${msg}` });
	} else if (data.type.length > 50) {
		msg = "Type max length reached";
		param = "type";
		logger.warn({ unique_id: data.user_unique_id, text: `Logs | Validation Error Occured - ${param} : ${msg}` });
	} else if (data.action === "" || data.action === undefined) {
		msg = "Action is required";
		param = "action";
		logger.warn({ unique_id: data.user_unique_id, text: `Logs | Validation Error Occured - ${param} : ${msg}` });
	} else if (data.action.length > 200) {
		msg = "Action max length reached";
		param = "action";
		logger.warn({ unique_id: data.user_unique_id, text: `Logs | Validation Error Occured - ${param} : ${msg}` });
	} else if ((data.details !== "" && data.details !== undefined) && data.details.length > check_length_TEXT) {
		msg = "Detials max length reached";
		param = "details";
		logger.warn({ unique_id: data.user_unique_id, text: `Logs | Validation Error Occured - ${param} : ${msg}` });
	} else {
		try {
			const log = LOGS.create({
				...data,
				unique_id: uuidv4(),
				expiry_date: log_expiring,
				status: default_status
			}, { transaction });
			logger.info({ unique_id: data.user_unique_id, text: `Log - ${data.action}` });
			return log;
		} catch (err) {
			logger.error({ unique_id: data.user_unique_id, text: err.message });
		}
	}
};

export async function clearFilteredLogs(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		const logs = await LOGS.destroy(
			{
				where: {
					createdAt: {
						[Op.gte]: timestamp_str_alt(new Date(payload.start_date).setHours(0, 0, 0, 0)),
						[Op.lte]: timestamp_str_alt(new Date(payload.end_date).setHours(23, 59, 59, 0))
					}
				},
			}
		);

		if (logs > 0) {
			SuccessResponse(res, { unique_id: tag_root, text: "Logs cleared successfully!" });
		} else {
			throw new Error("Error clearing logs");
		}
	}
};

export async function clearExpiredLogs(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		const logs = await LOGS.destroy(
			{
				where: {
					expiry_date: {
						[Op.gte]: timestamp_str_alt(new Date(payload.start_date).setHours(0, 0, 0, 0)),
						[Op.lte]: timestamp_str_alt(new Date(payload.end_date).setHours(23, 59, 59, 0))
					}
				},
			}
		);

		if (logs > 0) {
			SuccessResponse(res, { unique_id: tag_root, text: "Expired logs cleared successfully!" });
		} else {
			throw new Error("Error clearing expired logs");
		}
	}
};