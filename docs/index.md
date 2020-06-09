# react-schema-form

react-schema-form was build to simplify the management of HTML forms. It's based on [React](https://reactjs.org/) and [JSON schema](http://json-schema.org/). By having the necessary knowledge of the data being manipulated, such as structure, data types, particular constraints or patterns, you can design JSON schemas which will serve as inputs for the forms which will be automatically generated.

react-schema-form exports a React component, which supports the following properties: schema, wrapper, data, config, onSubmit, errorFormatter. Each of them will be detailed in the [&lt;SchemaForm /> props](#api) section.

## Installation

Install the library via npm:

```bash
$ npm install --save @ascentcore/react-schema-form
```

The only peer dependency is React 16+.

Import the form component from the library:

```js
import { SchemaForm } from '@ascentcore/react-schema-form';
```

## Quick Start

```jsx
function BasicSchemaExample() {
 
    const onValid = (data) => {
        console.log(data)
    }
    
    const schema = {
        "type": "object",
        "title": "Person",
        "description": "Person Information",
        "required": ["fullName"],
        "properties": {
            "fullName": {
                "type": "string",
                "title": "Full Name"
            },
            "age": {
                "title": "Age",
                "type": "integer",
                "minimum": 10
            }
        }
    }
 
    const data = {
        fullName: 'Defined Value'
    }
 
    return (<SchemaForm schema={schema} onValid={onValid} data={data} />)
};
```

For more examples you can check the example folder of the library. To run them, execute the following instructions:

```bash
$ cd example
$ npm install
$ yarn start
```

## <a name="api"></a>&lt;SchemaForm /> props

### schema
 schema property is mandatory and contains the json-schema used to render the form. It can be declared locally or imported from a json file. The schema has to respect some meta-schema standards, which are detailed in the [Custom JSON meta-schema](#custom-meta-schema) section.

 An example of schema usage, processing both data and errors, can be seen inside example/src/basic-schema folder.

### data
data is an optional property which receives the data with which the form will be pre-populated; both this data and the final data (after field updates) must respect the json-schema constraints.

 An example of data usage, processing both data and errors, can be seen inside example/src/basic-schema folder.

### onSubmit
onSubmit is an optional property which contains a callback function; the callback function will be called when the submit button was triggered. the callback accepts two paramerers 

***(data, errors) => void***

**data** contains the data as it was submitted

**errors** contains a list of [validation errors](https://ajv.js.org/#validation-errors) (if any), as defined by the ajv library.

An example of onSubmit usage, processing both data and errors, can be seen inside example/src/custom-wrapper folder.

### wrapper
wrapper is an optional property which receives a React component which will be used as a wrapper for the html elements of the form. If not specified, the library uses a default one which displays the title of the component on top (marked as mandatory if it's the case), and with the errors at the bottom. For more details, see the [Customization](#customization) section.

 An example of wrapper usage, processing both data and errors, can be seen inside example/src/custom-wrapper folder.

### errorFormatter
errorFormatter is an optional property which accepts a function and has the behaviour of a pipeline, receiving an error object and returning the altered object.

***(error) => object***

**error** contains a [validation error](https://ajv.js.org/#validation-errors)

**returned value** is also a [validation error](https://ajv.js.org/#validation-errors) which can be altered inside the function

 An example of wrapper usage, processing both data and errors, can be seen inside example/src/custom-error-messages folder.

 ### config
 config is an optional property which supports the following

 #### registry
registry is an optional object which can be defined to override the standard registry, meaning what component/wrapper will be rendered when a specific registryKey will be encountered. It supports both component and wrapper overriding. 

The component can be either a component from the library, or a new component defined by the user. In the first case, the component will be given as a string. In the second case, the component will be given as a React Component. Our library's existing components are detailed in the [Form default elements](#form-default-elements). The wrapper, if specified, has to be a custom component.

A case of usage can be wanting to use radio buttons instead of a select with options when encountering fields of type enum.

#### exceptions
exceptions is an optional object which can be defined to override the standard registry for a specific property key or path, meaning what component/wrapper will be rendered. Specific key means a property with a specific name at any nesting level. Specific path means a string with a pattern like this ".user/.age", and it will match a single property of the json schema.

The component can be either a component from the library, or a new component defined by the user. In the first case, the component will be given as a string. In the second case, the component will be given as a React Component. Our library's existing components are detailed in the [Form default elements](#form-default-elements). The wrapper, if specified, has to be a custom component.

An example of config usage can be found inside example/src/custom-registry folder. 


## <a name="form-default-elements"></a>Form default elements

## <a name="customization"></a>Customization

## <a name="custom-meta-schema"></a>Custom JSON meta-schema

## License

MIT
