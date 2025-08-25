// The query.js module contains GQL query body generating helper
// functions against Olta's editions subgraph.

export const projects = [
  "0xb90604158a300de4fc136af92620755882b8fa1b", // "Fragmented Existence"
  "0x510da17477baa0a23858c59e9bf80b8d8ad1b6ee", // "FIELDS"
  "0xe94100850ee7507dd57eb1ba67dc0600b18122df", // "Morphed Radiance"
  "0x6d24ce4c32e556313b431fb156edf2060680a998", // "Peer into the Flow"
  // TODO: add Laureano's
  // TODO: add Eoghan's 
]

// Ask for multiple contracts.
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

