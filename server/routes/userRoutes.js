const express = require('express');
const router = express.Router();
const _ = require('lodash');

let {User} = require('./../models/user');
let {authenticate} = require('./../middleware/authenticate');

// Create a user
router.post('/', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);
    let user = new User(body);

    user.save()
        .then(() => {
            return user.genAuthToken();
        })
        .then((token) => {
            // this .then gets the return from the above return .then (the genAuthToken function)
            res.header('x-auth', token).send(user);
        })
        .catch((e) => {
            res.status(400).send(e);
        })
});

// Login a user
router.post('/login', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password)
        .then((user) => {
            user.genAuthToken().then((token) => {
                res.header('x-auth', token).send(user);
            });
        })
        .catch((e) => {
            res.status(400).send();
        })
});

// Delete a user
router.delete('/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token)
        .then(() => {
            res.status(200).send();
        }, () => {
            res.status(400).send();
        });
});

// Authenticate a user; Authenticate middleware is used.
router.get('/me', authenticate, (req, res) => {
    res.send(req.user);
});

module.exports = router;
