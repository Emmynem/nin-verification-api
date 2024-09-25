import { validationResult, matchedData } from 'express-validator';
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, NotFoundError, BadRequestError, logger } from '../common/index.js';
import {
	false_status, true_status, tag_root, paginate, timestamp_str_alt
} from '../config/config.js';
import db from "../models/index.js";

const AGENCIES = db.agencies;
const PROVIDERS = db.providers;
const LOGS = db.logs;
const VERIFICATIONS = db.verifications;
const USERS = db.users;
const Op = db.Sequelize.Op;

export async function getAnalytics(req, res) {

	try {
		const total_users = await USERS.count();
		const total_agencies = await AGENCIES.count();
		const total_providers = await PROVIDERS.count();
		const total_logs = await LOGS.count();
		const total_verifications = await VERIFICATIONS.count();

		const agency_verification_sum = await AGENCIES.findAll({
			attributes: [
				[db.sequelize.fn('sum', db.sequelize.col('verifications')), 'total_verifications'],
			],
		});

		const provider_usage_sum = await PROVIDERS.findAll({
			attributes: [
				[db.sequelize.fn('sum', db.sequelize.col('usage')), 'total_usage'],
			],
		});

		const total_verifications_via_type = await VERIFICATIONS.findAll({
			attributes: ["type", [db.sequelize.fn('count', db.sequelize.col('id')), 'total_count']],
			group: "type"
		});

		const total_verifications_via_agency = await VERIFICATIONS.findAll({
			attributes: ["agency.name", [db.sequelize.fn('count', db.sequelize.col('agency_unique_id')), 'total_count']],
			include: [
				{
					model: AGENCIES,
					attributes: ['unique_id', 'name'],
				},
			],
			subQuery: false,
			group: ["agency.id", "agency.name"]
		});

		SuccessResponse(res, { unique_id: tag_root, text: "Analytics Loaded" }, {
			total_users, total_agencies, total_providers, total_logs, total_verifications, agency_verification_sum, provider_usage_sum, 
			total_verifications_via_type, total_verifications_via_agency
		});
	} catch (err) {
		ServerError(res, { unique_id: tag_root, text: err.message }, null);
	}
};

export async function getFilteredAnalytics(req, res) {

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const total_users = await USERS.count({
				where: {
					[Op.or]: [
						{
							createdAt: {
								[Op.gte]: timestamp_str_alt(new Date(payload.start_date).setHours(0, 0, 0, 0)),
								[Op.lte]: timestamp_str_alt(new Date(payload.end_date).setHours(23, 59, 59, 0))
							}
						},
						// {
						// 	updatedAt: {
						// 		[Op.gte]: timestamp_str_alt(new Date(payload.start_date).setHours(0, 0, 0, 0)),
						// 		[Op.lte]: timestamp_str_alt(new Date(payload.end_date).setHours(23, 59, 59, 0))
						// 	}
						// }
					]
				}
			});

			const total_agencies = await AGENCIES.count({
				where: {
					[Op.or]: [
						{
							createdAt: {
								[Op.gte]: timestamp_str_alt(new Date(payload.start_date).setHours(0, 0, 0, 0)),
								[Op.lte]: timestamp_str_alt(new Date(payload.end_date).setHours(23, 59, 59, 0))
							}
						},
						// {
						// 	updatedAt: {
						// 		[Op.gte]: timestamp_str_alt(new Date(payload.start_date).setHours(0, 0, 0, 0)),
						// 		[Op.lte]: timestamp_str_alt(new Date(payload.end_date).setHours(23, 59, 59, 0))
						// 	}
						// }
					]
				}
			});

			const total_providers = await PROVIDERS.count({
				where: {
					[Op.or]: [
						{
							createdAt: {
								[Op.gte]: timestamp_str_alt(new Date(payload.start_date).setHours(0, 0, 0, 0)),
								[Op.lte]: timestamp_str_alt(new Date(payload.end_date).setHours(23, 59, 59, 0))
							}
						},
						// {
						// 	updatedAt: {
						// 		[Op.gte]: timestamp_str_alt(new Date(payload.start_date).setHours(0, 0, 0, 0)),
						// 		[Op.lte]: timestamp_str_alt(new Date(payload.end_date).setHours(23, 59, 59, 0))
						// 	}
						// }
					]
				}
			});

			const total_logs = await LOGS.count({
				where: {
					[Op.or]: [
						{
							createdAt: {
								[Op.gte]: timestamp_str_alt(new Date(payload.start_date).setHours(0, 0, 0, 0)),
								[Op.lte]: timestamp_str_alt(new Date(payload.end_date).setHours(23, 59, 59, 0))
							}
						},
						// {
						// 	updatedAt: {
						// 		[Op.gte]: timestamp_str_alt(new Date(payload.start_date).setHours(0, 0, 0, 0)),
						// 		[Op.lte]: timestamp_str_alt(new Date(payload.end_date).setHours(23, 59, 59, 0))
						// 	}
						// }
					]
				}
			});

			const total_verifications = await VERIFICATIONS.count({
				where: {
					[Op.or]: [
						{
							createdAt: {
								[Op.gte]: timestamp_str_alt(new Date(payload.start_date).setHours(0, 0, 0, 0)),
								[Op.lte]: timestamp_str_alt(new Date(payload.end_date).setHours(23, 59, 59, 0))
							}
						},
						// {
						// 	updatedAt: {
						// 		[Op.gte]: timestamp_str_alt(new Date(payload.start_date).setHours(0, 0, 0, 0)),
						// 		[Op.lte]: timestamp_str_alt(new Date(payload.end_date).setHours(23, 59, 59, 0))
						// 	}
						// }
					]
				}
			});

			const agency_verification_sum = await AGENCIES.findAll({
				attributes: [
					[db.sequelize.fn('sum', db.sequelize.col('verifications')), 'total_verifications'],
				],
				where: {
					[Op.or]: [
						{
							createdAt: {
								[Op.gte]: timestamp_str_alt(new Date(payload.start_date).setHours(0, 0, 0, 0)),
								[Op.lte]: timestamp_str_alt(new Date(payload.end_date).setHours(23, 59, 59, 0))
							}
						},
					]
				},
			});

			const provider_usage_sum = await PROVIDERS.findAll({
				attributes: [
					[db.sequelize.fn('sum', db.sequelize.col('usage')), 'total_usage'],
				],
				where: {
					[Op.or]: [
						{
							createdAt: {
								[Op.gte]: timestamp_str_alt(new Date(payload.start_date).setHours(0, 0, 0, 0)),
								[Op.lte]: timestamp_str_alt(new Date(payload.end_date).setHours(23, 59, 59, 0))
							}
						},
					]
				},
			});

			const total_verifications_via_type = await VERIFICATIONS.findAll({
				attributes: ["type", [db.sequelize.fn('count', db.sequelize.col('id')), 'total_count']],
				where: {
					[Op.or]: [
						{
							createdAt: {
								[Op.gte]: timestamp_str_alt(new Date(payload.start_date).setHours(0, 0, 0, 0)),
								[Op.lte]: timestamp_str_alt(new Date(payload.end_date).setHours(23, 59, 59, 0))
							}
						},
					]
				},
				group: "type"
			});

			const total_verifications_via_agency = await VERIFICATIONS.findAll({
				attributes: ["agency.name", [db.sequelize.fn('count', db.sequelize.col('agency_unique_id')), 'total_count']],
				include: [
					{
						model: AGENCIES,
						attributes: ['unique_id', 'name'],
					},
				],
				where: {
					[Op.or]: [
						{
							createdAt: {
								[Op.gte]: timestamp_str_alt(new Date(payload.start_date).setHours(0, 0, 0, 0)),
								[Op.lte]: timestamp_str_alt(new Date(payload.end_date).setHours(23, 59, 59, 0))
							}
						},
					]
				},
				subQuery: false,
				group: ["agency.name"]
			});

			SuccessResponse(res, { unique_id: tag_root, text: "Filtered Analytics Loaded" }, {
				total_users, total_agencies, total_providers, total_logs, total_verifications, agency_verification_sum, provider_usage_sum,
				total_verifications_via_type, total_verifications_via_agency
			});
		} catch (err) {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		}
	}
};

export async function getAgencyAnalytics(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const agency_unique_id = req.AGENCY_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const total_verifications = await VERIFICATIONS.count({ where: { agency_unique_id: agency_unique_id } });

			const agency_verification_sum = await AGENCIES.findAll({
				attributes: [
					[db.sequelize.fn('sum', db.sequelize.col('verifications')), 'total_verifications'],
				],
				where: {
					unique_id: agency_unique_id
				}
			});

			const total_verifications_via_type = await VERIFICATIONS.findAll({
				attributes: ["type", [db.sequelize.fn('count', db.sequelize.col('id')), 'total_count']],
				where: {
					agency_unique_id: agency_unique_id
				},
				group: "type"
			});

			const total_verifications_via_agency = await VERIFICATIONS.findAll({
				attributes: ["agency.name", [db.sequelize.fn('count', db.sequelize.col('agency_unique_id')), 'total_count']],
				include: [
					{
						model: AGENCIES,
						attributes: ['unique_id', 'name'],
					},
				],
				where: {
					agency_unique_id: agency_unique_id
				},
				subQuery: false,
				group: ["agency.name"]
			});

			SuccessResponse(res, { unique_id: user_unique_id, text: "Agency Analytics Loaded" }, {
				total_verifications, agency_verification_sum, total_verifications_via_type, total_verifications_via_agency
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function getProviderAnalytics(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	const provider_unique_id = req.PROVIDER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const total_verifications = await VERIFICATIONS.count({ where: { provider_unique_id: provider_unique_id } });

			const provider_usage_sum = await PROVIDERS.findAll({
				attributes: [
					[db.sequelize.fn('sum', db.sequelize.col('usage')), 'total_usage'],
				],
				where: {
					unique_id: provider_unique_id
				}
			});

			const total_verifications_via_type = await VERIFICATIONS.findAll({
				attributes: ["type", [db.sequelize.fn('count', db.sequelize.col('id')), 'total_count']],
				where: {
					provider_unique_id: provider_unique_id
				},
				group: "type"
			});

			const total_verifications_via_provider = await VERIFICATIONS.findAll({
				attributes: ["provider.name", [db.sequelize.fn('count', db.sequelize.col('provider_unique_id')), 'total_count']],
				include: [
					{
						model: PROVIDERS,
						attributes: ['unique_id', 'name'],
					},
				],
				where: {
					provider_unique_id: provider_unique_id
				},
				subQuery: false,
				group: ["provider.name"]
			});

			SuccessResponse(res, { unique_id: user_unique_id, text: "Provider Analytics Loaded" }, {
				total_verifications, provider_usage_sum, total_verifications_via_type, total_verifications_via_provider
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};