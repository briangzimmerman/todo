require('./config/config');
const{mongoose} = require('./db/mongoose');
const{Todo} = require('./models/todo');
const{User} = require('./models/user');

const {ObjectID} = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');


const app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    let todo = new Todo({
        text: req.body.text
    });

    todo.save()
        .then((todo) => {
            res.send({todo});
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

app.get('/todos', (req, res) => {
    Todo.find()
        .then((todos) => res.send({todos}))
        .catch((err) => res.status(400).send(err));
});

app.get('/todos/:id', (req, res) => {
    let id = req.params.id;
    if(!ObjectID.isValid(id)) {
        res.status(404).send();
    } else {
        Todo.findById(id)
            .then((todo) => {
                todo ? res.send({todo}) : res.status(404).send();
            })
            .catch((err) => {
                res.status(400).send();
            })
    }
});

app.delete('/todos/:id', (req, res) => {
    let id = req.params.id;
    if(!ObjectID.isValid(id)) { res.status(404).send(); }
    else {
        Todo.findByIdAndRemove(id)
            .then((todo) => {
                todo ? res.send({todo}) : res.status(404).send();
            })
            .catch((err) => {
                res.status(400).send();
            });
    }
});

app.patch('/todos/:id', (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['text', 'completed']);
    if(!ObjectID.isValid(id)) { res.status(404).send(); }
    else {
        if(_.isBoolean(body.completed) && body.completed) {
            body.completedAt = Date.now();
        } else {
            body.completedAt = null;
            body.completed = false;
        }
        Todo.findByIdAndUpdate(id, {$set: body}, {new: true})
            .then((todo) => {
                todo ? res.send({todo}) : res.status(404).send();
            })
            .catch((err) => res.status(400).send());
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Started express server on port ${process.env.PORT}...`);
})

module.exports = {
    app
}