'use strict';

const config     = require('../config');
const MySQL      = require('mysql');
const connection = MySQL.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.pass,
    database: config.database.name
});
connection.connect();

/**
 * Model constructor
 * @param  {object}     database
 */
function TransactionsModel(database) {
    this.db         = database;
    this.company_id = 0;
    this.start      = 0;
    this.limit      = 0;
    this.orderby    = "tr.transaction_id";
    this.sorting    = "DESC";
    this.dbprefix   = `${config.database.name}.${config.database.prefix}`;
};

/**
 * Set result limit. Define starting index and limit
 * @param  {number}     start
 * @param  {number}     limit
 */
TransactionsModel.prototype.setResultLimits = function(start, limit) {
    this.start = start;
    this.limit = limit;
}

/**
 * Set result order-by. Define order-by [field] and sorting
 * @param  {number}     orderby
 * @param  {number}     sorting
 */
TransactionsModel.prototype.setSortingOrder = function(orderby, sorting) {
    this.orderby = orderby;
    this.sorting = sorting;
}

/**
 * Get transctions
 * @param  {function}   reply
 * @return {object}
 */
TransactionsModel.prototype.getTransactions = function(reply) {
    var select = `tr.*,tp.payment_method,tp.payment_code,tp.payment_status_id`;
    this.db.select(select);
    this.db.from(`${this.dbprefix}transaction tr`);
    this.db.join(`${this.dbprefix}transaction_payment tp ON tp.transaction_id = tr.transaction_id`, `LEFT`);
    this.db.order(`tr.transaction_id`, `DESC`);
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
 * Find transctions by property
 * @param  {multitype}  prop
 * @param  {multitype}  value
 * @param  {function}   reply
 * @return {object}
 */
TransactionsModel.prototype.findTransactionByProperty = function(prop, value, reply) {
    var that = this;
    var select = `tr.*,tp.payment_method,tp.payment_code,tp.payment_status_id,`;
    select    += `cs.id_number,cs.firearm,cg.name AS customer_group,CONCAT(usr.firstname,' ',usr.lastname) AS user_name,tm.description AS terminal,tm.gate,`;
    select    += `vh.vehicle_id,vh.driver_name,vh.make,vh.model,vh.reg_number,vh.drivers_license,vh.colour,vh.style,vh.vin_number`;
    var where;
    if (prop === 'invoice_number') {
        if (value.indexOf('ewl-') > -1) {
            var arr = value.split('-');
            var invoicePrefix = `${arr[0]}-`;
            var invoiceNumber = arr[1];
        } else {
            var invoicePrefix = 'EWL-';
            var invoiceNumber = value;
        }
        where = `tr.invoice_prefix='${invoicePrefix}' AND tr.invoice_no='${invoiceNumber}'`;
    } else {
        where = `${prop}='${value}'`;
    }
    this.db.select(select);
    this.db.from(`${this.dbprefix}transaction tr`);
    this.db.join(`${this.dbprefix}transaction_payment tp ON tp.transaction_id = tr.transaction_id`, `LEFT`);
    this.db.join(`${this.dbprefix}customer cs ON cs.customer_id = tr.customer_id`, `LEFT`);
    this.db.join(`${this.dbprefix}user usr ON usr.user_id = tr.user_id`, `LEFT`);
    this.db.join(`${this.dbprefix}terminal tm ON tm.device_ip = tr.ip`, `LEFT`);
    this.db.join(`${this.dbprefix}customer_group cg ON cg.customer_group_id = tr.customer_group_id`, `LEFT`);
    this.db.join(`${this.dbprefix}transaction_to_vehicle tv ON tv.transaction_id = tr.transaction_id`, `LEFT`);
    this.db.join(`${this.dbprefix}vehicle vh ON vh.vehicle_id = tv.vehicle_id`, `LEFT`);
    this.db.where(where);
    this.db.order(`tr.transaction_id`, `DESC`);
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

            if (prop === 'tr.transaction_id') {
                // get transaction products items
                that.db.select(`tp.*`);
                that.db.from(`${that.dbprefix}transaction_product tp`);
                that.db.where(`tp.transaction_id='${value}'`);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        response.products = results;

                        // get transaction totals
                        that.db.select(`tt.*`);
                        that.db.from(`${that.dbprefix}transaction_total tt`);
                        that.db.where(`tt.transaction_id='${value}'`);
                        connection.query(that.db.get(),
                        function (error, results, fields) {
                            if (error) {
                                throw error;
                            } else {
                                response.totals = results;
                                reply(response);
                            }
                        });
                    }
                });
            } else {
                reply(response);
            }
        }
    });
};

/**
 * Get a single transction
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
TransactionsModel.prototype.getTransaction = function(id, reply) {
    this.findTransactionByProperty('tr.transaction_id', id, reply);
};

/**
 * Store transction
 * @param  {object}     data
 * @param  {function}   reply
 * @return {object}
 */
TransactionsModel.prototype.storeTransaction = function(data, reply) {
    // insert transaction
    var that    = this;
    var columns = `invoice_no,invoice_prefix,customer_id,customer_group_id,firstname,lastname,email,telephone,fax,comment,total,transaction_status_id,user_id,location,date_added`;
    var values  = `'${data.invoice_no}','${config.invoice_prefix}',${data.customer.customer_id},${data.customer.customer_group_id},'${data.customer.firstname}','${data.customer.lastname}','${data.customer.email}','${data.customer.telephone}','${data.customer.fax}','${data.comment}',${data.totals.total},${data.transaction_status_id},${data.user_id},'${data.location}',NOW()`;
    connection.query(this.db.insert(`${this.dbprefix}transaction`, columns, values),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            
            const transactionId = results.insertId;

            // insert transaction products
            if (data.products.length) {
                var multiInsert = `INSERT INTO ${that.dbprefix}transaction_product (transaction_id,product_id,name,quantity,price,total,tax) VALUES`;
                var first       = true;
                for (var i=0; i<data.products.length; i++) {
                    multiInsert += (first) ? `` : `,`;
                    multiInsert += `(${transactionId},${data.products[i].product_id},'${data.products[i].name}',${data.products[i].quantity},${data.products[i].price},${data.products[i].total},${data.products[i].tax})`;
                    first        = false;
                }
                multiInsert += `;`;
                that.db.set(multiInsert);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        
                        // insert transaction totals
                        var multiInsert = `INSERT INTO ${that.dbprefix}transaction_total (transaction_id,code,title,value,sort_order) VALUES`;
                        multiInsert += `(${transactionId},'total_items','Total Items',${data.totals.item_qty},0),`;
                        multiInsert += `(${transactionId},'discount','Discount',${data.totals.discount},1),`;
                        multiInsert += `(${transactionId},'sub_total','Sub-Total',${data.totals.subtotal},2),`;
                        multiInsert += `(${transactionId},'tax','VAT (15%)',${data.totals.tax},3),`;
                        multiInsert += `(${transactionId},'total','Total',${data.totals.total},4);`;
                        that.db.set(multiInsert);
                        connection.query(that.db.get(),
                        function (error, results, fields) {
                            if (error) {
                                throw error;
                            } else {

                                // insert transaction payment
                                var columns = `transaction_id,payment_method,payment_code,payment_status_id,comment,date_added`;
                                var values  = `${transactionId},'${data.payment_details.payment_method}','${data.payment_details.payment_code}',${data.payment_details.payment_status_id},'${data.payment_details.comment}',NOW()`;;
                                connection.query(that.db.insert(`${that.dbprefix}transaction_payment`, columns, values),
                                function (error, results, fields) {
                                    if (error) {
                                        throw error;
                                    } else {
                                        var columns = `transaction_id,vehicle_id`;
                                        var values  = `${transactionId},${data.vehicle.vehicle_id}`;;
                                        connection.query(that.db.insert(`${that.dbprefix}transaction_to_vehicle`, columns, values),
                                        function (error, results, fields) {
                                            if (error) {
                                                throw error;
                                            } else {
                                                that.getTransaction(transactionId, reply);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    });
};

module.exports = TransactionsModel;