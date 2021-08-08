import { BigNumber } from 'bignumber.js'

/**
 * Test if value is an integer
 *
 * @param value Value to be tested if it is an integer
 *
 * @returns True if the passed in value is integer
 */
export function isInteger(value: unknown): value is BigNumber | bigint {
  return (BigNumber.isBigNumber(value) && value.isInteger()) || typeof value === 'bigint'
}

/**
 *Convert value into a BigNumber if not already
 *
 * @param value Value to be converted
 *
 * @throws {TypeError} if the value is not convertible to a BigNumber
 *
 * @returns BigNumber - but it may still be NaN or Infinite
 */
export function makeBigNumber(value: BigNumber | BigInt | number | string): BigNumber | never {
  if (BigNumber.isBigNumber(value)) return value

  if (typeof value === 'string') return new BigNumber(value)

  if (typeof value === 'bigint') return new BigNumber(value.toString())

  // FIXME: bee-js still returns some values as numbers and even outside of SAFE INTEGER bounds
  if (typeof value === 'number' /* && Number.isSafeInteger(value)*/) return new BigNumber(value)

  throw new TypeError(`Not a BigNumber or BigNumber convertible value. Type: ${typeof value} value: ${value}`)
}

function uuid2(len = 16, radix?: number) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
  const uuid = []
  let i
  radix = radix || chars.length

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)]
  } else {
    // rfc4122, version 4 form
    let r

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
    uuid[14] = '4'

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16)
        uuid[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r]
      }
    }
  }

  return uuid.join('')
}

export type NodeApi = {
  key: string
  nodeName: string
  apiHost: string
  debugApiHost: string
}

export function getNodeApiList(): NodeApi[] {
  const nodeApi: NodeApi[] = []
  try {
    const arr: NodeApi[] = JSON.parse(localStorage.node_api)
    arr.forEach(({ key, nodeName, apiHost, debugApiHost }, index) => {
      if (key) {
        const node: NodeApi = {
          key,
          nodeName: nodeName ? nodeName.toString().trim() : `node${index}`,
          apiHost: apiHost ? apiHost.toString().trim() : '',
          debugApiHost: debugApiHost ? debugApiHost.toString().trim() : '',
        }

        nodeApi.push(node)
      }
    })
  } catch (_) {
    ///
  }

  return nodeApi
}

export function getNodeApi(): NodeApi {
  let nodeApi: NodeApi = {
    key: '',
    nodeName: '',
    apiHost: process.env.REACT_APP_ANT_HOST || 'http://localhost:1633',
    debugApiHost: process.env.REACT_APP_ANT_DEBUG_HOST || 'http://localhost:1635',
  }
  const nodeApiList: NodeApi[] = getNodeApiList()
  const key = localStorage.acitve_node_api_key || ''

  for (let i = 0; i < nodeApiList.length; i++) {
    if (nodeApiList[i].key === key) {
      nodeApi = nodeApiList[i]
      break
    }
  }

  if (nodeApiList.length > 0 && !nodeApi.key) {
    nodeApi = nodeApiList[0]
    localStorage.acitve_node_api_key = nodeApi.key
  }

  return nodeApi
}

export function updateNodeApi({
  key,
  nodeName,
  apiHost,
  debugApiHost,
}: {
  key?: string
  nodeName: string
  apiHost: string
  debugApiHost: string
}): NodeApi {
  const nodeApiList: NodeApi[] = getNodeApiList()

  const data: NodeApi = {
    key: key || '',
    nodeName: nodeName.trim() ? nodeName.trim() : `node${nodeApiList.length + 1}`,
    apiHost: apiHost.trim(),
    debugApiHost: debugApiHost.trim(),
  }

  if (key) {
    for (let i = 0; i < nodeApiList.length; i++) {
      if (nodeApiList[i].key === key) {
        nodeApiList[i] = data
        break
      }
    }
  } else {
    data.key = uuid2()
    nodeApiList.push(data)
  }

  localStorage.node_api = JSON.stringify(nodeApiList)
  localStorage.acitve_node_api_key = data.key

  return data
}

export function removeNodeApi(key: string): void {
  const nodeApiList: NodeApi[] = getNodeApiList()

  for (let i = 0; i < nodeApiList.length; i++) {
    if (nodeApiList[i].key === key) {
      nodeApiList.splice(i, 1)
      break
    }
  }

  localStorage.node_api = JSON.stringify(nodeApiList)
}
