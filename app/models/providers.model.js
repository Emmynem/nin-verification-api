import { db_end, db_start, zero } from "../config/config";

export default (sequelize, Sequelize) => {

	const providers = sequelize.define("provider", {
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
		name: {
			type: Sequelize.STRING(100),
			allowNull: false,
		},
		type: {
			type: Sequelize.STRING(50),
			allowNull: false,
		},
		access_timestamp: {
			type: Sequelize.DATE,
			allowNull: true,
		},
		usage: {
			type: Sequelize.BIGINT,
			allowNull: false,
			defaultValue: zero
		},
		status: {
			type: Sequelize.INTEGER(1),
			allowNull: false,
		}
	}, {
		tableName: `${db_start}providers${db_end}`
	});
	return providers;
};
