import { db_end, db_start } from "../config/config";
import agenciesModel from "./agencies.model.js";
import providersModel from "./providers.model.js";

export default (sequelize, Sequelize) => {

	const agencies = agenciesModel(sequelize, Sequelize);
	const providers = providersModel(sequelize, Sequelize);

	const verifications = sequelize.define("verification", {
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
		type: {
			type: Sequelize.STRING(100),
			allowNull: false,
		},
		identification_id: {
			type: Sequelize.STRING(20),
			allowNull: true,
		},
		title: {
			type: Sequelize.STRING(20),
			allowNull: true,
		},
		firstname: {
			type: Sequelize.STRING(100),
			allowNull: true,
		},
		middlename: {
			type: Sequelize.STRING(100),
			allowNull: true,
		},
		lastname: {
			type: Sequelize.STRING(100),
			allowNull: true,
		},
		email: {
			type: Sequelize.STRING(255),
			allowNull: true
		},
		phone_number: {
			type: Sequelize.STRING(20),
			allowNull: true
		},
		alt_phone_number: {
			type: Sequelize.STRING(20),
			allowNull: true,
		},
		gender: {
			type: Sequelize.STRING(20),
			allowNull: true,
		},
		date_of_birth: {
			type: Sequelize.STRING(20),
			allowNull: true,
		},
		address: {
			type: Sequelize.STRING(300),
			allowNull: true,
		},
		nationality: {
			type: Sequelize.STRING(50),
			allowNull: true,
		},
		state_of_origin: {
			type: Sequelize.STRING(50),
			allowNull: true,
		},
		state_of_residence: {
			type: Sequelize.STRING(50),
			allowNull: true,
		},
		nin: {
			type: Sequelize.STRING(20),
			allowNull: true,
		},
		bvn: {
			type: Sequelize.STRING(20),
			allowNull: true,
		},
		vnin: {
			type: Sequelize.STRING(50),
			allowNull: true,
		},
		enrollment_bank: {
			type: Sequelize.STRING(200),
			allowNull: true,
		},
		enrollment_branch: {
			type: Sequelize.STRING(200),
			allowNull: true,
		},
		level_of_account: {
			type: Sequelize.STRING(200),
			allowNull: true,
		},
		lga_of_origin: {
			type: Sequelize.STRING(200),
			allowNull: true,
		},
		lga_of_residence: {
			type: Sequelize.STRING(200),
			allowNull: true,
		},
		marital_status: {
			type: Sequelize.STRING(200),
			allowNull: true,
		},
		name_on_card: {
			type: Sequelize.STRING(300),
			allowNull: true,
		},
		registration_date: {
			type: Sequelize.STRING(20),
			allowNull: true,
		},
		religion: {
			type: Sequelize.STRING(50),
			allowNull: true,
		},
		height: {
			type: Sequelize.STRING(50),
			allowNull: true,
		},
		educational_level: {
			type: Sequelize.STRING(200),
			allowNull: true,
		},
		employment_status: {
			type: Sequelize.STRING(200),
			allowNull: true,
		},
		nok_firstname: {
			type: Sequelize.STRING(200),
			allowNull: true,
		},
		nok_middlename: {
			type: Sequelize.STRING(200),
			allowNull: true,
		},
		nok_surname: {
			type: Sequelize.STRING(200),
			allowNull: true,
		},
		nok_state: {
			type: Sequelize.STRING(200),
			allowNull: true,
		},
		nok_lga: {
			type: Sequelize.STRING(200),
			allowNull: true,
		},
		nok_town: {
			type: Sequelize.STRING(200),
			allowNull: true,
		},
		nok_postalcode: {
			type: Sequelize.STRING(200),
			allowNull: true,
		},
		nok_address_1: {
			type: Sequelize.STRING(200),
			allowNull: true,
		},
		nok_address_2: {
			type: Sequelize.STRING(200),
			allowNull: true,
		},
		native_spoken_lang: {
			type: Sequelize.STRING(200),
			allowNull: true,
		},
		other_spoken_lang: {
			type: Sequelize.STRING(200),
			allowNull: true,
		},
		profession: {
			type: Sequelize.STRING(200),
			allowNull: true,
		},
		watch_listed: {
			type: Sequelize.STRING(10),
			allowNull: true,
		},
		photo: {
			type: Sequelize.TEXT,
			allowNull: true,
		},
		base_64_image: {
			type: Sequelize.TEXT,
			allowNull: true,
		},
		verification_reference: {
			type: Sequelize.STRING(200),
			allowNull: true,
		},
		verification_status: {
			type: Sequelize.STRING(200),
			allowNull: true,
		},
		verification_endpoint: {
			type: Sequelize.STRING(200),
			allowNull: true,
		},
		status: {
			type: Sequelize.INTEGER(1),
			allowNull: false,
		}
	}, {
		tableName: `${db_start}verifications${db_end}`
	});
	return verifications;
};
