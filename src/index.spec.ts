import * as o from 'fp-ts/Option';
import * as lib from './index';
import * as gql from './interpreters/graphql';
import * as fci from './interpreters/fastcheck';
import * as fcin from './inputs/fastcheck';
import { testProp, fc } from 'ava-fast-check';

type Alg<F extends lib.Interp> = 
  lib.Recurse<F, "FastCheck_recurse" | "GQL_recurse"> & lib.Str<F, fcin.Str> & 
  lib.Num<F, fcin.Num> & 
  lib.Option<F, "FastCheck_option"> & lib.Array<F, "FastCheck_array"> &
  lib.Dict<F, lib.Named & fcin.Dict>
const thingProps = <F extends lib.Interp>(T: Alg<F>) => ({
  foo: T.option(T.string({FastCheck: {type: "lorem", mode: "sentences"}}),
    {FastCheck_option: {freq: 0}}),
  bar: T.number({FastCheck: {type: "float", max: 10}}),
  tail: T.recurse('Thing', () => thing<F>().run(T),
      (x) => T.array(T.option(x, {}), {FastCheck_array: {minLength: 3, maxLength: 3}}),
      {FastCheck_recurse: {baseCase: []}})
});

type Thing = {foo: o.Option<string>, bar: number, tail: o.Option<Thing>[]}

const thing = <F extends lib.Interp>(): lib.RunAlg<F, Alg<F>, Thing> =>
  lib.build<F, Alg<F>>()(
    T => T.dict({name: 'Thing'})(() => thingProps(T)))
const Thing = thing<"Id">()
const arbThing: fc.Arbitrary<Thing> = thing<fci.URI>().run(fci.FastCheck())(3)

const Gql = gql.GQL()
testProp('whatever', [arbThing], (_, t: Thing) => 
  console.log(JSON.stringify(t, null, 2), gql.gqlStr(thing<"GraphQL">().run(Gql))));

const takeThing = (_: Thing): void => undefined
takeThing({foo: o.some("hi"), bar: 3, tail: [o.some({foo: o.none, bar: 2, tail: []})]})
