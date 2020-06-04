import React from 'react'
import Schema from './schemas/basic-schema.json'
import { SchemaForm } from '..'
import { mount } from 'enzyme'
import { getByCSSSelector } from './test-utils'

describe('CustomRegistryTests', () => {
    it('initializes correctly using the custom registry', () => {
        let customRegistry = {
            enum: {component: 'RadioElement'}
        }

        let form = mount(<SchemaForm schema={Schema} />)
        expect(getByCSSSelector(form, 'input').length).toEqual(4)
        expect(getByCSSSelector(form, 'select').length).toEqual(2)
        form = mount(<SchemaForm schema={Schema} config={{registry: customRegistry}}/>)
        console.log(form.html())
        expect(getByCSSSelector(form, 'input').length).toEqual(8)
        expect(getByCSSSelector(form, 'select').length).toEqual(1)
    })

    it('overwrites correctly the registry using the exceptions', () => {
        let exceptions = {
            keys: {
                'type': {component: 'RadioElement'}
            }
        }

        let form = mount(<SchemaForm schema={Schema} config={{exceptions}}/>)
        expect(getByCSSSelector(form, 'input').length).toEqual(8)
    })
})