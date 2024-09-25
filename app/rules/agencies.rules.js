import { check } from 'express-validator';
import moment from 'moment';
import db from "../models/index.js";
import {
	default_status, check_length_TEXT, validate_future_date, validate_future_end_date, default_delete_status
} from '../config/config.js';

const AGENCIES = db.agencies;
const Op = db.Sequelize.Op;

export const agencies_rules = {
	forFindingAgencyInternal: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return AGENCIES.findOne({
					where: {
						unique_id
					}
				}).then(data => {
					if (!data) return Promise.reject('Agency not found!');
				});
			})
	],
	forFindingAgency: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return AGENCIES.findOne({
					where: {
						unique_id,
						status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Agency not found!');
				});
			})
	],
	forFindingAgencyFalsy: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return AGENCIES.findOne({
					where: {
						unique_id,
						status: default_delete_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Agency not found!');
				});
			})
	],
	forFindingAgencyAlt: [
		check('agency_unique_id', "Agency Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(agency_unique_id => {
				return AGENCIES.findOne({ where: { unique_id: agency_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Agency not found!');
				});
			})
	],
	forAddingAgencyAlt: [
		check('agency_unique_id')
			.optional({ checkFalsy: false })
			.bail()
			.custom(agency_unique_id => {
				return AGENCIES.findOne({ where: { unique_id: agency_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Agency not found!');
				});
			})
	], 
	forAdding: [
		check('name', "Name is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 2, max: 100 })
			.withMessage("Invalid length (2 - 100) characters")
			.bail()
			.custom(name => {
				return AGENCIES.findOne({ where: { name } }).then(data => {
					if (data) return Promise.reject('Agency already exists!');
				});
			}),
	],
	forUpdating: [
		check('name', "Name is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 2, max: 100 })
			.withMessage("Invalid length (2 - 100) characters"),
	],
};  