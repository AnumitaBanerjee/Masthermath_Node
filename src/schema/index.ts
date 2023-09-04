import { join } from 'path'
import { readFileSync } from 'fs'
import { buildSchema } from 'graphql'

const schema = readFileSync(join(process.cwd(), 'src/schema/schema.gql')).toString()

export default buildSchema(schema)
