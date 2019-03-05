'use strict';

// Transactions routes
var Joi                    = require('joi');
var config                 = require('../config');
var TransactionsController = require('../controllers/transactions');

exports.register = function(server, options, next) {
    // Setup the controller
    var transactionsController = new TransactionsController(options.database);

    // Binds all methods
    // similar to doing `transactionsController.index.bind(transactionsController);`
    // when declaring handlers
    server.bind(transactionsController);

    // Declare routes
    server.route([
        {
            method: 'GET',
            path: '/api/v1/transactions',
            config: {
                auth: false,
                handler: transactionsController.index,
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
            path: '/api/v1/transactions/{id}',
            config: {
                auth: false,
                handler: transactionsController.show,
                validate: {
                    params: {
                        id: Joi.number().integer().min(1).required()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: '/api/v1/transactions/search/{prop}/{value}',
            config: {
                auth: false,
                handler: transactionsController.search,
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
            path: '/api/v1/transctions',
            config: {
                auth: false,
                handler: transactionsController.store,
                validate: {
                    payload: Joi.object().keys({
                        customer_id: Joi.number().integer().required(),
                        customer_group_id: Joi.number().integer().required(),
                        firstname: Joi.string().required(),
                        lastname: Joi.string().required(),
                        email: Joi.string().email().required(),
                        telephone: Joi.string().min(10).required(),
                        fax: Joi.string().min(10).allow('').allow(null).optional(),
                        comment: Joi.string().allow('').allow(null).optional(),
                        total: Joi.number().integer().required(),
                        user_id: Joi.number().integer().required(),
                        products: Joi.array().required(),
                        payment_details: Joi.object().required()
                    })
                }
            }
        }
    ]);

    next();
}

exports.register.attributes = {
    name: 'routes-transactions',
    version: config.version
};