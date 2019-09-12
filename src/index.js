const bjs = require('bitcoinjs-lib')
    , b58 = require('bs58check')
    , bip39 = require('bip39')

const bitcoinPubTypes = { zprv: '04b2430c', zpub: '04b24746'}
const bitcoinTestnetPubTypes = { vprv: '045f18bc', vpub: '045f1cf6'}

/**
 * Constructor
 * Derive accounts from a seed.
 * @param {string} seed
 * @param {object} network
 * @param {number} slip44
 * @param {boolean} testnet
 */
function fromSeed(seed, network, slip44, pub_types, testnet) {
  this.seed = bip39.mnemonicToSeedSync(seed)
  this.isTestnet = testnet === true
  this.slip44 = slip44 ? slip44 : 0
  this.pub_types = pub_types || { mainnet: bitcoinPubTypes, testnet: bitcoinTestnetPubTypes }

  if (network) {
    this.network = network // assume to be bjs.network type
  } else {
    this.network = testnet ? bjs.networks.testnet : bjs.networks.bitcoin
  }
}

fromSeed.prototype.getRootPrivate = function () {
  let masterPrv = this.isTestnet ?
                    vprv(bjs.bip32.fromSeed(this.seed, this.network).toBase58(), this.pub_types.testnet.vprv) :
                      zprv(bjs.bip32.fromSeed(this.seed, this.network).toBase58(), this.pub_types.mainnet.zprv)

  return masterPrv
}

fromSeed.prototype.getRootPublic = function () {
  let masterPub = this.isTestnet ?
                    vpub(bjs.bip32.fromSeed(this.seed, this.network).neutered().toBase58(), this.pub_types.testnet.vpub) :
                      zpub(bjs.bip32.fromSeed(this.seed, this.network).neutered().toBase58(), this.pub_types.mainnet.zpub)

  return masterPub
}

fromSeed.prototype.deriveAccount = function (index) {
  let keypath = "m/84'/" + this.slip44 + "'/" + index + "'"
  let masterPrv = this.isTestnet ?
                    vprv(bjs.bip32.fromSeed(this.seed, this.network).derivePath(keypath).toBase58(), this.pub_types.testnet.vprv) :
                      zprv(bjs.bip32.fromSeed(this.seed, this.network).derivePath(keypath).toBase58(),  this.pub_types.mainnet.zprv)

  return masterPrv
}

/**
 * Constructor
 * Create key pairs from a private master key.
 * @param {string} zprv/vprv
 * @param {object} networks
 * @param {object} pub_types
 * @param {boolean} testnet
 */
function fromZPrv(zprv, networks, pub_types, testnet) {
  this.isTestnet = testnet === true
  this.pub_types = pub_types || { mainnet: bitcoinPubTypes, testnet: bitcoinTestnetPubTypes }
  this.networks = networks || { mainnet: bjs.networks.bitcoin, testnet: bjs.networks.testnet }
  this.network = undefined
  this.zprv = this.toNode(zprv)
}

fromZPrv.prototype.toNode = function (zprv) {
  let payload = b58.decode(zprv)
    , version = payload.slice(0, 4)
    , key = payload.slice(4)
    , buffer = undefined

  if (!Object.values(this.pub_types.mainnet).includes(version.toString('hex')) && !Object.values(this.pub_types.testnet).includes(version.toString('hex'))) {
    throw new Error('prefix is not supported')
  }

  if (Object.values(this.pub_types.mainnet).includes(version.toString('hex'))) {
    const buf = Buffer.allocUnsafe(4)
    buf.writeInt32BE(this.networks.mainnet.bip32.private, 0)
    buffer = Buffer.concat([buf, key]) // xprv
    this.network = this.networks.mainnet
    this.isTestnet = false
  }

  if (Object.values(this.pub_types.testnet).includes(version.toString('hex'))) {
    const buf = Buffer.allocUnsafe(4)
    buf.writeInt32BE(this.networks.testnet.bip32.private, 0)
    buffer = Buffer.concat([buf, key]) // xprv
    this.network = this.networks.testnet
    this.isTestnet = true
  }

  return b58.encode(buffer)
}

fromZPrv.prototype.getAccountPrivate = function () {
  let masterPrv = this.isTestnet ?
                    vprv(bjs.bip32.fromBase58(this.zprv, this.network).toBase58(), this.pub_types.testnet.vprv) :
                      zprv(bjs.bip32.fromBase58(this.zprv, this.network).toBase58(), this.pub_types.mainnet.zprv)

  return masterPrv
}

fromZPrv.prototype.getAccountPublic = function () {
  let masterPub = this.isTestnet ?
                    vpub(bjs.bip32.fromBase58(this.zprv, this.network).neutered().toBase58(), this.pub_types.testnet.vpub) :
                      zpub(bjs.bip32.fromBase58(this.zprv, this.network).neutered().toBase58(), this.pub_types.mainnet.zpub)

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

fromZPrv.prototype.getKeypair = function (index, isChange) {
  isChange = isChange !== true ? false : true

  let change = isChange !== true ? 0 : 1
    , prvkey = bjs.bip32.fromBase58(this.zprv, this.network).derive(change).derive(index)

  return prvkey
}

/**
 * Constructor
 * Create public keys and addresses from a public master key.
 * @param {string} zpub/vpub
 * @param {object} networks
 * @param {object} pub_types
 * @param {boolean} testnet
 */
function fromZPub(zpub, networks, pub_types, testnet) {
  this.isTestnet = testnet === true
  this.pub_types = pub_types || { mainnet: bitcoinPubTypes, testnet: bitcoinTestnetPubTypes }
  this.networks = networks || { mainnet: bjs.networks.bitcoin, testnet: bjs.networks.testnet }
  this.network = undefined
  this.zpub = this.toNode(zpub)
}

fromZPub.prototype.toNode = function (zpub) {
  let payload = b58.decode(zpub)
    , version = payload.slice(0, 4)
    , key = payload.slice(4)
    , buffer = undefined

  if (!Object.values(this.pub_types.mainnet).includes(version.toString('hex')) && !Object.values(this.pub_types.testnet).includes(version.toString('hex'))) {
    throw new Error('prefix is not supported')
  }

  if (Object.values(this.pub_types.mainnet).includes(version.toString('hex'))) {
    const buf = Buffer.allocUnsafe(4)
    buf.writeInt32BE(this.networks.mainnet.bip32.public, 0)
    buffer = Buffer.concat([buf, key]) // xprv
    this.network = this.networks.mainnet
    this.isTestnet = false
  }

  if (Object.values(this.pub_types.testnet).includes(version.toString('hex'))) {
    const buf = Buffer.allocUnsafe(4)
    buf.writeInt32BE(this.networks.testnet.bip32.public, 0)
    buffer = Buffer.concat([buf, key]) // xprv
    this.network = this.networks.testnet
    this.isTestnet = true
  }

  return b58.encode(buffer)
}

fromZPub.prototype.getAccountPublic = function () {
  let masterPub = this.isTestnet ?
                    vpub(bjs.bip32.fromBase58(this.zpub, this.network).neutered().toBase58(), this.pub_types.testnet.vpub) :
                      zpub(bjs.bip32.fromBase58(this.zpub, this.network).neutered().toBase58(), this.pub_types.mainnet.zpub)

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

fromZPub.prototype.getPayment = function (index, isChange) {
  isChange = isChange !== true ? false : true

  let change = isChange !== true ? 0 : 1
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
