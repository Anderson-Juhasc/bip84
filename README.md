# BIP84

Derives segwit + bech32 addresses from seed, zprv/zpub and vprv/vpub in javascript

## Installing

Run - `npm install bip84 --save`

## Using

```javascript
var mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
var root = new BIP84.fromSeed(mnemonic)
var child0 = root.deriveAccount(0)

console.log('mnemonic:', mnemonic)
console.log('rootpriv:', root.getRootPrivate())
console.log('rootpub:', root.getRootPublic())
console.log('\n');

var account0 = new BIP84.fromZPrv(child0)

console.log("Account 0, root = m/84'/0'/0'");
console.log('Account 0 xprv:', account0.getAccountPrivate())
console.log('Account 0 xpub:', account0.getAccountPublic())
console.log('\n');

console.log("Account 0, first receiving address = m/84'/0'/0'/0/0");
console.log('Prvkey:', account0.getPrivateKey(0))
console.log('Pubkey:', account0.getPublicKey(0))
console.log('Address:', account0.getAddress(0))
console.log('\n');

console.log("Account 0, first receiving address = m/84'/0'/0'/0/1");
console.log('Prvkey:', account0.getPrivateKey(1))
console.log('Pubkey:', account0.getPublicKey(1))
console.log('Address:', account0.getAddress(1))
console.log('\n');

console.log("Account 0, first change address = m/84'/0'/0'/1/0");
console.log('Prvkey:', account0.getPrivateKey(0, true))
console.log('Pubkey:', account0.getPublicKey(0, true))
console.log('Address:', account0.getAddress(0, true))
console.log('\n');

var zpub = 'zpub6mxCxqRAQMCArMRMK7MmZwuisKmjHzuxCZtPgs4fYFZB86VRaTB6mdGCtgSHxeMjwyNLYZntdS7pRQdUqTdLuKr2apGhv5dRzNj1Br8uLQ6'
var account1 = new BIP84.fromZPub(zpub)

console.log("Account 1, root = m/84'/0'/0'");
console.log('Account 1 xpub:', account1.getAccountPublic());
console.log('\n');

console.log("Account 1, first receiving address = m/84'/0'/0'/0/0");
console.log('Pubkey:', account1.getPublicKey(0))
console.log('Address:', account1.getAddress(0))
console.log('\n');

console.log("Account 1, first receiving address = m/84'/0'/0'/0/1");
console.log('Pubkey:', account1.getPublicKey(1))
console.log('Address:', account1.getAddress(1))
console.log('\n');

console.log("Account 1, first change address = m/84'/0'/0'/1/0");
console.log('Pubkey:', account1.getPublicKey(0, true))
console.log('Address:', account1.getAddress(0, true))
console.log('\n');
```
## TODO

- Run on testnet

## Reference

[BIP 84](https://github.com/bitcoin/bips/blob/master/bip-0084.mediawiki)

## Donate

![alt text](https://chainflyer.bitflyer.jp/Address/QR/1NzRXQa3gL1kAVZZGMjedUqM3Z3MSDFyv6 "Donate")

1NzRXQa3gL1kAVZZGMjedUqM3Z3MSDFyv6
