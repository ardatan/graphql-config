import test from 'ava'
import { graphql, introspectionQuery } from 'graphql'
import { GraphQLProjectConfig } from '../../src'
import { serveSchema } from '../utils'
const introspection = require('../schema.json')

test.before(async (t) => {
  return await serveSchema()
})

test('getEndpointsMap when endpoint is string url', async (t) => {
  const config = {
    schemaPath: '../schema.json',
    extensions: {
      endpoint: 'http://default',
    },
  }

  const inst = new GraphQLProjectConfig(__dirname, undefined, config)

  t.deepEqual(inst.getEndpointsMap(), { default: { url: 'http://default' }})
})

test('getEndpointsMap when endpoint is single endpoint config', async (t) => {
  const config = {
    schemaPath: '../schema.json',
    extensions: {
      endpoint: {
        url: 'http://default',
        subscription: {
          url: 'ws://test',
        },
      },
    },
  }

  const inst = new GraphQLProjectConfig(__dirname, undefined, config)

  t.deepEqual(inst.getEndpointsMap(), { default: config.extensions.endpoint })
})

test('getEndpointsMap when endpoint is endpoints map', async (t) => {
  const config = {
    schemaPath: '../schema.json',
    extensions: {
      endpoint: {
        dev: {
          url: 'http://dev',
          subscription: {
            url: 'ws://dev',
          },
        },
        prod: {
          url: 'http://prod',
          subscription: {
            url: 'ws://prod',
          },
        },
      },
    },
  }

  const inst = new GraphQLProjectConfig(__dirname, undefined, config)

  t.deepEqual(inst.getEndpointsMap(), config.extensions.endpoint)
})

test('resolveSchemaFromEndpoint should throw if non-existing endpoint is specified', async (t) => {
  const config = {
    schemaPath: '../schema.json',
    extensions: {
      endpoint: {
        dev: {
          url: 'http://dev',
          subscription: {
            url: 'ws://dev',
          },
        },
      },
    },
  }
  const inst = new GraphQLProjectConfig(__dirname, undefined, config)
  let error
  error = t.throws(() => inst.resolveSchemaFromEndpoint('prod'))
  t.regex(error.message, /^Endpoint.*is not defined/)
  error = t.throws(() => inst.resolveSchemaFromEndpoint('default'))
  t.regex(error.message, /^Endpoint.*is not defined/)
})

test('resolveSchemaFromEndpoint HTTP', async (t) => {
  const config = {
    schemaPath: '../schema.json',
    extensions: {
      endpoint: 'http://127.0.0.1:33333',
    },
  }

  const inst = new GraphQLProjectConfig(__dirname, undefined, config)
  const schema = await inst.resolveSchemaFromEndpoint()
  const resolvedIntrospection = await graphql(schema, introspectionQuery)
  t.deepEqual(resolvedIntrospection, introspection)
})