import * as fn from 'fp-ts/function';
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

const string = ({FastCheck: input}: fci.Str): fc.Memo<string> => fc.memo(_ => {
  if (!input) return fc.string()
  // because of this https://github.com/microsoft/TypeScript/issues/33591
  switch (input.type) {
    case "string": case "hexa": case "base64": case "char": case "ascii": case "unicode":
    case "char16bits": case "fullUnicode": case "ipV4": case "ipV4Extended":
    case "ipV6": case "uuid": case "domain": case "webAuthority":
    case "webFragments": case "webQueryParameters": case "webSegment": case "emailAddress":
      return fc[input.type]() as fc.Arbitrary<string>
    case "webUrl":
      return fc.webUrl(input)
    case "uuidV":
      return fc.uuidV(input.version)
    case "hexaString": case "base64String": case "string": case "asciiString":
    case "unicodeString": case "string16bits": case "fullUnicodeString":
      return fc[input.type](input) as fc.Arbitrary<string>
    case "json": case "unicodeJson":
      return fc[input.type](input) as fc.Arbitrary<string>
    case "lorem":
      return fc.lorem(input)
    default:
      return fn.absurd(input)
  }
})

const number = ({FastCheck: input}: fci.Num): fc.Memo<number> => fc.memo(_ => {
  if (!input) return fc.integer()
  // because of this https://github.com/microsoft/TypeScript/issues/33591
  switch(input.type) {
    case "integer":
      return fc.integer(input)
    case "maxSafeInteger": case "maxSafeNat":
      return fc[input.type]()
    case "nat":
      return fc.nat(input)
    case "float":
      return fc[input.type](input)
    case "double":
      return fc[input.type](input)
    // These return a different type. Determine whether to support `bigint`
    /*case "bigInt":
      return fc[input.type](input)
    case "bigUint":
      return fc[input.type](input)
    case "bigIntN": case "bigUintN":
      return fc[input.type](input.n)*/
    default:
      return fn.absurd(input)
  }
})

export type FCAlg = lib.Recurse<URI, "FastCheck_recurse"> 
  & lib.Str<URI, fci.Str> & lib.Num<URI, fci.Num> & 
  lib.Dict<URI, fci.Dict> & lib.Option<URI, "FastCheck_option"> & 
  lib.Array<URI, "FastCheck_array">
export const FastCheck: () => FCAlg = () =>
  ({string, number, 
    option: (x, {FastCheck_option: input}) => 
      fc.memo(n => fc.option(x(n), input || {}).map(o.fromNullable)),
    array: (x, {FastCheck_array: input}) => fc.memo(n => fc.array(x(n), input || {})),
    recurse: (_, f, map, i) => fc.memo(n =>
      n <= 1 ? fc.constant(i.FastCheck_recurse.baseCase) : map(f())(n)),
    dict: () => <T>(mkProps: () => lib.Props<URI, T>) => {
      const props = mkProps()
      return fc.memo(n => Object.keys(props).reduce((a, k) =>
        a.chain(o => props[k as keyof T](n-1).map(v => ({...o, [k]: v}))), fc.constant({} as T)))
    }
  })
