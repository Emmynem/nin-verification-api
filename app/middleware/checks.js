import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import { UnauthorizedError, ForbiddenError } from '../common/index.js';
import db from "../models/index.js";
import {
    access_granted, access_suspended, default_delete_status, ninvs_header_key, ninvs_header_token, tag_root, api_keys,
    user_types
} from "../config/config.js";

dotenv.config();

const { secret } = process.env;

const { verify } = jwt;

const USERS = db.users;

const verifyKey = (req, res, next) => {
    const key = req.headers[ninvs_header_key] || req.query.key || req.body.key || '';
    if (!key) {
        ForbiddenError(res, "No key provided!", null);
    } else if (!api_keys.includes(key)) {
        UnauthorizedError(res, "Invalid API Key!", null);
    } else {
        req.API_KEY = key;
        next();
    }
};

const verifyToken = (req, res, next) => {
    let token = req.headers[ninvs_header_token] || req.query.token || req.body.token || '';
    if (!token) {
        ForbiddenError(res, "No token provided!", null);
    } else {
        verify(token, secret, (err, decoded) => {
            if (err) {
                UnauthorizedError(res, "Unauthorized!", null);
            } else {
                if (!decoded.user_unique_id) {
                    UnauthorizedError(res, "Invalid token!", null);
                } else {
                    req.USER_UNIQUE_ID = decoded.user_unique_id;
                    next();
                }
            }
        });
    }
};

const verifyAgencyToken = (req, res, next) => {
    let token = req.headers[ninvs_header_token] || req.query.token || req.body.token || '';
    if (!token) {
        ForbiddenError(res, "No token provided!", null);
    } else {
        verify(token, secret, (err, decoded) => {
            if (err) {
                UnauthorizedError(res, "Unauthorized!", null);
            } else {
                if (!decoded.user_unique_id) {
                    UnauthorizedError(res, "Invalid token!", null);
                } else {
                    req.USER_UNIQUE_ID = decoded.user_unique_id;
                    req.AGENCY_UNIQUE_ID = decoded.agency_unique_id;
                    next();
                }
            }
        });
    }
};

const verifyProviderToken = (req, res, next) => {
    let token = req.headers[ninvs_header_token] || req.query.token || req.body.token || '';
    if (!token) {
        ForbiddenError(res, "No token provided!", null);
    } else {
        verify(token, secret, (err, decoded) => {
            if (err) {
                UnauthorizedError(res, "Unauthorized!", null);
            } else {
                if (!decoded.user_unique_id) {
                    UnauthorizedError(res, "Invalid token!", null);
                } else {
                    req.USER_UNIQUE_ID = decoded.user_unique_id;
                    req.PROVIDER_UNIQUE_ID = decoded.provider_unique_id;
                    next();
                }
            }
        });
    }
};

const isUser = (req, res, next) => {
    USERS.findOne({
        where: {
            unique_id: req.USER_UNIQUE_ID
        }
    }).then(user => {
        if (!user) {
            ForbiddenError(res, "Require User!", null);
        } else if (user.status === default_delete_status) {
            ForbiddenError(res, "User not available!", null);
        } else if (user.access != access_granted) {
            const err = user.access === access_suspended ? "Access is suspended" : "Access is revoked";
            ForbiddenError(res, err, null);
        } else {
            req.body.user_unique_id = user.unique_id;
            next();
        }
    });
};

const isAgencyUser = (req, res, next) => {
    USERS.findOne({
        where: {
            type: user_types.agency,
            unique_id: req.USER_UNIQUE_ID,
            agency_unique_id: req.AGENCY_UNIQUE_ID
        }
    }).then(user => {
        if (!user) {
            ForbiddenError(res, "Require User!", null);
        } else if (user.status === default_delete_status) {
            ForbiddenError(res, "User not available!", null);
        } else if (user.access != access_granted) {
            const err = user.access === access_suspended ? "Access is suspended" : "Access is revoked";
            ForbiddenError(res, err, null);
        } else {
            req.body.user_unique_id = user.unique_id;
            next();
        }
    });
};

const isProviderUser = (req, res, next) => {
    USERS.findOne({
        where: {
            type: user_types.provider,
            unique_id: req.USER_UNIQUE_ID,
            provider_unique_id: req.PROVIDER_UNIQUE_ID
        }
    }).then(user => {
        if (!user) {
            ForbiddenError(res, "Require User!", null);
        } else if (user.status === default_delete_status) {
            ForbiddenError(res, "User not available!", null);
        } else if (user.access != access_granted) {
            const err = user.access === access_suspended ? "Access is suspended" : "Access is revoked";
            ForbiddenError(res, err, null);
        } else {
            req.body.user_unique_id = user.unique_id;
            next();
        }
    });
};

const isCitizenUser = (req, res, next) => {
    USERS.findOne({
        where: {
            type: user_types.citizen,
            unique_id: req.USER_UNIQUE_ID,
        }
    }).then(user => {
        if (!user) {
            ForbiddenError(res, "Require User!", null);
        } else if (user.status === default_delete_status) {
            ForbiddenError(res, "User not available!", null);
        } else if (user.access != access_granted) {
            const err = user.access === access_suspended ? "Access is suspended" : "Access is revoked";
            ForbiddenError(res, err, null);
        } else {
            req.body.user_unique_id = user.unique_id;
            next();
        }
    });
};

export default {
    verifyKey, verifyToken, verifyAgencyToken, verifyProviderToken, isUser, isAgencyUser, isProviderUser, isCitizenUser };