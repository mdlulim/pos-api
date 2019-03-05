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
    this.orderby    = "";
    this.sorting    = "";
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
 * Find transctions by property
 * @param  {multitype}  prop
 * @param  {multitype}  value
 * @param  {function}   reply
 * @return {object}
 */
TransactionsModel.prototype.findTransactionByProperty = function(prop, value, reply) {
    var that = this;
    var select = `tr.*,tp.payment_method,tp.payment_code,tp.payment_status_id`;
    this.db.select(select);
    this.db.from(`${this.dbprefix}transaction tr`);
    this.db.join(`${this.dbprefix}transaction_payment tp ON tp.transaction_id = tr.transaction_id`, `LEFT`);
    this.db.where(`${prop}='${value}'`);
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
    var columns = `invoice_no,invoice_prefix,customer_id,customer_group_id,firstname,lastname,email,telephone,fax,comment,total,transaction_status_id,user_id,date_added`;
    var values  = `'${data.invoice_no}','${data.invoice_prefix}',${data.customer_id},${data.customer_group_id},'${data.firstname}','${data.lastname}','${data.email}','${data.telephone}','${data.fax}','${data.comment}',${data.total},${status_id},${data.user_id},NOW()`;
    connection.query(this.db.insert(`${this.dbprefix}transaction`, columns, values),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            
            const transactionId = results.insertId;

            // insert transaction products
            if (data.cart.length) {
                const subTotal   = 0;
                const totalTax   = 0;
                const total      = 0;
                const discount   = 0;
                const totalItems = 0;

                var multiInsert = `INSERT INTO ${that.dbprefix}transaction_product VALUES`;
                var first       = true;
                for (var i=0; i<data.products.length; i++) {
                    multiInsert += (first) ? `` : `,`;
                    multiInsert += `(${transactionId},${data.products[i].product_id},'${data.products[i].name}',${data.products[i].quantity},'',${data.products[i].price},${data.products[i].total},${data.products[i].tax},0)`;
                    first        = false;
                    subTotal    += data.products[i].price;
                    totalTax    += data.products[i].tax;
                    total       += data.products[i].total;
                    totalItems  += data.products[i].quantity;
                }
                multiInsert += `;`;
                that.db.set(multiInsert);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        
                        // insert transaction totals
                        var multiInsert = `INSERT INTO ${that.dbprefix}transaction_total VALUES`;
                        multiInsert += `(${transactionId},'total_items','Sub-Total',${totalItems},0),`;
                        multiInsert += `(${transactionId},'discount','Sub-Total',${discount},1),`;
                        multiInsert += `(${transactionId},'sub_total','Sub-Total',${subTotal},2),`;
                        multiInsert += `(${transactionId},'tax','VAT (15%)',${totalTax},3),`;
                        multiInsert += `(${transactionId},'total','Total',${total},4);`;
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
                                        var response = {
                                            status: 200,
                                            error: false,
                                            data: {
                                                transaction_id: transactionId
                                            }
                                        };
                                        reply(response);
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