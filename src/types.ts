import * as o from 'fp-ts/Option';
import * as lib from './index';

// Strings
export interface strInputs<A> extends lib.InterpInputs<A> {}
declare module './index' {
  interface Inputs<A> {
    str: strInputs<A>
  }
}
export type str<O extends lib.Output, I extends keyof strInputs<any> = "Empty"> =
  lib.Alg<'str', O, lib.InputOf<"str", I, string>, string>;

// Numbers
export interface numInputs<A> extends lib.InterpInputs<A> {}
declare module './index' {
  interface Inputs<A> {
    num: numInputs<A>
  }
}
export type num<O extends lib.Output, I extends keyof numInputs<any> = "Empty"> =
  lib.Alg<'num', O, lib.InputOf<"num", I, number>, number>

// Dates
export interface dateInputs<A> extends lib.InterpInputs<A> {}
declare module './index' {
  interface Inputs<A> {
    date: dateInputs<A>
  }
}
export type date<O extends lib.Output, I extends keyof dateInputs<any> = "Empty"> =
  lib.Alg<'date', O, lib.InputOf<"date", I, lib.JSDate>, lib.JSDate>

// Option
export interface optionInputs<A> extends lib.InterpInputs<A> {}
declare module './index' {
  export interface Inputs<A> {
    option: optionInputs<A>
  }
}
export type option<O extends lib.Output, I extends keyof optionInputs<any> = "Empty"> = {
  readonly option: <A>(res: lib.Result<O, A>, i: lib.InputOf<"option", I, A>) => 
    lib.Result<O, o.Option<A>>
}

// Array
export interface arrayInputs<A> extends lib.InterpInputs<A> {}
declare module './index' {
  export interface Inputs<A> {
    array: arrayInputs<A>
  }
}
export type array<O extends lib.Output, I extends keyof arrayInputs<any> = "Empty"> = {
  readonly array: <A>(res: lib.Result<O, A>, i: lib.InputOf<"array", I, A>) =>
    lib.Result<O, A[]>
}

// Recurse
export interface recurseInputs<A> extends lib.InterpInputs<A> {}
declare module './index' {
  export interface Inputs<A> {
    recurse: recurseInputs<A>
  }
}
export type recurse<O extends lib.Output, I extends keyof recurseInputs<any> = "Empty"> = {
  readonly recurse: <A, B>(
    id: string, res: () => lib.Result<O, A>,
    map: (a: lib.Result<O, A>) => lib.Result<O, B>,
    i: lib.InputOf<"recurse", I, B>) => lib.Result<O, B>
}

// Dict
export type Props<O extends lib.Output, T> = { [K in keyof T]: lib.Result<O, T[K]> };
export interface dictInputs<A> extends lib.InterpInputs<A> {
  Named: string
}
declare module './index' {
  export interface Inputs<A> {
    dict: dictInputs<A>
  }
}
export type dict<O extends lib.Output, I extends keyof dictInputs<any> = "Empty"> = {
  dict: (i: lib.InputOf<"dict", I, unknown>) => <T>(props: () => Props<O, T>) =>
    lib.Result<O, T>;
};
