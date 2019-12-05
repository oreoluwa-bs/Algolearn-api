/* eslint-disable consistent-return */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

const User = require('../models/user');

const signup = (req, res) => {
    bcrypt.hash(req.body.password, 10).then((hash) => {
        const user = new User({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            role: req.body.role,
            password: hash,
        });
        user.save().then((data) => {
            res.status(200).json({
                status: 'success',
                data,
            });
        }).catch((err) => {
            res.status(400).json({
                status: 'error',
                message: err,
            });
        });
    }).catch((err) => {
        res.status(400).json({
            status: 'error',
            message: err,
        });
    });
};

const login = (req, res) => {
    User.findOne({ email: req.body.email }).then((user) => {
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Incorrect email or password',
            });
        }
        bcrypt.compare(req.body.password, user.password).then((valid) => {
            if (!valid) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Incorrect email or password',
                });
            }
            const token = jwt.sign(
                { userId: user.id },
                config.decrypt_me,
                { expiresIn: '24h' },
            );
            res.status(200).json({
                status: 'success',
                userId: user.id,
                token,
            });
        }).catch((err) => {
            res.status(401).json({
                status: 'success',
                message: err,
            });
        });
    }).catch((err) => {
        res.status(401).json({
            status: 'success',
            message: err,
        });
    });
};

const getUsers = (req, res) => {
    User.find().then((data) => {
        res.status(200).json({
            status: 'success',
            data,
        });
    }).catch((err) => {
        res.status(400).json({
            status: 'error',
            message: err,
        });
    });
};


const editUser = (req, res) => {
    User.findById(req.params.userId).then((result) => {
        const oldUser = result;
        bcrypt.hash(req.body.password, 10).then((hash) => {
            const user = new User({
                _id: oldUser.id,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                role: req.body.role,
                password: hash,
                enrolledCourses: oldUser.enrolledCourses,
            });
            User.updateOne({ _id: req.params.userId }, user).then(() => {
                res.status(200).json({
                    status: 'success',
                    message: 'User has been updated',
                });
            }).catch((err) => {
                res.status(400).json({
                    status: 'error',
                    message: err,
                });
            });
        }).catch((err) => {
            res.status(400).json({
                status: 'error',
                message: err,
            });
        });
    }).catch((err) => {
        res.status(400).json({
            status: 'error',
            message: err,
        });
    });
};

const deleteUser = (req, res) => {
    if (res.locals.userId === req.params.userId) {
        User.deleteOne({ _id: req.params.userId }).then(() => {
            res.status(200).json({
                status: 'success',
                message: 'User account has been deleted',
            });
        }).catch((err) => {
            res.status(400).json({
                status: 'error',
                message: err,
            });
        });
    } else {
        res.status(400).json({
            status: 'error',
            message: 'Only user can delete this account',
        });
    }
};

module.exports = {
    signup,
    login,
    getUsers,
    deleteUser,
    editUser,
};
