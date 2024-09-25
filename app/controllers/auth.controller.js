import { validationResult, matchedData } from 'express-validator';
import moment from 'moment';
import axios from "axios";
import jwt from "jsonwebtoken";
import bycrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { ServerError, SuccessResponse, OtherSuccessResponse, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError, BadRequestError } from '../common/index.js';
import {
	access_granted, access_revoked, access_suspended, default_status, false_status, primary_domain, 
	random_uuid, zero, true_status, email_templates, return_all_letters_lowercase, mailer_url, unverified_status,
	timestamp_str_alt,
	user_types
} from '../config/config.js';
import db from "../models/index.js";
import { addLog } from './logs.controller.js';

dotenv.config();

const { secret, cloud_mailer_key, host_type, smtp_host, cloud_mailer_username, cloud_mailer_password, from_email, } = process.env;

const USERS = db.users;
const AGENCIES = db.agencies;
const PROVIDERS = db.providers;
const Op = db.Sequelize.Op;

const { sign } = jwt;
const { hashSync } = bycrypt;
const { compareSync } = bycrypt;

export async function userSignUp(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: payload.email, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			await db.sequelize.transaction(async (transaction) => {

				const users = await USERS.create(
					{
						unique_id: uuidv4(),
						type: user_types.citizen,
						email: return_all_letters_lowercase(payload.email),
						...payload,
						role: "User",
						login_timestamp: null,
						privates: hashSync(payload.password, 8),
						access: access_granted,
						status: default_status
					}, { transaction }
				);

				if (users) {
					const token = sign({ user_unique_id: users.unique_id }, secret, {
						expiresIn: payload.remember_me ? 604800 /* 7 days */ : 86400 // 24 hours
					});

					const return_data = {
						token,
						role: users.role,
						fullname: users.fullname,
					};
					SuccessResponse(res, { unique_id: users.unique_id, text: "Signed up successfully!" }, return_data);
				} else {
					throw new Error("Error signing up");
				}
			});
		} catch (err) {
			ServerError(res, { unique_id: payload.email, text: err.message }, null);
		}
	}
};

export async function userSignIn(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: payload.email, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const user = await USERS.findOne({
				where: {
					email: payload.email,
					status: default_status
				}
			});

			if (!user) {
				NotFoundError(res, { unique_id: payload.email, text: "User not found" }, null);
			} else if (user.access === access_suspended) {
				ForbiddenError(res, { unique_id: payload.email, text: "Account has been suspended" }, null);
			} else if (user.access === access_revoked) {
				ForbiddenError(res, { unique_id: payload.email, text: "Account access has been revoked" }, null);
			} else {
				const passwordIsValid = compareSync(payload.password, user.privates);

				if (!passwordIsValid) {
					UnauthorizedError(res, { unique_id: payload.email, text: "Invalid Password!" }, null);
				} else {
					const update_login_timestamp = await USERS.update(
						{
							login_timestamp: timestamp_str_alt(new Date()),
						}, {
							where: {
								unique_id: user.unique_id,
							},
						}
					);

					const log_data = {
						user_unique_id: user.unique_id,
						type: "Signin",
						action: `Citizen signed in successfully`
					};
					addLog(log_data);

					const token = sign({ user_unique_id: user.unique_id }, secret, {
						expiresIn: payload.remember_me ? 604800 /* 7 days */ : 86400 // 24 hours
					});

					const return_data = {
						token,
						role: user.role,
						fullname: user.fullname,
					};
					SuccessResponse(res, { unique_id: user.unique_id, text: "Logged in successfully!" }, return_data);
				}
			}
		} catch (err) {
			ServerError(res, { unique_id: payload.email, text: err.message }, null);
		}
	}
};

export async function adminSignIn(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: payload.email, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const user = await USERS.findOne({
				where: {
					[Op.or]: [
						{
							email: payload.email,
						}
					],
					status: default_status
				}
			});

			if (!user) {
				NotFoundError(res, { unique_id: payload.email, text: "User not found" }, null);
			} else if (user.access === access_suspended) {
				ForbiddenError(res, { unique_id: payload.email, text: "Account has been suspended" }, null);
			} else if (user.access === access_revoked) {
				ForbiddenError(res, { unique_id: payload.email, text: "Account access has been revoked" }, null);
			} else {
				const passwordIsValid = compareSync(payload.password, user.privates);

				if (!passwordIsValid) {
					UnauthorizedError(res, { unique_id: payload.email, text: "Invalid Password!" }, null);
				} else {
					const update_login_timestamp = await USERS.update(
						{
							login_timestamp: timestamp_str_alt(new Date()),
						}, {
							where: {
								unique_id: user.unique_id,
							},
						}
					);

					const log_data = {
						user_unique_id: user.unique_id,
						type: "Signin",
						action: `Admin signed in successfully`
					};
					addLog(log_data);

					const token = sign({ user_unique_id: user.unique_id }, secret, {
						expiresIn: payload.remember_me ? 604800 /* 7 days */ : 86400 // 24 hours
					});

					const return_data = {
						token,
						role: user.role,
						fullname: user.fullname,
					};
					SuccessResponse(res, { unique_id: user.unique_id, text: "Logged in successfully!" }, return_data);
				}
			}
		} catch (err) {
			ServerError(res, { unique_id: payload.email, text: err.message }, null);
		}
	}
};

export async function agencyUserSignIn(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: payload.email, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const user = await USERS.findOne({
				where: {
					[Op.or]: [
						{
							email: payload.email,
						}
					],
					agency_unique_id: payload.agency_unique_id,
					status: default_status
				}, 
				include: [
					{
						model: AGENCIES,
						attributes: ['name', 'sync_timestamp']
					}
				],
			});

			if (!user) {
				NotFoundError(res, { unique_id: payload.email, text: "User not found" }, null);
			} else if (user.access === access_suspended) {
				ForbiddenError(res, { unique_id: payload.email, text: "Account has been suspended" }, null);
			} else if (user.access === access_revoked) {
				ForbiddenError(res, { unique_id: payload.email, text: "Account access has been revoked" }, null);
			} else {
				const passwordIsValid = compareSync(payload.password, user.privates);

				if (!passwordIsValid) {
					UnauthorizedError(res, { unique_id: payload.email, text: "Invalid Password!" }, null);
				} else {
					const update_login_timestamp = await USERS.update(
						{
							login_timestamp: timestamp_str_alt(new Date()),
						}, {
							where: {
								unique_id: user.unique_id,
							},
						}
					);

					const log_data = {
						user_unique_id: user.unique_id,
						type: "Signin",
						action: `Agency User signed in successfully | Agency Unique ID: ${payload.agency_unique_id}`
					};
					addLog(log_data);

					const token = sign({ user_unique_id: user.unique_id, agency_unique_id: user.agency_unique_id }, secret, {
						expiresIn: payload.remember_me ? 604800 /* 7 days */ : 86400 // 24 hours
					});

					const return_data = {
						token,
						role: user.role,
						fullname: user.fullname,
						agency: user.agency.name
					};
					SuccessResponse(res, { unique_id: user.unique_id, text: "Logged in successfully!" }, return_data);
				}
			}
		} catch (err) {
			ServerError(res, { unique_id: payload.email, text: err.message }, null);
		}
	}
};

export async function providerUserSignIn(req, res) {
	const errors = validationResult(req);
	const payload = matchedData(req);

	if (!errors.isEmpty()) {
		ValidationError(res, { unique_id: payload.email, text: "Validation Error Occured" }, errors.array())
	} else {
		try {
			const user = await USERS.findOne({
				where: {
					[Op.or]: [
						{
							email: payload.email,
						}
					],
					provider_unique_id: { [Op.ne]: null },
					status: default_status
				},
				include: [
					{
						model: PROVIDERS,
						attributes: ['name', 'type', 'access_timestamp']
					}
				],
			});

			if (!user) {
				NotFoundError(res, { unique_id: payload.email, text: "Provider User not found" }, null);
			} else if (user.access === access_suspended) {
				ForbiddenError(res, { unique_id: payload.email, text: "Account has been suspended" }, null);
			} else if (user.access === access_revoked) {
				ForbiddenError(res, { unique_id: payload.email, text: "Account access has been revoked" }, null);
			} else {
				const passwordIsValid = compareSync(payload.password, user.privates);

				if (!passwordIsValid) {
					UnauthorizedError(res, { unique_id: payload.email, text: "Invalid Password!" }, null);
				} else {
					const update_login_timestamp = await USERS.update(
						{
							login_timestamp: timestamp_str_alt(new Date()),
						}, {
							where: {
								unique_id: user.unique_id,
							},
						}
					);

					const log_data = {
						user_unique_id: user.unique_id,
						type: "Signin",
						action: `Provider User signed in successfully | Provider Unique ID: ${user.provider_unique_id}`
					};
					addLog(log_data);

					const token = sign({ user_unique_id: user.unique_id, provider_unique_id: user.provider_unique_id }, secret, {
						expiresIn: payload.remember_me ? 604800 /* 7 days */ : 86400 // 24 hours
					});

					const return_data = {
						token,
						role: user.role,
						fullname: user.fullname,
						provider: user.provider.name
					};
					SuccessResponse(res, { unique_id: user.unique_id, text: "Logged in successfully!" }, return_data);
				}
			}
		} catch (err) {
			ServerError(res, { unique_id: payload.email, text: err.message }, null);
		}
	}
};
