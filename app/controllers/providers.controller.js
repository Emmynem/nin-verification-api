import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import {
	default_delete_status, default_status, true_status, false_status, paginate, tag_root, email_templates, return_all_letters_uppercase,
	anonymous, random_uuid, zero
} from '../config/config.js';
import db from "../models/index.js";
import { addLog } from './logs.controller.js';

const PROVIDERS = db.providers;
const Op = db.Sequelize.Op;

export async function rootGetProviders(req, res) {
	const total_records = await PROVIDERS.count();
	const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	PROVIDERS.findAndCountAll({
		attributes: { exclude: ['id'] },
		order: [
			[orderBy, sortBy]
		],
		distinct: true,
		offset: pagination.start,
		limit: pagination.limit
	}).then(providers => {
		if (!providers || providers.length === 0) {
			SuccessResponse(res, { unique_id: tag_root, text: "Providers Not found" }, []);
		} else {
			SuccessResponse(res, { unique_id: tag_root, text: "Providers loaded" }, { ...providers, pages: pagination.pages });
		}
	}).catch(err => {
		ServerError(res, { unique_id: tag_root, text: err.message }, null);
	});
};

export function rootGetProvider(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		PROVIDERS.findOne({
			attributes: { exclude: ['id'] },
			where: {
				...payload
			},
		}).then(provider => {
			if (!provider) {
				NotFoundError(res, { unique_id: tag_root, text: "Provider not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: tag_root, text: "Provider loaded" }, provider);
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		});
	}
};

export async function rootSearchProviders(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await PROVIDERS.count({
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

		PROVIDERS.findAndCountAll({
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
		}).then(providers => {
			if (!providers || providers.length === 0) {
				SuccessResponse(res, { unique_id: tag_root, text: "Providers Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: tag_root, text: "Providers loaded" }, { ...providers, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		});
	}
};

export async function rootGetProvidersSpecifically(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await PROVIDERS.count({ where: { ...payload } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		PROVIDERS.findAndCountAll({
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
		}).then(providers => {
			if (!providers || providers.length === 0) {
				SuccessResponse(res, { unique_id: tag_root, text: "Providers Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: tag_root, text: "Providers loaded" }, { ...providers, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		});
	}
};

export async function publicGetProviders(req, res) {
	// const total_records = await PROVIDERS.count();
	// const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	PROVIDERS.findAndCountAll({
		attributes: { exclude: ['id'] },
		order: [
			[orderBy, sortBy]
		],
		// offset: pagination.start,
		// limit: pagination.limit
	}).then(providers => {
		if (!providers || providers.length === 0) {
			SuccessResponse(res, { unique_id: anonymous, text: "Providers Not found" }, []);
		} else {
			SuccessResponse(res, { unique_id: anonymous, text: "Providers loaded" }, { ...providers });
			// SuccessResponse(res, { unique_id: anonymous, text: "Providers loaded" }, { ...providers, pages: pagination.pages });
		}
	}).catch(err => {
		ServerError(res, { unique_id: anonymous, text: err.message }, null);
	});
};

export function publicGetProvider(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		PROVIDERS.findOne({
			attributes: { exclude: ['id', 'status'] },
			where: {
				...payload,
			},
		}).then(async provider => {
			if (!provider) {
				NotFoundError(res, { unique_id: anonymous, text: "Provider not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: anonymous, text: "Provider loaded" }, provider);
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function publicSearchProviders(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		// const total_records = await PROVIDERS.count({
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

		PROVIDERS.findAndCountAll({
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
		}).then(providers => {
			if (!providers || providers.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Providers Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: anonymous, text: "Providers loaded" }, { ...providers });
				// SuccessResponse(res, { unique_id: anonymous, text: "Providers loaded" }, { ...providers, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function addProvider(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const provider = await PROVIDERS.create(
					{
						unique_id: uuidv4(),
						name: payload.name,
						type: payload.type,
						access_timestamp: null,
						usage: zero,
						status: default_status
					}, { transaction }
				);

				if (provider) {
					const log_data = {
						user_unique_id: user_unique_id,
						type: "Providers",
						action: `Added new provider | Provider: ${payload.name}`
					};
					addLog(log_data);
					SuccessResponse(res, { unique_id: user_unique_id, text: "Provider created successfully!" }, null);
				} else {
					throw new Error("Error adding provider");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updateProviderDetails(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const provider = await PROVIDERS.update(
					{
						name: payload.name,
						type: payload.type,
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (provider > 0) {
					const log_data = {
						user_unique_id: user_unique_id,
						type: "Providers",
						action: `Updated provider details | Provider: ${payload.name}`
					};
					addLog(log_data);
					SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("Provider not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function deleteProvider(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const provider_details = await PROVIDERS.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!provider_details) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Provider not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const provider = await PROVIDERS.destroy(
						{
							where: {
								unique_id: payload.unique_id,
								status: default_status
							},
							transaction
						}
					);

					if (provider > 0) {
						const log_data = {
							user_unique_id: user_unique_id,
							type: "Providers",
							action: `Deleted provider | Provider: ${provider_details.name}`
						};
						addLog(log_data);
						OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Provider was deleted successfully!" });
					} else {
						throw new Error("Error deleting provider");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};