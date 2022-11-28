export default {
  'properties': {
    'name': {
      'type': 'string'
    },
    'timedate': {
      'type': 'string'
    },
    'done': {
      'type': 'boolean'
    }
  },
  'required': ['name', 'timedate', 'done'],
  'additionalProperties': false
} as const;