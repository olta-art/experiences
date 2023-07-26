// The helper.js module contains common utilities shared across the app.
// NB: Undecided whether this is needed in the helper module.
export const URL = self.URL || window.webkitURL

export const SUBGRAPH_URL = "https://api.thegraph.com/subgraphs/name/olta-art/olta-editions-mumbai"
export const POLL_RATE = 10000
// Got this using `self.crypto.randomUUID()`.
export const SEPARATOR = "81ce6396-1893-4cd3-8d32-e82ec62016b5"


// Helps delay certain calls when polling for changes on the subgraph.
export function sleep(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay))
}

// Helps with string to HTML coversion.
export function ranger(s = "") {
  return document.createRange().createContextualFragment(s)
}

// Helps run API queries.
export function downloader(timeout = 100 * 1000) {
  return async (url = "", options = {}) => {
    // Guard against unresponsive calls.
    const controller = new AbortController()

    const timer = setTimeout(() => {
      clearTimeout(timer)
      controller.abort()
    }, timeout)

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        ...options,
      })

      const data = await response.json()

      if (response.ok) {
        return data
      } else {
        // NB: Double check API calls do populate
        // an errors array in the response.
        const e = data?.errors?.pop()
        const m = e.message ?? "fetch failed"

        throw new Error(m)
      }
    } catch (e) {
      // Forward to caller, JSON parsing errors end up here too.
      throw e
    }
  }
}

export async function queryfetcher(url, query) {
  const download = downloader(20000)
  const options = {
    // Example query input:
    // query {
    //   tokenContract(id: "xoxoxoxoxo") {
    //     tokens {
    //       editionNumber
    //       owner {
    //         id
    //       }
    //     }
    //   }
    // }
    body: JSON.stringify({ query }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "post",
  }

  try {
    const response = await download(url, options)

    response?.errors?.forEach((e) => {
      throw new Error(e.message)
    })

    return response?.data
  } catch (e) {
    throw e
  }
}

export function decode(s = "") {
  return String(s)
    .replaceAll("\\t", "\t")
    .replaceAll("\\r", "\r")
    .replaceAll("\\n", "\n")
    .replaceAll("\\f", "\f")
    .replaceAll("\\b", "\b")
    .replaceAll("\\/", "\/")
    .replaceAll(`\\"`, `\"`)
    .replaceAll(`\\\\`, `\\`)
}
