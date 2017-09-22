const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server/server');
const {Todo} = require('./../server/models/todo');

//Clear todo db
beforeEach((done) => {
    Todo.remove({})
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
                    Todo.find()
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
                            expect(todos.length).toBe(0);
                            done();
                        })
                        .catch((err) => done(err));
                }
            });
    });
});