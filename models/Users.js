'use strict';

const config           = require('../config');
const MySQL            = require('mysql');
const bcrypt           = require('bcrypt');
const generatePassword = require('password-generator');
const createToken      = require('../util/token');
const connection       = MySQL.createConnection({
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
function UsersModel(database) {
    this.db       = database;
    this.start    = 0;
    this.limit    = 0;
    this.orderby  = "";
    this.sorting  = "";
    this.dbprefix = `${config.database.name}.${config.database.prefix}`;
};

/**
 * Set result limit. Define starting index and limit
 * @param  {number}     start
 * @param  {number}     limit
 */
UsersModel.prototype.setResultLimits = function(start, limit) {
    this.start = start;
    this.limit = limit;
}

/**
 * Set result order-by. Define order-by [field] and sorting
 * @param  {number}     orderby
 * @param  {number}     sorting
 */
UsersModel.prototype.setSortingOrder = function(orderby, sorting) {
    this.orderby = orderby;
    this.sorting = sorting;
}

/**
 * Get users
 * @param  {object}     request
 * @param  {function}   reply
 * @return {object}
 */
UsersModel.prototype.getUsers = function(reply) {
    this.db.select(`user_id,user_group_id,username,password,firstname,lastname,email,image,code,status,date_added,prompt_change_password`);
    this.db.from(`${this.dbprefix}user`);
    this.db.where(`status = 1`);
    this.db.order(that.orderby, that.sorting);
    this.db.limit(that.start, that.limit);
    connection.query(this.db.get(),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            var response = {
                status: 200,
                error: false,
                users: results
            };
            reply(response);
        }
    });
};

/**
 * Find users by property
 * @param  {multitype}  prop
 * @param  {multitype}  value
 * @param  {object}     request
 * @param  {function}   reply
 * @return {object}
 */
UsersModel.prototype.findUserByProperty = function(prop, value, reply) {
    this.db.select(`user_id,user_group_id,username,password,firstname,lastname,email,image,code,status,date_added,prompt_change_password`);
    this.db.from(`${this.dbprefix}user`);
    this.db.where(`status = 1 AND ${prop}='${value}'`);
    this.db.order(this.orderby, that.sorting);
    this.db.limit(this.start, that.limit);
    connection.query(this.db.get(),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            var response = {
                status: 200,
                error: false,
                users: results
            };
            reply(response);
        }
    });
};

/**
 * Get single user
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
UsersModel.prototype.getUser = function(id, reply) {
    this.findUserByProperty('user_id', id, reply);
};

/**
 * Create new user
 * @param  {object}     user
 * @param  {function}   reply
 * @return {object}
 */
UsersModel.prototype.addUser = function(user, reply) {
    // var salt         = bcrypt.genSaltSync();
    // var password     = generatePassword(6);
    // var encryptedPwd = bcrypt.hashSync(password, salt);
    // var columns      = `user_group_id,username,password,salt,firstname,lastname,email,code,ip`;
    // var values       = `${user.group},'${user.username}','${encryptedPwd}','${salt}','${user.firstname}','${user.lastname}','${user.email}','${user.code}','${user.ip}'`;
    // connection.query(this.db.insert(`${this.dbprefix}user`, columns, values),
    // function (error, results, fields) {
    //     if (error) {
    //         throw error;
    //     } else {
    //         var response = {
    //             status: 200,
    //             error: false,
    //             message: "New user successfully created!",
    //             data: {
    //                 user_id: results.insertId
    //             }
    //         };
    //         reply(response);
    //     }
    // });
};

/**
 * Update user details
 * @param  {number}     id
 * @param  {object}     user
 * @param  {function}   reply
 * @return {object}
 */
UsersModel.prototype.updateUser = function(id, user, reply) {
    var set       = `email='${user.email}',date_modified=NOW()`;
    var condition = `user_id=${id}`;
    connection.query(this.db.update(`${this.dbprefix}user`, set, condition),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            var response = {
                status: 200,
                error: false,
                message: "User details successfully updated!"
            };
            reply(response);
        }
    });
};

/**
 * Reset user's password
 * @param  {number}     id
 * @param  {string}     email
 * @param  {function}   reply
 * @return {object}
 */
UsersModel.prototype.resetPassword = function(email, reply) {
    // validate email against database | check if user exists or not
    var that = this;
    this.db.select(`user_id,username,email`);
    this.db.from(`${this.dbprefix}user`);
    this.db.where(`email='${email}'`);
    connection.query(this.db.get(),
    function(error, results, fields) {
        if (error) {
            throw error;
        } else {
            if (results.length) {
                /** 
                 * Generate salt 
                 * Generate random password
                 * Create [password] hash (Password Encryption)
                 * Update user record with new password
                 * Send new password to user
                 */
                // var salt         = bcrypt.genSaltSync();
                // var password     = generatePassword(6);
                // var encryptedPwd = bcrypt.hashSync(password, salt);
                // var set          = `salt='${salt}',password='${encryptedPwd}',date_modified=NOW()`;
                // var condition    = `user_id=${results[0].user_id}`;
                // connection.query(that.db.update(`${this.dbprefix}user`, set, condition),
                // function(error, results, fields) {
                //     if (error) {
                //         throw error;
                //     } else {
                //         var response = {
                //             status: 200,
                //             error: true,
                //             message: "Reset password email sent!"
                //         };
                //         reply(response);
                //     }
                // });
            } else {
                var response = {
                    status: 400,
                    error: true,
                    message: "User does not exist!"
                };
                reply(response);
            }
        }
    });
};

/**
 * Change user password
 * @param  {object}     user
 * @param  {function}   reply
 * @return {object}
 */
UsersModel.prototype.changePassword = function(user, reply) {
    // validate email against database | check if user exists or not
    var that = this;
    this.db.select(`user_id,username,password,email`);
    this.db.from(`${this.dbprefix}user`);
    this.db.where(`user_id=${user.id}`);
    connection.query(this.db.get(),
    function(error, results, fields) {
        if (error) {
            throw error;
        } else {
            if (results.length) {
                // var pwdRes = bcrypt.compareSync(user.old_password, results[0].password);
                // if (pwdRes === true) {
                //     /** 
                //      * Generate salt 
                //      * Generate random password
                //      * Create [password] hash (Password Encryption)
                //      * Update user record with new password
                //      * Send new password to user
                //      */
                //     var salt         = bcrypt.genSaltSync();
                //     var encryptedPwd = bcrypt.hashSync(user.new_password, salt);
                //     var set          = `salt='${salt}',password='${encryptedPwd}',date_modified=NOW()`;
                //     var condition    = `user_id=${user.id}`;
                //     connection.query(that.db.update(`${this.dbprefix}user`, set, condition),
                //     function(error, results, fields) {
                //         if (error) {
                //             throw error;
                //         } else {
                //             var response = {
                //                 status: 200,
                //                 error: true,
                //                 message: "Password successfully updated!"
                //             };
                //             reply(response);
                //         }
                //     });
                // } else {
                //     var response = {
                //         status: 401,
                //         error: false,
                //         message: "Incorrect old password!"
                //     }
                //     reply(response);
                // }
            } else {
                var response = {
                    status: 400,
                    error: true,
                    message: "User does not exist!"
                };
                reply(response);
            }
        }
    });
};

/**
 * User login 
 * @param  {number}     id
 * @param  {string}     email
 * @param  {function}   reply
 * @return {object}
 */
UsersModel.prototype.login = function(username, password, reply) {
    // validate email against database | check if user exists or not
    this.db.select(`user_id,user_group_id,username,password,firstname,lastname,email,image,code,status,date_added,prompt_change_password`);
    this.db.from(`${this.dbprefix}user`);
    this.db.where(`username='${username}' AND status=1`);
    connection.query(this.db.get(),
    function(error, results, fields) {
        if (error) {
            throw error;
        } else {
            if (results.length) {
                var pwdRes = bcrypt.compareSync(password, results[0].password);
                if (pwdRes === true) {
                    var response = {
                        status: 200,
                        error: false,
                        data: {
                            user_id        : results[0].user_id,
                            user_group_id  : results[0].user_group_id,
                            username       : results[0].username,
                            password       : results[0].password,
                            firstname      : results[0].firstname,
                            lastname       : results[0].lastname,
                            email          : results[0].email,
                            image          : results[0].image,
                            code           : results[0].code,
                            status         : results[0].status,
                            date_added     : results[0].date_added,
                            change_password: results[0].prompt_change_password
                        },
                        auth: {
                            user_id : results[0].user_id,
                            token   : createToken({
                                username : results[0].email,
                                uid      : results[0].user_id, 
                                admin    : results[0].user_group_id === 1
                            })
                        }
                    };
                    reply(response);

                } else {
                    var response = {
                        status: 400,
                        error: false,
                        message: "Incorrect username and/or password"
                    }
                    reply(response);
                }
            } else {
                var response = {
                    status: 400,
                    error: false,
                    message: "User does not exist!"
                }
                reply(response);
            }
        }
    });
};

/**
 * Delete user
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
UsersModel.prototype.deleteUser = function(id, reply) {
    connection.query(this.db.delete(`${this.dbprefix}user`, `user_id=${id}`),
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
};

module.exports = UsersModel;
