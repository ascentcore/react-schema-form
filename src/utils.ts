import { SchemaProperty } from './components/form-element'
import { SCHEMA_KEYWORDS } from './constants'

export interface Conditional {
    compiled: string
    then?: SchemaProperty
    else?: SchemaProperty
}

//checks if item is object
export const isObject = (item: any) => {
    return item && typeof item === SCHEMA_KEYWORDS.OBJECT && !Array.isArray(item)
}

//merges the current object at all nesting levels with a new one
//the method does not return a new object; the current one is being altered
export const addProperties = (currentObject: any, newProperties: any): any => {
    if (isObject(currentObject) && isObject(newProperties)) {
        for (const key in newProperties) {
            if (isObject(newProperties[key])) {
                if (!currentObject[key]) {
                    Object.assign(currentObject, { [key]: {} })
                }
                addProperties(currentObject[key], newProperties[key])
            } else {
                if (
                    key === SCHEMA_KEYWORDS.REQUIRED &&
                    Array.isArray(newProperties[key]) &&
                    Array.isArray(currentObject[key])
                ) {
                    //@ts-ignore
                    currentObject[key] = [...new Set(currentObject[key].concat(...newProperties[key]))]
                } else {
                    Object.assign(currentObject, { [key]: newProperties[key] })
                }
            }
        }
    }
}

//gets all conditionals specified at root level of a schema;
//conditionals that are both specified with simple ifs, or as a list with allOf, anyOf, oneOf
export const getConditionals = (schema: SchemaProperty): Conditional[] => {
    let ifEntries = []
    const simpleConditional = getSimpleConditional(schema)
    if (simpleConditional) {
        ifEntries.push(simpleConditional)
    }
    ifEntries = ifEntries.concat(getMultipleConditionals(schema))
    const compiledIfEntries = ifEntries.map((ifEntry) => getCompiledConditional(ifEntry))
    let compiledDependencies: Conditional[] = []
    if (schema.dependencies) {
        compiledDependencies = getCompiledDependencies(schema.dependencies)
    }
    return compiledIfEntries.concat(compiledDependencies)
}

//given a schema, the function will return a list with all the paths of the schema and the value of the leaf node
//keywords such as properties and const are not included
//usage: extract all the conditions specified inside an if statement
const getPropertyPathsIfStatement = (schema: any, path = ''): { '0': string; '1': any }[] => {
    if (isObject(schema)) {
        return Array.prototype.concat.apply(
            [],
            Object.keys(schema).map((key) =>
                getPropertyPathsIfStatement(
                    schema[key],
                    key === SCHEMA_KEYWORDS.PROPERTIES || key === SCHEMA_KEYWORDS.CONST ? path : path + '.' + key
                )
            )
        )
    } else {
        return [{ '0': path, '1': schema }]
    }
}

//extract conditional from a simple if statement
const getSimpleConditional = (schema: SchemaProperty) => {
    if (schema.if && schema.if.properties) {
        return {
            if: getPropertyPathsIfStatement(schema.if!) as { '0': string; '1': any }[],
            then: schema.then,
            else: schema.else
        }
    } else {
        return null
    }
}

//extract conditionals from array
const extractConditionalFromArray = (
    conditionalSet: SchemaProperty[]
): {
    if: { '0': string; '1': any }[]
    then: SchemaProperty | undefined
    else: SchemaProperty | undefined
}[] => {
    return conditionalSet
        .filter((entry) => entry.if !== undefined)
        .map((conditional) => {
            return {
                if: getPropertyPathsIfStatement(conditional.if!) as { '0': string; '1': any }[],
                then: conditional.then,
                else: conditional.else
            }
        })
}

//extract conditionals from allOf, anyOf, oneOf statements
const getMultipleConditionals = (schema: SchemaProperty) => {
    let multipleConditionals: {
        if: { '0': string; '1': any }[]
        then: SchemaProperty | undefined
        else: SchemaProperty | undefined
    }[] = []
    if (schema.allOf) {
        multipleConditionals = multipleConditionals.concat(extractConditionalFromArray(schema.allOf))
    }
    if (schema.anyOf) {
        multipleConditionals = multipleConditionals.concat(extractConditionalFromArray(schema.anyOf))
    }
    if (schema.oneOf) {
        multipleConditionals = multipleConditionals.concat(extractConditionalFromArray(schema.oneOf))
    }
    return multipleConditionals
}

//constructs string function which will be compiled when needed;
//rewrites the condition under an if statement as a function
const getCompiledConditional = (ifEntry: {
    if: { '0': string; '1': SchemaProperty }[]
    then: SchemaProperty | undefined
    else: SchemaProperty | undefined
}): Conditional => {
    const compiled: string = `data => { return (${ifEntry.if
        .reduce((memo: string[], item: { '0': string; '1': any }) => {
            return memo.concat([
                'data' + item[0] + '==' + (typeof item[1] === SCHEMA_KEYWORDS.STRING ? "'" + item[1] + "'" : item[1])
            ])
        }, [])
        .join(' && ')}) || (${ifEntry.if
        .reduce((memo: string[], item: { '0': string; '1': any }) => {
            return memo.concat(['data' + item[0] + '==' + 'undefined'])
        }, [])
        .join(' && ')}) }`
    return {
        compiled: compiled,
        ...(ifEntry.then ? { then: ifEntry.then } : {}),
        ...(ifEntry.else ? { else: ifEntry.else } : {})
    }
}

const getCompiledDependencies = (dependencies: { [key: string]: string[] }): Conditional[] => {
    return Object.entries(dependencies).map((dependency) => {
        const compiled: string = `data => { return (data.${dependency[0]} !== undefined) }`
        return {
            compiled: compiled,
            then: {
                required: dependency[1]
            }
        }
    })
}
