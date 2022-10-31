// import * as ts from 'typescript'
// import { compileFile, findNode } from '@wixc3/typescript'

export function grabTest(_file: string, _title: string) {
    // const isTestFunc = (n: ts.Node) => {
    //     try {
    //         if (ts.isExpressionStatement(n)) {
    //             const {expression} = n
    //             if (ts.isCallExpression(expression)) {
    //                 const { arguments:args, expression:name } = expression
    //                 if (name && ts.isIdentifier(name) && name.escapedText === 'it') {
    //                     if(args[0] && ts.isStringLiteral(args[0])) {
    //                         if (args[0].text === title) {
    //                             return true
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     catch (e){
    //         // eslint-disable-next-line no-console
    //         console.log(e)
    //         return false
    //     }
    //     return false
    // }
    // const compiled = compileFile(file)
    // const test = findNode(compiled, isTestFunc)
    // return test && test.getText()
}
