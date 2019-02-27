const emailClient = require('./email-client');
const generatePdf = require('./generate-pdf');
const request = require('request').defaults({ encoding: null });
const fs = require('fs');
const os = require('os');
module.exports = function() {

    /**
     * Send order confirmation email to customer
     * @param customer
     * @param data
     * @param quote_number
     * @param reply
     */
    function sendQuoteEmails(customer, manager, company, rep, quote, reply, req) {
        generatePdf.generateQuotePdf(customer, manager, company, rep, quote, function (error, result) {
            if (error) {
                reply(error);
            } else {
                var hostname = os.hostname();
                var basePath = req.connection.info.protocol + "://localhost/api-logicsuite/";
                request.get(basePath + "quote.pdf", function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var attachments = [{
                            type: response.headers["content-type"],
                            name: "Quote-"+quote.number+".pdf",
                            content: new Buffer(body).toString('base64')
                        }];
                        sendQuoteEmailToCustomer(customer, manager, company, rep, quote, reply, attachments);
                    } else {
                        // @TODO: Need to fix the path error
                        sendQuoteEmailToCustomer(customer, manager, company, rep, quote, reply, []);
                        // reply({status:400});
                    }
                });
            }
        });
    };

    function sendQuoteEmailToCustomer(customer, manager, company, rep, quote, reply, attachments) {
        var params = {
            template_name: 'customer-quote-template',
            template_content: [],
            message: {
                subject: 'Quote Confirmation',
                to: [{
                    email: customer.email,
                    type: 'to'
                }],
                // attachments: attachments,
                global_merge_vars: [{
                    name: 'CUST_NAME',
                    content: customer.name
                }, {
                    name: 'QUOTE_NUM',
                    content: quote.number
                }, {
                    name: 'QUOTE_DATE',
                    content: quote.date
                }, {
                    name: 'QUOTE_TOTAL',
                    content: quote.total
                }, {
                    name: 'QUOTE_URL',
                    content: quote.url
                }, {
                    name: 'MANAGER_EMAIL',
                    content: manager.email
                }, {
                    name: 'REP_NAME',
                    content: rep.name
                }, {
                    name: 'CUST_CONTACT_NAME',
                    content: customer.contact.name
                }, {
                    name: 'CUST_ADDR_LINE1',
                    content: customer.address.line1
                }, {
                    name: 'CUST_ADDR_LINE2',
                    content: customer.address.line2
                }, {
                    name: 'CUST_ADDR_CITY',
                    content: customer.address.city
                }, {
                    name: 'CUST_ADDR_COUNTRY',
                    content: customer.address.country
                }, {
                    name: 'CUST_ADDR_POSTCODE',
                    content: customer.address.postcode
                }, {
                    name: 'COMPANY_NAME',
                    content: company.name
                }]
            },
            async: false
        };

        // send email to customer
        emailClient.sendTemplate(params, function (res) {
            sendQuoteEmailToRep(customer, manager, company, rep, quote, reply, attachments);
        }, function (error) {
            sendQuoteEmailToRep(customer, manager, company, rep, quote, reply, attachments);
        });
    };


    /**
     * Send order confirmation email to sales rep
     * @param rep
     * @param data
     * @param quote_number
     */
    function sendQuoteEmailToRep(customer, manager, company, rep, quote, reply, attachments) {
        var params = {
            template_name: 'rep-quote-template',
            template_content: [],
            message: {
                subject: 'Quote Generated Successfully',
                to: [{
                    email: rep.email,
                    type: 'to'
                }],
                // attachments: attachments,
                global_merge_vars: [{
                    name: 'CUST_NAME',
                    content: customer.name
                }, {
                    name: 'QUOTE_NUM',
                    content: quote.number
                }, {
                    name: 'QUOTE_DATE',
                    content: quote.date
                }, {
                    name: 'QUOTE_TOTAL',
                    content: quote.total
                }, {
                    name: 'QUOTE_URL',
                    content: quote.url
                }, {
                    name: 'MANAGER_EMAIL',
                    content: manager.email
                }, {
                    name: 'REP_NAME',
                    content: rep.name
                }, {
                    name: 'CUST_CONTACT_NAME',
                    content: customer.contact.name
                }, {
                    name: 'CUST_ADDR_LINE1',
                    content: customer.address.line1
                }, {
                    name: 'CUST_ADDR_LINE2',
                    content: customer.address.line2
                }, {
                    name: 'CUST_ADDR_CITY',
                    content: customer.address.city
                }, {
                    name: 'CUST_ADDR_COUNTRY',
                    content: customer.address.country
                }, {
                    name: 'CUST_ADDR_POSTCODE',
                    content: customer.address.postcode
                }, {
                    name: 'COMPANY_NAME',
                    content: company.name
                }]
            },
            async: false
        };

        // send email to sales rep
        emailClient.sendTemplate(params, function (res) {
            sendQuoteEmailToSalesManager(customer, manager, company, rep, quote, reply, attachments);
        }, function(error) {
            sendQuoteEmailToSalesManager(customer, manager, company, rep, quote, reply, attachments);
        });
    };


    /**
     * Send order confirmation email to sales manager
     * @param manager
     * @param data
     * @param quote_number
     */
    function sendQuoteEmailToSalesManager(customer, manager, company, rep, quote, reply, attachments) {
        var params = {
            template_name: 'manager-quote-template',
            template_content: [],
            message: {
                subject: 'New Quote Received',
                to: [{
                    email: manager.email,
                    type: 'to'
                }],
                // attachments: attachments,
                global_merge_vars: [{
                    name: 'CUST_NAME',
                    content: customer.name
                }, {
                    name: 'QUOTE_NUM',
                    content: quote.number
                }, {
                    name: 'QUOTE_DATE',
                    content: quote.date
                }, {
                    name: 'QUOTE_TOTAL',
                    content: quote.total
                }, {
                    name: 'QUOTE_URL',
                    content: quote.url
                }, {
                    name: 'MANAGER_EMAIL',
                    content: manager.email
                }, {
                    name: 'REP_NAME',
                    content: rep.name
                }, {
                    name: 'CUST_CONTACT_NAME',
                    content: customer.contact.name
                }, {
                    name: 'CUST_ADDR_LINE1',
                    content: customer.address.line1
                }, {
                    name: 'CUST_ADDR_LINE2',
                    content: customer.address.line2
                }, {
                    name: 'CUST_ADDR_CITY',
                    content: customer.address.city
                }, {
                    name: 'CUST_ADDR_COUNTRY',
                    content: customer.address.country
                }, {
                    name: 'CUST_ADDR_POSTCODE',
                    content: customer.address.postcode
                }, {
                    name: 'COMPANY_NAME',
                    content: company.name
                }]
            },
            async: false
        };

        // send email to sales manager
        emailClient.sendTemplate(params, function (res) {
            var response = {
                status: 200,
                error: false,
                message: "Quote has been successfully generated and sent.",
                quote: {
                    quote_id: quote.number
                },
                email_results: res
            };
            reply(response);
        }, function(error) {
            var response = {
                status: 200,
                error: false,
                message: "Confirmation email could not be sent",
                quote: {
                    quote_id: quote.number
                },
                email_results: error
            };
            reply(response);
        });
    };


    /**
     * Send Reset Password Email
     * Send new auto-generated password
     * @param email
     * @param password
     * @param reply
     */
    function sendWelcomeEmail(email, password, support_desk, manager, reply) {
        var params = {
            template_name: 'welcome-template',
            template_content: [],
            message: {
                subject: 'Welcome to Replogic',
                to: [{
                    email: email,
                    type: 'to'
                }],
                global_merge_vars: [{
                    name: 'PASSWORD',
                    content: password
                }, {
                    name: 'SUPPORT_EMAIL',
                    content: support_desk.contact
                }, {
                    name: 'MANAGER_EMAIL',
                    content: manager.email
                }]
            },
            async: false
        };

        // send reset password email to user
        emailClient.sendTemplate(params, function (res) {
            var response = {
                status: 200,
                error: false,
                message: "Account has been successfully created.",
                email_results: res
            };
            reply(response);
        }, function(error) {
            var response = {
                status: 400,
                error: true,
                message: "Welcome email could not be sent!",
                email_results: error
            };
            reply(response);
        });
    };


    /**
     * Send Reset Password Email
     * Send new auto-generated password
     * @param email
     * @param password
     * @param reply
     */
    function sendResetPassword(email, password, support_desk, manager, reply) {
        var params = {
            template_name: 'reset-password',
            template_content: [],
            message: {
                subject: 'Password Reset Confirmation',
                to: [{
                    email: email,
                    type: 'to'
                }],
                global_merge_vars: [{
                    name: 'PASSWORD',
                    content: password
                }, {
                    name: 'SUPPORT_EMAIL',
                    content: support_desk.contact
                }, {
                    name: 'MANAGER_EMAIL',
                    content: manager.email
                }]
            },
            async: false
        };

        // send reset password email to user
        emailClient.sendTemplate(params, function (res) {
            var response = {
                status: 200,
                error: false,
                message: "An email has been sent with a new Password.",
                email_results: res
            };
            reply(response);
        }, function(error) {
            var response = {
                status: 400,
                error: true,
                message: "Password could not be sent to user",
                email_results: error
            };
            reply(response);
        });
    };


    /**
     * Send Reset Password Email
     * Send new auto-generated password
     * @param email
     * @param password
     * @param reply
     */
    function sendChangePassword(email, support_desk, manager, reply) {
        var params = {
            template_name: 'change-password',
            template_content: [],
            message: {
                subject: 'Password Changed',
                to: [{
                    email: email,
                    type: 'to'
                }],
                global_merge_vars: [{
                    name: 'SUPPORT_EMAIL',
                    content: support_desk.contact
                }, {
                    name: 'MANAGER_EMAIL',
                    content: manager.email
                }]
            },
            async: false
        };

        // send reset password email to user
        emailClient.sendTemplate(params, function (res) {
            var response = {
                status: 200,
                error: false,
                message: "Password has been successfully changed.",
                email_results: res
            };
            reply(response);
        }, function(error) {
            var response = {
                status: 200,
                error: false,
                message: "success",
                email_results: error
            };
            reply(response);
        });
    };

    return {
        sendWelcomeEmail: sendWelcomeEmail,
        sendResetPassword: sendResetPassword,
        sendQuoteEmails: sendQuoteEmails,
        sendChangePassword: sendChangePassword
    };

}();