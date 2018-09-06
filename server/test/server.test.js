const expect = require('expect')
const request = require('supertest')
const {ObjectID} = require('mongodb')

const {app} = require('../server')
const {Todo} = require('../models/todo')

const todos = [{
    _id: new ObjectID(),
    text: "Some todos"
}, {
    _id: new ObjectID(),
    text: "Todos from test",
    completed: true,
    completedAt: new Date().getTime()
}]

beforeEach((done) => {
    Todo.deleteMany({}).then(() => {
         return Todo.insertMany(todos)
    }).then(() => done())
})


describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text'

        request(app)
            .post('/todos')
            .send({text})
            .expect(201)
            .expect((res) => {
                expect(res.body.text).toBe(text)
            })
            .end((err, res) => {
                if (err) {
                    return done(err)
                }

                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1)
                    expect(todos[0].text).toBe(text)
                    done()
                }).catch((e) => done(e))
            })
    })

    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err)
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2)
                    done()
                }).catch((e) => done(e))
            })
    })
})

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2)
            })
            .end(done)
    })
})

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text)
            })
            .end(done)
    })

    it('should return 404 if object not found', (done) => {
        const testObjectId = new ObjectID().toHexString()
        request(app)
            .get(`/todos/${testObjectId}`)
            .expect(404)
            .expect((res) => {
                expect(res.body).toEqual({})
            })
            .end(done)
    })

    it('should return 404 for non object id', (done) => {
        request(app)
            .get('/todos/123')
            .expect(404)
            .expect((res) => {
                expect(res.body).toEqual({})
            })
            .end(done)
    })
})

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        var id = todos[1]._id.toHexString()

        request(app)
            .delete(`/todos/${id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[1].text)
            })
            .end(done)
    })

    it('should return 404 if todo not found', (done) => {
        var id = new ObjectID().toHexString()

        request(app)
            .delete(`/todos/${id}`)
            .expect(404)
            .expect((res) => {
                expect(res.body).toEqual({})
            })
            .end(done)
    })

    it('should return 404 if object is invalid', (done) => {
        request(app)
            .delete('/todos/123')
            .expect(404)
            .expect((res) => {
                expect(res.body).toEqual({})
            })
            .end(done)
    })
})

describe('PATCH /todos/:id', () => {
    it('should update the todo', (done) => {
        var id = todos[0]._id.toHexString()
        var text = "This should be new text"
        request(app)
            .patch(`/todos/${id}`)
            .send({
                text,
                completed: true
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(text)
                expect(res.body.todo.completed).toBe(true)
                expect(typeof res.body.todo.completedAt).toBe('number')
            })
            .end(done)
    })

    it('should clear completedAt when todo is not completed', (done) => {
        var id = todos[1]._id.toHexString()
        var text = "This should be new text"
        request(app)
            .patch(`/todos/${id}`)
            .send({
                text,
                completed: false
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(text)
                expect(res.body.todo.completed).toBe(false)
                expect(res.body.todo.completedAt).toBe(null)
            })
            .end(done)
    })
})