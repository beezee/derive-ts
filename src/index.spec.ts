import * as o from 'fp-ts/Option';
import * as lib from './index';
import * as gql from './interpreters/graphql';
import * as fci from './interpreters/fastcheck';
import { testProp, fc } from 'ava-fast-check';
import { buildASTSchema, printSchema } from 'graphql';

type Ops = "str" | "num" | "option" | "array" | "recurse" | "dict"
type Inputs = "FastCheck" | "Named"

type Alg<F extends lib.Target> = lib.Alg<F, Ops, Inputs>
const thingProps = <F extends lib.Target>(T: Alg<F>) => ({
  foo: T.option({
    of: T.str({FastCheck: {type: "lorem", mode: "sentences"}}),
    FastCheck: {freq: 10}}),
  bar: T.num({FastCheck: {type: "float", max: 10}}),
  tail: T.recurse('Thing', () => thing<F>(T),
      (of) => T.array({of: T.option({of}), FastCheck: {minLength: 3, maxLength: 3}}),
      {FastCheck: {baseCase: []}}),
  tail2: T.recurse('Thing', () => thing<F>(T),
      (of) => T.array({of, FastCheck: {minLength: 1, maxLength: 2}}),
      {FastCheck: {baseCase: []}})
});

type Thing = {foo: o.Option<string>, bar: number, tail: o.Option<Thing>[]}

const thing = <F extends lib.Target>(T: Alg<F>): lib.Result<F, Thing> =>
  T.dict({Named: 'Thing', props: () => thingProps(T)})
const arbThing: fc.Arbitrary<Thing> = thing(fci.FastCheck())(3)

const thingNoRecProps = <F extends lib.Target>(T: Alg<F>) => {
  const {foo, bar} = thingProps(T)
  return {foo, bar}
}

const thingNoRec = <F extends lib.Target>(T: Alg<F>) =>
  T.dict({Named: 'ThingNoRec', props: () => thingNoRecProps(T)})

const tnr = thingNoRec(lib.Type)
type ThingNoRec = lib.TypeOf<typeof tnr>
const arbThingNoRec: fc.Arbitrary<ThingNoRec> = thingNoRec(fci.FastCheck())(0)
const takeThingNoRec = (_: ThingNoRec): void => undefined
takeThingNoRec({foo: o.some("hi"), bar: 3})

type ResolverAlg<F extends lib.Target> = lib.Alg<F, Ops | "gqlResolver", Inputs>

const tnrResolver = <F extends lib.Target>(T: ResolverAlg<F>) =>
  T.dict({Named: 'ThingResolvers', props: () =>
    ({...thingNoRecProps(T),
     count: T.gqlResolver({
      parent: thingNoRec(T), args: {Named: "ThingCountInput", props: () => ({foo: T.str({})})},
      context: T.dict({Named: 'TRArgs', props: () => ({})}),
      output: T.num({})})})})

const trs = tnrResolver(lib.Type)
type ThingResolvers = lib.TypeOf<typeof trs>
const takeThingResolvers = (_: ThingResolvers): void => undefined
takeThingResolvers({foo: o.some("hi"), bar: 3,
  count: (parent: ThingNoRec, args: {foo: string}, context: unknown) => Promise.resolve(2)})

const schema = (x: any) =>
  buildASTSchema({kind: "Document", definitions: x})

const Gql = gql.GQL()
testProp('whatever', [arbThing, arbThingNoRec], (_, t: Thing, tnr: ThingNoRec) => {
  thingNoRec(Gql)
  thing(Gql)
  tnrResolver(Gql)
  console.log(JSON.stringify(tnr, null, 2))
  console.log(JSON.stringify(t, null, 2));
  console.log(printSchema(schema(Gql.definitions)))
});

const takeThing = (_: Thing): void => undefined
takeThing({foo: o.some("hi"), bar: 3, tail: [o.some({foo: o.none, bar: 2, tail: []})]})
