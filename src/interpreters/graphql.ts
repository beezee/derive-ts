import * as lib from '../index';
import { memo } from '../util';
import type * as ast from 'graphql/language/ast';

type GQL = {
  prefix: string, tpe: string, children: string, optional: boolean,
  array: boolean}

declare module "../index" {
  export interface Targets<A> {
    GraphQL: ast.TypeNode | ast.TypeDefinitionNode
  }
}

const gqlPrim = (tpe: string): ast.NonNullTypeNode =>
  ({"kind": "NonNullType",
    "type": {"kind": "NamedType", "name": {"kind": "Name", "value": tpe,}}})

const option = (node: ast.TypeNode | ast.TypeDefinitionNode) =>
  node.kind === "NonNullType" ? node.type : node

function isTypeNode(x: any): x is ast.TypeNode {
  return "kind" in x && ["NamedType", "ListType", "NonNullType"].includes(x.kind)
}

const list = (node: ast.TypeNode | ast.TypeDefinitionNode): ast.TypeNode | ast.TypeDefinitionNode =>
  isTypeNode(node)
    ? ({kind: "NonNullType", type: {kind: "ListType", type: node}})
    : node

const object = (name: string, fields: ast.FieldDefinitionNode[]): ast.ObjectTypeDefinitionNode =>
  ({kind: "ObjectTypeDefinition",
    name: {kind: "Name", value: name},
    fields})

const field = (name: string, node: ast.TypeNode | ast.TypeDefinitionNode):
ast.FieldDefinitionNode =>
  ({kind: "FieldDefinition",
    name: {kind: "Name", value: name},
    type: isTypeNode(node)
      ? node : gqlPrim(node.name.value)})

declare module "../index" {
  interface _Alg<T extends Target, I extends Input> {
    gqlResolver: <Parent, Args, Context, Output>(i: lib.InputOf<"gqlResolver", I, unknown> & {
      parent: Result<T, Parent>, args: Result<T, Args>,
      context: Result<T, Context>, output: Result<T, Output>}) =>
      Result<T, (parent: Parent, args: Args, context: Context) => Promise<Output>>
  }
}

type GQLAlg = lib.Alg<'GraphQL', 
  "str" | "num" | "option" | "array" | "recurse" | "dict",
  "Named">

export const GQL: () => GQLAlg = () => {
  const cache = memo({})
  const mem = (id: string, fn: () => ast.TypeNode | ast.TypeDefinitionNode):
  ast.TypeNode | ast.TypeDefinitionNode => cache(id, fn)
  return {
    str: () => gqlPrim('String'), num: () => gqlPrim('Int'),
    option: ({of}) => option(of),
    array: ({of}) => list(of),
    recurse: (id, f, map = (x) => x) => map(mem(id, f)),
    dict: <T>({Named, props: mkProps}: lib.DictArgs<"GraphQL", "Named", T>) => {
      mem(Named, () => gqlPrim(Named))
      const props = mkProps()
      return object(Named, Object.keys(props)
        .map(k => field(k, props[k as keyof lib.Props<"GraphQL", T>] as ast.TypeNode)))
    }
  }
};
