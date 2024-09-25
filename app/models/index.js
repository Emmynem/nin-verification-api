import { DB, USER, PASSWORD, HOST, dialect as _dialect, logging as _logging, pool as _pool, dialectOptions as _dialectOptions, timezone, production } from "../config/db.config.js";
import Sequelize from "sequelize";
import appDefaultsModel from "./appDefaults.model.js";
import usersModel from "./users.model.js";
import logsModel from "./logs.model.js";
import agenciesModel from "./agencies.model.js";
import providersModel from "./providers.model.js";
import verificationsModel from "./verifications.model.js";

const sequelize = new Sequelize(
	DB,
	USER,
	PASSWORD,
	{
		host: HOST,
		dialect: _dialect,
		logging: _logging,
		operatorsAliases: 0,
		pool: {
			max: _pool.max,
			min: _pool.min,
			acquire: _pool.acquire,
			idle: _pool.idle,
			evict: _pool.evict
		},
		dialectOptions: {
			// useUTC: _dialectOptions.useUTC, 
			dateStrings: _dialectOptions.dateStrings,
			typeCast: _dialectOptions.typeCast
		},
		timezone: timezone
	}
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// * Binding models
db.app_defaults = appDefaultsModel(sequelize, Sequelize);
db.agencies = agenciesModel(sequelize, Sequelize);
db.users = usersModel(sequelize, Sequelize);
db.logs = logsModel(sequelize, Sequelize);
db.providers = providersModel(sequelize, Sequelize);
db.verifications = verificationsModel(sequelize, Sequelize);

// End - Binding models

// Associations

//    - Users
db.agencies.hasMany(db.users, { foreignKey: 'agency_unique_id', sourceKey: 'unique_id' });
db.users.belongsTo(db.agencies, { foreignKey: 'agency_unique_id', targetKey: 'unique_id' });

//    - Verifications
// db.agencies.hasMany(db.verifications, { foreignKey: 'agency_unique_id', sourceKey: 'unique_id' });
db.verifications.belongsTo(db.agencies, { foreignKey: 'agency_unique_id', targetKey: 'unique_id' });

//    - Logs
db.users.hasMany(db.logs, { foreignKey: 'user_unique_id', sourceKey: 'unique_id' });
db.logs.belongsTo(db.users, { foreignKey: 'user_unique_id', targetKey: 'unique_id' });

// End - Associations

export default db;
