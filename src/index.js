const { networks, payments } = require('bitcoinjs-lib')
const { BIP32Factory } = require('bip32')
const ecc = require('@bitcoinerlab/secp256k1')
const bip32 = BIP32Factory(ecc)
const b58 = require('bs58check')
const bip39 = require('bip39')
const bitcoinPubTypes = { mainnet: { zprv: '04b2430c', zpub: '04b24746'}, testnet: { vprv: '045f18bc', vpub: '045f1cf6'} }
const bitcoinNetworks = { mainnet: networks.bitcoin, testnet: networks.testnet }

/**
 * Constructor
 * Derive accounts from a mnemonic.
 * @param {string} mnemonic
 * @param {string} password
 * @param {boolean} isTestnet
 * @param {number} coinType - slip44
 * @param {object} pubTypes
 * @param {object} network
 * @return 
 */
function fromMnemonic(mnemonic, password, isTestnet, coinType, pubTypes, network) {
  if (!bip39.validateMnemonic(mnemonic)) throw new Error('could not validate mnemonic words')
  this.seed = bip39.mnemonicToSeedSync(mnemonic, password ? password : '')
  this.isTestnet = isTestnet === true
  this.coinType = this.isTestnet ? 1 : coinType ? coinType : 0 // 0 is for Bitcoin and 1 is testnet for all coins
  this.pubTypes = pubTypes || bitcoinPubTypes
  this.network = network || (this.isTestnet ? bitcoinNetworks.testnet : bitcoinNetworks.mainnet)
}

/**
 * Get root master private key
 * @return {string}
 */
fromMnemonic.prototype.getRootPrivateKey = function () {
  let prv = bip32.fromSeed(this.seed, this.network).toBase58()
    , masterPrv = this.isTestnet ?
                    b58Encode(prv, this.pubTypes.testnet.vprv) :
                      b58Encode(prv, this.pubTypes.mainnet.zprv)

  return masterPrv
}

/**
 * Get root master public key
 * @return {string}
 */
fromMnemonic.prototype.getRootPublicKey = function () {
  let pub = bip32.fromSeed(this.seed, this.network).neutered().toBase58()
    , masterPub = this.isTestnet ?
                    b58Encode(pub, this.pubTypes.testnet.vpub) :
                      b58Encode(pub, this.pubTypes.mainnet.zpub)

  return masterPub
}

/**
 * Derive a new master private key
 * @param {number} number
 * @param {number} changePurpose
 * @return {string}
 */
fromMnemonic.prototype.deriveAccount = function (number, changePurpose) {
	let purpose = changePurpose || 84
		, keypath = "m/" + purpose + "'/" + this.coinType + "'/" + number + "'"
    , account = bip32.fromSeed(this.seed, this.network).derivePath(keypath).toBase58()
    , masterPrv = this.isTestnet ?
                    b58Encode(account, this.pubTypes.testnet.vprv) :
                      b58Encode(account, this.pubTypes.mainnet.zprv)

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

const byteToHex = (byte) => {
  const key = '0123456789abcdef'
  let bytes = new Uint8Array(byte)
  let newHex = ''
  let currentChar = 0
  for (let i=0; i<bytes.length; i++) { // Go over each 8-bit byte
    currentChar = (bytes[i] >> 4)      // First 4-bits for first hex char
    newHex += key[currentChar]         // Add first hex char to string
    currentChar = (bytes[i] & 15)      // Erase first 4-bits, get last 4-bits for second hex char
    newHex += key[currentChar]         // Add second hex char to string
  }
  return newHex
}

fromZPrv.prototype.toNode = function (zprv) {
  let payload = b58.decode(zprv)
    , prefix = byteToHex(payload.slice(0, 4))
    , key = payload.slice(4)
    , buffer = undefined

  if (!Object.values(this.pubTypes.mainnet).includes(prefix) && !Object.values(this.pubTypes.testnet).includes(prefix)) {
    throw new Error('prefix is not supported')
  }

  if (Object.values(this.pubTypes.mainnet).includes(prefix)) {
    const buf = Buffer.allocUnsafe(4)
    buf.writeInt32BE(this.networks.mainnet.bip32.private, 0)
    buffer = Buffer.concat([buf, key]) // zprv
    this.network = this.networks.mainnet
    this.isTestnet = false
  }

  if (Object.values(this.pubTypes.testnet).includes(prefix)) {
    const buf = Buffer.allocUnsafe(4)
    buf.writeInt32BE(this.networks.testnet.bip32.private, 0)
    buffer = Buffer.concat([buf, key]) // vprv
    this.network = this.networks.testnet
    this.isTestnet = true
  }

  return b58.encode(buffer)
}

/**
 * Get account master private key
 * @return {string}
 */
fromZPrv.prototype.getAccountPrivateKey = function () {
  let pub = bip32.fromBase58(this.zprv, this.network).toBase58()
    , masterPrv = this.isTestnet ?
                    b58Encode(pub, this.pubTypes.testnet.vprv) :
                      b58Encode(pub, this.pubTypes.mainnet.zprv)

  return masterPrv
}

/**
 * Get account master public key
 * @return {string}
 */
fromZPrv.prototype.getAccountPublicKey = function () {
  let pub = bip32.fromBase58(this.zprv, this.network).neutered().toBase58()
    , masterPub = this.isTestnet ?
                    b58Encode(pub, this.pubTypes.testnet.vpub) :
                      b58Encode(pub, this.pubTypes.mainnet.zpub)

  return masterPub
}

/**
 * Get private key
 * @param {number} index
 * @param {boolean} isChange
 * @return {string}
 */
fromZPrv.prototype.getPrivateKey = function (index, isChange) {
  let change = isChange === true ? 1 : 0
    , prvkey = bip32.fromBase58(this.zprv, this.network).derive(change).derive(index)

  return prvkey.toWIF()
}

/**
 * Get public key
 * @param {number} index
 * @param {boolean} isChange
 * @return {string}
 */
fromZPrv.prototype.getPublicKey = function (index, isChange) {
  let change = isChange === true ? 1 : 0
    , prvkey = bip32.fromBase58(this.zprv, this.network).derive(change).derive(index)

  return prvkey.publicKey.toString('hex')
}

/**
 * Get address
 * @param {number} index
 * @param {boolean} isChange
 * @param {number} purpose
 * @return {string}
 */
fromZPrv.prototype.getAddress = function (index, isChange, purpose) {
  let change = isChange === true ? 1 : 0
    , pubkey = bip32.fromBase58(this.zprv, this.network).derive(change).derive(index).publicKey
    , payment = {}

	purpose = purpose || 84

	if (purpose === 44) {
		payment = payments.p2pkh({ pubkey: pubkey, network: this.network })
	}

	if (purpose === 49) {
		payment = payments.p2sh({
			redeem: payments.p2wpkh({ pubkey: pubkey, network: this.network }),
			network: this.network
		})
	}

	if (purpose === 84) {
		payment = payments.p2wpkh({ pubkey: pubkey, network: this.network })
	}

  return payment.address
}

fromZPrv.prototype.getKeypair = function (index, isChange) {
  let change = isChange === true ? 1 : 0
    , prvkey = bip32.fromBase58(this.zprv, this.network).derive(change).derive(index)

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
    , prefix = byteToHex(payload.slice(0, 4))
    , key = payload.slice(4)
    , buffer = undefined

  if (!Object.values(this.pubTypes.mainnet).includes(prefix) && !Object.values(this.pubTypes.testnet).includes(prefix)) {
    throw new Error('prefix is not supported')
  }

  if (Object.values(this.pubTypes.mainnet).includes(prefix)) {
    const buf = Buffer.allocUnsafe(4)
    buf.writeInt32BE(this.networks.mainnet.bip32.public, 0)
    buffer = Buffer.concat([buf, key]) // zpub
    this.network = this.networks.mainnet
    this.isTestnet = false
  }

  if (Object.values(this.pubTypes.testnet).includes(prefix)) {
    const buf = Buffer.allocUnsafe(4)
    buf.writeInt32BE(this.networks.testnet.bip32.public, 0)
    buffer = Buffer.concat([buf, key]) // vpub
    this.network = this.networks.testnet
    this.isTestnet = true
  }

  return b58.encode(buffer)
}

/**
 * Get account master public key
 * @return {string}
 */
fromZPub.prototype.getAccountPublicKey = function () {
  let pub = bip32.fromBase58(this.zpub, this.network).neutered().toBase58()
  let masterPub = this.isTestnet ?
                    b58Encode(pub, this.pubTypes.testnet.vpub) :
                      b58Encode(pub, this.pubTypes.mainnet.zpub)

  return masterPub
}

/**
 * Get public key
 * @param {number} index
 * @param {boolean} isChange
 * @return {string}
 */
fromZPub.prototype.getPublicKey = function (index, isChange) {
  let change = isChange === true ? 1 : 0
    , zpub = bip32.fromBase58(this.zpub, this.network).derive(change).derive(index)

  return zpub.publicKey.toString('hex')
}

/**
 * Get address
 * @param {number} index
 * @param {boolean} isChange
 * @param {number} purpose
 * @return {string}
 */
fromZPub.prototype.getAddress = function (index, isChange, purpose) {
  let change = isChange === true ? 1 : 0
    , pubkey = bip32.fromBase58(this.zpub, this.network).derive(change).derive(index).publicKey
		, payment = {}

	purpose = purpose || 84

	if (purpose === 44) {
		payment = payments.p2pkh({ pubkey: pubkey, network: this.network })
	}

	if (purpose === 49) {
		payment = payments.p2sh({
			redeem: payments.p2wpkh({ pubkey: pubkey, network: this.network }),
			network: this.network
		})
	}

	if (purpose === 84) {
		payment = payments.p2wpkh({ pubkey: pubkey, network: this.network })
	}

  return payment.address
}

/**
 * Get address
 * @param {number} index
 * @param {boolean} isChange
 * @return {string}
 */
fromZPub.prototype.getPayment = function (index, isChange) {
  let change = isChange === true ? 1 : 0
    , pubkey = bip32.fromBase58(this.zpub, this.network).derive(change).derive(index).publicKey

  const payment = payments.p2wpkh({
    pubkey: pubkey,
    network: this.network
  })

  return payment
}

function b58Encode(pub, data) {
  let payload = b58.decode(pub)
    , key = payload.slice(4)

  return b58.encode(Buffer.concat([Buffer.from(data,'hex'), key]))
}

module.exports = {
  generateMnemonic: bip39.generateMnemonic,
  entropyToMnemonic: bip39.entropyToMnemonic,
  validateMnemonic: bip39.validateMnemonic,
  fromMnemonic: fromMnemonic,
  fromZPrv: fromZPrv,
  fromZPub: fromZPub
}
