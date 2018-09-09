const jwt = require('jsonwebtoken')

const {ObjectID} = require('mongodb')
const {Todo} = require('../../models/todo')
const {User} = require('../../models/user')

const userOneId = new ObjectID()
const userTwoId = new ObjectID()
const users = [{
    _id: userOneId,
    email: 'adrianbabame@gmail.com',
    password: 'user1pass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
    }]
}, {
    _id: userTwoId,
    email: 'jen@example.com',
    password: 'userTwoPass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userTwoId, access: 'auth'}, 'abc123').toString()
    }]
}]

const todos = [{
    _id: new ObjectID(),
    text: "Some todos",
    _creator: userOneId
}, {
    _id: new ObjectID(),
    text: "Todos from test",
    completed: true,
    completedAt: new Date().getTime(),
    _creator: userTwoId
}]

const populateTodos = (done) => {
    Todo.deleteMany({}).then(() => {
         return Todo.insertMany(todos)
    }).then(() => done())
}

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save()
        var userTwo = new User(users[1]).save()

        return Promise.all([userOne, userTwo])
    }).then(() => {
        done()
    })
}

module.exports = {populateTodos, todos, populateUsers, users}