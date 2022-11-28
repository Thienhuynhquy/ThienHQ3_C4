export default {
  'properties': {
    'name': {
      'type': 'string'
    },
    'dueDate': {
      'type': 'string'
    },
  },
  'required': [
    'name',
    'dueDate',
  ],
  'additionalProperties': false
} as const;