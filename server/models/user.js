const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

let userSchema = new mongoose.Schema({
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
        required: true,
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

//Override to control what data gets sent back to the user
userSchema.methods.toJSON = function() {
    let user = this;
    let userObj = user.toObject();

    return _.pick(userObj, ['email', '_id']);
};

userSchema.methods.generateAuthToken = function() {
    let user = this;
    let access = 'auth';
    let token = jwt.sign({
        _id: user._id.toHexString(),
        access
    }, process.env.JWT_SALT).toString();

    user.tokens.push({access, token});
    return user.save()
        .then((res) => {
            return token;
        });
};

userSchema.methods.removeToken = function(token) {
    let user = this;
    return user.update({
        $pull: {
            tokens: {
                token
            }
        }
    });
};

userSchema.statics.findByToken = function(token) {
    let User = this;
    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SALT);
    } catch(err) {
        return Promise.reject();
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })
};

userSchema.statics.findByCredentials = function(email, password) {
    let User = this;
    return User.findOne({email})    
        .then((user) => {
            if(!user)
                return Promise.reject();
            return new Promise((res, rej) => {
                bcrypt.compare(password, user.password, (err, result) => {
                    result ? res(user) : rej();
                });
            });
        });
};

userSchema.pre('save', function(next) {
    let user = this;

    //Only hash if the password has been updated
    if(user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }
});

let User = mongoose.model('User', userSchema);

module.exports = {
    User
};