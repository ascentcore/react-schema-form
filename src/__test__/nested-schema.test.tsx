import React from 'react'
import SchemaWithProperties from './schemas/nested-schema-properties.json'
import SchemaWithRef from './schemas/nested-schema-ref.json'
import { SchemaForm } from '..'
import { mount, ReactWrapper } from 'enzyme'
import { getComponentTree, populateTree, getByCSSSelector } from './test-utils'

describe('NestedSchemaTests', () => {
    function performTestsOnNestedSchema(schema: object) {
        it('initializes correctly', () => {
            const tree = getComponentTree(
                mount(
                    <SchemaForm
                        schema={schema}
                        data={{ tasks: [{ title: 'test', done: true }] }}
                    />
                )
            )
            console.log(tree)
        })

        it('initializes initializes array correctly', () => {
            const data = {
                tasks: [{}, {}]
            }
            const tree = getComponentTree(
                mount(<SchemaForm schema={schema} data={data} />)
            )

            expect([
                'Task list title*',
                'Title*',
                'Task details',
                'Done?',
                'Title*',
                'Task details',
                'Done?'
            ]).toEqual(tree.map((item) => item.labelText))
        })

        it('perform field update', () => {
            const data = {
                tasks: [{}]
            }
            let valData
            const validate = (data: any) => (valData = data)
            const component: ReactWrapper = mount(
                <SchemaForm schema={schema} onValid={validate} data={data} />
            )
            let tree = getComponentTree(component)
            const submitButton = getByCSSSelector(component, 'button').last()

            submitButton.simulate('click')
            tree = getComponentTree(component)
            expect(['required', 'required', 0, 0]).toEqual(
                tree.map((i) => i.errorText)
            )

            populateTree(tree, [
                'List Title',
                'Task Title',
                'Task Details',
                true
            ])

            submitButton.simulate('click')

            expect(valData).toEqual({
                title: 'List Title',
                tasks: [{ title: 'Task Title', details: 'Task Details', done: false }]
            })
        })

        it('perform element removal from array', () => {
            const data = {
                title: 'List Title',
                tasks: [
                    { title: 'Task Title 1', details: 'Task Details 1' },
                    { title: 'Task Title 2', details: 'Task Details 2' }
                ]
            }
            const component: ReactWrapper = mount(
                <SchemaForm schema={schema} data={data} />
            )
            let tree = getComponentTree(component)

            let taskTitleList = tree.filter(
                (task) => task.labelText === 'Title*'
            )
            expect(taskTitleList.length).toEqual(2)
            const removeButton = getByCSSSelector(
                component,
                '.ra-remove-button'
            ).first()

            removeButton.simulate('click')

            tree = getComponentTree(component)

            taskTitleList = tree.filter((task) => task.labelText === 'Title*')
            expect(taskTitleList.length).toEqual(1)
            expect(taskTitleList[0].inputValue).toEqual('Task Title 2')
        })

        it('perform element addition in array', () => {
            const data = {
                title: 'List Title',
                tasks: [
                    { title: 'Task Title 1', details: 'Task Details 1' },
                    { title: 'Task Title 2', details: 'Task Details 2' }
                ]
            }
            const component: ReactWrapper = mount(
                <SchemaForm schema={schema} data={data} />
            )
            let tree = getComponentTree(component)

            let taskTitleList = tree.filter(
                (task) => task.labelText === 'Title*'
            )
            expect(taskTitleList.length).toEqual(2)
            const removeButton = getByCSSSelector(
                component,
                '.ra-add-button'
            ).first()

            removeButton.simulate('click')

            tree = getComponentTree(component)

            taskTitleList = tree.filter((task) => task.labelText === 'Title*')
            expect(taskTitleList.length).toEqual(3)
            expect(taskTitleList[2].inputValue).toEqual('')
        })
    }
    describe('Nested schema defined directly inside items filed', () => {
        performTestsOnNestedSchema(SchemaWithProperties)
    })

    describe('Nested schema defined with ref', () => {
        performTestsOnNestedSchema(SchemaWithRef)
    })
})
