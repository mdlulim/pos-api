'use strict';

// Users routes
var Joi             = require('joi');
var config          = require('../config');
var UsersController = require('../controllers/Users');

exports.register = function(server, options, next) {
    // Setup the controller
    var usersController = new UsersController(options.database);

    // Binds all methods
    // similar to doing `usersController.index.bind(usersController);`
    // when declaring handlers
    server.bind(usersController);

    // Declare routes
    server.route([
        {
            method: 'GET',
            path: '/api/v1/users',
            config: {
                handler: usersController.index,
                validate: {
                    query: Joi.object().keys({
                        start: Joi.number().min(0),
                        limit: Joi.number().min(1),
                        orderby: Joi.string(),
                        sorting: Joi.string()
                    })
                }
            }
        },
        {
            method: 'GET',
            path: '/api/v1/users/{id}',
            config: {
                handler: usersController.show,
                validate: {
                    params: {
                        id: Joi.number().integer().min(1).required()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: '/api/v1/users/search/{prop}/{value}',
            config: {
                handler: usersController.search,
                auth: false,
                validate: {
                    params: {
                        prop: Joi.string().required(),
                        value: Joi.string().required()
                    },
                    query: Joi.object().keys({
                        start: Joi.number().min(0),
                        limit: Joi.number().min(1),
                        orderby: Joi.string(),
                        sorting: Joi.string()
                    })
                }
            }
        },
        {
            method: 'POST',
            path: '/api/v1/users',
            config: {
                handler: usersController.store,
                validate: {
                    payload: Joi.object().length(5).keys({
                        group: Joi.number().integer().required(),
                        username: Joi.string().required().min(6).max(60),
                        firstname: Joi.string().required(),
                        lastname: Joi.string().required(),
                        email: Joi.string().email().required(),
                        code: Joi.string().allow(null).allow('').optional(),
                        ip: Joi.string().required()
                    })
                }
            }
        },
        {
            method: 'PUT',
            path: '/api/v1/users/{id}',
            config: {
                handler: usersController.update,
                validate: {
                    params: {
                        id: Joi.number().integer().required()
                    },
                    payload: Joi.object().length(1).keys({
                        email: Joi.string().email().required()
                    })
                }
            }
        },
        {
            method: 'POST',
            path: '/api/v1/users/resetpassword',
            config: {
                handler: usersController.resetpassword,
                auth: false,
                validate: {
                    payload: Joi.object().length(1).keys({
                        email: Joi.string().email().required()
                    })
                }
            }
        },
        {
            method: 'POST',
            path: '/api/v1/users/changepassword',
            config: {
                handler: usersController.changepassword,
                auth: false,
                validate: {
                    payload: Joi.object().keys({
                        user_id: Joi.number().integer().required(),
                        old_password: Joi.string().min(6).max(60).required(),
                        new_password: Joi.string().min(6).max(60).required()
                    })
                }
            }
        },
        {
            method: 'POST',
            path: '/api/v1/users/login',
            config: {
                handler: usersController.login,
                auth: false,
                validate: {
                    payload: Joi.object().length(2).keys({
                        username: Joi.string().required(),
                        password: Joi.string().required()
                    })
                }
            }
        },
        {
            method: 'DELETE',
            path: '/api/v1/users/{id}',
            config: {
                handler: usersController.destroy,
                validate: {
                    params: {
                        id: Joi.number().integer().required()
                    }
                }
            }
        }
    ]);

    next();
}

exports.register.attributes = {
    name: 'routes-users',
    version: config.version
};
