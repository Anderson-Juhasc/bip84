const bjs = require('bitcoinjs-lib')
    , b58 = require('bs58check')

function bip84(pub) {
  // mainnet
  this.pub_types = [
    '04b2430c', // zprv
    '04b24746', // zpub
  ]

  // testnet
  this.pub_types_testnet = [
    '045f18bc', // vprv
    '045f1cf6', // vpub
  ]

  this.network = undefined
  this.pub = pub
  this.node = this.toNode()
}

// this function takes zpub/vpub and turns into xpub
bip84.prototype.toNode = function() {
  let payload = b58.decode(this.pub)
    , version = payload.slice(0, 4)
    , key = payload.slice(4)
    , buffer = undefined

  if (!this.pub_types.includes(version.toString('hex')) && !this.pub_types_testnet.includes(version.toString('hex'))) {
    throw new Error('prefix is not supported')
  }

  if (this.pub_types.includes(version.toString('hex'))) {
    buffer = version.toString('hex') === '04b2430c' ?
      Buffer.concat([Buffer.from('0488ade4','hex'), key]) : // xprv
        Buffer.concat([Buffer.from('0488b21e','hex'), key]) // xpub

    this.network = bjs.networks.bitcoin
  }

  if (this.pub_types_testnet.includes(version.toString('hex'))) {
    buffer = version.toString('hex') === '045f18bc' ?
      Buffer.concat([Buffer.from('04358394','hex'), key]) : // tprv
        Buffer.concat([Buffer.from('043587cf','hex'), key]) // tpub

    this.network = bjs.networks.testnet
  }

  return b58.encode(buffer)
}

// this function takes an index, and turns the pubkey of that node into a Segwit bech32 address
bip84.prototype.getAddress = function (index, isChange) {
  isChange = isChange !== true ? false : true
  let change = isChange ? 1 : 0

  const payment = bjs.payments.p2wpkh({
    pubkey: bjs.bip32.fromBase58(this.node, this.network).derive(change).derive(index).publicKey,
    network: this.network
  })

  return payment.address
}

module.exports = bip84
