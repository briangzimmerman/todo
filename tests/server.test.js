const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server/server');
const {Todo} = require('./../server/models/todo');

//Set todo db
const todos = [
    {
        text: 'first todo test'
    }, {
        text: 'second todo test'
    }
];

beforeEach((done) => {
    Todo.remove({})
        .then(() => {
            return Todo.insertMany(todos);
        })
        .then(() => done());
});

describe('POST /todos', () => {
    //You need done because it's async.  Call done() when done.
    it('Should create a new todo', (done) => {
        let text = 'Test todo';
        request(app)
            .post('/todos')
            .send({text})
            .expect(200) //Good status
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if(err) {
                    done(err);
                } else { //test that it's in db
                    Todo.find({text})
                        .then((todos) => {
                            expect(todos.length).toBe(1);
                            expect(todos[0].text).toBe(text);
                            done();
                        })
                        .catch((err) => done(err));
                }
            });
    });

    it('Should not insert todo', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if(err) {
                    done(err);
                } else {
                    Todo.find()
                        .then((todos) => {
                            expect(todos.length).toBe(2);
                            done();
                        })
                        .catch((err) => done(err));
                }
            });
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});