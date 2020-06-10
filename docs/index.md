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

* **schema** property is mandatory and contains the json-schema used to render the form. It can be declared locally or imported from a json file. The schema has to respect some meta-schema standards, which are detailed in the [Custom JSON meta-schema](#custom-meta-schema) section.

    An example of schema usage, processing both data and errors, can be seen inside example/src/basic-schema folder.

* **data** is an optional property which receives the data with which the form will be pre-populated; both this data and the final data (after field updates) must respect the json-schema constraints.

    An example of data usage, processing both data and errors, can be seen inside example/src/basic-schema folder.

* **onSubmit** is an optional property which contains a callback function; the callback function will be called when the submit button was triggered. the callback accepts two paramerers 

    ***(data, errors) => void***

    **data** contains the data as it was submitted

    **errors** contains a list of [validation errors](https://ajv.js.org/#validation-errors) (if any), as defined by the ajv library.

    An example of onSubmit usage, processing both data and errors, can be seen inside example/src/custom-wrapper folder.

* **wrapper** is an optional property which receives a React component which will be used as a wrapper for the html elements of the form. If not specified, the library uses a default one which displays the title of the component on top (marked as mandatory if it's the case), and with the errors at the bottom. For more details, see the [Customization](#customization) section.

    An example of wrapper usage, processing both data and errors, can be seen inside example/src/custom-wrapper folder.

* **errorFormatter** is an optional property which accepts a function and has the behaviour of a pipeline, receiving an error object and returning the altered object.

    ***(error) => object***

    **error** contains a [validation error](https://ajv.js.org/#validation-errors)

    **returned value** is also a [validation error](https://ajv.js.org/#validation-errors) which can be altered inside the function

    An example of wrapper usage, processing both data and errors, can be seen inside example/src/custom-error-messages folder.

 * **config** is an optional property which supports the following

    * registry - an optional object which can be defined to override the standard registry, meaning what component/wrapper will be rendered when a specific registryKey will be encountered. It supports both component and wrapper overriding. The component can be either a component from the library, or a new component defined by the user. In the first case, the component will be given as a string. In the second case, the component will be given as a React Component. Our library's existing components are detailed in the [Form default elements](#form-default-elements). The wrapper, if specified, has to be a custom component. A case of usage can be wanting to use radio buttons instead of a select with options when encountering fields of type enum.

    * exceptions- an optional object which can be defined to override the standard registry for a specific property key or path, meaning what component/wrapper will be rendered. Specific key means a property with a specific name at any nesting level. Specific path means a string with a pattern like this ".user/.age", and it will match a single property of the json schema. The component can be either a component from the library, or a new component defined by the user. In the first case, the component will be given as a string. In the second case, the component will be given as a React Component. Our library's existing components are detailed in the [Form default elements](#form-default-elements). The wrapper, if specified, has to be a custom component. An example of config usage can be found inside example/src/custom-registry folder. 


## <a name="form-default-elements"></a>Form default elements
The default form elements are:
* TextElement - an input of type text; will be rendered when schema property is of type string
    ```jsx
    "firstName": {
        "type": "string",
        "title": "First Name"
    }
    ```
* NumericElement - an input of type number which can be either float or integer; if the type of the json property is number => float; otherwise, if integer => integer
    ```jsx
    "age": {
        "type": "integer",
        "title": "Age"
    }
    ```
* CheckboxElement - an input of type checkbox which will be rendered when schema property is of type boolean
    ```jsx
    "agree": {
        "type": "boolean",
        "title": "Agree with Terms & Conditions"
    }
    ```
* SelectElement - a single selection element; it will be rendered if schema property has the enum field in it's definition

    ```jsx
    "type": {
        "title": "Type",
        "type": "string",
        "enum": ["NW", "NE", "SW", "SE"]
    }
    ```
    If the key is not the same with the selected value, the options field can be passed instead of the enum one, giving a key value pair type of objects as a list. The label for the key and the value can also be specified as fields on the same property. The fields' names are: labelKey and valueKey. If not specified, the default names for them will be 'labelKey' and 'valueKey'.
    ```jsx
    schema.properties.type.options = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
        { key: 'key3', value: 'value3' },
        { key: 'key4', value: 'value4' }
    ]
    schema.properties.type.labelKey = 'key'
    schema.properties.type.valueKey = 'value'
    ```
* RadioElement - a group of inputs of type radio; not used in standard registry, but by using a custom registry or a list of exceptions, the SelectElement can be overwritten with a RadioElement
    ```jsx
    "gender": {
        "title": "Type",
        "type": "string",
        "enum": ["male", "female"]
    }
    ```
* MultipleSelectElement - a multiple seleciton element; it will be rendered if the json schema contains a property of type array with items of type string with the enum field present on them
    ```jsx
    "hobbies": {
        "title": "Hobbies",
        "type": "array",
        "items": {
            "title": "Hobby",
            "type": "string",
            "enum": ["singing", "drawing", "hiking", "snowboarding", "reading"]
        }
    }
    ```
* FileElement - an input of type file; it will be rendered if the json schema contains a property which has an contentMediaType or a contentEncoding field present in it's definition; 
    ```jsx
    "file": {
        "title": "Upload photo",
        "type": "string",
        "contentEncoding": "base64",
        "contentMediaType": "image/png, image/jpeg"
    }
    ```
    another way to render an input of type file is to add an extra field in the definition of a property of type object. The field will have the key "instanceof" and the value "file". In this second case, the form will also store the filename of the uploaded file. 
    ```jsx
    "profilePicture": {
        "title": "Upload photo",
        "type": "object",
        "instanceof": "file",
        "properties": {
            "filename": {
                "type": "string"
            },
            "content": {
                "type": "string",
                "contentEncoding": "base64",
                "contentMediaType": "image/png, image/jpeg"
            }
        }
    }
    ```


* When running across an array of items (if not an array of enums which results in a multiple select), the library will render each item by it's type, adding after each of them a button with the scope of removing the item, and a button at the end of the array, for adding a new item in the list

* The buttons inside the application can be customized too. The registry has different entries for addButton, removeButton and the simple submit button. The classNames for the addButtons and removeButton are 'ra-add-button' and 'ra-remove-button'.

You can read more about the registry in the [Customization](#customization) section.

## <a name="customization"></a>Customization

* Registry customization - the registry of the library has the following form

    ```json
    enum: { component: ..., wrapper: ... },
    multipleEnum: { component: ..., wrapper: ... },
    boolean: { component: ..., wrapper: ... },
    number: { component: ..., wrapper: ... },
    integer: { component: ..., wrapper: ... },
    string: { component: ..., wrapper: ... },
    file: { component: ..., wrapper: ... },
    button: { component: ..., wrapper: ... },
    addButton: { component: ..., wrapper: ... },
    removeButton: { component: ..., wrapper: ... }
    ```

    In order to change the default behavior, the user has to pass a config object to the SchemaForm, containing either a custom registry or a list of exceptions. 
    
    When receiving a custom registry, the SchemaForm will replace all the default components for some given registryKeys with the specified ones. In the same way, the wrapper will be replaced if specified.

    ```jsx
    const customRegistry = {
        integer: { component: CustomNumericField, wrapper: CustomWrapper },
        enum: {component: 'RadioElement'},
        addButton: { component: CustomAddButton, wrapper: CustomWrapper }
    }

    return (
        <SchemaForm
            schema={schema}
            onValid={onValid}
            data={data}
            config={{ registry: customRegistry }}
        />
    )
    ```
    Specifying the component or the wrapper are both optional. If not specified, the component will be the default one. If not specified,the wrapper will be the custom one (if specified) or the default one.
    The component can be either a custom one defined by the user or a default one, reffered to as a string. The possibilities are: 'TextElement', 'FileElement', 'NumericElement', 'SelectElement', 'CheckboxElement', 'ButtonElement', 'RadioElement', 'MultipleSelectElement'

    When receiving an exception object, the SchemaForm will prioritise the rules listed in it. For example, even though the enums are replaced with radio elements by using a custom registry, if a key listed among the exceptions happens to be of type enum, it will be rendered with the specifications listed in the exception object, not the ones from the custom registry.

    The exception object supports both keys and paths. The key rule applies at any nesting level while the path rule applies only to one specific path (full path is required). Path exception has priority over the key exception. When considering key exceptions, the property name will be specified (e.g. 'age'). For path exceptions, the path will be specified in the following form: '.user/.age'.

    ```jsx
    const exceptions = {
        keys: {
            'gender': { component: 'SelectElement' }
        }
    }

    return (
        <SchemaForm
            schema={schema}
            onValid={onValid}
            data={data}
            config={{ exceptions: exceptions }}
        />
    )
     ```

## <a name="custom-meta-schema"></a>Custom JSON meta-schema

## License

MIT
