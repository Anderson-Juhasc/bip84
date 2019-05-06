const bjs = require('bitcoinjs-lib')
    , b58 = require('bs58check')

function bip84(pub) {
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

  this.buffer = undefined
  this.network = undefined
  this.pub = pub
  this.xpub = undefined
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

exports = bip84
