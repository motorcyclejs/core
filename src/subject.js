import most from 'most'

const now = fn => setTimeout(fn, 0)

function Subject(initial = null) {
  let _add
  let _end
  let _error

  const stream = most.create((add, end, error) => {
    _add = add
    _end = end
    _error = error
    return _error
  })

  stream.push = v => now(
    () => typeof _add === `function` ? _add(v) : void 0
  )

  stream.end = () => now(
    () => typeof _end === `function` ? _end() : void 0
  )

  stream.error = e => now(
    () => typeof _error === `function` ? _error(e) : void 0
  )

  stream.plug = value$ => {
    value$.forEach(stream.push)
  }

  if (initial !== null) {
    stream.push(initial)
  }

  return stream
}

export default Subject
