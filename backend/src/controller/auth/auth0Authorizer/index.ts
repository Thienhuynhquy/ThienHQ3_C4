import { handlerPath } from '@libs/handler-resolver';

export const eventHandler = {
  handler: `${handlerPath(__dirname)}/handler.main`,
}