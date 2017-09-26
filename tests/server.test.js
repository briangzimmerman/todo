const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server/server');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /todos', () => {
    //You need done because it's async.  Call done() when done.
    it('Should create a new todo', (done) => {
        let text = 'Test todo';
        request(app)
            .post('/todos')
            .send({ text })
            .expect(200) //Good status
            .expect((res) => {
                expect(res.body.todo.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                } else { //test that it's in db
                    Todo.find({ text })
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
                if (err) {
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

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        request(app)
            .get(`/todos/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return a 404 for non-ObjectIDs', (done) => {
        request(app)
            .get('/todos/123')
            .expect(404)
            .end(done);
    })
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        let id = todos[0]._id.toHexString();
        request(app)
            .delete(`/todos/${id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(id);
            })
            .end((err, res) => {
                if (err) { done(err); }
                else {
                    Todo.findById(id)
                        .then((todo) => {
                            expect(todo).toNotExist();
                            done();
                        })
                        .catch((err) => done());
                }
            });
    });

    it('should return 404 if todo not found', (done) => {
        request(app)
            .delete(`/todos/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 if object id is invalid', (done) => {
        request(app)
            .get('/todos/123')
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should update a todo', (done) => {
        let id = todos[0]._id.toHexString();
        let updated = {
            text: "It has been updated",
            completed: true
        };
        request(app)
            .patch(`/todos/${id}`)
            .send(updated)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(updated.text);
                expect(res.body.todo.completed).toBeTruthy();
                expect(res.body.todo.completedAt).toBeA('number');
            })
            .end(done);
    });

    it('should clear completed at when todo is not completed', (done) => {
        let id = todos[1]._id.toHexString();
        let updated = {
            text: 'It has been updated',
            completed: false
        };
        request(app)
            .patch(`/todos/${id}`)
            .send(updated)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(updated.text);
                expect(res.body.todo.completed).toBeFalsy();
                expect(res.body.todo.completedAt).toBe(null);
            })
            .end(done);
    });
});

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.user._id).toBe(users[0]._id.toHexString());
                expect(res.body.user.email).toBe(users[0].email);
            })
            .end(done);
    });

    it('should return a 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        let email = 'testEmail@test.com';
        let password = 'testPassword';
        request(app)
            .post('/users')
            .send({ email, password })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
                expect(res.body.user._id).toExist();
                expect(res.body.user.email).toBe(email);
            })
            .end((err) => {
                if (err)
                    return done(err);
                User.findOne({ email })
                    .then((user) => {
                        expect(user).toExist();
                        expect(user.password).toNotBe(password);
                        done();
                    })
                    .catch((err) => {
                        done(err);
                    })
            });
    });

    it('should return validation errors', (done) => {
        let user = {
            email: 'notAnEmail',
            password: 'oops'
        };
        request(app)
            .post('/users')
            .send(user)
            .expect(400)
            .end(done);
    });

    it('should not create user if email in use', (done) => {
        request(app)
            .post('/users')
            .send(users[0])
            .expect(400)
            .end(done);
    });
});

describe('POST /users/login', () => {
    it('should login user and set token', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
            })
            .end((err, res) => {
                if (err) { done(err); }
                User.findById(users[1]._id)
                    .then((user) => {
                        expect(user.tokens[0]).toInclude({
                            access: 'auth',
                            token: res.headers['x-auth']
                        });
                        done();
                    })
                    .catch((err) => {
                        done(err);
                    })
            });
    });

    it('should reject invalid login', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: 'wrongpassword'
            })
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).toNotExist();
            })
            .end((err, res) => {
                if (err) { done(err); }
                User.findById(users[1]._id)
                    .then((user) => {
                        expect(user.tokens.length).toBe(0);
                        done();
                    })
                    .catch((err) => {
                        done(err);
                    })
            });
    });
});

describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', (done) => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .end((err, res) => {
                if(err) { return done(err); }
                User.findById(users[0]._id)
                    .then((user) => {
                        expect(user.tokens.length).toBe(0);
                        done();
                    })
                    .catch((error) => {
                        done(error);
                    });
            });
    });
});