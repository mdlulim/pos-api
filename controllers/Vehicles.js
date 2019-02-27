'use strict';

const Boom          = require('boom');
const VehiclesModel = require('../models/Vehicles');

function VehicleController(database) {
    this.vehiclesModel = new VehiclesModel(database);
};

// [GET] /{company_id}/vehicles
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

module.exports = VehicleController;