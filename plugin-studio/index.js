/**
 * Plugin Studio — Host half.
 *
 * Owns three things:
 *  1. Which MCP servers the studio may draw information from (persisted state).
 *  2. Aggregation: calling the MCP tools of those servers and collecting their answers.
 *  3. Generation: writing a complete, installable DSH bundle from a form spec, then
 *     installing it through the Plugin Manager.
 *
 * The browser half reaches these operations through one JSON endpoint registered on the
 * shared Web server, because a workspace bundle cannot generate Client Remote bindings.
 */

import crypto from 'node:crypto'
import http from 'node:http'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Base64url encoding without padding, as PKCE and state parameters require.
 * @param {Buffer} bytes - raw bytes.
 * @returns {string} base64url text.
 */
function base64url(bytes) {
  return bytes.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Build one PKCE verifier and its S256 challenge.
 * @returns {{verifier: string, challenge: string}} the pair.
 */
function pkcePair() {
  const verifier = base64url(crypto.randomBytes(32))
  const challenge = base64url(crypto.createHash('sha256').update(verifier).digest())
  return { verifier, challenge }
}

/**
 * Credential key that holds one source's bearer token in the credential store.
 * @param {string} slug - source slug.
 * @returns {string} POSIX-identifier key.
 */
function tokenRefFor(slug) {
  const id = String(slug).toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  return `MCP_ACCESS_TOKEN_${id}`
}

/**
 * Parse `WWW-Authenticate` bearer parameters, tolerating quoted and bare values.
 * @param {string} header - header value.
 * @returns {{resourceMetadata?: string, scope?: string, realm?: string, error?: string}} parameters.
 */
function parseChallenge(header) {
  const out = {}
  if (typeof header !== 'string' || header.length === 0) return out
  const scheme = /^\s*bearer\s+/i.test(header) ? header.replace(/^\s*bearer\s+/i, '') : header
  const pattern = /([A-Za-z][A-Za-z0-9_-]*)\s*=\s*(?:"([^"]*)"|([^,\s]+))/g
  let match = pattern.exec(scheme)
  while (match !== null) {
    out[match[1].toLowerCase()] = match[2] ?? match[3]
    match = pattern.exec(scheme)
  }
  return out
}

/**
 * Remove anything that looks like a bearer value or a known secret from text.
 * @param {unknown} text - candidate text.
 * @param {Set<string>} secrets - values that must never leave the Host.
 * @returns {string} redacted text.
 */
function redactOut(text, secrets) {
  let out = String(text ?? '')
  for (const secret of secrets) {
    if (typeof secret === 'string' && secret.length >= 8) out = out.split(secret).join('[redacted]')
  }
  return out.replace(/Bearer\s+[A-Za-z0-9._~+/-]{8,}=*/gi, 'Bearer [redacted]')
}

/**
 * JSON fetch with a timeout and a size bound.
 * @param {string} url - request URL.
 * @param {RequestInit} options - fetch options.
 * @param {number} [timeoutMs] - request budget.
 * @returns {Promise<{status: number, headers: Headers, body: string, json: any}>} response.
 */
async function fetchJson(url, options, timeoutMs = 15000) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(timeoutMs) })
  const body = await response.text()
  let json
  try {
    json = JSON.parse(body)
  } catch {
    json = undefined
  }
  return { status: response.status, headers: response.headers, body, json }
}

export const name = 'plugin-studio'


const PACKAGE_DIR = path.dirname(fileURLToPath(import.meta.url))
const TEMPLATE_DIR = path.join(PACKAGE_DIR, 'templates')
const ROUTE = '/plugin-studio'
const STATE_VERSION = 1
const MARKER = '.plugin-studio.json'
const MAX_BODY_BYTES = 1024 * 1024
const MAX_SOURCES = 8
const MAX_TOOLS_PER_SOURCE = 3
const MAX_ITEMS = 24
const MAX_CHARS_PER_ITEM = 1800
const MAX_TOTAL_CHARS = 24000
const PROBE_TIMEOUT_MS = 20000
const COLLECT_TIMEOUT_MS = 60000
const LLM_TIMEOUT_MS = 90000
const REACHABILITY_WAIT_MS = 8000
const OAUTH_TIMEOUT_MS = 180000
const OAUTH_SCOPES = 'mcp'
const OAUTH_REFRESH_SCOPE = 'offline_access'
const WELL_KNOWN_AS = '/.well-known/oauth-authorization-server'
const WELL_KNOWN_PRM = '/.well-known/oauth-protected-resource'

/** Kinds of bundle the studio can emit. */
const KINDS = ['panel', 'mcp']

/** Slots a generated panel may occupy. */
const SLOTS = ['dock', 'turn']

const QUERY_KEYS = new Set([
  'query', 'q', 'search', 'search_query', 'term', 'terms', 'text', 'prompt',
  'question', 'keyword', 'keywords', 'pattern', 'input', 'topic', 'uri', 'url',
])

/**
 * Resolve the studio state directory.
 * @returns {string} absolute directory for the studio's own JSON state.
 */
function stateDir() {
  const home = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
  return path.join(home, 'plugin-studio')
}

/** @returns {string} path of the studio state file. */
function stateFile() {
  return path.join(stateDir(), 'state.json')
}

/**
 * Read the persisted studio state, repairing anything unrecognizable.
 * @returns {{version: number, enabled: Record<string, boolean>, outDir: string, draft: Record<string, unknown>}}
 */
function readState() {
  const fallback = { version: STATE_VERSION, enabled: {}, outDir: '', draft: {}, auth: {}, sources: {}, disabled: {} }
  try {
    const raw = JSON.parse(fs.readFileSync(stateFile(), 'utf8'))
    if (!raw || typeof raw !== 'object') return fallback
    return {
      version: STATE_VERSION,
      enabled: raw.enabled && typeof raw.enabled === 'object' ? raw.enabled : {},
      outDir: typeof raw.outDir === 'string' ? raw.outDir : '',
      draft: raw.draft && typeof raw.draft === 'object' ? raw.draft : {},
      auth: raw.auth && typeof raw.auth === 'object' ? raw.auth : {},
      sources: raw.sources && typeof raw.sources === 'object' ? raw.sources : {},
      disabled: raw.disabled && typeof raw.disabled === 'object' ? raw.disabled : {},
    }
  } catch {
    return fallback
  }
}

/**
 * Persist the studio state.
 * @param {object} state - complete state object.
 * @returns {void}
 */
function writeState(state) {
  const dir = stateDir()
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(stateFile(), `${JSON.stringify(state, null, 2)}\n`, 'utf8')
}

/**
 * Convert arbitrary text into a lowercase kebab slug usable as a package name segment.
 * @param {unknown} value - raw text.
 * @returns {string} slug, possibly empty.
 */
function slugify(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

/**
 * Turn a slug back into display text ("my-panel" -> "My panel").
 * @param {string} slug - kebab slug.
 * @returns {string} sentence-case title.
 */
function titleFromSlug(slug) {
  const text = slug.replace(/-/g, ' ').trim()
  return text.length === 0 ? 'Untitled panel' : text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Trim arbitrary aggregated text to a display bound.
 * @param {unknown} value - raw value.
 * @param {number} limit - maximum characters.
 * @returns {string} normalized text.
 */
function clampText(value, limit) {
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? '')
  const collapsed = text.replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').trim()
  if (collapsed.length <= limit) return collapsed
  return `${collapsed.slice(0, limit - 1)}…`
}

/**
 * Escape a string for safe inclusion inside a JSON document embedded in JavaScript source.
 * @param {unknown} value - any JSON-serializable value.
 * @returns {string} JSON text that cannot terminate the surrounding script.
 */
function embedJson(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

/**
 * Split a command line into an executable and its arguments, honoring simple quoting.
 * @param {unknown} value - raw command line.
 * @returns {string[]} argv words.
 */
function splitCommand(value) {
  const text = String(value ?? '').trim()
  if (text.length === 0) return []
  const words = []
  let current = ''
  let quote = ''
  for (const character of text) {
    if (quote.length > 0) {
      if (character === quote) quote = ''
      else current += character
      continue
    }
    if (character === '"' || character === "'") {
      quote = character
      continue
    }
    if (/\s/.test(character)) {
      if (current.length > 0) {
        words.push(current)
        current = ''
      }
      continue
    }
    current += character
  }
  if (current.length > 0) words.push(current)
  return words
}

/**
 * Read one of the studio's generation templates.
 * @param {string} fileName - template file name inside `templates/`.
 * @returns {string} template source.
 */
function readTemplate(fileName) {
  return fs.readFileSync(path.join(TEMPLATE_DIR, fileName), 'utf8')
}

/**
 * Replace `__TOKEN__` placeholders in a template.
 * @param {string} source - template source.
 * @param {Record<string, string>} values - replacement table.
 * @returns {string} rendered source.
 */
function fillTemplate(source, values) {
  let out = source
  for (const [token, value] of Object.entries(values)) {
    out = out.split(`__${token}__`).join(value)
  }
  return out
}

/**
 * Read the model-facing parameter schema of a tool without trusting its shape.
 * @param {unknown} parameters - tool parameter document.
 * @returns {{properties: Record<string, any>, required: string[]}} normalized schema.
 */
function parameterSchema(parameters) {
  const doc = parameters && typeof parameters === 'object' ? parameters : {}
  const properties = doc.properties && typeof doc.properties === 'object' ? doc.properties : {}
  const required = Array.isArray(doc.required) ? doc.required.map(String) : []
  return { properties, required }
}

/**
 * Build a call argument object for one tool, or refuse when a required input cannot be filled.
 * @param {unknown} parameters - tool parameter document.
 * @param {string} query - the user's aggregation query.
 * @returns {Record<string, unknown> | null} arguments, or null when the tool needs unknown input.
 */
function buildArguments(parameters, query) {
  const { properties, required } = parameterSchema(parameters)
  /** @type {Record<string, unknown>} */
  const args = {}
  for (const key of required) {
    const property = properties[key] && typeof properties[key] === 'object' ? properties[key] : {}
    if (Array.isArray(property.enum) && property.enum.length > 0) {
      args[key] = property.enum[0]
      continue
    }
    const type = property.type
    if (type === 'string' || type === undefined) {
      if (!QUERY_KEYS.has(key.toLowerCase())) return null
      if (query.length === 0) return null
      args[key] = query
      continue
    }
    if (type === 'number' || type === 'integer') {
      args[key] = 1
      continue
    }
    if (type === 'boolean') {
      args[key] = true
      continue
    }
    if (type === 'array') {
      if (query.length === 0) return null
      args[key] = [query]
      continue
    }
    return null
  }
  if (query.length > 0) {
    for (const [key, raw] of Object.entries(properties)) {
      if (key in args) continue
      const property = raw && typeof raw === 'object' ? raw : {}
      if (QUERY_KEYS.has(key.toLowerCase()) && (property.type === 'string' || property.type === undefined)) {
        args[key] = query
        break
      }
    }
  }
  return args
}

/**
 * Unwrap one settled batch entry into its execution outcome.
 * @param {unknown} entry - `{ callId, result }` as the executor returns it.
 * @returns {any} the execution outcome.
 */
function outcomeOf(entry) {
  if (!entry || typeof entry !== 'object') return {}
  const outcome = entry.result && typeof entry.result === 'object' ? entry.result : entry
  return outcome
}

/**
 * Flatten one tool outcome into displayable text.
 * @param {unknown} entry - settled tool call entry.
 * @returns {string} extracted text.
 */
function resultText(entry) {
  const outcome = outcomeOf(entry)
  const parts = []
  const content = Array.isArray(outcome.content) ? outcome.content : []
  for (const block of content) {
    if (!block || typeof block !== 'object') continue
    if (block.type === 'text' && typeof block.text === 'string') parts.push(block.text)
  }
  if (parts.length === 0 && outcome.value !== undefined && outcome.value !== null) {
    parts.push(clampText(outcome.value, MAX_CHARS_PER_ITEM))
  }
  if (parts.length === 0 && typeof outcome.error?.message === 'string') parts.push(outcome.error.message)
  return parts.join('\n')
}

/**
 * Send a JSON response over the raw Node transport.
 * @param {import('node:http').ServerResponse} res - response to complete.
 * @param {number} status - HTTP status code.
 * @param {unknown} body - JSON-serializable body.
 * @returns {void}
 */
function sendJson(res, status, body) {
  const text = JSON.stringify(body)
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.setHeader('x-content-type-options', 'nosniff')
  res.end(text)
}

/**
 * Read a bounded JSON request body.
 * @param {import('node:http').IncomingMessage} req - request.
 * @returns {Promise<unknown>} parsed body.
 */
async function readBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY_BYTES) throw new Error('Request body is too large')
    chunks.push(chunk)
  }
  if (chunks.length === 0) return {}
  const text = Buffer.concat(chunks).toString('utf8')
  return JSON.parse(text)
}

/**
 * Register the studio: state, MCP aggregation, bundle generation, installation, and the
 * browser bridge.
 * @param {import('@deepseek-ai/cordis').Context} ctx - registrant context.
 * @returns {void}
 */
export function apply(ctx) {
  /** Outcome of the optional chat-skill registration, surfaced for diagnosis. */
  let skillState = 'absent'

  // Chat awareness: the model sees the live source list from the first step of a session.
  ctx.inject(['systemPrompt'], (promptCtx) => {
    promptCtx.effect(() => promptCtx.systemPrompt.section({
      name: 'plugin-studio:sources',
      order: 40,
      text: function promptSources() {
        const text = sourcePromptText()
        return text
      },
    }), 'plugin-studio: source mentions')
  })
  /**
   * Tools the registry exposes for one MCP server.
   * @param {string} serverName - the server's namespace.
   * @returns {Array<{name: string, description: string}>} tools without the `mcp__<server>__` prefix.
   */
  /**
   * Whether a source may be read when building. A source that registered tools is usable by
   * default; an explicit choice in the studio wins either way.
   * @param {string} name - source slug.
   * @param {number} toolCount - live registered tool count.
   * @returns {boolean} whether the source is selectable.
   */
  function usableSource(name, toolCount) {
    const snapshotState = readState()
    if (snapshotState.disabled?.[name] === true) return false
    const chosen = snapshotState.enabled?.[name]
    if (chosen === false) return false
    if (chosen === true) return true
    return toolCount > 0
  }

  function toolsForServer(serverName) {
    const tools = ctx.get('tools')
    /** @type {any[]} */
    let schemas = []
    try {
      schemas = tools ? tools.schemas() : []
    } catch {
      schemas = []
    }
    const prefix = `mcp__${serverName}__`
    return schemas
      .filter(schema => typeof schema?.name === 'string' && schema.name.startsWith(prefix))
      .map(schema => ({
        name: schema.name.slice(prefix.length),
        description: String(schema.description ?? ''),
      }))
  }

  /**
   * Sources this studio installed, recorded when it wrote the bundle. Loader entries cannot be
   * read through the config editor from a plugin context, so the studio keeps its own record.
   * @returns {Record<string, any>} one entry per source slug.
   */
  /**
   * Every `@local/*` bundle in the profile except the studio itself, so a generated
   * plugin stays manageable even when the studio lost its own record of it.
   * @returns {Promise<Array<{name: string, bundle: string, enabled: boolean, version: string}>>}
   */
  async function localPlugins() {
    const manager = ctx.get('pluginManager')
    if (!manager || typeof manager.listBundles !== 'function') return []
    try {
      const list = await manager.listBundles()
      let entries = []
      if (typeof manager.listPlugins === 'function') {
        try {
          entries = await manager.listPlugins()
        } catch (error) {
          entries = []
        }
      }
      const entryState = new Map()
      for (const entry of Array.isArray(entries) ? entries : []) {
        if (typeof entry?.patchId === 'string') entryState.set(entry.patchId, entry.enabled !== false)
      }
      return (Array.isArray(list) ? list : [])
        .filter(entry => typeof entry?.name === 'string'
          && entry.name.startsWith('@local/')
          && entry.name !== '@local/plugin-studio')
        .map(entry => {
          const slug = entry.name.slice('@local/'.length)
          return {
            name: slug,
            bundle: entry.name,
            enabled: entry.enabled !== false && entryState.get(slug) !== false,
            version: typeof entry.version === 'string' ? entry.version : '',
          }
        })
    } catch (error) {
      return []
    }
  }

  function recordedSources() {
    return readState().sources ?? {}
  }

  /** Last endpoint probe outcome per source. */
  const probeCache = new Map()

  /**
   * Whether one source authenticates through a credential template or a literal header.
   * @param {Record<string, any> | undefined} config - installed row configuration.
   * @returns {{mode: 'oauth' | 'header' | 'none', ref: string}} authentication mode.
   */
  function authModeOf(record) {
    if (record?.mode === 'oauth') return { mode: 'oauth', ref: tokenRefFor(record.slug ?? '') }
    if (record?.mode === 'header') return { mode: 'header', ref: '' }
    return { mode: 'none', ref: '' }
  }

  /**
   * Ask one endpoint for an MCP initialize, to tell a live server from a dead one even when it
   * exposes no tools.
   * @param {{name?: string, url?: string, token?: string}} input - probe request.
   * @returns {Promise<Record<string, unknown>>} connection verdict.
   */
  async function checkConnection(input) {
    const slug = slugify(input?.name)
    if (slug.length === 0) throw new Error('Name the source to check')
    const record = recordedSources()[slug]
    const url = String(input?.url ?? record?.url ?? '').trim()
    if (url.length === 0) return { state: 'not-installed', detail: 'No HTTP endpoint is known for this source' }
    const auth = authModeOf({ ...record, slug })
    const headers = { accept: 'application/json, text/event-stream', 'content-type': 'application/json' }
    if (auth.mode === 'header') {
      Object.assign(headers, record?.headers ?? {})
    } else if (auth.mode === 'oauth') {
      const store = credentialStore()
      const resolved = store ? await store.resolve(auth.ref) : undefined
      if (!resolved?.value) {
        probeCache.set(slug, { state: 'sign-in-required', at: Date.now() })
        return { state: 'sign-in-required', detail: 'No access token is stored for this source' }
      }
      keepSecret(resolved.value)
      headers.Authorization = `Bearer ${resolved.value}`
    }
    try {
      const result = await fetchJson(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: `studio-probe-${Date.now()}`,
          method: 'initialize',
          params: {
            protocolVersion: '2025-06-18',
            capabilities: {},
            clientInfo: { name: 'plugin-studio', version: '1.0.0' },
          },
        }),
      }, 20000)
      if (result.status === 401 || result.status === 403) {
        const outcome = { state: 'sign-in-required', detail: `The server answered ${result.status}` }
        probeCache.set(slug, { ...outcome, at: Date.now() })
        return outcome
      }
      if (result.status >= 200 && result.status < 300) {
        const outcome = { state: 'connected', detail: 'The server completed an MCP initialize' }
        probeCache.set(slug, { ...outcome, at: Date.now() })
        return outcome
      }
      const outcome = { state: 'error', detail: `The server answered ${result.status}` }
      probeCache.set(slug, { ...outcome, at: Date.now() })
      return outcome
    } catch (error) {
      const outcome = { state: 'error', detail: redactOut(error?.message ?? error, secrets) }
      probeCache.set(slug, { ...outcome, at: Date.now() })
      return outcome
    }
  }

  /**
   * Every MCP server this profile can reach: the manager's rows plus servers that only the tool
   * registry knows, because a standalone `dsh-mcp-client` row registers tools without telling the
   * manager.
   * @returns {Array<Record<string, any>>} manager views, one per server name.
   */
  function managerViews() {
    const manager = ctx.get('mcpManager')
    /** @type {Map<string, Record<string, any>>} */
    const views = new Map()
    if (manager) {
      try {
        for (const view of manager.list()) {
          if (view && typeof view.name === 'string') views.set(view.name, view)
        }
      } catch {
        // a manager that cannot list still leaves the tool registry as the source of truth
      }
    }
    const tools = ctx.get('tools')
    let schemas = []
    try {
      schemas = tools ? tools.schemas() : []
    } catch {
      schemas = []
    }
    for (const schema of schemas) {
      const toolName = typeof schema?.name === 'string' ? schema.name : ''
      if (!toolName.startsWith('mcp__')) continue
      const rest = toolName.slice('mcp__'.length)
      const split = rest.indexOf('__')
      if (split <= 0) continue
      const serverName = rest.slice(0, split)
      if (!views.has(serverName)) views.set(serverName, { name: serverName, configured: true, status: { state: 'connected' } })
    }
    return [...views.values()].sort((left, right) => String(left.name).localeCompare(String(right.name)))
  }

  /**
   * Source rows for the page: one per reachable MCP server.
   * @returns {Array<Record<string, unknown>>} the source list.
   */
  function serverRows() {
    const state = readState()
    return managerViews().map(view => {
      const status = view?.status ?? { state: 'unknown' }
      const tools = toolsForServer(view.name)
      return {
        name: String(view.name ?? ''),
        configured: view?.configured === true,
        state: tools.length > 0 ? 'connected' : String(status.state ?? 'unknown'),
        toolCount: typeof status.toolCount === 'number' ? status.toolCount : tools.length,
        lastError: typeof status.lastError === 'string' ? status.lastError : null,
        enabled: usableSource(view.name, tools.length),
        tools,
      }
    })
  }

  /**
   * The directory generated bundles are written into: the saved choice, else a folder in the
   * most recently used workspace, else a folder in the Harness home.
   * @param {string} [override] - a caller-supplied directory.
   * @returns {string} absolute output directory.
   */
  function outputDir(override) {
    if (typeof override === 'string' && override.trim().length > 0) return path.resolve(override.trim())
    const state = readState()
    if (state.outDir) return path.resolve(state.outDir)
    const registry = ctx.get('workspaceRegistry')
    if (registry) {
      try {
        const workspaces = registry.list().filter(entry => typeof entry?.path === 'string' && fs.existsSync(entry.path))
        workspaces.sort((left, right) => String(right.updatedAt ?? '').localeCompare(String(left.updatedAt ?? '')))
        if (workspaces.length > 0) return path.join(workspaces[0].path, 'plugin-studio-builds')
      } catch {
        // fall through to the Harness-home default
      }
    }
    return path.join(stateDir(), 'bundles')
  }

  /**
   * Aggregate information from the enabled MCP sources.
   * @param {{sources?: string[], query?: string}} input - requested servers and query.
   * @returns {Promise<{items: Array<{source: string, tool: string, text: string}>, skipped: Array<{source: string, tool: string, reason: string}>, truncated: boolean}>} aggregated rows.
   */
  async function collect(input) {
    const tools = ctx.get('tools')
    if (!tools) throw new Error('The tool registry is unavailable in this profile')
    const requested = Array.isArray(input?.sources) ? input.sources.map(String).slice(0, MAX_SOURCES) : []
    if (requested.length === 0) throw new Error('Choose at least one source to gather information from')
    const query = typeof input?.query === 'string' ? input.query.trim() : ''
    /** @type {Array<{type: string, id: string, name: string, arguments: string}>} */
    const calls = []
    /** @type {Array<{source: string, tool: string}>} */
    const plan = []
    const skipped = []
    const schemas = tools.schemas()
    for (const server of requested) {
      const prefix = `mcp__${server}__`
      const own = schemas.filter(schema => typeof schema?.name === 'string' && schema.name.startsWith(prefix))
      if (own.length === 0) {
        skipped.push({ source: server, tool: '*', reason: 'No connected tools for this server' })
        continue
      }
      let taken = 0
      for (const schema of own) {
        if (taken >= MAX_TOOLS_PER_SOURCE) break
        if (calls.length >= MAX_SOURCES * MAX_TOOLS_PER_SOURCE) break
        const args = buildArguments(schema.parameters, query)
        if (args === null) {
          skipped.push({ source: server, tool: schema.name.slice(prefix.length), reason: 'Needs input the studio cannot infer' })
          continue
        }
        const callId = `studio-${calls.length + 1}`
        calls.push({ type: 'tool-call', id: callId, name: schema.name, arguments: JSON.stringify(args) })
        plan.push({ source: server, tool: schema.name.slice(prefix.length) })
        taken += 1
      }
    }
    if (calls.length === 0) {
      return { items: [], skipped, truncated: false }
    }
    const batch = await tools.execute({ calls, signal: AbortSignal.timeout(COLLECT_TIMEOUT_MS) })
    const results = Array.isArray(batch?.results) ? batch.results : []
    /** @type {Array<{source: string, tool: string, text: string}>} */
    const items = []
    let total = 0
    let truncated = false
    results.forEach((result, index) => {
      const planRow = plan[index] ?? { source: 'unknown', tool: 'unknown' }
      if (outcomeOf(result)?.isError === true) {
        skipped.push({ source: planRow.source, tool: planRow.tool, reason: clampText(resultText(result), 200) || 'Call failed' })
        return
      }
      const text = resultText(result)
      if (text.trim().length === 0) {
        skipped.push({ source: planRow.source, tool: planRow.tool, reason: 'Returned no text' })
        return
      }
      const bounded = clampText(text, MAX_CHARS_PER_ITEM)
      if (total + bounded.length > MAX_TOTAL_CHARS || items.length >= MAX_ITEMS) {
        truncated = true
        return
      }
      total += bounded.length
      items.push({ source: planRow.source, tool: planRow.tool, text: bounded })
    })
    return { items, skipped, truncated }
  }

  /**
   * One direct model call over the profile's default selection.
   * @param {string} system - system prompt.
   * @param {string} prompt - user prompt.
   * @param {number} maxTokens - output budget.
   * @returns {Promise<string>} concatenated assistant text.
   */
  async function complete(system, prompt, maxTokens) {
    const llm = ctx.get('llm')
    const models = ctx.get('agentDefaultModel')
    if (!llm) throw new Error('No language model service is available in this profile')
    if (!models) throw new Error('No default model is selected in this profile')
    const selection = models.currentSelection() ?? {}
    const provider = String(selection.provider ?? selection.model?.provider ?? '')
    const model = String(selection.model?.model ?? selection.model ?? '')
    if (provider.length === 0 || model.length === 0) throw new Error('No default model is selected in this profile')
    let text = ''
    const stream = llm.stream({
      provider,
      model,
      system,
      messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
      maxTokens,
      signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
    })
    for await (const chunk of stream) {
      if (chunk?.type === 'text-delta') text += chunk.text
      if (chunk?.type === 'finish') {
        const kind = chunk.reason?.kind
        if (kind === 'error') throw new Error(chunk.reason.failure?.message ?? 'The model call failed')
        if (kind === 'aborted') throw new Error('The model call was aborted')
      }
    }
    return text.trim()
  }

  /**
   * Extract the first JSON object from a model reply that may carry fences or prose.
   * @param {string} raw - model text.
   * @returns {any} parsed object.
   */
  function parseJsonReply(raw) {
    const unfenced = raw.replace(/^```[a-zA-Z]*\s*/m, '').replace(/```\s*$/m, '').trim()
    const candidates = [unfenced]
    const first = unfenced.indexOf('{')
    const last = unfenced.lastIndexOf('}')
    if (first >= 0 && last > first) candidates.push(unfenced.slice(first, last + 1))
    for (const candidate of candidates) {
      try {
        return JSON.parse(candidate)
      } catch {
        // try the next candidate
      }
    }
    throw new Error('The model reply was not JSON')
  }

  /**
   * Ask the model what to build next, optionally grounding it in freshly collected source data.
   * @param {{goal?: string, sources?: string[], answers?: Array<{question?: string, answer?: string}>, ingest?: boolean}} input - the dialogue so far.
   * @returns {Promise<Record<string, unknown>>} one question with clickable options, or a finished plan.
   */
  async function ask(input) {
    const goal = typeof input?.goal === 'string' ? input.goal.trim() : ''
    const sources = Array.isArray(input?.sources) ? input.sources.map(String).slice(0, MAX_SOURCES) : []
    const answers = Array.isArray(input?.answers) ? input.answers.slice(-6) : []
    let ingested = { items: [], skipped: [], truncated: false }
    if (input?.ingest !== false && sources.length > 0) {
      try {
        ingested = await collect({ sources, query: goal })
      } catch (error) {
        ingested = { items: [], skipped: [{ source: '*', tool: '*', reason: String(error?.message ?? error) }], truncated: false }
      }
    }
    const rows = serverRows()
    const enabledRows = rows.filter(row => sources.includes(row.name))
    const catalog = (enabledRows.length > 0 ? enabledRows : rows)
      .map(row => `- ${row.name} (${row.state}, ${row.tools.length} tools): ${row.tools.slice(0, 8).map(tool => tool.name).join(', ') || 'no tools listed'}`)
      .join('\n') || '- no MCP source is connected yet'
    const evidence = ingested.items.length > 0
      ? ingested.items.slice(0, 6).map(item => `[${item.source}/${item.tool}] ${clampText(item.text, 420)}`).join('\n\n')
      : 'nothing was collected for this turn'
    const history = answers.length > 0
      ? answers.map((entry, index) => `${index + 1}. ${entry.question ?? 'question'} → ${entry.answer ?? ''}`).join('\n')
      : 'none yet'
    const system = [
      'You design small information plugins for DeepSeek Harness by interviewing the user.',
      'You are given the connected MCP sources, whatever they returned just now, and the answers so far.',
      'Ask at most three questions, one per reply, always with 2 to 5 concrete clickable options.',
      'When you have enough, stop asking and propose the panel.',
      'Reply with ONE JSON object and nothing else. No markdown, no prose outside the JSON.',
      'Question shape: {"done":false,"hypothesis":"...","question":"...","options":[{"label":"...","value":"..."}]}',
      'Plan shape: {"done":true,"hypothesis":"...","plan":{"title":"...","name":"kebab-case","sources":["server"],"query":"...","slot":"dock|turn","description":"..."}}',
      'Rules: options must be short and concrete; "value" is what the user effectively chose and may repeat the label.',
      'Only name sources from the list you were given. "slot" is "dock" (below the composer, always visible) or "turn" (after each answer).',
      'The query is sent to tools that take a search term, so keep it to one or two words.',
    ].join(' ')
    const prompt = [
      goal.length > 0 ? `User goal: ${goal}` : 'User goal: not stated yet; infer one from the data below.',
      '',
      'Connected MCP sources:',
      catalog,
      '',
      'What those sources just returned:',
      evidence,
      '',
      'Answers so far:',
      history,
      '',
      `Enabled sources for this panel: ${sources.join(', ') || 'none chosen yet'}`,
    ].join('\n')
    try {
      const parsed = parseJsonReply(await complete(system, prompt, 700))
      if (parsed?.done === true && parsed.plan) {
        const plan = parsed.plan
        return {
          done: true,
          hypothesis: String(parsed.hypothesis ?? ''),
          plan: {
            title: String(plan.title ?? 'Source digest'),
            name: slugify(plan.name ?? plan.title ?? 'source-digest'),
            sources: (Array.isArray(plan.sources) ? plan.sources : sources).map(String).filter(name => rows.some(row => row.name === name)),
            query: String(plan.query ?? ''),
            slot: plan.slot === 'turn' ? 'turn' : 'dock',
            description: String(plan.description ?? ''),
          },
          ingested: { items: ingested.items.length, skipped: ingested.skipped.length },
        }
      }
      const options = (Array.isArray(parsed?.options) ? parsed.options : [])
        .map(option => ({ label: String(option?.label ?? '').slice(0, 80), value: String(option?.value ?? option?.label ?? '').slice(0, 120) }))
        .filter(option => option.label.length > 0)
        .slice(0, 5)
      return {
        done: false,
        hypothesis: String(parsed?.hypothesis ?? ''),
        question: String(parsed?.question ?? 'What should this panel show?'),
        options: options.length > 0 ? options : [{ label: 'A digest of everything', value: 'digest' }],
        ingested: { items: ingested.items.length, skipped: ingested.skipped.length },
      }
    } catch (error) {
      const reason = String(error?.message ?? error)
      return {
        done: false,
        warning: reason,
        hypothesis: ingested.items.length > 0
          ? `I read ${ingested.items.length} result(s) from ${sources.length} source(s).`
          : 'No language model answered, so here is a manual starting point.',
        question: 'What should it show?',
        options: [
          { label: 'A digest', value: 'digest' },
          { label: 'Open questions', value: 'open' },
          { label: 'Recent activity', value: 'recent' },
        ],
        ingested: { items: ingested.items.length, skipped: ingested.skipped.length },
      }
    }
  }

  /**
   * Write a complete bundle from a form specification.
   * @param {Record<string, any>} spec - the studio form.
   * @returns {Promise<Record<string, unknown>>} the written bundle description.
   */
  async function generate(spec) {
    const kind = KINDS.includes(spec?.kind) ? spec.kind : 'panel'
    const slug = slugify(spec?.name) || (kind === 'mcp' ? 'mcp-source' : 'data-panel')
    const packageName = `@local/${slug}`
    const title = typeof spec?.title === 'string' && spec.title.trim().length > 0 ? spec.title.trim() : titleFromSlug(slug)
    const description = typeof spec?.description === 'string' && spec.description.trim().length > 0
      ? spec.description.trim()
      : kind === 'mcp'
        ? `Connects the ${slug} MCP server to DeepSeek Harness.`
        : `Shows aggregated information from ${(spec?.sources ?? []).length || 0} MCP source(s).`

    let snapshot = { items: [], skipped: [], truncated: false, query: '', collectedAt: new Date().toISOString() }
    if (kind === 'panel') {
      const collected = await collect({ sources: spec?.sources ?? [], query: spec?.query ?? '' })
      snapshot = { ...collected, query: typeof spec?.query === 'string' ? spec.query : '', collectedAt: new Date().toISOString() }
    }

    const dir = path.join(outputDir(spec?.outDir), slug)
    const marker = path.join(dir, MARKER)
    const populated = fs.existsSync(dir)
      && fs.readdirSync(dir).some(entry => entry !== MARKER && entry !== 'locale')
    if (populated && !fs.existsSync(marker) && spec?.overwrite !== true) {
      const error = new Error(`${dir} already holds files that Plugin studio did not write`)
      // @ts-expect-error - structured failure code read by the browser half
      error.code = 'not-generated'
      throw error
    }
    fs.mkdirSync(path.join(dir, 'locale'), { recursive: true })

    const writes = []
    /**
     * Write one file into the generated bundle.
     * @param {string} relative - path relative to the bundle root.
     * @param {string} contents - file contents.
     * @returns {void}
     */
    const write = (relative, contents) => {
      const target = path.join(dir, relative)
      fs.mkdirSync(path.dirname(target), { recursive: true })
      fs.writeFileSync(target, contents, 'utf8')
      writes.push({ path: relative, size: Buffer.byteLength(contents) })
    }

    const data = {
      slug,
      title,
      description,
      packageName,
      query: snapshot.query,
      collectedAt: snapshot.collectedAt,
      sources: [...new Set(snapshot.items.map(item => item.source))],
      skipped: snapshot.skipped,
      truncated: snapshot.truncated,
      items: snapshot.items,
      slot: SLOTS.includes(spec?.slot) ? spec.slot : 'dock',
    }

    if (kind === 'panel') {
      write('package.json', JSON.stringify({
        name: packageName,
        version: '1.0.0',
        private: true,
        description: title,
        type: 'module',
        exports: {
          '.': './index.js',
          './client': './client.js',
          './locale/*.json': './locale/*.json',
          './icon': './icon.svg',
        },
        files: ['index.js', 'client.js', 'data.json', 'cordis.patch.yml', 'locale/*.json', 'icon.svg'],
        dsh: {
          bundle: { patch: './cordis.patch.yml' },
          client: {
            platform: 'web',
            immediately: true,
            inject: ['@deepseek-ai/dsh-client-ui-conversation'],
          },
        },
      }, null, 2) + '\n')
      write('cordis.patch.yml', `- insert:\n    - id: ${slug}\n      name: '${packageName}'\n`)
      write('index.js', readTemplate('panel.index.js'))
      write('client.js', fillTemplate(readTemplate('panel.client.js'), {
        PKG: packageName,
        ID: slug,
        DATA: embedJson(data),
      }))
      write('data.json', JSON.stringify(data, null, 2) + '\n')
      write('locale/en.json', JSON.stringify({
        meta: { title, description },
      }, null, 2) + '\n')
      write('icon.svg', readTemplate('icon.svg'))
    } else {
      const hasCommand = typeof spec?.command === 'string' && spec.command.trim().length > 0
      const hasUrl = typeof spec?.url === 'string' && spec.url.trim().length > 0
      const transport = spec?.transport === 'stdio' || (hasCommand && !hasUrl) ? 'stdio' : 'streamable-http'
      const argv = Array.isArray(spec?.args) && spec.args.length > 0
        ? spec.args.map(String)
        : splitCommand(spec?.command)
      const headers = {}
      if (spec?.headers && typeof spec.headers === 'object') {
        for (const [name, value] of Object.entries(spec.headers)) {
          if (typeof value === 'string' && name.trim().length > 0) headers[name.trim()] = value
        }
      }
      const oauthRef = spec?.auth === 'oauth' ? tokenRefFor(slug) : ''
      if (oauthRef.length > 0) {
        headers.Authorization = `Bearer ${'${credential:' + oauthRef + '}'}`
      }
      const token = oauthRef.length > 0 ? '' : typeof spec?.token === 'string' ? spec.token.trim() : ''
      if (token.length > 0) {
        const headerName = typeof spec?.headerName === 'string' && spec.headerName.trim().length > 0
          ? spec.headerName.trim()
          : 'Authorization'
        const isAuthorization = /^authorization$/i.test(headerName)
        const prefixed = /^(bearer|basic|token)\s/i.test(token)
        headers[headerName] = isAuthorization && !prefixed ? `Bearer ${token}` : token
      }
      const usesTemplates = oauthRef.length > 0
      const config = transport === 'stdio'
        ? {
            serverName: slug,
            transport: 'stdio',
            command: argv[0] ?? '',
            args: argv.slice(1),
            failOnStartupError: spec?.failOnStartupError === true,
          }
        : {
            serverName: slug,
            transport: 'streamable-http',
            url: String(spec?.url ?? '').trim(),
            headers,
            expandTemplates: usesTemplates,
            failOnStartupError: spec?.failOnStartupError === true,
          }
      if (transport === 'stdio' && config.command.length === 0) throw new Error('A stdio MCP server needs a command')
      if (transport !== 'stdio' && config.url.length === 0) throw new Error('An HTTP MCP server needs a URL')
      write('package.json', JSON.stringify({
        name: packageName,
        version: '1.0.0',
        private: true,
        description: title,
        type: 'module',
        exports: {
          './locale/*.json': './locale/*.json',
          './icon': './icon.svg',
        },
        files: ['cordis.patch.yml', 'locale/*.json', 'icon.svg'],
        dsh: { bundle: { patch: './cordis.patch.yml' } },
      }, null, 2) + '\n')
      write('cordis.patch.yml', [
        '- insert:',
        `    - id: ${slug}-mcp`,
        "      name: '@deepseek-ai/dsh-mcp-client'",
        '      config:',
        `        serverName: ${slug}`,
        `        transport: ${config.transport}`,
        ...(transport === 'stdio'
          ? [`        command: ${JSON.stringify(config.command)}`, `        args: ${JSON.stringify(config.args)}`]
          : [`        url: ${JSON.stringify(config.url)}`]),
        ...(Object.keys(headers).length > 0
          ? ['        headers:', ...Object.entries(headers).map(([headerName, headerValue]) =>
            `          ${JSON.stringify(headerName)}: ${JSON.stringify(headerValue)}`)]
          : []),
        ...(usesTemplates ? ['        expandTemplates: true'] : []),
        `        failOnStartupError: ${config.failOnStartupError === true}`,
        '',
      ].join('\n'))
      write('locale/en.json', JSON.stringify({
        meta: { title, description },
      }, null, 2) + '\n')
      write('icon.svg', readTemplate('icon.svg'))
      {
        const studioState = readState()
        studioState.sources = {
          ...(studioState.sources ?? {}),
          [slug]: {
            slug,
            transport,
            url: transport === 'stdio' ? '' : config.url,
            command: transport === 'stdio' ? [config.command, ...config.args].join(' ') : '',
            mode: oauthRef.length > 0 ? 'oauth' : Object.keys(headers).length > 0 ? 'header' : 'none',
            headers: oauthRef.length > 0 ? {} : headers,
            updatedAt: new Date().toISOString(),
          },
        }
        if (oauthRef.length > 0) {
          studioState.auth = { ...(studioState.auth ?? {}), [slug]: { mode: 'oauth', credential: oauthRef } }
        }
        writeState(studioState)
      }
    }

    write('README.md', [
      `# ${title}`,
      '',
      description,
      '',
      kind === 'panel'
        ? `Generated by Plugin Studio from ${data.sources.length} MCP source(s) at ${data.collectedAt}. `
          + `The card renders below the composer (${data.slot === 'turn' ? 'after each turn' : 'at all times'}).`
        : `Generated by Plugin Studio: a configuration-only bundle that connects the ${slug} MCP server.`,
      '',
      `- Package: \`${packageName}\``,
      `- Row id: \`${slug}\``,
      kind === 'panel' ? '- Re-run Plugin Studio to refresh the embedded snapshot.' : '',
      '',
    ].filter(line => line !== '').join('\n'))

    fs.writeFileSync(marker, `${JSON.stringify({
      generatedBy: '@local/plugin-studio',
      kind,
      slug,
      generatedAt: new Date().toISOString(),
    }, null, 2)}\n`, 'utf8')

    return {
      kind,
      slug,
      packageName,
      title,
      dir,
      files: writes,
      sources: data.sources,
      items: kind === 'panel' ? data.items : [],
      skipped: data.skipped,
      truncated: data.truncated,
      collectedAt: data.collectedAt,
    }
  }

  /**
   * Install a generated bundle through the Plugin Manager.
   * @param {string} dir - absolute bundle directory.
   * @returns {Promise<Record<string, unknown>>} the observed change result.
   */
  async function install(dir) {
    const manager = ctx.get('pluginManager')
    if (!manager) throw new Error('The Plugin Manager is unavailable in this profile')
    if (typeof dir !== 'string' || dir.trim().length === 0) throw new Error('No bundle directory was supplied')
    const target = path.resolve(dir.trim())
    if (!fs.existsSync(path.join(target, 'package.json'))) {
      throw new Error(`${target} does not contain a package.json`)
    }
    const result = await manager.installBundle(target)
    let source = ''
    try {
      const manifest = JSON.parse(fs.readFileSync(path.join(target, 'package.json'), 'utf8'))
      source = String(manifest?.name ?? '').split('/').pop() ?? ''
    } catch {
      source = ''
    }
    let reachable = null
    if (source.length > 0) {
      const deadline = Date.now() + REACHABILITY_WAIT_MS
      while (Date.now() < deadline) {
        if (toolsForServer(source).length > 0) {
          reachable = true
          break
        }
        await new Promise(resolve => setTimeout(resolve, 700))
      }
      if (reachable === null) reachable = false
    }
    return {
      source,
      reachable,
      changed: result?.changed === true,
      application: String(result?.application ?? 'unknown'),
      stage: String(result?.stage ?? ''),
      target: String(result?.target ?? target),
      version: result?.version ?? null,
      warnings: Array.isArray(result?.warnings) ? result.warnings : [],
      error: result?.error ?? null,
    }
  }

  // ---------------------------------------------------------------- OAuth ---
  /** Live OAuth attempts, keyed by source slug. */
  const oauthFlows = new Map()
  /** Values that must never appear in a response, log, or error message. */
  const secrets = new Set()

  /**
   * Remember one secret for redaction.
   * @param {unknown} value - token or verifier.
   * @returns {void}
   */
  function keepSecret(value) {
    if (typeof value === 'string' && value.length >= 8) secrets.add(value)
  }

  /** @returns {Record<string, any>} the plugin's credential store facade, when mounted. */
  function credentialStore() {
    return ctx.get('credentials')
  }

  /**
   * Durable record that groups one source's authorization facts.
   * @param {string} slug - source slug.
   * @returns {string} credential record key.
   */
  function grantKey(slug) {
    return `plugin-studio/oauth-${slug}`
  }

  /**
   * Read the stored grant facts for one source.
   * @param {string} slug - source slug.
   * @returns {Promise<Record<string, any> | undefined>} payload, when present.
   */
  async function readGrant(slug) {
    const store = credentialStore()
    if (!store) return undefined
    try {
      const record = await store.readRecord(grantKey(slug))
      const payload = record && typeof record === 'object' ? record.payload : undefined
      return payload && typeof payload === 'object' ? payload : undefined
    } catch {
      return undefined
    }
  }

  /**
   * Write the stored grant facts for one source.
   * @param {string} slug - source slug.
   * @param {Record<string, any>} payload - facts to keep.
   * @returns {Promise<void>} resolution after the record is committed.
   */
  async function writeGrant(slug, payload) {
    const store = credentialStore()
    if (!store) throw new Error('No credential store is available in this profile')
    await store.modifyRecord(grantKey(slug), async () => ({ kind: 'grant', payload }))
  }

  /**
   * Store one source's bearer token in the credential key table, where the MCP client
   * resolves it from `${credential:...}` without it ever entering configuration.
   * @param {string} slug - source slug.
   * @param {string} token - bearer token.
   * @returns {Promise<void>} resolution after the key is stored.
   */
  async function storeAccessToken(slug, token) {
    const store = credentialStore()
    if (!store) throw new Error('No credential store is available in this profile')
    keepSecret(token)
    await store.set(tokenRefFor(slug), token)
  }

  /**
   * Whether the token key for one source currently holds a value.
   * @param {string} slug - source slug.
   * @returns {Promise<boolean>} configured state.
   */
  async function hasAccessToken(slug) {
    const store = credentialStore()
    if (!store) return false
    try {
      const info = await store.describe(tokenRefFor(slug))
      return info?.configured === true
    } catch {
      return false
    }
  }

  /**
   * Remove one source's stored token and grant facts.
   * @param {string} slug - source slug.
   * @returns {Promise<void>} resolution after removal.
   */
  async function clearCredentials(slug) {
    const store = credentialStore()
    if (!store) return
    try {
      await store.unset(tokenRefFor(slug))
    } catch {
      // a missing key is already the desired state
    }
    try {
      await store.modifyRecord(grantKey(slug), async () => undefined)
    } catch {
      // a missing record is already the desired state
    }
  }

  /**
   * Discover the OAuth metadata a 401 challenge points at.
   * @param {string} targetUrl - MCP endpoint URL.
   * @returns {Promise<Record<string, any>>} discovery result.
   */
  async function discoverOauth(targetUrl) {
    const url = String(targetUrl ?? '').trim()
    if (!/^https?:\/\//i.test(url)) throw new Error('The server URL must start with http:// or https://')
    const probe = await fetch(url, {
      method: 'GET',
      headers: { accept: 'application/json, text/event-stream' },
      redirect: 'manual',
      signal: AbortSignal.timeout(15000),
    })
    const challenge = parseChallenge(probe.headers.get('www-authenticate'))
    if (probe.status !== 401 && probe.status !== 403) {
      return {
        requiresAuth: false,
        status: probe.status,
        challenge,
        detail: `The endpoint answered ${probe.status} without demanding authorization`,
      }
    }
    const endpoint = new URL(url)
    const prmCandidates = []
    if (challenge.resource_metadata) prmCandidates.push(challenge.resource_metadata)
    prmCandidates.push(`${endpoint.origin}${WELL_KNOWN_PRM}${endpoint.pathname}`)
    prmCandidates.push(`${endpoint.origin}${WELL_KNOWN_PRM}`)
    let prm
    let prmUrl = ''
    let lastError = ''
    for (const candidate of [...new Set(prmCandidates)]) {
      try {
        const result = await fetchJson(candidate)
        if (result.status === 200 && result.json && typeof result.json === 'object') {
          prm = result.json
          prmUrl = candidate
          break
        }
        lastError = `${candidate} answered ${result.status}`
      } catch (error) {
        lastError = `${candidate}: ${redactOut(error?.message ?? error, secrets)}`
      }
    }
    if (!prm) throw new Error(`Protected-resource metadata was not readable (${lastError || 'no candidate'})`)
    const resource = String(prm.resource ?? url)
    const issuers = Array.isArray(prm.authorization_servers) ? prm.authorization_servers.map(String) : []
    if (issuers.length === 0) throw new Error('Protected-resource metadata names no authorization server')
    const issuer = issuers[0]
    const issuerOrigin = new URL(issuer).origin
    const issuerPath = new URL(issuer).pathname.replace(/\/$/, '')
    const candidates = [
      `${issuerOrigin}${WELL_KNOWN_AS}${issuerPath}`,
      `${issuerOrigin}${WELL_KNOWN_AS}`,
      `${issuer}${WELL_KNOWN_AS}`,
      `${issuerOrigin}/.well-known/openid-configuration`,
    ]
    let meta
    let asUrl = ''
    for (const candidate of [...new Set(candidates)]) {
      try {
        const result = await fetchJson(candidate)
        if (result.status === 200 && result.json && result.json.token_endpoint && result.json.authorization_endpoint) {
          meta = result.json
          asUrl = candidate
          break
        }
      } catch {
        // try the next well-known location
      }
    }
    if (!meta) throw new Error('Authorization-server metadata was not readable from any well-known location')
    const methods = Array.isArray(meta.code_challenge_methods_supported) ? meta.code_challenge_methods_supported : []
    return {
      requiresAuth: true,
      resource,
      scope: challenge.scope ?? 'mcp',
      issuer: String(meta.issuer ?? issuer),
      authorizationEndpoint: String(meta.authorization_endpoint),
      tokenEndpoint: String(meta.token_endpoint),
      registrationEndpoint: meta.registration_endpoint ? String(meta.registration_endpoint) : '',
      scopesSupported: Array.isArray(meta.scopes_supported) ? meta.scopes_supported.map(String) : [],
      prmScopes: Array.isArray(prm.scopes_supported) ? prm.scopes_supported.map(String) : [],
      pkce: methods.includes('S256') ? 'S256' : '',
      grantTypes: Array.isArray(meta.grant_types_supported) ? meta.grant_types_supported.map(String) : [],
      tokenAuthMethods: Array.isArray(meta.token_endpoint_auth_methods_supported)
        ? meta.token_endpoint_auth_methods_supported.map(String)
        : [],
      discovery: { protectedResource: prmUrl, authorizationServer: asUrl },
    }
  }

  /**
   * Register a client through RFC 7591, or report why that is impossible.
   * @param {string} registrationEndpoint - registration URL.
   * @param {string} redirectUri - loopback callback URL.
   * @param {string} scope - requested scope text.
   * @returns {Promise<{clientId?: string, clientSecret?: string, error?: string}>} registration outcome.
   */
  async function registerClient(registrationEndpoint, redirectUri, scope) {
    if (registrationEndpoint.length === 0) return { error: 'The authorization server offers no dynamic registration' }
    try {
      const result = await fetchJson(registrationEndpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          client_name: 'DeepSeek Harness Plugin Studio',
          redirect_uris: [redirectUri],
          grant_types: ['authorization_code', 'refresh_token'],
          response_types: ['code'],
          token_endpoint_auth_method: 'none',
          scope,
        }),
      }, 20000)
      if (result.status >= 200 && result.status < 300 && result.json?.client_id) {
        keepSecret(result.json.client_secret)
        return { clientId: String(result.json.client_id), clientSecret: result.json.client_secret }
      }
      return { error: `Registration was refused (${result.status}${result.json?.error ? `: ${result.json.error}` : ''})` }
    } catch (error) {
      return { error: `Registration failed: ${redactOut(error?.message ?? error, secrets)}` }
    }
  }

  /**
   * Start one browser authorization attempt.
   * @param {{name?: string, url?: string, refresh?: boolean, clientId?: string, clientSecret?: string, discover?: Record<string, any>}} input - request.
   * @returns {Promise<Record<string, unknown>>} the authorization URL and attempt facts.
   */
  async function beginOauth(input) {
    const slug = slugify(input?.name)
    if (slug.length === 0) throw new Error('Name the source before signing in')
    const existing = oauthFlows.get(slug)
    if (existing?.status === 'pending') return { state: 'pending', authorizeUrl: existing.authorizeUrl }
    const installedUrl = String(recordedSources()[slug]?.url ?? '')
    const targetUrl = String(input?.url ?? '').trim().length > 0 ? String(input.url).trim() : installedUrl
    const meta = input?.discover && typeof input.discover === 'object' && input.discover.tokenEndpoint
      ? input.discover
      : await discoverOauth(targetUrl)
    if (meta.requiresAuth === false) return { state: 'open', detail: meta.detail }
    if (meta.pkce !== 'S256') throw new Error('This authorization server does not offer PKCE S256')
    const wantsRefresh = input?.refresh !== false
    const scope = [OAUTH_SCOPES, wantsRefresh ? OAUTH_REFRESH_SCOPE : ''].filter(Boolean).join(' ')
    const { verifier, challenge } = pkcePair()
    const stateValue = base64url(crypto.randomBytes(24))
    keepSecret(verifier)
    const flow = {
      slug,
      status: 'pending',
      startedAt: Date.now(),
      state: stateValue,
      verifier,
      meta,
      scope,
      timer: null,
      server: null,
      authorizeUrl: '',
      redirectUri: '',
      clientId: '',
      clientSecret: '',
      error: '',
    }
    const listen = () => new Promise((resolve, reject) => {
      const server = http.createServer((req, res) => {
        void handleCallback(flow, req, res)
      })
      server.once('error', reject)
      server.listen(0, '127.0.0.1', () => resolve(server))
    })
    const server = await listen()
    flow.server = server
    const port = server.address().port
    flow.redirectUri = `http://127.0.0.1:${port}/callback`
    const explicit = typeof input?.clientId === 'string' ? input.clientId.trim() : ''
    if (explicit.length > 0) {
      flow.clientId = explicit
      flow.clientSecret = typeof input?.clientSecret === 'string' ? input.clientSecret : ''
      keepSecret(flow.clientSecret)
    } else {
      const registration = await registerClient(meta.registrationEndpoint, flow.redirectUri, scope)
      if (registration.clientId) {
        flow.clientId = registration.clientId
        flow.clientSecret = registration.clientSecret ?? ''
      } else {
        await closeFlowServer(flow)
        const error = new Error(`${registration.error}. Enter a client id for this server, or register one manually.`)
        throw error
      }
    }
    const authorize = new URL(meta.authorizationEndpoint)
    authorize.searchParams.set('response_type', 'code')
    authorize.searchParams.set('client_id', flow.clientId)
    authorize.searchParams.set('redirect_uri', flow.redirectUri)
    authorize.searchParams.set('scope', scope)
    authorize.searchParams.set('state', stateValue)
    authorize.searchParams.set('code_challenge', challenge)
    authorize.searchParams.set('code_challenge_method', 'S256')
    authorize.searchParams.set('resource', meta.resource)
    flow.authorizeUrl = authorize.toString()
    flow.timer = setTimeout(() => {
      if (flow.status === 'pending') {
        flow.status = 'expired'
        flow.error = 'The sign-in attempt expired'
        void closeFlowServer(flow)
      }
    }, OAUTH_TIMEOUT_MS)
    flow.timer.unref?.()
    oauthFlows.set(slug, flow)
    return {
      state: 'pending',
      authorizeUrl: flow.authorizeUrl,
      redirectUri: flow.redirectUri,
      expiresAt: new Date(flow.startedAt + OAUTH_TIMEOUT_MS).toISOString(),
      scope,
      resource: meta.resource,
      issuer: meta.issuer,
      clientId: flow.clientId,
      registered: explicit.length === 0,
    }
  }

  /**
   * Close one attempt's loopback listener and clear its timer.
   * @param {Record<string, any>} flow - attempt state.
   * @returns {Promise<void>} resolution after the listener closes.
   */
  async function closeFlowServer(flow) {
    if (flow.timer) clearTimeout(flow.timer)
    flow.timer = null
    const server = flow.server
    flow.server = null
    if (!server) return
    await new Promise(resolve => server.close(() => resolve(undefined)))
  }

  /**
   * Answer the OAuth redirect: validate state, exchange the code, store the token.
   * @param {Record<string, any>} flow - attempt state.
   * @param {import('node:http').IncomingMessage} req - callback request.
   * @param {import('node:http').ServerResponse} res - callback response.
   * @returns {Promise<void>} resolution after the browser answer is written.
   */
  async function handleCallback(flow, req, res) {
    const finish = async (status, title, detail) => {
      send(status, title, detail)
      await closeFlowServer(flow)
    }
    const send = (status, title, detail) => {
      const body = `<!doctype html><meta charset="utf-8"><title>${title}</title>`
        + '<body style="font:14px -apple-system,system-ui,sans-serif;padding:40px;line-height:1.5">'
        + `<h1 style="font-size:16px">${title}</h1><p>${detail}</p></body>`
      res.statusCode = status
      res.setHeader('content-type', 'text/html; charset=utf-8')
      res.setHeader('cache-control', 'no-store')
      res.end(body)
    }
    try {
      const requestUrl = new URL(req.url ?? '/', 'http://127.0.0.1')
      if (requestUrl.pathname !== '/callback') {
        send(404, 'Not found', 'This address only answers the sign-in callback.')
        return
      }
      const returnedState = requestUrl.searchParams.get('state') ?? ''
      if (returnedState !== flow.state) {
        flow.status = 'error'
        flow.error = 'The callback state did not match the attempt'
        await finish(400, 'Sign-in failed', 'The callback state did not match this sign-in attempt, so nothing was stored.')
        return
      }
      const failure = requestUrl.searchParams.get('error')
      if (failure) {
        flow.status = 'error'
        flow.error = `${failure}${requestUrl.searchParams.get('error_description') ? `: ${requestUrl.searchParams.get('error_description')}` : ''}`
        await finish(400, 'Sign-in declined', 'No credential was stored.')
        return
      }
      const code = requestUrl.searchParams.get('code') ?? ''
      if (code.length === 0) {
        flow.status = 'error'
        flow.error = 'The callback carried no authorization code'
        await finish(400, 'Sign-in failed', 'The callback carried no authorization code.')
        return
      }
      const form = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: flow.redirectUri,
        client_id: flow.clientId,
        code_verifier: flow.verifier,
        resource: flow.meta.resource,
      })
      if (flow.clientSecret) form.set('client_secret', flow.clientSecret)
      const result = await fetchJson(flow.meta.tokenEndpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
        body: form.toString(),
      }, 20000)
      if (result.status !== 200 || !result.json?.access_token) {
        flow.status = 'error'
        flow.error = `The token endpoint refused the exchange (${result.status}${result.json?.error ? `: ${result.json.error}` : ''})`
        await finish(400, 'Sign-in failed', 'The token exchange was refused. Nothing was stored.')
        return
      }
      keepSecret(result.json.access_token)
      keepSecret(result.json.refresh_token)
      await storeAccessToken(flow.slug, String(result.json.access_token))
      await writeGrant(flow.slug, {
        mode: 'oauth',
        issuer: flow.meta.issuer,
        resource: flow.meta.resource,
        tokenEndpoint: flow.meta.tokenEndpoint,
        clientId: flow.clientId,
        clientSecret: flow.clientSecret,
        scope: flow.scope,
        refreshToken: result.json.refresh_token ? String(result.json.refresh_token) : '',
        expiresAt: Date.now() + Number(result.json.expires_in ?? 3600) * 1000,
        updatedAt: new Date().toISOString(),
      })
      const state = readState()
      state.auth = { ...(state.auth ?? {}), [flow.slug]: { mode: 'oauth', issuer: flow.meta.issuer, clientId: flow.clientId } }
      state.sources = {
        ...(state.sources ?? {}),
        [flow.slug]: {
          ...(state.sources?.[flow.slug] ?? {}),
          slug: flow.slug,
          transport: 'streamable-http',
          url: flow.meta.resource,
          mode: 'oauth',
          issuer: flow.meta.issuer,
          updatedAt: new Date().toISOString(),
        },
      }
      writeState(state)
      flow.status = 'authorized'
      flow.error = ''
      flow.finishedAt = Date.now()
      await finish(200, 'Signed in', 'The credential is stored. You can close this tab and return to DeepSeek Harness.')
    } catch (error) {
      flow.status = 'error'
      flow.error = redactOut(error?.message ?? error, secrets)
      await closeFlowServer(flow)
      send(500, 'Sign-in failed', 'The exchange failed. Nothing was stored.')
    }
  }

  /**
   * Pending state of one source's sign-in attempt.
   * @param {string} slug - source slug.
   * @returns {Record<string, unknown>} public attempt facts.
   */
  function oauthStatus(slug) {
    const flow = oauthFlows.get(slug)
    if (!flow) return { state: 'idle' }
    const base = { state: flow.status, authorizeUrl: flow.authorizeUrl }
    if (flow.status === 'error' || flow.status === 'expired') base.error = redactOut(flow.error, secrets)
    return base
  }

  /**
   * Abandon one source's pending attempt.
   * @param {string} slug - source slug.
   * @returns {Promise<Record<string, unknown>>} the settled state.
   */
  async function cancelOauth(slug) {
    const flow = oauthFlows.get(slug)
    if (!flow) return { state: 'idle' }
    if (flow.status === 'pending') {
      flow.status = 'cancelled'
      flow.error = ''
    }
    await closeFlowServer(flow)
    return oauthStatus(slug)
  }

  /**
   * Refresh one source's access token with its stored refresh token.
   * @param {string} slug - source slug.
   * @returns {Promise<Record<string, unknown>>} refresh outcome.
   */
  async function refreshOauth(slug) {
    const grant = await readGrant(slug)
    if (!grant?.refreshToken || !grant?.tokenEndpoint) {
      return { state: 'sign-in-required', error: 'No refresh token is stored' }
    }
    const form = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: String(grant.refreshToken),
      client_id: String(grant.clientId ?? ''),
    })
    if (grant.clientSecret) form.set('client_secret', String(grant.clientSecret))
    if (grant.resource) form.set('resource', String(grant.resource))
    try {
      const result = await fetchJson(String(grant.tokenEndpoint), {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
        body: form.toString(),
      }, 20000)
      if (result.status !== 200 || !result.json?.access_token) {
        const flow = oauthFlows.get(slug) ?? { slug, status: 'error', error: '' }
        flow.status = 'error'
        flow.error = `Refresh was refused (${result.status}${result.json?.error ? `: ${result.json.error}` : ''}); sign in again`
        oauthFlows.set(slug, flow)
        return { state: 'sign-in-required', error: flow.error }
      }
      keepSecret(result.json.access_token)
      keepSecret(result.json.refresh_token)
      await storeAccessToken(slug, String(result.json.access_token))
      await writeGrant(slug, {
        ...grant,
        refreshToken: result.json.refresh_token ? String(result.json.refresh_token) : String(grant.refreshToken),
        expiresAt: Date.now() + Number(result.json.expires_in ?? 3600) * 1000,
        updatedAt: new Date().toISOString(),
      })
      const flow = oauthFlows.get(slug)
      if (flow) {
        flow.status = 'authorized'
        flow.error = ''
      }
      return { state: 'authorized', expiresAt: new Date(Date.now() + Number(result.json.expires_in ?? 3600) * 1000).toISOString() }
    } catch (error) {
      return { state: 'sign-in-required', error: redactOut(error?.message ?? error, secrets) }
    }
  }

  /**
   * Schedule a refresh shortly before one token expires.
   * @param {string} slug - source slug.
   * @returns {Promise<void>} resolution after scheduling.
   */
  async function scheduleRefresh(slug) {
    const grant = await readGrant(slug)
    if (!grant?.refreshToken || !grant?.expiresAt) return
    const delay = Math.max(5000, Number(grant.expiresAt) - Date.now() - 60000)
    const timer = setTimeout(() => { void refreshOauth(slug) }, delay)
    timer.unref?.()
  }

  /**
   * Prompt text that names every connected MCP source with an exact mention token.
   * Built from the live registry and the probe cache, never from credentials.
   * @returns {string} markdown block, one bullet per source, or empty when there are none.
   */
  function sourcePromptText() {
    const recorded = recordedSources()
    const live = serverRows()
    const names = [...new Set([...Object.keys(recorded), ...live.map(row => row.name)])].sort()
    if (names.length === 0) return ''
    const lines = [
      '## MCP sources',
      '',
      'These MCP servers are exposed as ordinary tools named `mcp__<source>__<tool>`.',
      'Mention a source by its exact token, such as `mcp:data-panel`.',
      '',
    ]
    for (const name of names) {
      const row = live.find(entry => entry.name === name)
      const tools = (row?.tools ?? toolsForServer(name)).map(tool => tool.name)
      const cached = probeCache.get(name)
      const state = tools.length > 0 ? 'connected' : cached?.state ?? 'not verified'
      const url = recorded[name]?.url ? ` · ${recorded[name].url}` : ''
      lines.push(`- ${name} — mention \`mcp:${name}\`${url} · ${state}${tools.length > 0 ? ` · tools: ${tools.join(', ')}` : ''}`)
    }
    lines.push('', 'If a source is listed as sign-in required, its tools fail until the user refreshes the connection.')
    return lines.join('\n')
  }

  /**
   * The studio's whole view for the page.
   * @returns {Promise<Record<string, unknown>>} sources with installation, authentication, and connection facts.
   */
  async function snapshot() {
    const state = readState()
    const recorded = recordedSources()
    const live = serverRows()
    const names = new Set([
      ...live.map(row => row.name),
      ...Object.keys(recorded),
      ...Object.keys(state.enabled ?? {}),
    ])
    const sources = []
    for (const name of [...names].sort()) {
      const row = live.find(entry => entry.name === name)
      const record = recorded[name]
      const auth = authModeOf({ ...(record ?? {}), slug: name })
      const mode = auth.mode
      const tokenSet = await hasAccessToken(name)
      const grant = await readGrant(name)
      const flow = oauthFlows.get(name)
      const cached = probeCache.get(name)
      const tools = row?.tools ?? []
      const connection = tools.length > 0
        ? 'connected'
        : Boolean(record) && cached
          ? cached.state
          : record ? 'connecting' : 'unknown'
      sources.push({
        name,
        installed: Boolean(record),
        configured: row?.configured ?? Boolean(record),
        state: row?.state ?? (record ? 'installed' : 'unknown'),
        toolCount: row?.toolCount ?? tools.length,
        lastError: row?.lastError ?? null,
        enabled: usableSource(name, tools.length),
        disabled: readState().disabled?.[name] === true,
        url: String(record?.url ?? ''),
        tools,
        auth: {
          mode,
          tokenSet,
          expiresAt: grant?.expiresAt ? new Date(Number(grant.expiresAt)).toISOString() : '',
          canRefresh: Boolean(grant?.refreshToken),
          flow: flow?.status ?? 'idle',
          error: flow && (flow.status === 'error' || flow.status === 'expired') ? redactOut(flow.error, secrets) : '',
        },
        connection,
        connectionDetail: cached?.detail ?? '',
      })
    }
    return {
      sources,
      skill: skillState,
      plugins: await localPlugins(),
      prompt: sourcePromptText(),
      outDir: outputDir(),
      draft: state.draft,
      kinds: KINDS,
      slots: SLOTS,
      stateFile: stateFile(),
      oauthScopes: { base: OAUTH_SCOPES, refresh: OAUTH_REFRESH_SCOPE },
      limits: {
        maxSources: MAX_SOURCES,
        maxToolsPerSource: MAX_TOOLS_PER_SOURCE,
        maxItems: MAX_ITEMS,
      },
    }
  }

  /**
   * Save the enabled state of one MCP source.
   * @param {{name?: string, enabled?: boolean}} input - source toggle.
   * @returns {Record<string, unknown>} the fresh snapshot.
   */
  function setSource(input) {
    const serverName = typeof input?.name === 'string' ? input.name : ''
    if (serverName.length === 0) throw new Error('No source name was supplied')
    const state = readState()
    if (input?.enabled === true) state.enabled[serverName] = true
    else delete state.enabled[serverName]
    writeState(state)
    return snapshot()
  }

  /**
   * Persist the page's draft form and the chosen output directory.
   * @param {{draft?: Record<string, unknown>, outDir?: string}} input - draft payload.
   * @returns {Record<string, unknown>} the fresh snapshot.
   */
  function saveDraft(input) {
    const state = readState()
    if (input?.draft && typeof input.draft === 'object') state.draft = input.draft
    if (typeof input?.outDir === 'string' && input.outDir.trim().length > 0) state.outDir = input.outDir.trim()
    writeState(state)
    return snapshot()
  }

  /**
   * Probe one MCP server and report its tools.
   * @param {{name?: string}} input - server name.
   * @returns {Promise<Record<string, unknown>>} probe outcome.
   */
  async function probe(input) {
    const manager = ctx.get('mcpManager')
    const serverName = typeof input?.name === 'string' ? input.name : ''
    if (serverName.length === 0) throw new Error('No source name was supplied')
    if (!manager) {
      const tools = toolsForServer(serverName)
      if (tools.length === 0) throw new Error('No MCP manager is available in this profile')
      return { ok: true, toolNames: tools.map(tool => tool.name), truncated: false, durationMs: 0, serverInfo: null }
    }
    const result = await manager.probe(serverName, { timeoutMs: PROBE_TIMEOUT_MS }).catch((error) => {
      const tools = toolsForServer(serverName)
      if (tools.length > 0) return { ok: true, toolNames: tools.map(tool => tool.name), truncated: false, durationMs: 0 }
      throw error
    })
    if (result?.ok === true) {
      return {
        ok: true,
        toolNames: Array.isArray(result.toolNames) ? result.toolNames : [],
        truncated: result.truncated === true,
        durationMs: Number(result.durationMs ?? 0),
        serverInfo: result.serverInfo ?? null,
      }
    }
    return {
      ok: false,
      stage: String(result?.stage ?? 'connect'),
      message: String(result?.message ?? 'The probe failed'),
      durationMs: Number(result?.durationMs ?? 0),
    }
  }

  /**
   * Dispatch one browser request to a studio operation.
   * @param {string} method - operation name.
   * @param {Record<string, unknown>} args - operation arguments.
   * @returns {Promise<unknown>} the operation's value.
   */
  async function dispatch(method, args) {
    switch (method) {
      case 'snapshot':
        return snapshot()
      case 'oauth/discover':
        return discoverOauth(args?.url)
      case 'oauth/begin':
        return beginOauth(args)
      case 'oauth/status':
        return oauthStatus(slugify(args?.name))
      case 'oauth/cancel':
        return cancelOauth(slugify(args?.name))
      case 'oauth/refresh':
        return refreshOauth(slugify(args?.name))
      case 'oauth/signout':
        await cancelOauth(slugify(args?.name))
        await clearCredentials(slugify(args?.name))
        return { state: 'signed-out' }
      case 'source/setEnabled': {
        const manager = ctx.get('pluginManager')
        if (!manager || typeof manager.setBundleEnabled !== 'function') {
          throw new Error('This profile cannot change bundle activation from a plugin')
        }
        const slug = String(args?.name ?? '').trim()
        if (!/^[a-z0-9-]+$/.test(slug)) throw new Error('Unknown source name')
        const wantEnabled = args?.enabled !== false
        const result = await manager.setBundleEnabled(`@local/${slug}`, wantEnabled)
        if (typeof manager.setPluginEnabled === 'function') {
          try {
            await manager.setPluginEnabled(`include:${slug}`, wantEnabled)
          } catch (error) {
            /* the bundle may contribute no such entry; the layer change still applies */
          }
        }
        const applied = result?.application !== 'failed'
        if (applied) {
          const studioState = readState()
          studioState.disabled = { ...(studioState.disabled ?? {}) }
          if (wantEnabled) delete studioState.disabled[slug]
          else studioState.disabled[slug] = true
          writeState(studioState)
        }
        return {
          changed: result?.changed === true,
          application: result?.application ?? 'applied',
          enabled: wantEnabled,
          error: result?.error
            ? [result.error.code, result.error.diagnostic].filter(Boolean).join(' — ')
            : null,
          warnings: Array.isArray(result?.warnings) ? result.warnings.slice(0, 5) : [],
        }
      }
      case 'source/remove': {
        const manager = ctx.get('pluginManager')
        if (!manager || typeof manager.removeBundle !== 'function') {
          throw new Error('This profile cannot remove bundles from a plugin')
        }
        const slug = String(args?.name ?? '').trim()
        if (!/^[a-z0-9-]+$/.test(slug)) throw new Error('Unknown panel name')
        const result = await manager.removeBundle(`@local/${slug}`)
        if (result?.application !== 'failed') {
          const studioState = readState()
          delete (studioState.sources ?? {})[slug]
          delete (studioState.disabled ?? {})[slug]
          delete (studioState.enabled ?? {})[slug]
          delete (studioState.auth ?? {})[slug]
          writeState(studioState)
        }
        return {
          changed: result?.changed === true,
          application: result?.application ?? 'applied',
          error: result?.error
            ? [result.error.code, result.error.diagnostic].filter(Boolean).join(' — ')
            : null,
          warnings: Array.isArray(result?.warnings) ? result.warnings.slice(0, 5) : [],
        }
      }
      case 'sources/reconnect': {
        const manager = ctx.get('pluginManager')
        if (!manager || typeof manager.setBundleEnabled !== 'function') {
          throw new Error('This profile cannot re-apply bundles from a plugin')
        }
        const names = Array.isArray(args?.names) && args.names.length > 0
          ? args.names.map(entry => String(entry)).filter(name => /^[a-z0-9-]+$/.test(name))
          : Object.keys(recordedSources())
        const results = []
        for (const slug of names) {
          try {
            await manager.setBundleEnabled(`@local/${slug}`, false)
            const applied = await manager.setBundleEnabled(`@local/${slug}`, true)
            results.push({
              name: slug,
              application: applied?.application ?? 'unknown',
              warnings: Array.isArray(applied?.warnings) ? applied.warnings.slice(0, 3) : [],
            })
          } catch (error) {
            results.push({ name: slug, application: 'failed', warnings: [String(error?.message ?? error)] })
          }
        }
        return { results }
      }
      case 'check':
        return checkConnection(args)
      case 'setSource':
        return setSource(args)
      case 'saveDraft':
        return saveDraft(args)
      case 'probe':
        return probe(args)
      case 'collect':
        return collect(args)
      case 'ask':
        return ask(args)
      case 'generate':
        return generate(args)
      case 'install':
        return install(args?.dir)
      default:
        throw new Error(`Unknown studio operation: ${method}`)
    }
  }

  // Chat and voice entry point: the same operations the page uses, documented for the model.
  ctx.inject(['skills'], (skillCtx) => {
    const origin = (() => {
      try {
        return String(skillCtx.get('webServer')?.getOrigin() ?? '')
      } catch {
        return ''
      }
    })()
    const endpoint = origin.length > 0 ? `${origin}${ROUTE}` : `http://127.0.0.1:<port>${ROUTE}`
    const content = [
      '# Plugin studio',
      '',
      'Drive the running Plugin studio instead of writing a bundle by hand: add an MCP source, collect',
      'information from the enabled ones, or generate and install a data panel. Everything is one local',
      'JSON endpoint; nothing here edits profile files.',
      '',
      `Endpoint: POST \`${endpoint}\` with \`{"method": "...", "args": {...}}\`.`,
      'Every answer is `{"ok": true, "value": ...}` or `{"ok": false, "error": {"code", "message"}}`.',
      origin.length > 0 ? '' : 'If that origin is wrong, take the app window address from the user or the runtime context.',
      '',
      '## Methods',
      '',
      '| method | args | returns |',
      '|---|---|---|',
      '| `snapshot` | none | sources (name, state, toolCount, enabled), outDir, stateFile |',
      '| `setSource` | `{name, enabled}` | fresh snapshot |',
      '| `probe` | `{name}` | `{ok, toolNames}` for one server |',
      '| `collect` | `{sources: string[], query?: string}` | `{items: [{source, tool, text}], skipped, truncated}` |',
      '| `generate` | panel: `{kind: "panel", name, sources, query?, slot?: "dock" \\| "turn", title?, description?}`; MCP: `{kind: "mcp", name, url?}` or `{kind: "mcp", name, command}` | `{dir, files, items, skipped}` |',
      '| `install` | `{dir}` | `{changed, application, target, version, warnings, error}` |',
      '',
      '## Recipes',
      '',
      'Add an MCP server the user names (HTTP):',
      '',
      '```sh',
      `curl -sS -X POST '${endpoint}' -H 'content-type: application/json' \\`,
      '  -d \'{"method":"generate","args":{"kind":"mcp","name":"linear","title":"Linear","url":"https://…/mcp"}}\'',
      `curl -sS -X POST '${endpoint}' -H 'content-type: application/json' \\`,
      '  -d \'{"method":"install","args":{"dir":"<dir from the previous answer>"}}\'',
      '```',
      '',
      'For a local server use `"command": "<executable> <args>"` instead of `url`.',
      '',
      'Build a panel from the enabled sources and install it:',
      '',
      '```sh',
      `curl -sS -X POST '${endpoint}' -H 'content-type: application/json' \\`,
      '  -d \'{"method":"generate","args":{"kind":"panel","name":"open-questions","title":"Open questions","sources":["linear"],"query":"open","slot":"dock"}}\'',
      '```',
      'then `install` with the returned `dir`.',
      '',
      '## Rules',
      '',
      '- `collect` and `generate` only read sources the user enabled; enable one with `setSource` first.',
      '- Tools whose required inputs the studio cannot fill from the query are reported in `skipped`;',
      '  say so rather than pretending the panel is complete.',
      '- A generated panel embeds the snapshot: regenerating is how it refreshes.',
      '- `install` is the Plugin Manager; report `application` (`applied`, `restart-required`, `failed`) verbatim.',
      '- Report the bundle directory and item count from the tool result; do not invent them.',
    ].join('\n')
    skillCtx.effect(() => {
      try {
        const disposer = skillCtx.skills.register({
          name: 'plugin-studio',
          description: 'Add an MCP source to DeepSeek Harness, aggregate several sources, or generate and install a data panel that renders in the conversation. Use when the user asks to add an MCP server or tool source, or to build a panel showing what their sources say.',
          whenToUse: 'the user wants a new MCP source, aggregated information from MCP servers, or a generated plugin panel',
          source: 'runtime',
          content,
        })
        skillState = 'registered'
        return disposer
      } catch (error) {
        skillState = `failed: ${String(error?.message ?? error)}`
        console.error(`plugin-studio: skill registration failed: ${skillState}`)
        return () => {}
      }
    }, 'plugin-studio: chat skill')
  })

  ctx.inject(['webServer'], (serverCtx) => {
    serverCtx.effect(() => serverCtx.webServer.register({
      kind: 'prefix',
      path: ROUTE,
      /**
       * Answer one studio request.
       * @param {import('node:http').IncomingMessage} req - request.
       * @param {import('node:http').ServerResponse} res - response.
       * @returns {Promise<void>} resolution after the response is sent.
       */
      handler: async (req, res) => {
        let origin = ''
        try {
          origin = serverCtx.webServer.getOrigin()
        } catch {
          origin = ''
        }
        const requestOrigin = typeof req.headers.origin === 'string' ? req.headers.origin : ''
        if (requestOrigin.length > 0 && origin.length > 0 && requestOrigin !== origin) {
          sendJson(res, 403, { ok: false, error: { code: 'forbidden', message: 'Cross-origin request refused' } })
          return
        }
        if (req.method === 'GET') {
          try {
            sendJson(res, 200, { ok: true, value: await snapshot() })
          } catch (error) {
            sendJson(res, 500, { ok: false, error: { code: 'snapshot', message: String(error?.message ?? error) } })
          }
          return
        }
        if (req.method !== 'POST') {
          res.setHeader('allow', 'GET, POST')
          sendJson(res, 405, { ok: false, error: { code: 'method', message: 'Only GET and POST are supported' } })
          return
        }
        try {
          const body = await readBody(req)
          const method = typeof body?.method === 'string' ? body.method : ''
          const value = await dispatch(method, body?.args && typeof body.args === 'object' ? body.args : {})
          sendJson(res, 200, { ok: true, value })
        } catch (error) {
          const message = String(error?.message ?? error)
          const code = typeof error?.code === 'string' ? error.code : 'failed'
          sendJson(res, 200, { ok: false, error: { code, message } })
        }
      },
    }), 'plugin-studio: browser bridge')
  })
}
