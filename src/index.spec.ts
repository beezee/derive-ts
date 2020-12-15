import * as o from 'fp-ts/Option';
import * as lib from './index';
import * as gql from './interpreters/graphql';
import * as fci from './interpreters/fastcheck';
import { testProp, fc } from 'ava-fast-check';

type Alg<F extends lib.Output> = 
  lib.recurse<F, "FastCheck"> & lib.str<F, "FastCheck"> & 
  lib.num<F, "FastCheck"> & 
  lib.option<F, "FastCheck"> & lib.array<F, "FastCheck"> &
  lib.dict<F, "Named">
const thingProps = <F extends lib.Output>(T: Alg<F>) => ({
  foo: T.option(T.str({FastCheck: {type: "lorem", mode: "sentences"}}),
    {FastCheck: {freq: 0}}),
  bar: T.num({FastCheck: {type: "float", max: 10}}),
  tail: T.recurse('Thing', () => thing<F>().run(T),
      (x) => T.array(T.option(x, {}), {FastCheck: {minLength: 3, maxLength: 3}}),
      {FastCheck: {baseCase: []}}),
  tail2: T.recurse('Thing', () => thing<F>().run(T),
      (x) => T.array(x, {FastCheck: {minLength: 1, maxLength: 2}}),
      {FastCheck: {baseCase: []}})
});

type Thing = {foo: o.Option<string>, bar: number, tail: o.Option<Thing>[]}

const thing = <F extends lib.Output>(): lib.RunAlg<F, Alg<F>, Thing> =>
  lib.build<F, Alg<F>>()(
    T => T.dict({Named: 'Thing'})(() => thingProps(T)))
const Thing = thing<"Id">()
const arbThing: fc.Arbitrary<Thing> = thing<fci.URI>().run(fci.FastCheck())(3)

const thingNoRec = <F extends lib.Output>() =>
  lib.build<F, Alg<F>>()(
    T => T.dict({Named: 'ThingNoRec'})(() => {
      const {foo, bar} = thingProps(T)
      return {foo, bar}
    }))
const tnr = thingNoRec<"Id">()
type ThingNoRec = lib.TypeOf<typeof tnr>
const arbThingNoRec: fc.Arbitrary<ThingNoRec> = thingNoRec<fci.URI>().run(fci.FastCheck())(0)

const Gql = gql.GQL()
testProp('whatever', [arbThing, arbThingNoRec], (_, t: Thing, tnr: ThingNoRec) => {
  console.log(JSON.stringify(tnr, null, 2), gql.gqlStr(thingNoRec<"GraphQL">().run(Gql)));
  console.log(JSON.stringify(t, null, 2), gql.gqlStr(thing<"GraphQL">().run(Gql)));
});

const takeThing = (_: Thing): void => undefined
takeThing({foo: o.some("hi"), bar: 3, tail: [o.some({foo: o.none, bar: 2, tail: []})]})
