const bjs = require('bitcoinjs-lib')
    , b58 = require('bs58check')
    , bip39 = require('bip39')
    , bitcoinPubTypes = { mainnet: { zprv: '04b2430c', zpub: '04b24746'}, testnet: { vprv: '045f18bc', vpub: '045f1cf6'} }
    , bitcoinNetworks = { mainnet: bjs.networks.bitcoin, testnet: bjs.networks.testnet }

/**
 * Constructor
 * Derive accounts from a seed.
 * @param {string} seed
 * @param {boolean} isTestnet
 * @param {number} slip44
 * @param {object} pubTypes
 * @param {object} network
 */
function fromSeed(seed, isTestnet, slip44, pubTypes, network) {
  this.seed = bip39.mnemonicToSeedSync(seed)
  this.isTestnet = isTestnet === true
  this.slip44 = this.isTestnet ? 1 : slip44 ? slip44 : 0 // 0 is for Bitcoin and 1 is testnet for all coins
  this.pubTypes = pubTypes || bitcoinPubTypes
  this.network = network || this.isTestnet ? bitcoinNetworks.testnet : bitcoinNetworks.bitcoin
}

fromSeed.prototype.getRootPrivateKey = function () {
  let prv = bjs.bip32.fromSeed(this.seed, this.network).toBase58()
    , masterPrv = this.isTestnet ?
                    vprv(prv, this.pubTypes.testnet.vprv) :
                      zprv(prv, this.pubTypes.mainnet.zprv)

  return masterPrv
}

fromSeed.prototype.getRootPublicKey = function () {
  let pub = bjs.bip32.fromSeed(this.seed, this.network).neutered().toBase58()
    , masterPub = this.isTestnet ?
                    vpub(pub, this.pubTypes.testnet.vpub) :
                      zpub(pub, this.pubTypes.mainnet.zpub)

  return masterPub
}

fromSeed.prototype.deriveAccount = function (index, bipNum) {
  let bip = bipNum || '84'
		, keypath = "m/" + bip + "'/" + this.slip44 + "'/" + index + "'"
    , account = bjs.bip32.fromSeed(this.seed, this.network).derivePath(keypath).toBase58()
    , masterPrv = this.isTestnet ?
                    vprv(account, this.pubTypes.testnet.vprv) :
                      zprv(account, this.pubTypes.mainnet.zprv)

  return masterPrv
}

/**
 * Constructor
 * Create key pairs from a private master key of mainnet and testnet.
 * @param {string} zprv/vprv
 * @param {object} pubTypes
 * @param {object} networks
 */
function fromZPrv(zprv, pubTypes, networks) {
  this.pubTypes = pubTypes || bitcoinPubTypes
  this.networks = networks || bitcoinNetworks
  this.zprv = this.toNode(zprv)
}

fromZPrv.prototype.toNode = function (zprv) {
  let payload = b58.decode(zprv)
    , version = payload.slice(0, 4)
    , key = payload.slice(4)
    , buffer = undefined

  if (!Object.values(this.pubTypes.mainnet).includes(version.toString('hex')) && !Object.values(this.pubTypes.testnet).includes(version.toString('hex'))) {
    throw new Error('prefix is not supported')
  }

  if (Object.values(this.pubTypes.mainnet).includes(version.toString('hex'))) {
    const buf = Buffer.allocUnsafe(4)
    buf.writeInt32BE(this.networks.mainnet.bip32.private, 0)
    buffer = Buffer.concat([buf, key]) // zprv
    this.network = this.networks.mainnet
    this.isTestnet = false
  }

  if (Object.values(this.pubTypes.testnet).includes(version.toString('hex'))) {
    const buf = Buffer.allocUnsafe(4)
    buf.writeInt32BE(this.networks.testnet.bip32.private, 0)
    buffer = Buffer.concat([buf, key]) // vprv
    this.network = this.networks.testnet
    this.isTestnet = true
  }

  return b58.encode(buffer)
}

fromZPrv.prototype.getAccountPrivateKey = function () {
  let pub = bjs.bip32.fromBase58(this.zprv, this.network).toBase58()
    , masterPrv = this.isTestnet ?
                    vprv(pub, this.pubTypes.testnet.vprv) :
                      zprv(pub, this.pubTypes.mainnet.zprv)

  return masterPrv
}

fromZPrv.prototype.getAccountPublicKey = function () {
  let pub = bjs.bip32.fromBase58(this.zprv, this.network).neutered().toBase58()
    , masterPub = this.isTestnet ?
                    vpub(pub, this.pubTypes.testnet.vpub) :
                      zpub(pub, this.pubTypes.mainnet.zpub)

  return masterPub
}

fromZPrv.prototype.getPrivateKey = function (index, isChange) {
  let change = isChange === true ? 1 : 0
    , prvkey = bjs.bip32.fromBase58(this.zprv, this.network).derive(change).derive(index)

  return prvkey.toWIF()
}

fromZPrv.prototype.getPublicKey = function (index, isChange) {
  let change = isChange === true ? 1 : 0
    , prvkey = bjs.bip32.fromBase58(this.zprv, this.network).derive(change).derive(index)

  return prvkey.publicKey.toString('hex')
}

fromZPrv.prototype.getAddress = function (index, isChange) {
  let change = isChange === true ? 1 : 0
    , pubkey = bjs.bip32.fromBase58(this.zprv, this.network).derive(change).derive(index).publicKey

  const payment = bjs.payments.p2wpkh({
    pubkey: pubkey,
    network: this.network
  })

  return payment.address
}

fromZPrv.prototype.getKeypair = function (index, isChange) {
  let change = isChange === true ? 1 : 0
    , prvkey = bjs.bip32.fromBase58(this.zprv, this.network).derive(change).derive(index)

  return prvkey
}

/**
 * Constructor
 * Create public keys and addresses from a public master key of mainnet and testnet.
 * @param {string} zpub/vpub
 * @param {object} pubTypes
 * @param {object} networks
 */
function fromZPub(zpub, pubTypes, networks) {
  this.pubTypes = pubTypes || bitcoinPubTypes
  this.networks = networks || bitcoinNetworks
  this.zpub = this.toNode(zpub)
}

fromZPub.prototype.toNode = function (zpub) {
  let payload = b58.decode(zpub)
    , version = payload.slice(0, 4)
    , key = payload.slice(4)
    , buffer = undefined

  if (!Object.values(this.pubTypes.mainnet).includes(version.toString('hex')) && !Object.values(this.pubTypes.testnet).includes(version.toString('hex'))) {
    throw new Error('prefix is not supported')
  }

  if (Object.values(this.pubTypes.mainnet).includes(version.toString('hex'))) {
    const buf = Buffer.allocUnsafe(4)
    buf.writeInt32BE(this.networks.mainnet.bip32.public, 0)
    buffer = Buffer.concat([buf, key]) // zpub
    this.network = this.networks.mainnet
    this.isTestnet = false
  }

  if (Object.values(this.pubTypes.testnet).includes(version.toString('hex'))) {
    const buf = Buffer.allocUnsafe(4)
    buf.writeInt32BE(this.networks.testnet.bip32.public, 0)
    buffer = Buffer.concat([buf, key]) // vpub
    this.network = this.networks.testnet
    this.isTestnet = true
  }

  return b58.encode(buffer)
}

fromZPub.prototype.getAccountPublicKey = function () {
  let pub = bjs.bip32.fromBase58(this.zpub, this.network).neutered().toBase58()
  let masterPub = this.isTestnet ?
                    vpub(pub, this.pubTypes.testnet.vpub) :
                      zpub(pub, this.pubTypes.mainnet.zpub)

  return masterPub
}

fromZPub.prototype.getPublicKey = function (index, isChange) {
  let change = isChange === true ? 1 : 0
    , zpub = bjs.bip32.fromBase58(this.zpub, this.network).derive(change).derive(index)

  return zpub.publicKey.toString('hex')
}

fromZPub.prototype.getAddress = function (index, isChange) {
  let change = isChange === true ? 1 : 0
    , pubkey = bjs.bip32.fromBase58(this.zpub, this.network).derive(change).derive(index).publicKey

  const payment = bjs.payments.p2wpkh({
    pubkey: pubkey,
    network: this.network
  })

  return payment.address
}

fromZPub.prototype.getPayment = function (index, isChange) {
  let change = isChange === true ? 1 : 0
    , pubkey = bjs.bip32.fromBase58(this.zpub, this.network).derive(change).derive(index).publicKey

  const payment = bjs.payments.p2wpkh({
    pubkey: pubkey,
    network: this.network
  })

  return payment
}

function zprv(pub, data) {
  let payload = b58.decode(pub)
    , version = payload.slice(0, 4)
    , key = payload.slice(4)

  return b58.encode(Buffer.concat([Buffer.from(data,'hex'), key]))
}

function zpub(pub, data) {
  let payload = b58.decode(pub)
    , version = payload.slice(0, 4)
    , key = payload.slice(4)

  return b58.encode(Buffer.concat([Buffer.from(data,'hex'), key]))
}

function vprv(pub, data) {
  let payload = b58.decode(pub)
    , version = payload.slice(0, 4)
    , key = payload.slice(4)

  return b58.encode(Buffer.concat([Buffer.from(data,'hex'), key]))
}

function vpub(pub, data) {
  let payload = b58.decode(pub)
    , version = payload.slice(0, 4)
    , key = payload.slice(4)

  return b58.encode(Buffer.concat([Buffer.from(data,'hex'), key]))
}

module.exports = {
  fromSeed: fromSeed,
  fromZPrv: fromZPrv,
  fromZPub: fromZPub
}
