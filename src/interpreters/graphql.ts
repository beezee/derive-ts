import * as lib from '../index';
import { memo } from '../util';

type GQL = {
  prefix: string, tpe: string, children: string, optional: boolean,
  array: boolean}

declare module "../index" {
  export interface Outputs<A> {
    GraphQL: GQL
  }
}

export const gqlStr = (gql: GQL): string => {
  const arr = gql.array ? ['[', ']'] : ['', '']
  return arr[0] + gql.prefix + gql.tpe + gql.children + (gql.optional ? '' : '!') + arr[1]
}

const gqlChild = (gql: GQL): string =>
  gqlStr({...gql, prefix: "", children: ""})

const gqlPrim = (tpe: string): GQL =>
  ({prefix: '', tpe, children: '', optional: false, array: false})

type GQLAlg = lib.recurse<'GraphQL', 'GraphQL'> & lib.str<'GraphQL'> & 
  lib.num<'GraphQL'> & lib.dict<'GraphQL', 'Named'> & 
  lib.option<'GraphQL'> & lib.array<'GraphQL'>

export const GQL: () => GQLAlg = () => {
  const cache = memo({})
  const mem = (id: string, fn: () => GQL): GQL => cache(id, fn)
  return {
    str: () => gqlPrim('String'), num: () => gqlPrim('Integer'),
    option: (ga) => ({...ga, optional: true}),
    // TODO - how will you capture T.option(T.array(T.option(x))) with a flat structure ??
    array: (ga) => ({...ga, array: true}),
    recurse: (id, f, map = (x) => x) => map(mem(id, f)),
    dict: ({Named}) => <T>(mkProps: () => lib.Props<'GraphQL', T>) => {
      const tpe = mem(Named, () => 
        ({prefix: '', tpe: Named, children: '', optional: false, array: false})).tpe
      const props = mkProps()
      return ({prefix: 'type ', tpe,
        children: ` { ${Object.keys(props).map(k =>
         `${k}: ${gqlChild(props[k as keyof lib.Props<'GraphQL', T>])};`).join(" ")} }`,
        optional: true, array: false})
    }
  }
};
