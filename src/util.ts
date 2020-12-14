export const memo = (cache: Record<string, any>) => <A>(i: string, fn: () => A): A => {
  if (i in cache) return (cache[i] as A)
  cache[i] = fn()
  return (i in cache) ? (cache[i] as A) : fn()
}
