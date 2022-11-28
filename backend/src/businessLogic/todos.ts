import { v4 as uuidv4 } from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodosAccess } from '../dataLayer/todosAccess'
import { AttachmentsUtils } from '@libs/attachments-utils'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todosAccess = new TodosAccess()
const attachmentsUtils = new AttachmentsUtils()

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    const items = await todosAccess.getAllTodoItems(userId)
    for (const item of items) {
        const todoId = item.todoId
        if (todoId && (await attachmentsUtils.fileExists(todoId))) {
            item.attachmentUrl = attachmentsUtils.getDownloadUrl(todoId)
        }
    }
    return items
}

export async function createTodo(
    userId: string,
    createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {
    const todoId = uuidv4()

    return await todosAccess.createTodoItem({
        userId: userId,
        todoId,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false
    })
}

export async function updateTodo(
    userId: string,
    todoId: string,
    updateTodoRequest: UpdateTodoRequest
): Promise<boolean> {
    return await todosAccess.updateTodoItem(userId, todoId, updateTodoRequest)
}

export async function deleteTodo(
    userId: string,
    todoId: string
): Promise<void> {
    await todosAccess.deleteTodoItem(userId, todoId)
}

export async function getAttachmentUploadUrl(
    userId: string,
    todoId: string
): Promise<string | null> {
    const todoItem = await todosAccess.findItemById(userId, todoId)
    if (!todoItem) {
        return null
    }

    return attachmentsUtils.getUploadUrl(todoId)
}