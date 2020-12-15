import * as t from 'typelevel-ts';
export * from './types';
export * from './builtins';

export interface Outputs<A> {
  Id: A
};

export type Output = keyof Outputs<any>
export type Result<O extends Output, A> = Outputs<A>[O];

export interface InterpInputs<A> {
  _A?: A
  Empty?: {}
}
export interface Inputs<A> {}
  
export type Input = keyof Inputs<any>
export type InputOf<O extends Input, I extends keyof Inputs<any>[O], A> =
  {[k in I & t.RequiredKeys<Inputs<A>[O]>]: Inputs<A>[O][k]} &
  {[k in I & t.OptionalKeys<Inputs<A>[O]>]?: Inputs<A>[O][k]}

export type Ix<K extends string, A> = { readonly [key in K]: A }
export type IxO<K extends string, A> = { readonly [key in K]?: A }
export type Alg<K extends string, O extends Output, I extends object, A> = Ix<K, <T extends t.Exact<I, T>>(i: T) => Result<O, A>>

export type AlgInput<A, K extends string> = A extends Alg<K, any, infer I, any> 
  ? I extends InputOf<infer X, infer II, any>
    ? II : never
  : never

export interface RunAlg<O extends Output, Alg, A> {
  run: (T: Alg) => Result<O, A>
}

export interface BuildAlg<O extends Output, Alg> {
  run: <A>(T: Alg) => Result<O, A>
}

export const build = <O extends Output, Alg>() =>
  <A>(run: (T: Alg) => Result<O, A>): RunAlg<O, Alg, A> => ({run})

export type TypeOf<A> = A extends RunAlg<any, any, infer T> ? T : never
