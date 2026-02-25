import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

describe('Testing Framework Verification', () => {
  it('should run basic unit tests', () => {
    expect(1 + 1).toBe(2)
  })

  it('should run property-based tests with fast-check', () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => {
        return a + b === b + a // commutative property
      })
    )
  })
})
