import { check } from 'express-validator';
import moment from 'moment';
import {
	password_options, default_status, check_length_TEXT, validate_future_date, validate_future_end_date, default_delete_status,
	user_types, validate_user_type
} from '../config/config.js';
import db from "../models/index.js";

const USERS = db.users;
const Op = db.Sequelize.Op;

export const user_rules = {
	forFindingUser: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(unique_id => {
				return USERS.findOne({ where: { unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('User not found!');
				});
			})
	],
	forFindingUserFalsy: [
		check('unique_id', "Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(unique_id => {
				return USERS.findOne({ where: { unique_id, status: default_delete_status } }).then(data => {
					if (!data) return Promise.reject('User not found!');
				});
			})
	],
	forFindingUserAlt: [
		check('user_unique_id', "User Unique Id is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(user_unique_id => {
				return USERS.findOne({ where: { unique_id: user_unique_id, status: default_status } }).then(data => {
					if (!data) return Promise.reject('User not found!');
				});
			})
	],
	forAdding: [
		check('type', "Type is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.custom(type => !!validate_user_type(type))
			.withMessage(`Invalid type, accepts - ${user_types.admin + ", " + user_types.agency + ", " + user_types.provider + ", " + user_types.citizen}`),
		check('fullname', "Fullname is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 300 })
			.withMessage("Invalid length (3 - 300) characters"),
		check('email', "Email is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isEmail()
			.withMessage('Invalid email format')
			.bail()
			.custom(email => {
				return USERS.findOne({ where: { email } }).then(data => {
					if (data) return Promise.reject('Email already exists!');
				});
			}),
		check('role', "Role is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 20 })
			.withMessage("Invalid length (3 - 20) characters"),
		check('password', "Password is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isStrongPassword(password_options)
			.withMessage('Invalid password (must be 8 characters or more and contain one or more uppercase, lowercase, number and special character)'),
		check('confirmPassword', "Confirm Password is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().custom((confirmPassword, { req }) => req.body.password === confirmPassword)
			.withMessage('Passwords are different')
	],
	forAddingCitizen: [
		check('fullname', "Fullname is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 300 })
			.withMessage("Invalid length (3 - 300) characters"),
		check('email', "Email is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isEmail()
			.withMessage('Invalid email format')
			.bail()
			.custom(email => {
				return USERS.findOne({ where: { email } }).then(data => {
					if (data) return Promise.reject('Email already exists!');
				});
			}),
		check('password', "Password is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isStrongPassword(password_options)
			.withMessage('Invalid password (must be 8 characters or more and contain one or more uppercase, lowercase, number and special character)'),
		check('confirmPassword', "Confirm Password is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().custom((confirmPassword, { req }) => req.body.password === confirmPassword)
			.withMessage('Passwords are different')
	],
	forEmailLogin: [
		check('email', "Email is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isEmail()
			.withMessage('Invalid email format'),
		check('password').exists().isString().withMessage("Password is required"),
		check('remember_me')
			.optional({ checkFalsy: false })
			.bail()
			.isBoolean()
			.withMessage("Value should be true or false")
	],
	forUpdatingDetails: [
		check('fullname', "Fullname is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 300 })
			.withMessage("Invalid length (3 - 300) characters"),
		check('role', "Role is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 3, max: 20 })
			.withMessage("Invalid length (3 - 20) characters"),
	],
	forChangingPassword: [
		// check('oldPassword', "Old Password is required")
		// 	.exists({ checkNull: true, checkFalsy: true })
		// 	.isString()
		// 	.withMessage("Invalid old password"),
		check('password', "Password is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isStrongPassword(password_options)
			.withMessage('Invalid password (must be 8 characters or more and contain one or more uppercase, lowercase, number and special character)'),
		check('confirmPassword', "Confirm Password is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().custom((confirmPassword, { req }) => req.body.password === confirmPassword)
			.withMessage('Passwords are different')
	],
	forSearching: [
		check('search', "Search is required")
			.exists({ checkNull: true, checkFalsy: true })
			.bail()
			.isString().isLength({ min: 2, max: 200 })
			.withMessage("Invalid length (2 - 200) characters"),
	],
};