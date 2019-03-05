'use strict';

const Boom              = require('boom');
const TransactionsModel = require('../models/Transactions');

function TransactionsController(database) {
    this.transactionsModel = new TransactionsModel(database);
};

// [GET] /transactions
TransactionsController.prototype.index = function(request, reply) {

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
    
    this.transactionsModel.setResultLimits(start, limit);
    this.transactionsModel.setSortingOrder(orderby, sorting);
    this.transactionsModel.getTransactions(reply);
};

// [GET] /transactions/{id}
TransactionsController.prototype.show = function(request, reply) {
    try {
        var id = request.params.id;
        this.transactionsModel.getTransaction(id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /transactions/search/{prop}/{value}
TransactionsController.prototype.search = function(request, reply) {
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

        var prop = request.params.prop;
        var value = request.params.value;
        this.transactionsModel.setResultLimits(start, limit);
        this.transactionsModel.setSortingOrder(orderby, sorting);
        this.transactionsModel.findTransactionByProperty(prop, value, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [POST] /transactions
TransactionsController.prototype.store = function(request, reply) {
    try {
        this.transactionsModel.storeTransaction(request.payload, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

module.exports = TransactionsController;