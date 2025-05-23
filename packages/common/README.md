[![npm version](https://badge.fury.io/js/@wixc3%2Fcommon.svg)](https://badge.fury.io/js/@wixc3%2Fcommon)
[@wixc3/common on Github](https://github.com/wixplosives/core3-utils/tree/main/packages/common)

<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](https://wixplosives.github.io/core3-utils/index) &gt; [@wixc3/common](https://wixplosives.github.io/core3-utils/common)

## common package

Useful utils for strings, iterables, objects, maps, promises and other commonly used structures

## Classes

| Class                                                                                         | Description                                                                                                                                  |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [ErrorWithCode](https://wixplosives.github.io/core3-utils/common.errorwithcode)               | Creates an error with error code. Helpful when <code>instanceof</code> can't be used because the error was serialized and then deserialized. |
| [UnreachableCaseError](https://wixplosives.github.io/core3-utils/common.unreachablecaseerror) | Allows the type checker to detect non-exhaustive switch statements.                                                                          |

## Enumerations

| Enumeration                                                                           | Description |
| ------------------------------------------------------------------------------------- | ----------- |
| [NamingConvention](https://wixplosives.github.io/core3-utils/common.namingconvention) |             |

## Functions

| Function                                                                                                                 | Description                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [addToSet(target, source)](https://wixplosives.github.io/core3-utils/common.addtoset)                                    |                                                                                                                                                                                                                                                                     |
| [assertIsString(value, errorMessage)](https://wixplosives.github.io/core3-utils/common.assertisstring)                   | Throws if value is not a string                                                                                                                                                                                                                                     |
| [asyncNoop()](https://wixplosives.github.io/core3-utils/common.asyncnoop)                                                |                                                                                                                                                                                                                                                                     |
| [at(iterable, index)](https://wixplosives.github.io/core3-utils/common.at)                                               | Finds element by index, including negative index                                                                                                                                                                                                                    |
| [awaitRecord(obj)](https://wixplosives.github.io/core3-utils/common.awaitrecord)                                         | Awaits a record of promises, and returns a record of their results.                                                                                                                                                                                                 |
| [capitalizeFirstLetter(val)](https://wixplosives.github.io/core3-utils/common.capitalizefirstletter)                     | Capitalize the first letter of a string                                                                                                                                                                                                                             |
| [chain(value)](https://wixplosives.github.io/core3-utils/common.chain)                                                   | Chain iterable operations, each acting on the output of the previous step                                                                                                                                                                                           |
| [chain(value)](https://wixplosives.github.io/core3-utils/common.chain_1)                                                 | Chain iterable operations, each acting on the output of the previous step                                                                                                                                                                                           |
| [clamp(value, min, max)](https://wixplosives.github.io/core3-utils/common.clamp)                                         |                                                                                                                                                                                                                                                                     |
| [concat(iterables)](https://wixplosives.github.io/core3-utils/common.concat)                                             |                                                                                                                                                                                                                                                                     |
| [createRandomIntWithSeed(seed)](https://wixplosives.github.io/core3-utils/common.createrandomintwithseed)                |                                                                                                                                                                                                                                                                     |
| [defaults(\_source, \_defaultValues, deep, shouldUseDefault)](https://wixplosives.github.io/core3-utils/common.defaults) | Returns an object where missing keys and values/keys that satisfy shouldUseDefault to the value in shouldUseDefault.                                                                                                                                                |
| [delayed(fn, wait)](https://wixplosives.github.io/core3-utils/common.delayed)                                            | Ensures <code>func</code> will be called with at least <code>wait</code> ms between runs.                                                                                                                                                                           |
| [enforceSequentialExecution(fn)](https://wixplosives.github.io/core3-utils/common.enforcesequentialexecution)            | Ensures that when the async function <code>fn</code> is called twice in a row, the second call only begins after the first one has finished (successfully or not).                                                                                                  |
| [enumValues(enumObj)](https://wixplosives.github.io/core3-utils/common.enumvalues)                                       |                                                                                                                                                                                                                                                                     |
| [enumValues(enumObj)](https://wixplosives.github.io/core3-utils/common.enumvalues_1)                                     |                                                                                                                                                                                                                                                                     |
| [equalIdents(reference, modified, newline)](https://wixplosives.github.io/core3-utils/common.equalidents)                | Matches the indentation of modified to the one of reference                                                                                                                                                                                                         |
| [errorToPlainObject(error)](https://wixplosives.github.io/core3-utils/common.errortoplainobject)                         |                                                                                                                                                                                                                                                                     |
| [escapeCSS(str)](https://wixplosives.github.io/core3-utils/common.escapecss)                                             | Replaced non alphanumeric character with [CSS unicode representation](https://drafts.csswg.org/cssom/#escape-a-character-as-code-point)                                                                                                                             |
| [escapeRegExp(str)](https://wixplosives.github.io/core3-utils/common.escaperegexp)                                       | Returns a string safe to be used in RegExp                                                                                                                                                                                                                          |
| [every(iterable, predicate)](https://wixplosives.github.io/core3-utils/common.every)                                     |                                                                                                                                                                                                                                                                     |
| [exclude(excluded)](https://wixplosives.github.io/core3-utils/common.exclude)                                            |                                                                                                                                                                                                                                                                     |
| [filter(iterable, predicate)](https://wixplosives.github.io/core3-utils/common.filter)                                   |                                                                                                                                                                                                                                                                     |
| [find(iterable, predicate)](https://wixplosives.github.io/core3-utils/common.find)                                       |                                                                                                                                                                                                                                                                     |
| [first(iterable)](https://wixplosives.github.io/core3-utils/common.first)                                                | Picks the first element of an iterable                                                                                                                                                                                                                              |
| [flat(iterable, deep)](https://wixplosives.github.io/core3-utils/common.flat)                                            |                                                                                                                                                                                                                                                                     |
| [flatMap(iterable, mapFn)](https://wixplosives.github.io/core3-utils/common.flatmap)                                     |                                                                                                                                                                                                                                                                     |
| [forEach(iterable, fn)](https://wixplosives.github.io/core3-utils/common.foreach)                                        |                                                                                                                                                                                                                                                                     |
| [get(obj, key)](https://wixplosives.github.io/core3-utils/common.get)                                                    | Similar to Map.get, but works for plain objects, and returns undefined for null maps and missing keys                                                                                                                                                               |
| [get(obj, key)](https://wixplosives.github.io/core3-utils/common.get_1)                                                  |                                                                                                                                                                                                                                                                     |
| [getCartesianProduct(arrays)](https://wixplosives.github.io/core3-utils/common.getcartesianproduct)                      |                                                                                                                                                                                                                                                                     |
| [getErrorCode(error)](https://wixplosives.github.io/core3-utils/common.geterrorcode)                                     | Returns error.code property if the error object has it, otherwise returns undefined.                                                                                                                                                                                |
| [getIn(obj, path)](https://wixplosives.github.io/core3-utils/common.getin)                                               |                                                                                                                                                                                                                                                                     |
| [getOs()](https://wixplosives.github.io/core3-utils/common.getos)                                                        |                                                                                                                                                                                                                                                                     |
| [getValue(map, key, errorMessage)](https://wixplosives.github.io/core3-utils/common.getvalue)                            | Returns a value by key, throws if the value is missing or the map null                                                                                                                                                                                              |
| [getValue(map, key, errorMessage)](https://wixplosives.github.io/core3-utils/common.getvalue_1)                          |                                                                                                                                                                                                                                                                     |
| [getValue(map, key, errorMessage)](https://wixplosives.github.io/core3-utils/common.getvalue_2)                          |                                                                                                                                                                                                                                                                     |
| [groupBy(elements, property)](https://wixplosives.github.io/core3-utils/common.groupby)                                  | Groups elements by the value of a property                                                                                                                                                                                                                          |
| [has(obj, key)](https://wixplosives.github.io/core3-utils/common.has)                                                    | Similar to Map.has, but works for plain objects, and returns false for null maps                                                                                                                                                                                    |
| [has(obj, key)](https://wixplosives.github.io/core3-utils/common.has_1)                                                  | Similar to Map.has, but works for plain objects, and returns false for null maps                                                                                                                                                                                    |
| [has(obj, key)](https://wixplosives.github.io/core3-utils/common.has_2)                                                  |                                                                                                                                                                                                                                                                     |
| [histogram(iterable)](https://wixplosives.github.io/core3-utils/common.histogram)                                        | Calculate a histogram of iterable elements                                                                                                                                                                                                                          |
| [includes(iterable, item)](https://wixplosives.github.io/core3-utils/common.includes)                                    |                                                                                                                                                                                                                                                                     |
| [includesCaseInsensitive(str, substr)](https://wixplosives.github.io/core3-utils/common.includescaseinsensitive)         | Checks if str contains substr ignoring capitalization                                                                                                                                                                                                               |
| [indexToLineAndColumn(content, pos, newline)](https://wixplosives.github.io/core3-utils/common.indextolineandcolumn)     | Finds line an column by position index                                                                                                                                                                                                                              |
| [isDefined(value)](https://wixplosives.github.io/core3-utils/common.isdefined)                                           | Given a value of type Nullable<T>, validates value is T                                                                                                                                                                                                             |
| [isEmpty(iterable)](https://wixplosives.github.io/core3-utils/common.isempty)                                            | Checks if an iterable is empty                                                                                                                                                                                                                                      |
| [isErrorLikeObject(error)](https://wixplosives.github.io/core3-utils/common.iserrorlikeobject)                           | Checks if the <code>error</code> is an object compatible with the Error interface; that is, it has properties 'name' and 'message' of type string. The object could be an instance of an Error, or it could be some other kind of object that has these properties. |
| [isIterable(x)](https://wixplosives.github.io/core3-utils/common.isiterable)                                             |                                                                                                                                                                                                                                                                     |
| [isMap(m)](https://wixplosives.github.io/core3-utils/common.ismap)                                                       | Validates s is an instance of Map                                                                                                                                                                                                                                   |
| [isObject(value)](https://wixplosives.github.io/core3-utils/common.isobject)                                             | <p>Checks if value is an object, e.g. a plain object, an array, a function, a regex, but not a primitive value.</p><p>Common usage scenario:</p>                                                                                                                    |

```ts
isObject(value) && value.foo === 'bar';
// Instead of:
typeof value === 'object' && value !== null && 'foo' in value && value.foo === 'bar';
```

|
| [isPlainObject(value)](https://wixplosives.github.io/core3-utils/common.isplainobject) | Checks that value is a POJO |
| [isSet(s)](https://wixplosives.github.io/core3-utils/common.isset) | Validates s is an instance of Set |
| [isString(value)](https://wixplosives.github.io/core3-utils/common.isstring) | Checks is value is a string |
| [isValidNamingConvention(namingConvention)](https://wixplosives.github.io/core3-utils/common.isvalidnamingconvention) | Checks if namingConvention is supported |
| [join(iterable, separator)](https://wixplosives.github.io/core3-utils/common.join) | |
| [keys(map)](https://wixplosives.github.io/core3-utils/common.keys) | |
| [keys(map)](https://wixplosives.github.io/core3-utils/common.keys_1) | |
| [last(iterable)](https://wixplosives.github.io/core3-utils/common.last) | Picks the last element of an iterable |
| [map(iterable, mapFn)](https://wixplosives.github.io/core3-utils/common.map) | Map iterable elements |
| [mapKeys(obj, mapping)](https://wixplosives.github.io/core3-utils/common.mapkeys) | Maps values of a plain object |
| [mapObject(obj, mapping)](https://wixplosives.github.io/core3-utils/common.mapobject) | Maps key value pairs of a plain object |
| [mapValues(obj, mapping)](https://wixplosives.github.io/core3-utils/common.mapvalues) | Maps values of a plain object |
| [memoize(fn, argsHash)](https://wixplosives.github.io/core3-utils/common.memoize) | |
| [minimalIndent(str)](https://wixplosives.github.io/core3-utils/common.minimalindent) | Shifts all indentation to the left using the line with the least indentation as a baseline |
| [mulberry32(a)](https://wixplosives.github.io/core3-utils/common.mulberry32) | |
| [newMacrotask()](https://wixplosives.github.io/core3-utils/common.newmacrotask) | |
| [next(iterable, item)](https://wixplosives.github.io/core3-utils/common.next) | Find the element following an item |
| [noIdents(modified, separator)](https://wixplosives.github.io/core3-utils/common.noidents) | Remove line indentation (heading whitespace) |
| [noop()](https://wixplosives.github.io/core3-utils/common.noop) | |
| [normToRage(normal, min, max)](https://wixplosives.github.io/core3-utils/common.normtorage) | |
| [noWhiteSpace(str)](https://wixplosives.github.io/core3-utils/common.nowhitespace) | Remove white spaces including empty lines |
| [once(fn)](https://wixplosives.github.io/core3-utils/common.once) | Make a function executable only once, following calls are ignored |
| [partition(data, bucketsCount, predicate)](https://wixplosives.github.io/core3-utils/common.partition) | Partition unordered data into buckets of similar total weight |
| [pick(record, keys)](https://wixplosives.github.io/core3-utils/common.pick) | returns an object composed of the picked object properties |
| [prev(iterable, item)](https://wixplosives.github.io/core3-utils/common.prev) | Find the element before an item |
| [randomizedOrder(size)](https://wixplosives.github.io/core3-utils/common.randomizedorder) | |
| [reduce(iterable, reducer, initial)](https://wixplosives.github.io/core3-utils/common.reduce) | |
| [reportError_2(ex)](https://wixplosives.github.io/core3-utils/common.reporterror_2) | Logs an error |
| [reverseObject(obj)](https://wixplosives.github.io/core3-utils/common.reverseobject) | Reverses keys-values of an object, ignoring falsy values. First takes on value collisions. |
| [same(a, b, unordered)](https://wixplosives.github.io/core3-utils/common.same) | Deep comparison of two objects |
| [seededRandomInt(min, max)](https://wixplosives.github.io/core3-utils/common.seededrandomint) | |
| [shuffle(array)](https://wixplosives.github.io/core3-utils/common.shuffle) | Shuffles an array |
| [size(iterable)](https://wixplosives.github.io/core3-utils/common.size) | Evaluate the size of an iterable |
| [skip(iterable, count)](https://wixplosives.github.io/core3-utils/common.skip) | Skips the first elements of an iterable |
| [some(iterable, predicate)](https://wixplosives.github.io/core3-utils/common.some) | |
| [sort(iterable, by)](https://wixplosives.github.io/core3-utils/common.sort) | |
| [splitIntoWords(str)](https://wixplosives.github.io/core3-utils/common.splitintowords) | Breaks down a string to words, dropping non letters and numbers |
| [stringifyErrorStack(error)](https://wixplosives.github.io/core3-utils/common.stringifyerrorstack) | |
| [swap(array, i, j)](https://wixplosives.github.io/core3-utils/common.swap) | Swaps elements of an array in place |
| [templateCompilerProvider(context)](https://wixplosives.github.io/core3-utils/common.templatecompilerprovider) | Similar to templated string, given a fixed context object returns a function that parses strings in it |
| [toCamelCase(str)](https://wixplosives.github.io/core3-utils/common.tocamelcase) | Converts a string to camelCase |
| [toCSSCamelCase(str)](https://wixplosives.github.io/core3-utils/common.tocsscamelcase) | like [toCamelCase()](https://wixplosives.github.io/core3-utils/common.tocamelcase)<!-- -->, but capitalizes first character if input starts with '-' |
| [toCSSKebabCase(str)](https://wixplosives.github.io/core3-utils/common.tocsskebabcase) | like [toKebabCase()](https://wixplosives.github.io/core3-utils/common.tokebabcase)<!-- -->, but prepends '-' if first character of input is UpperCase |
| [toError(value)](https://wixplosives.github.io/core3-utils/common.toerror) | Convert any kind of value to an error instance. Unless the value is already an error instance, it's stringified and used as the error message. |
| [toKebabCase(str)](https://wixplosives.github.io/core3-utils/common.tokebabcase) | Converts a string to kebab-case |
| [toMap(obj)](https://wixplosives.github.io/core3-utils/common.tomap) | Coverts and object into a Map |
| [toNamingConvention(str, namingConvention)](https://wixplosives.github.io/core3-utils/common.tonamingconvention) | Converts string formatting to a naming convention |
| [toPascalCase(str)](https://wixplosives.github.io/core3-utils/common.topascalcase) | Converts a string to PascalCase |
| [toPascalCaseJsIdentifier(str)](https://wixplosives.github.io/core3-utils/common.topascalcasejsidentifier) | Similar to [toPascalCase()](https://wixplosives.github.io/core3-utils/common.topascalcase)<!-- -->, but drops heading non-letters |
| [unique(iterable, by)](https://wixplosives.github.io/core3-utils/common.unique) | Creates iterable of unique elements |
| [values(map)](https://wixplosives.github.io/core3-utils/common.values) | |
| [values(map)](https://wixplosives.github.io/core3-utils/common.values_1) | |

## Variables

| Variable                                                                                                | Description                                    |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| [isElectronRendererProcess](https://wixplosives.github.io/core3-utils/common.iselectronrendererprocess) |                                                |
| [isMac](https://wixplosives.github.io/core3-utils/common.ismac)                                         |                                                |
| [isWindows](https://wixplosives.github.io/core3-utils/common.iswindows)                                 |                                                |
| [remap](https://wixplosives.github.io/core3-utils/common.remap)                                         | remaps keys of obj based on rename map object, |

## Type Aliases

| Type Alias                                                                                  | Description                                                |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| [Awaited_2](https://wixplosives.github.io/core3-utils/common.awaited_2)                     | The resolved value of T (if a promise, otherwise simply T) |
| [Chain](https://wixplosives.github.io/core3-utils/common.chain)                             |                                                            |
| [Flat](https://wixplosives.github.io/core3-utils/common.flat)                               |                                                            |
| [Iter](https://wixplosives.github.io/core3-utils/common.iter)                               |                                                            |
| [IterableChain](https://wixplosives.github.io/core3-utils/common.iterablechain)             |                                                            |
| [Mapping](https://wixplosives.github.io/core3-utils/common.mapping)                         |                                                            |
| [MapValue](https://wixplosives.github.io/core3-utils/common.mapvalue)                       |                                                            |
| [NotIterable](https://wixplosives.github.io/core3-utils/common.notiterable)                 |                                                            |
| [Nullable](https://wixplosives.github.io/core3-utils/common.nullable)                       | T or null/undefined                                        |
| [ObjValue](https://wixplosives.github.io/core3-utils/common.objvalue)                       |                                                            |
| [Predicate](https://wixplosives.github.io/core3-utils/common.predicate)                     |                                                            |
| [Remap](https://wixplosives.github.io/core3-utils/common.remap)                             |                                                            |
| [RemapFunc](https://wixplosives.github.io/core3-utils/common.remapfunc)                     |                                                            |
| [Remapped](https://wixplosives.github.io/core3-utils/common.remapped)                       |                                                            |
| [UnionToIntersection](https://wixplosives.github.io/core3-utils/common.uniontointersection) | Make an intersection type from union                       |
| [ValueChain](https://wixplosives.github.io/core3-utils/common.valuechain)                   |                                                            |
| [ValueOf](https://wixplosives.github.io/core3-utils/common.valueof)                         | union of all fields of T                                   |
