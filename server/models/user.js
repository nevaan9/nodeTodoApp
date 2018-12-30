const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

// Define a User Schema
let UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        require: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

// User Schema Methods
// Override the toJSON method, we send back only relevant information to the client
// .methods is an instance method
UserSchema.methods.toJSON = function () {
    let user = this;
    let userObject = user.toObject();

    // Pick the variables we want to send back
    return _.pick(userObject, ['_id', 'email']);
};

// Custom method to generate auth token
UserSchema.methods.genAuthToken = function() {
    let user = this;
    let access = 'auth';
    let token = jwt.sign({_id: user._id.toString(), access}, process.env.JWT_SECRET).toString();

    user.tokens = user.tokens.concat([{access, token}]);

    // return the token (from the then); this then is returned in the POST /users
    return user.save()
        .then(() => {
            // return the token
            return token
        })
};

// Finds if the passed x-auth token matches; if so, pass the user info
UserSchema.statics.findByToken = function (token) {
    // This is the UserSchema; Not a specific user object
    let User = this;
    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return Promise.reject();
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

// Find a user by their credentials
UserSchema.statics.findByCredentials = function (email, password) {
    let User = this;
    return User.findOne({email})
        .then((user) => {
            if (!user) {
                return Promise.reject();
            }

            return new Promise((resolve, reject) => {
                bcrypt.compare(password, user.password, (err, res) => {
                    if (res) {
                        resolve(user);
                    } else {
                        reject();
                    }
                });
            });
        })
};

// Function to remove a token
UserSchema.methods.removeToken = function (token) {
    let user = this;
    return user.update({
        $pull: {
            tokens: {token}
        }
    });
};

// This is an in-built function that runs every time before save is called
UserSchema.pre('save', function (next) {
    let user = this;
    // Only run if password was modified
    if (user.isModified('password')) {
        // Hashes a password using salt (which is using an extra character at the end of the actual password)
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

let User = mongoose.model('User', UserSchema);

module.exports = {User};
