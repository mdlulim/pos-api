'use strict';

const Boom          = require('boom');
const VehiclesModel = require('../models/Vehicles');

function VehicleController(database) {
    this.vehiclesModel = new VehiclesModel(database);
};

// [GET] /vehicles
VehicleController.prototype.index = function(request, reply) {

    var start = request.query.start;
    var limit = request.query.limit;
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
    
    this.vehiclesModel.setResultLimits(start, limit);
    this.vehiclesModel.setSortingOrder(orderby, sorting);
    this.vehiclesModel.getVehicles(reply);
};

// [GET] /vehicles/{id}
VehicleController.prototype.show = function(request, reply) {
    try {
        this.vehiclesModel.getVehicle(request.params.id, reply);
    } catch (e) {
        reply(Boom.badRequest(e.message));
    }
};

// [POST] /vehicles
VehicleController.prototype.store = function(request, reply) {
    try {
        this.vehiclesModel.addVehicle(request.payload, reply);
    } catch (e) {
        reply(Boom.badRequest(e.message));
    }
};

module.exports = VehicleController;