const bjs = require('bitcoinjs-lib')
    , b58 = require('bs58check')
    , bip39 = require('bip39')


/**
 * Constructor
 * Derive accounts from a seed.
 * @param {string} seed
 * @param {boolean} network
 */
function fromSeed(seed, network, testnet, slip44) {
  this.seed = bip39.mnemonicToSeedSync(seed);
  this.isTestnet = testnet === true
  this.slip44 = slip44 !== null ? slip44 : 0;
  if (network !== null) {
    this.network = network; // assume to be bjs.network type
  } else {
    if (testnet) {
      this.network = bjs.networks.testnet;
    } else {
      this.network = bjs.networks.bitcoin;
    }
  }
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
  let keypath = "m/84'/" + this.slip44 + "'/" + index + "'"
  let masterPrv = this.isTestnet ?
                    vprv(bjs.bip32.fromSeed(this.seed, this.network).derivePath(keypath).toBase58()) :
                      zprv(bjs.bip32.fromSeed(this.seed, this.network).derivePath(keypath).toBase58())

  return masterPrv
}

/**
 * Constructor
 * Create key pairs from a private master key.
 * @param {string} zprv/vprv
 */
function fromZPrv(zprv, network, testnet) {
  this.isTestnet = testnet === true ? true : false
  if(network !== null){
    this.network = network; // assume to be bjs.network type
  }
  else{
    if(testnet){
      this.network = bjs.networks.testnet;
    } else{
      this.network = bjs.networks.bitcoin;
    }
  }
  this.zprv = this.toNode(zprv)
}

fromZPrv.prototype.toNode = function (zprv) {
  let payload = b58.decode(zprv)
    , key = payload.slice(4)
    , buffer = undefined

  const buf = Buffer.allocUnsafe(4);
  buf.writeInt32BE(this.network.bip32.private, 0);
  buffer = Buffer.concat([buf, key])
  return b58.encode(buffer)
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

/**
 * Constructor
 * Create public keys and addresses from a public master key.
 * @param {string} zpub/vpub
 */
function fromZPub(zpub, network, testnet) {
  this.isTestnet = testnet === true ? true : false
  if(network !== null){
    this.network = network; // assume to be bjs.network type
  }
  else{
    if(testnet){
      this.network = bjs.networks.testnet;
    } else{
      this.network = bjs.networks.bitcoin;
    }
  }
  this.zpub = this.toNode(zpub)
}

fromZPub.prototype.toNode = function (zpub) {
  let payload = b58.decode(zpub)
    , key = payload.slice(4)
    , buffer = undefined

  
  buffer = Buffer.concat([this.network.bip32.public, key])

  return b58.encode(buffer)
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

  return b58.encode(Buffer.concat([version, key]))
}

function zpub(pub) {
  let payload = b58.decode(pub)
    , version = payload.slice(0, 4)
    , key = payload.slice(4)

  return b58.encode(Buffer.concat([version, key]))
}

function vprv(pub) {
  let payload = b58.decode(pub)
    , version = payload.slice(0, 4)
    , key = payload.slice(4)

  return b58.encode(Buffer.concat([version, key]))
}

function vpub(pub) {
  let payload = b58.decode(pub)
    , version = payload.slice(0, 4)
    , key = payload.slice(4)

  return b58.encode(Buffer.concat([version, key]))
}

module.exports = {
  fromSeed: fromSeed,
  fromZPrv: fromZPrv,
  fromZPub: fromZPub
}
