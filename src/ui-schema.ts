import Ajv, { ValidateFunction } from 'ajv'

export default class UISchema {
    schema: any
    keys: string[]
    ajv: any
    validator: ValidateFunction
    constructor(jsonSchema: any) {
        this.schema = { ...jsonSchema }
        this.keys = Object.keys(this.schema.properties)
        this.ajv = new Ajv({ allErrors: true })
        this.validator = this.ajv.compile(this.schema)
    }

    validate(data: any): boolean | PromiseLike<any> {
        return this.validator(data)
    }
}
