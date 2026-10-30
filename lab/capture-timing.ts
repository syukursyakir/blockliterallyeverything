// Diagnostic reception-time pairing, not provider timing or model decisions.
export function capturePairs(times: readonly number[], gaps: readonly number[] = [200,800,1600], tolerance = 150) {
  if (!Number.isFinite(tolerance) || tolerance < 0 || gaps.some(g => !Number.isFinite(g) || g <= 0) ||
      times.some((t,i) => !Number.isFinite(t) || (i > 0 && t <= times[i-1]))) throw new Error('Invalid capture timing series.')
  return times.flatMap((at,from) => gaps.map(requestedMs => {
    const to=times.findIndex((next,i) => i>from && next>=at+requestedMs)
    if(to<0)return {from,requestedMs,to:null,actualMs:null,status:'horizon-censored' as const}
    const actualMs=times[to]-at
    return {from,requestedMs,to,actualMs,status:actualMs<=requestedMs+tolerance?'measured' as const:'out-of-tolerance' as const}
  }))
}
