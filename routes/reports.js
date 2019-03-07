'use strict';

// Reports routes
var Joi               = require('joi');
var config            = require('../config');
var ReportsController = require('../controllers/Reports');

exports.register = function(server, options, next) {
    // Setup the controller
    var reportsController = new ReportsController(options.database);

    // Binds all methods
    // similar to doing `reportsController.index.bind(reportsController);`
    // when declaring handlers
    server.bind(reportsController);

    // Declare routes
    server.route([
        {
            method: 'GET',
            path: '/api/v1/reports',
            config: {
                auth: false,
                handler: reportsController.index,
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
            path: '/api/v1/reports/{id}',
            config: {
                auth: false,
                handler: reportsController.getReportById,
                validate: {
                    params: Joi.object().keys({
                        id: Joi.number().integer().required()
                    }),
                    query: Joi.object().keys({
                        start_date: Joi.string().required(),
                        end_date: Joi.string().required()
                    })
                }
            }
        }
    ]);

    next();
}

exports.register.attributes = {
    name: 'routes-reports',
    version: config.version
};