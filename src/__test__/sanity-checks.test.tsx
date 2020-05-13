import React from 'react';
import { SchemaForm } from '..'
import { shallow, mount } from 'enzyme';
import getComponentTree from './test-utils';

describe('BasicSchemaTests', () => {

    it('throw error when schema not provided', () => {
        const t = () => {
            mount(<SchemaForm />)
        };
        expect(t).toThrowError()
    })

})
