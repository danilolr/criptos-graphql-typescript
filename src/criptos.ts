import express from "express"
import expressGraphql from "express-graphql"
import { makeExecutableSchema } from "graphql-tools"
import { typeDefs as s } from "./gen/schema"
import { typeDefs as schemaCustom } from './schema-custom'
import { resolvers as resolversGerados } from "./gen/resolvers"
import { resolvers as resolversCustom } from './resolvers-custom'
import cors from "cors"
import * as bodyParser from "body-parser"
import * as formData from "express-form-data"
import { merge } from 'lodash'
import { container } from "./service/container"
import { QueryService } from "./service/query_service"


import { adicionaCustomHandlers } from './handlers-custom'

const app = express()

app.use(bodyParser.json())
app.use(formData.parse())
app.use(formData.stream())


const schema = makeExecutableSchema({ typeDefs: [s, schemaCustom], resolvers: merge({}, resolversGerados, resolversCustom) })

const queryService: QueryService = container.cradle.queryService
queryService.setSchema(schema)

app.use(cors())

app.use('/graphql', expressGraphql({
    schema: schema,
    graphiql: true,
}))

adicionaCustomHandlers(app)

app.listen(4016, () => console.log('criptos GraphQL Server Now Running On localhost:4016/graphql'))
