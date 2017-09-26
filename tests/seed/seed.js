const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');
const {Todo} = require('./../../server/models/todo');
const {User} = require('./../../server/models/user');

//Set todo db
const todos = [
    {
        _id: new ObjectID(),
        text: 'first todo test'
    }, {
        _id: new ObjectID(),
        text: 'second todo test',
        completed: true,
        completed: Date.now()
    }
];

const populateTodos = (done) => {
    Todo.remove({})
        .then(() => {
            return Todo.insertMany(todos);
        })
        .then(() => done());
};

const user1Id = new ObjectID();
const user2Id = new ObjectID();
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
            }, 'salt').toString()
        }]
    }, {
        _id: user2Id,
        email: 'test2@test.com',
        password: 'password2'
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