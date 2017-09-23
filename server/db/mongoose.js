let mongoose = require('mongoose');

mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost:27017/Todoapp');
mongoose.connect('mongodb://<todoApp>:<S0meth1ngL0ngandC0mpl1cated>@ds147864.mlab.com:47864/todo-app');

module.exports = {
    mongoose
};