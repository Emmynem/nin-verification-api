import { db_end, db_start, zero } from "../config/config";

export default (sequelize, Sequelize) => {

	const agencies = sequelize.define("agency", {
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
		sync_timestamp: {
			type: Sequelize.DATE,
			allowNull: true,
		},
		verifications: {
			type: Sequelize.BIGINT,
			allowNull: false,
			defaultValue: zero
		},
		status: {
			type: Sequelize.INTEGER(1),
			allowNull: false,
		}
	}, {
		tableName: `${db_start}agencies${db_end}`
	});
	return agencies;
};
