"use strict"

// get value or kill node process 
var getOrExit = function(valueName) {
    var value = process.env[valueName];
    if (value) return value
    console.log("Missing Config: " + valueName);
    process.exit(1)
};

module.exports = {
    pgConnectionString: getOrExit('MUNCHCAL_PG_CONNECTION_STRING'),
    sessionSecret: getOrExit('MUNCHCAL_SESSION_SECRET'),
    bcryptWorkFactor: parseInt(getOrExit('MUNCHCAL_BCRYPT_WORK_FACTOR')),
    munchcalApiUrl: getOrExit('MUNCHCAL_API_URL'),
    munchcalParserUrl: getOrExit('MUNCHCAL_PARSER_URL'),
    calendarFormat: 'YYYY-MM-DD'
};

