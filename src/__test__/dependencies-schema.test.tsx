import React from 'react'
import Schema from './schemas/dependencies-schema.json'
import { SchemaForm } from '..'
import { mount } from 'enzyme'
import { getComponentTree, getByCSSSelector } from './test-utils'

describe('DependenciesSchemaTests', () => {
    it('initializes correctly', () => {
        const tree = getComponentTree(mount(<SchemaForm schema={Schema} />))
        expect(tree.length).toEqual(3)
        expect(['Name', 'Age', 'Credit Card']).toEqual(
            tree.map((item) => item.labelText)
        )
    })

    it('adds required constraint upon completion', () => {
        const form = mount(<SchemaForm schema={Schema} />)
        const nameInput = getByCSSSelector(form, 'input[type="text"]').first()
        nameInput.simulate('change', {
            target: {
                value: 'Name'
            }
        })
        let tree = getComponentTree(form)
        expect(['Name', 'Age*', 'Credit Card']).toEqual(
            tree.map((item) => item.labelText)
        )

        nameInput.simulate('change', {
            target: {
                value: ''
            }
        })

        const ageInput = getByCSSSelector(form, 'input[type="number"]').at(0)
        ageInput.simulate('change', {
            target: {
                value: 22
            }
        })

        tree = getComponentTree(form)
        expect(['Name*', 'Age', 'Credit Card']).toEqual(
            tree.map((item) => item.labelText)
        )
    })

    it('adds properties upon completion', () => {
        const form = mount(<SchemaForm schema={Schema} />)
        const cardNumberInput = getByCSSSelector(form, 'input[type="number"]').at(1)
        cardNumberInput.simulate('change', {
            target: {
                value: 343
            }
        })
        let tree = getComponentTree(form)
        expect(['Name', 'Age', 'Credit Card', 'Billing Address*']).toEqual(
            tree.map((item) => item.labelText)
        )

        cardNumberInput.simulate('change', {
            target: {
                value: ''
            }
        })

        tree = getComponentTree(form)
        expect(['Name', 'Age', 'Credit Card']).toEqual(
            tree.map((item) => item.labelText)
        )
    })
})
