import {Type} from "ts-morph";

export function isReferenceType(type: Type, registry: { [name: string]: boolean }): boolean {
    let wrappedTypeName
    if (type.isArray()) {
        wrappedTypeName = type.getArrayElementType()?.getSymbol()?.getName()
    } else {
        wrappedTypeName = type.getSymbol()?.getName()
    }
    return registry.hasOwnProperty(wrappedTypeName || "")
}