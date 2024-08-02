/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "./node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "./node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "./node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "./node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios/lib/core/createError.js");
var transitionalDefaults = __webpack_require__(/*! ../defaults/transitional */ "./node_modules/axios/lib/defaults/transitional.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;
    var onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
      var transitional = config.transitional || transitionalDefaults;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = function(cancel) {
        if (!request) {
          return;
        }
        reject(!cancel || (cancel && cancel.type) ? new Cancel('canceled') : cancel);
        request.abort();
        request = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "./node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "./node_modules/axios/lib/defaults/index.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
axios.VERSION = (__webpack_require__(/*! ./env/data */ "./node_modules/axios/lib/env/data.js").version);

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios/lib/helpers/spread.js");

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ "./node_modules/axios/lib/helpers/isAxiosError.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports["default"] = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;

  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;

  // eslint-disable-next-line func-names
  this.promise.then(function(cancel) {
    if (!token._listeners) return;

    var i;
    var l = token._listeners.length;

    for (i = 0; i < l; i++) {
      token._listeners[i](cancel);
    }
    token._listeners = null;
  });

  // eslint-disable-next-line func-names
  this.promise.then = function(onfulfilled) {
    var _resolve;
    // eslint-disable-next-line func-names
    var promise = new Promise(function(resolve) {
      token.subscribe(resolve);
      _resolve = resolve;
    }).then(onfulfilled);

    promise.cancel = function reject() {
      token.unsubscribe(_resolve);
    };

    return promise;
  };

  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Subscribe to the cancel signal
 */

CancelToken.prototype.subscribe = function subscribe(listener) {
  if (this.reason) {
    listener(this.reason);
    return;
  }

  if (this._listeners) {
    this._listeners.push(listener);
  } else {
    this._listeners = [listener];
  }
};

/**
 * Unsubscribe from the cancel signal
 */

CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
  if (!this._listeners) {
    return;
  }
  var index = this._listeners.indexOf(listener);
  if (index !== -1) {
    this._listeners.splice(index, 1);
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*\
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "./node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "./node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var validator = __webpack_require__(/*! ../helpers/validator */ "./node_modules/axios/lib/helpers/validator.js");

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(configOrUrl, config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof configOrUrl === 'string') {
    config = config || {};
    config.url = configOrUrl;
  } else {
    config = configOrUrl || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean),
      forcedJSONParsing: validators.transitional(validators.boolean),
      clarifyTimeoutError: validators.transitional(validators.boolean)
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios/lib/core/buildFullPath.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/buildFullPath.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "./node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "./node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/createError.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "./node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults/index.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new Cancel('canceled');
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/core/enhanceError.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  };
  return error;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/mergeConfig.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/mergeConfig.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(prop) {
    if (prop in config2) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  var mergeMap = {
    'url': valueFromConfig2,
    'method': valueFromConfig2,
    'data': valueFromConfig2,
    'baseURL': defaultToConfig2,
    'transformRequest': defaultToConfig2,
    'transformResponse': defaultToConfig2,
    'paramsSerializer': defaultToConfig2,
    'timeout': defaultToConfig2,
    'timeoutMessage': defaultToConfig2,
    'withCredentials': defaultToConfig2,
    'adapter': defaultToConfig2,
    'responseType': defaultToConfig2,
    'xsrfCookieName': defaultToConfig2,
    'xsrfHeaderName': defaultToConfig2,
    'onUploadProgress': defaultToConfig2,
    'onDownloadProgress': defaultToConfig2,
    'decompress': defaultToConfig2,
    'maxContentLength': defaultToConfig2,
    'maxBodyLength': defaultToConfig2,
    'transport': defaultToConfig2,
    'httpAgent': defaultToConfig2,
    'httpsAgent': defaultToConfig2,
    'cancelToken': defaultToConfig2,
    'socketPath': defaultToConfig2,
    'responseEncoding': defaultToConfig2,
    'validateStatus': mergeDirectKeys
  };

  utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
    var merge = mergeMap[prop] || mergeDeepProperties;
    var configValue = merge(prop);
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*\
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "./node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults/index.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios/lib/defaults/index.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/defaults/index.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ../helpers/normalizeHeaderName */ "./node_modules/axios/lib/helpers/normalizeHeaderName.js");
var enhanceError = __webpack_require__(/*! ../core/enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");
var transitionalDefaults = __webpack_require__(/*! ./transitional */ "./node_modules/axios/lib/defaults/transitional.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ../adapters/xhr */ "./node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ../adapters/http */ "./node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: transitionalDefaults,

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional || defaults.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "./node_modules/axios/lib/defaults/transitional.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/defaults/transitional.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


module.exports = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};


/***/ }),

/***/ "./node_modules/axios/lib/env/data.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/env/data.js ***!
  \********************************************/
/***/ ((module) => {

module.exports = {
  "version": "0.26.1"
};

/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAxiosError.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAxiosError.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return utils.isObject(payload) && (payload.isAxiosError === true);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/validator.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/validator.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var VERSION = (__webpack_require__(/*! ../env/data */ "./node_modules/axios/lib/env/data.js").version);

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};

/**
 * Transitional option validator
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

module.exports = {
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return Array.isArray(val);
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return toString.call(val) === '[object FormData]';
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return toString.call(val) === '[object URLSearchParams]';
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "./style.scss":
/*!********************!*\
  !*** ./style.scss ***!
  \********************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./node_modules/css-loader/dist/runtime/getUrl.js */ "./node_modules/css-loader/dist/runtime/getUrl.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
// Imports



var ___CSS_LOADER_URL_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(/*! ./fonts/GinoraSans/ginorasans-light.woff2 */ "./fonts/GinoraSans/ginorasans-light.woff2"), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_1___ = new URL(/* asset import */ __webpack_require__(/*! ./fonts/GinoraSans/ginorasans-light.woff */ "./fonts/GinoraSans/ginorasans-light.woff"), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_2___ = new URL(/* asset import */ __webpack_require__(/*! ./fonts/GinoraSans/ginorasans-regular.woff2 */ "./fonts/GinoraSans/ginorasans-regular.woff2"), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_3___ = new URL(/* asset import */ __webpack_require__(/*! ./fonts/GinoraSans/ginorasans-regular.woff */ "./fonts/GinoraSans/ginorasans-regular.woff"), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_4___ = new URL(/* asset import */ __webpack_require__(/*! ./fonts/GinoraSans/ginorasans-semi-bold.woff2 */ "./fonts/GinoraSans/ginorasans-semi-bold.woff2"), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_5___ = new URL(/* asset import */ __webpack_require__(/*! ./fonts/GinoraSans/ginorasans-semi-bold.woff */ "./fonts/GinoraSans/ginorasans-semi-bold.woff"), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_6___ = new URL(/* asset import */ __webpack_require__(/*! ./fonts/GinoraSans/ginorasans-bold.woff2 */ "./fonts/GinoraSans/ginorasans-bold.woff2"), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_7___ = new URL(/* asset import */ __webpack_require__(/*! ./fonts/GinoraSans/ginorasans-bold.woff */ "./fonts/GinoraSans/ginorasans-bold.woff"), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_8___ = new URL(/* asset import */ __webpack_require__(/*! ./fonts/Gilroy/gilroy-light.woff2 */ "./fonts/Gilroy/gilroy-light.woff2"), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_9___ = new URL(/* asset import */ __webpack_require__(/*! ./fonts/Gilroy/gilroy-light.woff */ "./fonts/Gilroy/gilroy-light.woff"), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_10___ = new URL(/* asset import */ __webpack_require__(/*! ./fonts/Gilroy/gilroy-regular.woff2 */ "./fonts/Gilroy/gilroy-regular.woff2"), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_11___ = new URL(/* asset import */ __webpack_require__(/*! ./fonts/Gilroy/gilroy-regular.woff */ "./fonts/Gilroy/gilroy-regular.woff"), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_12___ = new URL(/* asset import */ __webpack_require__(/*! ./fonts/Gilroy/gilroy-medium.woff2 */ "./fonts/Gilroy/gilroy-medium.woff2"), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_13___ = new URL(/* asset import */ __webpack_require__(/*! ./fonts/Gilroy/gilroy-medium.woff */ "./fonts/Gilroy/gilroy-medium.woff"), __webpack_require__.b);
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_0___);
var ___CSS_LOADER_URL_REPLACEMENT_1___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_1___);
var ___CSS_LOADER_URL_REPLACEMENT_2___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_2___);
var ___CSS_LOADER_URL_REPLACEMENT_3___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_3___);
var ___CSS_LOADER_URL_REPLACEMENT_4___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_4___);
var ___CSS_LOADER_URL_REPLACEMENT_5___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_5___);
var ___CSS_LOADER_URL_REPLACEMENT_6___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_6___);
var ___CSS_LOADER_URL_REPLACEMENT_7___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_7___);
var ___CSS_LOADER_URL_REPLACEMENT_8___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_8___);
var ___CSS_LOADER_URL_REPLACEMENT_9___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_9___);
var ___CSS_LOADER_URL_REPLACEMENT_10___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_10___);
var ___CSS_LOADER_URL_REPLACEMENT_11___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_11___);
var ___CSS_LOADER_URL_REPLACEMENT_12___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_12___);
var ___CSS_LOADER_URL_REPLACEMENT_13___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_13___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, `:root {
  --normal_font-style: normal;
  --swap_font-display: swap;
}

@font-face {
  font-family: GinoraSans-light;
  src: url(${___CSS_LOADER_URL_REPLACEMENT_0___}) format("woff2"), url(${___CSS_LOADER_URL_REPLACEMENT_1___}) format("woff");
  font-style: var(--normal_font-style);
  font-weight: var(--normal_font-style);
  font-display: var(--swap_font-display);
}
@font-face {
  font-family: GinoraSans-regular;
  src: url(${___CSS_LOADER_URL_REPLACEMENT_2___}) format("woff2"), url(${___CSS_LOADER_URL_REPLACEMENT_3___}) format("woff");
  font-style: var(--normal_font-style);
  font-weight: var(--normal_font-style);
  font-display: var(--swap_font-display);
}
@font-face {
  font-family: GinoraSans-semi-bold;
  src: url(${___CSS_LOADER_URL_REPLACEMENT_4___}) format("woff2"), url(${___CSS_LOADER_URL_REPLACEMENT_5___}) format("woff");
  font-style: var(--normal_font-style);
  font-weight: var(--normal_font-style);
  font-display: var(--swap_font-display);
}
@font-face {
  font-family: GinoraSans-bold;
  src: url(${___CSS_LOADER_URL_REPLACEMENT_6___}) format("woff2"), url(${___CSS_LOADER_URL_REPLACEMENT_7___}) format("woff");
  font-style: var(--normal_font-style);
  font-weight: var(--normal_font-style);
  font-display: var(--swap_font-display);
}
@font-face {
  font-family: Gilroy-light;
  src: url(${___CSS_LOADER_URL_REPLACEMENT_8___}) format("woff2"), url(${___CSS_LOADER_URL_REPLACEMENT_9___}) format("woff");
  font-style: var(--normal_font-style);
  font-weight: var(--normal_font-style);
  font-display: var(--swap_font-display);
}
@font-face {
  font-family: Gilroy-regular;
  src: url(${___CSS_LOADER_URL_REPLACEMENT_10___}) format("woff2"), url(${___CSS_LOADER_URL_REPLACEMENT_11___}) format("woff");
  font-style: var(--normal_font-style);
  font-weight: var(--normal_font-style);
  font-display: var(--swap_font-display);
}
@font-face {
  font-family: Gilroy-medium;
  src: url(${___CSS_LOADER_URL_REPLACEMENT_12___}) format("woff2"), url(${___CSS_LOADER_URL_REPLACEMENT_13___}) format("woff");
  font-style: var(--normal_font-style);
  font-weight: var(--normal_font-style);
  font-display: var(--swap_font-display);
}
/*FONTS*/
/*\$main-font: DM Sans, sans-serif !default;
\$secondary-font: Montserrat, sans-serif !default;
\$semi-mini-font: 12px !default;
\$mini-font: 14px !default;
\$extra-mini-font: 16px !default;
\$semi-small-font: 18px !default;
\$small-font: 20px !default;
\$extra-small-font: 22px !default;
\$semi-normal-font: 24px !default;
\$normal-font: 26px !default;
\$extra-normal-font: 28px !default;
\$semi-medium-font: 30px !default;
\$medium-font: 32px !default;
\$extra-medium-font: 34px !default;
\$semi-large-font: 36px !default;
\$large-font: 38px !default;
\$extra-large-font: 40px !default;
\$semi-mega-font: 42px !default;
\$mega-font: 44px !default;
\$extra-mega-font: 46px !default;
\$semi-ultra-font: 48px !default;
\$ultra-font: 50px !default;
\$extra-ultra-font: 52px !default;
\$semi-display-font: 54px !default;
\$display-font: 56px !default;
\$extra-display-font: 58px !default;*/
* {
  box-sizing: border-box;
}

/*http://meyerweb.com/eric/tools/css/reset/
v2.0 | 20110126
License: none (public domain)*/
html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed,
figure, figcaption, footer, header, hgroup,
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
}

/*HTML5 display-role reset for older browsers*/
article, aside, details, figcaption, figure,
footer, header, hgroup, menu, nav, section {
  display: block;
}

body {
  line-height: 1;
}

ol, ul {
  list-style: none;
}

blockquote, q {
  quotes: none;
}

blockquote:before, blockquote:after,
q:before, q:after {
  content: "";
  content: none;
}

table {
  border-collapse: collapse;
  border-spacing: 0;
}

a {
  text-decoration: none;
}

/*COLORS*/
/*FONTS*/
/*BREAKPOINTS*/
._grey-bg {
  background-color: #1D1D1D;
}

._steel-bg {
  background-color: #232526;
}

/*
@mixin tablet() {
  @media (max-width: \$breakpoint_sm) {
    @content;
  }
}*/
.container {
  min-width: 320px;
  margin: 0 20px;
}

.hero {
  display: none;
}

.menu {
  padding: 31px 5.55vw;
  background-color: #232526;
}

.menu-list {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.menu-list > .menu-item {
  display: none;
}
.menu-list > .menu-item-icon {
  height: 20px;
}

.link-menu {
  font-family: GinoraSans-regular, sans-serif;
  font-size: 16px;
  color: #F4F4F4;
}

#menu-toggle {
  display: none;
}

#menu-toggle:checked + .menu-list {
  flex-direction: column;
}
#menu-toggle:checked + .menu-list > .menu-item-logo {
  display: none;
}
#menu-toggle:checked + .menu-list > .menu-item-icon {
  order: -1;
  margin-left: auto;
  padding-top: 4.1px;
}
#menu-toggle:checked + .menu-list > .menu-item.-left:first-child {
  padding-top: 40px;
}
#menu-toggle:checked + .menu-list > .menu-item.-left,
#menu-toggle:checked + .menu-list > .menu-item.-right {
  display: inline;
  padding: 15px 0;
}

.logo {
  width: 85px;
  height: 25px;
  color: #fff;
}

.box-icon-menu {
  width: 20px;
  height: 20px;
  display: inline-block;
  color: #232526;
  background: conic-gradient(from 90deg at 50% 50%, #66FFE6 -160.13deg, #8093FF 42.37deg, #66FFE6 199.87deg, #8093FF 402.37deg);
}
.box-icon-menu > .icon-menu {
  width: 100%;
  height: 100%;
}

@media (min-width: 1160px) {
  .hero {
    display: block;
  }
  .header {
    padding-top: 30px;
  }
  .menu {
    max-width: 1160px;
    margin: 0 auto;
    padding: 31px 60px;
  }
  .menu-list {
    justify-content: start;
  }
  .menu-list > .menu-item {
    display: inline-block;
    height: 14px;
  }
  .menu-list > .menu-item-logo {
    margin: 0 auto;
  }
  .menu-list > .menu-item-icon {
    height: 12px;
    padding-left: 5px;
  }
  .menu-list > .menu-item.-left {
    padding-right: 30px;
  }
  .menu-list > .menu-item.-right {
    padding-left: 30px;
  }
  #menu-toggle:checked + .menu-list > .menu-item-icon {
    padding-top: 8.1px;
  }
  #menu-toggle:checked + .menu-list > .menu-item.-left,
  #menu-toggle:checked + .menu-list > .menu-item.-right {
    padding-top: 30px;
  }
  .box-icon-menu {
    width: 12px;
    height: 12px;
  }
  .box-icon-menu > .icon-menu {
    margin-bottom: 2px;
  }
}
.intro {
  padding-top: 90px;
}

.page-title {
  font-family: GinoraSans-bold, sans-serif;
  font-size: 42px;
  color: #F4F4F4;
  line-height: 56px;
  background: conic-gradient(from 180deg at 50% 50%, #66FFE6 -160.13deg, #8093FF 42.37deg, #66FFE6 199.87deg, #8093FF 402.37deg);
  background-clip: text;
}
.page-title > .ai {
  color: transparent;
}

.box-spiral {
  display: flex;
  justify-content: flex-end;
  max-height: 190px;
}
.box-spiral > .spiral {
  transform: translateY(-70px);
}

@media (min-width: 1160px) {
  .hero {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .spiral {
    display: none;
  }
}
.decisions-title {
  font-family: GinoraSans-regular, sans-serif;
  font-size: 36px;
  color: #F4F4F4;
  line-height: 44px;
  padding: 40px 0 30px;
}

.decisions-desc {
  font-family: Gilroy-regular, sans-serif;
  font-size: 16px;
  color: #B8B8B8;
  line-height: 24px;
  padding: 0 10px 30px 0;
}

.link-project {
  display: flex;
  align-items: center;
  padding-bottom: 60px;
}
.link-project:hover > .text-project {
  color: #5CE4CF;
}
.link-project:hover > .arrow-right-green {
  color: #99A9FF;
}
.link-project > .text-project {
  font-family: GinoraSans-semi-bold, sans-serif;
  font-size: 16px;
  color: #99A9FF;
  padding-right: 10px;
}
.link-project > .arrow-right-green {
  width: 25px;
  height: 12px;
  color: #5CE4CF;
}

.investments-title {
  font-family: GinoraSans-regular, sans-serif;
  font-size: 36px;
  color: #F4F4F4;
  line-height: 44px;
  padding: 40px 0 30px;
}

.investments-desc {
  font-family: Gilroy-regular, sans-serif;
  font-size: 16px;
  color: #B8B8B8;
  line-height: 24px;
  padding-bottom: 60px;
}

.robot {
  margin-bottom: 20px;
}

.robotics-inscription {
  font-family: GinoraSans-regular, sans-serif;
  font-size: 12px;
  color: #B8B8B8;
  line-height: 18px;
  letter-spacing: 4px;
  opacity: 0.7;
}

.robotics-title {
  font-family: GinoraSans-regular, sans-serif;
  font-size: 26px;
  color: #F4F4F4;
  line-height: 32px;
  padding: 10px 0 20px;
}

.robotics-desc {
  font-family: Gilroy-regular, sans-serif;
  font-size: 16px;
  color: #B8B8B8;
  line-height: 24px;
  padding-bottom: 40px;
}

.link-robotics {
  display: flex;
  align-items: center;
  padding-bottom: 80px;
}
.link-robotics:hover > .text-robotics {
  color: #5CE4CF;
}
.link-robotics:hover > .arrow-right-green {
  color: #99A9FF;
}
.link-robotics > .text-robotics {
  font-family: GinoraSans-semi-bold, sans-serif;
  font-size: 16px;
  color: #99A9FF;
  padding-right: 15px;
}
.link-robotics > .arrow-right-green {
  width: 25px;
  height: 12px;
  color: #5CE4CF;
}

.cyborg {
  margin-bottom: 20px;
}

.personnel-inscription {
  font-family: GinoraSans-regular, sans-serif;
  font-size: 12px;
  color: #B8B8B8;
  line-height: 18px;
  letter-spacing: 4px;
  opacity: 0.7;
}

.personnel-title {
  font-family: GinoraSans-regular, sans-serif;
  font-size: 26px;
  color: #F4F4F4;
  line-height: 32px;
  padding: 10px 0 20px;
}

.personnel-desc {
  font-family: Gilroy-regular, sans-serif;
  font-size: 16px;
  color: #B8B8B8;
  line-height: 24px;
  padding-bottom: 40px;
}

.link-personnel {
  display: flex;
  align-items: center;
  padding-bottom: 100px;
}
.link-personnel > .text-robotics {
  font-family: GinoraSans-semi-bold, sans-serif;
  font-size: 16px;
  color: #5CE4CF;
  padding-right: 15px;
}
.link-personnel > .arrow-right-green {
  width: 25px;
  height: 12px;
  color: #99A9FF;
}
.link-personnel:hover > .text-robotics {
  color: #99A9FF;
}
.link-personnel:hover > .arrow-right-green {
  color: #5CE4CF;
}

.separator {
  width: 100%;
  height: 1px;
  background: linear-gradient(to right, transparent 0%, #7D9BFA 21.14%, #60DBD4 80%, transparent 100%);
}

.separator.-jobs {
  background: linear-gradient(to right, #7D9BFA, #60DBD4);
}

.divers-title {
  font-family: GinoraSans-regular, sans-serif;
  font-size: 36px;
  color: #F4F4F4;
  line-height: 44px;
  padding: 20px 0 40px;
}

.brand-list {
  display: flex;
  flex-wrap: wrap;
  padding-bottom: 80px;
}

.divers-list-1,
.divers-list-2 {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.link-divers {
  display: flex;
  align-items: center;
  padding: 20px;
}
.link-divers:hover > .box-icon-divers {
  background: linear-gradient(to bottom right, #99A9FF, #5CE4CF);
}
.link-divers:hover > .text-divers {
  background: linear-gradient(94.32deg, #99A9FF 0%, #5CE4CF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.link-divers > .box-icon-divers.active {
  background: linear-gradient(to bottom right, #99A9FF, #5CE4CF);
}
.link-divers > .text-divers.active {
  background: linear-gradient(94.32deg, #99A9FF 0%, #5CE4CF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.box-icon-divers {
  background-color: #B8B8B8;
}
.box-icon-divers > .icon-divers {
  width: 20px;
  height: 20px;
  color: #1D1D1D;
}
.box-icon-divers > .atom {
  height: 18.2px;
}
.box-icon-divers > .oracle {
  height: 19.05px;
}
.box-icon-divers > .tindo {
  height: 18.26px;
}
.box-icon-divers > .ordix {
  height: 17.27px;
}
.box-icon-divers > .raxon {
  height: 16.8px;
}

.box-atom {
  height: 18px;
}

.box-oracle {
  height: 18px;
  margin-right: 4px;
}

.box-tindo {
  height: 18px;
}

.box-kawaski {
  height: 20px;
  margin-right: 4px;
}

.box-jarvice {
  height: 20px;
}

.box-cypher {
  height: 20px;
  margin-right: 7px;
}

.box-ordix {
  height: 17.2px;
}

.box-raxon {
  height: 16.7px;
  margin-right: 10px;
}

.text-divers {
  font-family: GinoraSans-light, sans-serif;
  font-size: 26px;
  color: #B8B8B8;
  line-height: 26px;
}

.text-raxon {
  padding-right: 5px;
}

.text-atom,
.text-jarvice {
  padding-left: 6px;
}

.text-tindo,
.text-ordix {
  padding-left: 10px;
}

.list-geniuses {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  padding-top: 60px;
}

.genius {
  display: inline-flex;
  align-items: center;
  flex-direction: column;
}
.genius > .name {
  font-family: GinoraSans-regular, sans-serif;
  font-size: 20px;
  color: #B8B8B8;
  padding: 20px 0 10px;
}
.genius > .position {
  font-family: Gilroy-light, sans-serif;
  font-size: 16px;
  color: #B8B8B8;
  line-height: 16px;
}

.gen-mark {
  padding-top: 30px;
}

.gen-chris {
  padding-top: 20px;
}

.gen-roberto {
  padding-top: 50px;
}

.minds-title {
  font-family: GinoraSans-regular, sans-serif;
  font-size: 36px;
  color: #F4F4F4;
  line-height: 44px;
  padding: 60px 0 30px;
}

.minds-desc {
  font-family: Gilroy-regular, sans-serif;
  font-size: 19px;
  color: #B8B8B8;
  line-height: 26px;
  padding-bottom: 30px;
}

.link-minds {
  display: flex;
  align-items: center;
  padding-bottom: 60px;
}
.link-minds:hover > .text-robotics {
  color: #5CE4CF;
}
.link-minds:hover > .arrow-right-green {
  color: #99A9FF;
}
.link-minds > .text-robotics {
  font-family: GinoraSans-semi-bold, sans-serif;
  font-size: 16px;
  color: #99A9FF;
  padding-right: 50px;
}
.link-minds > .arrow-right-green {
  width: 25px;
  height: 12px;
  color: #5CE4CF;
}

.jobs-title {
  font-family: GinoraSans-bold, sans-serif;
  font-size: 42px;
  color: #F4F4F4;
  line-height: 56px;
  padding: 100px 0 60px;
}

.wrap-jobs {
  width: 300px;
  margin-inline: auto;
}
.wrap-jobs > .categories-title {
  font-family: GinoraSans-regular, sans-serif;
  font-size: 26px;
  color: #F4F4F4;
  padding-bottom: 30px;
}

.item-jobs {
  padding-bottom: 20px;
}
.item-jobs > .link-jobs {
  display: flex;
  justify-content: space-between;
}

.text-job {
  font-family: GinoraSans-regular, sans-serif;
  font-size: 20px;
  color: #B8B8B8;
}
.text-job:hover {
  color: #99A9FF;
}

.active-text-lob {
  color: #99A9FF;
}

.green-long-right-arrow {
  width: 30px;
  height: 20px;
  color: #5CE4CF;
}

.card-jobs {
  display: flex;
  flex-direction: column;
  padding: 40px 0;
}
.card-jobs > .inscription-jobs {
  font-family: GinoraSans-regular, sans-serif;
  font-size: 12px;
  color: #B8B8B8;
  line-height: 18px;
  padding-bottom: 10px;
  letter-spacing: 4px;
  opacity: 0.7;
}

.link-card-jobs {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.link-card-jobs > .card-title-jobs {
  font-family: GinoraSans-regular, sans-serif;
  font-size: 26px;
  color: #F4F4F4;
  line-height: 32px;
}
.link-card-jobs > .card-title-jobs:hover {
  background: linear-gradient(92.73deg, #99A9FF 0%, #5CE4CF 100%);
  background-clip: text;
  color: transparent;
}
.link-card-jobs > .active-title-jobs {
  background: linear-gradient(92.73deg, #99A9FF 0%, #5CE4CF 100%);
  background-clip: text;
  color: transparent;
}

.desc-jobs {
  font-family: Gilroy-medium, sans-serif;
  font-size: 12px;
  color: #B8B8B8;
  line-height: 16px;
  padding-top: 20px;
  opacity: 0.7;
}

.link-jobs-card {
  display: flex;
  align-items: center;
  padding: 60px 0 100px;
}
.link-jobs-card:hover > .text-jobs {
  color: #5CE4CF;
}
.link-jobs-card:hover > .arrow-right-green {
  color: #99A9FF;
}
.link-jobs-card > .text-jobs {
  font-family: GinoraSans-semi-bold, sans-serif;
  font-size: 16px;
  color: #99A9FF;
  padding-right: 10px;
}
.link-jobs-card > .arrow-right-green {
  width: 25px;
  height: 12px;
  color: #5CE4CF;
}

.title-resources {
  font-family: GinoraSans-regular, sans-serif;
  font-size: 36px;
  color: #F4F4F4;
  line-height: 44px;
  padding: 20px 0 60px;
}

.cards-resources {
  padding: 0 20px;
}

.date {
  font-family: Gilroy-regular, sans-serif;
  font-size: 12px;
  color: #B8B8B8;
  line-height: 16px;
  display: inline-block;
  padding: 30px 0 10px;
}

.title-card-resources {
  font-family: GinoraSans-regular, sans-serif;
  font-size: 26px;
  color: #B8B8B8;
  line-height: 32px;
  padding-bottom: 60px;
}
.title-card-resources:hover {
  background: linear-gradient(96.97deg, #99A9FF 20.47%, #5CE4CF 100%);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.active-card-resources {
  background: linear-gradient(96.97deg, #99A9FF 20.47%, #5CE4CF 100%);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.swiper-nav {
  display: flex;
  justify-content: end;
  padding-bottom: 60px;
}

.box-btn-right {
  width: 62px;
  height: 8px;
  display: inline-flex;
  color: #1D1D1D;
  background: linear-gradient(to right, #99A9FF, #5CE4CF);
}
.box-btn-right > .arrow-btn-right {
  width: 100%;
  height: 100%;
}

.box-btn-left {
  width: 31px;
  height: 8px;
  display: inline-flex;
  margin-right: 21px;
  color: #1D1D1D;
  background: linear-gradient(to left, #99A9FF, #5CE4CF);
}

.arrow-btn-left {
  width: 100%;
  height: 100%;
}

.swiper-button-disabled.box-btn-right {
  background: linear-gradient(to right, rgba(92, 228, 207, 0.15), rgba(153, 169, 255, 0.4));
}

.swiper-button-disabled.box-btn-left {
  background: linear-gradient(to left, rgba(92, 228, 207, 0.15), rgba(153, 169, 255, 0.4));
}

.link-resources {
  display: flex;
  align-items: center;
  padding: 20px 0 100px;
}
.link-resources:hover > .text-resources {
  color: #5CE4CF;
}
.link-resources:hover > .arrow-right-green {
  color: #99A9FF;
}
.link-resources .text-resources {
  font-family: GinoraSans-semi-bold, sans-serif;
  font-size: 16px;
  color: #99A9FF;
  padding-right: 10px;
}
.link-resources > .arrow-right-green {
  width: 25px;
  height: 12px;
  color: #5CE4CF;
}

.title-reg {
  width: 330px;
  font-family: GinoraSans-regular, sans-serif;
  font-size: 36px;
  color: #F4F4F4;
  line-height: 44px;
  background: conic-gradient(from 180deg at 50% 50%, #66FFE6 -160.13deg, #8093FF 42.37deg, #66FFE6 199.87deg, #8093FF 402.37deg);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.desc-reg {
  font-family: Gilroy-regular, sans-serif;
  font-size: 16px;
  color: #B8B8B8;
  line-height: 26px;
  padding: 20px 0 60px;
}

.group-message {
  display: flex;
  flex-direction: column;
}

.group-name,
.group-email {
  display: flex;
  flex-direction: column;
  position: relative;
}
.group-name::before,
.group-email::before {
  width: 80px;
  height: 3px;
  content: "";
  display: block;
  position: absolute;
  top: 38px;
  left: 10px;
  background: linear-gradient(90deg, #99A9FF 0%, #5CE4CF 100%);
}

.label-name,
.label-email,
.text-message {
  font-family: Gilroy-regular, sans-serif;
  font-size: 14px;
  color: #B8B8B8;
  line-height: 16px;
  padding-left: 10px;
}

.name-text,
.email-text {
  height: 24px;
}

.name-text,
.email-text,
.textarea {
  margin-bottom: 40px;
  padding: 0 10px;
  border: 1px solid #1D1D1D;
  border-bottom-color: #565656;
  background-color: #1D1D1D;
  color: #B8B8B8;
}

.input-sizer {
  display: inline-grid;
  vertical-align: top;
  align-items: center;
  position: relative;
}

.input-sizer.stacked {
  align-items: stretch;
}

.input-sizer.stacked::after,
.input-sizer.stacked input,
.input-sizer.stacked .textarea {
  grid-area: 2/1;
}

.input-sizer::after,
.input-sizer input,
.input-sizer .textarea {
  width: auto;
  min-width: 1em;
  grid-area: 1/2;
  font: inherit;
  margin: 0;
  resize: none;
  background: none;
  appearance: none;
}

.input-sizer .textarea {
  min-height: 20px;
}

.input-sizer::after {
  content: attr(data-value) " ";
  visibility: hidden;
  white-space: pre-wrap;
}

.bottom-line {
  width: 80px;
  height: 3px;
  position: relative;
  left: 10px;
  bottom: 2px;
  margin-bottom: 40px;
  background: linear-gradient(90deg, #99A9FF 0%, #5CE4CF 100%);
}

.reg-btn {
  display: flex;
  align-items: center;
  padding: 20px 0 80px;
  border: none;
  background-color: transparent;
}
.reg-btn > .reg-text-btn {
  font-family: GinoraSans-semi-bold, sans-serif;
  font-size: 16px;
  color: #99A9FF;
}
.reg-btn > .arrow-right-green {
  width: 25px;
  height: 12px;
  margin-left: 30px;
  color: #5CE4CF;
}
.reg-btn:hover > .reg-text-btn {
  color: #5CE4CF;
}
.reg-btn:hover > .arrow-right-green {
  color: #99A9FF;
}

.networks-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  padding-bottom: 40px;
}

.item-networks {
  padding: 0 10px 20px;
}
.item-networks > .network-link {
  font-family: GinoraSans-regular, sans-serif;
  font-size: 12px;
  color: #B8B8B8;
  line-height: 18px;
}
.item-networks > .network-link:hover {
  color: #99A9FF;
}
.item-networks > .active-network-link {
  color: #99A9FF;
}

.basement {
  display: flex;
  justify-content: center;
  align-items: center;
}
.basement > .auth-protection {
  padding: 30px 0 35px;
  color: #B8B8B8;
}
.basement > .company-protection {
  margin: 0 0 2px 4px;
  padding-bottom: 2px;
  border-bottom: 2px solid #99A9FF;
  border-bottom-width: 1.5px;
  color: #99A9FF;
}
.basement > .auth-protection,
.basement > .company-protection {
  font-family: GinoraSans-regular, sans-serif;
  font-size: 16px;
  line-height: 16px;
}`, "",{"version":3,"sources":["webpack://./common/_fonts.scss","webpack://./style.scss","webpack://./common/_reset.scss","webpack://./common/_variables.scss","webpack://./common/_helpers.scss","webpack://./common/_media-breakpoints.scss","webpack://./common/_generals.scss","webpack://./components/menu/_menu.scss","webpack://./common/_mixines.scss","webpack://./components/menu/_menu-media.scss","webpack://./components/intro/_intro.scss","webpack://./components/intro/_intro-media.scss","webpack://./components/decisions/_decisions.scss","webpack://./components/investments/_investments.scss","webpack://./components/robotics/_robotics.scss","webpack://./components/personnel/_personnel.scss","webpack://./components/separator/_separator.scss","webpack://./components/diversification/_diversification.scss","webpack://./components/minds/_minds.scss","webpack://./components/jobs/_jobs.scss","webpack://./components/resources/_resources.scss","webpack://./components/registration/_registration.scss","webpack://./components/footer/_footer.scss"],"names":[],"mappings":"AAAA;EACE,2BAAA;EACA,yBAAA;ACCF;;ADEA;EACE,6BAAA;EACA,oHAAA;EAEA,oCAAA;EACA,qCAAA;EACA,sCAAA;ACAF;ADGA;EACE,+BAAA;EACA,oHAAA;EAEA,oCAAA;EACA,qCAAA;EACA,sCAAA;ACFF;ADKA;EACE,iCAAA;EACA,oHAAA;EAEA,oCAAA;EACA,qCAAA;EACA,sCAAA;ACJF;ADQA;EACE,4BAAA;EACA,oHAAA;EAEA,oCAAA;EACA,qCAAA;EACA,sCAAA;ACPF;ADUA;EACE,yBAAA;EACA,oHAAA;EAEA,oCAAA;EACA,qCAAA;EACA,sCAAA;ACTF;ADYA;EACE,2BAAA;EACA,sHAAA;EAEA,oCAAA;EACA,qCAAA;EACA,sCAAA;ACXF;ADcA;EACE,0BAAA;EACA,sHAAA;EAEA,oCAAA;EACA,qCAAA;EACA,sCAAA;ACbF;ADkBA,QAAA;AACA;;;;;;;;;;;;;;;;;;;;;;;;;oCAAA;AExEA;EACI,sBAAA;ADkFJ;;AC/EA;;8BAAA;AAGA;;;;;;;;;;;;;EAaI,SAAA;EACA,UAAA;EACA,SAAA;EACA,eAAA;EACA,aAAA;EACA,wBAAA;ADkFJ;;AC/EA,8CAAA;AACA;;EAEI,cAAA;ADkFJ;;AC/EA;EACI,cAAA;ADkFJ;;AC/EA;EACI,gBAAA;ADkFJ;;AC/EA;EACI,YAAA;ADkFJ;;AC/EA;;EAEI,WAAA;EACA,aAAA;ADkFJ;;AC/EA;EACI,yBAAA;EACA,iBAAA;ADkFJ;;AC/EA;EACI,qBAAA;ADkFJ;;AE5IA,SAAA;AAoBA,QAAA;AA4BA,cAAA;AChDA;EACE,yBDCY;AFiJd;;AG/IA;EACE,yBDJW;AFsJb;;AIjJA;;;;;EAAA;ACNA;EACE,gBAAA;EACA,cAAA;ALgKF;;AMlKA;EACE,aAAA;ANqKF;;AMlKA;EACE,oBAAA;EACA,yBJLW;AF0Kb;;AMlKA;ECRE,aAAA;EACA,8BDQgB;ECPhB,mBDO+B;ANuKjC;AMrKE;EACE,aAAA;ANuKJ;AMpKE;ECPA,YDQuB;ANsKzB;;AMlKA;ECLI,2CLKuB;EKJvB,eLgBc;EKdhB,cLba;AFuLf;;AMpKA;EACE,aAAA;ANuKF;;AMrKA;EACE,sBAAA;ANwKF;AMtKE;EACE,aAAA;ANwKJ;AMrKE;EACE,SAAA;EACA,iBAAA;EACA,kBAAA;ANuKJ;AMnKI;EACE,iBAAA;ANqKN;AMjKE;;EAEE,eAAA;EACA,eAAA;ANmKJ;;AM9JA;EC/CE,WDgDe;EC/Cf,YD+CqB;EACrB,WJpDY;AFsNd;;AM/JA;ECpDE,WDqDe;ECpDf,YDoDqB;EACrB,qBAAA;EACA,cJ9DW;EI+DX,6HAAA;ANmKF;AMjKE;EC1DA,WD2DiB;EC1DjB,YD0DuB;ANoKzB;;AItOE;EIAA;IACE,cAAA;ER0OF;EQvOA;IACE,iBAAA;ERyOF;EQtOA;IACE,iBAAA;IACA,cAAA;IACA,kBAAA;ERwOF;EQrOA;IACE,sBAAA;ERuOF;EQrOE;IACE,qBAAA;IDVJ,YCWyB;ERuOzB;EQpOE;IACE,cAAA;ERsOJ;EQnOE;IDlBF,YCmByB;IACrB,iBAAA;ERqOJ;EQlOE;IACE,mBAAA;ERoOJ;EQjOE;IACE,kBAAA;ERmOJ;EQ9NE;IACE,kBAAA;ERgOJ;EQ7NE;;IAEE,iBAAA;ER+NJ;EQ3NA;ID5CA,WC6CiB;ID5CjB,YC4CuB;ER8NvB;EQ5NE;IACE,kBAAA;ER8NJ;AACF;ASvRA;EACE,iBAAA;ATyRF;;AStRA;EFYI,wCLQoB;EKPpB,eLqBa;EKnBf,cLba;EKcb,iBLwBqB;EOtCrB,8HAAA;EACA,qBAAA;AT4RF;AS1RE;EACE,kBAAA;AT4RJ;;ASxRA;EFbE,aAAA;EACA,yBEagB;EAChB,iBAAA;AT4RF;AS1RE;EACE,4BAAA;AT4RJ;;AI9SE;EMAA;IACE,kBAAA;IACA,QAAA;IACA,SAAA;IACA,gCAAA;EVkTF;EU/SA;IACE,aAAA;EViTF;AACF;AW3TA;EJgBI,2CLKuB;EKJvB,eLoBc;EKlBhB,cLba;EKcb,iBLyBqB;ES3CrB,oBAAA;AXgUF;;AW7TA;EJWI,uCLMkB;EKLlB,eLgBc;EKdhB,cLhBY;EKiBZ,iBLsBsB;ESnCtB,sBAAA;AXmUF;;AWhUA;EJTE,aAAA;EAEA,mBIQsB;EACtB,oBAAA;AXoUF;AWjUI;EACE,cTLU;AFwUhB;AWhUI;EACE,cTZU;AF8UhB;AW9TE;EJRE,6CLSyB;EKRzB,eLgBc;EKdhB,cLXc;ESkBZ,mBAAA;AXkUJ;AW/TE;EJrBA,WIsBiB;EJrBjB,YIqBuB;EACrB,cTpBY;AFsVhB;;AYjWA;ELgBI,2CLKuB;EKJvB,eLoBc;EKlBhB,cLba;EKcb,iBLyBqB;EU3CrB,oBAAA;AZuWF;;AYpWA;ELWI,uCLMkB;EKLlB,eLgBc;EKdhB,cLhBY;EKiBZ,iBLsBsB;EUnCtB,oBAAA;AZ0WF;;AajXA;EACE,mBAAA;AboXF;;AajXA;ENYI,2CLKuB;EKJvB,eLca;EKZf,cLhBY;EKiBZ,iBLqBwB;EWnCxB,mBAAA;EACA,YAAA;AbuXF;;AapXA;ENMI,2CLKuB;EKJvB,eLmBU;EKjBZ,cLba;EKcb,iBL0BqB;EWlCrB,oBAAA;Ab0XF;;AavXA;ENCI,uCLMkB;EKLlB,eLgBc;EKdhB,cLhBY;EKiBZ,iBLsBsB;EWzBtB,oBAAA;Ab6XF;;Aa1XA;ENnBE,aAAA;EAEA,mBMkBsB;EACtB,oBAAA;Ab8XF;Aa3XI;EACE,cXfU;AF4YhB;Aa1XI;EACE,cXtBU;AFkZhB;AaxXE;ENlBE,6CLSyB;EKRzB,eLgBc;EKdhB,cLXc;EW4BZ,mBAAA;Ab4XJ;AazXE;EN/BA,WMgCiB;EN/BjB,YM+BuB;EACrB,cX9BY;AF0ZhB;;AcraA;EACE,mBAAA;AdwaF;;AcraA;EPYI,2CLKuB;EKJvB,eLca;EKZf,cLhBY;EKiBZ,iBLqBwB;EYnCxB,mBAAA;EACA,YAAA;Ad2aF;;AcxaA;EPMI,2CLKuB;EKJvB,eLmBU;EKjBZ,cLba;EKcb,iBL0BqB;EYlCrB,oBAAA;Ad8aF;;Ac3aA;EPCI,uCLMkB;EKLlB,eLgBc;EKdhB,cLhBY;EKiBZ,iBLsBsB;EYzBtB,oBAAA;AdibF;;Ac9aA;EPnBE,aAAA;EAEA,mBOkBsB;EACtB,qBAAA;AdkbF;AchbE;EPRE,6CLSyB;EKRzB,eLgBc;EKdhB,cLRc;EYeZ,mBAAA;AdobJ;AcjbE;EPrBA,WOsBiB;EPrBjB,YOqBuB;EACrB,cZvBY;AF2chB;AchbI;EACE,cZ5BU;AF8chB;Ac/aI;EACE,cZ7BU;AF8chB;;AezdA;ERQE,WQPe;ERQf,WQRqB;EACrB,oGAAA;Af6dF;;AepdA;EACE,uDAAA;AfudF;;AgBneA;ETgBI,2CLKuB;EKJvB,eLoBc;EKlBhB,cLba;EKcb,iBLyBqB;Ec3CrB,oBAAA;AhByeF;;AgBteA;ETJE,aAAA;ESMA,eAAA;EACA,oBAAA;AhByeF;;AgBteA;;ETVE,aAAA;EACA,8BSWgB;EAChB,eAAA;AhB0eF;;AgBveA;EThBE,aAAA;EAEA,mBSesB;EACtB,aAAA;AhB2eF;AgBxeI;EACE,8DAAA;AhB0eN;AgBleI;EACE,+DAAA;EACA,6BAAA;EACA,oCAAA;AhBoeN;;AgB9dE;EACE,8DAAA;AhBieJ;AgB1dE;EACE,+DAAA;EACA,6BAAA;EACA,oCAAA;AhB4dJ;;AgBxdA;EACE,yBdrDY;AFghBd;AgBzdE;ETlDA,WSmDiB;ETlDjB,YSkDuB;EACrB,cd1DU;AFshBd;AgBzdE;ETtDA,cSuDuB;AhB2dzB;AgBxdE;ET1DA,eS2DuB;AhB0dzB;AgBvdE;ET9DA,eS+DuB;AhBydzB;AgBtdE;ETlEA,eSmEuB;AhBwdzB;AgBrdE;ETtEA,cSuEuB;AhBudzB;;AgBndA;ET3EE,YS4EqB;AhBsdvB;;AgBndA;ET/EE,YSgFqB;EACrB,iBAAA;AhBsdF;;AgBndA;ETpFE,YSqFqB;AhBsdvB;;AgBndA;ETxFE,YSyFqB;EACrB,iBAAA;AhBsdF;;AgBndA;ET7FE,YS8FqB;AhBsdvB;;AgBndA;ETjGE,YSkGqB;EACrB,iBAAA;AhBsdF;;AgBndA;ETtGE,cSuGqB;AhBsdvB;;AgBndA;ET1GE,cS2GqB;EACrB,kBAAA;AhBsdF;;AgBndA;ETxGI,yCLOqB;EKNrB,eLmBU;EKjBZ,cLhBY;EKiBZ,iBLuBwB;AFuiB1B;;AgBtdA;EACE,kBAAA;AhBydF;;AgBtdA;;EAEE,iBAAA;AhBydF;;AgBtdA;;EAEE,kBAAA;AhBydF;;AiBhmBA;EVCE,aAAA;EACA,8BUDgB;EAChB,eAAA;EACA,iBAAA;AjBomBF;;AiBjmBA;EACE,oBAAA;EACA,mBAAA;EACA,sBAAA;AjBomBF;AiBlmBE;EVKE,2CLKuB;EKJvB,eLkBS;EKhBX,cLhBY;EeUV,oBAAA;AjBsmBJ;AiBnmBE;EVAE,qCLUgB;EKThB,eLgBc;EKdhB,cLhBY;EKiBZ,iBLoBqB;AFilBvB;;AiBpmBA;EACE,iBAAA;AjBumBF;;AiBpmBA;EACE,iBAAA;AjBumBF;;AiBpmBA;EACE,iBAAA;AjBumBF;;AiBpmBA;EVjBI,2CLKuB;EKJvB,eLoBc;EKlBhB,cLba;EKcb,iBLyBqB;EeVrB,oBAAA;AjB0mBF;;AiBvmBA;EVtBI,uCLMkB;EKLlB,eLiBmB;EKfrB,cLhBY;EKiBZ,iBLuBwB;EeHxB,oBAAA;AjB6mBF;;AiB1mBA;EV1CE,aAAA;EAEA,mBUyCsB;EACtB,oBAAA;AjB8mBF;AiB3mBI;EACE,cftCU;AFmpBhB;AiB1mBI;EACE,cf7CU;AFypBhB;AiBxmBE;EVzCE,6CLSyB;EKRzB,eLgBc;EKdhB,cLXc;EemDZ,mBAAA;AjB4mBJ;AiBzmBE;EVtDA,WUuDiB;EVtDjB,YUsDuB;EACrB,cfrDY;AFiqBhB;;AkB5qBA;EXgBI,wCLQoB;EKPpB,eLqBa;EKnBf,cLba;EKcb,iBLwBqB;EgB1CrB,qBAAA;AlBkrBF;;AkB/qBA;EACE,YAAA;EACA,mBAAA;AlBkrBF;AkBhrBE;EXOE,2CLKuB;EKJvB,eLmBU;EKjBZ,cLba;EgBKX,oBAAA;AlBorBJ;;AkBhrBA;EACE,oBAAA;AlBmrBF;AkBjrBE;EXjBA,aAAA;EACA,8BWiBkB;AlBorBpB;;AkBhrBA;EXPI,2CLKuB;EKJvB,eLkBS;EKhBX,cLhBY;AF0sBd;AkBnrBE;EACE,chBnBY;AFwsBhB;;AkBjrBA;EACE,chBxBc;AF4sBhB;;AkBjrBA;EX3BE,WW4Be;EX3Bf,YW2BqB;EACrB,chB1Bc;AF+sBhB;;AkBlrBA;EXvCE,aAAA;EAGA,sBWqC6B;EAC7B,eAAA;AlBsrBF;AkBprBE;EX5BE,2CLKuB;EKJvB,eLca;EKZf,cLhBY;EKiBZ,iBLqBwB;EgBKtB,oBAAA;EACA,mBAAA;EACA,YAAA;AlByrBJ;;AkBrrBA;EXnDE,aAAA;EACA,8BWmDgB;EXlDhB,mBWkDgC;AlB0rBlC;AkBxrBE;EXvCE,2CLKuB;EKJvB,eLmBU;EKjBZ,cLba;EKcb,iBL0BqB;AFusBvB;AkB3rBI;EACE,+DAAA;EACA,qBAAA;EACA,kBhBhDS;AF6uBf;AkBzrBE;EACE,+DAAA;EACA,qBAAA;EACA,kBhBvDW;AFkvBf;;AkBvrBA;EXxDI,sCLWiB;EKVjB,eLca;EKZf,cLhBY;EKiBZ,iBLoBqB;EgBkCrB,iBAAA;EACA,YAAA;AlB6rBF;;AkB1rBA;EX7EE,aAAA;EAEA,mBW4EsB;EACtB,qBAAA;AlB8rBF;AkB3rBI;EACE,chBzEU;AFswBhB;AkB1rBI;EACE,chBhFU;AF4wBhB;AkBxrBE;EX5EE,6CLSyB;EKRzB,eLgBc;EKdhB,cLXc;EgBsFZ,mBAAA;AlB4rBJ;AkBzrBE;EXzFA,WW0FiB;EXzFjB,YWyFuB;EACrB,chBxFY;AFoxBhB;;AmB/xBA;EZgBI,2CLKuB;EKJvB,eLoBc;EKlBhB,cLba;EKcb,iBLyBqB;EiB3CrB,oBAAA;AnBqyBF;;AmBlyBA;EACE,eAAA;AnBqyBF;;AmBlyBA;EZOI,uCLMkB;EKLlB,eLca;EKZf,cLhBY;EKiBZ,iBLoBqB;EiB7BrB,qBAAA;EACA,oBAAA;AnBwyBF;;AmBryBA;EZCI,2CLKuB;EKJvB,eLmBU;EKjBZ,cLhBY;EKiBZ,iBL0BqB;EiB7BrB,oBAAA;AnB2yBF;AmBzyBE;EACE,mEAAA;EACA,qBAAA;EACA,oCjBTW;AFozBf;;AmBvyBA;EACE,mEAAA;EACA,qBAAA;EACA,oCjBhBa;AF0zBf;;AmBvyBA;EZ/BE,aAAA;EACA,oBY+BgB;EAChB,oBAAA;AnB2yBF;;AmBxyBA;EZ7BE,WY8Be;EZ7Bf,WY6BqB;EACrB,oBAAA;EACA,cjBtCY;EiBuCZ,uDAAA;AnB4yBF;AmB1yBE;EZnCA,WYoCiB;EZnCjB,YYmCuB;AnB6yBzB;;AmBzyBA;EZxCE,WYyCe;EZxCf,WYwCqB;EACrB,oBAAA;EACA,kBAAA;EACA,cjBlDY;EiBmDZ,sDAAA;AnB6yBF;;AmB1yBA;EZhDE,WYiDe;EZhDf,YYgDqB;AnB8yBvB;;AmB3yBA;EACE,yFAAA;AnB8yBF;;AmB3yBA;EACE,wFAAA;AnB8yBF;;AmBzyBA;EZrEE,aAAA;EAEA,mBYoEsB;EACtB,qBAAA;AnB6yBF;AmB1yBI;EACE,cjBjEU;AF62BhB;AmBzyBI;EACE,cjBxEU;AFm3BhB;AmBvyBE;EZpEE,6CLSyB;EKRzB,eLgBc;EKdhB,cLXc;EiB8EZ,mBAAA;AnB2yBJ;AmBxyBE;EZjFA,WYkFiB;EZjFjB,YYiFuB;EACrB,cjBhFY;AF23BhB;;AoBt4BA;EbQE,YaPe;Ebeb,2CLKuB;EKJvB,eLoBc;EKlBhB,cLba;EKcb,iBLyBqB;EkB1CrB,8HAAA;EACA,qBAAA;EACA,oClBQa;AFo4Bf;;AoBz4BA;EbQI,uCLMkB;EKLlB,eLgBc;EKdhB,cLhBY;EKiBZ,iBLuBwB;EkBjCxB,oBAAA;ApB+4BF;;AoB54BA;EbZE,aAAA;EAGA,sBaU4B;ApBg5B9B;;AoB74BA;;EbhBE,aAAA;EAGA,sBae6B;EAC7B,kBAAA;ApBi5BF;AoB/4BE;;EbdA,WaeiB;EbdjB,WacuB;EACrB,WAAA;EACA,cAAA;EACA,kBAAA;EACA,SAAA;EACA,UAAA;EACA,4DAAA;ApBm5BJ;;AoB/4BA;;;EbjBI,uCLMkB;EKLlB,eLeQ;EKbV,cLhBY;EKiBZ,iBLoBqB;EkBHrB,kBAAA;ApBq5BF;;AoBl5BA;;EAEE,YAAA;ApBq5BF;;AoBl5BA;;;EAGE,mBAAA;EACA,eAAA;EACA,yBAAA;EACA,4BlB/CY;EkBgDZ,yBlBlDY;EkBmDZ,clBlDY;AFu8Bd;;AoBl5BA;EACE,oBAAA;EACA,mBAAA;EACA,mBAAA;EACA,kBAAA;ApBq5BF;;AoBl5BA;EACE,oBAAA;ApBq5BF;;AoBn5BA;;;EAGE,cAAA;ApBs5BF;;AoBp5BA;;;Eb/DE,WakEe;EACf,cAAA;EACA,cAAA;EACA,aAAA;EACA,SAAA;EACA,YAAA;EACA,gBAAA;EACA,gBAAA;ApBu5BF;;AoBr5BA;EACE,gBAAA;ApBw5BF;;AoBr5BA;EACE,6BAAA;EACA,kBAAA;EACA,qBAAA;ApBw5BF;;AoBr5BA;EbrFE,WasFe;EbrFf,WaqFqB;EACrB,kBAAA;EACA,UAAA;EACA,WAAA;EACA,mBAAA;EACA,4DAAA;ApBy5BF;;AoBt5BA;EbrGE,aAAA;EAEA,mBaoGsB;EACtB,oBAAA;EACA,YAAA;EACA,6BlB7Fa;AFu/Bf;AoBx5BE;Eb5FE,6CLSyB;EKRzB,eLgBc;EKdhB,cLXc;AFigChB;AoBz5BE;EbxGA,WayGiB;EbxGjB,YawGuB;EACrB,iBAAA;EACA,clBxGY;AFogChB;AoBx5BI;EACE,clB7GU;AFugChB;AoBv5BI;EACE,clBpHU;AF6gChB;;AqBrhCA;EdCE,aAAA;EACA,uBcDgB;EAChB,eAAA;EACA,oBAAA;ArByhCF;;AqBthCA;EACE,oBAAA;ArByhCF;AqBvhCE;EdOE,2CLKuB;EKJvB,eLca;EKZf,cLhBY;EKiBZ,iBLqBwB;AF6/B1B;AqB1hCI;EACE,cnBLU;AFiiChB;AqBxhCE;EACE,cnBVY;AFoiChB;;AqBthCA;EdrBE,aAAA;EACA,uBcqBgB;EdpBhB,mBcoBwB;ArB2hC1B;AqBzhCE;EACE,oBAAA;EACA,cnBxBU;AFmjCd;AqBxhCE;EACE,mBAAA;EACA,mBAAA;EAEE,gCAAA;EACA,0BAAA;EAEF,cnB7BY;AFqjChB;AqBrhCE;;EdxBE,2CLKuB;EKJvB,eLgBc;EKbhB,iBLoBqB;AF2hCvB","sourcesContent":[":root {\r\n  --normal_font-style: normal;\r\n  --swap_font-display: swap;\r\n}\r\n\r\n@font-face {\r\n  font-family: GinoraSans-light;\r\n  src: url(\"./fonts/GinoraSans/ginorasans-light.woff2\") format(\"woff2\"),\r\n  url(\"./fonts/GinoraSans/ginorasans-light.woff\") format(\"woff\");\r\n  font-style: var(--normal_font-style);\r\n  font-weight: var(--normal_font-style);\r\n  font-display: var(--swap_font-display);\r\n}\r\n\r\n@font-face {\r\n  font-family: GinoraSans-regular;\r\n  src: url(\"./fonts/GinoraSans/ginorasans-regular.woff2\") format(\"woff2\"),\r\n  url(\"./fonts/GinoraSans/ginorasans-regular.woff\") format(\"woff\");\r\n  font-style: var(--normal_font-style);\r\n  font-weight: var(--normal_font-style);\r\n  font-display: var(--swap_font-display);\r\n}\r\n\r\n@font-face {\r\n  font-family: GinoraSans-semi-bold;\r\n  src: url(\"./fonts/GinoraSans/ginorasans-semi-bold.woff2\") format(\"woff2\"),\r\n  url(\"./fonts/GinoraSans/ginorasans-semi-bold.woff\") format(\"woff\");\r\n  font-style: var(--normal_font-style);\r\n  font-weight: var(--normal_font-style);\r\n  font-display: var(--swap_font-display);\r\n}\r\n\r\n\r\n@font-face {\r\n  font-family: GinoraSans-bold;\r\n  src: url(\"./fonts/GinoraSans/ginorasans-bold.woff2\") format(\"woff2\"),\r\n  url(\"./fonts/GinoraSans/ginorasans-bold.woff\") format(\"woff\");\r\n  font-style: var(--normal_font-style);\r\n  font-weight: var(--normal_font-style);\r\n  font-display: var(--swap_font-display);\r\n}\r\n\r\n@font-face {\r\n  font-family: Gilroy-light;\r\n  src: url(\"./fonts/Gilroy/gilroy-light.woff2\") format(\"woff2\"),\r\n  url(\"./fonts/Gilroy/gilroy-light.woff\") format(\"woff\");\r\n  font-style: var(--normal_font-style);\r\n  font-weight: var(--normal_font-style);\r\n  font-display: var(--swap_font-display);\r\n}\r\n\r\n@font-face {\r\n  font-family: Gilroy-regular;\r\n  src: url(\"./fonts/Gilroy/gilroy-regular.woff2\") format(\"woff2\"),\r\n  url(\"./fonts/Gilroy/gilroy-regular.woff\") format(\"woff\");\r\n  font-style: var(--normal_font-style);\r\n  font-weight: var(--normal_font-style);\r\n  font-display: var(--swap_font-display);\r\n}\r\n\r\n@font-face {\r\n  font-family: Gilroy-medium;\r\n  src: url(\"./fonts/Gilroy/gilroy-medium.woff2\") format(\"woff2\"),\r\n  url(\"./fonts/Gilroy/gilroy-medium.woff\") format(\"woff\");\r\n  font-style: var(--normal_font-style);\r\n  font-weight: var(--normal_font-style);\r\n  font-display: var(--swap_font-display);\r\n}\r\n\r\n\r\n\r\n/*FONTS*/\r\n/*$main-font: DM Sans, sans-serif !default;\r\n$secondary-font: Montserrat, sans-serif !default;\r\n$semi-mini-font: 12px !default;\r\n$mini-font: 14px !default;\r\n$extra-mini-font: 16px !default;\r\n$semi-small-font: 18px !default;\r\n$small-font: 20px !default;\r\n$extra-small-font: 22px !default;\r\n$semi-normal-font: 24px !default;\r\n$normal-font: 26px !default;\r\n$extra-normal-font: 28px !default;\r\n$semi-medium-font: 30px !default;\r\n$medium-font: 32px !default;\r\n$extra-medium-font: 34px !default;\r\n$semi-large-font: 36px !default;\r\n$large-font: 38px !default;\r\n$extra-large-font: 40px !default;\r\n$semi-mega-font: 42px !default;\r\n$mega-font: 44px !default;\r\n$extra-mega-font: 46px !default;\r\n$semi-ultra-font: 48px !default;\r\n$ultra-font: 50px !default;\r\n$extra-ultra-font: 52px !default;\r\n$semi-display-font: 54px !default;\r\n$display-font: 56px !default;\r\n$extra-display-font: 58px !default;*/\r\n\r\n$thin-font-weight: 100 !default;\r\n$extra-light-font-weight: 200 !default;\r\n$light-font-weight: 300 !default;\r\n$regular-font-weight: 400 !default;\r\n$medium-font-weight: 500 !default;\r\n$semi-bold-font-weight: 600 !default;\r\n$bold-font-weight: 700 !default;\r\n$extra-bold-font-weight: 800 !default;\r\n$heavy-font-weight: 900 !default;\r\n\r\n//microFont  tinyFont  miniFont  smallFont\r\n//normalFont  mediumFont\r\n//largeFont hugeFont  megaFont ultraFont displayFont\r\n//\r\n// `semi`\r\n// `extra`\r\n// `extraExtra`",":root {\n  --normal_font-style: normal;\n  --swap_font-display: swap;\n}\n\n@font-face {\n  font-family: GinoraSans-light;\n  src: url(\"./fonts/GinoraSans/ginorasans-light.woff2\") format(\"woff2\"), url(\"./fonts/GinoraSans/ginorasans-light.woff\") format(\"woff\");\n  font-style: var(--normal_font-style);\n  font-weight: var(--normal_font-style);\n  font-display: var(--swap_font-display);\n}\n@font-face {\n  font-family: GinoraSans-regular;\n  src: url(\"./fonts/GinoraSans/ginorasans-regular.woff2\") format(\"woff2\"), url(\"./fonts/GinoraSans/ginorasans-regular.woff\") format(\"woff\");\n  font-style: var(--normal_font-style);\n  font-weight: var(--normal_font-style);\n  font-display: var(--swap_font-display);\n}\n@font-face {\n  font-family: GinoraSans-semi-bold;\n  src: url(\"./fonts/GinoraSans/ginorasans-semi-bold.woff2\") format(\"woff2\"), url(\"./fonts/GinoraSans/ginorasans-semi-bold.woff\") format(\"woff\");\n  font-style: var(--normal_font-style);\n  font-weight: var(--normal_font-style);\n  font-display: var(--swap_font-display);\n}\n@font-face {\n  font-family: GinoraSans-bold;\n  src: url(\"./fonts/GinoraSans/ginorasans-bold.woff2\") format(\"woff2\"), url(\"./fonts/GinoraSans/ginorasans-bold.woff\") format(\"woff\");\n  font-style: var(--normal_font-style);\n  font-weight: var(--normal_font-style);\n  font-display: var(--swap_font-display);\n}\n@font-face {\n  font-family: Gilroy-light;\n  src: url(\"./fonts/Gilroy/gilroy-light.woff2\") format(\"woff2\"), url(\"./fonts/Gilroy/gilroy-light.woff\") format(\"woff\");\n  font-style: var(--normal_font-style);\n  font-weight: var(--normal_font-style);\n  font-display: var(--swap_font-display);\n}\n@font-face {\n  font-family: Gilroy-regular;\n  src: url(\"./fonts/Gilroy/gilroy-regular.woff2\") format(\"woff2\"), url(\"./fonts/Gilroy/gilroy-regular.woff\") format(\"woff\");\n  font-style: var(--normal_font-style);\n  font-weight: var(--normal_font-style);\n  font-display: var(--swap_font-display);\n}\n@font-face {\n  font-family: Gilroy-medium;\n  src: url(\"./fonts/Gilroy/gilroy-medium.woff2\") format(\"woff2\"), url(\"./fonts/Gilroy/gilroy-medium.woff\") format(\"woff\");\n  font-style: var(--normal_font-style);\n  font-weight: var(--normal_font-style);\n  font-display: var(--swap_font-display);\n}\n/*FONTS*/\n/*$main-font: DM Sans, sans-serif !default;\n$secondary-font: Montserrat, sans-serif !default;\n$semi-mini-font: 12px !default;\n$mini-font: 14px !default;\n$extra-mini-font: 16px !default;\n$semi-small-font: 18px !default;\n$small-font: 20px !default;\n$extra-small-font: 22px !default;\n$semi-normal-font: 24px !default;\n$normal-font: 26px !default;\n$extra-normal-font: 28px !default;\n$semi-medium-font: 30px !default;\n$medium-font: 32px !default;\n$extra-medium-font: 34px !default;\n$semi-large-font: 36px !default;\n$large-font: 38px !default;\n$extra-large-font: 40px !default;\n$semi-mega-font: 42px !default;\n$mega-font: 44px !default;\n$extra-mega-font: 46px !default;\n$semi-ultra-font: 48px !default;\n$ultra-font: 50px !default;\n$extra-ultra-font: 52px !default;\n$semi-display-font: 54px !default;\n$display-font: 56px !default;\n$extra-display-font: 58px !default;*/\n* {\n  box-sizing: border-box;\n}\n\n/*http://meyerweb.com/eric/tools/css/reset/\nv2.0 | 20110126\nLicense: none (public domain)*/\nhtml, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed,\nfigure, figcaption, footer, header, hgroup,\nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n  margin: 0;\n  padding: 0;\n  border: 0;\n  font-size: 100%;\n  font: inherit;\n  vertical-align: baseline;\n}\n\n/*HTML5 display-role reset for older browsers*/\narticle, aside, details, figcaption, figure,\nfooter, header, hgroup, menu, nav, section {\n  display: block;\n}\n\nbody {\n  line-height: 1;\n}\n\nol, ul {\n  list-style: none;\n}\n\nblockquote, q {\n  quotes: none;\n}\n\nblockquote:before, blockquote:after,\nq:before, q:after {\n  content: \"\";\n  content: none;\n}\n\ntable {\n  border-collapse: collapse;\n  border-spacing: 0;\n}\n\na {\n  text-decoration: none;\n}\n\n/*COLORS*/\n/*FONTS*/\n/*BREAKPOINTS*/\n._grey-bg {\n  background-color: #1D1D1D;\n}\n\n._steel-bg {\n  background-color: #232526;\n}\n\n/*\n@mixin tablet() {\n  @media (max-width: $breakpoint_sm) {\n    @content;\n  }\n}*/\n.container {\n  min-width: 320px;\n  margin: 0 20px;\n}\n\n.hero {\n  display: none;\n}\n\n.menu {\n  padding: 31px 5.55vw;\n  background-color: #232526;\n}\n\n.menu-list {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.menu-list > .menu-item {\n  display: none;\n}\n.menu-list > .menu-item-icon {\n  height: 20px;\n}\n\n.link-menu {\n  font-family: GinoraSans-regular, sans-serif;\n  font-size: 16px;\n  color: #F4F4F4;\n}\n\n#menu-toggle {\n  display: none;\n}\n\n#menu-toggle:checked + .menu-list {\n  flex-direction: column;\n}\n#menu-toggle:checked + .menu-list > .menu-item-logo {\n  display: none;\n}\n#menu-toggle:checked + .menu-list > .menu-item-icon {\n  order: -1;\n  margin-left: auto;\n  padding-top: 4.1px;\n}\n#menu-toggle:checked + .menu-list > .menu-item.-left:first-child {\n  padding-top: 40px;\n}\n#menu-toggle:checked + .menu-list > .menu-item.-left,\n#menu-toggle:checked + .menu-list > .menu-item.-right {\n  display: inline;\n  padding: 15px 0;\n}\n\n.logo {\n  width: 85px;\n  height: 25px;\n  color: #fff;\n}\n\n.box-icon-menu {\n  width: 20px;\n  height: 20px;\n  display: inline-block;\n  color: #232526;\n  background: conic-gradient(from 90deg at 50% 50%, #66FFE6 -160.13deg, #8093FF 42.37deg, #66FFE6 199.87deg, #8093FF 402.37deg);\n}\n.box-icon-menu > .icon-menu {\n  width: 100%;\n  height: 100%;\n}\n\n@media (min-width: 1160px) {\n  .hero {\n    display: block;\n  }\n  .header {\n    padding-top: 30px;\n  }\n  .menu {\n    max-width: 1160px;\n    margin: 0 auto;\n    padding: 31px 60px;\n  }\n  .menu-list {\n    justify-content: start;\n  }\n  .menu-list > .menu-item {\n    display: inline-block;\n    height: 14px;\n  }\n  .menu-list > .menu-item-logo {\n    margin: 0 auto;\n  }\n  .menu-list > .menu-item-icon {\n    height: 12px;\n    padding-left: 5px;\n  }\n  .menu-list > .menu-item.-left {\n    padding-right: 30px;\n  }\n  .menu-list > .menu-item.-right {\n    padding-left: 30px;\n  }\n  #menu-toggle:checked + .menu-list > .menu-item-icon {\n    padding-top: 8.1px;\n  }\n  #menu-toggle:checked + .menu-list > .menu-item.-left,\n  #menu-toggle:checked + .menu-list > .menu-item.-right {\n    padding-top: 30px;\n  }\n  .box-icon-menu {\n    width: 12px;\n    height: 12px;\n  }\n  .box-icon-menu > .icon-menu {\n    margin-bottom: 2px;\n  }\n}\n.intro {\n  padding-top: 90px;\n}\n\n.page-title {\n  font-family: GinoraSans-bold, sans-serif;\n  font-size: 42px;\n  color: #F4F4F4;\n  line-height: 56px;\n  background: conic-gradient(from 180deg at 50% 50%, #66FFE6 -160.13deg, #8093FF 42.37deg, #66FFE6 199.87deg, #8093FF 402.37deg);\n  background-clip: text;\n}\n.page-title > .ai {\n  color: transparent;\n}\n\n.box-spiral {\n  display: flex;\n  justify-content: flex-end;\n  max-height: 190px;\n}\n.box-spiral > .spiral {\n  transform: translateY(-70px);\n}\n\n@media (min-width: 1160px) {\n  .hero {\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    transform: translate(-50%, -50%);\n  }\n  .spiral {\n    display: none;\n  }\n}\n.decisions-title {\n  font-family: GinoraSans-regular, sans-serif;\n  font-size: 36px;\n  color: #F4F4F4;\n  line-height: 44px;\n  padding: 40px 0 30px;\n}\n\n.decisions-desc {\n  font-family: Gilroy-regular, sans-serif;\n  font-size: 16px;\n  color: #B8B8B8;\n  line-height: 24px;\n  padding: 0 10px 30px 0;\n}\n\n.link-project {\n  display: flex;\n  align-items: center;\n  padding-bottom: 60px;\n}\n.link-project:hover > .text-project {\n  color: #5CE4CF;\n}\n.link-project:hover > .arrow-right-green {\n  color: #99A9FF;\n}\n.link-project > .text-project {\n  font-family: GinoraSans-semi-bold, sans-serif;\n  font-size: 16px;\n  color: #99A9FF;\n  padding-right: 10px;\n}\n.link-project > .arrow-right-green {\n  width: 25px;\n  height: 12px;\n  color: #5CE4CF;\n}\n\n.investments-title {\n  font-family: GinoraSans-regular, sans-serif;\n  font-size: 36px;\n  color: #F4F4F4;\n  line-height: 44px;\n  padding: 40px 0 30px;\n}\n\n.investments-desc {\n  font-family: Gilroy-regular, sans-serif;\n  font-size: 16px;\n  color: #B8B8B8;\n  line-height: 24px;\n  padding-bottom: 60px;\n}\n\n.robot {\n  margin-bottom: 20px;\n}\n\n.robotics-inscription {\n  font-family: GinoraSans-regular, sans-serif;\n  font-size: 12px;\n  color: #B8B8B8;\n  line-height: 18px;\n  letter-spacing: 4px;\n  opacity: 0.7;\n}\n\n.robotics-title {\n  font-family: GinoraSans-regular, sans-serif;\n  font-size: 26px;\n  color: #F4F4F4;\n  line-height: 32px;\n  padding: 10px 0 20px;\n}\n\n.robotics-desc {\n  font-family: Gilroy-regular, sans-serif;\n  font-size: 16px;\n  color: #B8B8B8;\n  line-height: 24px;\n  padding-bottom: 40px;\n}\n\n.link-robotics {\n  display: flex;\n  align-items: center;\n  padding-bottom: 80px;\n}\n.link-robotics:hover > .text-robotics {\n  color: #5CE4CF;\n}\n.link-robotics:hover > .arrow-right-green {\n  color: #99A9FF;\n}\n.link-robotics > .text-robotics {\n  font-family: GinoraSans-semi-bold, sans-serif;\n  font-size: 16px;\n  color: #99A9FF;\n  padding-right: 15px;\n}\n.link-robotics > .arrow-right-green {\n  width: 25px;\n  height: 12px;\n  color: #5CE4CF;\n}\n\n.cyborg {\n  margin-bottom: 20px;\n}\n\n.personnel-inscription {\n  font-family: GinoraSans-regular, sans-serif;\n  font-size: 12px;\n  color: #B8B8B8;\n  line-height: 18px;\n  letter-spacing: 4px;\n  opacity: 0.7;\n}\n\n.personnel-title {\n  font-family: GinoraSans-regular, sans-serif;\n  font-size: 26px;\n  color: #F4F4F4;\n  line-height: 32px;\n  padding: 10px 0 20px;\n}\n\n.personnel-desc {\n  font-family: Gilroy-regular, sans-serif;\n  font-size: 16px;\n  color: #B8B8B8;\n  line-height: 24px;\n  padding-bottom: 40px;\n}\n\n.link-personnel {\n  display: flex;\n  align-items: center;\n  padding-bottom: 100px;\n}\n.link-personnel > .text-robotics {\n  font-family: GinoraSans-semi-bold, sans-serif;\n  font-size: 16px;\n  color: #5CE4CF;\n  padding-right: 15px;\n}\n.link-personnel > .arrow-right-green {\n  width: 25px;\n  height: 12px;\n  color: #99A9FF;\n}\n.link-personnel:hover > .text-robotics {\n  color: #99A9FF;\n}\n.link-personnel:hover > .arrow-right-green {\n  color: #5CE4CF;\n}\n\n.separator {\n  width: 100%;\n  height: 1px;\n  background: linear-gradient(to right, transparent 0%, #7D9BFA 21.14%, #60DBD4 80%, transparent 100%);\n}\n\n.separator.-jobs {\n  background: linear-gradient(to right, #7D9BFA, #60DBD4);\n}\n\n.divers-title {\n  font-family: GinoraSans-regular, sans-serif;\n  font-size: 36px;\n  color: #F4F4F4;\n  line-height: 44px;\n  padding: 20px 0 40px;\n}\n\n.brand-list {\n  display: flex;\n  flex-wrap: wrap;\n  padding-bottom: 80px;\n}\n\n.divers-list-1,\n.divers-list-2 {\n  display: flex;\n  justify-content: space-between;\n  flex-wrap: wrap;\n}\n\n.link-divers {\n  display: flex;\n  align-items: center;\n  padding: 20px;\n}\n.link-divers:hover > .box-icon-divers {\n  background: linear-gradient(to bottom right, #99A9FF, #5CE4CF);\n}\n.link-divers:hover > .text-divers {\n  background: linear-gradient(94.32deg, #99A9FF 0%, #5CE4CF 100%);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n}\n\n.link-divers > .box-icon-divers.active {\n  background: linear-gradient(to bottom right, #99A9FF, #5CE4CF);\n}\n.link-divers > .text-divers.active {\n  background: linear-gradient(94.32deg, #99A9FF 0%, #5CE4CF 100%);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n}\n\n.box-icon-divers {\n  background-color: #B8B8B8;\n}\n.box-icon-divers > .icon-divers {\n  width: 20px;\n  height: 20px;\n  color: #1D1D1D;\n}\n.box-icon-divers > .atom {\n  height: 18.2px;\n}\n.box-icon-divers > .oracle {\n  height: 19.05px;\n}\n.box-icon-divers > .tindo {\n  height: 18.26px;\n}\n.box-icon-divers > .ordix {\n  height: 17.27px;\n}\n.box-icon-divers > .raxon {\n  height: 16.8px;\n}\n\n.box-atom {\n  height: 18px;\n}\n\n.box-oracle {\n  height: 18px;\n  margin-right: 4px;\n}\n\n.box-tindo {\n  height: 18px;\n}\n\n.box-kawaski {\n  height: 20px;\n  margin-right: 4px;\n}\n\n.box-jarvice {\n  height: 20px;\n}\n\n.box-cypher {\n  height: 20px;\n  margin-right: 7px;\n}\n\n.box-ordix {\n  height: 17.2px;\n}\n\n.box-raxon {\n  height: 16.7px;\n  margin-right: 10px;\n}\n\n.text-divers {\n  font-family: GinoraSans-light, sans-serif;\n  font-size: 26px;\n  color: #B8B8B8;\n  line-height: 26px;\n}\n\n.text-raxon {\n  padding-right: 5px;\n}\n\n.text-atom,\n.text-jarvice {\n  padding-left: 6px;\n}\n\n.text-tindo,\n.text-ordix {\n  padding-left: 10px;\n}\n\n.list-geniuses {\n  display: flex;\n  justify-content: space-between;\n  flex-wrap: wrap;\n  padding-top: 60px;\n}\n\n.genius {\n  display: inline-flex;\n  align-items: center;\n  flex-direction: column;\n}\n.genius > .name {\n  font-family: GinoraSans-regular, sans-serif;\n  font-size: 20px;\n  color: #B8B8B8;\n  padding: 20px 0 10px;\n}\n.genius > .position {\n  font-family: Gilroy-light, sans-serif;\n  font-size: 16px;\n  color: #B8B8B8;\n  line-height: 16px;\n}\n\n.gen-mark {\n  padding-top: 30px;\n}\n\n.gen-chris {\n  padding-top: 20px;\n}\n\n.gen-roberto {\n  padding-top: 50px;\n}\n\n.minds-title {\n  font-family: GinoraSans-regular, sans-serif;\n  font-size: 36px;\n  color: #F4F4F4;\n  line-height: 44px;\n  padding: 60px 0 30px;\n}\n\n.minds-desc {\n  font-family: Gilroy-regular, sans-serif;\n  font-size: 19px;\n  color: #B8B8B8;\n  line-height: 26px;\n  padding-bottom: 30px;\n}\n\n.link-minds {\n  display: flex;\n  align-items: center;\n  padding-bottom: 60px;\n}\n.link-minds:hover > .text-robotics {\n  color: #5CE4CF;\n}\n.link-minds:hover > .arrow-right-green {\n  color: #99A9FF;\n}\n.link-minds > .text-robotics {\n  font-family: GinoraSans-semi-bold, sans-serif;\n  font-size: 16px;\n  color: #99A9FF;\n  padding-right: 50px;\n}\n.link-minds > .arrow-right-green {\n  width: 25px;\n  height: 12px;\n  color: #5CE4CF;\n}\n\n.jobs-title {\n  font-family: GinoraSans-bold, sans-serif;\n  font-size: 42px;\n  color: #F4F4F4;\n  line-height: 56px;\n  padding: 100px 0 60px;\n}\n\n.wrap-jobs {\n  width: 300px;\n  margin-inline: auto;\n}\n.wrap-jobs > .categories-title {\n  font-family: GinoraSans-regular, sans-serif;\n  font-size: 26px;\n  color: #F4F4F4;\n  padding-bottom: 30px;\n}\n\n.item-jobs {\n  padding-bottom: 20px;\n}\n.item-jobs > .link-jobs {\n  display: flex;\n  justify-content: space-between;\n}\n\n.text-job {\n  font-family: GinoraSans-regular, sans-serif;\n  font-size: 20px;\n  color: #B8B8B8;\n}\n.text-job:hover {\n  color: #99A9FF;\n}\n\n.active-text-lob {\n  color: #99A9FF;\n}\n\n.green-long-right-arrow {\n  width: 30px;\n  height: 20px;\n  color: #5CE4CF;\n}\n\n.card-jobs {\n  display: flex;\n  flex-direction: column;\n  padding: 40px 0;\n}\n.card-jobs > .inscription-jobs {\n  font-family: GinoraSans-regular, sans-serif;\n  font-size: 12px;\n  color: #B8B8B8;\n  line-height: 18px;\n  padding-bottom: 10px;\n  letter-spacing: 4px;\n  opacity: 0.7;\n}\n\n.link-card-jobs {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.link-card-jobs > .card-title-jobs {\n  font-family: GinoraSans-regular, sans-serif;\n  font-size: 26px;\n  color: #F4F4F4;\n  line-height: 32px;\n}\n.link-card-jobs > .card-title-jobs:hover {\n  background: linear-gradient(92.73deg, #99A9FF 0%, #5CE4CF 100%);\n  background-clip: text;\n  color: transparent;\n}\n.link-card-jobs > .active-title-jobs {\n  background: linear-gradient(92.73deg, #99A9FF 0%, #5CE4CF 100%);\n  background-clip: text;\n  color: transparent;\n}\n\n.desc-jobs {\n  font-family: Gilroy-medium, sans-serif;\n  font-size: 12px;\n  color: #B8B8B8;\n  line-height: 16px;\n  padding-top: 20px;\n  opacity: 0.7;\n}\n\n.link-jobs-card {\n  display: flex;\n  align-items: center;\n  padding: 60px 0 100px;\n}\n.link-jobs-card:hover > .text-jobs {\n  color: #5CE4CF;\n}\n.link-jobs-card:hover > .arrow-right-green {\n  color: #99A9FF;\n}\n.link-jobs-card > .text-jobs {\n  font-family: GinoraSans-semi-bold, sans-serif;\n  font-size: 16px;\n  color: #99A9FF;\n  padding-right: 10px;\n}\n.link-jobs-card > .arrow-right-green {\n  width: 25px;\n  height: 12px;\n  color: #5CE4CF;\n}\n\n.title-resources {\n  font-family: GinoraSans-regular, sans-serif;\n  font-size: 36px;\n  color: #F4F4F4;\n  line-height: 44px;\n  padding: 20px 0 60px;\n}\n\n.cards-resources {\n  padding: 0 20px;\n}\n\n.date {\n  font-family: Gilroy-regular, sans-serif;\n  font-size: 12px;\n  color: #B8B8B8;\n  line-height: 16px;\n  display: inline-block;\n  padding: 30px 0 10px;\n}\n\n.title-card-resources {\n  font-family: GinoraSans-regular, sans-serif;\n  font-size: 26px;\n  color: #B8B8B8;\n  line-height: 32px;\n  padding-bottom: 60px;\n}\n.title-card-resources:hover {\n  background: linear-gradient(96.97deg, #99A9FF 20.47%, #5CE4CF 100%);\n  background-clip: text;\n  -webkit-text-fill-color: transparent;\n}\n\n.active-card-resources {\n  background: linear-gradient(96.97deg, #99A9FF 20.47%, #5CE4CF 100%);\n  background-clip: text;\n  -webkit-text-fill-color: transparent;\n}\n\n.swiper-nav {\n  display: flex;\n  justify-content: end;\n  padding-bottom: 60px;\n}\n\n.box-btn-right {\n  width: 62px;\n  height: 8px;\n  display: inline-flex;\n  color: #1D1D1D;\n  background: linear-gradient(to right, #99A9FF, #5CE4CF);\n}\n.box-btn-right > .arrow-btn-right {\n  width: 100%;\n  height: 100%;\n}\n\n.box-btn-left {\n  width: 31px;\n  height: 8px;\n  display: inline-flex;\n  margin-right: 21px;\n  color: #1D1D1D;\n  background: linear-gradient(to left, #99A9FF, #5CE4CF);\n}\n\n.arrow-btn-left {\n  width: 100%;\n  height: 100%;\n}\n\n.swiper-button-disabled.box-btn-right {\n  background: linear-gradient(to right, rgba(92, 228, 207, 0.15), rgba(153, 169, 255, 0.4));\n}\n\n.swiper-button-disabled.box-btn-left {\n  background: linear-gradient(to left, rgba(92, 228, 207, 0.15), rgba(153, 169, 255, 0.4));\n}\n\n.link-resources {\n  display: flex;\n  align-items: center;\n  padding: 20px 0 100px;\n}\n.link-resources:hover > .text-resources {\n  color: #5CE4CF;\n}\n.link-resources:hover > .arrow-right-green {\n  color: #99A9FF;\n}\n.link-resources .text-resources {\n  font-family: GinoraSans-semi-bold, sans-serif;\n  font-size: 16px;\n  color: #99A9FF;\n  padding-right: 10px;\n}\n.link-resources > .arrow-right-green {\n  width: 25px;\n  height: 12px;\n  color: #5CE4CF;\n}\n\n.title-reg {\n  width: 330px;\n  font-family: GinoraSans-regular, sans-serif;\n  font-size: 36px;\n  color: #F4F4F4;\n  line-height: 44px;\n  background: conic-gradient(from 180deg at 50% 50%, #66FFE6 -160.13deg, #8093FF 42.37deg, #66FFE6 199.87deg, #8093FF 402.37deg);\n  background-clip: text;\n  -webkit-text-fill-color: transparent;\n}\n\n.desc-reg {\n  font-family: Gilroy-regular, sans-serif;\n  font-size: 16px;\n  color: #B8B8B8;\n  line-height: 26px;\n  padding: 20px 0 60px;\n}\n\n.group-message {\n  display: flex;\n  flex-direction: column;\n}\n\n.group-name,\n.group-email {\n  display: flex;\n  flex-direction: column;\n  position: relative;\n}\n.group-name::before,\n.group-email::before {\n  width: 80px;\n  height: 3px;\n  content: \"\";\n  display: block;\n  position: absolute;\n  top: 38px;\n  left: 10px;\n  background: linear-gradient(90deg, #99A9FF 0%, #5CE4CF 100%);\n}\n\n.label-name,\n.label-email,\n.text-message {\n  font-family: Gilroy-regular, sans-serif;\n  font-size: 14px;\n  color: #B8B8B8;\n  line-height: 16px;\n  padding-left: 10px;\n}\n\n.name-text,\n.email-text {\n  height: 24px;\n}\n\n.name-text,\n.email-text,\n.textarea {\n  margin-bottom: 40px;\n  padding: 0 10px;\n  border: 1px solid #1D1D1D;\n  border-bottom-color: #565656;\n  background-color: #1D1D1D;\n  color: #B8B8B8;\n}\n\n.input-sizer {\n  display: inline-grid;\n  vertical-align: top;\n  align-items: center;\n  position: relative;\n}\n\n.input-sizer.stacked {\n  align-items: stretch;\n}\n\n.input-sizer.stacked::after,\n.input-sizer.stacked input,\n.input-sizer.stacked .textarea {\n  grid-area: 2/1;\n}\n\n.input-sizer::after,\n.input-sizer input,\n.input-sizer .textarea {\n  width: auto;\n  min-width: 1em;\n  grid-area: 1/2;\n  font: inherit;\n  margin: 0;\n  resize: none;\n  background: none;\n  appearance: none;\n}\n\n.input-sizer .textarea {\n  min-height: 20px;\n}\n\n.input-sizer::after {\n  content: attr(data-value) \" \";\n  visibility: hidden;\n  white-space: pre-wrap;\n}\n\n.bottom-line {\n  width: 80px;\n  height: 3px;\n  position: relative;\n  left: 10px;\n  bottom: 2px;\n  margin-bottom: 40px;\n  background: linear-gradient(90deg, #99A9FF 0%, #5CE4CF 100%);\n}\n\n.reg-btn {\n  display: flex;\n  align-items: center;\n  padding: 20px 0 80px;\n  border: none;\n  background-color: transparent;\n}\n.reg-btn > .reg-text-btn {\n  font-family: GinoraSans-semi-bold, sans-serif;\n  font-size: 16px;\n  color: #99A9FF;\n}\n.reg-btn > .arrow-right-green {\n  width: 25px;\n  height: 12px;\n  margin-left: 30px;\n  color: #5CE4CF;\n}\n.reg-btn:hover > .reg-text-btn {\n  color: #5CE4CF;\n}\n.reg-btn:hover > .arrow-right-green {\n  color: #99A9FF;\n}\n\n.networks-list {\n  display: flex;\n  justify-content: center;\n  flex-wrap: wrap;\n  padding-bottom: 40px;\n}\n\n.item-networks {\n  padding: 0 10px 20px;\n}\n.item-networks > .network-link {\n  font-family: GinoraSans-regular, sans-serif;\n  font-size: 12px;\n  color: #B8B8B8;\n  line-height: 18px;\n}\n.item-networks > .network-link:hover {\n  color: #99A9FF;\n}\n.item-networks > .active-network-link {\n  color: #99A9FF;\n}\n\n.basement {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n.basement > .auth-protection {\n  padding: 30px 0 35px;\n  color: #B8B8B8;\n}\n.basement > .company-protection {\n  margin: 0 0 2px 4px;\n  padding-bottom: 2px;\n  border-bottom: 2px solid #99A9FF;\n  border-bottom-width: 1.5px;\n  color: #99A9FF;\n}\n.basement > .auth-protection,\n.basement > .company-protection {\n  font-family: GinoraSans-regular, sans-serif;\n  font-size: 16px;\n  line-height: 16px;\n}","* {\r\n    box-sizing: border-box;\r\n}\r\n\r\n/*http://meyerweb.com/eric/tools/css/reset/\r\nv2.0 | 20110126\r\nLicense: none (public domain)*/\r\nhtml, body, div, span, applet, object, iframe,\r\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\r\na, abbr, acronym, address, big, cite, code,\r\ndel, dfn, em, img, ins, kbd, q, s, samp,\r\nsmall, strike, strong, sub, sup, tt, var,\r\nb, u, i, center,\r\ndl, dt, dd, ol, ul, li,\r\nfieldset, form, label, legend,\r\ntable, caption, tbody, tfoot, thead, tr, th, td,\r\narticle, aside, canvas, details, embed,\r\nfigure, figcaption, footer, header, hgroup,\r\nmenu, nav, output, ruby, section, summary,\r\ntime, mark, audio, video {\r\n    margin: 0;\r\n    padding: 0;\r\n    border: 0;\r\n    font-size: 100%;\r\n    font: inherit;\r\n    vertical-align: baseline;\r\n}\r\n\r\n/*HTML5 display-role reset for older browsers*/\r\narticle, aside, details, figcaption, figure,\r\nfooter, header, hgroup, menu, nav, section {\r\n    display: block;\r\n}\r\n\r\nbody {\r\n    line-height: 1;\r\n}\r\n\r\nol, ul {\r\n    list-style: none;\r\n}\r\n\r\nblockquote, q {\r\n    quotes: none;\r\n}\r\n\r\nblockquote:before, blockquote:after,\r\nq:before, q:after {\r\n    content: \"\";\r\n    content: none;\r\n}\r\n\r\ntable {\r\n    border-collapse: collapse;\r\n    border-spacing: 0;\r\n}\r\n\r\na {\r\n    text-decoration: none;\r\n}","/*COLORS*/\r\n$color-grey: #232526 !default;\r\n$color-grey2: #1D1D1D !default;\r\n$color-grey3: #B8B8B8 !default;\r\n$color-grey4: #565656 !default;\r\n$color-white: #fff !default;\r\n$color-white2: #F4F4F4 !default;\r\n$color-purple: #8093FF !default;\r\n$color-purple2: #99A9FF !default;\r\n$color-purple3: #7D9BFA !default;\r\n$color-salad : #66FFE6 !default;\r\n$color-salad2 : #5CE4CF !default;\r\n$color-salad3 : #60DBD4 !default;\r\n$color-clear : transparent !default;\r\n\r\n$primary-color: $color-purple !default;\r\n$secondary-color: $color-salad !default;\r\n$primary-title-color: $color-white2 !default;\r\n$secondary-title-color: $color-grey3 !default;\r\n\r\n/*FONTS*/\r\n$ginora-sans-regular-font: GinoraSans-regular, sans-serif !default;\r\n$gilroy-regular-font: Gilroy-regular, sans-serif !default;\r\n$ginora-sans-light-font: GinoraSans-light, sans-serif !default;\r\n$ginora-sans-bold-font: GinoraSans-bold, sans-serif !default;\r\n$ginora-sans-semi-bold-font: GinoraSans-semi-bold, sans-serif !default;\r\n$gilroy-light-font: Gilroy-light, sans-serif !default;\r\n$gilroy-medium-font: Gilroy-medium, sans-serif !default;\r\n$main-font: $ginora-sans-regular-font !default;\r\n$secondary-font: $gilroy-regular-font !default;\r\n\r\n$semi-mini-font: 12px !default;\r\n$mini-font: 14px !default;\r\n$extra-mini-font: 16px !default;\r\n$semi-semi-small-font: 19px !default;\r\n$small-font: 20px !default;\r\n$normal-font: 26px !default;\r\n$semi-large-font: 36px !default;\r\n$semi-mega-font: 42px !default;\r\n\r\n$position-line-height: 16px !default;\r\n$inscription-line-height: 18px !default;\r\n$paragraph-line-height: 24px !default;\r\n$item-divers-line-height: 26px !default;\r\n$h1-title-line-height: 56px !default;\r\n$h2-title-line-height: 44px !default;\r\n$h3-title-line-height: 32px !default;\r\n\r\n/*BREAKPOINTS*/\r\n$breakpoint_sm: 576px !default;\r\n$breakpoint_xxl: 1160px !default;","._grey-bg {\r\n  background-color: $color-grey2;\r\n}\r\n\r\n._steel-bg {\r\n  background-color: $color-grey;\r\n}","@mixin desktop() {\r\n  @media (min-width: $breakpoint_xxl) {\r\n    @content;\r\n  }\r\n}\r\n\r\n/*\r\n@mixin tablet() {\r\n  @media (max-width: $breakpoint_sm) {\r\n    @content;\r\n  }\r\n}*/\r\n",".container {\r\n  min-width: 320px;\r\n  margin: 0 20px;\r\n}",".hero {\r\n  display: none;\r\n}\r\n\r\n.menu {\r\n  padding: 31px 5.55vw;\r\n  background-color: $color-grey;\r\n}\r\n\r\n.menu-list {\r\n  @include rowing(space-between, center);\r\n\r\n  > .menu-item {\r\n    display: none;\r\n  }\r\n\r\n  > .menu-item-icon {\r\n    @include sizes(null, 20px);\r\n  }\r\n}\r\n\r\n.link-menu {\r\n  @include fonts($main-font, $extra-mini-font, $color-white2);\r\n}\r\n\r\n#menu-toggle {\r\n  display: none;\r\n}\r\n#menu-toggle:checked + .menu-list {\r\n  flex-direction: column;\r\n\r\n  > .menu-item-logo {\r\n    display: none;\r\n  }\r\n\r\n  > .menu-item-icon {\r\n    order: -1;\r\n    margin-left: auto;\r\n    padding-top: 4.1px;\r\n  }\r\n\r\n  > .menu-item.-left {\r\n    &:first-child {\r\n      padding-top: 40px;\r\n    }\r\n  }\r\n\r\n  > .menu-item.-left,\r\n  > .menu-item.-right {\r\n    display: inline;\r\n    padding: 15px 0;\r\n  }\r\n}\r\n\r\n\r\n.logo {\r\n  @include sizes(85px, 25px);\r\n  color: $color-white;\r\n}\r\n\r\n.box-icon-menu {\r\n  @include sizes(20px, 20px);\r\n  display: inline-block;\r\n  color: $color-grey;\r\n  background: conic-gradient(from 90deg at 50% 50%, $secondary-color -160.13deg, $primary-color 42.37deg, $secondary-color 199.87deg, $primary-color 402.37deg);\r\n\r\n  > .icon-menu {\r\n    @include sizes(100%, 100%);\r\n  }\r\n}\r\n\r\n","@mixin rowing($dist: null, $align: null, $direct: null) {\r\n  display: flex;\r\n  justify-content: $dist;\r\n  align-items: $align;\r\n  flex-direction: $direct;\r\n}\r\n\r\n@mixin sizes($numb: null, $second-numb: null, $third-numb: null, $fourth-numb: null) {\r\n  width: $numb;\r\n  height: $second-numb;\r\n  border-radius: $third-numb;\r\n  margin: $fourth-numb;\r\n}\r\n\r\n@mixin fonts ($font-family: null, $font-size: null, $color: null, $line-height: null) {\r\n  font: {\r\n    family: $font-family;\r\n    size: $font_size;\r\n  };\r\n  color: $color;\r\n  line-height: $line-height;\r\n}","@include desktop {\r\n  .hero {\r\n    display: block;\r\n  }\r\n\r\n  .header {\r\n    padding-top: 30px;\r\n  }\r\n\r\n  .menu {\r\n    max-width: 1160px;\r\n    margin: 0 auto;\r\n    padding: 31px 60px;\r\n  }\r\n\r\n  .menu-list {\r\n    justify-content: start;\r\n\r\n    > .menu-item {\r\n      display: inline-block;\r\n      @include sizes(null, 14px);\r\n    }\r\n\r\n    > .menu-item-logo {\r\n      margin: 0 auto;\r\n    }\r\n\r\n    > .menu-item-icon {\r\n      @include sizes(null, 12px);\r\n      padding-left: 5px;\r\n    }\r\n\r\n    > .menu-item.-left {\r\n      padding-right: 30px;\r\n    }\r\n\r\n    > .menu-item.-right {\r\n      padding-left: 30px;\r\n    }\r\n  }\r\n\r\n  #menu-toggle:checked + .menu-list {\r\n    > .menu-item-icon {\r\n      padding-top: 8.1px;\r\n    }\r\n\r\n    > .menu-item.-left,\r\n    > .menu-item.-right {\r\n      padding-top: 30px;\r\n    }\r\n  }\r\n\r\n  .box-icon-menu {\r\n    @include sizes(12px, 12px);\r\n\r\n    > .icon-menu {\r\n      margin-bottom: 2px;\r\n    }\r\n  }\r\n}",".intro {\r\n  padding-top: 90px;\r\n}\r\n\r\n.page-title {\r\n  @include fonts($ginora-sans-bold-font, $semi-mega-font, $primary-title-color, $h1-title-line-height);\r\n  background: conic-gradient(from 180deg at 50% 50%, $secondary-color -160.13deg, $primary-color 42.37deg, $secondary-color 199.87deg, $primary-color 402.37deg);\r\n  background-clip: text;\r\n\r\n  > .ai {\r\n    color: transparent;\r\n  }\r\n}\r\n\r\n.box-spiral {\r\n  @include rowing(flex-end);\r\n  max-height: 190px;\r\n\r\n  > .spiral {\r\n    transform: translateY(-70px);\r\n  }\r\n}","@include desktop {\n  .hero {\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    transform: translate(-50%, -50%);\n  }\n\n  .spiral {\n    display: none;\n  }\n}",".decisions-title {\r\n  @include fonts($main-font, $semi-large-font, $primary-title-color, $h2-title-line-height);\r\n  padding: 40px 0 30px;\r\n}\r\n\r\n.decisions-desc {\r\n  @include fonts($secondary-font, $extra-mini-font, $secondary-title-color, $paragraph-line-height);\r\n  padding: 0 10px 30px 0;\r\n}\r\n\r\n.link-project {\r\n  @include rowing(null, center);\r\n  padding-bottom: 60px;\r\n\r\n  &:hover {\r\n    > .text-project {\r\n      color: $color-salad2;\r\n    }\r\n\r\n    > .arrow-right-green {\r\n      color: $color-purple2;\r\n    }\r\n  }\r\n\r\n  > .text-project {\r\n    @include fonts($ginora-sans-semi-bold-font, $extra-mini-font, $color-purple2);\r\n    padding-right: 10px;\r\n  }\r\n\r\n  > .arrow-right-green {\r\n    @include sizes(25px, 12px);\r\n    color: $color-salad2;\r\n  }\r\n}",".investments-title {\r\n  @include fonts($main-font, $semi-large-font, $primary-title-color, $h2-title-line-height);\r\n  padding: 40px 0 30px;\r\n}\r\n\r\n.investments-desc {\r\n  @include fonts($secondary-font, $extra-mini-font, $secondary-title-color, $paragraph-line-height);\r\n  padding-bottom: 60px;\r\n}",".robot {\r\n  margin-bottom: 20px;\r\n}\r\n\r\n.robotics-inscription {\r\n  @include fonts($main-font, $semi-mini-font, $color-grey3, $inscription-line-height);\r\n  letter-spacing: 4px;\r\n  opacity: .7;\r\n}\r\n\r\n.robotics-title {\r\n  @include fonts($main-font, $normal-font, $primary-title-color, $h3-title-line-height);\r\n  padding: 10px 0 20px;\r\n}\r\n\r\n.robotics-desc {\r\n  @include fonts($secondary-font, $extra-mini-font, $secondary-title-color, $paragraph-line-height);\r\n  padding-bottom: 40px;\r\n}\r\n\r\n.link-robotics {\r\n  @include rowing(null, center);\r\n  padding-bottom: 80px;\r\n\r\n  &:hover {\r\n    > .text-robotics {\r\n      color: $color-salad2;\r\n    }\r\n\r\n    > .arrow-right-green {\r\n      color: $color-purple2;\r\n    }\r\n  }\r\n\r\n  > .text-robotics {\r\n    @include fonts($ginora-sans-semi-bold-font, $extra-mini-font, $color-purple2);\r\n    padding-right: 15px;\r\n  }\r\n\r\n  > .arrow-right-green {\r\n    @include sizes(25px, 12px);\r\n    color: $color-salad2;\r\n  }\r\n}",".cyborg {\r\n  margin-bottom: 20px;\r\n}\r\n\r\n.personnel-inscription {\r\n  @include fonts($main-font, $semi-mini-font, $color-grey3, $inscription-line-height);\r\n  letter-spacing: 4px;\r\n  opacity: .7;\r\n}\r\n\r\n.personnel-title {\r\n  @include fonts($main-font, $normal-font, $primary-title-color, $h3-title-line-height);\r\n  padding: 10px 0 20px;\r\n}\r\n\r\n.personnel-desc {\r\n  @include fonts($secondary-font, $extra-mini-font, $secondary-title-color, $paragraph-line-height);\r\n  padding-bottom: 40px;\r\n}\r\n\r\n.link-personnel {\r\n  @include rowing(null, center);\r\n  padding-bottom: 100px;\r\n\r\n  > .text-robotics {\r\n    @include fonts($ginora-sans-semi-bold-font, $extra-mini-font, $color-salad2);\r\n    padding-right: 15px;\r\n  }\r\n\r\n  > .arrow-right-green {\r\n    @include sizes(25px, 12px);\r\n    color: $color-purple2;\r\n  }\r\n\r\n  &:hover {\r\n    > .text-robotics {\r\n      color: $color-purple2;\r\n    }\r\n\r\n    > .arrow-right-green {\r\n      color: $color-salad2;\r\n    }\r\n  }\r\n}",".separator {\r\n  @include sizes(100%, 1px);\r\n  background: linear-gradient(\r\n                  to right,\r\n                  $color-clear 0%,\r\n                  $color-purple3 21.14%,\r\n                  $color-salad3 80%,\r\n                  $color-clear 100%\r\n  );\r\n}\r\n\r\n.separator.-jobs {\r\n  background: linear-gradient(\r\n                  to right,\r\n                  $color-purple3,\r\n                  $color-salad3\r\n  );\r\n}",".divers-title {\r\n  @include fonts($main-font, $semi-large-font, $primary-title-color, $h2-title-line-height);\r\n  padding: 20px 0 40px;\r\n}\r\n\r\n.brand-list {\r\n  @include rowing();\r\n  flex-wrap: wrap;\r\n  padding-bottom: 80px;\r\n}\r\n\r\n.divers-list-1,\r\n.divers-list-2 {\r\n  @include rowing(space-between);\r\n  flex-wrap: wrap;\r\n}\r\n\r\n.link-divers {\r\n  @include rowing(null, center);\r\n  padding: 20px;\r\n\r\n  &:hover {\r\n    > .box-icon-divers {\r\n      background: linear-gradient(\r\n                      to bottom right,\r\n                      #99A9FF,\r\n                      #5CE4CF\r\n      );\r\n\r\n    }\r\n\r\n    > .text-divers {\r\n      background: linear-gradient(94.32deg, #99A9FF 0%, #5CE4CF 100%);\r\n      -webkit-background-clip: text;\r\n      -webkit-text-fill-color: transparent;\r\n    }\r\n  }\r\n}\r\n\r\n.link-divers {\r\n  > .box-icon-divers.active {\r\n    background: linear-gradient(\r\n                    to bottom right,\r\n                    #99A9FF,\r\n                    #5CE4CF\r\n    );\r\n  }\r\n\r\n  > .text-divers.active {\r\n    background: linear-gradient(94.32deg, #99A9FF 0%, #5CE4CF 100%);\r\n    -webkit-background-clip: text;\r\n    -webkit-text-fill-color: transparent;\r\n  }\r\n}\r\n\r\n.box-icon-divers {\r\n  background-color: $color-grey3;\r\n\r\n  > .icon-divers {\r\n    @include sizes(20px, 20px);\r\n    color: $color-grey2;\r\n  }\r\n\r\n  > .atom {\r\n    @include sizes(null, 18.2px);\r\n  }\r\n\r\n  > .oracle {\r\n    @include sizes(null, 19.05px);\r\n  }\r\n\r\n  > .tindo {\r\n    @include sizes(null, 18.26px);\r\n  }\r\n\r\n  > .ordix {\r\n    @include sizes(null, 17.27px);\r\n  }\r\n\r\n  > .raxon {\r\n    @include sizes(null, 16.8px);\r\n  }\r\n}\r\n\r\n.box-atom {\r\n  @include sizes(null, 18px);\r\n}\r\n\r\n.box-oracle {\r\n  @include sizes(null, 18px);\r\n  margin-right: 4px;\r\n}\r\n\r\n.box-tindo {\r\n  @include sizes(null, 18px);\r\n}\r\n\r\n.box-kawaski {\r\n  @include sizes(null, 20px);\r\n  margin-right: 4px;\r\n}\r\n\r\n.box-jarvice {\r\n  @include sizes(null, 20px);\r\n}\r\n\r\n.box-cypher {\r\n  @include sizes(null, 20px);\r\n  margin-right: 7px;\r\n}\r\n\r\n.box-ordix {\r\n  @include sizes(null, 17.2px);\r\n}\r\n\r\n.box-raxon {\r\n  @include sizes(null, 16.7px);\r\n  margin-right: 10px;\r\n}\r\n\r\n.text-divers {\r\n  @include fonts($ginora-sans-light-font, $normal-font,$color-grey3, $item-divers-line-height);\r\n}\r\n\r\n.text-raxon {\r\n  padding-right: 5px;\r\n}\r\n\r\n.text-atom,\r\n.text-jarvice {\r\n  padding-left: 6px;\r\n}\r\n\r\n.text-tindo,\r\n.text-ordix {\r\n  padding-left: 10px;\r\n}",".list-geniuses {\r\n  @include rowing(space-between);\r\n  flex-wrap: wrap;\r\n  padding-top: 60px;\r\n}\r\n\r\n.genius {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  flex-direction: column;\r\n\r\n  > .name {\r\n    @include fonts($main-font, $small-font, $color-grey3);\r\n    padding: 20px 0 10px;\r\n  }\r\n\r\n  > .position {\r\n    @include fonts($gilroy-light-font, $extra-mini-font, $color-grey3, $position-line-height);\r\n  }\r\n}\r\n\r\n.gen-mark {\r\n  padding-top: 30px;\r\n}\r\n\r\n.gen-chris {\r\n  padding-top: 20px;\r\n}\r\n\r\n.gen-roberto {\r\n  padding-top: 50px;\r\n}\r\n\r\n.minds-title {\r\n  @include fonts($main-font, $semi-large-font, $primary-title-color, $h2-title-line-height);\r\n  padding: 60px 0  30px;\r\n}\r\n\r\n.minds-desc {\r\n  @include fonts($secondary-font, $semi-semi-small-font, $secondary-title-color, $item-divers-line-height);\r\n  padding-bottom: 30px;\r\n}\r\n\r\n.link-minds {\r\n  @include rowing(null, center);\r\n  padding-bottom: 60px;\r\n\r\n  &:hover {\r\n    > .text-robotics {\r\n      color: $color-salad2;\r\n    }\r\n\r\n    > .arrow-right-green {\r\n      color: $color-purple2;\r\n    }\r\n  }\r\n\r\n  > .text-robotics {\r\n    @include fonts($ginora-sans-semi-bold-font, $extra-mini-font, $color-purple2);\r\n    padding-right: 50px;\r\n  }\r\n\r\n  > .arrow-right-green {\r\n    @include sizes(25px, 12px);\r\n    color: $color-salad2;\r\n  }\r\n}",".jobs-title {\r\n  @include fonts($ginora-sans-bold-font, $semi-mega-font, $primary-title-color, $h1-title-line-height);\r\n  padding: 100px 0 60px;\r\n}\r\n\r\n.wrap-jobs {\r\n  width: 300px;\r\n  margin-inline: auto;\r\n\r\n  > .categories-title {\r\n    @include fonts($main-font, $normal-font, $primary-title-color);\r\n    padding-bottom: 30px;\r\n  }\r\n}\r\n\r\n.item-jobs {\r\n  padding-bottom: 20px;\r\n\r\n  > .link-jobs {\r\n    @include rowing(space-between);\r\n  }\r\n}\r\n\r\n.text-job {\r\n  @include fonts($main-font, $small-font, $color-grey3);\r\n\r\n  &:hover {\r\n    color: $color-purple2;\r\n  }\r\n}\r\n\r\n.active-text-lob {\r\n  color: $color-purple2;\r\n}\r\n\r\n.green-long-right-arrow {\r\n  @include sizes(30px, 20px);\r\n  color: $color-salad2;\r\n}\r\n\r\n.card-jobs {\r\n  @include rowing(null,  null, column);\r\n  padding: 40px 0;\r\n\r\n  > .inscription-jobs {\r\n    @include fonts($main-font, $semi-mini-font, $color-grey3, $inscription-line-height);\r\n    padding-bottom: 10px;\r\n    letter-spacing: 4px;\r\n    opacity: .7;\r\n  }\r\n}\r\n\r\n.link-card-jobs {\r\n  @include rowing(space-between,  center);\r\n\r\n  > .card-title-jobs {\r\n    @include fonts($main-font, $normal-font, $primary-title-color, $h3-title-line-height);\r\n\r\n    &:hover {\r\n      background: linear-gradient(92.73deg, $color-purple2 0%, $color-salad2 100%);\r\n      background-clip: text;\r\n      color: $color-clear;\r\n    }\r\n  }\r\n\r\n  > .active-title-jobs {\r\n    background: linear-gradient(92.73deg, $color-purple2 0%, $color-salad2 100%);\r\n    background-clip: text;\r\n    color: $color-clear;\r\n  }\r\n}\r\n\r\n.desc-jobs {\r\n  @include fonts($gilroy-medium-font, $semi-mini-font, $color-grey3, $position-line-height);\r\n  padding-top: 20px;\r\n  opacity: .7;\r\n}\r\n\r\n.link-jobs-card {\r\n  @include rowing(null, center);\r\n  padding: 60px 0 100px;\r\n\r\n  &:hover {\r\n    > .text-jobs {\r\n      color: $color-salad2;\r\n    }\r\n\r\n    > .arrow-right-green {\r\n      color: $color-purple2;\r\n    }\r\n  }\r\n\r\n  > .text-jobs {\r\n    @include fonts($ginora-sans-semi-bold-font, $extra-mini-font, $color-purple2);\r\n    padding-right: 10px;\r\n  }\r\n\r\n  > .arrow-right-green {\r\n    @include sizes(25px, 12px);\r\n    color: $color-salad2;\r\n  }\r\n}",".title-resources {\r\n  @include fonts($main-font, $semi-large-font, $primary-title-color, $h2-title-line-height);\r\n  padding: 20px 0  60px;\r\n}\r\n\r\n.cards-resources {\r\n  padding: 0 20px;\r\n}\r\n\r\n.date {\r\n  @include fonts($secondary-font, $semi-mini-font, $secondary-title-color, $position-line-height);\r\n  display: inline-block;\r\n  padding: 30px 0 10px;\r\n}\r\n\r\n.title-card-resources {\r\n  @include fonts($main-font, $normal-font, $secondary-title-color, $h3-title-line-height);\r\n  padding-bottom: 60px;\r\n\r\n  &:hover {\r\n    background: linear-gradient(96.97deg, $color-purple2 20.47%, $color-salad2 100%);\r\n    background-clip: text;\r\n    -webkit-text-fill-color: $color-clear\r\n  }\r\n}\r\n\r\n.active-card-resources {\r\n  background: linear-gradient(96.97deg, $color-purple2 20.47%, $color-salad2 100%);\r\n  background-clip: text;\r\n  -webkit-text-fill-color: $color-clear\r\n}\r\n\r\n.swiper-nav {\r\n  @include rowing(end);\r\n  padding-bottom: 60px;\r\n}\r\n\r\n.box-btn-right {\r\n  @include sizes(62px, 8px);\r\n  display: inline-flex;\r\n  color: $color-grey2;\r\n  background: linear-gradient(to right, $color-purple2, $color-salad2);\r\n\r\n  > .arrow-btn-right {\r\n    @include sizes(100%, 100%);\r\n  }\r\n}\r\n\r\n.box-btn-left {\r\n  @include sizes(31px, 8px);\r\n  display: inline-flex;\r\n  margin-right: 21px;\r\n  color: $color-grey2;\r\n  background: linear-gradient(to left, $color-purple2, $color-salad2);\r\n}\r\n\r\n.arrow-btn-left {\r\n  @include sizes(100%, 100%);\r\n}\r\n\r\n.swiper-button-disabled.box-btn-right {\r\n  background: linear-gradient(to right, rgba(92, 228, 207, 0.15), rgba(153, 169, 255, 0.4));\r\n}\r\n\r\n.swiper-button-disabled.box-btn-left {\r\n  background: linear-gradient(to left, rgba(92, 228, 207, 0.15), rgba(153, 169, 255, 0.4));\r\n}\r\n\r\n\r\n\r\n.link-resources {\r\n  @include rowing(null, center);\r\n  padding: 20px 0 100px;\r\n\r\n  &:hover {\r\n    > .text-resources {\r\n      color: $color-salad2;\r\n    }\r\n\r\n    > .arrow-right-green {\r\n      color: $color-purple2;\r\n    }\r\n  }\r\n\r\n  .text-resources {\r\n    @include fonts($ginora-sans-semi-bold-font, $extra-mini-font, $color-purple2);\r\n    padding-right: 10px;\r\n  }\r\n\r\n  > .arrow-right-green {\r\n    @include sizes(25px, 12px);\r\n    color: $color-salad2;\r\n  }\r\n}",".title-reg {\r\n  @include sizes(330px);\r\n  @include fonts($main-font, $semi-large-font, $primary-title-color, $h2-title-line-height);\r\n  background: conic-gradient(from 180deg at 50% 50%, $secondary-color -160.13deg, $primary-color 42.37deg, $secondary-color 199.87deg, $primary-color 402.37deg);\r\n  background-clip: text;\r\n  -webkit-text-fill-color: $color-clear;\r\n}\r\n\r\n.desc-reg {\r\n  @include fonts($secondary-font, $extra-mini-font, $secondary-title-color, $item-divers-line-height);\r\n  padding: 20px 0 60px;\r\n}\r\n\r\n.group-message {\r\n  @include rowing(null, null, column);\r\n}\r\n\r\n.group-name,\r\n.group-email {\r\n  @include rowing(null,  null, column);\r\n  position: relative;\r\n\r\n  &::before {\r\n    @include sizes(80px, 3px);\r\n    content: \"\";\r\n    display: block;\r\n    position: absolute;\r\n    top: 38px;\r\n    left: 10px;\r\n    background: linear-gradient(90deg, $color-purple2 0%, $color-salad2 100%);\r\n  }\r\n}\r\n\r\n.label-name,\r\n.label-email,\r\n.text-message {\r\n  @include fonts($secondary-font, $mini-font, $color-grey3, $position-line-height);\r\n  padding-left: 10px;\r\n}\r\n\r\n.name-text,\r\n.email-text {\r\n  height: 24px;\r\n}\r\n\r\n.name-text,\r\n.email-text,\r\n.textarea {\r\n  margin-bottom: 40px;\r\n  padding: 0 10px;\r\n  border: 1px solid $color-grey2;\r\n  border-bottom-color: $color-grey4;\r\n  background-color: $color-grey2;\r\n  color: $color-grey3;\r\n}\r\n\r\n.input-sizer {\r\n  display: inline-grid;\r\n  vertical-align: top;\r\n  align-items: center;\r\n  position: relative;\r\n\r\n}\r\n.input-sizer.stacked {\r\n  align-items: stretch;\r\n}\r\n.input-sizer.stacked::after,\r\n.input-sizer.stacked input,\r\n.input-sizer.stacked .textarea {\r\n  grid-area: 2/1;\r\n}\r\n.input-sizer::after,\r\n.input-sizer input,\r\n.input-sizer .textarea {\r\n  @include sizes(auto);\r\n  min-width: 1em;\r\n  grid-area: 1/2;\r\n  font: inherit;\r\n  margin: 0;\r\n  resize: none;\r\n  background: none;\r\n  appearance: none;\r\n}\r\n.input-sizer .textarea {\r\n  min-height: 20px;\r\n}\r\n\r\n.input-sizer::after {\r\n  content: attr(data-value) \" \";\r\n  visibility: hidden;\r\n  white-space: pre-wrap;\r\n}\r\n\r\n.bottom-line {\r\n  @include sizes(80px, 3px);\r\n  position: relative;\r\n  left: 10px;\r\n  bottom: 2px;\r\n  margin-bottom: 40px;\r\n  background: linear-gradient(90deg, $color-purple2 0%, $color-salad2 100%);\r\n}\r\n\r\n.reg-btn {\r\n  @include rowing(null, center);\r\n  padding: 20px 0 80px;\r\n  border: none;\r\n  background-color: $color-clear;\r\n\r\n  > .reg-text-btn {\r\n    @include fonts($ginora-sans-semi-bold-font, $extra-mini-font, $color-purple2);\r\n  }\r\n\r\n  > .arrow-right-green {\r\n    @include sizes(25px, 12px);\r\n    margin-left: 30px;\r\n    color: $color-salad2;\r\n  }\r\n\r\n  &:hover {\r\n    > .reg-text-btn {\r\n      color: $color-salad2;\r\n    }\r\n\r\n    > .arrow-right-green {\r\n      color: $color-purple2;\r\n    }\r\n  }\r\n}\r\n",".networks-list {\r\n  @include rowing(center);\r\n  flex-wrap: wrap;\r\n  padding-bottom: 40px;\r\n}\r\n\r\n.item-networks {\r\n  padding: 0 10px 20px;\r\n\r\n  > .network-link {\r\n    @include fonts($main-font, $semi-mini-font, $color-grey3, $inscription-line-height);\r\n\r\n    &:hover {\r\n      color: $color-purple2;\r\n    }\r\n  }\r\n\r\n  > .active-network-link {\r\n    color: $color-purple2;\r\n  }\r\n}\r\n\r\n.basement {\r\n  @include rowing(center, center);\r\n\r\n  > .auth-protection {\r\n    padding: 30px 0 35px;\r\n    color: $color-grey3;\r\n  }\r\n\r\n  > .company-protection {\r\n    margin: 0 0 2px 4px;\r\n    padding-bottom: 2px;\r\n    border: {\r\n      bottom: 2px solid $color-purple2;\r\n      bottom-width: 1.5px;\r\n    }\r\n    color: $color-purple2;\r\n  }\r\n\r\n  > .auth-protection,\r\n  > .company-protection {\r\n    @include fonts($main-font, $extra-mini-font, null, $position-line-height);\r\n  }\r\n}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/getUrl.js":
/*!********************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/getUrl.js ***!
  \********************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (url, options) {
  if (!options) {
    options = {};
  }
  if (!url) {
    return url;
  }
  url = String(url.__esModule ? url.default : url);

  // If url is already wrapped in quotes, remove them
  if (/^['"].*['"]$/.test(url)) {
    url = url.slice(1, -1);
  }
  if (options.hash) {
    url += options.hash;
  }

  // Should url be wrapped?
  // See https://drafts.csswg.org/css-values-3/#urls
  if (/["'() \t\n]|(%20)/.test(url) || options.needQuotes) {
    return "\"".concat(url.replace(/"/g, '\\"').replace(/\n/g, "\\n"), "\"");
  }
  return url;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];
  if (!cssMapping) {
    return content;
  }
  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    return [content].concat([sourceMapping]).join("\n");
  }
  return [content].join("\n");
};

/***/ }),

/***/ "./node_modules/svg-sprite-loader/runtime/sprite.build.js":
/*!****************************************************************!*\
  !*** ./node_modules/svg-sprite-loader/runtime/sprite.build.js ***!
  \****************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

(function (global, factory) {
	 true ? module.exports = factory() :
	0;
}(this, (function () { 'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof __webpack_require__.g !== 'undefined' ? __webpack_require__.g : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var deepmerge$1 = createCommonjsModule(function (module, exports) {
(function (root, factory) {
    if (false) {} else {
        module.exports = factory();
    }
}(commonjsGlobal, function () {

function isMergeableObject(val) {
    var nonNullObject = val && typeof val === 'object';

    return nonNullObject
        && Object.prototype.toString.call(val) !== '[object RegExp]'
        && Object.prototype.toString.call(val) !== '[object Date]'
}

function emptyTarget(val) {
    return Array.isArray(val) ? [] : {}
}

function cloneIfNecessary(value, optionsArgument) {
    var clone = optionsArgument && optionsArgument.clone === true;
    return (clone && isMergeableObject(value)) ? deepmerge(emptyTarget(value), value, optionsArgument) : value
}

function defaultArrayMerge(target, source, optionsArgument) {
    var destination = target.slice();
    source.forEach(function(e, i) {
        if (typeof destination[i] === 'undefined') {
            destination[i] = cloneIfNecessary(e, optionsArgument);
        } else if (isMergeableObject(e)) {
            destination[i] = deepmerge(target[i], e, optionsArgument);
        } else if (target.indexOf(e) === -1) {
            destination.push(cloneIfNecessary(e, optionsArgument));
        }
    });
    return destination
}

function mergeObject(target, source, optionsArgument) {
    var destination = {};
    if (isMergeableObject(target)) {
        Object.keys(target).forEach(function (key) {
            destination[key] = cloneIfNecessary(target[key], optionsArgument);
        });
    }
    Object.keys(source).forEach(function (key) {
        if (!isMergeableObject(source[key]) || !target[key]) {
            destination[key] = cloneIfNecessary(source[key], optionsArgument);
        } else {
            destination[key] = deepmerge(target[key], source[key], optionsArgument);
        }
    });
    return destination
}

function deepmerge(target, source, optionsArgument) {
    var array = Array.isArray(source);
    var options = optionsArgument || { arrayMerge: defaultArrayMerge };
    var arrayMerge = options.arrayMerge || defaultArrayMerge;

    if (array) {
        return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : cloneIfNecessary(source, optionsArgument)
    } else {
        return mergeObject(target, source, optionsArgument)
    }
}

deepmerge.all = function deepmergeAll(array, optionsArgument) {
    if (!Array.isArray(array) || array.length < 2) {
        throw new Error('first argument should be an array with at least two elements')
    }

    // we are sure there are at least 2 values, so it is safe to have no initial value
    return array.reduce(function(prev, next) {
        return deepmerge(prev, next, optionsArgument)
    })
};

return deepmerge

}));
});

var namespaces_1 = createCommonjsModule(function (module, exports) {
var namespaces = {
  svg: {
    name: 'xmlns',
    uri: 'http://www.w3.org/2000/svg'
  },
  xlink: {
    name: 'xmlns:xlink',
    uri: 'http://www.w3.org/1999/xlink'
  }
};

exports.default = namespaces;
module.exports = exports.default;
});

/**
 * @param {Object} attrs
 * @return {string}
 */
var objectToAttrsString = function (attrs) {
  return Object.keys(attrs).map(function (attr) {
    var value = attrs[attr].toString().replace(/"/g, '&quot;');
    return (attr + "=\"" + value + "\"");
  }).join(' ');
};

var svg = namespaces_1.svg;
var xlink = namespaces_1.xlink;

var defaultAttrs = {};
defaultAttrs[svg.name] = svg.uri;
defaultAttrs[xlink.name] = xlink.uri;

/**
 * @param {string} [content]
 * @param {Object} [attributes]
 * @return {string}
 */
var wrapInSvgString = function (content, attributes) {
  if ( content === void 0 ) content = '';

  var attrs = deepmerge$1(defaultAttrs, attributes || {});
  var attrsRendered = objectToAttrsString(attrs);
  return ("<svg " + attrsRendered + ">" + content + "</svg>");
};

var svg$1 = namespaces_1.svg;
var xlink$1 = namespaces_1.xlink;

var defaultConfig = {
  attrs: ( obj = {
    style: ['position: absolute', 'width: 0', 'height: 0'].join('; '),
    'aria-hidden': 'true'
  }, obj[svg$1.name] = svg$1.uri, obj[xlink$1.name] = xlink$1.uri, obj )
};
var obj;

var Sprite = function Sprite(config) {
  this.config = deepmerge$1(defaultConfig, config || {});
  this.symbols = [];
};

/**
 * Add new symbol. If symbol with the same id exists it will be replaced.
 * @param {SpriteSymbol} symbol
 * @return {boolean} `true` - symbol was added, `false` - replaced
 */
Sprite.prototype.add = function add (symbol) {
  var ref = this;
    var symbols = ref.symbols;
  var existing = this.find(symbol.id);

  if (existing) {
    symbols[symbols.indexOf(existing)] = symbol;
    return false;
  }

  symbols.push(symbol);
  return true;
};

/**
 * Remove symbol & destroy it
 * @param {string} id
 * @return {boolean} `true` - symbol was found & successfully destroyed, `false` - otherwise
 */
Sprite.prototype.remove = function remove (id) {
  var ref = this;
    var symbols = ref.symbols;
  var symbol = this.find(id);

  if (symbol) {
    symbols.splice(symbols.indexOf(symbol), 1);
    symbol.destroy();
    return true;
  }

  return false;
};

/**
 * @param {string} id
 * @return {SpriteSymbol|null}
 */
Sprite.prototype.find = function find (id) {
  return this.symbols.filter(function (s) { return s.id === id; })[0] || null;
};

/**
 * @param {string} id
 * @return {boolean}
 */
Sprite.prototype.has = function has (id) {
  return this.find(id) !== null;
};

/**
 * @return {string}
 */
Sprite.prototype.stringify = function stringify () {
  var ref = this.config;
    var attrs = ref.attrs;
  var stringifiedSymbols = this.symbols.map(function (s) { return s.stringify(); }).join('');
  return wrapInSvgString(stringifiedSymbols, attrs);
};

/**
 * @return {string}
 */
Sprite.prototype.toString = function toString () {
  return this.stringify();
};

Sprite.prototype.destroy = function destroy () {
  this.symbols.forEach(function (s) { return s.destroy(); });
};

var sprite = new Sprite({ attrs: { id: '__SVG_SPRITE_NODE__' } });

return sprite;

})));


/***/ }),

/***/ "./fonts/Gilroy/gilroy-light.woff":
/*!****************************************!*\
  !*** ./fonts/Gilroy/gilroy-light.woff ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "9df2f5dbbb9c90a6ede7.woff";

/***/ }),

/***/ "./fonts/Gilroy/gilroy-light.woff2":
/*!*****************************************!*\
  !*** ./fonts/Gilroy/gilroy-light.woff2 ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "87cbc692715c691daa2f.woff2";

/***/ }),

/***/ "./fonts/Gilroy/gilroy-medium.woff":
/*!*****************************************!*\
  !*** ./fonts/Gilroy/gilroy-medium.woff ***!
  \*****************************************/
/***/ ((module) => {

"use strict";
module.exports = "data:font/woff;base64,";

/***/ }),

/***/ "./fonts/Gilroy/gilroy-medium.woff2":
/*!******************************************!*\
  !*** ./fonts/Gilroy/gilroy-medium.woff2 ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "80ccc279b7dc7de16938.woff2";

/***/ }),

/***/ "./fonts/Gilroy/gilroy-regular.woff":
/*!******************************************!*\
  !*** ./fonts/Gilroy/gilroy-regular.woff ***!
  \******************************************/
/***/ ((module) => {

"use strict";
module.exports = "data:font/woff;base64,";

/***/ }),

/***/ "./fonts/Gilroy/gilroy-regular.woff2":
/*!*******************************************!*\
  !*** ./fonts/Gilroy/gilroy-regular.woff2 ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "00b026798f05ff9d7752.woff2";

/***/ }),

/***/ "./fonts/GinoraSans/ginorasans-bold.woff":
/*!***********************************************!*\
  !*** ./fonts/GinoraSans/ginorasans-bold.woff ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "eeccb5f4ed5160d41c97.woff";

/***/ }),

/***/ "./fonts/GinoraSans/ginorasans-bold.woff2":
/*!************************************************!*\
  !*** ./fonts/GinoraSans/ginorasans-bold.woff2 ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "be422214f5a1da04253d.woff2";

/***/ }),

/***/ "./fonts/GinoraSans/ginorasans-light.woff":
/*!************************************************!*\
  !*** ./fonts/GinoraSans/ginorasans-light.woff ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "9b5129e7acc47160cd68.woff";

/***/ }),

/***/ "./fonts/GinoraSans/ginorasans-light.woff2":
/*!*************************************************!*\
  !*** ./fonts/GinoraSans/ginorasans-light.woff2 ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "48d8b18623cd17666c6b.woff2";

/***/ }),

/***/ "./fonts/GinoraSans/ginorasans-regular.woff":
/*!**************************************************!*\
  !*** ./fonts/GinoraSans/ginorasans-regular.woff ***!
  \**************************************************/
/***/ ((module) => {

"use strict";
module.exports = "data:font/woff;base64,";

/***/ }),

/***/ "./fonts/GinoraSans/ginorasans-regular.woff2":
/*!***************************************************!*\
  !*** ./fonts/GinoraSans/ginorasans-regular.woff2 ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "46db51e61a9937aa5d98.woff2";

/***/ }),

/***/ "./fonts/GinoraSans/ginorasans-semi-bold.woff":
/*!****************************************************!*\
  !*** ./fonts/GinoraSans/ginorasans-semi-bold.woff ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "2dbd1b81e0cff896635a.woff";

/***/ }),

/***/ "./fonts/GinoraSans/ginorasans-semi-bold.woff2":
/*!*****************************************************!*\
  !*** ./fonts/GinoraSans/ginorasans-semi-bold.woff2 ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "97f89a8e2bee9f78f113.woff2";

/***/ }),

/***/ "./images/min/hero.png":
/*!*****************************!*\
  !*** ./images/min/hero.png ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "6186ebe5eea13c95e23f.png";

/***/ }),

/***/ "./icons/cypher.svg":
/*!**************************!*\
  !*** ./icons/cypher.svg ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml;base64,ZXhwb3J0IGRlZmF1bHQgewogICAgICBpZDogInN2Zy1pY29uLWN5cGhlci11c2FnZSIsCiAgICAgIHZpZXdCb3g6ICIwIDAgMjEgMjEiLAogICAgICB1cmw6ICIuL2ljb25zLyIgKyAiL2hvbWUvYW5kcmV3L9CU0L7QutGD0LzQtdC90YLRiy9Bcmllcy9pY29ucy9jeXBoZXIuc3ZnIiwKICAgICAgdG9TdHJpbmc6IGZ1bmN0aW9uICgpIHsKICAgICAgICByZXR1cm4gdGhpcy51cmw7CiAgICAgIH0KICAgIH0=";

/***/ }),

/***/ "./icons/logo.svg":
/*!************************!*\
  !*** ./icons/logo.svg ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml;base64,ZXhwb3J0IGRlZmF1bHQgewogICAgICBpZDogInN2Zy1pY29uLWxvZ28tdXNhZ2UiLAogICAgICB2aWV3Qm94OiAiMCAwIDg1IDI1IiwKICAgICAgdXJsOiAiLi9pY29ucy8iICsgIi9ob21lL2FuZHJldy/QlNC+0LrRg9C80LXQvdGC0YsvQXJpZXMvaWNvbnMvbG9nby5zdmciLAogICAgICB0b1N0cmluZzogZnVuY3Rpb24gKCkgewogICAgICAgIHJldHVybiB0aGlzLnVybDsKICAgICAgfQogICAgfQ==";

/***/ }),

/***/ "./svg-sprite.svg":
/*!************************!*\
  !*** ./svg-sprite.svg ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml;base64,ZXhwb3J0IGRlZmF1bHQgewogICAgICBpZDogInN2Zy1pY29uLXN2Zy1zcHJpdGUtdXNhZ2UiLAogICAgICB2aWV3Qm94OiB1bmRlZmluZWQsCiAgICAgIHVybDogIi4vaWNvbnMvIiArICIvaG9tZS9hbmRyZXcv0JTQvtC60YPQvNC10L3RgtGLL0FyaWVzL3N2Zy1zcHJpdGUuc3ZnIiwKICAgICAgdG9TdHJpbmc6IGZ1bmN0aW9uICgpIHsKICAgICAgICByZXR1cm4gdGhpcy51cmw7CiAgICAgIH0KICAgIH0=";

/***/ }),

/***/ "./script.js":
/*!*******************!*\
  !*** ./script.js ***!
  \*******************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function scriptInit() {
    let swiper = new Swiper(".mySwiper", {
        slidesPerView: 1,
        spaceBetween: 40,
        navigation: {
            nextEl: ".box-btn-right",
            prevEl: ".box-btn-left"
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            768: {
                slidesPerView: 4,
                spaceBetween: 40,
            },
            1024: {
                slidesPerView: 5,
                spaceBetween: 50,
            },
        },
    });
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (scriptInit);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = document.baseURI || self.location.href;
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// no jsonp function
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!******************!*\
  !*** ./index.js ***!
  \******************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _script_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./script.js */ "./script.js");
/* harmony import */ var _style_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./style.scss */ "./style.scss");
/* harmony import */ var _icons_cypher_svg__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./icons/cypher.svg */ "./icons/cypher.svg");
/* harmony import */ var _icons_logo_svg__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./icons/logo.svg */ "./icons/logo.svg");
/* harmony import */ var svg_sprite_loader_runtime_sprite_build_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! svg-sprite-loader/runtime/sprite.build.js */ "./node_modules/svg-sprite-loader/runtime/sprite.build.js");
/* harmony import */ var _svg_sprite_svg__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./svg-sprite.svg */ "./svg-sprite.svg");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var _images_min_hero_png__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./images/min/hero.png */ "./images/min/hero.png");
// DEMO JOKE APP




/*import './icons/cypher.svg';*/
// Import sprite instance which already contains twitter logo required above




/*sprite.add(logo);*/
/*import laughing from './assets/laughing.svg'*/

const testImg = document.getElementById('test');
testImg.src = _images_min_hero_png__WEBPACK_IMPORTED_MODULE_7__;

/*scriptInit();*/

function generateJoke() {
    const config = {
        headers: {
           /* Accept: 'application/json',*/
        },
    }

    axios__WEBPACK_IMPORTED_MODULE_6__.get('/svg-sprite.svg', config).then((res) => {
        const svgSpriteElem = document.getElementById('main-svg-sprite');
        svgSpriteElem.innerHTML = res.data;
    })
}

generateJoke();

/*
export default generateJoke
*/




// Render sprite
/*
const spriteContent = sprite.stringify();
const svgSprite = `${spriteContent}`;
console.log(sprite);
const svgSpriteElem = document.getElementById('main-svg-sprite');
svgSpriteElem.innerHTML = svgSprite;*/

})();

/******/ })()
;
//# sourceMappingURL=main.js.map