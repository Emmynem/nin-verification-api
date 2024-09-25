import { validationResult, matchedData } from 'express-validator';
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, CreationSuccessResponse, BadRequestError, logger } from '../common/index.js';
import {
	default_delete_status, default_status, true_status, false_status, paginate, tag_root, email_templates, return_all_letters_uppercase,
	anonymous, random_uuid, zero, return_all_letters_lowercase, passcoder_live_api_url, passcoder_verify_nin_url, passcoder_verify_bvn_url,
	app_defaults, timestamp_str_alt
} from '../config/config.js';
import db from "../models/index.js";
import { addLog } from './logs.controller.js';

const AGENCIES = db.agencies;
const PROVIDERS = db.providers;
const VERIFICATIONS = db.verifications;
const APP_DEFAULTS = db.app_defaults;
const Op = db.Sequelize.Op;

export async function rootGetVerifications(req, res) {
	const total_records = await VERIFICATIONS.count();
	const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	VERIFICATIONS.findAndCountAll({
		attributes: ["unique_id", "agency_unique_id", "type", "identification_id", "firstname", "middlename", "lastname", "email", "phone_number", "alt_phone_number", "gender", "date_of_birth", "verification_reference", "verification_status", "status", "createdAt", "updatedAt"],
		order: [
			[orderBy, sortBy]
		],
		include: [
			{
				model: AGENCIES,
				attributes: ['name', 'sync_timestamp']
			},
			{
				model: PROVIDERS,
				attributes: ['name', 'type', 'access_timestamp']
			}
		],
		distinct: true,
		offset: pagination.start,
		limit: pagination.limit
	}).then(verifications => {
		if (!verifications || verifications.length === 0) {
			SuccessResponse(res, { unique_id: tag_root, text: "Verifications Not found" }, []);
		} else {
			SuccessResponse(res, { unique_id: tag_root, text: "Verifications loaded" }, { ...verifications, pages: pagination.pages });
		}
	}).catch(err => {
		ServerError(res, { unique_id: tag_root, text: err.message }, null);
	});
};

export function rootGetVerification(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		VERIFICATIONS.findOne({
			attributes: { exclude: ['id'] },
			where: {
				...payload
			},
			include: [
				{
					model: AGENCIES,
					attributes: ['name', 'sync_timestamp']
				},
				{
					model: PROVIDERS,
					attributes: ['name', 'type', 'access_timestamp']
				}
			],
		}).then(verification => {
			if (!verification) {
				NotFoundError(res, { unique_id: tag_root, text: "Verification not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: tag_root, text: "Verification loaded" }, verification);
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		});
	}
};

export async function rootSearchVerifications(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await VERIFICATIONS.count({
			where: {
				[Op.or]: [
					{
						identification_id: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						type: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						email: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						phone_number: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						alt_phone_number: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
				]
			}
		});
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

		VERIFICATIONS.findAndCountAll({
			attributes: ["unique_id", "agency_unique_id", "type", "identification_id", "firstname", "middlename", "lastname", "email", "phone_number", "alt_phone_number", "gender", "date_of_birth", "verification_reference", "verification_status", "status", "createdAt", "updatedAt"],
			where: {
				[Op.or]: [
					{
						identification_id: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						type: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						email: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						phone_number: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						alt_phone_number: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
				]
			},
			order: [
				['createdAt', 'DESC']
			],
			include: [
				{
					model: AGENCIES,
					attributes: ['name', 'sync_timestamp']
				},
				{
					model: PROVIDERS,
					attributes: ['name', 'type', 'access_timestamp']
				}
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(verifications => {
			if (!verifications || verifications.length === 0) {
				SuccessResponse(res, { unique_id: tag_root, text: "Verifications Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: tag_root, text: "Verifications loaded" }, { ...verifications, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		});
	}
};

export async function rootGetVerificationsSpecifically(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await VERIFICATIONS.count({ where: { ...payload } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		VERIFICATIONS.findAndCountAll({
			attributes: ["unique_id", "agency_unique_id", "type", "identification_id", "firstname", "middlename", "lastname", "email", "phone_number", "alt_phone_number", "gender", "date_of_birth", "verification_reference", "verification_status", "status", "createdAt", "updatedAt"],
			where: {
				...payload
			},
			order: [
				[orderBy, sortBy]
			],
			include: [
				{
					model: AGENCIES,
					attributes: ['name', 'sync_timestamp']
				},
				{
					model: PROVIDERS,
					attributes: ['name', 'type', 'access_timestamp']
				}
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(verifications => {
			if (!verifications || verifications.length === 0) {
				SuccessResponse(res, { unique_id: tag_root, text: "Verifications Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: tag_root, text: "Verifications loaded" }, { ...verifications, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		});
	}
};

export async function agencyGetVerifications(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const agency_unique_id = req.AGENCY_UNIQUE_ID;

	const total_records = await VERIFICATIONS.count({ where: { agency_unique_id } });
	const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	VERIFICATIONS.findAndCountAll({
		attributes: ["unique_id", "agency_unique_id", "type", "identification_id", "firstname", "middlename", "lastname", "email", "phone_number", "alt_phone_number", "gender", "date_of_birth", "verification_reference", "verification_status", "status", "createdAt", "updatedAt"],
		where: { 
			agency_unique_id: agency_unique_id 
		}, 
		order: [
			[orderBy, sortBy]
		],
		include: [
			{
				model: AGENCIES,
				attributes: ['name', 'sync_timestamp']
			},
			{
				model: PROVIDERS,
				attributes: ['name', 'type', 'access_timestamp']
			}
		],
		distinct: true,
		offset: pagination.start,
		limit: pagination.limit
	}).then(verifications => {
		if (!verifications || verifications.length === 0) {
			SuccessResponse(res, { unique_id: user_unique_id, text: "Verifications Not found" }, []);
		} else {
			SuccessResponse(res, { unique_id: user_unique_id, text: "Verifications loaded" }, { ...verifications, pages: pagination.pages });
		}
	}).catch(err => {
		ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
	});
};

export function agencyGetVerification(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const agency_unique_id = req.AGENCY_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		VERIFICATIONS.findOne({
			attributes: { exclude: ['id'] },
			where: {
				...payload,
				agency_unique_id
			},
			include: [
				{
					model: AGENCIES,
					attributes: ['name', 'sync_timestamp']
				},
				{
					model: PROVIDERS,
					attributes: ['name', 'type', 'access_timestamp']
				}
			],
		}).then(verification => {
			if (!verification) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Verification not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Verification loaded" }, verification);
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function agencySearchVerifications(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const agency_unique_id = req.AGENCY_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await VERIFICATIONS.count({
			where: {
				agency_unique_id,
				[Op.or]: [
					{
						identification_id: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						type: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						email: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						phone_number: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						alt_phone_number: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
				]
			}
		});
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

		VERIFICATIONS.findAndCountAll({
			attributes: ["unique_id", "agency_unique_id", "type", "identification_id", "firstname", "middlename", "lastname", "email", "phone_number", "alt_phone_number", "gender", "date_of_birth", "verification_reference", "verification_status", "status", "createdAt", "updatedAt"],
			where: {
				agency_unique_id,
				[Op.or]: [
					{
						identification_id: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						type: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						email: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						phone_number: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						alt_phone_number: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
				]
			},
			order: [
				['createdAt', 'DESC']
			],
			include: [
				{
					model: AGENCIES,
					attributes: ['name', 'sync_timestamp']
				},
				{
					model: PROVIDERS,
					attributes: ['name', 'type', 'access_timestamp']
				}
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(verifications => {
			if (!verifications || verifications.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Verifications Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Verifications loaded" }, { ...verifications, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function agencyGetVerificationsSpecifically(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const agency_unique_id = req.AGENCY_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await VERIFICATIONS.count({ where: { ...payload, agency_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		VERIFICATIONS.findAndCountAll({
			attributes: ["unique_id", "agency_unique_id", "type", "identification_id", "firstname", "middlename", "lastname", "email", "phone_number", "alt_phone_number", "gender", "date_of_birth", "verification_reference", "verification_status", "status", "createdAt", "updatedAt"],
			where: {
				...payload, 
				agency_unique_id
			},
			order: [
				[orderBy, sortBy]
			],
			include: [
				{
					model: AGENCIES,
					attributes: ['name', 'sync_timestamp']
				},
				{
					model: PROVIDERS,
					attributes: ['name', 'type', 'access_timestamp']
				}
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(verifications => {
			if (!verifications || verifications.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Verifications Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Verifications loaded" }, { ...verifications, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function providerGetVerifications(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const provider_unique_id = req.PROVIDER_UNIQUE_ID;

	const total_records = await VERIFICATIONS.count({ where: { provider_unique_id } });
	const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	VERIFICATIONS.findAndCountAll({
		attributes: ["unique_id", "provider_unique_id", "type", "identification_id", "firstname", "middlename", "lastname", "email", "phone_number", "alt_phone_number", "gender", "date_of_birth", "verification_reference", "verification_status", "status", "createdAt", "updatedAt"],
		where: {
			provider_unique_id: provider_unique_id
		},
		order: [
			[orderBy, sortBy]
		],
		include: [
			{
				model: AGENCIES,
				attributes: ['name', 'sync_timestamp']
			},
			{
				model: PROVIDERS,
				attributes: ['name', 'type', 'access_timestamp']
			}
		],
		distinct: true,
		offset: pagination.start,
		limit: pagination.limit
	}).then(verifications => {
		if (!verifications || verifications.length === 0) {
			SuccessResponse(res, { unique_id: user_unique_id, text: "Verifications Not found" }, []);
		} else {
			SuccessResponse(res, { unique_id: user_unique_id, text: "Verifications loaded" }, { ...verifications, pages: pagination.pages });
		}
	}).catch(err => {
		ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
	});
};

export function providerGetVerification(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const provider_unique_id = req.PROVIDER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		VERIFICATIONS.findOne({
			attributes: { exclude: ['id'] },
			where: {
				...payload,
				provider_unique_id
			},
			include: [
				{
					model: AGENCIES,
					attributes: ['name', 'sync_timestamp']
				},
				{
					model: PROVIDERS,
					attributes: ['name', 'type', 'access_timestamp']
				}
			],
		}).then(verification => {
			if (!verification) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Verification not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Verification loaded" }, verification);
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function providerSearchVerifications(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const provider_unique_id = req.PROVIDER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await VERIFICATIONS.count({
			where: {
				provider_unique_id,
				[Op.or]: [
					{
						identification_id: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						type: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						email: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						phone_number: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						alt_phone_number: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
				]
			}
		});
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

		VERIFICATIONS.findAndCountAll({
			attributes: ["unique_id", "provider_unique_id", "type", "identification_id", "firstname", "middlename", "lastname", "email", "phone_number", "alt_phone_number", "gender", "date_of_birth", "verification_reference", "verification_status", "status", "createdAt", "updatedAt"],
			where: {
				provider_unique_id,
				[Op.or]: [
					{
						identification_id: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						type: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						email: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						phone_number: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						alt_phone_number: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
				]
			},
			order: [
				['createdAt', 'DESC']
			],
			include: [
				{
					model: AGENCIES,
					attributes: ['name', 'sync_timestamp']
				},
				{
					model: PROVIDERS,
					attributes: ['name', 'type', 'access_timestamp']
				}
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(verifications => {
			if (!verifications || verifications.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Verifications Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Verifications loaded" }, { ...verifications, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function providerGetVerificationsSpecifically(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const provider_unique_id = req.PROVIDER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await VERIFICATIONS.count({ where: { ...payload, provider_unique_id } });
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
		const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
		const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

		VERIFICATIONS.findAndCountAll({
			attributes: ["unique_id", "provider_unique_id", "type", "identification_id", "firstname", "middlename", "lastname", "email", "phone_number", "alt_phone_number", "gender", "date_of_birth", "verification_reference", "verification_status", "status", "createdAt", "updatedAt"],
			where: {
				...payload,
				provider_unique_id
			},
			order: [
				[orderBy, sortBy]
			],
			include: [
				{
					model: AGENCIES,
					attributes: ['name', 'sync_timestamp']
				},
				{
					model: PROVIDERS,
					attributes: ['name', 'type', 'access_timestamp']
				}
			],
			distinct: true,
			offset: pagination.start,
			limit: pagination.limit
		}).then(verifications => {
			if (!verifications || verifications.length === 0) {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Verifications Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: user_unique_id, text: "Verifications loaded" }, { ...verifications, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		});
	}
};

export async function publicGetVerifications(req, res) {
	// const total_records = await VERIFICATIONS.count();
	// const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	VERIFICATIONS.findAndCountAll({
		attributes: ["unique_id", "agency_unique_id", "type", "identification_id", "firstname", "middlename", "lastname", "gender", "date_of_birth", "verification_status", "updatedAt"],
		order: [
			[orderBy, sortBy]
		],
		include: [
			{
				model: AGENCIES,
				attributes: ['name', 'sync_timestamp']
			},
			{
				model: PROVIDERS,
				attributes: ['name', 'type']
			}
		],
		// offset: pagination.start,
		// limit: pagination.limit
	}).then(verifications => {
		if (!verifications || verifications.length === 0) {
			SuccessResponse(res, { unique_id: anonymous, text: "Verifications Not found" }, []);
		} else {
			SuccessResponse(res, { unique_id: anonymous, text: "Verifications loaded" }, { ...verifications, pages: pagination.pages });
		}
	}).catch(err => {
		ServerError(res, { unique_id: anonymous, text: err.message }, null);
	});
};

export function publicGetVerification(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		VERIFICATIONS.findOne({
			attributes: { exclude: ['id', 'status'] },
			where: {
				...payload,
			},
			include: [
				{
					model: AGENCIES,
					attributes: ['name', 'sync_timestamp']
				},
				{
					model: PROVIDERS,
					attributes: ['name', 'type']
				}
			],
		}).then(async verification => {
			if (!verification) {
				NotFoundError(res, { unique_id: anonymous, text: "Verification not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: anonymous, text: "Verification loaded" }, verification);
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function publicSearchVerifications(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await VERIFICATIONS.count({
			where: {
				[Op.or]: [
					{
						identification_id: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					}, 
					{
						type: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						email: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						phone_number: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
					{
						alt_phone_number: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					},
				]
			}
		});
		const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);

		VERIFICATIONS.findAndCountAll({
			attributes: ["unique_id", "agency_unique_id", "type", "identification_id", "firstname", "middlename", "lastname", "gender", "date_of_birth", "verification_status", "updatedAt"],
			where: {
				[Op.or]: [
					{
						identification_id: {
							[Op.or]: {
								[Op.like]: `%${payload.search}`,
								[Op.startsWith]: `${payload.search}`,
								[Op.endsWith]: `${payload.search}`,
								[Op.substring]: `${payload.search}`,
							}
						}
					}, 
					{
						type: {
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
			include: [
				{
					model: AGENCIES,
					attributes: ['name', 'sync_timestamp']
				},
				{
					model: PROVIDERS,
					attributes: ['name', 'type']
				}
			],
			offset: pagination.start,
			limit: pagination.limit
		}).then(verifications => {
			if (!verifications || verifications.length === 0) {
				SuccessResponse(res, { unique_id: anonymous, text: "Verifications Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: anonymous, text: "Verifications loaded" }, { ...verifications, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		});
	}
};

export async function addVerification(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const verification = await VERIFICATIONS.create(
					{
						unique_id: uuidv4(),
						type: payload.type,
						firstname: payload.firstname,
						middlename: payload.middlename ? payload.middlename : null,
						lastname: payload.lastname,
						email: return_all_letters_lowercase(payload.email),
						gender: payload.gender,
						date_of_birth: payload.date_of_birth,
						address: payload.address,
						...payload,
						status: default_status
					}, { transaction }
				);

				if (verification) {
					const log_data = {
						user_unique_id: user_unique_id,
						type: "Verifications",
						action: `Added new verification | Verification: ${verification.unique_id}`
					};
					addLog(log_data);
					SuccessResponse(res, { unique_id: user_unique_id, text: "Verification created successfully!" }, null);
				} else {
					throw new Error("Error adding verification");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function verifyIdentity(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const verification = await VERIFICATIONS.findOne({
				attributes: { exclude: ['id'] },
				where: {
					...payload
				},
				include: [
					{
						model: AGENCIES,
						attributes: ['name', 'sync_timestamp']
					},
					{
						model: PROVIDERS,
						attributes: ['name', 'type']
					}
				],
			}); 

			if (verification) {
				if (verification.agency_unique_id) {
					const update_sync_timestamp = await AGENCIES.update(
						{
							sync_timestamp: timestamp_str_alt(new Date()),
						}, {
							where: {
								unique_id: verification.agency_unique_id,
							},
						}
					);

					const verifications_update = await AGENCIES.increment({ verifications: 1 }, { where: { unique_id: verification.agency_unique_id } });
				}
				if (verification.provider_unique_id) {
					const update_sync_timestamp = await PROVIDERS.update(
						{
							access_timestamp: timestamp_str_alt(new Date()),
						}, {
							where: {
								unique_id: verification.provider_unique_id,
							},
						}
					);

					const usage_update = await PROVIDERS.increment({ usage: 1 }, { where: { unique_id: verification.provider_unique_id } });
				}
				SuccessResponse(res, { unique_id: user_unique_id, text: "Verification loaded!" }, verification);
			} else if (!verification && payload.type === "NIN") {
				const app_default = await APP_DEFAULTS.findOne({
					attributes: { exclude: ['id'] },
					where: {
						criteria: app_defaults.passcoder_live_key
					}
				});

				if (app_default) {
					try {
						const passcoder_live_response = await axios.post(
							`${passcoder_live_api_url}${passcoder_verify_nin_url}`,
							{
								nin: payload.identification_id,
							},
							{
								headers: {
									'x-api-key': app_default.value
								}
							}
						);
	
						if (passcoder_live_response.data.success) {
							if (passcoder_live_response.data.data === null) {
								BadRequestError(res, { unique_id: user_unique_id, text: "No data found" }, null);
							} else {
								if (payload.agency_unique_id) {
									const update_sync_timestamp = await AGENCIES.update(
										{
											sync_timestamp: timestamp_str_alt(new Date()),
										}, {
										where: {
											unique_id: payload.agency_unique_id,
										},
									}
									);

									const verifications_update = await AGENCIES.increment({ verifications: 1 }, { where: { unique_id: payload.agency_unique_id } });
								}

								if (payload.provider_unique_id) {
									const update_sync_timestamp = await PROVIDERS.update(
										{
											access_timestamp: timestamp_str_alt(new Date()),
										}, {
										where: {
											unique_id: payload.provider_unique_id,
										},
									}
									);

									const usage_update = await PROVIDERS.increment({ usage: 1 }, { where: { unique_id: payload.provider_unique_id } });
								}

								await db.sequelize.transaction(async (transaction) => {
									const verification = await VERIFICATIONS.create(
										{
											unique_id: uuidv4(),
											type: payload.type,
											agency_unique_id: payload.agency_unique_id ? payload.agency_unique_id : null,
											identification_id: payload.identification_id,
											firstname: passcoder_live_response.data.data.data.firstname ? (passcoder_live_response.data.data.data.firstname.length > 0 ? passcoder_live_response.data.data.data.firstname : null) : null,
											middlename: null,
											lastname: passcoder_live_response.data.data.data.surname ? (passcoder_live_response.data.data.data.surname.length > 0 ? passcoder_live_response.data.data.data.surname : null) : null,
											email: passcoder_live_response.data.data.data.email ? (passcoder_live_response.data.data.data.email.length > 0 ? return_all_letters_lowercase(passcoder_live_response.data.data.data.email) : null) : null,
											phone_number: passcoder_live_response.data.data.data.telephoneno ? (passcoder_live_response.data.data.data.telephoneno.length > 0 ? passcoder_live_response.data.data.data.telephoneno : null) : null,
											alt_phone_number: null,
											gender: passcoder_live_response.data.data.data.gender ? (passcoder_live_response.data.data.data.gender.length > 0 ? passcoder_live_response.data.data.data.gender : null) : null,
											date_of_birth: passcoder_live_response.data.data.data.birthdate ? (passcoder_live_response.data.data.data.birthdate.length > 0 ? passcoder_live_response.data.data.data.birthdate : null) : null,
											address: passcoder_live_response.data.data.data.residence_AdressLine1 ? (passcoder_live_response.data.data.data.residence_AdressLine1.length > 0 ? passcoder_live_response.data.data.data.residence_AdressLine1 : null) : null,
											title: passcoder_live_response.data.data.data.title ? (passcoder_live_response.data.data.data.title.length > 0 ? passcoder_live_response.data.data.data.title : null) : null,
											religion: passcoder_live_response.data.data.data.religion ? (passcoder_live_response.data.data.data.religion.length > 0 ? passcoder_live_response.data.data.data.religion : null) : null,
											nationality: passcoder_live_response.data.data.data.birthcountry ? (passcoder_live_response.data.data.data.birthcountry.length > 0 ? passcoder_live_response.data.data.data.birthcountry : null) : null,
											state_of_origin: passcoder_live_response.data.data.data.self_origin_state ? (passcoder_live_response.data.data.data.self_origin_state.length > 0 ? passcoder_live_response.data.data.data.self_origin_state : null) : null,
											state_of_residence: passcoder_live_response.data.data.data.residence_state ? (passcoder_live_response.data.data.data.residence_state.length > 0 ? passcoder_live_response.data.data.data.residence_state : null) : null,
											nin: passcoder_live_response.data.data.data.nin ? (passcoder_live_response.data.data.data.nin.length > 0 ? passcoder_live_response.data.data.data.nin : null) : null,
											bvn: null,
											vnin: passcoder_live_response.data.data.data.vnin ? (passcoder_live_response.data.data.data.vnin.length > 0 ? passcoder_live_response.data.data.data.vnin : null) : null,
											lga_of_origin: passcoder_live_response.data.data.data.self_origin_lga ? (passcoder_live_response.data.data.data.self_origin_lga.length > 0 ? passcoder_live_response.data.data.data.self_origin_lga : null) : null,
											lga_of_residence: passcoder_live_response.data.data.data.residence_lga ? (passcoder_live_response.data.data.data.residence_lga.length > 0 ? passcoder_live_response.data.data.data.residence_lga : null) : null,
											marital_status: passcoder_live_response.data.data.data.maritalstatus ? (passcoder_live_response.data.data.data.maritalstatus.length > 0 ? passcoder_live_response.data.data.data.maritalstatus : null) : null,
											photo: passcoder_live_response.data.data.data.photo ? (passcoder_live_response.data.data.data.photo.length > 0 ? passcoder_live_response.data.data.data.photo : null) : null,
											height: passcoder_live_response.data.data.data.heigth ? (passcoder_live_response.data.data.data.heigth.length > 0 ? passcoder_live_response.data.data.data.heigth : null) : null,
											educational_level: passcoder_live_response.data.data.data.educationallevel ? (passcoder_live_response.data.data.data.educationallevel.length > 0 ? passcoder_live_response.data.data.data.educationallevel : null) : null,
											employment_status: passcoder_live_response.data.data.data.emplymentstatus ? (passcoder_live_response.data.data.data.emplymentstatus.length > 0 ? passcoder_live_response.data.data.data.emplymentstatus : null) : null,
											nok_firstname: passcoder_live_response.data.data.data.nok_firstname ? (passcoder_live_response.data.data.data.nok_firstname.length > 0 ? passcoder_live_response.data.data.data.nok_firstname : null) : null,
											nok_middlename: passcoder_live_response.data.data.data.nok_middlename ? (passcoder_live_response.data.data.data.nok_middlename.length > 0 ? passcoder_live_response.data.data.data.nok_middlename : null) : null,
											nok_surname: passcoder_live_response.data.data.data.nok_surname ? (passcoder_live_response.data.data.data.nok_surname.length > 0 ? passcoder_live_response.data.data.data.nok_surname : null) : null,
											nok_state: passcoder_live_response.data.data.data.nok_state ? (passcoder_live_response.data.data.data.nok_state.length > 0 ? passcoder_live_response.data.data.data.nok_state : null) : null,
											nok_lga: passcoder_live_response.data.data.data.nok_lga ? (passcoder_live_response.data.data.data.nok_lga.length > 0 ? passcoder_live_response.data.data.data.nok_lga : null) : null,
											nok_town: passcoder_live_response.data.data.data.nok_town ? (passcoder_live_response.data.data.data.nok_town.length > 0 ? passcoder_live_response.data.data.data.nok_town : null) : null,
											nok_postalcode: passcoder_live_response.data.data.data.nok_postalcode ? (passcoder_live_response.data.data.data.nok_postalcode.length > 0 ? passcoder_live_response.data.data.data.nok_postalcode : null) : null,
											nok_address_1: passcoder_live_response.data.data.data.nok_address1 ? (passcoder_live_response.data.data.data.nok_address1.length > 0 ? passcoder_live_response.data.data.data.nok_address1 : null) : null,
											nok_address_2: passcoder_live_response.data.data.data.nok_address2 ? (passcoder_live_response.data.data.data.nok_address2.length > 0 ? passcoder_live_response.data.data.data.nok_address2 : null) : null,
											native_spoken_lang: passcoder_live_response.data.data.data.nspokenlang ? (passcoder_live_response.data.data.data.nspokenlang.length > 0 ? passcoder_live_response.data.data.data.nspokenlang : null) : null,
											other_spoken_lang: passcoder_live_response.data.data.data.ospokenlang ? (passcoder_live_response.data.data.data.ospokenlang.length > 0 ? passcoder_live_response.data.data.data.ospokenlang : null) : null,
											profession: passcoder_live_response.data.data.data.profession ? (passcoder_live_response.data.data.data.profession.length > 0 ? passcoder_live_response.data.data.data.profession : null) : null,
											verification_reference: passcoder_live_response.data.data.verification.reference ? (passcoder_live_response.data.data.verification.reference.length > 0 ? passcoder_live_response.data.data.verification.reference : null) : null,
											verification_status: passcoder_live_response.data.data.verification.status ? (passcoder_live_response.data.data.verification.status.length > 0 ? passcoder_live_response.data.data.verification.status : null) : null,
											verification_endpoint: passcoder_live_response.data.data.endpoint_name ? (passcoder_live_response.data.data.endpoint_name.length > 0 ? passcoder_live_response.data.data.endpoint_name : null) : null,
											status: default_status
										}, { transaction }
									);

									if (verification) {
										const log_data = {
											user_unique_id: user_unique_id,
											type: "Verifications",
											action: `Added new ${payload.type} verification | Verification: ${verification.unique_id}`
										};
										addLog(log_data);
										SuccessResponse(res, { unique_id: user_unique_id, text: "Verification created successfully!" }, verification);
									} else {
										throw new Error("Error adding verification");
									}
								});
							}
						} else {
							BadRequestError(res, { unique_id: user_unique_id, text: passcoder_live_response.data.message }, null);
						}
					} catch (error) {
						console.log(error);
						BadRequestError(res, { unique_id: user_unique_id, text: error.message }, { err_code: error.code });
					}
				} else {
					BadRequestError(res, { unique_id: user_unique_id, text: "App Default for Verification not found!" }, null);
				}
			} else if (!verification && payload.type === "BVN") {
				const app_default = await APP_DEFAULTS.findOne({
					attributes: { exclude: ['id'] },
					where: {
						criteria: app_defaults.passcoder_live_key
					}
				});

				if (app_default) {
					try {
						const passcoder_live_response = await axios.post(
							`${passcoder_live_api_url}${passcoder_verify_bvn_url}`,
							{
								bvn: payload.identification_id,
							},
							{
								headers: {
									'x-api-key': app_default.value
								}
							}
						);

						if (passcoder_live_response.data.success) {
							if (passcoder_live_response.data.data === null) {
								BadRequestError(res, { unique_id: user_unique_id, text: "No data found" }, null);
							} else {
								if (payload.agency_unique_id) {
									const update_sync_timestamp = await AGENCIES.update(
										{
											sync_timestamp: timestamp_str_alt(new Date()),
										}, {
											where: {
												unique_id: payload.agency_unique_id,
											},
										}
									);

									const verifications_update = await AGENCIES.increment({ verifications: 1 }, { where: { unique_id: payload.agency_unique_id } });
								}

								if (payload.provider_unique_id) {
									const update_sync_timestamp = await PROVIDERS.update(
										{
											access_timestamp: timestamp_str_alt(new Date()),
										}, {
										where: {
											unique_id: payload.provider_unique_id,
										},
									}
									);

									const usage_update = await PROVIDERS.increment({ usage: 1 }, { where: { unique_id: payload.provider_unique_id } });
								}

								await db.sequelize.transaction(async (transaction) => {
									const verification = await VERIFICATIONS.create(
										{
											unique_id: uuidv4(),
											type: payload.type,
											agency_unique_id: payload.agency_unique_id ? payload.agency_unique_id : null,
											identification_id: payload.identification_id,
											firstname: passcoder_live_response.data.data.data.firstName ? (passcoder_live_response.data.data.data.firstName.length > 0 ? passcoder_live_response.data.data.data.firstName : null) : null,
											middlename: passcoder_live_response.data.data.data.middleName ? (passcoder_live_response.data.data.data.middleName.length > 0 ? passcoder_live_response.data.data.data.middleName : null) : null,
											lastname: passcoder_live_response.data.data.data.lastName ? (passcoder_live_response.data.data.data.lastName.length > 0 ? passcoder_live_response.data.data.data.lastName : null) : null,
											email: passcoder_live_response.data.data.data.email ? (passcoder_live_response.data.data.data.email.length > 0 ? return_all_letters_lowercase(passcoder_live_response.data.data.data.email) : null) : null,
											phone_number: passcoder_live_response.data.data.data.phoneNumber1 ? (passcoder_live_response.data.data.data.phoneNumber1.length > 0 ? passcoder_live_response.data.data.data.phoneNumber1 : null) : null,
											alt_phone_number: passcoder_live_response.data.data.data.phoneNumber2 ? (passcoder_live_response.data.data.data.phoneNumber2.length > 0 ? passcoder_live_response.data.data.data.phoneNumber2 : null) : null,
											gender: passcoder_live_response.data.data.data.gender ? (passcoder_live_response.data.data.data.gender.length > 0 ? passcoder_live_response.data.data.data.gender : null) : null,
											date_of_birth: passcoder_live_response.data.data.data.dateOfbirth ? (passcoder_live_response.data.data.data.dateOfbirth.length > 0 ? passcoder_live_response.data.data.data.dateOfbirth : null) : null,
											address: passcoder_live_response.data.data.data.residentialAddress ? (passcoder_live_response.data.data.data.residentialAddress.length > 0 ? passcoder_live_response.data.data.data.residentialAddress : null) : null,
											title: passcoder_live_response.data.data.data.title ? (passcoder_live_response.data.data.data.title.length > 0 ? passcoder_live_response.data.data.data.title : null) : null,
											nationality: passcoder_live_response.data.data.data.nationality ? (passcoder_live_response.data.data.data.nationality.length > 0 ? passcoder_live_response.data.data.data.nationality : null) : null,
											state_of_origin: passcoder_live_response.data.data.data.stateOfOrigin ? (passcoder_live_response.data.data.data.stateOfOrigin.length > 0 ? passcoder_live_response.data.data.data.stateOfOrigin : null) : null,
											state_of_residence: passcoder_live_response.data.data.data.stateOfResidence ? (passcoder_live_response.data.data.data.stateOfResidence.length > 0 ? passcoder_live_response.data.data.data.stateOfResidence : null) : null,
											nin: passcoder_live_response.data.data.data.nin ? (passcoder_live_response.data.data.data.nin.length > 0 ? passcoder_live_response.data.data.data.nin : null) : null,
											bvn: passcoder_live_response.data.data.data.bvn ? (passcoder_live_response.data.data.data.bvn.length > 0 ? passcoder_live_response.data.data.data.bvn : null) : null,
											vnin: passcoder_live_response.data.data.data.vnin ? (passcoder_live_response.data.data.data.vnin.length > 0 ? passcoder_live_response.data.data.data.vnin : null) : null,
											enrollment_bank: passcoder_live_response.data.data.data.enrollmentBank ? (passcoder_live_response.data.data.data.enrollmentBank.length > 0 ? passcoder_live_response.data.data.data.enrollmentBank : null) : null,
											enrollment_branch: passcoder_live_response.data.data.data.enrollmentBranch ? (passcoder_live_response.data.data.data.enrollmentBranch.length > 0 ? passcoder_live_response.data.data.data.enrollmentBranch : null) : null,
											level_of_account: passcoder_live_response.data.data.data.levelOfAccount ? (passcoder_live_response.data.data.data.levelOfAccount.length > 0 ? passcoder_live_response.data.data.data.levelOfAccount : null) : null,
											lga_of_origin: passcoder_live_response.data.data.data.lgaOfOrigin ? (passcoder_live_response.data.data.data.lgaOfOrigin.length > 0 ? passcoder_live_response.data.data.data.lgaOfOrigin : null) : null,
											lga_of_residence: passcoder_live_response.data.data.data.lgaOfResidence ? (passcoder_live_response.data.data.data.lgaOfResidence.length > 0 ? passcoder_live_response.data.data.data.lgaOfResidence : null) : null,
											marital_status: passcoder_live_response.data.data.data.maritalStatus ? (passcoder_live_response.data.data.data.maritalStatus.length > 0 ? passcoder_live_response.data.data.data.maritalStatus : null) : null,
											name_on_card: passcoder_live_response.data.data.data.nameOnCard ? (passcoder_live_response.data.data.data.nameOnCard.length > 0 ? passcoder_live_response.data.data.data.nameOnCard : null) : null,
											registration_date: passcoder_live_response.data.data.data.registrationDate ? (passcoder_live_response.data.data.data.registrationDate.length > 0 ? passcoder_live_response.data.data.data.registrationDate : null) : null,
											watch_listed: passcoder_live_response.data.data.data.watchListed ? (passcoder_live_response.data.data.data.watchListed.length > 0 ? passcoder_live_response.data.data.data.watchListed : null) : null,
											base_64_image: passcoder_live_response.data.data.data.base64Image ? (passcoder_live_response.data.data.data.base64Image.length > 0 ? passcoder_live_response.data.data.data.base64Image : null) : null,
											verification_reference: passcoder_live_response.data.data.verification.reference ? (passcoder_live_response.data.data.verification.reference.length > 0 ? passcoder_live_response.data.data.verification.reference : null) : null,
											verification_status: passcoder_live_response.data.data.verification.status ? (passcoder_live_response.data.data.verification.status.length > 0 ? passcoder_live_response.data.data.verification.status : null) : null,
											verification_endpoint: passcoder_live_response.data.data.endpoint_name ? (passcoder_live_response.data.data.endpoint_name.length > 0 ? passcoder_live_response.data.data.endpoint_name : null) : null,
											status: default_status
										}, { transaction }
									);

									if (verification) {
										const log_data = {
											user_unique_id: user_unique_id,
											type: "Verifications",
											action: `Added new ${payload.type} verification | Verification: ${verification.unique_id}`
										};
										addLog(log_data);
										SuccessResponse(res, { unique_id: user_unique_id, text: "Verification created successfully!" }, verification);
									} else {
										throw new Error("Error adding verification");
									}
								});
							}
						} else {
							BadRequestError(res, { unique_id: user_unique_id, text: passcoder_live_response.data.message }, null);
						}
					} catch (error) {
						console.log(error);
						BadRequestError(res, { unique_id: user_unique_id, text: error.message }, { err_code: error.code });
					}
				} else {
					BadRequestError(res, { unique_id: user_unique_id, text: "App Default for Verification not found!" }, null);
				}
			} else {
				BadRequestError(res, { unique_id: user_unique_id, text: "Verification unavailable!" }, null);
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function publicVerifyIdentity(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: anonymous, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const verification = await VERIFICATIONS.findOne({
				attributes: { exclude: ['id'] },
				where: {
					...payload
				},
				include: [
					{
						model: AGENCIES,
						attributes: ['name', 'sync_timestamp']
					},
					{
						model: PROVIDERS,
						attributes: ['name', 'type']
					}
				],
			}); 

			if (verification) {
				if (verification.agency_unique_id) {
					const update_sync_timestamp = await AGENCIES.update(
						{
							sync_timestamp: timestamp_str_alt(new Date()),
						}, {
							where: {
								unique_id: verification.agency_unique_id,
							},
						}
					);

					const verifications_update = await AGENCIES.increment({ verifications: 1 }, { where: { unique_id: verification.agency_unique_id } });
				}
				if (verification.provider_unique_id) {
					const update_sync_timestamp = await PROVIDERS.update(
						{
							access_timestamp: timestamp_str_alt(new Date()),
						}, {
							where: {
								unique_id: verification.provider_unique_id,
							},
						}
					);

					const usage_update = await PROVIDERS.increment({ usage: 1 }, { where: { unique_id: verification.provider_unique_id } });
				}
				SuccessResponse(res, { unique_id: anonymous, text: "Verification loaded!" }, verification);
			} else if (!verification && payload.type === "NIN") {
				const app_default = await APP_DEFAULTS.findOne({
					attributes: { exclude: ['id'] },
					where: {
						criteria: app_defaults.passcoder_live_key
					}
				});

				if (app_default) {
					try {
						const passcoder_live_response = await axios.post(
							`${passcoder_live_api_url}${passcoder_verify_nin_url}`,
							{
								nin: payload.identification_id,
							},
							{
								headers: {
									'x-api-key': app_default.value
								}
							}
						);
	
						if (passcoder_live_response.data.success) {
							if (passcoder_live_response.data.data === null) {
								BadRequestError(res, { unique_id: anonymous, text: "No data found" }, null);
							} else {
								if (payload.agency_unique_id) {
									const update_sync_timestamp = await AGENCIES.update(
										{
											sync_timestamp: timestamp_str_alt(new Date()),
										}, {
										where: {
											unique_id: payload.agency_unique_id,
										},
									}
									);

									const verifications_update = await AGENCIES.increment({ verifications: 1 }, { where: { unique_id: payload.agency_unique_id } });
								}

								if (payload.provider_unique_id) {
									const update_sync_timestamp = await PROVIDERS.update(
										{
											access_timestamp: timestamp_str_alt(new Date()),
										}, {
										where: {
											unique_id: payload.provider_unique_id,
										},
									}
									);

									const usage_update = await PROVIDERS.increment({ usage: 1 }, { where: { unique_id: payload.provider_unique_id } });
								}

								await db.sequelize.transaction(async (transaction) => {
									const verification = await VERIFICATIONS.create(
										{
											unique_id: uuidv4(),
											type: payload.type,
											agency_unique_id: payload.agency_unique_id ? payload.agency_unique_id : null,
											identification_id: payload.identification_id,
											firstname: passcoder_live_response.data.data.data.firstname ? (passcoder_live_response.data.data.data.firstname.length > 0 ? passcoder_live_response.data.data.data.firstname : null) : null,
											middlename: null,
											lastname: passcoder_live_response.data.data.data.surname ? (passcoder_live_response.data.data.data.surname.length > 0 ? passcoder_live_response.data.data.data.surname : null) : null,
											email: passcoder_live_response.data.data.data.email ? (passcoder_live_response.data.data.data.email.length > 0 ? return_all_letters_lowercase(passcoder_live_response.data.data.data.email) : null) : null,
											phone_number: passcoder_live_response.data.data.data.telephoneno ? (passcoder_live_response.data.data.data.telephoneno.length > 0 ? passcoder_live_response.data.data.data.telephoneno : null) : null,
											alt_phone_number: null,
											gender: passcoder_live_response.data.data.data.gender ? (passcoder_live_response.data.data.data.gender.length > 0 ? passcoder_live_response.data.data.data.gender : null) : null,
											date_of_birth: passcoder_live_response.data.data.data.birthdate ? (passcoder_live_response.data.data.data.birthdate.length > 0 ? passcoder_live_response.data.data.data.birthdate : null) : null,
											address: passcoder_live_response.data.data.data.residence_AdressLine1 ? (passcoder_live_response.data.data.data.residence_AdressLine1.length > 0 ? passcoder_live_response.data.data.data.residence_AdressLine1 : null) : null,
											title: passcoder_live_response.data.data.data.title ? (passcoder_live_response.data.data.data.title.length > 0 ? passcoder_live_response.data.data.data.title : null) : null,
											religion: passcoder_live_response.data.data.data.religion ? (passcoder_live_response.data.data.data.religion.length > 0 ? passcoder_live_response.data.data.data.religion : null) : null,
											nationality: passcoder_live_response.data.data.data.birthcountry ? (passcoder_live_response.data.data.data.birthcountry.length > 0 ? passcoder_live_response.data.data.data.birthcountry : null) : null,
											state_of_origin: passcoder_live_response.data.data.data.self_origin_state ? (passcoder_live_response.data.data.data.self_origin_state.length > 0 ? passcoder_live_response.data.data.data.self_origin_state : null) : null,
											state_of_residence: passcoder_live_response.data.data.data.residence_state ? (passcoder_live_response.data.data.data.residence_state.length > 0 ? passcoder_live_response.data.data.data.residence_state : null) : null,
											nin: passcoder_live_response.data.data.data.nin ? (passcoder_live_response.data.data.data.nin.length > 0 ? passcoder_live_response.data.data.data.nin : null) : null,
											bvn: null,
											vnin: passcoder_live_response.data.data.data.vnin ? (passcoder_live_response.data.data.data.vnin.length > 0 ? passcoder_live_response.data.data.data.vnin : null) : null,
											lga_of_origin: passcoder_live_response.data.data.data.self_origin_lga ? (passcoder_live_response.data.data.data.self_origin_lga.length > 0 ? passcoder_live_response.data.data.data.self_origin_lga : null) : null,
											lga_of_residence: passcoder_live_response.data.data.data.residence_lga ? (passcoder_live_response.data.data.data.residence_lga.length > 0 ? passcoder_live_response.data.data.data.residence_lga : null) : null,
											marital_status: passcoder_live_response.data.data.data.maritalstatus ? (passcoder_live_response.data.data.data.maritalstatus.length > 0 ? passcoder_live_response.data.data.data.maritalstatus : null) : null,
											photo: passcoder_live_response.data.data.data.photo ? (passcoder_live_response.data.data.data.photo.length > 0 ? passcoder_live_response.data.data.data.photo : null) : null,
											height: passcoder_live_response.data.data.data.heigth ? (passcoder_live_response.data.data.data.heigth.length > 0 ? passcoder_live_response.data.data.data.heigth : null) : null,
											educational_level: passcoder_live_response.data.data.data.educationallevel ? (passcoder_live_response.data.data.data.educationallevel.length > 0 ? passcoder_live_response.data.data.data.educationallevel : null) : null,
											employment_status: passcoder_live_response.data.data.data.emplymentstatus ? (passcoder_live_response.data.data.data.emplymentstatus.length > 0 ? passcoder_live_response.data.data.data.emplymentstatus : null) : null,
											nok_firstname: passcoder_live_response.data.data.data.nok_firstname ? (passcoder_live_response.data.data.data.nok_firstname.length > 0 ? passcoder_live_response.data.data.data.nok_firstname : null) : null,
											nok_middlename: passcoder_live_response.data.data.data.nok_middlename ? (passcoder_live_response.data.data.data.nok_middlename.length > 0 ? passcoder_live_response.data.data.data.nok_middlename : null) : null,
											nok_surname: passcoder_live_response.data.data.data.nok_surname ? (passcoder_live_response.data.data.data.nok_surname.length > 0 ? passcoder_live_response.data.data.data.nok_surname : null) : null,
											nok_state: passcoder_live_response.data.data.data.nok_state ? (passcoder_live_response.data.data.data.nok_state.length > 0 ? passcoder_live_response.data.data.data.nok_state : null) : null,
											nok_lga: passcoder_live_response.data.data.data.nok_lga ? (passcoder_live_response.data.data.data.nok_lga.length > 0 ? passcoder_live_response.data.data.data.nok_lga : null) : null,
											nok_town: passcoder_live_response.data.data.data.nok_town ? (passcoder_live_response.data.data.data.nok_town.length > 0 ? passcoder_live_response.data.data.data.nok_town : null) : null,
											nok_postalcode: passcoder_live_response.data.data.data.nok_postalcode ? (passcoder_live_response.data.data.data.nok_postalcode.length > 0 ? passcoder_live_response.data.data.data.nok_postalcode : null) : null,
											nok_address_1: passcoder_live_response.data.data.data.nok_address1 ? (passcoder_live_response.data.data.data.nok_address1.length > 0 ? passcoder_live_response.data.data.data.nok_address1 : null) : null,
											nok_address_2: passcoder_live_response.data.data.data.nok_address2 ? (passcoder_live_response.data.data.data.nok_address2.length > 0 ? passcoder_live_response.data.data.data.nok_address2 : null) : null,
											native_spoken_lang: passcoder_live_response.data.data.data.nspokenlang ? (passcoder_live_response.data.data.data.nspokenlang.length > 0 ? passcoder_live_response.data.data.data.nspokenlang : null) : null,
											other_spoken_lang: passcoder_live_response.data.data.data.ospokenlang ? (passcoder_live_response.data.data.data.ospokenlang.length > 0 ? passcoder_live_response.data.data.data.ospokenlang : null) : null,
											profession: passcoder_live_response.data.data.data.profession ? (passcoder_live_response.data.data.data.profession.length > 0 ? passcoder_live_response.data.data.data.profession : null) : null,
											verification_reference: passcoder_live_response.data.data.verification.reference ? (passcoder_live_response.data.data.verification.reference.length > 0 ? passcoder_live_response.data.data.verification.reference : null) : null,
											verification_status: passcoder_live_response.data.data.verification.status ? (passcoder_live_response.data.data.verification.status.length > 0 ? passcoder_live_response.data.data.verification.status : null) : null,
											verification_endpoint: passcoder_live_response.data.data.endpoint_name ? (passcoder_live_response.data.data.endpoint_name.length > 0 ? passcoder_live_response.data.data.endpoint_name : null) : null,
											status: default_status
										}, { transaction }
									);

									if (verification) {
										SuccessResponse(res, { unique_id: anonymous, text: "Verification created successfully!" }, verification);
									} else {
										throw new Error("Error adding verification");
									}
								});
							}
						} else {
							BadRequestError(res, { unique_id: anonymous, text: passcoder_live_response.data.message }, null);
						}
					} catch (error) {
						console.log(error);
						BadRequestError(res, { unique_id: anonymous, text: error.message }, { err_code: error.code });
					}
				} else {
					BadRequestError(res, { unique_id: anonymous, text: "App Default for Verification not found!" }, null);
				}
			} else if (!verification && payload.type === "BVN") {
				const app_default = await APP_DEFAULTS.findOne({
					attributes: { exclude: ['id'] },
					where: {
						criteria: app_defaults.passcoder_live_key
					}
				});

				if (app_default) {
					try {
						const passcoder_live_response = await axios.post(
							`${passcoder_live_api_url}${passcoder_verify_bvn_url}`,
							{
								bvn: payload.identification_id,
							},
							{
								headers: {
									'x-api-key': app_default.value
								}
							}
						);

						if (passcoder_live_response.data.success) {
							if (passcoder_live_response.data.data === null) {
								BadRequestError(res, { unique_id: anonymous, text: "No data found" }, null);
							} else {
								if (payload.agency_unique_id) {
									const update_sync_timestamp = await AGENCIES.update(
										{
											sync_timestamp: timestamp_str_alt(new Date()),
										}, {
											where: {
												unique_id: payload.agency_unique_id,
											},
										}
									);

									const verifications_update = await AGENCIES.increment({ verifications: 1 }, { where: { unique_id: payload.agency_unique_id } });
								}

								if (payload.provider_unique_id) {
									const update_sync_timestamp = await PROVIDERS.update(
										{
											access_timestamp: timestamp_str_alt(new Date()),
										}, {
										where: {
											unique_id: payload.provider_unique_id,
										},
									}
									);

									const usage_update = await PROVIDERS.increment({ usage: 1 }, { where: { unique_id: payload.provider_unique_id } });
								}

								await db.sequelize.transaction(async (transaction) => {
									const verification = await VERIFICATIONS.create(
										{
											unique_id: uuidv4(),
											type: payload.type,
											agency_unique_id: payload.agency_unique_id ? payload.agency_unique_id : null,
											identification_id: payload.identification_id,
											firstname: passcoder_live_response.data.data.data.firstName ? (passcoder_live_response.data.data.data.firstName.length > 0 ? passcoder_live_response.data.data.data.firstName : null) : null,
											middlename: passcoder_live_response.data.data.data.middleName ? (passcoder_live_response.data.data.data.middleName.length > 0 ? passcoder_live_response.data.data.data.middleName : null) : null,
											lastname: passcoder_live_response.data.data.data.lastName ? (passcoder_live_response.data.data.data.lastName.length > 0 ? passcoder_live_response.data.data.data.lastName : null) : null,
											email: passcoder_live_response.data.data.data.email ? (passcoder_live_response.data.data.data.email.length > 0 ? return_all_letters_lowercase(passcoder_live_response.data.data.data.email) : null) : null,
											phone_number: passcoder_live_response.data.data.data.phoneNumber1 ? (passcoder_live_response.data.data.data.phoneNumber1.length > 0 ? passcoder_live_response.data.data.data.phoneNumber1 : null) : null,
											alt_phone_number: passcoder_live_response.data.data.data.phoneNumber2 ? (passcoder_live_response.data.data.data.phoneNumber2.length > 0 ? passcoder_live_response.data.data.data.phoneNumber2 : null) : null,
											gender: passcoder_live_response.data.data.data.gender ? (passcoder_live_response.data.data.data.gender.length > 0 ? passcoder_live_response.data.data.data.gender : null) : null,
											date_of_birth: passcoder_live_response.data.data.data.dateOfbirth ? (passcoder_live_response.data.data.data.dateOfbirth.length > 0 ? passcoder_live_response.data.data.data.dateOfbirth : null) : null,
											address: passcoder_live_response.data.data.data.residentialAddress ? (passcoder_live_response.data.data.data.residentialAddress.length > 0 ? passcoder_live_response.data.data.data.residentialAddress : null) : null,
											title: passcoder_live_response.data.data.data.title ? (passcoder_live_response.data.data.data.title.length > 0 ? passcoder_live_response.data.data.data.title : null) : null,
											nationality: passcoder_live_response.data.data.data.nationality ? (passcoder_live_response.data.data.data.nationality.length > 0 ? passcoder_live_response.data.data.data.nationality : null) : null,
											state_of_origin: passcoder_live_response.data.data.data.stateOfOrigin ? (passcoder_live_response.data.data.data.stateOfOrigin.length > 0 ? passcoder_live_response.data.data.data.stateOfOrigin : null) : null,
											state_of_residence: passcoder_live_response.data.data.data.stateOfResidence ? (passcoder_live_response.data.data.data.stateOfResidence.length > 0 ? passcoder_live_response.data.data.data.stateOfResidence : null) : null,
											nin: passcoder_live_response.data.data.data.nin ? (passcoder_live_response.data.data.data.nin.length > 0 ? passcoder_live_response.data.data.data.nin : null) : null,
											bvn: passcoder_live_response.data.data.data.bvn ? (passcoder_live_response.data.data.data.bvn.length > 0 ? passcoder_live_response.data.data.data.bvn : null) : null,
											vnin: passcoder_live_response.data.data.data.vnin ? (passcoder_live_response.data.data.data.vnin.length > 0 ? passcoder_live_response.data.data.data.vnin : null) : null,
											enrollment_bank: passcoder_live_response.data.data.data.enrollmentBank ? (passcoder_live_response.data.data.data.enrollmentBank.length > 0 ? passcoder_live_response.data.data.data.enrollmentBank : null) : null,
											enrollment_branch: passcoder_live_response.data.data.data.enrollmentBranch ? (passcoder_live_response.data.data.data.enrollmentBranch.length > 0 ? passcoder_live_response.data.data.data.enrollmentBranch : null) : null,
											level_of_account: passcoder_live_response.data.data.data.levelOfAccount ? (passcoder_live_response.data.data.data.levelOfAccount.length > 0 ? passcoder_live_response.data.data.data.levelOfAccount : null) : null,
											lga_of_origin: passcoder_live_response.data.data.data.lgaOfOrigin ? (passcoder_live_response.data.data.data.lgaOfOrigin.length > 0 ? passcoder_live_response.data.data.data.lgaOfOrigin : null) : null,
											lga_of_residence: passcoder_live_response.data.data.data.lgaOfResidence ? (passcoder_live_response.data.data.data.lgaOfResidence.length > 0 ? passcoder_live_response.data.data.data.lgaOfResidence : null) : null,
											marital_status: passcoder_live_response.data.data.data.maritalStatus ? (passcoder_live_response.data.data.data.maritalStatus.length > 0 ? passcoder_live_response.data.data.data.maritalStatus : null) : null,
											name_on_card: passcoder_live_response.data.data.data.nameOnCard ? (passcoder_live_response.data.data.data.nameOnCard.length > 0 ? passcoder_live_response.data.data.data.nameOnCard : null) : null,
											registration_date: passcoder_live_response.data.data.data.registrationDate ? (passcoder_live_response.data.data.data.registrationDate.length > 0 ? passcoder_live_response.data.data.data.registrationDate : null) : null,
											watch_listed: passcoder_live_response.data.data.data.watchListed ? (passcoder_live_response.data.data.data.watchListed.length > 0 ? passcoder_live_response.data.data.data.watchListed : null) : null,
											base_64_image: passcoder_live_response.data.data.data.base64Image ? (passcoder_live_response.data.data.data.base64Image.length > 0 ? passcoder_live_response.data.data.data.base64Image : null) : null,
											verification_reference: passcoder_live_response.data.data.verification.reference ? (passcoder_live_response.data.data.verification.reference.length > 0 ? passcoder_live_response.data.data.verification.reference : null) : null,
											verification_status: passcoder_live_response.data.data.verification.status ? (passcoder_live_response.data.data.verification.status.length > 0 ? passcoder_live_response.data.data.verification.status : null) : null,
											verification_endpoint: passcoder_live_response.data.data.endpoint_name ? (passcoder_live_response.data.data.endpoint_name.length > 0 ? passcoder_live_response.data.data.endpoint_name : null) : null,
											status: default_status
										}, { transaction }
									);

									if (verification) {
										SuccessResponse(res, { unique_id: anonymous, text: "Verification created successfully!" }, verification);
									} else {
										throw new Error("Error adding verification");
									}
								});
							}
						} else {
							BadRequestError(res, { unique_id: anonymous, text: passcoder_live_response.data.message }, null);
						}
					} catch (error) {
						console.log(error);
						BadRequestError(res, { unique_id: anonymous, text: error.message }, { err_code: error.code });
					}
				} else {
					BadRequestError(res, { unique_id: anonymous, text: "App Default for Verification not found!" }, null);
				}
			} else {
				BadRequestError(res, { unique_id: anonymous, text: "Verification unavailable!" }, null);
			}
		} catch (err) {
			ServerError(res, { unique_id: anonymous, text: err.message }, null);
		}
	}
};

export async function deleteVerification(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const verification_details = await VERIFICATIONS.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!verification_details) {
				NotFoundError(res, { unique_id: user_unique_id, text: "Verification not found" }, null);
			} else {
				await db.sequelize.transaction(async (transaction) => {
					const verification = await VERIFICATIONS.destroy(
						{
							where: {
								unique_id: payload.unique_id,
								status: default_status
							},
							transaction
						}
					);

					if (verification > 0) {
						const log_data = {
							user_unique_id: user_unique_id,
							type: "Verifications",
							action: `Deleted verification | Verification: ${verification_details.unique_id}`
						};
						addLog(log_data);
						OtherSuccessResponse(res, { unique_id: user_unique_id, text: "Verification was deleted successfully!" });
					} else {
						throw new Error("Error deleting verification");
					}
				});
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};