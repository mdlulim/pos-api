'use strict';

// Transactions routes
var Joi                = require('joi');
var config             = require('../config');
var DevicesController = require('../controllers/Devices');

exports.register = function(server, options, next) {
    // Setup the controller
    var devicesController = new DevicesController(options.database);

    // Binds all methods
    // similar to doing `devicesController.index.bind(devicesController);`
    // when declaring handlers
    server.bind(devicesController);

    // Declare routes
    server.route([
        {
            method: 'GET',
            path: '/api/v1/devices',
            config: {
                auth: false,
                handler: devicesController.index,
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
            path: '/api/v1/devices/{id}',
            config: {
                auth: false,
                handler: devicesController.show,
                validate: {
                    params: Joi.object().keys({
                        id: Joi.number().required()
                    })
                }
            }
        }
    ]);

    next();
}

exports.register.attributes = {
    name: 'routes-devices',
    version: config.version
};