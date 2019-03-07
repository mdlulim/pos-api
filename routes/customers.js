'use strict';

// Customers routes
var Joi                 = require('joi');
var config              = require('../config');
var CustomersController = require('../controllers/Customers');

exports.register = function(server, options, next) {
    // Setup the controller
    var customersController = new CustomersController(options.database);

    // Binds all methods
    // similar to doing `customersController.index.bind(customersController);`
    // when declaring handlers
    server.bind(customersController);

    // Declare routes
    server.route([
        {
            method : 'GET',
            path   : '/api/v1/customers',
            config : {
                auth: false,
                handler  : customersController.index,
                validate : {
                    query : Joi.object().keys({
                        start   : Joi.number().min(0),
                        limit   : Joi.number().min(1),
                        orderby : Joi.string(),
                        sorting : Joi.string()
                    })
                }
            }
        },
        {
            method : 'GET',
            path   : '/api/v1/customers/{id}',
            config : {
                auth: false,
                handler  : customersController.show,
                validate : {
                    params : {
                        id : Joi.number().integer().min(1).required()
                    }
                }
            }
        },
        {
            method : 'GET',
            path   : '/api/v1/customers/{id}/addresses',
            config : {
                handler  : customersController.addresses,
                validate : {
                    params : {
                        id : Joi.number().integer().min(1).required()
                    }
                }
            }
        },
        {
            method : 'GET',
            path   : '/api/v1/customers/{id}/transactions',
            config : {
                handler  : customersController.transactions,
                validate : {
                    params : {
                        id : Joi.number().integer().min(1).required()
                    },
                    query : Joi.object().keys({
                        start   : Joi.number().min(0),
                        limit   : Joi.number().min(1),
                        orderby : Joi.string(),
                        sorting : Joi.string()
                    })
                }
            }
        },
        {
            method : 'GET',
            path   : '/api/v1/customers/{id}/vehicles',
            config : {
                auth: false,
                handler  : customersController.vehicles,
                validate : {
                    params : {
                        id : Joi.number().integer().min(1).required()
                    }
                }
            }
        },
        {
            method : 'GET',
            path   : '/api/v1/customers/search/{prop}/{value}',
            config : {
                handler  : customersController.search,
                validate : {
                    params : {
                        prop  : Joi.string().required(),
                        value : Joi.string().required()
                    },
                    query : Joi.object().keys({
                        start   : Joi.number().min(0),
                        limit   : Joi.number().min(1),
                        orderby : Joi.string(),
                        sorting : Joi.string()
                    })
                }
            }
        },
        {
            method : 'POST',
            path   : '/api/v1/customers/{id}/addresses',
            config : {
                handler  : customersController.addAddress,
                validate : {
                    params : Joi.object().keys({
                        id : Joi.number().integer().required()
                    }),
                    payload : Joi.object().keys({
                        name         : Joi.string().required(),
                        address_1    : Joi.string().required(),
                        address_2    : Joi.string().allow('').allow('').allow(null).optional(),
                        city         : Joi.string().required(),
                        postcode     : Joi.string().required(),
                        region_id    : Joi.number().integer().required(),
                        country_id   : Joi.number().integer().required()
                    })
                }
            }
        },
        {
            method : 'POST',
            path   : '/api/v1/customers',
            config : {
                handler  : customersController.store,
                validate : {
                    payload : Joi.object().keys({
                        name         : Joi.string().required(),
                        email        : Joi.string().email().required(),
                        telephone    : Joi.string().required(),
                        fax          : Joi.string().allow('').allow('').allow(null).optional(),
                        address_1    : Joi.string().required(),
                        address_2    : Joi.string().allow('').allow('').allow(null).optional(),
                        city         : Joi.string().required(),
                        postcode     : Joi.string().required(),
                        province     : Joi.string().allow('').allow('').allow(null).optional(),
                        region_id    : Joi.number().integer().required(),
                        country_id   : Joi.number().integer().required()
                    })
                }
            }
        },
        {
            method : 'PUT',
            path   : '/api/v1/customers/{id}',
            config : {
                handler  : customersController.update,
                validate : {
                    params : {
                        id : Joi.number().integer().required()
                    },
                    payload : Joi.object().keys({
                        email       : Joi.string().email().required(),
                        telephone   : Joi.string().required(),
                        fax         : Joi.string().allow('').allow(null).optional(),
                        address_id  : Joi.number().integer().required(),
                        address_1   : Joi.string().required(),
                        address_2   : Joi.string().allow('').allow(null).optional(),
                        city        : Joi.string().required(),
                        postcode    : Joi.string().required(),
                        region_id   : Joi.number().integer().required(),
                        country_id  : Joi.number().integer().required()
                    })
                }
            }
        },
        {
            method : 'DELETE',
            path   : '/api/v1/customers/{id}',
            config : {
                handler  : customersController.destroy,
                validate : {
                    params : {
                        id : Joi.number().integer().required()
                    }
                }
            }
        }
    ]);

    next();
}

exports.register.attributes = {
    name    : 'routes-customers',
    version : config.version
};
