'use strict';

const Boom           = require('boom');
const CustomersModel = require('../models/Customers');

function CustomersController(database) {
    this.customersModel = new CustomersModel(database);
};

// [GET] /customers
CustomersController.prototype.index = function(request, reply) {

    var start   = request.query.start;
    var limit   = request.query.limit;
    var orderby = request.query.orderby;
    var sorting = request.query.sorting;

    if (start == null) {
        start = 0
    }
    if (limit == null) {
        limit = 0
    }
    if (orderby == null) {
        orderby = "";
    }
    if (sorting == null) {
        sorting = "";
    }

    this.customersModel.setResultLimits(start, limit);
    this.customersModel.setSortingOrder(orderby, sorting);
    this.customersModel.getCustomers(reply);
};

// [GET] /customers/{id}
CustomersController.prototype.show = function(request, reply) {
    try {

        var start   = request.query.start;
        var limit   = request.query.limit;
        var orderby = request.query.orderby;
        var sorting = request.query.sorting;
    
        if (start == null) {
            start = 0
        }
        if (limit == null) {
            limit = 0
        }
        if (orderby == null) {
            orderby = "";
        }
        if (sorting == null) {
            sorting = "";
        }

        this.customersModel.setResultLimits(start, limit);
        this.customersModel.setSortingOrder(orderby, sorting);
        this.customersModel.getCustomer(request.params.id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /customers/{id}/transactions
CustomersController.prototype.transactions = function(request, reply) {
    try {
        var start   = request.query.start;
        var limit   = request.query.limit;
        var orderby = request.query.orderby;
        var sorting = request.query.sorting;

        if (start == null) {
            start = 0
        }
        if (limit == null) {
            limit = 0
        }
        if (orderby == null) {
            orderby = "";
        }
        if (sorting == null) {
            sorting = "";
        }
        
        var id = request.params.id;
        this.customersModel.setResultLimits(start, limit);
        this.customersModel.setSortingOrder(orderby, sorting);
        this.customersModel.getCustomerTransactions(id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /customers/{id}/vehicles
CustomersController.prototype.vehicles = function(request, reply) {
    try {
        this.customersModel.getCustomerVehicles(request.params.id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /customers/search/{prop}/{value}
CustomersController.prototype.search = function(request, reply) {
    try {
        var start   = request.query.start;
        var limit   = request.query.limit;
        var orderby = request.query.orderby;
        var sorting = request.query.sorting;

        if (start == null) {
            start = 0
        }
        if (limit == null) {
            limit = 0
        }
        if (orderby == null) {
            orderby = "";
        }
        if (sorting == null) {
            sorting = "";
        }
        
        var prop  = request.params.prop;
        var value = request.params.value;
        this.customersModel.setResultLimits(start, limit);
        this.customersModel.setSortingOrder(orderby, sorting);
        this.customersModel.findCustomerByProperty(prop, value, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /customers/{id}/addresses
CustomersController.prototype.addresses = function(request, reply) {
    try {
        var start   = request.query.start;
        var limit   = request.query.limit;
        var orderby = request.query.orderby;
        var sorting = request.query.sorting;

        if (start == null) {
            start = 0
        }
        if (limit == null) {
            limit = 0
        }
        if (orderby == null) {
            orderby = "";
        }
        if (sorting == null) {
            sorting = "";
        }
        
        var id = request.params.id;
        this.customersModel.setResultLimits(start, limit);
        this.customersModel.setSortingOrder(orderby, sorting);
        this.customersModel.getCustomerAddresses(id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [POST] /customers/{id}/addresses
CustomersController.prototype.addAddress = function(request, reply) {
    try {
        var address        = {};
        address.firstname  = request.payload.name;
        address.lastname   = request.payload.name;
        address.company    = request.payload.name;
        address.address_1  = request.payload.address_1;
        address.address_2  = (request.payload.address_2) ? request.payload.address_2 : "";
        address.city       = request.payload.city;
        address.postcode   = request.payload.postcode;
        address.region_id  = request.payload.region_id;
        address.country_id = request.payload.country_id;
        this.customersModel.addCustomerAddress(id, address, reply);
    } catch (e) {
        reply(Boom.badRequest(e.message));
    }
};

// [POST] /customers
CustomersController.prototype.store = function(request, reply) {
    try {
        var values          = {};
        values.name         = request.payload.name;
        values.email        = request.payload.email;
        values.telephone    = request.payload.telephone;
        values.fax          = (request.payload.fax) ? request.payload.fax : "";
        values.address_1    = request.payload.address_1;
        values.address_2    = (request.payload.address_2) ? request.payload.address_2 : "";
        values.city         = request.payload.city;
        values.postcode     = request.payload.postcode;
        values.region_id    = request.payload.region_id;
        values.country_id   = request.payload.country_id;
        values.address      = values.address_1+" "+values.address_2+" "+values.city+" "+values.postcode;

        // hard-coded fields/values
        var password             = 'Replogic'; // general initial password
        values.customer_group_id = 1;
        values.store_id          = 0;
        values.language_id       = 1;
        values.address_id        = 0; // will be updated on after the address insert later on (below)
        values.firstname         = values.name;
        values.lastname          = values.name;
        values.newsletter        = 0;
        values.ip                = 0;
        values.custom_field      = "";
        values.status            = 1;
        values.approved          = 0;
        values.safe              = 0;
        values.token             = "";
        values.code              = "";
        
        this.customersModel.addCustomer(values, reply);
    } catch (e) {
        reply(Boom.badRequest(e.message));
    }
};

// [PUT] /customers/{id}
CustomersController.prototype.update = function(request, reply) {
    try {
        var customer        = {};
        var id              = request.params.id;
        customer.email      = request.payload.email;
        customer.telephone  = request.payload.telephone;
        customer.fax        = (request.payload.fax) ? request.payload.fax : "";
        customer.address_id = request.payload.address_id;
        customer.address_1  = request.payload.address_1;
        customer.address_2  = (request.payload.address_2) ? request.payload.address_2 : "";
        customer.city       = request.payload.city;
        customer.postcode   = request.payload.postcode;
        customer.region_id  = request.payload.region_id;
        customer.country_id = request.payload.country_id;
        this.customersModel.updateCustomer(id, customer, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [DELETE] /customers/{id}
CustomersController.prototype.destroy = function(request, reply) {
    try {
        var id = request.params.id;
        this.customersModel.deleteCustomer(id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

module.exports = CustomersController;
