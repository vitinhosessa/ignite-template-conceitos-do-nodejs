const express = require('express')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid')

const app = express()

app.use(cors())
app.use(express.json())

const users = []

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find((user) => user.username === username)
  if (!user) return response.status(404).json({ error: "User don't exists!" })

  request.userInfo = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadyExists = users.some((user) => user.username === username)
  if (userAlreadyExists) return response.status(400).json({ error: "User already exists!" })

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  return response.status(201).json(newUser)
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { userInfo } = request

  return response.status(201).json(userInfo.todos)
})

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { userInfo } = request

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  userInfo.todos.push(newTodo)

  return response.status(201).json(newTodo)
})

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { userInfo } = request
  const { id } = request.params

  const todo = userInfo.todos.find((todo) => todo.id === id)
  if (!todo) return response.status(404).json({ "error": "Todo not found!"})

  todo.title = title
  todo.deadline = new Date(deadline)

  return response.status(201).json(todo)
})

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { userInfo } = request
  const { id } = request.params
  
  const todo = userInfo.todos.find((todo) => todo.id === id)
  if (!todo) return response.status(404).json({ "error": "Todo not found!"})

  todo.done = true

  return response.status(201).json(todo)
})

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { userInfo } = request
  const { id } = request.params

  const targetedTodoIndex = userInfo.todos.findIndex((todo) => todo.id === id)
  if (targetedTodoIndex === -1) return response.status(404).json({ "error": "Todo not found!"})

  userInfo.todos.splice(targetedTodoIndex, 1)

  return response.status(204).send()
})

module.exports = app