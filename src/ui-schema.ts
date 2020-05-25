import Ajv, { ValidateFunction } from 'ajv'
import CustomMetaSchema from './custom-meta-schema.json'

export default class UISchema {
    schema: any
    keys: string[]
    ajv: any
    validator: ValidateFunction
    constructor(jsonSchema: any) {
        this.schema = { ...jsonSchema }
        this.keys = Object.keys(this.schema.properties || {})
        this.ajv = new Ajv({ allErrors: true, meta: CustomMetaSchema })
        this.validator = this.ajv.compile({
            ...this.schema,
            $schema: 'https://github.com/ascentcore/react-schema-form/tree/master/src/custom-meta-schema.json#'
        })
    }

    validate(data: any): boolean | PromiseLike<any> {
        return this.validator(data)
    }
}
