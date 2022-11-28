export default {
  'properties': {
    'name': {
      'type': 'string'
    },
    'dueDate': {
      'type': 'string'
    },
    'done': {
      'type': 'boolean'
    }
  },
  'required': ['name', 'dueDate', 'done'],
  'additionalProperties': false
} as const;