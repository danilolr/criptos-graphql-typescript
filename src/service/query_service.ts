import { GraphQLSchema } from "graphql/type"
const { graphql } = require('graphql')

export class QueryService {

    private schema: GraphQLSchema

    setSchema(schema: GraphQLSchema) {
        this.schema = schema
    }

    async queryRecord(query: string): Promise<QueryResult> {
        const r = await graphql(this.schema, query)
        if (r.data) {
            return { ok: true, record: r.data[Object.keys(r.data)[0]][0] }
        } else {
            return { ok: false }
        }
    }

}

export interface QueryResult {
    ok: boolean
    record?: any
}