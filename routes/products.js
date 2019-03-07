'use strict';

// Appointments routes
var Joi                = require('joi');
var config             = require('../config');
var ProductsController = require('../controllers/Products');

exports.register = function(server, options, next) {
    // Setup the controller
    var productsController = new ProductsController(options.database);

    // Binds all methods
    // similar to doing `productsController.index.bind(productsController);`
    // when declaring handlers
    server.bind(productsController);

    // Declare routes
    server.route([
        {
            method: 'GET',
            path: '/api/v1/products',
            config: {
                auth: false,
                handler: productsController.index
            }
        },
        {
            method: 'GET',
            path: '/api/v1/products/{id}',
            config: {
                handler: productsController.show,
                validate: {
                    params: {
                        id: Joi.number().integer().min(1).required()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: '/api/v1/products/search/{prop}/{value}',
            config: {
                handler: productsController.search,
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
            method: 'GET',
            path: '/api/v1/products/categories',
            config: {
                handler: productsController.categories,
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
            path: '/api/v1/products/categories/{category_id}',
            config: {
                handler: productsController.productsByCategory,
                validate: {
                    params: {
                        category_id: Joi.number().integer().min(1).required()
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
            path: '/api/v1/products/import',
            config: {
                auth: false,
                handler: productsController.import,
                validate: {
                    payload: Joi.object().keys({
                        products: Joi.object().required()
                    })
                }
            }
        }
    ]);

    next();
}

exports.register.attributes = {
    name: 'routes-products',
    version: config.version
};
