const bjs = require('bitcoinjs-lib')
    , b58 = require('bs58check')
    , bip39 = require('bip39')

function bip84(pub, network) {
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

  this.network = network && network === 'testnet' ? bjs.networks.testnet : bjs.networks.bitcoin
  this.pub = pub
  this.node = this.toNode()
}

// this function takes zpub/vpub and turns into xpub
bip84.prototype.toNode = function() {
  if (bip39.validateMnemonic(this.pub)) {
    return bip39.mnemonicToSeedSync(this.pub)
  }

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

bip84.prototype.zprv = function (pub) {
  let payload = b58.decode(pub)
    , version = payload.slice(0, 4)
    , key = payload.slice(4)

  return b58.encode(Buffer.concat([Buffer.from('04b2430c','hex'), key]))
}

bip84.prototype.zpub = function (pub) {
  let payload = b58.decode(pub)
    , version = payload.slice(0, 4)
    , key = payload.slice(4)

  return b58.encode(Buffer.concat([Buffer.from('04b24746','hex'), key]))
}

bip84.prototype.getRootPrivate = function () {
  let account = bip39.validateMnemonic(this.pub) ?
        bjs.bip32.fromSeed(this.node).toBase58() :
          bjs.bip32.fromBase58(this.node, this.network).toBase58()

  return this.zprv(account)
}

bip84.prototype.getRootPublic = function () {
  let account = bip39.validateMnemonic(this.pub) ?
        bjs.bip32.fromSeed(this.node).neutered().toBase58() :
          bjs.bip32.fromBase58(this.node, this.network).neutered().toBase58()

  return this.zpub(account)
}

bip84.prototype.deriveAccount = function (index) {
  let account = bip39.validateMnemonic(this.pub) ?
        bjs.bip32.fromSeed(this.node).derivePath("m/84'/0'/" + index + "'").toBase58() :
          bjs.bip32.fromBase58(this.node, this.network).derivePath("m/84'/0'/" + index + "'")

  return this.zprv(account)
}

bip84.prototype.getPrivateKey = function (index, isChange) {
  isChange = isChange !== true ? false : true

  let change = isChange ? 1 : 0

  let prvkey = bip39.validateMnemonic(this.pub) ?
                 bjs.bip32.fromSeed(this.node).derivePath("m/84'/0'/0'").derive(change).derive(index) :
                   bjs.bip32.fromBase58(this.node, this.network).derive(change).derive(index)

  return prvkey.toWIF()
}

bip84.prototype.getPublicKey = function (index, isChange) {
  isChange = isChange !== true ? false : true

  let change = isChange ? 1 : 0
    , pubkey = bip39.validateMnemonic(this.pub) ?
                 bjs.bip32.fromSeed(this.node).derivePath("m/84'/0'/0'").derive(change).derive(index).publicKey :
                   bjs.bip32.fromBase58(this.node, this.network).derive(change).derive(index).publicKey

  return pubkey.toString('hex')
}

// this function takes an index, and turns the pubkey of that node into a Segwit bech32 address
bip84.prototype.getAddress = function (index, isChange) {
  isChange = isChange !== true ? false : true

  let change = isChange ? 1 : 0
    , pubkey = bip39.validateMnemonic(this.pub) ?
                 bjs.bip32.fromSeed(this.node).derivePath("m/84'/0'/0'").derive(change).derive(index).publicKey :
                   bjs.bip32.fromBase58(this.node, this.network).derive(change).derive(index).publicKey

  const payment = bjs.payments.p2wpkh({
    pubkey: pubkey,
    network: this.network
  })

  return payment.address
}

module.exports = bip84
