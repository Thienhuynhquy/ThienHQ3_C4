import { v4 as uuidv4 } from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { TodosAccess } from '../dataLayer/todosAccess'
import { AttachmentsUtils } from '@libs/attachments-utils'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const access = new TodosAccess()
const attachmentsImg = new AttachmentsUtils()

export async function getUser(userId: string): Promise<TodoItem[]> {
    const items = await access.getAllItems(userId)
    for (const item of items) {
        const ids = item.todoId
        if (ids && (await attachmentsImg.fileExists(ids))) {
            item.attachmentUrl = attachmentsImg.getDownloadUrl(ids)
        }
    }
    return items
}

export async function CreateUsers(
    userId: string,
    createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {
    const todoId = uuidv4()

    return await access.createItem({
        userId: userId,
        todoId,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false
    })
}

export async function updateUsers(
    userId: string,
    todoId: string,
    updateTodoRequest: UpdateTodoRequest
): Promise<boolean> {
    return await access.updateItem(userId, todoId, updateTodoRequest)
}

export async function deleteUsers(
    userId: string,
    todoId: string
): Promise<void> {
    await access.deleteItem(userId, todoId)
}

export async function getAttachmentUploadUrl(
    userId: string,
    todoId: string
): Promise<string | null> {
    const Upload = await access.findById(userId, todoId)
    if (!Upload) {
        return null
    }

    return attachmentsImg.getUploadUrl(todoId)
}