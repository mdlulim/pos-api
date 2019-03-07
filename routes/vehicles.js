'use strict';

// Transactions routes
var Joi                = require('joi');
var config             = require('../config');
var VehiclesController = require('../controllers/Vehicles');

exports.register = function(server, options, next) {
    // Setup the controller
    var vehiclesController = new VehiclesController(options.database);

    // Binds all methods
    // similar to doing `vehiclesController.index.bind(vehiclesController);`
    // when declaring handlers
    server.bind(vehiclesController);

    // Declare routes
    server.route([
        {
            method: 'GET',
            path: '/api/v1/vehicles',
            config: {
                auth: false,
                handler: vehiclesController.index,
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
            path: '/api/v1/vehicles/{id}',
            config: {
                auth: false,
                handler: vehiclesController.show,
                validate: {
                    params: Joi.object().keys({
                        id: Joi.number().required()
                    })
                }
            }
        },
        {
            method : 'POST',
            path   : '/api/v1/vehicles',
            config : {
                auth: false,
                handler  : vehiclesController.store,
                validate : {
                    payload : Joi.object().keys({
                        customer_id     : Joi.number().integer().required(),
                        drivers_license : Joi.string().required(),
                        reg_number      : Joi.string().required(),
                        make            : Joi.string().required(),
                        model           : Joi.string().required(),
                        style           : Joi.string().allow('').allow(null).optional(),
                        colour          : Joi.string().required(),
                        vin_number      : Joi.string().allow('').allow(null).optional(),
                        options         : Joi.string().allow('').allow(null).optional()
                    })
                }
            }
        }
    ]);

    next();
}

exports.register.attributes = {
    name: 'routes-vehicles',
    version: config.version
};