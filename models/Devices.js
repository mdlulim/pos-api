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
function DevicesModel(database) {
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
DevicesModel.prototype.setCompanyId = function(company_id) {
    this.company_id = company_id;
}

/**
 * Set result limit. Define starting index and limit
 * @param  {number}     start
 * @param  {number}     limit
 */
DevicesModel.prototype.setResultLimits = function(start, limit) {
    this.start = start;
    this.limit = limit;
}

/**
 * Set result order-by. Define order-by [field] and sorting
 * @param  {number}     orderby
 * @param  {number}     sorting
 */
DevicesModel.prototype.setSortingOrder = function(orderby, sorting) {
    this.orderby = orderby;
    this.sorting = sorting;
}

/**
 * Get vehicles
 * @param  {function}   reply
 * @return {object}
 */
DevicesModel.prototype.getDevices = function(reply) {
    this.db.select(`tm.*`);
    this.db.from(`${this.dbprefix}terminal tm`);
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
                device_terminals: results
            };
            reply(response);
        }
    });
};

/**
 * Find vehicles by property
 * @param  {multitype}  prop
 * @param  {multitype}  value
 * @param  {function}   reply
 * @return {object}
 */
DevicesModel.prototype.findDeviceByProperty = function(prop, value, reply) {
    this.db.select(`tm.*`);
    this.db.from(`${this.dbprefix}terminal tm`);
    this.db.where(`cv.${prop} = '${value}'`);
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
                vehicles: results
            };
            reply(response);
        }
    });
};

/**
 * Get single vehicle by id
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
DevicesModel.prototype.getDevice = function(id, reply) {
    this.findDeviceByProperty('device_id', id, reply);
};

module.exports = DevicesModel;