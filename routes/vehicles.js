'use strict';

// Transactions routes
var Joi                = require('joi');
var config             = require('../config');
var VehiclesController = require('../controllers/vehicles');

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
        }
    ]);

    next();
}

exports.register.attributes = {
    name: 'routes-vehicles',
    version: config.version
};