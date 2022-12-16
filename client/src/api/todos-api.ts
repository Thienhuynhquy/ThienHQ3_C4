import { apiEndpoint } from '../config'
import { User } from '../types/Todo';
import { CreateRequestUser } from '../types/CreateTodoRequest';
import Axios from 'axios'
import { UpdateRequestUser } from '../types/UpdateTodoRequest';

export async function getTodos(idToken: string): Promise<User[]> {
  console.log('Fetching todos')

  const response = await Axios.get(`${apiEndpoint}/users`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Todos:', response.data)
  return response.data.items
}

export async function CreateUsers(
  idToken: string,
  newTodo: CreateRequestUser
): Promise<User> {
  const response = await Axios.post(`${apiEndpoint}/users`, JSON.stringify(newTodo), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchTodo(
  idToken: string,
  todoId: string,
  updatedTodo: UpdateRequestUser
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/users/${todoId}`, JSON.stringify(updatedTodo), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteUsers(
  idToken: string,
  todoId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/users/${todoId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  todoId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/users/${todoId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
