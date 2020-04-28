import Ajv from 'ajv'

export default class UISchema {
    constructor(jsonSchema) {
        this.schema = { ...jsonSchema }
        this.keys = Object.keys(this.schema.properties)
    }

    validate(data) {
        if (!this.validator) {
            this.ajv = new Ajv({ allErrors: true })
            this.validator = this.ajv.compile(this.schema)
        }

        return this.validator(data)
    }
}
