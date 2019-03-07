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
function CustomersModel(database) {
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
 * Set result limit. Define starting index and limit
 * @param  {number}     start
 * @param  {number}     limit
 */
CustomersModel.prototype.setResultLimits = function(start, limit) {
    this.start = start;
    this.limit = limit;
}

/**
 * Set result order-by. Define order-by [field] and sorting
 * @param  {number}     orderby
 * @param  {number}     sorting
 */
CustomersModel.prototype.setSortingOrder = function(orderby, sorting) {
    this.orderby = orderby;
    this.sorting = sorting;
}

/**
 * Get customers
 * @param  {function}   reply
 * @return {object}
 */
CustomersModel.prototype.getCustomers = function(reply) {
    var select = ``;
    select += `cs.*,CONCAT(cs.firstname,' ',cs.lastname) AS fullname,cg.name AS customer_group,`;
    select += `ca.address_1,ca.address_2,ca.city,ca.postcode,ca.country_id,ca.zone_id,`;
    select += `ac.name AS country_name`;
    this.db.select(select);
    this.db.from(`${this.dbprefix}customer cs`);
    this.db.join(`${this.dbprefix}customer_group cg ON cg.customer_group_id = cs.customer_group_id`);
    this.db.join(`${this.dbprefix}address ca ON ca.address_id = cs.address_id`, `LEFT`);
    this.db.join(`${this.dbprefix}country ac ON ac.country_id = ca.country_id`, `LEFT`);
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
                customers: results
            };
            reply(response);
        }
    });
};

/**
 * Find customers by property
 * @param  {multitype}  prop
 * @param  {multitype}  value
 * @param  {function}   reply
 * @return {object}
 */
CustomersModel.prototype.findCustomerByProperty = function(prop, value, reply) {
    var select = ``;
    select += `cs.*,CONCAT(cs.firstname,' ',cs.lastname) AS fullname,cg.name AS customer_group,`;
    select += `ca.address_1,ca.address_2,ca.city,ca.postcode,ca.country_id,ca.zone_id,`;
    select += `ac.name AS country_name`;
    this.db.select(select);
    this.db.from(`${this.dbprefix}customer cs`);
    this.db.join(`${this.dbprefix}customer_group cg ON cg.customer_group_id = cs.customer_group_id`);
    this.db.join(`${this.dbprefix}address ca ON ca.address_id = cs.address_id`, `LEFT`);
    this.db.join(`${this.dbprefix}country ac ON ac.country_id = ca.country_id`, `LEFT`);
    this.db.where(`cs.${prop} = '${value}'`);
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
                customers: results
            };
            reply(response);
        }
    });
};

/**
 * Get single customer
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
CustomersModel.prototype.getCustomer = function(id, reply) {
    this.findCustomerByProperty('customer_id', id, reply);
};

/**
 * Get customer transactions
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
CustomersModel.prototype.getCustomerTransactions = function(id, reply) {
    this.db.select(`tr.*,ts.name AS transaction_status`);
    this.db.from(`${this.dbprefix}transaction tr`);
    this.db.from(`${this.dbprefix}transaction_status ts ON ts.transaction_status_id = tr.transaction_status_id`);
    this.db.where(`tr.customer_id=${id}`);
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
                transactions: results
            };
            reply(response);
        }
    });
};

/**
 * Get customer vehicles
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
CustomersModel.prototype.getCustomerVehicles = function(id, reply) {
    this.db.select(`cv.*,CONCAT(cs.firstname,' ',cs.lastname) AS driver_name`);
    this.db.from(`${this.dbprefix}vehicle cv`);
    this.db.join(`${this.dbprefix}customer cs ON cs.customer_id = cv.customer_id`);
    this.db.where(`cv.customer_id=${id}`);
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
 * Create new customer
 * @param {object}      customer
 * @param {function}    reply
 * @return {object}
 */
CustomersModel.prototype.addCustomer = function(customer, reply) {
    var fax      = (customer.fax == 'undefined') ? '' : customer.fax;
    var columns  = `customer_group_id,language_id,firstname,lastname,email,telephone,fax,id_type,id_number,date_added`;
    var values   = `${customer.type},1,'${customer.firstname}','${customer.lastname}','${customer.email}','${customer.telephone}','${fax}','${customer.id_type}','${customer.id_number}', NOW()`;
    connection.query(this.db.insert(`${this.dbprefix}customer`, columns, values),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            var response = {
                status: 200,
                error: false,
                message: "New customer successfully added!",
                customer: {
                    customer_id: results.insertId
                }
            };
            reply(response);
        }
    });
};

/**
 * Get customer addresses
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
CustomersModel.prototype.getCustomerAddresses = function(id, reply) {
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
                that.db.select(`ad.*,IF(ad.address_id=cs.address_id, 1, 0) AS is_default`);
                that.db.from(`${dbname}.oc_address ad`);
                that.db.join(`${dbname}.oc_customer cs ON cs.address_id=ad.address_id`, `LEFT`);
                that.db.where(`ad.customer_id=${id}`);
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
                            addresses: results
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
 * Create new customer address
 * @param {number}      id
 * @param {object}      newContact
 * @param {function}    reply
 * @return {object}
 */
CustomersModel.prototype.addCustomerAddress = function(id, newAddress, reply) {
    var that = this;
    this.db.select(`companydb`);
    this.db.from(`super.companies`);
    this.db.where(`company_id=${this.company_id}`);
    connection.query(this.db.get(),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            /**
             * Check if company is found
             */
            if (results.length > 0) {
                const dbname = results[0].companydb;
                var columns  = `customer_id,firstname,lastname,company,address_1,address_2,city,postcode,country_id,zone_id`;
                var values   = `${id},'${newAddress.firstname}','${newAddress.lastname}','${newAddress.company}','${newAddress.address_1}','${newAddress.address_2}',${id},'${newAddress.city}','${newAddress.postcode}',${newAddress.country_id},${newAddress.region_id}`;
                connection.query(that.db.insert(`${dbname}.oc_address`, columns, values),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        var response = {
                            status: 200,
                            error: false,
                            message: "success",
                            address: {
                                address_id: results.insertId
                            }
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
 * Update customer details
 * @param  {number}     id
 * @param  {object}     updatedCustomer
 * @param  {function}   reply
 * @return {object}
 */
CustomersModel.prototype.updateCustomer = function(id, updatedCustomer, reply) {
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
                const dbname = results[0].companydb;
                var set = `email='${updatedCustomer.email}',telephone='${updatedCustomer.telephone}',fax='${updatedCustomer.fax}'`;
                var condition = `customer_id=${id}`;
                connection.query(that.db.update(`${dbname}.oc_customer`, set, condition),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        var set       = `address_1='${updatedCustomer.address_1}',address_2='${updatedCustomer.address_2}',city='${updatedCustomer.city}',postcode='${updatedCustomer.postcode}',zone_id=${updatedCustomer.region_id},country_id=${updatedCustomer.country_id}`;
                        var condition = `address_id=${updatedCustomer.address_id}`;
                        connection.query(that.db.update(`${dbname}.oc_address`, set, condition),
                        function (error, results, fields) {
                            if (error) {
                                throw error;
                            } else {
                                var response = {
                                    status: 200,
                                    error: false,
                                    message: "success"
                                };
                                reply(response);
                            }
                        });
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
 * Delete customer
 * @param  {number}    id
 * @param  {function}  reply
 * @return {object}
 */
CustomersModel.prototype.deleteCustomer = function(id, reply) {
    connection.query(this.db.delete(`${dbprefix}customer`, `customer_id=${id}`),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            var response = {
                status: 200,
                error: false,
                message: "Customer successfully deleted!"
            };
            reply(response);
        }
    });
};

module.exports = CustomersModel;
