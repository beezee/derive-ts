import * as o from 'fp-ts/Option';
import * as builtins from './builtins';
import * as t from 'typelevel-ts';

export interface Interps<A> {
  Id: A
};

export type Interp = keyof Interps<unknown>;
export type Result<F extends Interp, A> = Interps<A>[F];

export interface GenInputs<A> {
  _A?: A
  Unknown?: undefined
}
export type GenInput = keyof GenInputs<unknown>
export type InputOf<F extends GenInput, A> =
  {[k in F & t.RequiredKeys<GenInputs<A>>]: GenInputs<A>[k]} &
  {[k in F & t.OptionalKeys<GenInputs<A>>]?: GenInputs<A>[k]}

export type Ix<K extends string, A> = { readonly [key in K]: A }
export type IxO<K extends string, A> = { readonly [key in K]?: A }
export type Alg<K extends string, F extends Interp, I, A> = Ix<K, (i: I) => Result<F, A>>

export type Str<F extends Interp, I = {}> = Alg<'string', F, I, string>;
export type Num<F extends Interp, I = {}> = Alg<'number', F, I, number>;

export type Date<F extends Interp, I = {}> = Alg<'date', F, I, builtins.JSDate>

export type Option<F extends Interp, I extends GenInput = "Unknown"> = {
  readonly option: <A>(res: Result<F, A>, i: InputOf<I, A>) => Result<F, o.Option<A>>
}
export type Array<F extends Interp, I extends GenInput = "Unknown"> = {
  readonly array: <A>(res: Result<F, A>, i: InputOf<I, A>) => Result<F, A[]>
}
export type Recurse<F extends Interp, I extends GenInput = "Unknown"> = {
  readonly recurse: <A, B>(
    id: string, res: () => Result<F, A>,
    map: (a: Result<F, A>) => Result<F, B>,
    i: InputOf<I, B>) => Result<F, B>
}

export type Props<F extends Interp, T> = { [K in keyof T]: Result<F, T[K]> };

export type Dict<F extends Interp, I> = {
  dict: (i: I) => <T>(props: () => Props<F, T>) => Result<F, T>;
};

export interface RunAlg<F extends Interp, Alg, A> {
  run: (T: Alg) => Result<F, A>
}

export interface BuildAlg<F extends Interp, Alg> {
  run: <A>(T: Alg) => Result<F, A>
}

export const build = <F extends Interp, Alg>() =>
  <A>(run: (T: Alg) => Result<F, A>): RunAlg<F, Alg, A> => ({run})

export type TypeOf<A> = A extends RunAlg<any, any, infer T> ? T : never

export const memo = (cache: Record<string, any>) => <A>(i: string, fn: () => A): A => {
  if (i in cache) return (cache[i] as A)
  cache[i] = fn()
  return (i in cache) ? (cache[i] as A) : fn()
}

export type Named = {name: string}
