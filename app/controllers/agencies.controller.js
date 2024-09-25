import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import {
	default_delete_status, default_status, true_status, false_status, paginate, tag_root, email_templates, return_all_letters_uppercase,
	anonymous, random_uuid, zero
} from '../config/config.js';
import db from "../models/index.js";
import { addLog } from './logs.controller.js';

const AGENCIES = db.agencies;
const Op = db.Sequelize.Op;

export async function rootGetAgencies(req, res) {
	const total_records = await AGENCIES.count();
	const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	AGENCIES.findAndCountAll({
		attributes: { exclude: ['id'] },
		order: [
			[orderBy, sortBy]
		],
		distinct: true,
		offset: pagination.start,
		limit: pagination.limit
	}).then(agencies => {
		if (!agencies || agencies.length === 0) {
			SuccessResponse(res, { unique_id: tag_root, text: "Agencies Not found" }, []);
		} else {
			SuccessResponse(res, { unique_id: tag_root, text: "Agencies loaded" }, { ...agencies, pages: pagination.pages });
		}
	}).catch(err => {
		ServerError(res, { unique_id: tag_root, text: err.message }, null);
	});
};

export function rootGetAgency(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		AGENCIES.findOne({
			attributes: { exclude: ['id'] },
			where: {
				...payload
			},
		}).then(agency => {
			if (!agency) {
				NotFoundError(res, { unique_id: tag_root, text: "Agency not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: tag_root, text: "Agency loaded" }, agency);
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		});
	}
};

export async function rootSearchAgencies(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await AGENCIES.count({
			where: {
				[Op.or]: [
					{
						name: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					}
				]
			}
		});
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

		AGENCIES.findAndCountAll({
			attributes: { exclude: ['id'] },
			where: {
				[Op.or]: [
					{
						name: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						},
					}
				]
			},
			order: [
				['createdAt', 'DESC']
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(agencies => {
			if (!agencies || agencies.length === 0) {
				SuccessResponse(res, { unique_id: tag_root, text: "Agencies Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: tag_root, text: "Agencies loaded" }, { ...agencies, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		});
	}
};

export async function rootGetAgenciesSpecifically(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await AGENCIES.count({ where: { ...payload } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		AGENCIES.findAndCountAll({
			attributes: { exclude: ['id'] },
			where: {
				...payload
			},
			order: [
				[orderBy, sortBy]
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(agencies => {
			if (!agencies || agencies.length === 0) {
				SuccessResponse(res, { unique_id: tag_root, text: "Agencies Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: tag_root, text: "Agencies loaded" }, { ...agencies, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		});
	}
};

export async function publicGetAgencies(req, res) {
	// const total_records = await AGENCIES.count();
	// const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	AGENCIES.findAndCountAll({
		attributes: { exclude: ['id'] },
		order: [
			[orderBy, sortBy]
		],
		// offset: pagination.start,
		// limit: pagination.limit
	}).then(agencies => {
		if (!agencies || agencies.length === 0) {
			SuccessResponse(res, { unique_id: anonymous, text: "Agencies Not found" }, []);
		} else {
			SuccessResponse(res, { unique_id: anonymous, text: "Agencies loaded" }, { ...agencies });
			// SuccessResponse(res, { unique_id: anonymous, text: "Agencies loaded" }, { ...agencies, pages: pagination.pages });
		}
	}).catch(err => {
		ServerError(res, { unique_id: anonymous, text: err.message }, null);
	});
};

export function publicGetAgency(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		AGENCIES.findOne({
			attributes: { exclude: ['id', 'status'] },
			where: {
				...payload,
			},
		}).then(async agency => {
			if (!agency) {
				NotFoundError(res, { unique_id: anonymous, text: "Agency not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: anonymous, text: "Agency loaded" }, agency);
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function publicSearchAgencies(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		// const total_records = await AGENCIES.count({
		// 	where: {
		// 		[Op.or]: [
		// 			{
		// 				name: {
		// 					[Op.or]: {
		// 						[Op.like]: `%${payload.search}`,
		// 						[Op.startsWith]: `${payload.search}`,
		// 						[Op.endsWith]: `${payload.search}`,
		// 						[Op.substring]: `${payload.search}`,
		// 					}
		// 				}
		// 			}
		// 		]
		// 	}
		// });
		// const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

		AGENCIES.findAndCountAll({
			attributes: { exclude: ['id'] },
			where: {
				[Op.or]: [
					{
						name: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					}
				]
			},
			order: [
				['createdAt', 'DESC']
			],
			// offset: pagination.start,
			// limit: pagination.limit
		}).then(agencies => {
			if (!agencies || agencies.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Agencies Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: anonymous, text: "Agencies loaded" }, { ...agencies });
				// SuccessResponse(res, { unique_id: anonymous, text: "Agencies loaded" }, { ...agencies, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function addAgency(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const agency = await AGENCIES.create(
					{
						unique_id: uuidv4(),
						name: payload.name,
						sync_timestamp: null,
						verifications: zero,
						status: default_status
					}, { transaction }
				);

				if (agency) {
					const log_data = {
						user_unique_id: user_unique_id,
						type: "Agencies",
						action: `Added new agency | Agency: ${payload.name}`
					};
					addLog(log_data);
					SuccessResponse(res, { unique_id: user_unique_id, text: "Agency created successfully!" }, null);
				} else {
					throw new Error("Error adding agency");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updateAgencyDetails(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const agency = await AGENCIES.update(
					{
						name: payload.name,
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (agency > 0) {
					const log_data = {
						user_unique_id: user_unique_id,
						type: "Agencies",
						action: `Updated agency details | Agency: ${payload.name}`
					};
					addLog(log_data);
					SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Agency not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function deleteAgency(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const agency_details = await AGENCIES.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!agency_details) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Agency not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const agency = await AGENCIES.destroy(
						{
							where: {
								unique_id: payload.unique_id,
								status: default_status
							},
							transaction
						}
					);

					if (agency > 0) {
						const log_data = {
							user_unique_id: user_unique_id,
							type: "Agencies",
							action: `Deleted agency | Agency: ${agency_details.name}`
						};
						addLog(log_data);
						OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Agency was deleted successfully!" });
					} else {
						throw new Error("Error deleting agency");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};