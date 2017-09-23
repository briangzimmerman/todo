let {mongoose} = require('./db/mongoose');
let {Todo} = require('./models/todo');
let {User} = require('./models/user');

let {ObjectID} = require('mongodb');
let express = require('express');
let bodyParser = require('body-parser');

let app = express();
let port = process.env.PORT || 3000;

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

app.listen(port, () => {
    console.log(`Started express server on port ${port}...`);
})

module.exports = {
    app
}