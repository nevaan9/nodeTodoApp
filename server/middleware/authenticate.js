let {User} = require('./../models/user');

// Middleware to handle authentication; We can use these in our private routes
let authenticate = function (req, res, next) {
    let token = req.header('x-auth');

    User.findByToken(token)
        .then((user) => {
            if (!user) {
                return Promise.reject();
            }

            // Attach this to the req that what ever routes that use this middleware
            req.user = user;
            req.token = token;
            next();
        })
        .catch((e) => {
            res.status(401).send(e);
        })
};

// EXPORT THE AUTH MODULE
module.exports = {authenticate};
