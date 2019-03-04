'use strict';

const Boom          = require('boom');
const ProductsModel = require('../models/products');

function ProductsController(database) {
    this.productsModel = new ProductsModel(database);
};

// [GET] /products
ProductsController.prototype.index = function(request, reply) {
    try {

        var start     = request.query.start;
        var limit     = request.query.limit;
        var orderby   = request.query.orderby;
        var sorting   = request.query.sorting;
    
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
    
        this.productsModel.setResultLimits(start, limit);
        this.productsModel.setSortingOrder(orderby, sorting);
        this.productsModel.getProducts(reply);

    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /products/{id}
ProductsController.prototype.show = function(request, reply) {
    try {
        var id = request.params.id;
        this.productsModel.getProduct(id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /products/search/{prop}/{value}
ProductsController.prototype.search = function(request, reply) {
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
        this.productsModel.setResultLimits(start, limit);
        this.productsModel.setSortingOrder(orderby, sorting);
        this.productsModel.findProductByProperty(prop, value, reply);

    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /products/categories
ProductsController.prototype.categories = function(request, reply) {

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

        this.productsModel.setResultLimits(start, limit);
        this.productsModel.setSortingOrder(orderby, sorting);
        this.productsModel.getProductCategories(reply);

    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /products/categories/{category_id}
ProductsController.prototype.productsByCategory = function(request, reply) {
    try {
        
        var start     = request.query.start;
        var limit     = request.query.limit;
        var orderby   = request.query.orderby;
        var sorting   = request.query.sorting;

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

        this.productsModel.setResultLimits(start, limit);
        this.productsModel.setSortingOrder(orderby, sorting);
        this.productsModel.getProductsByCategory(request.params.category_id, reply);

    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /products/import
ProductsController.prototype.import = function(request, reply) {
    try {
        this.productsModel.import(request.payload.products, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

module.exports = ProductsController;
