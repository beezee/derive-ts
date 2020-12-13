import * as lib from '../index';

type GQL = {
  prefix: string, tpe: string, children: string, optional: boolean,
  array: boolean}

declare module "../index" {
  export interface Interps<A> {
    GraphQL: GQL
  }
}

export const gqlStr = (gql: GQL): string => {
  const arr = gql.array ? ['[', ']'] : ['', '']
  return arr[0] + gql.prefix + gql.tpe + gql.children + arr[1] + (gql.optional ? '' : '!')
}

const gqlChild = (gql: GQL): string =>
  gqlStr({...gql, prefix: "", children: ""})

const gqlPrim = (tpe: string): GQL =>
  ({prefix: '', tpe, children: '', optional: false, array: false})

type GQLAlg = lib.Recurse<'GraphQL', 'GQL_recurse'> & lib.Str<'GraphQL'> & lib.Num<'GraphQL'> & 
  lib.Dict<'GraphQL', lib.Named> & lib.Option<'GraphQL'> & lib.Array<'GraphQL'>
export const GQL: () => GQLAlg = () => {
  const cache = lib.memo({})
  const mem = (id: string, fn: () => GQL): GQL => cache(id, fn)
  return {
    string: () => gqlPrim('String'), number: () => gqlPrim('Integer'),
    option: (ga) => ({...ga, optional: true}),
    array: (ga) => ({...ga, array: true}),
    recurse: (id, f, map = (x) => x) => map(mem(id, f)),
    dict: ({name}) => <T>(mkProps: () => lib.Props<'GraphQL', T>) => {
      const tpe = mem(name, () => 
        ({prefix: '', tpe: name, children: '', optional: false, array: false})).tpe
      const props = mkProps()
      return ({prefix: 'type ', tpe,
        children: ` { ${Object.keys(props).map(k =>
         `${k}: ${gqlChild(props[k as keyof lib.Props<'GraphQL', T>])};`).join(" ")} }`,
        optional: false, array: false})
    }
  }
};
