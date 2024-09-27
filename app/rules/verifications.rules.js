import { check } from 'express-validator';
import moment from 'moment';
import {
	password_options, default_status, check_length_TEXT, validate_future_date, validate_future_end_date, default_delete_status
} from '../config/config.js';
import db from "../models/index.js";

const AGENCIES = db.agencies;
const VERIFICATIONS = db.verifications;
const Op = db.Sequelize.Op;

export const verification_rules = {
	forFindingVerification: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(unique_id => {
				return VERIFICATIONS.findOne({ where: { unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Verification not found!');
				});
			})
	],
	forFindingVerificationFalsy: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(unique_id => {
				return VERIFICATIONS.findOne({ where: { unique_id, status: default_delete_status } }).then(data => {
					if (!data) return Promise.reject('Verification not found!');
				});
			})
	],
	forFindingVerificationAlt: [
		check('verification_unique_id', "Verification Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(verification_unique_id => {
				return VERIFICATIONS.findOne({ where: { unique_id: verification_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('Verification not found!');
				});
			})
	],
	forAdding: [
		check('type', "Type is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 2, max: 100 })
			.withMessage("Invalid length (2 - 100) characters"),
		check('firstname', "Firstname is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 2, max: 100 })
			.withMessage("Invalid length (2 - 100) characters"),
		check('middlename')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 2, max: 100 })
			.withMessage("Invalid length (2 - 100) characters"),
		check('lastname', "Lastname is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 2, max: 100 })
			.withMessage("Invalid length (2 - 100) characters"),
		check('email', "Email is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isEmail()
			.withMessage('Invalid email format')
			.bail()
			.custom(email => {
				return VERIFICATIONS.findOne({ where: { email } }).then(data => {
					if (data) return Promise.reject('Email already exists!');
				});
			}),
		check('phone_number', "Phone Number is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isMobilePhone()
			.withMessage('Invalid phone number')
			.bail()
			.custom(phone_number => {
				return VERIFICATIONS.findOne({ where: { phone_number } }).then(data => {
					if (data) return Promise.reject('Phone number already exists!');
				});
			}),
		check('gender', "Gender is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 1, max: 20 })
			.withMessage("Invalid length (1 - 20) characters"),
		check('date_of_birth', "Date of Birth is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(date_of_birth => {
				const later = moment(date_of_birth, "YYYY-MM-DD", true);
				return later.isValid();
			})
			.withMessage("Invalid Date of Birth format (YYYY-MM-DD)"),
		check('address', "Address is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 300 })
			.withMessage("Invalid length (3 - 300) characters"),
		check('nationality', "Nationality is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('state_of_origin', "State of Origin is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('lga_of_origin', "LGA of Origin is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 50 })
			.withMessage("Invalid length (3 - 50) characters"),
		check('marital_status', "Marital Status is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 200 })
			.withMessage("Invalid length (3 - 200) characters"),
		check('educational_level', "Educational Level is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 200 })
			.withMessage("Invalid length (3 - 200) characters"),
		check('employment_status', "Employment Status is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 200 })
			.withMessage("Invalid length (3 - 200) characters"),
		check('nok_firstname', "Next of Kin Firstname is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 2, max: 200 })
			.withMessage("Invalid length (2 - 200) characters"),
		check('nok_middlename')
			.optional({ checkFalsy: false })
			.bail()
			.isString().isLength({ min: 2, max: 200 })
			.withMessage("Invalid length (2 - 200) characters"),
		check('nok_surname', "Next of Kin Surname is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 2, max: 200 })
			.withMessage("Invalid length (2 - 200) characters"),
	],
	forSearching: [
		check('search', "Search is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 2, max: 200 })
			.withMessage("Invalid length (2 - 200) characters"),
	],
	forFindingType: [
		check('type', "Type is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 2, max: 100 })
			.withMessage("Invalid length (2 - 100) characters"),
	],
	forFindingIdentificationId: [
		check('identification_id', "Identification ID is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 2, max: 20 })
			.withMessage("Invalid length (2 - 20) characters"),
	],
};