import { type Events } from '@noaignite/centra-types'
import { isObject } from '@noaignite/utils'
import type { NextApiRequest } from 'next'
import crypto from 'node:crypto'

const sign = (secret: string, dataString: string) => {
  const hmac = crypto.createHmac('sha256', secret)

  hmac.update(dataString)

  return hmac.digest('hex')
}

/**
 * Parse a named parameters string into an object.
 * @example
 * parseNamedParametersString('foo=bar,baz=qux') // \{ foo: 'bar', baz: 'qux' \}
 */
const parseNamedParametersString = (input: string): Record<string, string> => {
  return input.split(',').reduce((acc, pair) => {
    const [key, value] = pair.split('=')
    if (!key) {
      return acc
    }

    return { ...acc, [key]: value }
  }, {})
}

const parseRawBody = (rawBody: unknown): { payload: string } | null => {
  if (rawBody && isObject(rawBody) && 'payload' in rawBody && typeof rawBody.payload === 'string') {
    return rawBody as { payload: string }
  }

  return null
}

type CreateGetCentraWebhookEventsConfig<TRequest> = {
  adapter: {
    isRequestMethodPost?: (request: TRequest) => boolean
    getHeader: (request: TRequest, headerKey: string) => string | null | undefined
    getRawBody: (request: TRequest) => unknown
  }
  secret?: string
}

type CentraWebhookEventsError =
  | [{ message: 'Invalid request method' }]
  | [{ message: 'No signature' }]
  | [{ message: 'Invalid request body' }]
  | [{ message: 'Invalid signature' }]
type CentraWebhookEventsData = [undefined, Partial<Record<Events, string[]>>]

export type CentraWebhookEventsResults = CentraWebhookEventsError | CentraWebhookEventsData

/**
 * Create get Centra webhook events.
 * Parses and returns the events passed from Centra.
 *
 * @example
 * ```typescript
 * const getCentraWebhookEvents = createGetCentraWebhookEvents({
 *   adapter: nextAppRouterAdapter
 * })
 *
 * const POST = async (req: Request) => {
 *   const [error, results] = await getCentraWebhookEvents(req)
 *
 *   if (error) {
 *     // Handle error codes
 *     return Response.json({ message: 'Error' }, { status: 500 })
 *   }
 *
 *   if ('products' in results) {
 *     return Response.json({ products: results.products }, { status: 200 })
 *   }
 * }
 * ```
 *
 * @see https://centra.dev/docs/services/centra-webhooks
 */
export function createGetCentraWebhookEvents<TRequest>(
  config: CreateGetCentraWebhookEventsConfig<TRequest>,
) {
  const { adapter, secret } = config
  const { getHeader, getRawBody, isRequestMethodPost } = adapter

  return async (request: TRequest): Promise<CentraWebhookEventsResults> => {
    if (isRequestMethodPost && !isRequestMethodPost(request)) {
      return [{ message: 'Invalid request method' as const }] as const
    }

    const rawBody = await getRawBody(request)
    const body = parseRawBody(rawBody)

    if (!body) {
      return [
        {
          message: 'Invalid request body',
        },
      ] satisfies CentraWebhookEventsError
    }

    if (secret) {
      const signature = getHeader(request, 'x-centra-signature')

      if (!signature) {
        return [
          {
            message: 'No signature',
          },
        ] satisfies CentraWebhookEventsError
      }

      const parameters = parseNamedParametersString(signature)

      // @see https://centra.dev/docs/extend-with-plugins/integrations/centra-webhooks#signature-verification
      if (
        sign(secret, `${parameters.t}.payload=${encodeURIComponent(body.payload)}`) !==
        parameters.v1
      ) {
        console.error('Invalid signature')

        return [{ message: 'Invalid signature' }] satisfies CentraWebhookEventsError
      }
    }

    const payloadParsed = JSON.parse(body.payload) as unknown

    return [undefined, payloadParsed] as CentraWebhookEventsData
  }
}

export const nextAppRouterAdapter: CreateGetCentraWebhookEventsConfig<Request>['adapter'] = {
  getHeader: (request, headerKey) => {
    return request.headers.get(headerKey)
  },
  getRawBody: async (request) => {
    const formData = await request.formData()

    // Returning an object representation of `FormData`
    return Object.fromEntries([...formData.entries()])
  },
}

export const nextPagesRouterAdapter: CreateGetCentraWebhookEventsConfig<NextApiRequest>['adapter'] =
  {
    isRequestMethodPost: (request) => {
      return request.method === 'POST'
    },
    getHeader: (request, headerKey) => {
      const header = request.headers[headerKey]

      if (Array.isArray(header)) {
        throw new Error('Multiple headers with same key passed.')
      }

      return header
    },
    getRawBody: (req) => {
      return req.body as unknown
    },
  }
