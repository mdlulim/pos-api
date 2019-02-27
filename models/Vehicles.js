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
function VehiclesModel(database) {
    this.db          = database;
    this.company_id  = 0;
    this.salesrep_id = 0;
    this.start       = 0;
    this.limit       = 0;
    this.orderby     = "";
    this.sorting     = "";
    this.dbprefix    = `${config.database.name}.${config.database.prefix}`;
};

/**
 * Set company id
 * @param  {number}     company_id
 */
VehiclesModel.prototype.setCompanyId = function(company_id) {
    this.company_id = company_id;
}

/**
 * Set result limit. Define starting index and limit
 * @param  {number}     start
 * @param  {number}     limit
 */
VehiclesModel.prototype.setResultLimits = function(start, limit) {
    this.start = start;
    this.limit = limit;
}

/**
 * Set result order-by. Define order-by [field] and sorting
 * @param  {number}     orderby
 * @param  {number}     sorting
 */
VehiclesModel.prototype.setSortingOrder = function(orderby, sorting) {
    this.orderby = orderby;
    this.sorting = sorting;
}

/**
 * Get customers
 * @param  {function}   reply
 * @return {object}
 */
VehiclesModel.prototype.getVehicles = function(reply) {
    this.db.select(`cv.*,CONCAT(cs.firstname,' ',cs.lastname) AS driver_name`);
    this.db.from(`${this.dbprefix}vehicle cv`);
    this.db.join(`${this.dbprefix}customer cs ON cs.customer_id = cv.customer_id`);
    connection.query(this.db.get(),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            var response = {
                status: 200,
                error: false,
                vehicles: results
            };
            reply(response);
        }
    });
};

module.exports = VehiclesModel;