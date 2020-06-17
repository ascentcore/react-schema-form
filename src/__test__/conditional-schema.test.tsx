import React from 'react'
import Schema from './schemas/conditionals/basic-conditional.json'
import { SchemaForm } from '..'
import { mount } from 'enzyme'
import { getComponentTree, getByCSSSelector } from './test-utils'

describe('BasicSchemaTests', () => {
    it('initializes correctly without data', () => {
        const tree = getComponentTree(mount(<SchemaForm schema={Schema} />))
        expect(tree.length).toEqual(2)
        expect(['Has car', 'Other means of transportation']).toEqual(tree.map((item) => item.labelText))
    })

    it('initializes correctly with data', () => {
        const data = { account: { car: true } }
        const tree = getComponentTree(mount(<SchemaForm schema={Schema} data={data} />))
        expect(tree.length).toEqual(2)
        expect(['Has car', 'Car Plate']).toEqual(tree.map((item) => item.labelText))
    })

    it('alters schema on checkbox check', () => {
        const form = mount(<SchemaForm schema={Schema} />)
        const checkbox = getByCSSSelector(form, 'input[type="checkbox"]').first()
        checkbox.simulate('change', {
            target: {
                checked: true
            }
        })
        const tree = getComponentTree(form)
        expect(tree.length).toEqual(2)
        expect(['Has car', 'Car Plate']).toEqual(tree.map((item) => item.labelText))
    })

    it('deletes data which no longer matches schema', () => {
        let valData
        const onSubmit = (data: any) => (valData = data)
        const form = mount(<SchemaForm schema={Schema} onSubmit={onSubmit} />)
        const otherMeansInput = getByCSSSelector(form, 'input[type="text"]').first()
        otherMeansInput.simulate('change', {
            target: {
                value: 'bike'
            }
        })
        const submitButton = getByCSSSelector(form, 'button').last()
        submitButton.simulate('click')

        expect(valData).toEqual({ account: { car: false, otherMeansOfTransportation: 'bike' } })

        const checkbox = getByCSSSelector(form, 'input[type="checkbox"]').first()
        checkbox.simulate('change', {
            target: {
                checked: true
            }
        })

        submitButton.simulate('click')

        expect(valData).toEqual({ account: { car: true } })
    })
})
