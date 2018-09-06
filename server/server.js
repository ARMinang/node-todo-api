const {ObjectID} = require('mongodb')
const express = require('express')
const bodyParser = require('body-parser')
const _ = require('lodash')

var {Todo} = require('./models/todo')
var {config} = require('./config/config')

var app = express()

app.use(bodyParser.json())

app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  })
  todo.save().then((doc) => {
    res.status(201).send(doc)
  }, (err) => {
    res.status(400).send(err)
  })
})

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.status(200).send({todos})
  }).catch((err) => {
    res.status(400).send(err)
  })
})

app.get('/todos/:id', (req, res) => {
  var id = req.params.id
  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }
  Todo.findById(id).then((todo) => {
    if (!todo) {
      return res.status(404).send()
    }
    res.status(200).send({todo})
  }).catch((err) => {
    res.status(404).send()
  })
  
})

app.delete('/todos/:id', (req, res) => {
  var id = req.params.id
  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }
  Todo.findByIdAndRemove(id).then((todo) => {
    if (!todo) {
      return res.status(404).send()
    }
    res.status(200).send({todo})
  }).catch((err) => {
    res.status(404).send()
  })
})

app.patch('/todos/:id', (req, res) => {
  var id = req.params.id
  var body = _.pick(req.body, ['text', 'completed'])
  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime()
  } else {
    body.completed = false
    body.completedAt = null
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true})
    .then((todo) => {
      if (!todo) {
        return res.status(404).send()
      }
      res.status(200).send({todo})
    }).catch((err) => {
      res.status(404).send()
    })
})

app.listen(3000, () => {
  console.log('Starting on port 3000')
})

module.exports = {app}