const BIP84 = require('../src/index')

var testnet = new BIP84('vpub5Vm8JiyeMgCWT2SqgFkoJyaovNQH8RCF3wAUKCrFAfRdVujdYubBrYUGtggtabj71XxvUQuS5r9AgT4VhGvax9gXEpdi9XBg7jHnvm1WDii')
var mainnet = new BIP84('zpub6mxCxqRAQMCArMRMK7MmZwuisKmjHzuxCZtPgs4fYFZB86VRaTB6mdGCtgSHxeMjwyNLYZntdS7pRQdUqTdLuKr2apGhv5dRzNj1Br8uLQ6')

console.log(testnet.getAddress(0))
console.log(mainnet.getAddress(0))
