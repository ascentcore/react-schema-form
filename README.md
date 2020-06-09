# @ascentcore/react-schema-form

> React Forms based on JSON Schemas

[![NPM](https://img.shields.io/npm/v/@ascentcore/react-schema-form.svg)](https://www.npmjs.com/package/@ascentcore/react-schema-form) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save @ascentcore/react-schema-form
```

## Usage

Having a schema defined (`basic-schema.json`):

```json
{
    "$id": "https://example.com/person.schema.json",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "title": "Person",
    "description": "Person Information",
    "required": ["firstName", "lastName", "type", "phoneNumbers"],
    "properties": {
        "firstName": {
            "type": "string",
            "title": "First Name",
            "description": "The person's first name."
        },
        "lastName": {
            "type": "string",
            "title": "Last Name",
            "description": "The person's last name."
        },
        "age": {
            "title": "Age",
            "description": "Age in years which must be equal to or greater than zero.",
            "type": "integer",
            "minimum": 10
        },
        "type": {
            "title": "Type",
            "type": "string",
            "enum": ["NW", "NE", "SW", "SE"]
        },
        "agree": {
            "title": "Agree with TOC",
            "type": "boolean",
            "default": false
        },
        "phoneNumbers": {
            "title": "Phone numbers",
            "type": "array",
            "items": {
                "title": "Phone number",
                "type": "string",
                "pattern": "^[0-9]+$"
            }
        }
    }
}

```

Example of form generation usage based on schema:

```jsx
import React from 'react'
import schema from './basic-schema.json'
import { SchemaForm } from '@ascentcore/react-schema-form'

export default function BasicSchemaExample() {

    function onSubmit(data) {
        console.log(data)
    }

    const data = {
        firstName: 'Defined Value'
    }

    return (<SchemaForm schema={schema} onSubmit={onSubmit} data={data} />)

}
```

## Development

Library dev building:
```
npm install
npm run start
```

Examples dev building:

```
cd example
npm install
npm run start
```

## License

MIT 
