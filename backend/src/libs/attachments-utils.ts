import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '@libs/logger'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('AttachmentsUtils')

export class AttachmentsUtils {
    constructor(
        private readonly s3 = new XAWS.S3({
            signatureVersion: 'v4',
        }),
        private readonly attachmentsBucket = process.env.ATTACHMENT_S3_BUCKET ||
            '',
        private readonly uploadUrlExpiration = Number(
            process.env.ATTACHMENT_UPLOAD_URL_EXPIRATION || '0'
        ),
        private readonly downloadUrlExpiration = Number(
            process.env.ATTACHMENT_DOWNLOAD_URL_EXPIRATION || '0'
        )
    ) { }

    async fileExists(todoId: string): Promise<boolean> {
        try {
            logger.info('Checking if file exists', {
                Bucket: this.attachmentsBucket,
                Key: todoId
            })
            const head = await this.s3
                .headObject({
                    Bucket: this.attachmentsBucket,
                    Key: todoId
                })
                .promise()
            logger.info('Head object result', { head })
            return true
        } catch (error) {
            logger.error('Head object error', { error })
            return false
        }
    }

    getUploadUrl(todoId: string) {
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.attachmentsBucket,
            Key: todoId,
            Expires: this.uploadUrlExpiration
        })
    }

    getDownloadUrl(todoId: string) {
        return this.s3.getSignedUrl('getObject', {
            Bucket: this.attachmentsBucket,
            Key: todoId,
            Expires: this.downloadUrlExpiration
        })
    }
}