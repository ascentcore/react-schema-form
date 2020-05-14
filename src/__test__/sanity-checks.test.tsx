import React from 'react';
import { SchemaForm } from '..'
import { mount } from 'enzyme';

describe('BasicSchemaTests', () => {

    it('throw error when schema not provided', () => {
        const t = () => {
            mount(<SchemaForm />)
        };
        expect(t).toThrowError()
    })

})
