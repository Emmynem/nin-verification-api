import { db_end, db_start } from "../config/config";
import usersModel from "./users.model.js";

export default (sequelize, Sequelize) => {

    const users = usersModel(sequelize, Sequelize);

    const logs = sequelize.define("log", {
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
        user_unique_id: {
            type: Sequelize.STRING(40),
            allowNull: true,
            references: {
                model: users,
                key: "unique_id"
            }
        },
        type: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        action: {
            type: Sequelize.STRING(200),
            allowNull: false,
        },
        details: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        expiry_date: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
        }
    }, {
        tableName: `${db_start}logs${db_end}`
    });
    return logs;
};