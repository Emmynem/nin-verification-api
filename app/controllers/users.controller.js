import { validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";
import dotenv from 'dotenv';
import bycrypt from "bcryptjs";
import { ServerError, SuccessResponse, ValidationError, OtherSuccessResponse, UnauthorizedError, NotFoundError, BadRequestError, logger } from '../common/index.js';
import {
	access_granted, access_revoked, access_suspended, default_delete_status, default_status, false_status, true_status, clouder_url, 
	tag_root, paginate, return_all_letters_uppercase, email_templates, random_uuid, primary_domain, return_all_letters_lowercase, mailer_url
} from '../config/config.js';
import db from "../models/index.js";
import { addLog } from './logs.controller.js';

dotenv.config();

const { clouder_key, cloudy_name, cloudy_key, cloudy_secret, cloud_mailer_key, host_type, smtp_host, cloud_mailer_username, cloud_mailer_password, from_email } = process.env;

const AGENCIES = db.agencies;
const PROVIDERS = db.providers;
const USERS = db.users;
const Op = db.Sequelize.Op;

const { compareSync } = bycrypt;
const { hashSync } = bycrypt;

export async function rootGetUsers(req, res) {
	const total_records = await USERS.count();
	const pagination = paginate(parseInt(req.query.page) || parseInt(req.body.page), parseInt(req.query.size) || parseInt(req.body.size), total_records);
	const orderBy = req.query.orderBy || req.body.orderBy || "createdAt";
	const sortBy = return_all_letters_uppercase(req.query.sortBy) || return_all_letters_uppercase(req.body.sortBy) || "DESC";

	USERS.findAndCountAll({
		attributes: { exclude: ['privates', 'id'] },
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
	}).then(users => {
		if (!users || users.length === 0) {
			SuccessResponse(res, { unique_id: tag_root, text: "Users Not found" }, []);
		} else {
			SuccessResponse(res, { unique_id: tag_root, text: "Users loaded" }, { ...users, pages: pagination.pages });
		}
	}).catch(err => {
		ServerError(res, { unique_id: tag_root, text: err.message }, null);
	});
};

export function rootGetUser(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		USERS.findOne({
			attributes: { exclude: ['privates', 'id'] },
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
		}).then(user => {
			if (!user) {
				NotFoundError(res, { unique_id: tag_root, text: "User not found" }, null);
			} else {
				SuccessResponse(res, { unique_id: tag_root, text: "User loaded" }, user);
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		});
	}
};

export async function rootSearchUsers(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: tag_root, text: "Validation Error Occured" }, errors.array())
	} else {
		const total_records = await USERS.count({
			where: {
				[Op.or]: [
					{
						fullname: {
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
						role: {
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

		USERS.findAndCountAll({
			attributes: { exclude: ['privates', 'id'] },
			where: {
				[Op.or]: [
					{
						fullname: {
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
						role: {
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
				['fullname', 'ASC'],
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
		}).then(users => {
			if (!users || users.length === 0) {
				SuccessResponse(res, { unique_id: tag_root, text: "Users Not found" }, []);
			} else {
				SuccessResponse(res, { unique_id: tag_root, text: "Users loaded" }, { ...users, pages: pagination.pages });
			}
		}).catch(err => {
			ServerError(res, { unique_id: tag_root, text: err.message }, null);
		});
	}
};

export function getUserProfile(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;

	USERS.findOne({
		attributes: { exclude: ['privates', 'id', 'access', 'status', 'updatedAt'] },
		where: {
			unique_id: user_unique_id,
			status: default_status
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
	}).then(user => {
		if (!user) {
			NotFoundError(res, { unique_id: user_unique_id, text: "User not found" }, null);
		} else {
			SuccessResponse(res, { unique_id: user_unique_id, text: "User loaded" }, user);
		}
	}).catch(err => {
		ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
	});
};

export async function addUser(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const users = await USERS.create(
					{
						unique_id: uuidv4(),
						type: payload.type,
						agency_unique_id: payload.agency_unique_id ? payload.agency_unique_id : null,
						provider_unique_id: payload.provider_unique_id ? payload.provider_unique_id : null,
						fullname: payload.fullname,
						email: return_all_letters_lowercase(payload.email),
						role: payload.role,
						login_timestamp: null,
						privates: hashSync(payload.password, 8),
						access: access_granted,
						status: default_status
					}, { transaction }
				);

				if (users) {
					const log_data = {
						user_unique_id: user_unique_id,
						type: "Users",
						action: `Added new user | Fullname: ${payload.fullname} | Role: ${payload.role}`
					};
					addLog(log_data);
					SuccessResponse(res, { unique_id: user_unique_id, text: "User created successfully!" });
				} else {
					throw new Error("Error creating user");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updateUserDetails(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {
				const user = await USERS.update(
					{
						...payload,
					}, {
						where: {
							unique_id: payload.unique_id,
							status: default_status
						},
						transaction
					}
				);

				if (user > 0) {
					const log_data = {
						user_unique_id: user_unique_id,
						type: "Users",
						action: `Updated user details`
					};
					addLog(log_data);
					SuccessResponse(res, { unique_id: user_unique_id, text: "Details updated successfully!" }, null);
				} else {
					throw new Error("User not found");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function userChangePassword(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;
	
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const user = await USERS.findOne({
				where: {
					unique_id: payload.unique_id,
					status: default_status
				}
			});

			if (!user) {
				NotFoundError(res, { unique_id: user_unique_id, text: "User not found" }, null);
			} else if (user.access === access_suspended) {
				ForbiddenError(res, { unique_id: user_unique_id, text: "Account has been suspended" }, null);
			} else if (user.access === access_revoked) {
				ForbiddenError(res, { unique_id: user_unique_id, text: "Account access has been revoked" }, null);
			} else {
				// const passwordIsValid = compareSync(payload.oldPassword, user.privates);

				// if (!passwordIsValid) {
				// 	UnauthorizedError(res, { unique_id: user_unique_id, text: "Invalid Old Password!" }, null);
				// } else {
					const update_password = await db.sequelize.transaction((t) => {
						return USERS.update({
							privates: hashSync(payload.password, 8)
						}, {
							where: {
								unique_id: user.unique_id,
								status: default_status
							}
						}, { transaction: t });
					})

					if (update_password > 0) {
						const log_data = {
							user_unique_id: user_unique_id,
							type: "Users",
							action: `Updated user password | Fullname: ${user.fullname} | Role: ${user.role}`
						};
						addLog(log_data);
						SuccessResponse(res, { unique_id: user.unique_id, text: "User's password changed successfully!" }, null);
					} else {
						throw new Error("Error creating password!");
					}
				// }
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updateUserAccessGranted(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, `${tag_root} | updateUserAccessGranted | Validation Error Occured`, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {

				const user = await USERS.update(
					{
						access: access_granted
					}, {
						where: {
							...payload,
							access: {
								[Op.ne]: access_granted
							},
							status: default_status
						},
						transaction
					}
				);

				if (user > 0) {
					const log_data = {
						user_unique_id,
						type: "Access",
						action: `Granted general access.`
					};
					addLog(log_data);
					SuccessResponse(res, { unique_id: user_unique_id, text: "User's access granted successfully!" });
				} else {
					throw new Error("User access already granted");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updateUserAccessSuspended(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, `${tag_root} | updateUserAccessSuspended | Validation Error Occured`, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {

				const user = await USERS.update(
					{
						access: access_suspended
					}, {
						where: {
							...payload,
							access: {
								[Op.ne]: access_suspended
							},
							status: default_status
						},
						transaction
					}
				);

				if (user > 0) {
					const log_data = {
						user_unique_id,
						type: "Access",
						action: `Suspended general access.`
					};
					addLog(log_data);
					SuccessResponse(res, { unique_id: user_unique_id, text: "User's access suspended successfully!" });
				} else {
					throw new Error("User access already suspended");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function updateUserAccessRevoked(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, `${tag_root} | updateUserAccessRevoked | Validation Error Occured`, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {

				const user = await USERS.update(
					{
						access: access_revoked
					}, {
						where: {
							...payload,
							access: {
								[Op.ne]: access_revoked
							},
							status: default_status
						},
						transaction
					}
				);

				if (user > 0) {
					const log_data = {
						user_unique_id,
						type: "Access",
						action: `Revoked general access.`
					};
					addLog(log_data);
					SuccessResponse(res, { unique_id: user_unique_id, text: "User's access revoked successfully!" });
				} else {
					throw new Error("User access already revoked");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};

export async function deleteUser(req, res) {
	const user_unique_id = req.USER_UNIQUE_ID;

	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: user_unique_id, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			if (user_unique_id === payload.unique_id) {
				BadRequestError(res, { unique_id: user_unique_id, text: "Unable to perform action" }, null);
			} else {
				const user_details = await USERS.findOne({
					where: {
						unique_id: payload.unique_id,
						status: default_status
					}
				});
	
				if (!user_details) {
					NotFoundError(res, { unique_id: user_unique_id, text: "User not found" }, null);
				} else {
					await db.sequelize.transaction(async (transaction) => {
						const user = await USERS.destroy(
							{
								where: {
									unique_id: payload.unique_id,
									status: default_status
								},
								transaction
							}
						);
	
						if (user > 0) {
							const log_data = {
								user_unique_id: user_unique_id,
								type: "Users",
								action: `Deleted user | User: ${user_details.fullname}`
							};
							addLog(log_data);
							OtherSuccessResponse(res, { unique_id: user_unique_id, text: "User was deleted successfully!" });
						} else {
							throw new Error("Error deleting user");
						}
					});
				}
			}
		} catch (err) {
			ServerError(res, { unique_id: user_unique_id, text: err.message }, null);
		}
	}
};
