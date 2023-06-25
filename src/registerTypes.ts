import {InterfaceDeclaration, SourceFile, TypeAliasDeclaration} from "ts-morph";

export function registerTypes(sourceFiles: SourceFile[], registry: { [name: string]: boolean }) {
    const foundInterfaces: InterfaceDeclaration[] = sourceFiles.flatMap(sourceFile => {
        return sourceFile.getInterfaces().filter(dec => dec.isExported())
    })

    const typeAliases: TypeAliasDeclaration[] = sourceFiles.flatMap(sourceFile => {
        return sourceFile.getTypeAliases().filter(dec => dec.isExported())
    })

    for (const exportedInterface of foundInterfaces) {
        registry[exportedInterface.getName()] = true;
    }

    for (const typeAlias of typeAliases) {
        registry[typeAlias.getName()] = true
    }
}