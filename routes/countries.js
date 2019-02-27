'use strict';

// Countries routes
var Joi                 = require('joi');
var config              = require('../config');
var CountriesController = require('../controllers/Countries');

exports.register = function(server, options, next) {
    // Setup the controller
    var countriesController = new CountriesController(options.database);

    // Binds all methods
    // similar to doing `countriesController.index.bind(countriesController);`
    // when declaring handlers
    server.bind(countriesController);

    // Declare routes
    server.route([
        {
            method: 'GET',
            path: '/api/v1/countries',
            config: {
                handler: countriesController.index,
                auth: false,
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
            path: '/api/v1/countries/{id}',
            config: {
                handler: countriesController.show,
                auth: false,
                validate: {
                    params: {
                        id: Joi.number().integer().min(1).required()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: '/api/v1/countries/search/{prop}/{value}',
            config: {
                handler: countriesController.search,
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
            method: 'GET',
            path: '/api/v1/countries/{id}/provinces',
            config: {
                handler: countriesController.provinces,
                auth: false,
                validate: {
                    params: {
                        id: Joi.number().integer().min(1).required()
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
    name: 'routes-countries',
    version: config.version
};