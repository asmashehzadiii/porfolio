var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@netlify/runtime-utils/dist/main.js
var getString, base64Decode, base64Encode, getEnvironment;
var init_main = __esm({
  "node_modules/@netlify/runtime-utils/dist/main.js"() {
    getString = (input) => typeof input === "string" ? input : JSON.stringify(input);
    base64Decode = globalThis.Buffer ? (input) => Buffer.from(input, "base64").toString() : (input) => atob(input);
    base64Encode = globalThis.Buffer ? (input) => Buffer.from(getString(input)).toString("base64") : (input) => btoa(getString(input));
    getEnvironment = () => {
      const { Deno, Netlify, process: process2 } = globalThis;
      return Netlify?.env ?? Deno?.env ?? {
        delete: (key) => delete process2?.env[key],
        get: (key) => process2?.env[key],
        has: (key) => Boolean(process2?.env[key]),
        set: (key, value) => {
          if (process2?.env) {
            process2.env[key] = value;
          }
        },
        toObject: () => process2?.env ?? {}
      };
    };
  }
});

// node_modules/@netlify/otel/dist/main.js
function withActiveSpan(tracer, name, optionsOrFn, contextOrFn, fn) {
  const func = typeof contextOrFn === "function" ? contextOrFn : typeof optionsOrFn === "function" ? optionsOrFn : fn;
  if (!func) {
    throw new Error("function to execute with active span is missing");
  }
  if (!tracer) {
    return func();
  }
  return tracer.withActiveSpan(name, optionsOrFn, contextOrFn, func);
}
var GET_TRACER, getTracer;
var init_main2 = __esm({
  "node_modules/@netlify/otel/dist/main.js"() {
    GET_TRACER = "__netlify__getTracer";
    getTracer = (name, version) => {
      return globalThis[GET_TRACER]?.(name, version);
    };
  }
});

// node_modules/@netlify/blobs/dist/chunk-SQCJ2S3G.js
function withSpan(span, name, fn) {
  if (span) return fn(span);
  return withActiveSpan(getTracer(), name, (span2) => {
    return fn(span2);
  });
}
var getEnvironmentContext, setEnvironmentContext, MissingBlobsEnvironmentError, BASE64_PREFIX, METADATA_HEADER_INTERNAL, METADATA_HEADER_EXTERNAL, METADATA_MAX_SIZE, encodeMetadata, decodeMetadata, getMetadataFromResponse, NF_ERROR, NF_REQUEST_ID, DEPLOY_STORE_PREFIX, SITE_STORE_PREFIX, isDeniedWrite, blobsErrorMessage, BlobsInternalError, createBlobsInternalError, discardBody, collectIterator, BlobsConsistencyError, REGION_AUTO, regions, isValidRegion, InvalidBlobsRegionError, DEFAULT_RETRY_DELAY, MIN_RETRY_DELAY, MAX_RETRY, RATE_LIMIT_HEADER, fetchAndRetry, getDelay, sleep, SIGNED_URL_ACCEPT_HEADER, Client, getClientOptions;
var init_chunk_SQCJ2S3G = __esm({
  "node_modules/@netlify/blobs/dist/chunk-SQCJ2S3G.js"() {
    init_main();
    init_main();
    init_main2();
    init_main();
    getEnvironmentContext = () => {
      const context = globalThis.netlifyBlobsContext || getEnvironment().get("NETLIFY_BLOBS_CONTEXT");
      if (typeof context !== "string" || !context) {
        return {};
      }
      const data = base64Decode(context);
      try {
        return JSON.parse(data);
      } catch {
      }
      return {};
    };
    setEnvironmentContext = (context) => {
      const encodedContext = base64Encode(JSON.stringify(context));
      getEnvironment().set("NETLIFY_BLOBS_CONTEXT", encodedContext);
    };
    MissingBlobsEnvironmentError = class extends Error {
      constructor(requiredProperties) {
        super(
          `The environment has not been configured to use Netlify Blobs. To use it manually, supply the following properties when creating a store: ${requiredProperties.join(
            ", "
          )}`
        );
        this.name = "MissingBlobsEnvironmentError";
      }
    };
    BASE64_PREFIX = "b64;";
    METADATA_HEADER_INTERNAL = "x-amz-meta-user";
    METADATA_HEADER_EXTERNAL = "netlify-blobs-metadata";
    METADATA_MAX_SIZE = 2 * 1024;
    encodeMetadata = (metadata) => {
      if (!metadata) {
        return null;
      }
      const encodedObject = base64Encode(JSON.stringify(metadata));
      const payload = `b64;${encodedObject}`;
      if (METADATA_HEADER_EXTERNAL.length + payload.length > METADATA_MAX_SIZE) {
        throw new Error("Metadata object exceeds the maximum size");
      }
      return payload;
    };
    decodeMetadata = (header) => {
      if (!header?.startsWith(BASE64_PREFIX)) {
        return {};
      }
      const encodedData = header.slice(BASE64_PREFIX.length);
      const decodedData = base64Decode(encodedData);
      const metadata = JSON.parse(decodedData);
      return metadata;
    };
    getMetadataFromResponse = (response) => {
      if (!response.headers) {
        return {};
      }
      const value = response.headers.get(METADATA_HEADER_EXTERNAL) || response.headers.get(METADATA_HEADER_INTERNAL);
      try {
        return decodeMetadata(value);
      } catch {
        throw new Error(
          "An internal error occurred while trying to retrieve the metadata for an entry. Please try updating to the latest version of the Netlify Blobs client."
        );
      }
    };
    NF_ERROR = "x-nf-error";
    NF_REQUEST_ID = "x-nf-request-id";
    DEPLOY_STORE_PREFIX = "deploy:";
    SITE_STORE_PREFIX = "site:";
    isDeniedWrite = (res, { method, storeName }) => (res.status === 401 || res.status === 403) && (method === "put" || method === "delete") && storeName !== void 0 && !storeName.startsWith(DEPLOY_STORE_PREFIX);
    blobsErrorMessage = (res, context, responseBody) => {
      let details = res.headers.get(NF_ERROR) || `${res.status} status code`;
      if (res.headers.has(NF_REQUEST_ID)) {
        details += `, ID: ${res.headers.get(NF_REQUEST_ID)}`;
      }
      if (isDeniedWrite(res, context)) {
        const storeName = context.storeName?.startsWith(SITE_STORE_PREFIX) ? context.storeName.slice(SITE_STORE_PREFIX.length) : context.storeName;
        const summary = `Netlify Blobs could not write to store '${storeName}' (${details}).`;
        if (context.edgeAccess) {
          return summary;
        }
        return `${summary} Builds and build plugins can only write to deploy-specific stores: use 'getDeployStore' instead of 'getStore', or pass a 'token' with write access to the store. If this code is not running in a build, check that the token and site ID are valid. See https://docs.netlify.com/build/data-and-storage/netlify-blobs/#deploy-specific-stores`;
      }
      let message = `Netlify Blobs has generated an internal error (${details})`;
      if (!res.headers.get(NF_ERROR) && responseBody) {
        message += `: ${responseBody}`;
      }
      return message;
    };
    BlobsInternalError = class extends Error {
      constructor(res, context = {}, responseBody) {
        super(blobsErrorMessage(res, context, responseBody));
        this.name = "BlobsInternalError";
        this.status = res.status;
        this.responseBody = responseBody;
      }
    };
    createBlobsInternalError = async (res, context = {}) => {
      const responseBody = await res.clone().text().catch(() => void 0);
      return new BlobsInternalError(res, context, responseBody);
    };
    discardBody = async (res) => {
      await res.body?.cancel().catch(() => {
      });
    };
    collectIterator = async (iterator) => {
      const result = [];
      for await (const item of iterator) {
        result.push(item);
      }
      return result;
    };
    BlobsConsistencyError = class extends Error {
      constructor() {
        super(
          `Netlify Blobs has failed to perform a read using strong consistency because the environment has not been configured with a 'uncachedEdgeURL' property`
        );
        this.name = "BlobsConsistencyError";
      }
    };
    REGION_AUTO = "auto";
    regions = {
      "us-east-1": true,
      "us-east-2": true,
      "eu-central-1": true,
      "ap-southeast-1": true,
      "ap-southeast-2": true
    };
    isValidRegion = (input) => Object.keys(regions).includes(input);
    InvalidBlobsRegionError = class extends Error {
      constructor(region) {
        super(
          `${region} is not a supported Netlify Blobs region. Supported values are: ${Object.keys(regions).join(", ")}.`
        );
        this.name = "InvalidBlobsRegionError";
      }
    };
    DEFAULT_RETRY_DELAY = getEnvironment().get("NODE_ENV") === "test" ? 1 : 5e3;
    MIN_RETRY_DELAY = 1e3;
    MAX_RETRY = 5;
    RATE_LIMIT_HEADER = "X-RateLimit-Reset";
    fetchAndRetry = async (fetch2, url, options, attemptsLeft = MAX_RETRY, getRetryUrl) => {
      try {
        const res = await fetch2(url, options);
        const isRetryable = res.status === 429 || res.status >= 500 || getRetryUrl !== void 0 && res.status === 403;
        if (attemptsLeft > 0 && isRetryable) {
          await discardBody(res);
          const delay = getDelay(res.headers.get(RATE_LIMIT_HEADER));
          await sleep(delay);
          const retryUrl = getRetryUrl ? await getRetryUrl() : url;
          return fetchAndRetry(fetch2, retryUrl, options, attemptsLeft - 1, getRetryUrl);
        }
        return res;
      } catch (error) {
        if (attemptsLeft === 0) {
          throw error;
        }
        const delay = getDelay();
        await sleep(delay);
        const retryUrl = getRetryUrl ? await getRetryUrl() : url;
        return fetchAndRetry(fetch2, retryUrl, options, attemptsLeft - 1, getRetryUrl);
      }
    };
    getDelay = (rateLimitReset) => {
      if (!rateLimitReset) {
        return DEFAULT_RETRY_DELAY;
      }
      return Math.max(Number(rateLimitReset) * 1e3 - Date.now(), MIN_RETRY_DELAY);
    };
    sleep = (ms) => new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
    SIGNED_URL_ACCEPT_HEADER = "application/json;type=signed-url";
    Client = class {
      /**
       * Whether requests reach Blobs through the edge rather than the API. Only
       * runtime environments are given an edge URL.
       */
      get edgeAccess() {
        return this.edgeURL !== void 0;
      }
      constructor({ apiURL, consistency, edgeURL, fetch: fetch2, region, siteID, token, uncachedEdgeURL }) {
        this.apiURL = apiURL;
        this.consistency = consistency ?? "eventual";
        this.edgeURL = edgeURL;
        this.fetch = fetch2 ?? globalThis.fetch;
        this.region = region;
        this.siteID = siteID;
        this.token = token;
        this.uncachedEdgeURL = uncachedEdgeURL;
        if (!this.fetch) {
          throw new Error(
            "Netlify Blobs could not find a `fetch` client in the global scope. You can either update your runtime to a version that includes `fetch` (like Node.js 18.0.0 or above), or you can supply your own implementation using the `fetch` property."
          );
        }
      }
      async getFinalRequest({
        consistency: opConsistency,
        key,
        metadata,
        method,
        parameters = {},
        storeName
      }) {
        const encodedMetadata = encodeMetadata(metadata);
        const consistency = opConsistency ?? this.consistency;
        let urlPath = `/${this.siteID}`;
        if (storeName) {
          urlPath += `/${storeName}`;
        }
        if (key) {
          urlPath += `/${key}`;
        }
        if (this.edgeURL) {
          if (consistency === "strong" && !this.uncachedEdgeURL) {
            throw new BlobsConsistencyError();
          }
          const headers = {
            authorization: `Bearer ${this.token}`
          };
          if (encodedMetadata) {
            headers[METADATA_HEADER_INTERNAL] = encodedMetadata;
          }
          if (this.region) {
            urlPath = `/region:${this.region}${urlPath}`;
          }
          const url2 = new URL(urlPath, consistency === "strong" ? this.uncachedEdgeURL : this.edgeURL);
          for (const key2 in parameters) {
            url2.searchParams.set(key2, parameters[key2]);
          }
          return {
            headers,
            url: url2.toString()
          };
        }
        const apiHeaders = { authorization: `Bearer ${this.token}` };
        const url = new URL(`/api/v1/blobs${urlPath}`, this.apiURL ?? "https://api.netlify.com");
        for (const key2 in parameters) {
          url.searchParams.set(key2, parameters[key2]);
        }
        if (this.region) {
          url.searchParams.set("region", this.region);
        }
        if (storeName === void 0 || key === void 0) {
          return {
            headers: apiHeaders,
            url: url.toString()
          };
        }
        if (encodedMetadata) {
          apiHeaders[METADATA_HEADER_EXTERNAL] = encodedMetadata;
        }
        if (method === "head" || method === "delete") {
          return {
            headers: apiHeaders,
            url: url.toString()
          };
        }
        const res = await this.fetch(url.toString(), {
          headers: { ...apiHeaders, accept: SIGNED_URL_ACCEPT_HEADER },
          method
        });
        if (res.status !== 200) {
          throw await createBlobsInternalError(res, { edgeAccess: this.edgeAccess, method, storeName });
        }
        const { url: signedURL } = await res.json();
        const userHeaders = encodedMetadata ? { [METADATA_HEADER_INTERNAL]: encodedMetadata } : void 0;
        return {
          headers: userHeaders,
          url: signedURL
        };
      }
      async makeRequest({
        body,
        conditions = {},
        consistency,
        headers: extraHeaders,
        key,
        metadata,
        method,
        parameters,
        storeName
      }) {
        const { headers: baseHeaders = {}, url } = await this.getFinalRequest({
          consistency,
          key,
          metadata,
          method,
          parameters,
          storeName
        });
        const headers = {
          ...baseHeaders,
          ...extraHeaders
        };
        if (method === "put") {
          headers["cache-control"] = "max-age=0, stale-while-revalidate=60";
        }
        if ("onlyIfMatch" in conditions && conditions.onlyIfMatch) {
          headers["if-match"] = conditions.onlyIfMatch;
        } else if ("onlyIfNew" in conditions && conditions.onlyIfNew) {
          headers["if-none-match"] = "*";
        }
        const options = {
          body,
          headers,
          method
        };
        if (body instanceof ReadableStream) {
          options.duplex = "half";
        }
        const usesSignedUrl = !this.edgeURL && key !== void 0 && storeName !== void 0 && method !== "head" && method !== "delete";
        let getRetryUrl;
        if (usesSignedUrl) {
          getRetryUrl = async () => {
            const finalRequest = await this.getFinalRequest({ consistency, key, metadata, method, parameters, storeName });
            return finalRequest.url;
          };
        }
        return fetchAndRetry(this.fetch, url, options, void 0, getRetryUrl);
      }
    };
    getClientOptions = (options, contextOverride) => {
      const context = contextOverride ?? getEnvironmentContext();
      const siteID = context.siteID ?? options.siteID;
      const token = context.token ?? options.token;
      if (!siteID || !token) {
        throw new MissingBlobsEnvironmentError(["siteID", "token"]);
      }
      if (options.region !== void 0 && !isValidRegion(options.region)) {
        throw new InvalidBlobsRegionError(options.region);
      }
      const clientOptions = {
        apiURL: context.apiURL ?? options.apiURL,
        consistency: options.consistency,
        edgeURL: context.edgeURL ?? options.edgeURL,
        fetch: options.fetch,
        region: options.region,
        siteID,
        token,
        uncachedEdgeURL: context.uncachedEdgeURL ?? options.uncachedEdgeURL
      };
      return clientOptions;
    };
  }
});

// node_modules/@netlify/blobs/dist/main.js
var main_exports = {};
__export(main_exports, {
  connectLambda: () => connectLambda,
  getDeployStore: () => getDeployStore,
  getStore: () => getStore,
  listStores: () => listStores,
  setEnvironmentContext: () => setEnvironmentContext
});
function listStores(options = {}) {
  const context = getEnvironmentContext();
  const clientOptions = getClientOptions(options, context);
  const client = new Client(clientOptions);
  const iterator = getListIterator(client, SITE_STORE_PREFIX);
  if (options.paginate) {
    return iterator;
  }
  return collectIterator(iterator).then((results) => ({ stores: results.flatMap((page) => page.stores) }));
}
var connectLambda, LEGACY_STORE_INTERNAL_PREFIX, STATUS_OK, STATUS_PRE_CONDITION_FAILED, Store, getDeployStoreRegion, getDeployStore, getStore, formatListStoreResponse, getListIterator;
var init_main3 = __esm({
  "node_modules/@netlify/blobs/dist/main.js"() {
    init_chunk_SQCJ2S3G();
    init_main();
    connectLambda = (event) => {
      const rawData = base64Decode(event.blobs);
      const data = JSON.parse(rawData);
      const environmentContext = {
        deployID: event.headers["x-nf-deploy-id"],
        edgeURL: data.url,
        siteID: event.headers["x-nf-site-id"],
        token: data.token
      };
      setEnvironmentContext(environmentContext);
    };
    LEGACY_STORE_INTERNAL_PREFIX = "netlify-internal/legacy-namespace/";
    STATUS_OK = 200;
    STATUS_PRE_CONDITION_FAILED = 412;
    Store = class _Store {
      constructor(options) {
        this.client = options.client;
        if ("deployID" in options) {
          _Store.validateDeployID(options.deployID);
          let name = DEPLOY_STORE_PREFIX + options.deployID;
          if (options.name) {
            name += `:${options.name}`;
          }
          this.name = name;
        } else if (options.name.startsWith(LEGACY_STORE_INTERNAL_PREFIX)) {
          const storeName = options.name.slice(LEGACY_STORE_INTERNAL_PREFIX.length);
          _Store.validateStoreName(storeName);
          this.name = storeName;
        } else {
          _Store.validateStoreName(options.name);
          this.name = SITE_STORE_PREFIX + options.name;
        }
      }
      async delete(key) {
        const res = await this.client.makeRequest({ key, method: "delete", storeName: this.name });
        await discardBody(res);
        if (![200, 204, 404].includes(res.status)) {
          throw new BlobsInternalError(res, {
            edgeAccess: this.client.edgeAccess,
            method: "delete",
            storeName: this.name
          });
        }
      }
      async deleteAll() {
        let totalDeletedBlobs = 0;
        let hasMore = true;
        while (hasMore) {
          const res = await this.client.makeRequest({ method: "delete", storeName: this.name });
          if (res.status !== 200) {
            await discardBody(res);
            throw new BlobsInternalError(res, {
              edgeAccess: this.client.edgeAccess,
              method: "delete",
              storeName: this.name
            });
          }
          const data = await res.json();
          if (typeof data.blobs_deleted !== "number") {
            throw new BlobsInternalError(res);
          }
          totalDeletedBlobs += data.blobs_deleted;
          hasMore = typeof data.has_more === "boolean" && data.has_more;
        }
        return {
          deletedBlobs: totalDeletedBlobs
        };
      }
      async get(key, options) {
        return withSpan(options?.span, "blobs.get", async (span) => {
          const { consistency, type } = options ?? {};
          span?.setAttributes({
            "blobs.store": this.name,
            "blobs.key": key,
            "blobs.type": type,
            "blobs.method": "GET",
            "blobs.consistency": consistency
          });
          const res = await this.client.makeRequest({
            consistency,
            key,
            method: "get",
            storeName: this.name
          });
          span?.setAttributes({
            "blobs.response.body.size": res.headers.get("content-length") ?? void 0,
            "blobs.response.status": res.status
          });
          if (res.status === 404) {
            await discardBody(res);
            return null;
          }
          if (res.status !== 200) {
            await discardBody(res);
            throw new BlobsInternalError(res);
          }
          if (type === void 0 || type === "text") {
            return res.text();
          }
          if (type === "arrayBuffer") {
            return res.arrayBuffer();
          }
          if (type === "blob") {
            return res.blob();
          }
          if (type === "json") {
            return res.json();
          }
          if (type === "stream") {
            return res.body;
          }
          await discardBody(res);
          throw new BlobsInternalError(res);
        });
      }
      async getMetadata(key, options = {}) {
        return withSpan(options?.span, "blobs.getMetadata", async (span) => {
          span?.setAttributes({
            "blobs.store": this.name,
            "blobs.key": key,
            "blobs.method": "HEAD",
            "blobs.consistency": options.consistency
          });
          const res = await this.client.makeRequest({
            consistency: options.consistency,
            key,
            method: "head",
            storeName: this.name
          });
          span?.setAttributes({
            "blobs.response.status": res.status
          });
          if (res.status === 404) {
            return null;
          }
          if (res.status !== 200 && res.status !== 304) {
            throw new BlobsInternalError(res);
          }
          const etag = res?.headers.get("etag") ?? void 0;
          const metadata = getMetadataFromResponse(res);
          const result = {
            etag,
            metadata
          };
          return result;
        });
      }
      async getWithMetadata(key, options) {
        return withSpan(options?.span, "blobs.getWithMetadata", async (span) => {
          const { consistency, etag: requestETag, type } = options ?? {};
          const headers = requestETag ? { "if-none-match": requestETag } : void 0;
          span?.setAttributes({
            "blobs.store": this.name,
            "blobs.key": key,
            "blobs.method": "GET",
            "blobs.consistency": options?.consistency,
            "blobs.type": type,
            "blobs.request.etag": requestETag
          });
          const res = await this.client.makeRequest({
            consistency,
            headers,
            key,
            method: "get",
            storeName: this.name
          });
          const responseETag = res?.headers.get("etag") ?? void 0;
          span?.setAttributes({
            "blobs.response.body.size": res.headers.get("content-length") ?? void 0,
            "blobs.response.etag": responseETag,
            "blobs.response.status": res.status
          });
          if (res.status === 404) {
            await discardBody(res);
            return null;
          }
          if (res.status !== 200 && res.status !== 304) {
            await discardBody(res);
            throw new BlobsInternalError(res);
          }
          const metadata = getMetadataFromResponse(res);
          const result = {
            etag: responseETag,
            metadata
          };
          if (res.status === 304 && requestETag) {
            return { data: null, ...result };
          }
          if (type === void 0 || type === "text") {
            return { data: await res.text(), ...result };
          }
          if (type === "arrayBuffer") {
            return { data: await res.arrayBuffer(), ...result };
          }
          if (type === "blob") {
            return { data: await res.blob(), ...result };
          }
          if (type === "json") {
            return { data: await res.json(), ...result };
          }
          if (type === "stream") {
            return { data: res.body, ...result };
          }
          await discardBody(res);
          throw new Error(`Invalid 'type' property: ${type}. Expected: arrayBuffer, blob, json, stream, or text.`);
        });
      }
      list(options = {}) {
        return withSpan(options.span, "blobs.list", (span) => {
          span?.setAttributes({
            "blobs.store": this.name,
            "blobs.method": "GET",
            "blobs.list.paginate": options.paginate ?? false
          });
          const iterator = this.getListIterator(options);
          if (options.paginate) {
            return iterator;
          }
          return collectIterator(iterator).then(
            (items) => items.reduce(
              (acc, item) => ({
                blobs: [...acc.blobs, ...item.blobs],
                directories: [...acc.directories, ...item.directories]
              }),
              { blobs: [], directories: [] }
            )
          );
        });
      }
      async set(key, data, options = {}) {
        return withSpan(options.span, "blobs.set", async (span) => {
          span?.setAttributes({
            "blobs.store": this.name,
            "blobs.key": key,
            "blobs.method": "PUT",
            "blobs.data.size": typeof data == "string" ? data.length : data instanceof Blob ? data.size : data.byteLength,
            "blobs.data.type": typeof data == "string" ? "string" : data instanceof Blob ? "blob" : "arrayBuffer",
            "blobs.atomic": Boolean(options.onlyIfMatch ?? options.onlyIfNew)
          });
          _Store.validateKey(key);
          const conditions = _Store.getConditions(options);
          const res = await this.client.makeRequest({
            conditions,
            body: data,
            key,
            metadata: options.metadata,
            method: "put",
            storeName: this.name
          });
          const etag = res.headers.get("etag") ?? "";
          span?.setAttributes({
            "blobs.response.etag": etag,
            "blobs.response.status": res.status
          });
          if (conditions) {
            await discardBody(res);
            return res.status === STATUS_PRE_CONDITION_FAILED ? { modified: false } : { etag, modified: true };
          }
          if (res.status === STATUS_OK) {
            await discardBody(res);
            return {
              etag,
              modified: true
            };
          }
          throw await createBlobsInternalError(res, {
            edgeAccess: this.client.edgeAccess,
            method: "put",
            storeName: this.name
          });
        });
      }
      async setJSON(key, data, options = {}) {
        return withSpan(options.span, "blobs.setJSON", async (span) => {
          span?.setAttributes({
            "blobs.store": this.name,
            "blobs.key": key,
            "blobs.method": "PUT",
            "blobs.data.type": "json",
            "blobs.atomic": Boolean(options.onlyIfMatch ?? options.onlyIfNew)
          });
          _Store.validateKey(key);
          const conditions = _Store.getConditions(options);
          const payload = JSON.stringify(data);
          const headers = {
            "content-type": "application/json"
          };
          const res = await this.client.makeRequest({
            conditions,
            body: payload,
            headers,
            key,
            metadata: options.metadata,
            method: "put",
            storeName: this.name
          });
          await discardBody(res);
          const etag = res.headers.get("etag") ?? "";
          span?.setAttributes({
            "blobs.response.etag": etag,
            "blobs.response.status": res.status
          });
          if (conditions) {
            return res.status === STATUS_PRE_CONDITION_FAILED ? { modified: false } : { etag, modified: true };
          }
          if (res.status === STATUS_OK) {
            return {
              etag,
              modified: true
            };
          }
          throw new BlobsInternalError(res, {
            edgeAccess: this.client.edgeAccess,
            method: "put",
            storeName: this.name
          });
        });
      }
      static formatListResultBlob(result) {
        if (!result.key) {
          return null;
        }
        return {
          etag: result.etag,
          key: result.key
        };
      }
      static getConditions(options) {
        if ("onlyIfMatch" in options && "onlyIfNew" in options) {
          throw new Error(
            `The 'onlyIfMatch' and 'onlyIfNew' options are mutually exclusive. Using 'onlyIfMatch' will make the write succeed only if there is an entry for the key with the given content, while 'onlyIfNew' will make the write succeed only if there is no entry for the key.`
          );
        }
        if ("onlyIfMatch" in options && options.onlyIfMatch) {
          if (typeof options.onlyIfMatch !== "string") {
            throw new Error(`The 'onlyIfMatch' property expects a string representing an ETag.`);
          }
          return {
            onlyIfMatch: options.onlyIfMatch
          };
        }
        if ("onlyIfNew" in options && options.onlyIfNew) {
          if (typeof options.onlyIfNew !== "boolean") {
            throw new Error(
              `The 'onlyIfNew' property expects a boolean indicating whether the write should fail if an entry for the key already exists.`
            );
          }
          return {
            onlyIfNew: true
          };
        }
      }
      static validateKey(key) {
        if (key === "") {
          throw new Error("Blob key must not be empty.");
        }
        if (key.startsWith("/") || key.startsWith("%2F")) {
          throw new Error("Blob key must not start with forward slash (/).");
        }
        if (new TextEncoder().encode(key).length > 600) {
          throw new Error(
            "Blob key must be a sequence of Unicode characters whose UTF-8 encoding is at most 600 bytes long."
          );
        }
      }
      static validateDeployID(deployID) {
        if (!/^\w{1,24}$/.test(deployID)) {
          throw new Error(`'${deployID}' is not a valid Netlify deploy ID.`);
        }
      }
      static validateStoreName(name) {
        if (name.includes("/") || name.includes("%2F")) {
          throw new Error("Store name must not contain forward slashes (/).");
        }
        if (new TextEncoder().encode(name).length > 64) {
          throw new Error(
            "Store name must be a sequence of Unicode characters whose UTF-8 encoding is at most 64 bytes long."
          );
        }
      }
      getListIterator(options) {
        const { client, name: storeName } = this;
        const parameters = {};
        if (options?.prefix) {
          parameters.prefix = options.prefix;
        }
        if (options?.directories) {
          parameters.directories = "true";
        }
        return {
          [Symbol.asyncIterator]() {
            let currentCursor = null;
            let done = false;
            return {
              async next() {
                return withSpan(options?.span, "blobs.list.next", async (span) => {
                  span?.setAttributes({
                    "blobs.store": storeName,
                    "blobs.method": "GET",
                    "blobs.list.paginate": options?.paginate ?? false,
                    "blobs.list.done": done,
                    "blobs.list.cursor": currentCursor ?? void 0
                  });
                  if (done) {
                    return { done: true, value: void 0 };
                  }
                  const nextParameters = { ...parameters };
                  if (currentCursor !== null) {
                    nextParameters.cursor = currentCursor;
                  }
                  const res = await client.makeRequest({
                    method: "get",
                    parameters: nextParameters,
                    storeName
                  });
                  span?.setAttributes({
                    "blobs.response.status": res.status
                  });
                  let blobs = [];
                  let directories = [];
                  if (![200, 204, 404].includes(res.status)) {
                    await discardBody(res);
                    throw new BlobsInternalError(res);
                  }
                  if (res.status === 404) {
                    await discardBody(res);
                    done = true;
                  } else {
                    const page = await res.json();
                    if (page.next_cursor) {
                      currentCursor = page.next_cursor;
                    } else {
                      done = true;
                    }
                    blobs = (page.blobs ?? []).map(_Store.formatListResultBlob).filter(Boolean);
                    directories = page.directories ?? [];
                  }
                  return {
                    done: false,
                    value: {
                      blobs,
                      directories
                    }
                  };
                });
              }
            };
          }
        };
      }
    };
    getDeployStoreRegion = (clientOptions, context) => {
      if (clientOptions.region) {
        return clientOptions.region;
      }
      if (clientOptions.edgeURL || clientOptions.uncachedEdgeURL) {
        if (!context.primaryRegion) {
          throw new Error(
            "When accessing a deploy store, the Netlify Blobs client needs to be configured with a region, and one was not found in the environment. To manually set the region, set the `region` property in the store options. If you are using the Netlify CLI, you may have an outdated version; run `npm install -g netlify-cli@latest` to update and try again."
          );
        }
        return context.primaryRegion;
      }
      return REGION_AUTO;
    };
    getDeployStore = (input = {}, options) => {
      const context = getEnvironmentContext();
      const mergedOptions = typeof input === "string" ? { ...options, name: input } : input;
      const deployID = mergedOptions.deployID ?? context.deployID;
      if (!deployID) {
        throw new MissingBlobsEnvironmentError(["deployID"]);
      }
      const clientOptions = getClientOptions(mergedOptions, context);
      clientOptions.region = getDeployStoreRegion(clientOptions, context);
      const client = new Client(clientOptions);
      return new Store({ client, deployID, name: mergedOptions.name });
    };
    getStore = (input, options) => {
      if (typeof input === "string") {
        const contextOverride = options?.siteID && options?.token ? { siteID: options?.siteID, token: options?.token } : void 0;
        const clientOptions = getClientOptions(options ?? {}, contextOverride);
        const client = new Client(clientOptions);
        return new Store({ client, name: input });
      }
      if (typeof input?.name === "string") {
        const { name } = input;
        const contextOverride = input?.siteID && input?.token ? { siteID: input?.siteID, token: input?.token } : void 0;
        const clientOptions = getClientOptions(input, contextOverride);
        if (!name) {
          throw new MissingBlobsEnvironmentError(["name"]);
        }
        const client = new Client(clientOptions);
        return new Store({ client, name });
      }
      if (typeof input?.deployID === "string") {
        const context = getEnvironmentContext();
        const clientOptions = getClientOptions(input, context);
        const { deployID } = input;
        if (!deployID) {
          throw new MissingBlobsEnvironmentError(["deployID"]);
        }
        clientOptions.region = getDeployStoreRegion(clientOptions, context);
        const client = new Client(clientOptions);
        return new Store({ client, deployID });
      }
      throw new Error(
        "The `getStore` method requires the name of the store as a string or as the `name` property of an options object"
      );
    };
    formatListStoreResponse = (stores) => stores.filter((store) => !store.startsWith(DEPLOY_STORE_PREFIX)).map((store) => store.startsWith(SITE_STORE_PREFIX) ? store.slice(SITE_STORE_PREFIX.length) : store);
    getListIterator = (client, prefix) => {
      const parameters = {
        prefix
      };
      return {
        [Symbol.asyncIterator]() {
          let currentCursor = null;
          let done = false;
          return {
            async next() {
              if (done) {
                return { done: true, value: void 0 };
              }
              const nextParameters = { ...parameters };
              if (currentCursor !== null) {
                nextParameters.cursor = currentCursor;
              }
              const res = await client.makeRequest({
                method: "get",
                parameters: nextParameters
              });
              if (res.status === 404) {
                await discardBody(res);
                return { done: true, value: void 0 };
              }
              const page = await res.json();
              if (page.next_cursor) {
                currentCursor = page.next_cursor;
              } else {
                done = true;
              }
              return {
                done: false,
                value: {
                  ...page,
                  stores: formatListStoreResponse(page.stores)
                }
              };
            }
          };
        }
      };
    };
  }
});

// netlify/functions/api.ts
var api_exports = {};
__export(api_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(api_exports);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_crypto = __toESM(require("crypto"), 1);

// src/data/initialData.ts
var initialWebsiteData = {
  hero: {
    title: "THE EDITOR",
    subtitle: "Asma Shehzadi",
    tagline: "Your Ideas, My Edit \u2726 Turning Ideas into Visual Stories",
    badgeText: "Available for Creative Projects",
    description: "Senior Video Editor & Graphic Designer crafting high-retention social reels, cinematic documentaries, commercial ads, and iconic brand visuals that captivate audiences and skyrocket engagement.",
    primaryBtnText: "Let's Work Together",
    primaryBtnLink: "#contact",
    secondaryBtnText: "Explore Portfolio",
    secondaryBtnLink: "#video-portfolio",
    profileImage: "/assets/aistudio/ChatGPT_Image_Jul_30__2026__06_53_54_PM_9f4fe06f.png",
    bannerImage: "/assets/aistudio/Gemini_Generated_Image_skq52gskq52gskq5_c6cd0d86.jfif",
    stats: [
      { label: "Videos Edited", value: "450+", icon: "Film" },
      { label: "Organic Views Generated", value: "120M+", icon: "Eye" },
      { label: "Client Satisfaction", value: "99%", icon: "Star" },
      { label: "Years Experience", value: "5+", icon: "Sparkles" }
    ]
  },
  about: {
    badge: "Meet The Creator",
    title: "Mastering the Art of Visual Rhythm & Storytelling",
    subtitle: "Passionate Video Editor & Visual Designer based in Pakistan, serving global creators and brands.",
    bio: [
      "Hello! I am Asma Shehzadi, known as 'The Editor'. With over 5 years of professional experience, I blend pacing, sound design, motion graphics, and color grading into seamless visual journeys that hold audience attention from the first second.",
      "Whether it is an ultra-retention TikTok/Instagram reel, a story-driven YouTube documentary, a dynamic talking-head episode, or sleek visual branding, I focus on what makes content memorable and high-performing."
    ],
    experienceYears: "5+ Years",
    completedProjects: "450+",
    happyClients: "120+",
    viewsGenerated: "120M+",
    profileImage: "/assets/aistudio/Gemini_Generated_Image_wvank6wvank6wvan_71b2d2c5.png",
    signatureText: "Asma Shehzadi \u2014 The Editor",
    highlights: [
      "Advanced Adobe Premiere Pro & After Effects Specialist",
      "High-Retention Sound Design, SFX, & Subtitle Animation",
      "Cinematic Color Grading & Audio Restoration",
      "Full Brand Identity, Thumbnails & Social Post Graphics"
    ],
    resumeUrl: "#"
  },
  videoCategories: [
    "All",
    "Talking Head",
    "AI Video Edits",
    "Highlights",
    "Documentary",
    "Motion Graphics",
    "Cashcow",
    "Short-Form Reels"
  ],
  videos: [
    {
      id: "vid-1",
      title: "High-Retention Talking Head & Podcast Masterclass",
      description: "Dynamic pacing with zoom-ins, custom sound effects, b-roll inserts, and modern kinetic typography that doubled average watch time.",
      category: "Talking Head",
      videoType: "youtube",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailUrl: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1200&q=80",
      aspectRatio: "16:9",
      duration: "04:12",
      clientName: "Alex Thorne Media",
      featured: true,
      order: 1,
      status: "published",
      viewsCount: "1.4M Views",
      tags: ["Talking Head", "Sound Design", "Kinetic Text", "Color Graded"],
      createdAt: "2026-08-15"
    },
    {
      id: "vid-2",
      title: "Next-Gen AI Video Synthesis & Cyberpunk Visuals",
      description: "Blended AI generation tools with After Effects tracking, glitch transitions, and cinematic sound scapes for a futuristic tech agency.",
      category: "AI Video Edits",
      videoType: "youtube",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
      aspectRatio: "16:9",
      duration: "02:45",
      clientName: "Synthetix AI Lab",
      featured: true,
      order: 2,
      status: "published",
      viewsCount: "890K Views",
      tags: ["AI Editing", "Runway", "Midjourney Motion", "After Effects"],
      createdAt: "2026-09-02"
    },
    {
      id: "vid-3",
      title: "Viral Luxury Real Estate & Lifestyle Reel (9:16)",
      description: "Ultra-fast beat sync, speed ramping, luxury color palette, and hook-optimized audio for Instagram Reels and TikTok.",
      category: "Short-Form Reels",
      videoType: "youtube",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
      aspectRatio: "9:16",
      duration: "00:45",
      clientName: "Prime Properties Dubai",
      featured: true,
      order: 3,
      status: "published",
      viewsCount: "3.2M Views",
      tags: ["Shorts", "Reels", "Speed Ramp", "Sound FX"],
      createdAt: "2026-09-18"
    },
    {
      id: "vid-4",
      title: "Deep Dive Documentary: The Fall of Digital Empires",
      description: "Archival research, parallax 2.5D photo animation, atmospheric cinematic sound, and paper cutout collage techniques.",
      category: "Documentary",
      videoType: "youtube",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailUrl: "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80",
      aspectRatio: "16:9",
      duration: "14:20",
      clientName: "Chronicle History Channel",
      featured: true,
      order: 4,
      status: "published",
      viewsCount: "2.1M Views",
      tags: ["Magnates Media Style", "Parallax", "Storytelling"],
      createdAt: "2026-10-01"
    },
    {
      id: "vid-5",
      title: "Futuristic 3D Product Promo & Kinetic Typography",
      description: "Clean camera moves, motion tracked UI elements, HUD graphics, and punchy audio cues for a hardware startup.",
      category: "Motion Graphics",
      videoType: "youtube",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
      aspectRatio: "16:9",
      duration: "01:15",
      clientName: "AeroAudio Tech",
      featured: false,
      order: 5,
      status: "published",
      viewsCount: "450K Views",
      tags: ["Motion Design", "After Effects", "Product Ad"],
      createdAt: "2026-10-10"
    },
    {
      id: "vid-6",
      title: "Automated Cashcow Channel Episode: Tech Billionaires",
      description: "High-speed pacing, animated stock footage, custom diagrams, and retention charts designed for maximum monetization.",
      category: "Cashcow",
      videoType: "youtube",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80",
      aspectRatio: "16:9",
      duration: "08:30",
      clientName: "WealthDaily Hub",
      featured: false,
      order: 6,
      status: "published",
      viewsCount: "780K Views",
      tags: ["Cashcow", "Faceless YouTube", "Animation"],
      createdAt: "2026-10-12"
    },
    {
      id: "vid-7",
      title: "Viral Fitness & Gym Motivation Hook Reel (9:16)",
      description: "Punchy bass sound design, seamless whip pans, animated bold subtitles, and color grading tuned for mobile screens.",
      category: "Short-Form Reels",
      videoType: "youtube",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
      aspectRatio: "9:16",
      duration: "00:32",
      clientName: "Titan Athletica",
      featured: true,
      order: 7,
      status: "published",
      viewsCount: "1.8M Views",
      tags: ["Reels", "Fitness", "Sound Design", "TikTok"],
      createdAt: "2026-10-14"
    },
    {
      id: "vid-8",
      title: "Cinematic Travelogue & Drone Reel: Northern Peaks (9:16)",
      description: "Speed ramp transitions, atmospheric Foley audio, luxury LUT grade, and vertical composition storytelling.",
      category: "Short-Form Reels",
      videoType: "youtube",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
      aspectRatio: "9:16",
      duration: "00:48",
      clientName: "Wanderlust Media",
      featured: true,
      order: 8,
      status: "published",
      viewsCount: "2.4M Views",
      tags: ["Travel Reel", "Drone", "Color Grade"],
      createdAt: "2026-10-16"
    },
    {
      id: "vid-9",
      title: "High-Impact Brand Commercial: Future Mobility (16:9)",
      description: "Dynamic 3D transitions, sound design with whooshes and risers, sound track beat sync, and color matched footage.",
      category: "Commercial",
      videoType: "youtube",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      aspectRatio: "16:9",
      duration: "01:45",
      clientName: "Volt Motors",
      featured: true,
      order: 9,
      status: "published",
      viewsCount: "920K Views",
      tags: ["Commercial", "Cinematic", "Automotive"],
      createdAt: "2026-10-17"
    },
    {
      id: "vid-10",
      title: "Finance & Crypto Deep Dive Analysis (16:9)",
      description: "Engaging custom animated infographics, charts, motion graphics, and audio mastering to maximize watch time.",
      category: "YouTube Long-Form",
      videoType: "youtube",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailUrl: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80",
      aspectRatio: "16:9",
      duration: "11:15",
      clientName: "FinPulse Media",
      featured: false,
      order: 10,
      status: "published",
      viewsCount: "640K Views",
      tags: ["Finance", "YouTube", "Charts", "Retention"],
      createdAt: "2026-10-18"
    }
  ],
  designCategories: [
    "All",
    "Thumbnails",
    "Brand Identity & Logos",
    "Social Media Posts",
    "Posters & Banners",
    "Mockups"
  ],
  designs: [
    {
      id: "des-1",
      title: "High CTR YouTube Thumbnail Masterpiece",
      description: "Facial expression retouching, glow effects, high-contrast typography, and 3D floating assets optimized for 14%+ Click-Through Rate.",
      category: "Thumbnails",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80",
      clientName: "TechVibe YouTube",
      featured: true,
      order: 1,
      status: "published",
      tags: ["CTR Optimized", "Photoshop", "Glow FX"],
      createdAt: "2026-09-12"
    },
    {
      id: "des-2",
      title: "The Editor \u2014 Luxury Gold & Obsidian Brand Identity",
      description: "Official branding for Asma Shehzadi featuring stylized typography, golden play button insignia, and minimalist stationery.",
      category: "Brand Identity & Logos",
      imageUrl: "/assets/aistudio/Gemini_Generated_Image_skq52gskq52gskq5_c6cd0d86.jfif",
      clientName: "The Editor Studio",
      featured: true,
      order: 2,
      status: "published",
      tags: ["Logo Design", "Vector", "Typography"],
      createdAt: "2026-09-20"
    },
    {
      id: "des-3",
      title: "Cinematic Movie Poster: Eclipse of Tomorrow",
      description: "Complex photo-manipulation combining 12 stock layers, dynamic lighting, atmospheric smoke, and Hollywood-grade title treatment.",
      category: "Posters & Banners",
      imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80",
      clientName: "Indie Film Studios",
      featured: true,
      order: 3,
      status: "published",
      tags: ["Photo Manipulation", "Poster", "Cinematic"],
      createdAt: "2026-09-25"
    },
    {
      id: "des-4",
      title: "Instagram Carousel Guide: 5 Secret Editing Rules",
      description: "Engaging, swipeable carousel layout with seamless connecting graphics, bold hierarchy, and branded color system.",
      category: "Social Media Posts",
      imageUrl: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1000&q=80",
      clientName: "Creative Academy",
      featured: false,
      order: 4,
      status: "published",
      tags: ["Carousel", "Instagram", "Graphic Design"],
      createdAt: "2026-10-02"
    },
    {
      id: "des-5",
      title: "SaaS Platform 3D Isometric Device Mockup",
      description: "Photorealistic perspective mockup showcasing digital dashboard inside floating tablet and desktop displays.",
      category: "Mockups",
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80",
      clientName: "CloudFlow Corp",
      featured: false,
      order: 5,
      status: "published",
      tags: ["3D Mockup", "UI Showcase", "Branding"],
      createdAt: "2026-10-05"
    }
  ],
  skills: [
    {
      id: "sk-1",
      name: "Adobe Premiere Pro",
      category: "Video Editing",
      proficiency: 98,
      iconName: "Film",
      description: "Timeline mastery, multi-cam sync, dynamic linking, keyboard shortcuts, and fast delivery workflows.",
      featured: true,
      order: 1
    },
    {
      id: "sk-2",
      name: "Adobe After Effects",
      category: "Motion Graphics",
      proficiency: 92,
      iconName: "Sparkles",
      description: "Keyframe curves, 2D/3D tracking, visual effects, kinetic typography, and logo stings.",
      featured: true,
      order: 2
    },
    {
      id: "sk-3",
      name: "Adobe Photoshop",
      category: "Graphic Design",
      proficiency: 95,
      iconName: "Image",
      description: "High CTR thumbnail compositing, photo manipulation, frequency separation, and color treatment.",
      featured: true,
      order: 3
    },
    {
      id: "sk-4",
      name: "DaVinci Resolve",
      category: "Audio & Color",
      proficiency: 88,
      iconName: "Palette",
      description: "Color wheels, curves, node trees, LUT management, and HDR grading for rich cinema look.",
      featured: true,
      order: 4
    },
    {
      id: "sk-5",
      name: "Adobe Illustrator",
      category: "Graphic Design",
      proficiency: 90,
      iconName: "PenTool",
      description: "Vector logo craft, custom icons, typography hierarchy, and brand guide development.",
      featured: false,
      order: 5
    },
    {
      id: "sk-6",
      name: "Audio Restoration & SFX",
      category: "Audio & Color",
      proficiency: 94,
      iconName: "Volume2",
      description: "Whoosh, risers, punch sound design, background music ducking, and vocal compression.",
      featured: true,
      order: 6
    },
    {
      id: "sk-7",
      name: "AI Editing & Generative Video",
      category: "Tools & Software",
      proficiency: 91,
      iconName: "Cpu",
      description: "Runway Gen-2, Midjourney v6, ElevenLabs voice cloning, Topaz AI upscaling.",
      featured: true,
      order: 7
    },
    {
      id: "sk-8",
      name: "CapCut Pro Desktop",
      category: "Video Editing",
      proficiency: 96,
      iconName: "Scissors",
      description: "Rapid short-form iteration, auto-captions animation, viral trend sound effects, and transitions.",
      featured: false,
      order: 8
    }
  ],
  services: [
    {
      id: "srv-1",
      title: "Viral Short-Form Reels & TikToks",
      subtitle: "Engineered for retention and virality",
      description: "Turn your raw smartphone or camera footage into scroll-stopping 9:16 vertical videos with hook pacing, animated captions, zooms, sound design, and viral effects.",
      iconName: "Smartphone",
      category: "Short Form",
      deliverables: [
        "Hook optimization in first 3 seconds",
        "Animated bold kinetic captions",
        "Rich SFX and background music ducking",
        "Color grading & 4K export"
      ],
      turnaroundTime: "24 - 48 Hours",
      startingPrice: "$45 / reel",
      prices: {
        USD: "$45 / reel",
        PKR: "Rs. 12,500 / reel",
        GBP: "\xA335 / reel",
        AED: "165 AED / reel"
      },
      ctaText: "Book This Service",
      ctaLink: "#contact",
      isPublished: true,
      featured: true,
      order: 1
    },
    {
      id: "srv-2",
      title: "YouTube Long-Form & Documentary",
      subtitle: "Magnates Media & Vox style visual stories",
      description: "Comprehensive storytelling with seamless b-roll, photo parallax animations, motion graphics, custom charts, and deep audio layering that keeps average watch time above 60%.",
      iconName: "Youtube",
      category: "Long Form",
      deliverables: [
        "Complete narrative pacing & story arc",
        "Custom 2.5D parallax photos & charts",
        "Full sound design & audio mastering",
        "Includes click-worthy YouTube Thumbnail"
      ],
      turnaroundTime: "3 - 5 Days",
      startingPrice: "$180 / video",
      prices: {
        USD: "$180 / video",
        PKR: "Rs. 50,000 / video",
        GBP: "\xA3145 / video",
        AED: "660 AED / video"
      },
      ctaText: "Book This Service",
      ctaLink: "#contact",
      isPublished: true,
      featured: true,
      order: 2
    },
    {
      id: "srv-3",
      title: "High-CTR Thumbnails & Brand Design",
      subtitle: "Stand out in crowded feeds",
      description: "Eye-catching graphic design for YouTube thumbnails, social banners, logo marks, and brand assets crafted to maximize engagement and present a polished brand presence.",
      iconName: "Layers",
      category: "Graphic Design",
      deliverables: [
        "High-contrast photo retouching & lighting",
        "3D text & dynamic asset placement",
        "Multiple variations for A/B testing",
        "Full vector source files"
      ],
      turnaroundTime: "24 Hours",
      startingPrice: "$35 / design",
      prices: {
        USD: "$35 / design",
        PKR: "Rs. 9,500 / design",
        GBP: "\xA328 / design",
        AED: "130 AED / design"
      },
      ctaText: "Book This Service",
      ctaLink: "#contact",
      isPublished: true,
      featured: true,
      order: 3
    },
    {
      id: "srv-4",
      title: "Commercial Ads & Motion Graphics",
      subtitle: "High conversion video promotions",
      description: "High-energy promotional video clips for SaaS products, physical eCommerce goods, app launches, and agency pitch decks.",
      iconName: "Zap",
      category: "Commercial",
      deliverables: [
        "3D device mockups & screen captures",
        "Custom motion graphic animations",
        "Voiceover sync and licensed soundtracks",
        "Multi-format exports (16:9, 9:16, 1:1)"
      ],
      turnaroundTime: "3 - 4 Days",
      startingPrice: "$250 / project",
      prices: {
        USD: "$250 / project",
        PKR: "Rs. 70,000 / project",
        GBP: "\xA3195 / project",
        AED: "920 AED / project"
      },
      ctaText: "Book This Service",
      ctaLink: "#contact",
      isPublished: true,
      featured: false,
      order: 4
    }
  ],
  testimonials: [
    {
      id: "test-1",
      clientName: "David Vance",
      clientRole: "CEO & Founder",
      clientCompany: "Vance Media Global (US)",
      clientAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      rating: 5,
      reviewText: "Asma is easily one of the best video editors I've ever hired. Our YouTube channel retention jumped from 38% to 62% in just two weeks after she took over the editing and pacing. Her sound design is unmatched!",
      projectType: "YouTube Documentary & Talking Head",
      order: 1,
      isPublished: true,
      featured: true
    },
    {
      id: "test-2",
      clientName: "Elena Rostova",
      clientRole: "Lifestyle Creator & Influencer",
      clientCompany: "ElenaStyle (2.4M Followers)",
      clientAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
      rating: 5,
      reviewText: "She turned our simple phone clips into viral masterpieces on Instagram and TikTok. Three of our reels crossed 1 million views each within a month. Communication was super smooth and lightning fast delivery!",
      projectType: "Short-Form Reels Editing",
      order: 2,
      isPublished: true,
      featured: true
    },
    {
      id: "test-3",
      clientName: "Markus Lindberg",
      clientRole: "Product Marketing Director",
      clientCompany: "PulsePay Fintech (UK)",
      clientAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      rating: 5,
      reviewText: "Working with The Editor was a breath of fresh air. She understood our brand guidelines immediately, crafted incredible motion graphics, and designed thumbnails that outperformed our previous agency.",
      projectType: "Commercial Ad & Motion Design",
      order: 3,
      isPublished: true,
      featured: true
    },
    {
      id: "test-4",
      clientName: "Tariq Al-Mansoor",
      clientRole: "Managing Partner",
      clientCompany: "Apex Real Estate Dubai",
      clientAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      rating: 5,
      reviewText: "The color grading and luxury aesthetic Asma brought to our property showcases elevated our entire brand perception. High-ticket buyers constantly compliment our video presentation.",
      projectType: "Cinematic Property Showcase",
      order: 4,
      isPublished: true,
      featured: true
    },
    {
      id: "test-5",
      clientName: "Sarah Jenkins",
      clientRole: "Podcast Host",
      clientCompany: "The Creative Spark Show",
      clientAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
      rating: 5,
      reviewText: "Asma's edits are snappy without feeling chaotic. She highlights the jokes and pivotal quotes with pinpoint audio cues and kinetic subtitles. Highly recommend her for any serious creator!",
      projectType: "Podcast Video & Social Clips",
      order: 5,
      isPublished: true,
      featured: true
    }
  ],
  dynamicSections: [
    {
      id: "sec-before-after",
      key: "before-after-showcase",
      title: "Before & After: The Edit Transformation",
      subtitle: "Slide to experience raw unedited camera footage versus the final color-graded, sound-designed cut.",
      badge: "Visual Craftsmanship",
      layoutType: "before-after",
      isEnabled: true,
      order: 1,
      customData: {
        beforeImage: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80",
        afterImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
        beforeLabel: "Raw Log Footage",
        afterLabel: "Graded & Edited Cut"
      },
      blocks: [
        {
          id: "blk-ba-1",
          type: "text",
          content: "Every frame is sculpted with intent. From correcting exposure and balancing skin tones to applying rich cinematic LUTs and removing background noise, your raw footage is elevated to broadcast quality."
        }
      ]
    },
    {
      id: "sec-workflow",
      key: "creative-process",
      title: "My 4-Step Editing Process",
      subtitle: "From initial briefing to the polished 4K final delivery, here is how we bring your vision to life.",
      badge: "Workflow",
      layoutType: "cards",
      isEnabled: true,
      order: 2,
      blocks: [
        {
          id: "step-1",
          type: "card",
          badge: "Phase 01",
          content: "Vision & Footage Ingestion",
          subcontent: "We discuss your project goals, audience, target platform, and pacing style. You upload raw files and audio safely via Google Drive or Dropbox."
        },
        {
          id: "step-2",
          type: "card",
          badge: "Phase 02",
          content: "The Rough Cut & Story Arc",
          subcontent: "I assemble the narrative backbone, trim dead space, curate the best takes, and structure the video hook for maximum retention."
        },
        {
          id: "step-3",
          type: "card",
          badge: "Phase 03",
          content: "VFX, Sound Design & Color Grade",
          subcontent: "Adding kinetic text, B-roll overlays, bespoke sound effects, music sync, atmospheric risers, and cinematic color correction."
        },
        {
          id: "step-4",
          type: "card",
          badge: "Phase 04",
          content: "Review & Final 4K Delivery",
          subcontent: "You review the draft, request any micro adjustments, and receive the finalized high-bitrate video ready to publish."
        }
      ]
    },
    {
      id: "sec-faqs",
      key: "frequently-asked-questions",
      title: "Frequently Asked Questions",
      subtitle: "Got questions before starting? Find quick answers right here.",
      badge: "Clear Answers",
      layoutType: "faq-accordion",
      isEnabled: true,
      order: 3,
      blocks: [
        {
          id: "faq-1",
          type: "card",
          content: "What video editing software do you use?",
          subcontent: "I primarily use Adobe Premiere Pro for editing and pacing, Adobe After Effects for motion graphics and visual effects, DaVinci Resolve for advanced color grading, and Adobe Photoshop/Illustrator for graphic design and thumbnails."
        },
        {
          id: "faq-2",
          type: "card",
          content: "How do I send my raw video files to you?",
          subcontent: "You can upload your files to Google Drive, Dropbox, WeTransfer, or Frame.io and share the link. I handle large video file transfers efficiently."
        },
        {
          id: "faq-3",
          type: "card",
          content: "What is your standard turnaround time?",
          subcontent: "For short-form reels and TikToks, delivery is typically 24-48 hours. Long-form YouTube videos and commercial projects range between 3 to 5 business days depending on complexity."
        },
        {
          id: "faq-4",
          type: "card",
          content: "Do you offer revisions if I need changes?",
          subcontent: "Yes! Every project includes up to 2 rounds of free revisions to ensure you are 100% delighted with the timing, sound design, and text."
        }
      ]
    }
  ],
  theme: {
    defaultTheme: "dark",
    allowThemeToggle: true,
    rememberPreference: true,
    activePreset: "gold",
    darkColors: {
      bg: "#0A0A0A",
      cardBg: "#141414",
      text: "#F3F4F6",
      textMuted: "#9CA3AF",
      heading: "#FFFFFF",
      accent: "#F59E0B",
      accentHover: "#D97706",
      border: "#262626",
      btnBg: "#F59E0B",
      btnText: "#0A0A0A"
    },
    lightColors: {
      bg: "#F9FAFB",
      cardBg: "#FFFFFF",
      text: "#1F2937",
      textMuted: "#6B7280",
      heading: "#111827",
      accent: "#D97706",
      accentHover: "#B45309",
      border: "#E5E7EB",
      btnBg: "#D97706",
      btnText: "#FFFFFF"
    },
    typography: {
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Plus Jakarta Sans",
      baseFontSize: "md"
    },
    buttonStyle: {
      rounded: "full",
      shadow: true
    },
    cardStyle: {
      rounded: "xl",
      borderStyle: "subtle"
    },
    sectionColors: {},
    sectionAnimations: {}
  },
  navigation: {
    logoType: "both",
    logoText: "THE EDITOR",
    logoSubtitle: "Asma Shehzadi",
    logoImageUrl: "/assets/aistudio/Gemini_Generated_Image_wvank6wvank6wvan_71b2d2c5.png",
    menuItems: [
      { id: "nav-1", label: "Home", href: "#hero", isExternal: false, isVisible: true, order: 1 },
      { id: "nav-2", label: "Videos", href: "#video-portfolio", isExternal: false, isVisible: true, order: 2 },
      { id: "nav-3", label: "Graphic Design", href: "#design-portfolio", isExternal: false, isVisible: true, order: 3 },
      { id: "nav-4", label: "Skills & Tools", href: "#skills-section", isExternal: false, isVisible: true, order: 4 },
      { id: "nav-5", label: "Services", href: "#services-section", isExternal: false, isVisible: true, order: 5 },
      { id: "nav-6", label: "About", href: "#about-section", isExternal: false, isVisible: true, order: 6 },
      { id: "nav-7", label: "Reviews", href: "#testimonials-section", isExternal: false, isVisible: true, order: 7 },
      { id: "nav-8", label: "Contact", href: "#contact", isExternal: false, isVisible: true, order: 8 }
    ],
    ctaButton: {
      label: "Hire Me",
      href: "#contact",
      isVisible: true
    },
    footer: {
      tagline: "Turning ideas into visual stories with premium video editing and distinctive graphic design.",
      copyrightText: "\xA9 2026 The Editor \u2014 Asma Shehzadi. All rights reserved.",
      showSocials: true,
      columns: [
        {
          title: "Navigation",
          links: [
            { label: "Video Showcase", url: "#video-portfolio" },
            { label: "Graphic Gallery", url: "#design-portfolio" },
            { label: "Services & Pricing", url: "#services-section" },
            { label: "Client Reviews", url: "#testimonials-section" }
          ]
        },
        {
          title: "Specialties",
          links: [
            { label: "Viral Short-Form Reels", url: "#video-portfolio" },
            { label: "YouTube Documentaries", url: "#video-portfolio" },
            { label: "Motion Graphics", url: "#video-portfolio" },
            { label: "High-CTR Thumbnails", url: "#design-portfolio" }
          ]
        },
        {
          title: "Direct Connect",
          links: [
            { label: "asmashehzadi200@gmail.com", url: "mailto:asmashehzadi200@gmail.com" },
            { label: "Chat on WhatsApp", url: "https://wa.me/923000000000" },
            { label: "Admin Login", url: "#/admin" }
          ]
        }
      ]
    }
  },
  contact: {
    email: "asmashehzadi200@gmail.com",
    whatsappNumber: "+92 300 0000000",
    whatsappMessage: "Hi Asma! I saw your portfolio and I would love to discuss a video editing / graphic design project with you.",
    calendarLink: "https://calendly.com",
    phone: "+92 300 0000000",
    location: "Pakistan (Available Globally)",
    workStatus: "Available for freelance & full-time",
    socialLinks: [
      { platform: "youtube", url: "https://youtube.com", label: "YouTube", isVisible: true },
      { platform: "instagram", url: "https://instagram.com", label: "Instagram", isVisible: true },
      { platform: "linkedin", url: "https://linkedin.com", label: "LinkedIn", isVisible: true },
      { platform: "behance", url: "https://behance.net", label: "Behance", isVisible: true },
      { platform: "fiverr", url: "https://fiverr.com", label: "Fiverr Pro", isVisible: true },
      { platform: "upwork", url: "https://upwork.com", label: "Upwork Top Rated", isVisible: true }
    ]
  },
  seo: {
    metaTitle: "The Editor \u2014 Asma Shehzadi | Video Editor & Graphic Designer",
    metaDescription: "Official portfolio of Asma Shehzadi (The Editor) \u2014 Video Editor and Graphic Designer specializing in high-retention reels, documentaries, motion graphics, and visual branding.",
    ogTitle: "The Editor \u2014 Asma Shehzadi | Video Editing & Graphic Designing",
    ogDescription: "Turning ideas into visual stories. Explore my video editing portfolio, motion graphics, and graphic design showcase.",
    ogImage: "/assets/aistudio/Gemini_Generated_Image_skq52gskq52gskq5_c6cd0d86.jfif",
    keywords: [
      "Asma Shehzadi",
      "The Editor",
      "Video Editor",
      "Graphic Designer",
      "Reels Editor",
      "YouTube Editor",
      "Motion Graphics",
      "Premiere Pro",
      "After Effects",
      "Thumbnails Designer"
    ]
  },
  pricingSettings: {
    defaultCurrency: "USD",
    enableCurrencySelector: true,
    ctaButtonText: "Book This Service",
    ctaButtonLink: "#contact"
  },
  sectionHeadings: {
    videos: {
      badge: "Video Editing Showcase",
      title: "Selected Video Projects",
      subtitle: "From viral short-form retention edits to immersive documentary storytelling and commercial campaigns.",
      reelsTitle: "Short-Form Vertical Reels (9:16)",
      reelsSubtitle: "Engineered for high watch time, quick cuts, and viral retention",
      longFormTitle: "Long-Form & Cinematic Productions (16:9)",
      longFormSubtitle: ""
    },
    designs: {
      badge: "Visual Branding & Graphic Design",
      title: "Graphic Design Showcase",
      subtitle: "High CTR YouTube thumbnails, logo brand systems, social media banners, and promotional print assets."
    },
    skills: {
      badge: "Capabilities & Tooling",
      title: "Skills & Software Mastery",
      subtitle: "Industry-standard post-production suites paired with generative AI workflows for maximum speed and quality."
    },
    services: {
      badge: "High Impact Deliverables",
      title: "Services & Pricing Packages",
      subtitle: "Tailored creative packages designed to elevate your personal brand, channel, or commercial campaigns."
    },
    testimonials: {
      badge: "Client Endorsements",
      title: "What Creators & Brands Say",
      subtitle: "Real feedback from YouTube creators, agencies, influencers, and luxury real estate partners."
    },
    about: {
      badge: "The Person Behind The Timeline",
      title: "About Me",
      subtitle: "Crafting narratives that leave lasting impressions."
    },
    contact: {
      badge: "Let's Create Together",
      title: "Ready to elevate your visual content?",
      subtitle: "Have an upcoming video project, YouTube channel launch, or branding redesign? Send a message directly or schedule a call."
    }
  },
  lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
};

// netlify/functions/api.ts
var JWT_SECRET = process.env.JWT_SECRET || "the-editor-asma-shehzadi-jwt-secret-2026";
var IS_SERVERLESS = Boolean(
  process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT || process.env.NETLIFY_LOCAL
);
var LOCAL_DATA_DIR = import_path.default.resolve(process.cwd(), "data");
var TMP_DATA_DIR = import_path.default.join("/tmp", "data");
var DATA_DIR = IS_SERVERLESS ? TMP_DATA_DIR : LOCAL_DATA_DIR;
var SEED_AUTH_FILE = import_path.default.join(LOCAL_DATA_DIR, "auth_config.json");
var TMP_AUTH_FILE = import_path.default.join(TMP_DATA_DIR, "auth_config.json");
var AUTH_FILE = IS_SERVERLESS ? TMP_AUTH_FILE : SEED_AUTH_FILE;
var SEED_DB_FILE = import_path.default.join(LOCAL_DATA_DIR, "portfolio_db.json");
var TMP_DB_FILE = import_path.default.join(TMP_DATA_DIR, "portfolio_db.json");
var LOCAL_UPLOADS_DIR = import_path.default.resolve(process.cwd(), "public/uploads");
var TMP_UPLOADS_DIR = import_path.default.join("/tmp", "uploads");
var CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";
var CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "";
var CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "";
var CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || "";
var SUPABASE_URL = process.env.SUPABASE_URL || "";
var SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";
var SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "portfolio-media";
function hashPassword(password, salt) {
  return import_crypto.default.createHmac("sha256", salt).update(password).digest("hex");
}
function verifyPassword(candidate, stored) {
  if (!candidate || !stored) return false;
  if (stored.startsWith("sha256:")) {
    const parts = stored.split(":");
    if (parts.length === 3) {
      const storedSalt = parts[1];
      const storedHash = parts[2];
      return hashPassword(candidate, storedSalt) === storedHash;
    }
  }
  return candidate === stored;
}
function splitBuffer(buf, delim) {
  const parts = [];
  let start = 0;
  let idx;
  while ((idx = buf.indexOf(delim, start)) !== -1) {
    if (idx > start) {
      parts.push(buf.subarray(start, idx));
    }
    start = idx + delim.length;
  }
  if (start < buf.length) {
    parts.push(buf.subarray(start));
  }
  return parts;
}
var DEFAULT_SALT = import_crypto.default.randomBytes(16).toString("hex");
var DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || "editor2026";
var inMemoryAuth = {
  username: process.env.ADMIN_USERNAME || "admin",
  passwordHash: `sha256:${DEFAULT_SALT}:${hashPassword(DEFAULT_PASSWORD, DEFAULT_SALT)}`,
  tokenSecret: import_crypto.default.randomBytes(24).toString("hex")
};
function getAuthConfig() {
  try {
    if (import_fs.default.existsSync(AUTH_FILE)) {
      const raw = import_fs.default.readFileSync(AUTH_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && parsed.username && parsed.passwordHash) {
        return parsed;
      }
    }
    if (import_fs.default.existsSync(SEED_AUTH_FILE)) {
      const raw = import_fs.default.readFileSync(SEED_AUTH_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && parsed.username && parsed.passwordHash) {
        return parsed;
      }
    }
  } catch {
  }
  return inMemoryAuth;
}
function saveAuthConfig(config) {
  inMemoryAuth = config;
  const dirs = [DATA_DIR, TMP_DATA_DIR, LOCAL_DATA_DIR];
  for (const dir of dirs) {
    try {
      if (!import_fs.default.existsSync(dir)) {
        import_fs.default.mkdirSync(dir, { recursive: true });
      }
      import_fs.default.writeFileSync(import_path.default.join(dir, "auth_config.json"), JSON.stringify(config, null, 2), "utf-8");
      break;
    } catch {
    }
  }
}
var cachedWebsiteData = null;
async function getBlobStore(storeName) {
  try {
    const { getStore: getStore2 } = await Promise.resolve().then(() => (init_main3(), main_exports));
    const siteID = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
    const token = process.env.NETLIFY_AUTH_TOKEN || process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_API_TOKEN;
    if (siteID && token) {
      return getStore2({ name: storeName, siteID, token, consistency: "strong" });
    }
    return getStore2({ name: storeName, consistency: "strong" });
  } catch (err) {
    return null;
  }
}
async function saveToSupabase(bucket, filename, buffer, mimeType) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${filename}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": mimeType,
        "x-upsert": "true"
      },
      body: new Uint8Array(buffer)
    });
    if (res.ok) {
      return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`;
    }
  } catch (e) {
    console.warn("Supabase storage write error:", e);
  }
  return null;
}
async function getFromSupabase(bucket, filename) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`);
    if (res.ok) {
      const ab = await res.arrayBuffer();
      return Buffer.from(ab);
    }
  } catch (e) {
    console.warn("Supabase storage read error:", e);
  }
  return null;
}
async function loadPersistentDb() {
  try {
    const store = await getBlobStore("portfolio-data");
    if (store) {
      const data = await store.get("portfolio_db", { type: "json" });
      if (data && data.hero && data.videos) {
        cachedWebsiteData = data;
        return data;
      }
    }
  } catch (err) {
    console.warn("Netlify Blobs read error:", err);
  }
  try {
    const sbBuf = await getFromSupabase(SUPABASE_STORAGE_BUCKET, "portfolio_db.json");
    if (sbBuf) {
      const parsed = JSON.parse(sbBuf.toString("utf-8"));
      if (parsed && parsed.hero && parsed.videos) {
        cachedWebsiteData = parsed;
        return parsed;
      }
    }
  } catch {
  }
  if (cachedWebsiteData && cachedWebsiteData.hero) {
    return cachedWebsiteData;
  }
  try {
    if (import_fs.default.existsSync(TMP_DB_FILE)) {
      const raw = import_fs.default.readFileSync(TMP_DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && parsed.hero && parsed.videos) {
        cachedWebsiteData = parsed;
        return parsed;
      }
    }
  } catch {
  }
  try {
    if (import_fs.default.existsSync(SEED_DB_FILE)) {
      const raw = import_fs.default.readFileSync(SEED_DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && parsed.hero && parsed.videos) {
        cachedWebsiteData = parsed;
        return parsed;
      }
    }
  } catch {
  }
  return initialWebsiteData;
}
async function savePersistentDb(data) {
  data.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
  cachedWebsiteData = data;
  try {
    const store = await getBlobStore("portfolio-data");
    if (store) {
      await store.setJSON("portfolio_db", data);
    }
  } catch (err) {
    console.warn("Netlify Blobs write error:", err);
  }
  try {
    const jsonBuf = Buffer.from(JSON.stringify(data, null, 2), "utf-8");
    await saveToSupabase(SUPABASE_STORAGE_BUCKET, "portfolio_db.json", jsonBuf, "application/json");
  } catch {
  }
  const targetDirs = IS_SERVERLESS ? [TMP_DATA_DIR, LOCAL_DATA_DIR] : [LOCAL_DATA_DIR, TMP_DATA_DIR];
  for (const dir of targetDirs) {
    try {
      if (!import_fs.default.existsSync(dir)) {
        import_fs.default.mkdirSync(dir, { recursive: true });
      }
      import_fs.default.writeFileSync(import_path.default.join(dir, "portfolio_db.json"), JSON.stringify(data, null, 2), "utf-8");
      break;
    } catch {
    }
  }
}
function generateToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({
    ...payload,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1e3
    // 7 days expiration
  })).toString("base64url");
  const signature = import_crypto.default.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}
function verifyToken(token) {
  try {
    if (!token) return { valid: false };
    if (token.startsWith("client.")) {
      const parts2 = token.split(".");
      if (parts2.length >= 2) {
        const payload = JSON.parse(Buffer.from(parts2[1], "base64").toString("utf-8"));
        if (payload.exp && payload.exp < Date.now()) return { valid: false };
        return { valid: true, payload };
      }
    }
    const parts = token.split(".");
    if (parts.length !== 3) return { valid: false };
    const [header, body, signature] = parts;
    const expected = import_crypto.default.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
    if (signature !== expected) return { valid: false };
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
    if (parsed.exp && parsed.exp < Date.now()) return { valid: false };
    return { valid: true, payload: parsed };
  } catch {
    return { valid: false };
  }
}
var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Content-Type": "application/json"
};
var handler = async (event, _context) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: ""
    };
  }
  let reqPath = event.path.replace(/^\/\.netlify\/functions\/api/, "").replace(/^\/api/, "");
  if (!reqPath.startsWith("/")) {
    reqPath = "/" + reqPath;
  }
  const method = event.httpMethod;
  const authHeader = event.headers["authorization"] || event.headers["Authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  try {
    if (reqPath === "/auth/login" && method === "POST") {
      const body = event.body ? JSON.parse(event.body) : {};
      const { username, password } = body;
      const auth = getAuthConfig();
      const cleanUser = (username || "").trim().toLowerCase();
      const validUser = (auth.username || "").trim().toLowerCase();
      const isUserMatch = cleanUser === validUser;
      const isPassMatch = verifyPassword(password, auth.passwordHash);
      if (!isUserMatch || !isPassMatch) {
        return {
          statusCode: 401,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: "Invalid username or password" })
        };
      }
      const signedToken = generateToken({
        username: auth.username,
        role: "Super Admin"
      });
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: true,
          token: signedToken,
          user: {
            username: auth.username,
            name: "Asma Shehzadi",
            role: "Super Admin"
          }
        })
      };
    }
    if (reqPath === "/auth/verify" && method === "GET") {
      if (!token) {
        return {
          statusCode: 401,
          headers: CORS_HEADERS,
          body: JSON.stringify({ valid: false })
        };
      }
      const verified = verifyToken(token);
      if (verified.valid) {
        const auth = getAuthConfig();
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            valid: true,
            user: { username: auth.username, name: "Asma Shehzadi", role: "Super Admin" }
          })
        };
      }
      return {
        statusCode: 401,
        headers: CORS_HEADERS,
        body: JSON.stringify({ valid: false })
      };
    }
    if (reqPath === "/auth/logout" && method === "POST") {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true })
      };
    }
    if (reqPath === "/auth/change-credentials" && method === "POST") {
      if (!token || !verifyToken(token).valid) {
        return {
          statusCode: 401,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: "Unauthorized" })
        };
      }
      const body = event.body ? JSON.parse(event.body) : {};
      const { currentPassword, newUsername, newPassword } = body;
      const auth = getAuthConfig();
      if (!verifyPassword(currentPassword, auth.passwordHash)) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: "Current password does not match" })
        };
      }
      let updatedUser = auth.username;
      if (newUsername && newUsername.trim()) {
        updatedUser = newUsername.trim();
        auth.username = updatedUser;
      }
      if (newPassword && newPassword.trim()) {
        if (newPassword.trim().length < 6) {
          return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: "New password must be at least 6 characters long" })
          };
        }
        const newSalt = import_crypto.default.randomBytes(16).toString("hex");
        auth.passwordHash = `sha256:${newSalt}:${hashPassword(newPassword.trim(), newSalt)}`;
      }
      saveAuthConfig(auth);
      const newToken = generateToken({
        username: updatedUser,
        role: "Super Admin"
      });
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: true,
          token: newToken,
          message: "Admin credentials updated and saved successfully! Old credentials will no longer work.",
          user: {
            username: updatedUser,
            name: "Asma Shehzadi",
            role: "Super Admin"
          }
        })
      };
    }
    if (reqPath === "/content" && method === "GET") {
      const data = await loadPersistentDb();
      return {
        statusCode: 200,
        headers: {
          ...CORS_HEADERS,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache"
        },
        body: JSON.stringify(data)
      };
    }
    if (reqPath === "/content" && method === "PUT") {
      if (!token || !verifyToken(token).valid) {
        return {
          statusCode: 401,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: "Unauthorized: Authentication required." })
        };
      }
      const incoming = event.body ? JSON.parse(event.body) : null;
      if (!incoming || typeof incoming !== "object") {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: "Invalid payload" })
        };
      }
      await savePersistentDb(incoming);
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, data: incoming })
      };
    }
    if (reqPath === "/storage/config" && method === "GET") {
      const db = await loadPersistentDb();
      const customSettings = db?.storageSettings || {};
      const hasCloudinary = Boolean(
        CLOUDINARY_CLOUD_NAME || customSettings.cloudinaryCloudName
      );
      const hasSupabase = Boolean(
        SUPABASE_URL && SUPABASE_ANON_KEY || customSettings.supabaseUrl && customSettings.supabaseAnonKey
      );
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          provider: customSettings.provider || (hasCloudinary ? "cloudinary" : hasSupabase ? "supabase" : "netlify-blobs"),
          cloudinary: {
            cloudName: CLOUDINARY_CLOUD_NAME || customSettings.cloudinaryCloudName || "",
            uploadPreset: CLOUDINARY_UPLOAD_PRESET || customSettings.cloudinaryUploadPreset || "",
            hasApiKey: Boolean(CLOUDINARY_API_KEY || customSettings.cloudinaryApiKey),
            isConfigured: hasCloudinary
          },
          supabase: {
            url: SUPABASE_URL || customSettings.supabaseUrl || "",
            bucket: SUPABASE_STORAGE_BUCKET || customSettings.supabaseBucket || "portfolio-media",
            isConfigured: hasSupabase
          },
          netlifyBlobsAvailable: true
        })
      };
    }
    if (reqPath === "/storage/sign" && method === "POST") {
      if (!token || !verifyToken(token).valid) {
        return {
          statusCode: 401,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: "Unauthorized" })
        };
      }
      const body = event.body ? JSON.parse(event.body) : {};
      const { paramsToSign = {} } = body;
      const secret = CLOUDINARY_API_SECRET;
      if (!secret) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: "CLOUDINARY_API_SECRET is not configured on server" })
        };
      }
      const sortedKeys = Object.keys(paramsToSign).sort();
      const toSign = sortedKeys.map((k) => `${k}=${paramsToSign[k]}`).join("&") + secret;
      const signature = import_crypto.default.createHash("sha1").update(toSign).digest("hex");
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          signature,
          apiKey: CLOUDINARY_API_KEY,
          cloudName: CLOUDINARY_CLOUD_NAME
        })
      };
    }
    if (reqPath === "/upload" && method === "POST") {
      if (!token || !verifyToken(token).valid) {
        return {
          statusCode: 401,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: "Unauthorized: Authentication required." })
        };
      }
      let fileName = "upload_" + Date.now();
      let fileType = "application/octet-stream";
      let fileBuffer = null;
      const contentType = event.headers["content-type"] || event.headers["Content-Type"] || "";
      if (contentType.includes("application/json")) {
        const parsed = JSON.parse(event.body || "{}");
        if (parsed.base64Data) {
          fileName = parsed.fileName || fileName;
          fileType = parsed.fileType || fileType;
          const cleanBase64 = parsed.base64Data.replace(/^data:.*?;base64,/, "");
          fileBuffer = Buffer.from(cleanBase64, "base64");
        }
      } else if (contentType.includes("multipart/form-data")) {
        const rawBuffer = event.isBase64Encoded && event.body ? Buffer.from(event.body, "base64") : Buffer.from(event.body || "", "latin1");
        const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
        const boundary = boundaryMatch ? (boundaryMatch[1] || boundaryMatch[2]).trim() : "";
        if (boundary) {
          const boundaryBuffer = Buffer.from("--" + boundary);
          const parts = splitBuffer(rawBuffer, boundaryBuffer);
          for (const part of parts) {
            const headerEndIdx = part.indexOf("\r\n\r\n");
            const doubleNewlineIdx = part.indexOf("\n\n");
            const sepIdx = headerEndIdx !== -1 ? headerEndIdx : doubleNewlineIdx;
            const sepLen = headerEndIdx !== -1 ? 4 : 2;
            if (sepIdx !== -1) {
              const headerText = part.subarray(0, sepIdx).toString("utf-8");
              const filenameMatch = headerText.match(/filename="([^"]+)"/i);
              const typeMatch = headerText.match(/Content-Type:\s*([^\r\n;]+)/i);
              if (filenameMatch) {
                fileName = filenameMatch[1];
                if (typeMatch) {
                  fileType = typeMatch[1].trim();
                }
                let bodyPart = part.subarray(sepIdx + sepLen);
                if (bodyPart.subarray(bodyPart.length - 2).toString() === "\r\n") {
                  bodyPart = bodyPart.subarray(0, bodyPart.length - 2);
                } else if (bodyPart.subarray(bodyPart.length - 1).toString() === "\n") {
                  bodyPart = bodyPart.subarray(0, bodyPart.length - 1);
                }
                fileBuffer = bodyPart;
                break;
              }
            }
          }
        }
      } else if (event.isBase64Encoded && event.body) {
        fileBuffer = Buffer.from(event.body, "base64");
      } else if (event.body) {
        fileBuffer = Buffer.from(event.body, "binary");
      }
      if (!fileBuffer || fileBuffer.length === 0) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: "No file data received" })
        };
      }
      const ext = import_path.default.extname(fileName) || (fileType.includes("image") ? ".jpg" : ".mp4");
      const baseClean = import_path.default.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
      const safeFilename = `${baseClean}_${Date.now()}${ext}`;
      let storedSuccessfully = false;
      let cloudUrl = null;
      try {
        const mediaStore = await getBlobStore("portfolio-media");
        if (mediaStore) {
          await mediaStore.set(safeFilename, new Uint8Array(fileBuffer), {
            metadata: {
              mimeType: fileType,
              originalName: fileName,
              size: fileBuffer.length.toString(),
              uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
            }
          });
          storedSuccessfully = true;
        }
      } catch (blobErr) {
        console.warn("Failed to save to Netlify Blobs:", blobErr);
      }
      if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        try {
          const sbUrl = await saveToSupabase(SUPABASE_STORAGE_BUCKET, safeFilename, fileBuffer, fileType);
          if (sbUrl) {
            cloudUrl = sbUrl;
            storedSuccessfully = true;
          }
        } catch (sbErr) {
          console.warn("Failed to save to Supabase:", sbErr);
        }
      }
      const uploadDirsToTry = IS_SERVERLESS ? [TMP_UPLOADS_DIR, LOCAL_UPLOADS_DIR] : [LOCAL_UPLOADS_DIR, TMP_UPLOADS_DIR];
      for (const dir of uploadDirsToTry) {
        try {
          if (!import_fs.default.existsSync(dir)) {
            import_fs.default.mkdirSync(dir, { recursive: true });
          }
          import_fs.default.writeFileSync(import_path.default.join(dir, safeFilename), fileBuffer);
          storedSuccessfully = true;
          break;
        } catch {
        }
      }
      if (!storedSuccessfully) {
        return {
          statusCode: 500,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: "Could not write file to persistent storage" })
        };
      }
      const publicUrl = cloudUrl || `/api/media-raw/${safeFilename}`;
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: true,
          url: publicUrl,
          filename: safeFilename,
          originalName: fileName,
          size: fileBuffer.length,
          mimetype: fileType
        })
      };
    }
    if (reqPath.startsWith("/media-raw/")) {
      const filename = reqPath.replace("/media-raw/", "");
      const safeFilename = import_path.default.basename(filename);
      let fileBuffer = null;
      let mimeType = "application/octet-stream";
      try {
        const mediaStore = await getBlobStore("portfolio-media");
        if (mediaStore) {
          const raw = await mediaStore.get(safeFilename, { type: "arrayBuffer" });
          if (raw) {
            fileBuffer = Buffer.from(raw);
            const metadata = await mediaStore.getMetadata(safeFilename);
            if (metadata?.metadata?.mimeType) {
              mimeType = String(metadata.metadata.mimeType);
            }
          }
        }
      } catch {
      }
      if (!fileBuffer) {
        try {
          const tmpFilePath = import_path.default.join(TMP_UPLOADS_DIR, safeFilename);
          if (import_fs.default.existsSync(tmpFilePath)) {
            fileBuffer = import_fs.default.readFileSync(tmpFilePath);
          }
        } catch {
        }
      }
      if (!fileBuffer) {
        try {
          const localFilePath = import_path.default.join(LOCAL_UPLOADS_DIR, safeFilename);
          if (import_fs.default.existsSync(localFilePath)) {
            fileBuffer = import_fs.default.readFileSync(localFilePath);
          }
        } catch {
        }
      }
      if (!fileBuffer && SUPABASE_URL && SUPABASE_ANON_KEY) {
        try {
          const sbBuf = await getFromSupabase(SUPABASE_STORAGE_BUCKET, safeFilename);
          if (sbBuf) {
            fileBuffer = sbBuf;
          }
        } catch {
        }
      }
      if (!fileBuffer) {
        return {
          statusCode: 404,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: "Media file not found" })
        };
      }
      if (mimeType === "application/octet-stream") {
        const ext = import_path.default.extname(safeFilename).toLowerCase();
        if ([".mp4", ".m4v"].includes(ext)) mimeType = "video/mp4";
        else if (ext === ".webm") mimeType = "video/webm";
        else if (ext === ".mov") mimeType = "video/quicktime";
        else if ([".jpg", ".jpeg"].includes(ext)) mimeType = "image/jpeg";
        else if (ext === ".png") mimeType = "image/png";
        else if (ext === ".webp") mimeType = "image/webp";
        else if (ext === ".gif") mimeType = "image/gif";
      }
      return {
        statusCode: 200,
        headers: {
          "Content-Type": mimeType,
          "Content-Length": fileBuffer.length.toString(),
          "Cache-Control": "public, max-age=31536000, immutable",
          "Accept-Ranges": "bytes",
          "Access-Control-Allow-Origin": "*"
        },
        body: fileBuffer.toString("base64"),
        isBase64Encoded: true
      };
    }
    if (reqPath === "/media" && method === "GET") {
      const mediaList = [];
      const seenFiles = /* @__PURE__ */ new Set();
      try {
        const mediaStore = await getBlobStore("portfolio-media");
        if (mediaStore) {
          const list = await mediaStore.list();
          for (const item of list.blobs) {
            seenFiles.add(item.key);
            const isVideo = /\.(mp4|webm|mov|mkv|m4v)$/i.test(item.key);
            const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(item.key);
            mediaList.push({
              filename: item.key,
              url: `/api/media-raw/${item.key}`,
              size: 0,
              type: isVideo ? "video" : isImage ? "image" : "file",
              createdAt: (/* @__PURE__ */ new Date()).toISOString()
            });
          }
        }
      } catch {
      }
      const scanDirs = [TMP_UPLOADS_DIR, LOCAL_UPLOADS_DIR];
      for (const dir of scanDirs) {
        try {
          if (import_fs.default.existsSync(dir)) {
            const files = import_fs.default.readdirSync(dir);
            for (const filename of files) {
              if (!seenFiles.has(filename)) {
                seenFiles.add(filename);
                const filePath = import_path.default.join(dir, filename);
                const stat = import_fs.default.statSync(filePath);
                const isVideo = /\.(mp4|webm|mov|mkv|m4v)$/i.test(filename);
                const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(filename);
                mediaList.push({
                  filename,
                  url: `/api/media-raw/${filename}`,
                  size: stat.size,
                  type: isVideo ? "video" : isImage ? "image" : "file",
                  createdAt: stat.birthtime
                });
              }
            }
          }
        } catch {
        }
      }
      mediaList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(mediaList)
      };
    }
    if (reqPath.startsWith("/media/") && method === "DELETE") {
      if (!token || !verifyToken(token).valid) {
        return {
          statusCode: 401,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: "Unauthorized" })
        };
      }
      const filename = reqPath.replace("/media/", "");
      const safeFilename = import_path.default.basename(filename);
      try {
        const mediaStore = await getBlobStore("portfolio-media");
        if (mediaStore) {
          await mediaStore.delete(safeFilename);
        }
      } catch {
      }
      try {
        const tmpPath = import_path.default.join(TMP_UPLOADS_DIR, safeFilename);
        if (import_fs.default.existsSync(tmpPath)) {
          import_fs.default.unlinkSync(tmpPath);
        }
      } catch {
      }
      try {
        const localPath = import_path.default.join(LOCAL_UPLOADS_DIR, safeFilename);
        if (import_fs.default.existsSync(localPath)) {
          import_fs.default.unlinkSync(localPath);
        }
      } catch {
      }
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, message: "File deleted" })
      };
    }
    if (reqPath === "/backup" && method === "GET") {
      const data = await loadPersistentDb();
      return {
        statusCode: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Disposition": `attachment; filename=asma-shehzadi-portfolio-backup-${Date.now()}.json`
        },
        body: JSON.stringify(data, null, 2)
      };
    }
    if (reqPath === "/restore" && method === "POST") {
      if (!token || !verifyToken(token).valid) {
        return {
          statusCode: 401,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: "Unauthorized" })
        };
      }
      const backupData = event.body ? JSON.parse(event.body) : null;
      if (!backupData || !backupData.hero) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: "Invalid backup format" })
        };
      }
      await savePersistentDb(backupData);
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, data: backupData })
      };
    }
    if (reqPath === "/reset-demo" && method === "POST") {
      if (!token || !verifyToken(token).valid) {
        return {
          statusCode: 401,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: "Unauthorized" })
        };
      }
      await savePersistentDb(initialWebsiteData);
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, data: initialWebsiteData })
      };
    }
    return {
      statusCode: 404,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: `API route ${method} ${reqPath} not found` })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message || "Internal server error" })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
