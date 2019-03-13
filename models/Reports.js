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
function ReportsModel(database) {
    this.db          = database;
    this.start       = 0;
    this.limit       = 0;
    this.filters     = {};
    this.dbprefix    = `${config.database.name}.${config.database.prefix}`;
};

/**
 * Set result limit. Define starting index and limit
 * @param  {number}     start
 * @param  {number}     limit
 */
ReportsModel.prototype.setResultLimits = function(start, limit) {
    this.start = start;
    this.limit = limit;
}

/**
 * Set result limit. Define starting index and limit
 * @param  {number}     start
 * @param  {number}     limit
 */
ReportsModel.prototype.setFilters = function(filters) {
    this.filters = filters;
}

/**
 * Get reports
 * @param  {function}   reply
 * @return {object}
 */
ReportsModel.prototype.getReports = function(reply) {
    this.db.select(`*`);
    this.db.from(`${this.dbprefix}report`);
    this.db.where(`status = 1`);
    this.db.order(`sort_order`);
    connection.query(this.db.get(),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            var response = {
                status: 200,
                error: false,
                reports: results
            };
            reply(response);
        }
    });
};

/**
 * Get report by id
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
ReportsModel.prototype.getReportById = function(id, reply) {
    var that = this;
    this.db.select(`*`);
    this.db.from(`${this.dbprefix}report`);
    this.db.where(`report_id = ${id}`);
    connection.query(this.db.get(),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            if (results.length) {
                if (results[0].sql.length > 0) {
                    var query = that.getQuery(results[0].sql);
                    var query = query.split(`{filters}`).join(`DATE_FORMAT(tr.date_added,"%Y-%m-%d")>=DATE_FORMAT(${filters.start_date},"%Y-%m-%d") AND DATE_FORMAT(tr.date_added,"%Y-%m-%d")<=DATE_FORMAT(${filters.end_date},"%Y-%m-%d")`);
                    that.db.set(query);
                    connection.query(that.db.get(),
                    function (error, results, fields) {
                        if (error) {
                            throw error;
                        } else {
                            var response = {
                                status: 200,
                                error: false,
                                data: results
                            };
                            reply(response);
                        }
                    });
                } else {
                    var response = {
                        status: 200,
                        error: false,
                        data: []
                    };
                    reply(response);
                }
            } else {
                var response = {
                    status: 404,
                    error: true,
                    message: "Not found"
                };
                reply(response);
            }
        }
    });
};

/**
 * Get query
 * @param  {string}     query
 * @return {string}
 */
ReportsModel.prototype.getQuery = function(query) {
    query = (this.filters.start_date !== undefined) ? query.replace('{start_date}', this.filters.start_date) : query;
    query = (this.filters.end_date !== undefined)   ? query.replace('{end_date}', this.filters.end_date)     : query;
    return query;
};

module.exports = ReportsModel;