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
        }
    ]);

    next();
}

exports.register.attributes = {
    name: 'routes-transactions',
    version: config.version
};