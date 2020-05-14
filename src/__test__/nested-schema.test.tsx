import React from 'react';
import Schema from './schemas/nested-schema.json'
import { SchemaForm } from '..'
import { mount, ReactWrapper } from 'enzyme';
import { getComponentTree, populateTree, getSubmitButton } from './test-utils';

describe('NestedSchemaTests', () => {

    it('initializes correctly', () => {
        const tree = getComponentTree(mount(<SchemaForm schema={Schema} data={{ tasks: [{ title: 'test', done: true }] }} />))
        console.log(tree)
    })

    it('initializes initializes array correctly', () => {
        const data = {
            tasks: [{}, {}]
        }
        const tree = getComponentTree(mount(<SchemaForm schema={Schema} data={data} />))

        expect(['Task list title*', 'Title*', 'Task details', 'Done?', 'Title*', 'Task details', 'Done?'])
            .toEqual(tree.map(item => item.labelText))
    })

    it('perform field update', () => {
        const data = {
            tasks: [{}]
        }
        let valData;
        const validate = (data: any) => valData = data
        const component: ReactWrapper = mount(<SchemaForm schema={Schema} onValid={validate} data={data} />)
        let tree = getComponentTree(component)
        const submitButton = getSubmitButton(component).last()

        submitButton.simulate('click')
        tree = getComponentTree(component)
        expect(['required', 'required', 0, 0]).toEqual(tree.map(i => i.errorText))
        
        populateTree(tree, ['List Title', 'Task Title', 'Task Details', true])
        
        submitButton.simulate('click')

        expect(valData).toEqual({
            title: 'List Title',
            tasks: [
                { title: 'Task Title', details: 'Task Details' }
            ]
        })


    })

})
