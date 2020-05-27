import Ajv, { ValidateFunction } from 'ajv'
import CustomMetaSchema from './custom-meta-schema.json'

const CLASSES = {
    file: ['filename', 'content']
}

export default class UISchema {
    schema: any
    keys: string[]
    ajv: any
    validator: ValidateFunction
    constructor(jsonSchema: any) {
        this.schema = { ...jsonSchema }
        this.keys = Object.keys(this.schema.properties || {})
        this.ajv = new Ajv({ allErrors: true, meta: CustomMetaSchema })
        this.ajv.addKeyword('instanceof', {
            compile: function (schema: string, parentSchema: any) {
                //@ts-ignore
                const objectProperties: string[] = CLASSES[schema]
                if (
                    !objectProperties.every(function (property) {
                        return Object.prototype.hasOwnProperty.call(parentSchema.properties || {}, property)
                    })
                ) {
                    throw new Error(`Invalid schema! Object instanceof ${schema} is missing one of the fields: ${objectProperties}`)
                }
                return function () {
                    return true
                }
            }
        })
        this.validator = this.ajv.compile({
            ...this.schema,
            $schema: 'https://github.com/ascentcore/react-schema-form/tree/master/src/custom-meta-schema.json#'
        })
    }

    validate(data: any): boolean | PromiseLike<any> {
        return this.validator(data)
    }
}
