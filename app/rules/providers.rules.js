import { check } from 'express-validator';
import moment from 'moment';
import db from "../models/index.js";
import {
	default_status, check_length_TEXT, validate_future_date, validate_future_end_date, default_delete_status
} from '../config/config.js';

const PROVIDERS = db.providers;
const Op = db.Sequelize.Op;

export const providers_rules = {
	forFindingProviderInternal: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return PROVIDERS.findOne({
					where: {
						unique_id
					}
				}).then(data => {
					if (!data) return Promise.reject('Provider not found!');
				});
			})
	],
	forFindingProvider: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return PROVIDERS.findOne({
					where: {
						unique_id,
						status: default_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Provider not found!');
				});
			})
	],
	forFindingProviderFalsy: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom((unique_id, { req }) => {
				return PROVIDERS.findOne({
					where: {
						unique_id,
						status: default_delete_status
					}
				}).then(data => {
					if (!data) return Promise.reject('Provider not found!');
				});
			})
	],
	forFindingProviderAlt: [
		check('provider_unique_id', "Provider Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(provider_unique_id => {
				return PROVIDERS.findOne({ where: { unique_id: provider_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Provider not found!');
				});
			})
	],
	forAddingProviderAlt: [
		check('provider_unique_id')
			.optional({ checkFalsy: false })
			.bail()
			.custom(provider_unique_id => {
				return PROVIDERS.findOne({ where: { unique_id: provider_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Provider not found!');
				});
			})
	], 
	forAdding: [
		check('name', "Name is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 2, max: 100 })
			.withMessage("Invalid length (2 - 100) characters"),
		check('type', "Type is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 2, max: 50 })
			.withMessage("Invalid length (2 - 50) characters"),
	],
	forUpdating: [
		check('name', "Name is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 2, max: 100 })
			.withMessage("Invalid length (2 - 100) characters"),
		check('type', "Type is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 2, max: 50 })
			.withMessage("Invalid length (2 - 50) characters"),
	],
};  