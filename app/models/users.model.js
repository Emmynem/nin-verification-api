import { db_end, db_start } from "../config/config";
import agenciesModel from "./agencies.model.js";
import providersModel from "./providers.model.js";

export default (sequelize, Sequelize) => {

	const agencies = agenciesModel(sequelize, Sequelize);
	const providers = providersModel(sequelize, Sequelize);

	const users = sequelize.define("user", {
		id: {
			type: Sequelize.BIGINT,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true
		},
		unique_id: {
			type: Sequelize.STRING(40),
			allowNull: false,
			unique: true
		},
		type: {
			type: Sequelize.STRING(20),
			allowNull: false,
		},
		agency_unique_id: {
			type: Sequelize.STRING(40),
			allowNull: true,
			references: {
				model: agencies,
				key: "unique_id"
			}
		},
		provider_unique_id: {
			type: Sequelize.STRING(40),
			allowNull: true,
			references: {
				model: providers,
				key: "unique_id"
			}
		},
		fullname: {
			type: Sequelize.STRING(300),
			allowNull: false,
		},
		email: {
			type: Sequelize.STRING(255),
			allowNull: false
		},
		role: {
			type: Sequelize.STRING(20),
			allowNull: true,
		},
		login_timestamp: {
			type: Sequelize.DATE,
			allowNull: true,
		},
		privates: {
			type: Sequelize.STRING(255),
			allowNull: false,
		},
		access: {
			type: Sequelize.INTEGER(1),
			allowNull: false,
		},
		status: {
			type: Sequelize.INTEGER(1),
			allowNull: false,
		}
	}, {
		tableName: `${db_start}users${db_end}`
	});
	return users;
};