import { v4 as uuidv4 } from 'uuid'
import { UserItem } from '../paramModle/UserItem'
import { UsersAccess } from '../dataLayer/usersAccess'
import { AttachmentsUtils } from '@libs/attachments-utils'
import { CreateRequestUser } from '../requestDTO/CreateRequestUser'
import { UpdateRequestUser } from '../requestDTO/UpdateRequestUser'

const access = new UsersAccess()
const attachmentsImg = new AttachmentsUtils()

export async function getUser(userId: string): Promise<UserItem[]> {
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
    CreateRequestUser: CreateRequestUser
): Promise<UserItem> {
    const todoId = uuidv4()

    return await access.createItem({
        userId: userId,
        todoId,
        createdAt: new Date().toISOString(),
        name: CreateRequestUser.name,
        timedate: CreateRequestUser.timedate,
        done: false
    })
}

export async function updateUsers(
    userId: string,
    todoId: string,
    UpdateRequestUser: UpdateRequestUser
): Promise<boolean> {
    return await access.updateItem(userId, todoId, UpdateRequestUser)
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