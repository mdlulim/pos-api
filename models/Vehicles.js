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
 * Get vehicles
 * @param  {function}   reply
 * @return {object}
 */
VehiclesModel.prototype.getVehicles = function(reply) {
    this.db.select(`cv.*,CONCAT(cs.firstname,' ',cs.lastname) AS driver_name`);
    this.db.from(`${this.dbprefix}vehicle cv`);
    this.db.join(`${this.dbprefix}customer cs ON cs.customer_id = cv.customer_id`);
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
 * Find vehicles by property
 * @param  {multitype}  prop
 * @param  {multitype}  value
 * @param  {function}   reply
 * @return {object}
 */
VehiclesModel.prototype.findVehicleByProperty = function(prop, value, reply) {
    this.db.select(`cv.*,CONCAT(cs.firstname,' ',cs.lastname) AS driver_name`);
    this.db.from(`${this.dbprefix}vehicle cv`);
    this.db.join(`${this.dbprefix}customer cs ON cs.customer_id = cv.customer_id`);
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
VehiclesModel.prototype.getVehicle = function(id, reply) {
    this.findVehicleByProperty('vehicle_id', id, reply);
};

/**
 * Create new vehicle
 * @param {object}      vehicle
 * @param {function}    reply
 * @return {object}
 */
VehiclesModel.prototype.addVehicle = function(vehicle, reply) {
    var style      = (vehicle.style == 'undefined') ? '' : vehicle.style;
    var options    = (vehicle.options == 'undefined') ? '' : vehicle.options;
    var vin_number = (vehicle.vin_number == 'undefined') ? '' : vehicle.vin_number;
    var columns    = `customer_id,drivers_license,reg_number,make,model,style,colour,vin_number,options,date_added`;
    var values     = `${vehicle.customer_id},'${vehicle.drivers_license}','${vehicle.reg_number}','${vehicle.make}','${vehicle.model}','${style}','${vehicle.colour}','${vin_number}','${options}', NOW()`;
    connection.query(this.db.insert(`${this.dbprefix}vehicle`, columns, values),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            var response = {
                status: 200,
                error: false,
                message: "New vehicle successfully added!",
                vehicle: {
                    vehicle_id: results.insertId
                }
            };
            reply(response);
        }
    });
};

module.exports = VehiclesModel;