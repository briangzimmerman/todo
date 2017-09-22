let {mongoose} = require('./db/mongoose');
let {Todo} = require('./models/todo');
let {User} = require('./models/user');

let express = require('express');
let bodyParser = require('body-parser');

let app = express();
let port = 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    let todo = new Todo({
        text: req.body.text
    });

    todo.save()
        .then((doc) => {
            res.send(doc);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

app.listen(port, () => {
    console.log(`Started express server on port ${port}...`);
})

module.exports = {
    app
}