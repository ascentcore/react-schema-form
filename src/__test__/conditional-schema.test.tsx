import React from 'react'
import BasicSchema from './schemas/conditionals/basic-conditional.json'
import NestedSchema from './schemas/conditionals/nested-conditional.json'
import LeafSchema from './schemas/conditionals/leaf-conditional.json'
import { SchemaForm } from '..'
import { mount } from 'enzyme'
import { getComponentTree, getByCSSSelector } from './test-utils'

describe('BasicSchemaTests', () => {
    it('initializes correctly without data', () => {
        const tree = getComponentTree(mount(<SchemaForm schema={BasicSchema} />))
        expect(tree.length).toEqual(2)
        expect(['Has car', 'Other means of transportation']).toEqual(tree.map((item) => item.labelText))
    })

    it('initializes correctly with data', () => {
        const data = { account: { car: true } }
        const tree = getComponentTree(mount(<SchemaForm schema={BasicSchema} data={data} />))
        expect(tree.length).toEqual(2)
        expect(['Has car', 'Car Plate']).toEqual(tree.map((item) => item.labelText))
    })

    it('alters schema on checkbox check', () => {
        const form = mount(<SchemaForm schema={BasicSchema} />)
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
        const form = mount(<SchemaForm schema={BasicSchema} onSubmit={onSubmit} />)
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

describe('NestedSchemaTests', () => {
    it('initializes correctly without data', () => {
        const tree = getComponentTree(mount(<SchemaForm schema={NestedSchema} />))
        expect(tree.length).toEqual(2)
        expect(['prop1', 'prop4']).toEqual(tree.map((item) => item.labelText))
    })

    it('initializes correctly with data', () => {
        const data = { account: { prop1: true } }
        const tree = getComponentTree(mount(<SchemaForm schema={NestedSchema} data={data} />))
        expect(tree.length).toEqual(2)
        expect(['prop1', 'prop3']).toEqual(tree.map((item) => item.labelText))
    })

    it('alters schema on checkbox check', () => {
        const form = mount(<SchemaForm schema={NestedSchema} />)
        const checkbox = getByCSSSelector(form, 'input[type="checkbox"]').first()
        checkbox.simulate('change', {
            target: {
                checked: true
            }
        })
        const tree = getComponentTree(form)
        expect(tree.length).toEqual(2)
        expect(['prop1', 'prop3']).toEqual(tree.map((item) => item.labelText))
    })

    it('deletes data which no longer matches schema', () => {
        let valData
        const onSubmit = (data: any) => (valData = data)
        const form = mount(<SchemaForm schema={NestedSchema} onSubmit={onSubmit} />)
        const prop4 = getByCSSSelector(form, 'input[type="text"]').first()
        prop4.simulate('change', {
            target: {
                value: 'prop4'
            }
        })
        const submitButton = getByCSSSelector(form, 'button').last()
        submitButton.simulate('click')

        expect(valData).toEqual({ account: { prop1: false, prop2: { prop4: 'prop4' } } })

        const checkbox = getByCSSSelector(form, 'input[type="checkbox"]').first()
        checkbox.simulate('change', {
            target: {
                checked: true
            }
        })

        submitButton.simulate('click')

        expect(valData).toEqual({ account: { prop1: true } })
    })
})

describe('LeafSchemaTests', () => {
    it('initializes correctly without data', () => {
        const tree = getComponentTree(mount(<SchemaForm schema={LeafSchema} />))
        expect(tree.length).toEqual(2)
        expect(['prop1', 'prop3']).toEqual(tree.map((item) => item.labelText))
    })

    it('initializes correctly with data', () => {
        const data = { account: { prop1: true } }
        const tree = getComponentTree(mount(<SchemaForm schema={LeafSchema} data={data} />))
        expect(tree.length).toEqual(4)
        expect(['prop1', 'prop3', 'prop1', 'prop4']).toEqual(tree.map((item) => item.labelText))
    })

    it('alters schema on checkbox check', () => {
        const form = mount(<SchemaForm schema={LeafSchema} />)
        const checkbox = getByCSSSelector(form, 'input[type="checkbox"]').first()
        checkbox.simulate('change', {
            target: {
                checked: true
            }
        })
        const tree = getComponentTree(form)
        expect(tree.length).toEqual(4)
        expect(['prop1', 'prop3', 'prop1', 'prop4']).toEqual(tree.map((item) => item.labelText))
    })

    it('deletes data which no longer matches schema', () => {
        let valData
        const onSubmit = (data: any) => (valData = data)
        const form = mount(<SchemaForm schema={LeafSchema} onSubmit={onSubmit} />)
        const prop3 = getByCSSSelector(form, 'input[type="text"]').first()
        prop3.simulate('change', {
            target: {
                value: 'prop3'
            }
        })
        const submitButton = getByCSSSelector(form, 'button').last()
        submitButton.simulate('click')

        expect(valData).toEqual({ account: { prop1: false, prop2: { prop3: 'prop3' } } })

        const checkbox = getByCSSSelector(form, 'input[type="checkbox"]').first()
        checkbox.simulate('change', {
            target: {
                checked: true
            }
        })
        const prop4 = getByCSSSelector(form, 'input[type="text"]').last()
        prop4.simulate('change', {
            target: {
                value: 'prop4'
            }
        })
        submitButton.simulate('click')

        expect(valData).toEqual({ account: { prop1: true, prop2: { prop3: 'prop3' }, prop4: 'prop4' } })

        checkbox.simulate('change', {
            target: {
                checked: false
            }
        })
        submitButton.simulate('click')

        expect(valData).toEqual({ account: { prop1: false, prop2: { prop3: 'prop3' } } })
    })
})
