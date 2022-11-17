import { ApiPackage, ApiDeclaredItem, ApiItem } from '@microsoft/api-extractor-model'
export function validateExamples(apiJson: string) {
    const api = ApiPackage.loadFromJsonFile(apiJson)
    validateNode(api)
}


function hasTSDocs(x: any): x is ApiDeclaredItem {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return x?.tsdocComment !== undefined;
}

function validateNode(item: ApiItem) {
    if (hasTSDocs(item)) {
        const docs = item.tsdocComment?.emitAsTsdoc()
        if (docs) {
            for (const match of docs.matchAll(/@example\s*\*\s*```(tsx?|jsx?)\((\S+)\)(.*)```/gs)) {
                 match[3]
            }
        }
    }
    for (const member of item.members) {
        validateNode(member)
    }
}