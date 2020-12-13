import * as builtins from '../builtins';
import * as lib from '../index';
import type * as fc from 'fast-check';

export const URI = "FastCheck" as const
export type URI = typeof URI

type Fci<A> = lib.IxO<URI, A>

type StrInputs =
  {type: "hexa" | "base64" | "char" | "ascii" | "unicode" | "char16bits" | "fullUnicode" |
    "ipV4" | "ipV4Extended" | "ipV6" | "uuid" | "domain" | "webAuthority" |
    "webFragments" | "webQueryParameters" | "webSegments" | "emailAddress"} |
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
  {type: "double"} & fc.DoubleConstraints |
  {type: "bigInt"} & fc.BigIntConstraints |
  {type: "bigUInt"} & fc.BigUintConstraints |
  {type: "bigIntN" | "bigUIntN", n: number}
export type Num = Fci<NumInputs>

export type Date = Fci<{min?: builtins.JSDate, max?: builtins.JSDate}>

export type Option = Fci<{freq?: number}>

export type Array = Fci<fc.ArrayConstraints>

export type Recurse<A> = {baseCase: A}
type FCRec<A> = Recurse<A>

export type Dict = {}

declare module '../index' {
  export interface GenInputs<A> {
    FastCheckRecurse: FCRec<A>
  }
}
