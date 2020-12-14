import * as o from 'fp-ts/Option';
import * as lib from './index';

// Strings
export interface StrInputs<A> extends lib.InterpInputs<A> {}
declare module './index' {
  interface Inputs<A> {
    string: StrInputs<A>
  }
}
export type Str<O extends lib.Output, I extends keyof StrInputs<any> = "Empty"> =
  lib.Alg<'string', O, lib.InputOf<"string", I, string>, string>;

// Numbers
export interface NumInputs<A> extends lib.InterpInputs<A> {}
declare module './index' {
  interface Inputs<A> {
    number: NumInputs<A>
  }
}
export type Num<O extends lib.Output, I extends keyof NumInputs<any> = "Empty"> =
  lib.Alg<'number', O, lib.InputOf<"number", I, number>, number>

// Dates
export interface DateInputs<A> extends lib.InterpInputs<A> {}
declare module './index' {
  interface Inputs<A> {
    date: DateInputs<A>
  }
}
export type Date<O extends lib.Output, I extends keyof DateInputs<any> = "Empty"> =
  lib.Alg<'date', O, lib.InputOf<"date", I, lib.JSDate>, lib.JSDate>

// Option
export interface OptionInputs<A> extends lib.InterpInputs<A> {}
declare module './index' {
  export interface Inputs<A> {
    option: OptionInputs<A>
  }
}
export type Option<O extends lib.Output, I extends keyof OptionInputs<any> = "Empty"> = {
  readonly option: <A>(res: lib.Result<O, A>, i: lib.InputOf<"option", I, A>) => 
    lib.Result<O, o.Option<A>>
}

// Array
export interface ArrayInputs<A> extends lib.InterpInputs<A> {}
declare module './index' {
  export interface Inputs<A> {
    array: ArrayInputs<A>
  }
}
export type Array<O extends lib.Output, I extends keyof ArrayInputs<any> = "Empty"> = {
  readonly array: <A>(res: lib.Result<O, A>, i: lib.InputOf<"array", I, A>) =>
    lib.Result<O, A[]>
}

// Recurse
export interface RecurseInputs<A> extends lib.InterpInputs<A> {}
declare module './index' {
  export interface Inputs<A> {
    recurse: RecurseInputs<A>
  }
}
export type Recurse<O extends lib.Output, I extends keyof RecurseInputs<any> = "Empty"> = {
  readonly recurse: <A, B>(
    id: string, res: () => lib.Result<O, A>,
    map: (a: lib.Result<O, A>) => lib.Result<O, B>,
    i: lib.InputOf<"recurse", I, B>) => lib.Result<O, B>
}

// Dict
export type Props<O extends lib.Output, T> = { [K in keyof T]: lib.Result<O, T[K]> };
export interface DictInputs<A> extends lib.InterpInputs<A> {
  Named: string
}
declare module './index' {
  export interface Inputs<A> {
    dict: DictInputs<A>
  }
}
export type Dict<O extends lib.Output, I extends keyof DictInputs<any> = "Empty"> = {
  dict: (i: lib.InputOf<"dict", I, unknown>) => <T>(props: () => Props<O, T>) =>
    lib.Result<O, T>;
};
