import { expect } from 'chai'
import { fixture } from './shared/fixture'

describe('VexWrapper.factory', function () {
  it('should return the factory address', async function () {
    // Arrange
    const { vexWrapper, factoryAddr } = await fixture()

    // Act + assert
    const factory = await vexWrapper.factory()

    // Assert
    expect(factory).to.equal(factoryAddr)
  })
})
