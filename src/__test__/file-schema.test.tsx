import React from 'react'
import Schema from './schemas/file-schema.json'
import { SchemaForm } from '..'
import { mount } from 'enzyme'
import { getByCSSSelector } from './test-utils'

describe('FileSchemaTests', () => {
    it('updates object instanceof file correctly', async (done) => {
        const onChange = (valData: any) => {
            expect(valData).toEqual({
                cv: {
                    filename: 'cv.txt',
                    content: ''
                }
            })
            done()
        }
        const form = mount(<SchemaForm schema={Schema} parentChange={onChange} />)

        const fileInput = getByCSSSelector(form, 'input').last()
        fileInput.simulate('change', {
            target: {
                files: [new File([], 'cv.txt')]
            }
        })
    })
    it('updates string with base64 content encoding correctly', async (done) => {
        const onChange = (valData: any) => {
            expect(valData).toEqual({
                file: 'aGVsbG8='
            })
            done()
        }
        const form = mount(<SchemaForm schema={Schema} parentChange={onChange} />)

        const fileInput = getByCSSSelector(form, 'input').first()

        fileInput.simulate('change', {
            target: {
                files: [
                    new File(['hello'], 'hello.txt')
                ]
            }
        })
    })
})
