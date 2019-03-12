'use strict';

const Boom         = require('boom');
const DevicesModel = require('../models/Devices');

function DevicesController(database) {
    this.devicesModel = new DevicesModel(database);
};

// [GET] /devices
DevicesController.prototype.index = function(request, reply) {
    try {
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
        
        this.devicesModel.setResultLimits(start, limit);
        this.devicesModel.setSortingOrder(orderby, sorting);
        this.devicesModel.getDevices(reply);
    } catch (e) {
        reply(Boom.badRequest(e.message));
    }
};

// [GET] /devices/{id}
DevicesController.prototype.show = function(request, reply) {
    try {
        this.devicesModel.getDevice(request.params.id, reply);
    } catch (e) {
        reply(Boom.badRequest(e.message));
    }
};

module.exports = DevicesController;