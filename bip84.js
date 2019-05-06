const bjs = require('bitcoinjs-lib')
    , b58 = require('bs58check')

function BIP84(pub) {
  // mainnet
  this.pub_types = [
	'04b24746', // zpub
	'02aa7ed3', // Zpub
  ]

  // testnet
  this.pub_types_testnet = [
	'045f1cf6', // vpub
	'02575483', // Vpub
  ]

  this.buffer = undefined;
  this.network = undefined;
  this.pub = pub;
  this.xpub = undefined;
}

BIP84.prototype.toXPUB = function() {
  let payload = b58.decode(this.pub)
    , version = payload.slice(0, 4)
    , key = payload.slice(4)

  if (!this.pub_types.includes(version.toString('hex')) && !this.pub_types_testnet.includes(version.toString('hex'))) {
    throw new Error('prefix is not supported')
  }

  if (this.pub_types.includes(version.toString('hex'))) {
    buffer = Buffer.concat([Buffer.from('0488b21e','hex'), key]) // xpub
    this.network = bjs.networks.bitcoin
  }

  if (this.pub_types_testnet.includes(version.toString('hex'))) {
    buffer = Buffer.concat([Buffer.from('043587cf','hex'), key]) // tpub
    this.network = bjs.networks.testnet
  }

  return b58.encode(buffer)
}

BIP84.prototype.getAddress = function (index) {
  this.xpub = this.toXPUB(this.pub)

  const payment = bjs.payments.p2wpkh({
    pubkey: bjs.bip32.fromBase58(this.xpub, this.network).derive(0).derive(index).publicKey,
    network: this.network
  })

  return payment.address
}

var testnet = new BIP84('vpub5Vm8JiyeMgCWT2SqgFkoJyaovNQH8RCF3wAUKCrFAfRdVujdYubBrYUGtggtabj71XxvUQuS5r9AgT4VhGvax9gXEpdi9XBg7jHnvm1WDii');
var mainnet = new BIP84('zpub6mxCxqRAQMCArMRMK7MmZwuisKmjHzuxCZtPgs4fYFZB86VRaTB6mdGCtgSHxeMjwyNLYZntdS7pRQdUqTdLuKr2apGhv5dRzNj1Br8uLQ6');

console.log(testnet.getAddress(0));
console.log(mainnet.getAddress(0));
