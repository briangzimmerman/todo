const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');
const { Todo } = require('./../../server/models/todo');
const { User } = require('./../../server/models/user');

const user1Id = new ObjectID();
const user2Id = new ObjectID();

//Set todo db
const todos = [
    {
        _id: new ObjectID(),
        text: 'first todo test',
        _creator: user1Id
    }, {
        _id: new ObjectID(),
        text: 'second todo test',
        completed: true,
        completed: Date.now(),
        _creator: user2Id
    }
];

const populateTodos = (done) => {
    Todo.remove({})
        .then(() => {
            return Todo.insertMany(todos);
        })
        .then(() => done());
};

const users = [
    {
        _id: user1Id,
        email: 'test@test.com',
        password: 'password',
        tokens: [{
            access: 'auth',
            token: jwt.sign({
                _id: user1Id,
                access: 'auth'
            }, process.env.JWT_SALT).toString()
        }]
    }, {
        _id: user2Id,
        email: 'test2@test.com',
        password: 'password2',
        tokens: [{
            access: 'auth',
            token: jwt.sign({
                _id: user2Id,
                access: 'auth'
            }, process.env.JWT_SALT).toString()
        }]
    }
];

const populateUsers = (done) => {
    User.remove({})
        .then(() => {
            let user1 = new User(users[0]).save();
            let user2 = new User(users[1]).save();
            return Promise.all([user1, user2]);
        })
        .then(() => done());
};

module.exports = {
    todos,
    populateTodos,
    users,
    populateUsers
};