export type Recurse<A> = {}
type GQLRec<A> = Recurse<A>

declare module '../index' {
  export interface GenInputs<A> {
    GQLRecurse?: GQLRec<A>
  }
}
