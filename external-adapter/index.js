const OAuth = require('oauth')
const { Requester, Validator } = require('@chainlink/external-adapter')

// Define custom error scenarios for the API.
// Return true for the adapter to retry.
const customError = data => {
  if (data.Response === 'Error') return true
  return false
}

// Get authentication
let twitter_application_consumer_key = process.env.TWITTER_API_APP_KEY // API Key
let twitter_application_secret = process.env.TWITTER_API_APP_SECRET // API Secret
let twitter_user_access_token = process.env.TWITTER_API_USER_TOKEN // Access Token
let twitter_user_secret = process.env.TWITTER_API_USER_SECRET // Access Token Secret

let oauth = new OAuth.OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  twitter_application_consumer_key,
  twitter_application_secret,
  '1.0A',
  null,
  'HMAC-SHA1'
)

// Define custom parameters to be used by the adapter.
// Extra parameters can be stated in the extra object,
// with a Boolean value indicating whether or not they
// should be required.
const customParams = {
  base: ['base', 'from', 'coin'],
  quote: ['quote', 'to', 'market'],
  endpoint: false
}

const createRequest = (input, callback) => {
  // The Validator helps you validate the Chainlink request data
  const validator = new Validator(callback, input, customParams)
  const jobRunID = validator.validated.id
  const endpoint = validator.validated.data.endpoint || 'price'
  const url = `https://min-api.cryptocompare.com/data/${endpoint}`
  const fsym = validator.validated.data.base.toUpperCase()
  const tsyms = validator.validated.data.quote.toUpperCase()

  const params = {
    fsym,
    tsyms
  }

  // This is where you would add method and headers
  // you can add method like GET or POST and add it to the config
  // The default is GET requests
  // method = 'get'
  // headers = 'headers.....'
  const config = {
    url,
    params
  }

  // The Requester allows API calls be retry in case of timeout
  // or connection failure
  Requester.request(config, customError)
    .then(response => {
      // It's common practice to store the desired value at the top-level
      // result key. This allows different adapters to be compatible with
      // one another.
      response.data.result = Requester.validateResultNumber(response.data, [tsyms])
      callback(response.status, Requester.success(jobRunID, response))
    })
    .catch(error => {
      callback(500, Requester.errored(jobRunID, error))
    })
}

// This is a wrapper to allow the function to work with
// GCP Functions
exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data)
  })
}

// This is a wrapper to allow the function to work with
// AWS Lambda
exports.handler = (event, context, callback) => {
  createRequest(event, (statusCode, data) => {
    callback(null, data)
  })
}

// This is a wrapper to allow the function to work with
// newer AWS Lambda implementations
exports.handlerv2 = (event, context, callback) => {
  createRequest(JSON.parse(event.body), (statusCode, data) => {
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify(data),
      isBase64Encoded: false
    })
  })
}

// This allows the function to be exported for testing
// or for running in express
module.exports.createRequest = createRequest
