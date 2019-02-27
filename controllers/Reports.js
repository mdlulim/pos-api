'use strict';

const Boom         = require('boom');
const ReportsModel = require('../models/Reports');

function ReportsController(database) {
    this.reportsModel = new ReportsModel(database);
};

// [GET] /reports
ReportsController.prototype.index = function(request, reply) {
    try {
        var start = request.query.start;
        var limit = request.query.limit;
    
        if (start == null) {
            start = 0
        }
        if (limit == null) {
            limit = 25
        }
        
        this.reportsModel.setResultLimits(start, limit);
        this.reportsModel.getReports(reply);

    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /reports/{id}
ReportsController.prototype.getReportById = function(request, reply) {
    try {
        this.reportsModel.setFilters(request.query);
        this.reportsModel.getReportById(request.params.id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

module.exports = ReportsController;