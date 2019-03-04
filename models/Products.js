'use strict';

const config     = require('../config');
const MySQL      = require('mysql');
const connection = MySQL.createConnection({
    host    : config.database.host,
    user    : config.database.user,
    password: config.database.pass,
    database: config.database.name
});
connection.connect();

/**
 * Model constructor
 * @param  {object}     database
 */
function ProductsModel(database) {
    this.db         = database;
    this.start      = 0;
    this.limit      = 0;
    this.orderby    = "";
    this.sorting    = "";
    this.dbprefix   = `${config.database.name}.${config.database.prefix}`;
};

/**
 * Set result limit. Define starting index and limit
 * @param  {number}     start
 * @param  {number}     limit
 */
ProductsModel.prototype.setResultLimits = function(start, limit) {
    this.start = start;
    this.limit = limit;
};

/**
 * Set result order-by. Define order-by [field] and sorting
 * @param  {number}     orderby
 * @param  {number}     sorting
 */
ProductsModel.prototype.setSortingOrder = function(orderby, sorting) {
    this.orderby = orderby;
    this.sorting = sorting;
};

/**
 * Get products
 * @param  {function}   reply
 * @return {object}
 */
ProductsModel.prototype.getProducts = function(reply) {
    var select = `pr.product_id,pr.sku,pr.stock_status_id,pd.name,pd.description,pr.price,pr.image,pr.tax_class_id,`;
    select    += `tr.name AS tax_rate_name,tr.rate AS tax_rate,tr.type AS tax_rate_type,IF(pr.tax_class_id!=0, pr.price * tr.rate / 100, 0) AS tax`;
    this.db.select(select);
    this.db.from(`${this.dbprefix}product pr`);
    this.db.join(`${this.dbprefix}product_description pd ON pd.product_id=pr.product_id`);
    this.db.join(`${this.dbprefix}product_to_customer_group pc ON pc.product_id=pr.product_id`);
    this.db.join(`${this.dbprefix}tax_rate_to_customer_group t2c ON t2c.customer_group_id=pc.customer_group_id`, `LEFT`);
    this.db.join(`${this.dbprefix}tax_rate tr ON tr.tax_rate_id=t2c.tax_rate_id`, `LEFT`);
    this.db.where(`pr.status = 1`);
    this.db.group(`pr.product_id`);
    this.db.order(this.orderby, this.sorting);
    this.db.limit(this.start, this.limit);
    connection.query(this.db.get(),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            var response = {
                status: 200,
                error: false,
                products: results
            };
            reply(response);
        }
    });
};

/**
 * Find products by property
 * @param  {multitype}  prop
 * @param  {multitype}  value
 * @param  {function}   reply
 * @return {object}
 */
ProductsModel.prototype.findProductByProperty = function(prop, value, reply) {
    var select = `pr.product_id,pr.sku,pr.stock_status_id,pd.name,pd.description,pr.price,pr.image,pr.tax_class_id,`;
    select    += `tr.name AS tax_rate_name,tr.rate AS tax_rate,tr.type AS tax_rate_type,IF(pr.tax_class_id!=0, pr.price * tr.rate / 100, 0) AS tax`;
    this.db.select(select);
    this.db.from(`${this.dbprefix}product pr`);
    this.db.join(`${this.dbprefix}product_description pd ON pd.product_id=pr.product_id`);
    this.db.join(`${this.dbprefix}product_to_customer_group pc ON pc.product_id=pr.product_id`);
    this.db.join(`${this.dbprefix}customer cs ON cs.customer_group_id=pc.customer_group_id`, `LEFT`);
    this.db.join(`${this.dbprefix}tax_rate_to_customer_group t2c ON t2c.customer_group_id=cs.customer_group_id`, `LEFT`);
    this.db.join(`${this.dbprefix}tax_rate tr ON tr.tax_rate_id=t2c.tax_rate_id`, `LEFT`);
    this.db.where(`pr.status = 1 AND (pr.${prop}='${value}' OR pd.${prop}='${value}')`);
    this.db.group(`pr.product_id`);
    this.db.order(this.orderby, this.sorting);
    this.db.limit(this.start, this.limit);
    connection.query(this.db.get(),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            var response = {
                status: 200,
                error: false,
                products: results
            };
            reply(response);
        }
    });
};

/**
 * Get product by category
 * @param  {number}     category_id
 * @param  {function}   reply
 * @return {object}
 */
ProductsModel.prototype.getProductsByCategory = function(category_id, reply) {
    var that = this;
    this.db.select(`companydb`);
    this.db.from(`super.companies`);
    this.db.where(`company_id=${this.company_id}`);
    connection.query(this.db.get(),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            if (results.length > 0) {
                var dbname = results[0].companydb;
                var where  = `ct.category_id=${category_id} AND pr.status=1`;
                var select;
                where += (that.products == null) ? `` : ` AND pr.product_id IN (${that.products})`;
                if (that.group == null) {
                    select  = `pr.product_id,pr.sku,pr.stock_status_id,pd.name,pr.price,${that.getProductImageSrc('pr.image', 'rs.store_url')},pr.tax_class_id,`;
                    select += `tr.name AS tax_rate_name,tr.rate AS tax_rate,tr.type AS tax_rate_type,IF(pr.tax_class_id!=0, pr.price * tr.rate / 100, 0) AS tax`;
                    that.db.select(select);
                    that.db.from(`${dbname}.oc_product pr`);
                    that.db.join(`${dbname}.oc_product_description pd ON pd.product_id=pr.product_id`);
                    that.db.join(`${dbname}.oc_product_to_customer_group pc ON pc.product_id=pr.product_id`);
                    that.db.join(`${dbname}.oc_product_to_category ct ON ct.product_id=pr.product_id`);
                    that.db.join(`${dbname}.oc_rep_settings rs ON rs.company_id=${that.company_id}`, `LEFT`);
                    that.db.join(`${dbname}.oc_customer cs ON cs.customer_group_id=pc.customer_group_id`, `LEFT`);
                    that.db.join(`${dbname}.oc_tax_rate_to_customer_group t2c ON t2c.customer_group_id=cs.customer_group_id`, `LEFT`);
                    that.db.join(`${dbname}.oc_tax_rate tr ON tr.tax_rate_id=t2c.tax_rate_id`, `LEFT`);
                    that.db.where(where);
                    that.db.group(`pr.product_id`);
                    that.db.order(that.orderby, that.sorting);
                    that.db.limit(that.start, that.limit);
                } else {
                    select  = `pr.product_id,pr.sku,pr.stock_status_id,pd.name,IF(gp.price>=0,gp.price,pr.price) AS price,${that.getProductImageSrc('pr.image', 'rs.store_url')},pr.tax_class_id,`
                    select += `tr.name AS tax_rate_name,tr.rate AS tax_rate,tr.type AS tax_rate_type,IF(pr.tax_class_id!=0, pr.price * tr.rate / 100, 0) AS tax`;
                    that.db.select(select);
                    that.db.from(`${dbname}.oc_product pr`);
                    that.db.join(`${dbname}.oc_product_description pd ON pd.product_id=pr.product_id`);
                    that.db.join(`${dbname}.oc_product_to_customer_group pc ON pc.product_id=pr.product_id`);
                    that.db.join(`${dbname}.oc_product_to_category ct ON ct.product_id=pr.product_id`);
                    that.db.join(`${dbname}.oc_rep_settings rs ON rs.company_id=${that.company_id}`, `LEFT`);
                    that.db.join(`${dbname}.oc_product_to_customer_group_prices gp ON gp.product_id=pr.product_id AND gp.customer_group_id=${that.group}`, `LEFT`);
                    that.db.join(`${dbname}.oc_customer cs ON cs.customer_group_id=pc.customer_group_id`, `LEFT`);
                    that.db.join(`${dbname}.oc_tax_rate_to_customer_group t2c ON t2c.customer_group_id=cs.customer_group_id`, `LEFT`);
                    that.db.join(`${dbname}.oc_tax_rate tr ON tr.tax_rate_id=t2c.tax_rate_id`, `LEFT`);
                    that.db.where(where);
                    that.db.group(`pr.product_id`);
                    that.db.order(that.orderby, that.sorting);
                    that.db.limit(that.start, that.limit);
                }
                
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        var response = {
                            status: 200,
                            error: false,
                            products: results
                        };
                        reply(response);
                    }
                });
            } else {
                // company not found
                var response = {
                    status: 400,
                    error: true,
                    message: "Invalid company identifier"
                };
                reply(response);
            }
        }
    });
};

/**
 * Get a single product
 * @param  {number}
 * @param  {function}   reply
 * @return {object}
 */
ProductsModel.prototype.getProduct = function(id, reply) {
    this.findProductByProperty('product_id', id, reply);
};

/**
 * Get product categories
 * @param  {function}   reply
 * @return {object}
 */
ProductsModel.prototype.getProductCategories = function(reply) {
    var that = this;
    this.db.select(`companydb`);
    this.db.from(`super.companies`);
    this.db.where(`company_id=${this.company_id}`);
    connection.query(this.db.get(),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            if (results.length > 0) {
                var dbname = results[0].companydb;
                that.db.select(`ct.category_id,cd.name,ct.parent_id`);
                that.db.from(`${dbname}.oc_category ct`);
                that.db.join(`${dbname}.oc_category_description cd ON cd.category_id=ct.category_id`);
                that.db.join(`${dbname}.oc_category_to_customer_group cc ON cc.category_id=ct.category_id`);
                that.db.join(`${dbname}.oc_customer cs ON cs.customer_group_id=cc.customer_group_id`);
                that.db.where(`ct.status = 1`);
                that.db.group(`ct.category_id`);
                that.db.order(that.orderby, that.sorting);
                that.db.limit(that.start, that.limit);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        var response = {
                            status: 200,
                            error: false,
                            categories: results
                        };
                        reply(response);
                    }
                });
            } else {
                // company not found
                var response = {
                    status: 400,
                    error: true,
                    message: "Invalid company identifier"
                };
                reply(response);
            }
        }
    });
};

ProductsModel.prototype.import = function(products, reply) {
    // sample code...
    // replace with actual code...
    reply({});
};

module.exports = ProductsModel;
