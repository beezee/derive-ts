export type Recurse<A> = {}
type GQLRec<A> = Recurse<A>

declare module '../types' {
  export interface recurseInputs<A> {
    GraphQL?: GQLRec<A>
  }
}
