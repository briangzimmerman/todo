const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost:27017/Todoapp');
mongoose.connect('mongodb://todoApp:Wh0aWhatsThat!@ds147864.mlab.com:47864/todo-app');

module.exports = {
    mongoose
};