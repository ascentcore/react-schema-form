import React from 'react'
import BasicSchema from './schemas/conditionals/basic-conditional.json'
import NestedIfSchema from './schemas/conditionals/nested-if.json'
import NestedThenElseSchema from './schemas/conditionals/nested-then-else.json'
import LeafSchema from './schemas/conditionals/leaf-conditional.json'
import AttributeSchema from './schemas/conditionals/attribute-conditional.json'
import MultipleSchema from './schemas/conditionals/multiple-conditional.json'
import DependentConditional from './schemas/conditionals/dependent-conditional.json'
import { SchemaForm } from '..'
import { mount } from 'enzyme'
import { getComponentTree, getByCSSSelector } from './test-utils'

describe('BasicSchemaTests', () => {
    it('initializes correctly without data', () => {
        const tree = getComponentTree(mount(<SchemaForm schema={BasicSchema} />))
        expect(tree.length).toEqual(3)
        expect(['Has car', 'Is registered', 'Other means of transportation']).toEqual(
            tree.map((item) => item.labelText)
        )
    })

    it('initializes correctly with data', () => {
        const data = { account: { car: true, registered: true } }
        const tree = getComponentTree(mount(<SchemaForm schema={BasicSchema} data={data} />))
        expect(tree.length).toEqual(3)
        expect(['Has car', 'Is registered', 'Car Plate']).toEqual(tree.map((item) => item.labelText))
    })

    it('alters schema on checkbox check', () => {
        const form = mount(<SchemaForm schema={BasicSchema} />)
        const checkboxCar = getByCSSSelector(form, 'input[type="checkbox"]').first()
        checkboxCar.simulate('change', {
            target: {
                checked: true
            }
        })
        let tree = getComponentTree(form)
        expect(tree.length).toEqual(3)
        expect(['Has car', 'Is registered', 'Other means of transportation']).toEqual(
            tree.map((item) => item.labelText)
        )

        const checkboxRegistered = getByCSSSelector(form, 'input[type="checkbox"]').at(1)
        checkboxRegistered.simulate('change', {
            target: {
                checked: true
            }
        })
        tree = getComponentTree(form)
        expect(['Has car', 'Is registered', 'Car Plate']).toEqual(tree.map((item) => item.labelText))

        checkboxCar.simulate('change', {
            target: {
                checked: false
            }
        })
        tree = getComponentTree(form)
        expect(['Has car', 'Is registered', 'Other means of transportation']).toEqual(
            tree.map((item) => item.labelText)
        )
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

        expect(valData).toEqual({ account: { car: false, registered: false, otherMeansOfTransportation: 'bike' } })

        const checkboxCar = getByCSSSelector(form, 'input[type="checkbox"]').first()
        checkboxCar.simulate('change', {
            target: {
                checked: true
            }
        })

        const checkboxRegistered = getByCSSSelector(form, 'input[type="checkbox"]').at(1)
        checkboxRegistered.simulate('change', {
            target: {
                checked: true
            }
        })

        submitButton.simulate('click')

        expect(valData).toEqual({ account: { car: true, registered: true } })
    })
})

describe('NestedThenElseSchemaTests', () => {
    it('initializes correctly without data', () => {
        const tree = getComponentTree(mount(<SchemaForm schema={NestedThenElseSchema} />))
        expect(tree.length).toEqual(2)
        expect(['prop1', 'prop4']).toEqual(tree.map((item) => item.labelText))
    })

    it('initializes correctly with data', () => {
        const data = { account: { prop1: true } }
        const tree = getComponentTree(mount(<SchemaForm schema={NestedThenElseSchema} data={data} />))
        expect(tree.length).toEqual(2)
        expect(['prop1', 'prop3']).toEqual(tree.map((item) => item.labelText))
    })

    it('alters schema on checkbox check', () => {
        const form = mount(<SchemaForm schema={NestedThenElseSchema} />)
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
        const form = mount(<SchemaForm schema={NestedThenElseSchema} onSubmit={onSubmit} />)
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

describe('AttributeSchemaTests', () => {
    it('initializes correctly without data', () => {
        const form = mount(<SchemaForm schema={AttributeSchema} />)
        let tree = getComponentTree(form)
        expect(tree.length).toEqual(3)
        expect(['street_address', 'country', 'postal_code']).toEqual(tree.map((item) => item.labelText))

        const postalCode = getByCSSSelector(form, 'input[type="text"]').last()
        postalCode.simulate('change', {
            target: {
                value: 'text'
            }
        })

        const submitButton = getByCSSSelector(form, 'button').last()
        submitButton.simulate('click')

        tree = getComponentTree(form)

        expect([0, 0, 'Field does not match pattern ([0-9]{5}(-[0-9]{4})?)']).toEqual(tree.map((i) => i.errorText))
    })

    it('alters schema on enum selection', () => {
        const form = mount(<SchemaForm schema={AttributeSchema} />)
        const select = getByCSSSelector(form, 'select').first()
        select.simulate('change', {
            target: {
                value: 'United States of America'
            }
        })
        const tree = getComponentTree(form)
        expect(tree.length).toEqual(3)
        expect(['street_address', 'country', 'postal_code']).toEqual(tree.map((item) => item.labelText))
    })

    it('applies property attributes depending on conditional', () => {
        const data = { country: 'United States of America' }
        const form = mount(<SchemaForm schema={AttributeSchema} data={data} />)
        const postalCode = getByCSSSelector(form, 'input[type="text"]').last()
        postalCode.simulate('change', {
            target: {
                value: 'text'
            }
        })
        const submitButton = getByCSSSelector(form, 'button').last()
        submitButton.simulate('click')

        const tree = getComponentTree(form)

        expect([0, 0, 'Field does not match pattern ([0-9]{5}(-[0-9]{4})?)']).toEqual(tree.map((i) => i.errorText))
    })

    it('changes property attributes depending on conditional', () => {
        const form = mount(<SchemaForm schema={AttributeSchema} />)
        const select = getByCSSSelector(form, 'select').first()
        select.simulate('change', {
            target: {
                value: 'Canada'
            }
        })
        const postalCode = getByCSSSelector(form, 'input[type="text"]').last()
        postalCode.simulate('change', {
            target: {
                value: 'text'
            }
        })
        const submitButton = getByCSSSelector(form, 'button').last()
        submitButton.simulate('click')

        const tree = getComponentTree(form)

        expect([0, 0, 'Field does not match pattern ([A-Z][0-9][A-Z] [0-9][A-Z][0-9])']).toEqual(
            tree.map((i) => i.errorText)
        )
    })
})

describe('NestedIfSchemaTests', () => {
    it('initializes correctly without data', () => {
        const tree = getComponentTree(mount(<SchemaForm schema={NestedIfSchema} />))
        expect(tree.length).toEqual(2)
        expect(['Name', 'Location']).toEqual(tree.map((item) => item.labelText))
    })

    it('initializes correctly with data', () => {
        const data = { owner: { location: 'N' } }
        const tree = getComponentTree(mount(<SchemaForm schema={NestedIfSchema} data={data} />))
        expect(tree.length).toEqual(3)
        expect(['Name', 'Location', 'Has boat']).toEqual(tree.map((item) => item.labelText))
    })

    it('alters schema on checkbox check', () => {
        const form = mount(<SchemaForm schema={NestedIfSchema} />)
        const location = getByCSSSelector(form, 'select').first()
        location.simulate('change', {
            target: {
                value: 'N'
            }
        })
        const tree = getComponentTree(form)
        expect(tree.length).toEqual(3)
        expect(['Name', 'Location', 'Has boat']).toEqual(tree.map((item) => item.labelText))
    })

    it('deletes data which no longer matches schema', () => {
        let valData
        const onSubmit = (data: any) => (valData = data)
        const form = mount(<SchemaForm schema={NestedIfSchema} onSubmit={onSubmit} />)
        let location = getByCSSSelector(form, 'select').first()
        location.simulate('change', {
            target: {
                value: 'N'
            }
        })
        const boat = getByCSSSelector(form, 'input[type="checkbox"]').last()
        boat.simulate('change', {
            target: {
                checked: true
            }
        })
        const submitButton = getByCSSSelector(form, 'button').last()
        submitButton.simulate('click')

        expect(valData).toEqual({ owner: { location: 'N', boat: true } })

        location = getByCSSSelector(form, 'select').first()
        location.simulate('change', {
            target: {
                value: 'E'
            }
        })

        submitButton.simulate('click')

        expect(valData).toEqual({ owner: { location: 'E' } })
    })
})

describe('MultipleConditionalTests', () => {
    it('initializes correctly without data', () => {
        const tree = getComponentTree(mount(<SchemaForm schema={MultipleSchema} />))
        expect(tree.length).toEqual(4)
        expect(['Name*', 'Location', 'Purchasing Year', 'Had previous owner']).toEqual(
            tree.map((item) => item.labelText)
        )
    })

    it('initializes correctly with data', () => {
        const data = { car: { second: true } }
        const tree = getComponentTree(mount(<SchemaForm schema={MultipleSchema} data={data} />))
        expect(tree.length).toEqual(6)
        expect(['Name*', 'Location', 'Purchasing Year', 'Had previous owner', 'Name*', 'Location']).toEqual(
            tree.map((item) => item.labelText)
        )
    })

    it('alters schema on checkbox check', () => {
        const form = mount(<SchemaForm schema={MultipleSchema} />)
        const year = getByCSSSelector(form, 'input[type="number"]').first()
        year.simulate('change', {
            target: {
                value: 2000
            }
        })
        const tree = getComponentTree(form)
        expect(tree.length).toEqual(6)
        expect(['Name*', 'Location', 'Purchasing Year', 'Had previous owner', 'Name*', 'Location']).toEqual(
            tree.map((item) => item.labelText)
        )
    })

    it('deletes data which no longer matches schema', () => {
        let valData
        const onSubmit = (data: any) => (valData = data)
        const form = mount(<SchemaForm schema={MultipleSchema} onSubmit={onSubmit} />)
        let second = getByCSSSelector(form, 'input[type="checkbox"]').first()
        second.simulate('change', {
            target: {
                checked: true
            }
        })
        const location = getByCSSSelector(form, 'select').last()
        location.simulate('change', {
            target: {
                value: 'N'
            }
        })
        const submitButton = getByCSSSelector(form, 'button').last()
        submitButton.simulate('click')

        expect(valData).toEqual({ car: { second: true, year: 2020, previous: { location: 'N' } } })

        second = getByCSSSelector(form, 'input[type="checkbox"]').first()
        second.simulate('change', {
            target: {
                checked: false
            }
        })

        submitButton.simulate('click')

        expect(valData).toEqual({ car: { second: false, year: 2020 } })
    })
})

describe('DependentConditional', () => {
    it('initializes correctly without data', () => {
        const tree = getComponentTree(mount(<SchemaForm schema={DependentConditional} />))
        expect(tree.length).toEqual(4)
        expect(['Name*', 'Location', 'Purchasing Year', 'Had previous owner']).toEqual(
            tree.map((item) => item.labelText)
        )
    })

    it('initializes correctly with data', () => {
        const data = { car: { second: true } }
        const tree = getComponentTree(mount(<SchemaForm schema={DependentConditional} data={data} />))
        expect(tree.length).toEqual(6)
        expect(['Name*', 'Location', 'Purchasing Year', 'Had previous owner', 'Name*', 'Location']).toEqual(
            tree.map((item) => item.labelText)
        )
    })

    it('alters schema on checkbox check', () => {
        const form = mount(<SchemaForm schema={DependentConditional} />)
        const second = getByCSSSelector(form, 'input[type="checkbox"]').first()
        second.simulate('change', {
            target: {
                checked: true
            }
        })
        const tree = getComponentTree(form)
        expect(tree.length).toEqual(6)
        expect(['Name*', 'Location', 'Purchasing Year', 'Had previous owner', 'Name*', 'Location']).toEqual(
            tree.map((item) => item.labelText)
        )
    })

    it('deletes data which no longer matches schema', () => {
        let valData
        const onSubmit = (data: any) => (valData = data)
        const form = mount(<SchemaForm schema={DependentConditional} onSubmit={onSubmit} />)
        let second = getByCSSSelector(form, 'input[type="checkbox"]').first()
        second.simulate('change', {
            target: {
                checked: true
            }
        })
        const location = getByCSSSelector(form, 'select').last()
        location.simulate('change', {
            target: {
                value: 'N'
            }
        })

        const boat = getByCSSSelector(form, 'input[type="checkbox"]').last()
        boat.simulate('change', {
            target: {
                checked: true
            }
        })

        const submitButton = getByCSSSelector(form, 'button').last()
        submitButton.simulate('click')

        let tree = getComponentTree(form)
        expect(tree.length).toEqual(7)
        expect([
            'Name*',
            'Location',
            'Purchasing Year',
            'Had previous owner',
            'Name*',
            'Location',
            'Has boat*'
        ]).toEqual(tree.map((item) => item.labelText))

        expect(valData).toEqual({
            car: { second: true, year: 2020, previous: { location: 'N', boat: true } },
            owner: { location: 'E' }
        })

        second = getByCSSSelector(form, 'input[type="checkbox"]').first()
        second.simulate('change', {
            target: {
                checked: false
            }
        })

        submitButton.simulate('click')

        expect(valData).toEqual({ car: { second: false, year: 2020 }, owner: { location: 'E' } })
    })
})
