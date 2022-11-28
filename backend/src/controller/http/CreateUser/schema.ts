export default {
  'properties': {
    'name': {
      'type': 'string'
    },
    'timedate': {
      'type': 'string'
    },
  },
  'required': [
    'name',
    'timedate',
  ],
  'additionalProperties': false
} as const;