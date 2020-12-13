import * as o from 'fp-ts/Option';
import * as fc from 'fast-check';
import * as fci from '../inputs/fastcheck';
import * as lib from '../index';

export const URI = 'FastCheck' as const
export type URI = typeof URI

declare module '../index' {
  export interface Interps<A> {
    [URI]: fc.Memo<A>
  }
}

export type FCAlg = lib.Recurse<URI, "FastCheckRecurse"> 
  & lib.Str<URI, fci.Str> & lib.Num<URI, fci.Num> & 
  lib.Dict<URI, fci.Dict> & lib.Option<URI> & lib.Array<URI>
export const FastCheck: () => FCAlg = () =>
  ({string: (_) => fc.memo(_ => fc.string()), number: (_) => fc.memo(_ => fc.integer()),
    option: (x) => fc.memo(n => fc.option(x(n)).map(o.fromNullable)),
    array: (x) => fc.memo(n => fc.array(x(n))),
    recurse: (_, f, map, i) => fc.memo(n =>
      n <= 1 ? fc.constant(i.FastCheckRecurse.baseCase) : map(f())(n)),
    dict: () => <T>(mkProps: () => lib.Props<URI, T>) => {
      const props = mkProps()
      return fc.memo(n => Object.keys(props).reduce((a, k) =>
        a.chain(o => props[k as keyof T](n-1).map(v => ({...o, [k]: v}))), fc.constant({} as T)))
    }
  })
