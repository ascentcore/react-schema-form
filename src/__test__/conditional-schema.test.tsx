import React from 'react'
import Schema from './schemas/conditionals/basic-conditional.json'
import { SchemaForm } from '..'
import { mount } from 'enzyme'
import { getComponentTree } from './test-utils'

describe('BasicSchemaTests', () => {
    it('initializes correctly', () => {
        const tree = getComponentTree(mount(<SchemaForm schema={Schema} />))
        expect(tree.length).toEqual(2)
        expect(['Has car', 'Other means of transportation']).toEqual(
            tree.map((item) => item.labelText)
        )
    })
})
