import React from 'react'
import Schema from './schemas/basic-schema.json'
import { SchemaForm } from '..'
import { mount } from 'enzyme'
import { getComponentTree, getByCSSSelector } from './test-utils'

describe('BasicSchemaTests', () => {
    it('initializes correctly', () => {
        const tree = getComponentTree(mount(<SchemaForm schema={Schema} />))
        expect(tree.length).toEqual(5)
        expect(['First Name*', 'Last Name*', 'Age', 'Type*', 'Agree with TOC']).toEqual(
            tree.map((item) => item.labelText)
        )
    })

    it('initializes correctly with values', () => {
        const data = {
            firstName: 'fn',
            lastName: 'ln',
            age: 13,
            type: 'NW',
            agree: true,
            phoneNumbers: ['0755443322']
        }
        const tree = getComponentTree(mount(<SchemaForm schema={Schema} data={data} />))
        expect(['fn', 'ln', '13', 0, 'true', '0755443322']).toEqual(tree.map((item) => item.inputValue))
    })

    it('expect to validate data', () => {
        const validate = () => {
            console.log(validate)
        }

        const data = {
            firstName: 'test'
        }

        const form = mount(<SchemaForm schema={Schema} data={data} onValid={validate} />)
        let tree = getComponentTree(form)

        const submitButton = getByCSSSelector(form, 'button').last()
        submitButton.simulate('click')

        tree = getComponentTree(form)

        expect([0, 'required', 0, 'required', 0]).toEqual(tree.map((i) => i.errorText))
    })
})
