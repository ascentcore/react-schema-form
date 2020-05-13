import UISchema from './ui-schema'

describe('UISchemaTests', () => {

    const sampleSchema: Object = {
        "title": "Person",
        "description": "Person Information",
        "required": [
            "k1",
            "k2"
        ],
        "properties": {
            "k1": {
                "type": "string",
                "title": "Key 1"
            },
            "k2": {
                "type": "integer",
                "title": "Key 2",
                "minimum": 3,
                "maximum": 10
            },
            "k3": {
                "type": "string",
                "title": "Key 3",
                "minLength": 30
            }
        }
    }

    it('initializes correctly', () => {
        const schema: UISchema = new UISchema(sampleSchema)
        expect(schema).toBeDefined()
        expect(schema.keys).toEqual(['k1', 'k2', 'k3'])
    })

    it('validates basic rules', () => {
        const schema: UISchema = new UISchema(sampleSchema)

        let result = schema.validate({})

        expect(result).toEqual(false)
        expect(schema.validator.errors?.length).toEqual(2)
        expect(schema.validator.errors![0].keyword).toEqual('required')
        expect(schema.validator.errors![1].keyword).toEqual('required')

        result = schema.validate({ k1: 12, k2: 'test' })
        expect(result).toEqual(false)
        expect(schema.validator.errors?.length).toEqual(2)
        expect(schema.validator.errors![0].keyword).toEqual('type')
        expect(schema.validator.errors![1].keyword).toEqual('type')

        result = schema.validate({ k1: 'test', k2: 4 })
        expect(result).toEqual(true)
        expect(schema.validator.errors).toEqual(null)
    })
})
