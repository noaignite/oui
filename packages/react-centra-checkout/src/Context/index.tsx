import * as React from 'react'
import cookies from 'js-cookie'
import type Cookies from 'js-cookie'
import ApiClient from '../ApiClient'
import CentraEvents from '../internal/CentraEvents'

const apiClient = ApiClient.default
const centraEvents = CentraEvents.default

/** The prop types that CentraProvider accepts */
export interface ProviderProps {
  /** Centra API URL */
  apiUrl: string
  children: React.ReactNode
  /** Disables automatic client side fetching of the Centra selection */
  disableInit?: boolean
  /** Sets the initial selection */
  initialSelection: Centra.CheckoutApi.SelectionResponse
  /** Used when submitting payment using the POST /payment Centra api call */
  paymentFailedPage: string
  /** Used when submitting payment using the POST /payment Centra api call */
  paymentReturnPage: string
  /** Receipt page to redirect to when Centra payment succeeds directly */
  receiptPage: string
  /**
    When the cookie used to store the Centra checkout token will expire, days as a number or a Date
    @defaultValue `365`
  */
  tokenExpires?: number | Date
  /**
    The name of the cookie used to store the Centra checkout token
    @defaultValue `centra-checkout-token`
  */
  tokenName?: string
  tokenCookieOptions?: Cookies.CookieAttributes
  /**
    Enables using accept header instead of api-token header
    @defaultValue `false`
  */
  useAcceptHeader?: boolean
}

export interface ContextMethods {
  /**
    @param item - The Centra item id
  */
  addItem?(item: string, quantity?: number): Promise<Centra.CheckoutApi.SelectionResponse>
  /**
    @param item - The Centra item id
    @param data - Bundle data
  */
  addBundleItem?(
    item: string,
    data?: Record<string, unknown>,
  ): Promise<Centra.CheckoutApi.SelectionResponse>
  /**
    @param giftCertificate - The `giftCertificate` value of the gift certificate to add
  */
  addGiftCertificate?(giftCertificate: string): Promise<Centra.CheckoutApi.SelectionResponse>

  addBackInStockSubscription?(
    data: Record<string, unknown>,
  ): Promise<Centra.CheckoutApi.SelectionResponse>
  /**
    @param giftCertificate - The `giftCertificate` value of the gift certificate to add
    @param amount - Custom gift certificate amount
  */
  addCustomGiftCertificate?(
    giftCertificate: string,
    amount: string,
  ): Promise<Centra.CheckoutApi.SelectionResponse>

  addNewsletterSubscription?(
    data: Record<string, unknown>,
  ): Promise<Centra.CheckoutApi.SelectionResponse>
  /**
    @param voucher - The id of the voucher to add
  */
  addVoucher?(voucher: string): Promise<Centra.CheckoutApi.SelectionResponse>
  /**
    @param line - The line id of the item to decrease
  */
  decreaseCartItem?(line: string): Promise<Centra.CheckoutApi.SelectionResponse>
  /**
    @param line - The line id of the item to increase
  */
  increaseCartItem?(line: string): Promise<Centra.CheckoutApi.SelectionResponse>
  /**
    @param selectionData - Initial selection data
  */
  init?(selectionData?: Centra.CheckoutApi.SelectionResponse): Promise<void>
  loginCustomer?(email: string, password: string): Promise<Centra.CheckoutApi.SelectionResponse>
  logoutCustomer?(): Promise<Centra.CheckoutApi.SelectionResponse>
  /**
    @param data - All data to register to customer. See {@link https://docs.centra.com/swagger-ui/?api=CheckoutAPI#/6.%20customer%20handling/post_register | Centra docs} for more details.
  */
  registerCustomer?(data: Record<string, unknown>): Promise<Centra.CheckoutApi.SelectionResponse>
  /**
    @param line - The line id of the item to increase
  */
  removeCartItem?(line: string): Promise<Centra.CheckoutApi.SelectionResponse>
  /**
    @param voucher - The id of the voucher to add
  */
  removeVoucher?(voucher: string): Promise<Centra.CheckoutApi.SelectionResponse>
  /**
    @param i - The `i` query parameter provided by Centra when landing on the password reset page
    @param id - The `id` query parameter provided by Centra when landing on the password reset page
  */
  resetCustomerPassword?(
    i: string,
    id: string,
    newPassword: string,
  ): Promise<Centra.CheckoutApi.SelectionResponse>
  resetSelection?(): void
  /**
    @param linkUri - URI of the password reset page. Should not be a full url e.g. `account/password-reset`. Domain is set in Centra.CheckoutApi.
  */
  sendCustomerResetPasswordEmail?(
    email: string,
    linkUri: string,
  ): Promise<Centra.CheckoutApi.SelectionResponse>
  submitPayment?(data: Record<string, unknown>): Promise<Centra.CheckoutApi.PaymentResponse>
  updateCartItemQuantity?(
    line: string,
    quantity: number,
  ): Promise<Centra.CheckoutApi.SelectionResponse>
  updateCartItemSize?(
    cartItem: Centra.CheckoutApi.SelectionItem,
    item: string,
  ): Promise<Centra.CheckoutApi.SelectionResponse>
  updateCountry?(
    country: string,
    data: { language: string },
  ): Promise<Centra.CheckoutApi.SelectionResponse>
  updateCustomer?(data: Record<string, unknown>): Promise<Centra.CheckoutApi.SelectionResponse>
  updateCustomerAddress?(
    data: Record<string, unknown>,
  ): Promise<Centra.CheckoutApi.SelectionResponse>
  updateCustomerEmail?(email: string): Promise<Centra.CheckoutApi.SelectionResponse>
  updateCustomerPassword?(
    password: string,
    newPassword: string,
  ): Promise<Centra.CheckoutApi.SelectionResponse>
  updateLanguage?(language: string): Promise<Centra.CheckoutApi.SelectionResponse>
  updatePaymentFields?(data: Record<string, unknown>): Promise<Centra.CheckoutApi.SelectionResponse>
  updatePaymentMethod?(paymentMethod: string): Promise<Centra.CheckoutApi.SelectionResponse>
  updateShippingMethod?(shippingMethod: string): Promise<Centra.CheckoutApi.SelectionResponse>
  updateCampaignSite?(uri: string): Promise<Centra.CheckoutApi.SelectionResponse>
}

export interface ContextProperties extends Centra.CheckoutApi.SelectionResponse {
  apiUrl?: string
  apiClient?: ApiClient
}

export const SELECTION_INITIAL_VALUE = {
  countries: [],
  languages: [],
  location: {},
  paymentFields: {
    address: {},
    shippingAddress: {},
    termsAndConditions: {},
  },
  paymentMethods: [],
  selection: {
    address: {},
    discounts: {},
    items: [],
    totals: {},
  },
  shippingMethods: [],
}

export const CentraHandlersContext = React.createContext<ContextMethods>({})
const CentraSelectionContext = React.createContext<ContextProperties>({})

/** React Context provider that is required to use the `useCentra` and `useCentraHandlers` hooks */
export function CentraProvider(props: ProviderProps) {
  const {
    apiUrl,
    children,
    disableInit = false,
    initialSelection,
    paymentFailedPage,
    paymentReturnPage,
    receiptPage,
    tokenExpires = 365,
    tokenName = 'centra-checkout-token',
    tokenCookieOptions = {},
    useAcceptHeader = false,
  } = props

  const [selection, setSelection] = React.useState<Centra.CheckoutApi.SelectionResponse>(
    initialSelection || SELECTION_INITIAL_VALUE,
  )

  const setTokenHeader = React.useCallback(
    (token: string) => {
      if (useAcceptHeader) {
        apiClient.headers.set('Accept', `application/json; api-token=${token}`)
      } else {
        apiClient.headers.set('api-token', token)
      }
    },
    [useAcceptHeader],
  )

  // set api client url
  apiClient.baseUrl = apiUrl

  // set api token if available
  if (initialSelection?.token) {
    setTokenHeader(initialSelection?.token)
  }

  const selectionApiCall = React.useCallback(
    async (
      apiCall:
        | Promise<Centra.CheckoutApi.SelectionResponse>
        | (() => Promise<Centra.CheckoutApi.SelectionResponse>),
    ) => {
      window.CentraCheckout?.suspend()
      const response = typeof apiCall === 'function' ? await apiCall() : await apiCall

      if (response && response.selection) {
        setSelection(response)
      }

      window.CentraCheckout?.resume()

      return response
    },
    [],
  )

  const centraCheckoutCallback = React.useCallback(
    async (event) => {
      if (event.detail) {
        const response = await selectionApiCall(
          apiClient.request('PUT', `payment-fields`, event.detail),
        )

        centraEvents.dispatch('centra_checkout_callback', response)
      }
    },
    [selectionApiCall],
  )

  const init = React.useCallback<NonNullable<ContextMethods['init']>>(
    async (selectionData) => {
      let response

      const apiToken = cookies.get(tokenName)
      if (apiToken) {
        setTokenHeader(apiToken)
      }

      if (!selectionData) {
        response = (await apiClient.request(
          'GET',
          'selection',
        )) as Centra.CheckoutApi.SelectionResponse
      } else {
        response = selectionData
      }

      if (response && response.selection) {
        setSelection(response)

        if (response.token && response.token !== apiToken) {
          setTokenHeader(response.token)
          cookies.set(tokenName, response.token, { expires: tokenExpires, ...tokenCookieOptions })
        }
      }
    },
    [tokenExpires, tokenName, tokenCookieOptions, setTokenHeader],
  )

  /* HANDLER METHODS */

  const addItem = React.useCallback<NonNullable<ContextMethods['addItem']>>(
    (item, quantity = 1) =>
      selectionApiCall(apiClient.request('POST', `items/${item}/quantity/${quantity}`)),
    [selectionApiCall],
  )

  const addBundleItem = React.useCallback<NonNullable<ContextMethods['addBundleItem']>>(
    (item, data) => selectionApiCall(apiClient.request('POST', `items/bundles/${item}`, data)),
    [selectionApiCall],
  )

  const addGiftCertificate = React.useCallback<NonNullable<ContextMethods['addGiftCertificate']>>(
    (giftCertificate) =>
      selectionApiCall(apiClient.request('POST', `items/gift-certificates/${giftCertificate}`)),
    [selectionApiCall],
  )

  const addCustomGiftCertificate = React.useCallback<
    NonNullable<ContextMethods['addCustomGiftCertificate']>
  >(
    (giftCertificate, amount) =>
      selectionApiCall(
        apiClient.request('POST', `items/gift-certificates/${giftCertificate}/amount/${amount}`),
      ),
    [selectionApiCall],
  )

  const increaseCartItem = React.useCallback<NonNullable<ContextMethods['increaseCartItem']>>(
    (line) => selectionApiCall(apiClient.request('POST', `lines/${line}/quantity/1`)),
    [selectionApiCall],
  )

  const decreaseCartItem = React.useCallback<NonNullable<ContextMethods['decreaseCartItem']>>(
    (line) => selectionApiCall(apiClient.request('DELETE', `lines/${line}/quantity/1`)),
    [selectionApiCall],
  )

  const removeCartItem = React.useCallback<NonNullable<ContextMethods['removeCartItem']>>(
    (line) => selectionApiCall(apiClient.request('DELETE', `lines/${line}`)),
    [selectionApiCall],
  )

  const updateCartItemQuantity = React.useCallback<
    NonNullable<ContextMethods['updateCartItemQuantity']>
  >(
    (line, quantity) =>
      selectionApiCall(apiClient.request('PUT', `lines/${line}/quantity/${quantity}`)),
    [selectionApiCall],
  )

  const updateCartItemSize = React.useCallback<NonNullable<ContextMethods['updateCartItemSize']>>(
    (cartItem, item) =>
      selectionApiCall(async () => {
        await apiClient.request('DELETE', `lines/${cartItem.line}`)

        const response = await apiClient.request(
          'POST',
          `items/${item}/quantity/${cartItem.quantity}`,
        )

        return response
      }),
    [selectionApiCall],
  )

  const addVoucher = React.useCallback<NonNullable<ContextMethods['addVoucher']>>(
    (voucher) => selectionApiCall(apiClient.request('POST', 'vouchers', { voucher })),
    [selectionApiCall],
  )

  const removeVoucher = React.useCallback<NonNullable<ContextMethods['removeVoucher']>>(
    (voucher) => selectionApiCall(apiClient.request('DELETE', `vouchers/${voucher}`)),
    [selectionApiCall],
  )

  const updateCountry = React.useCallback<NonNullable<ContextMethods['updateCountry']>>(
    (country, data) => selectionApiCall(apiClient.request('PUT', `countries/${country}`, data)),
    [selectionApiCall],
  )

  const updateLanguage = React.useCallback<NonNullable<ContextMethods['updateLanguage']>>(
    (language) => selectionApiCall(apiClient.request('PUT', `languages/${language}`)),
    [selectionApiCall],
  )

  const updateShippingMethod = React.useCallback<
    NonNullable<ContextMethods['updateShippingMethod']>
  >(
    (shippingMethod) =>
      selectionApiCall(apiClient.request('PUT', `shipping-methods/${shippingMethod}`)),
    [selectionApiCall],
  )

  const updatePaymentMethod = React.useCallback<NonNullable<ContextMethods['updatePaymentMethod']>>(
    (paymentMethod) =>
      selectionApiCall(apiClient.request('PUT', `payment-methods/${paymentMethod}`)),
    [selectionApiCall],
  )

  const updatePaymentFields = React.useCallback<NonNullable<ContextMethods['updatePaymentFields']>>(
    (data) => selectionApiCall(apiClient.request('PUT', `payment-fields`, data)),
    [selectionApiCall],
  )

  const submitPayment = React.useCallback<NonNullable<ContextMethods['submitPayment']>>(
    async (data) => {
      const response = (await apiClient.request('POST', 'payment', {
        paymentReturnPage,
        paymentFailedPage,
        ...data,
      })) as Centra.CheckoutApi.PaymentResponse

      // handle redirecting here
      switch (response.action) {
        case 'redirect':
          if (response.url) {
            window.location.href = response.url
          }
          break
        case 'success':
          // according to Centra docs – if action === 'success', user should be forwarded directly to the receipt page
          window.location.href = `${receiptPage}/${response.token}`
          break
        case 'javascript':
          if (response.code) {
            const script = document.createElement('script')
            const text = document.createTextNode(response.code)
            script.appendChild(text)
            document.body.appendChild(script)
          }
          break
        default:
          return response
      }
      return response
    },
    [paymentFailedPage, paymentReturnPage, receiptPage],
  )

  const addBackInStockSubscription = React.useCallback<
    NonNullable<ContextMethods['addBackInStockSubscription']>
  >(
    (data) => selectionApiCall(apiClient.request('POST', 'back-in-stock-subscription', data)),
    [selectionApiCall],
  )

  const addNewsletterSubscription = React.useCallback<
    NonNullable<ContextMethods['addNewsletterSubscription']>
  >(
    (data) => selectionApiCall(apiClient.request('POST', 'newsletter-subscription', data)),
    [selectionApiCall],
  )

  const loginCustomer = React.useCallback<NonNullable<ContextMethods['loginCustomer']>>(
    (email, password) =>
      selectionApiCall(apiClient.request('POST', `login/${email}`, { password })),
    [selectionApiCall],
  )

  const logoutCustomer = React.useCallback<NonNullable<ContextMethods['logoutCustomer']>>(
    () => selectionApiCall(apiClient.request('POST', `logout`)),
    [selectionApiCall],
  )

  const registerCustomer = React.useCallback<NonNullable<ContextMethods['registerCustomer']>>(
    (data) => selectionApiCall(apiClient.request('POST', `register`, data)),
    [selectionApiCall],
  )

  const resetCustomerPassword = React.useCallback<
    NonNullable<ContextMethods['resetCustomerPassword']>
  >(
    (i, id, newPassword) =>
      selectionApiCall(apiClient.request('POST', `password-reset`, { i, id, newPassword })),
    [selectionApiCall],
  )

  /** Resets the selection. Useful if you need a fresh `api-token` (when a user exits a campaign site, for example). */
  const resetSelection = React.useCallback<NonNullable<ContextMethods['resetSelection']>>(() => {
    if (useAcceptHeader) {
      apiClient.headers.set('Accept', 'application/json')
    } else {
      apiClient.headers.delete('api-token')
    }
    cookies.remove(tokenName)
    init()
  }, [init, tokenName, useAcceptHeader])

  const sendCustomerResetPasswordEmail = React.useCallback<
    NonNullable<ContextMethods['sendCustomerResetPasswordEmail']>
  >(
    (email, linkUri) =>
      selectionApiCall(apiClient.request('POST', `password-reset-email/${email}`, { linkUri })),
    [selectionApiCall],
  )

  const updateCustomer = React.useCallback<NonNullable<ContextMethods['updateCustomer']>>(
    (data) => selectionApiCall(apiClient.request('PUT', `customer/update`, data)),
    [selectionApiCall],
  )

  const updateCustomerAddress = React.useCallback<
    NonNullable<ContextMethods['updateCustomerAddress']>
  >((data) => selectionApiCall(apiClient.request('PUT', `address`, data)), [selectionApiCall])

  const updateCustomerEmail = React.useCallback<NonNullable<ContextMethods['updateCustomerEmail']>>(
    (newEmail) => selectionApiCall(apiClient.request('PUT', `email`, { newEmail })),
    [selectionApiCall],
  )

  const updateCustomerPassword = React.useCallback<
    NonNullable<ContextMethods['updateCustomerPassword']>
  >(
    (password, newPassword) =>
      selectionApiCall(apiClient.request('PUT', `password`, { password, newPassword })),
    [selectionApiCall],
  )

  const updateCampaignSite = React.useCallback<NonNullable<ContextMethods['updateCampaignSite']>>(
    (uri) => selectionApiCall(apiClient.request('PUT', `campaign-site`, { uri })),
    [selectionApiCall],
  )

  /* EFFECTS */

  React.useEffect(() => {
    if (!disableInit) {
      init()
    }

    // always add event listener for centra_checkout_callback in case it is used
    document.addEventListener('centra_checkout_callback', centraCheckoutCallback)

    return () => {
      document.removeEventListener('centra_checkout_callback', centraCheckoutCallback)
    }
  }, [disableInit, init, centraCheckoutCallback])

  // run centra checkout script if it is available in the selection
  React.useEffect(() => {
    let script: HTMLScriptElement | null = null
    if (selection?.selection?.centraCheckoutScript) {
      script = document.createElement('script')
      script.innerHTML = selection.selection.centraCheckoutScript
      script.id = 'centra-checkout-script'
      document.head.appendChild(script)
    }

    return () => {
      if (script) {
        document.head.removeChild(script)
      }
    }
  }, [selection?.selection?.centraCheckoutScript])

  const centraHandlersContext = React.useMemo<ContextMethods>(
    (): ContextMethods => ({
      addItem,
      addBundleItem,
      addGiftCertificate,
      addBackInStockSubscription,
      addCustomGiftCertificate,
      addNewsletterSubscription,
      addVoucher,
      decreaseCartItem,
      increaseCartItem,
      init,
      loginCustomer,
      logoutCustomer,
      registerCustomer,
      removeCartItem,
      removeVoucher,
      resetCustomerPassword,
      resetSelection,
      sendCustomerResetPasswordEmail,
      submitPayment,
      updateCartItemQuantity,
      updateCartItemSize,
      updateCountry,
      updateCustomer,
      updateCustomerAddress,
      updateCustomerEmail,
      updateCustomerPassword,
      updateLanguage,
      updatePaymentFields,
      updatePaymentMethod,
      updateShippingMethod,
      updateCampaignSite,
    }),
    [
      addItem,
      addBundleItem,
      addGiftCertificate,
      addBackInStockSubscription,
      addCustomGiftCertificate,
      addNewsletterSubscription,
      addVoucher,
      decreaseCartItem,
      increaseCartItem,
      init,
      loginCustomer,
      logoutCustomer,
      registerCustomer,
      removeCartItem,
      removeVoucher,
      resetCustomerPassword,
      resetSelection,
      sendCustomerResetPasswordEmail,
      submitPayment,
      updateCartItemQuantity,
      updateCartItemSize,
      updateCountry,
      updateCustomer,
      updateCustomerAddress,
      updateCustomerEmail,
      updateCustomerPassword,
      updateLanguage,
      updatePaymentFields,
      updatePaymentMethod,
      updateShippingMethod,
      updateCampaignSite,
    ],
  )

  const centraContext = React.useMemo(
    (): ContextProperties => ({
      ...selection,
      apiUrl,
      apiClient,
    }),
    [selection, apiUrl],
  )

  return (
    <CentraHandlersContext.Provider value={centraHandlersContext}>
      <CentraSelectionContext.Provider value={centraContext}>
        {children}
      </CentraSelectionContext.Provider>
    </CentraHandlersContext.Provider>
  )
}

/** This hook returns the centra selection */
export function useCentraSelection(): ContextProperties {
  return React.useContext(CentraSelectionContext)
}

/** This hook returns update handlers */
export function useCentraHandlers(): ContextMethods {
  return React.useContext(CentraHandlersContext)
}

/** Returns the latest order receipt given a selection token */
export function useCentraReceipt(
  token: string,
  useAcceptHeader = false,
): Centra.CheckoutApi.OrderCompleteResponse {
  const [result, setResult] = React.useState<Centra.CheckoutApi.OrderCompleteResponse>({})
  const { apiUrl } = useCentraSelection()

  if (!token) {
    console.error('@noaignite/react-centra-checkout: useReceipt requires a selection id')
  }

  React.useEffect(() => {
    // create a new ApiClient in order to temporarily use a different token
    const tempApiClient = new ApiClient(apiUrl)
    if (useAcceptHeader) {
      tempApiClient.headers.set('Accept', `application/json; api-token=${tempApiClient}`)
    } else {
      tempApiClient.headers.set('api-token', `api-token=${tempApiClient}`)
    }

    tempApiClient.request('GET', 'receipt').then((response) => {
      setResult(response)
    })
  }, [apiUrl, token, useAcceptHeader])

  return result
}

/** Returns the latest orders for the currently logged in user
  @param from - Display orders from this index. Defaults to 0.
  @param size - Display this many orders. Defaults lists all orders.
*/
export function useCentraOrders(from?: number, size?: number): Centra.CheckoutApi.OrdersResponse {
  const [result, setResult] = React.useState<Centra.CheckoutApi.OrdersResponse>({})

  React.useEffect(() => {
    // fetch orders
    apiClient
      .request('POST', 'orders', {
        ...(from && { from }),
        ...(size && { size }),
      })
      .then((response) => {
        setResult(response)
      })
  }, [from, size])

  return result
}

export function useCentraEvents() {
  return CentraEvents.default
}

export default CentraSelectionContext
