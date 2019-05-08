const bjs = require('bitcoinjs-lib')
    , b58 = require('bs58check')
    , bip39 = require('bip39')

function fromSeed(seed, network) {
  this.seed = bip39.mnemonicToSeedSync(seed)
  this.isTestnet = network === true ? true : false
  this.network = network === true ? bjs.networks.testnet : bjs.networks.bitcoin
}

fromSeed.prototype.getRootPrivate = function () {
  let masterPrv = this.isTestnet ?
                    vprv(bjs.bip32.fromSeed(this.seed, this.network).toBase58()) :
                      zprv(bjs.bip32.fromSeed(this.seed, this.network).toBase58())

  return masterPrv
}

fromSeed.prototype.getRootPublic = function () {
  let masterPub = this.isTestnet ?
                    vpub(bjs.bip32.fromSeed(this.seed, this.network).neutered().toBase58()) :
                      zpub(bjs.bip32.fromSeed(this.seed, this.network).neutered().toBase58())

  return masterPub
}

fromSeed.prototype.deriveAccount = function (index) {
  let keypath = "m/84'/0'" + '/' + index + "'"
  let masterPrv = this.isTestnet ?
                    vprv(bjs.bip32.fromSeed(this.seed, this.network).derivePath(keypath).toBase58()) :
                      zprv(bjs.bip32.fromSeed(this.seed, this.network).derivePath(keypath).toBase58())

  return masterPrv
}

function toNode(pub) {
  var pub_types = [
    '04b2430c', // zprv
    '04b24746', // zpub
  ]

  // testnet
  var pub_types_testnet = [
    '045f18bc', // vprv
    '045f1cf6', // vpub
  ]

  let payload = b58.decode(pub)
    , version = payload.slice(0, 4)
    , key = payload.slice(4)
    , buffer = undefined

  if (!pub_types.includes(version.toString('hex')) && !pub_types_testnet.includes(version.toString('hex'))) {
    throw new Error('prefix is not supported')
  }

  if (pub_types.includes(version.toString('hex'))) {
    buffer = version.toString('hex') === '04b2430c' ?
      Buffer.concat([Buffer.from('0488ade4','hex'), key]) : // xprv
        Buffer.concat([Buffer.from('0488b21e','hex'), key]) // xpub
  }

  if (pub_types_testnet.includes(version.toString('hex'))) {
    buffer = version.toString('hex') === '045f18bc' ?
      Buffer.concat([Buffer.from('04358394','hex'), key]) : // tprv
        Buffer.concat([Buffer.from('043587cf','hex'), key]) // tpub
  }

  return b58.encode(buffer)
}

function fromZPrv(zprv, network) {
  this.zprv = toNode(zprv)
  this.isTestnet = network === true ? true : false
  this.network = network === true ? bjs.networks.testnet : bjs.networks.bitcoin
}

fromZPrv.prototype.getAccountPrivate = function () {
  let masterPrv = this.isTestnet ?
                    vprv(bjs.bip32.fromBase58(this.zprv, this.network).toBase58()) :
                      zprv(bjs.bip32.fromBase58(this.zprv, this.network).toBase58())

  return masterPrv
}

fromZPrv.prototype.getAccountPublic = function () {
  let masterPub = this.isTestnet ?
                    vpub(bjs.bip32.fromBase58(this.zprv, this.network).neutered().toBase58()) :
                      zpub(bjs.bip32.fromBase58(this.zprv, this.network).neutered().toBase58())

  return masterPub
}

fromZPrv.prototype.getPrivateKey = function (index, isChange) {
  isChange = isChange !== true ? false : true

  let change = isChange !== true ? 0 : 1
    , prvkey = bjs.bip32.fromBase58(this.zprv, this.network).derive(change).derive(index)

  return prvkey.toWIF()
}

fromZPrv.prototype.getPublicKey = function (index, isChange) {
  isChange = isChange !== true ? false : true

  let change = isChange !== true ? 0 : 1
    , prvkey = bjs.bip32.fromBase58(this.zprv, this.network).derive(change).derive(index)

  return prvkey.publicKey.toString('hex')
}

fromZPrv.prototype.getAddress = function (index, isChange) {
  isChange = isChange !== true ? false : true

  let change = isChange !== true ? 0 : 1
    , pubkey = bjs.bip32.fromBase58(this.zprv, this.network).derive(change).derive(index).publicKey

  const payment = bjs.payments.p2wpkh({
    pubkey: pubkey,
    network: this.network
  })

  return payment.address
}

function fromZPub(zpub, network) {
  this.zpub = toNode(zpub)
  this.isTestnet = network === true ? true : false
  this.network = network === true ? bjs.networks.testnet : bjs.networks.bitcoin
}

fromZPub.prototype.getAccountPublic = function () {
  let masterPub = this.isTestnet ?
                    vpub(bjs.bip32.fromBase58(this.zpub, this.network).neutered().toBase58()) :
                      zpub(bjs.bip32.fromBase58(this.zpub, this.network).neutered().toBase58())

  return masterPub
}

fromZPub.prototype.getPublicKey = function (index, isChange) {
  isChange = isChange !== true ? false : true

  let change = isChange !== true ? 0 : 1
    , zpub = bjs.bip32.fromBase58(this.zpub, this.network).derive(change).derive(index)

  return zpub.publicKey.toString('hex')
}

fromZPub.prototype.getAddress = function (index, isChange) {
  isChange = isChange !== true ? false : true

  let change = isChange !== true ? 0 : 1
    , pubkey = bjs.bip32.fromBase58(this.zpub, this.network).derive(change).derive(index).publicKey

  const payment = bjs.payments.p2wpkh({
    pubkey: pubkey,
    network: this.network
  })

  return payment.address
}

function zprv(pub) {
  let payload = b58.decode(pub)
    , version = payload.slice(0, 4)
    , key = payload.slice(4)

  return b58.encode(Buffer.concat([Buffer.from('04b2430c','hex'), key]))
}

function zpub(pub) {
  let payload = b58.decode(pub)
    , version = payload.slice(0, 4)
    , key = payload.slice(4)

  return b58.encode(Buffer.concat([Buffer.from('04b24746','hex'), key]))
}

function vprv(pub) {
  let payload = b58.decode(pub)
    , version = payload.slice(0, 4)
    , key = payload.slice(4)

  return b58.encode(Buffer.concat([Buffer.from('045f18bc','hex'), key]))
}

function vpub(pub) {
  let payload = b58.decode(pub)
    , version = payload.slice(0, 4)
    , key = payload.slice(4)

  return b58.encode(Buffer.concat([Buffer.from('045f1cf6','hex'), key]))
}

module.exports = {
  fromSeed: fromSeed,
  fromZPrv: fromZPrv,
  fromZPub: fromZPub
}
