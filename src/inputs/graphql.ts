export type Recurse<A> = {}
type GQLRec<A> = Recurse<A>

declare module '../types' {
  export interface RecurseInputs<A> {
    GraphQL?: GQLRec<A>
  }
}
