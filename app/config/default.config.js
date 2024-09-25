import db from "../models/index.js";
import { logger } from '../common/index.js';
import { default_app_values, default_user } from './config.js';

const APP_DEFAULTS = db.app_defaults;
const USERS = db.users;

export async function createAppDefaults() {

    const count = await APP_DEFAULTS.count();

    if (count <= 0) {
        try {
            await db.sequelize.transaction((t) => {
                const appDefaults = APP_DEFAULTS.bulkCreate(default_app_values, { transaction: t });
                return appDefaults;
            })
            logger.info('Added app defaults');
        } catch (error) {
            logger.error(error)
            logger.error('Error adding app defaults');
        }
    }
};

export async function createDefaultUser() {

    const count = await USERS.count();

    if (count <= 0) {
        try {
            await db.sequelize.transaction((t) => {
                const users = USERS.create(default_user, { transaction: t });
                return users;
            })
            logger.info('Added user defaults');
        } catch (error) {
            logger.error(error)
            logger.error('Error adding user defaults');
        }
    }
};
