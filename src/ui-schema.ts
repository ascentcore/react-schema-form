import Ajv from 'ajv'

export default class UISchema {
    schema: any
    keys: string[]
    ajv: any
    validator: ((data: any) => any)
    constructor(jsonSchema: any) {
        this.schema = { ...jsonSchema }
        this.keys = Object.keys(this.schema.properties)
        this.ajv = new Ajv({ allErrors: true })
        this.validator = this.ajv.compile(this.schema)
    }

    validate(data: any) {
        return this.validator(data)
    }
}
