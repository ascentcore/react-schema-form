import React from 'react'
import Schema from './schemas/file-schema.json'
import { SchemaForm } from '..'
import { mount } from 'enzyme'
import { getByCSSSelector } from './test-utils'

describe('FileSchemaTests', () => {
    it('initializes correctly', async (done) => {
        const onChange = (valData: any) => {
            console.log('now can submit', valData)
            expect(valData).toEqual({
                profilePicture: {
                    filename: 'testFile.txt',
                    content: ''
                }
            })
            done()
        }
        const form = mount(<SchemaForm schema={Schema} parentChange={onChange} />)

        const fileInput = getByCSSSelector(form, 'input')
        fileInput.simulate('change', {
            target: {
                files: [new File([], 'testFile.txt')]
            }
        })
    })
})
