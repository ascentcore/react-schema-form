import React from 'react'
import SchemaWithRef from './schemas/nested-schema-object-ref.json'
import SchemaWithProperties from './schemas/nested-schema-object-properties.json'
import { SchemaForm } from '..'
import { mount } from 'enzyme'
import { getComponentTree } from './test-utils'

describe('NestedSchemaObjectTests', () => {
    function performTestsOnNestedSchema(schema: object) {
        it('initializes correctly', () => {
            const tree = getComponentTree(mount(<SchemaForm schema={schema} />))
            expect(tree.length).toEqual(3)
            expect(['First Name', 'Last Name*', 'Age']).toEqual(tree.map((item) => item.labelText))
        })

        it('initializes correctly with values', () => {
            const data = {
                user: {
                    firstName: 'fn',
                    lastName: 'ln',
                    age: 13
                }
            }
            const tree = getComponentTree(mount(<SchemaForm schema={schema} data={data} />))
            expect(['fn', 'ln', '13']).toEqual(tree.map((item) => item.inputValue))
        })

        it('expect to validate data', () => {
            const onSubmit = () => {
                console.log(onSubmit)
            }

            const data = {
                user: {
                    firstName: 'test'
                }
            }

            const form = mount(<SchemaForm schema={schema} data={data} onSubmit={onSubmit} />)
            let tree = getComponentTree(form)

            form.find('button').simulate('click')

            tree = getComponentTree(form)

            expect([0, 'Field is required', 0]).toEqual(tree.map((i) => i.errorText))
        })
    }
    describe('Nested schema defined directly inside properties filed', () => {
        performTestsOnNestedSchema(SchemaWithProperties)
    })

    describe('Nested schema defined with ref', () => {
        performTestsOnNestedSchema(SchemaWithRef)
    })
})
