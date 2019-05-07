const BIP84 = require('../src/index')

var mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
var root = new BIP84(mnemonic)

console.log('mnemonic:', mnemonic)
console.log('rootpriv:', root.getRootPrivate())
console.log('rootpub:', root.getRootPublic())
console.log('\n');

var account0 = new BIP84(root.deriveAccount(0))

console.log("Account 0, root = m/84'/0'/0'");
console.log('account 0 xprv:', account0.getRootPrivate())
console.log('account 0 xpub:', account0.getRootPublic())
console.log('\n');

console.log("Account 0, first receiving address = m/84'/0'/0'/0/0");
console.log('prvkey:', account0.getPrivateKey(0))
console.log('pubkey:', account0.getPublicKey(0))
console.log('address:', account0.getAddress(0))
console.log('\n');

console.log("Account 0, first receiving address = m/84'/0'/0'/0/1");
console.log('prvkey:', account0.getPrivateKey(1))
console.log('pubkey:', account0.getPublicKey(1))
console.log('address:', account0.getAddress(1))
console.log('\n');

console.log("Account 0, first change address = m/84'/0'/0'/1/0");
console.log('prvkey:', account0.getPrivateKey(0, true))
console.log('pubkey:', account0.getPublicKey(0, true))
console.log('address:', account0.getAddress(0, true))
