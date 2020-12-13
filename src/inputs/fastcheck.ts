import * as builtins from '../builtins';
import * as lib from '../index';
import type * as fc from 'fast-check';

export const URI = "FastCheck" as const
export type URI = typeof URI

type Fci<A> = lib.IxO<URI, A>

type StrInputs =
  {type: "hexa" | "base64" | "char" | "ascii" | "unicode" | "char16bits" | "fullUnicode" |
    "ipV4" | "ipV4Extended" | "ipV6" | "uuid" | "domain" | "webAuthority" |
    "webFragments" | "webQueryParameters" | "webSegment" | "emailAddress"} |
  {type: "webUrl"} & fc.WebUrlConstraints |
  {type: "uuidV", version: 1 | 2 | 3 | 4 | 5} |
  {type: "hexaString" | "base64String" | "string" | "asciiString" |
    "unicodeString" | "string16bits" | "fullUnicodeString"} & fc.StringSharedConstraints |
  {type: "json" | "unicodeJson"} & fc.JsonSharedConstraints |
  {type: "lorem"} & fc.LoremConstraints
export type Str = Fci<StrInputs>

type NumInputs =
  {type: "maxSafeInteger" | "maxSafeNat"} |
  {type: "integer"} & fc.IntegerConstraints |
  {type: "nat"} & fc.NatConstraints |
  {type: "float"} & fc.FloatConstraints |
  {type: "double"} & fc.DoubleConstraints //|
  // These return a different type. Determine whether to support `bigint`
  /*{type: "bigInt"} & fc.BigIntConstraints |
  {type: "bigUint"} & fc.BigUintConstraints |
  {type: "bigIntN" | "bigUintN", n: number}*/
export type Num = Fci<NumInputs>

export type Date = Fci<{min?: builtins.JSDate, max?: builtins.JSDate}>

export type Option = Fci<{freq?: number}>

export type Array = Fci<fc.ArrayConstraints>

export type Recurse<A> = {baseCase: A}
type FCRec<A> = Recurse<A>

export type Dict = {}

declare module '../index' {
  export interface GenInputs<A> {
    FastCheck_recurse: FCRec<A>
    FastCheck_option?: {freq?: number}
    FastCheck_array?: fc.ArrayConstraints
  }
}
