// The query.js module contains GQL query body generating helper
// functions against Olta's editions subgraph.

// Only Peer into the Flow needs real-time blockchain data
export const PEER_INTO_FLOW_ID = "0x6d24ce4c32e556313b431fb156edf2060680a998";

// Simplified query for just Peer into the Flow
export function getPeerIntoFlowQuery() {
  return `
    query {
      projects(where: { id: "${PEER_INTO_FLOW_ID}" }) {
        id
        name
        editionSize
        creator {
          profile {
            name
          }
        }
        description
        lastAddedVersion {
          animation {
            url
          }
        }
      }
    }`
}

// Legacy function - keeping for backward compatibility but not needed
export function getProjects(options = {}) {
  const {
    projects = []
  } = options

  return `
    query {
      projects(
        ${projects?.length ? `where: { id_in: ${JSON.stringify(projects)} }` : ""},
        orderBy: createdAtTimestamp,
        orderDirection: desc
      ) {
        id
        implementation
        createdAtTimestamp
        createdAtBlockNumber
        editionSize
        name
        symbol
        creator {
          id
          profile{
            name
          }
        }
        description
        lastAddedVersion {
          id
          image {
            url
          }
          animation {
            url
          }
          label
          createdAtTimestamp
          createdAtBlockNumber
        }
      }
      _meta {
        block {
          number
        }
      }
    }`
}

