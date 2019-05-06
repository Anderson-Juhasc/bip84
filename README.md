# BIP84

Derives segwit + bech32 addresses from zprv/zpub and vprv/vpub in javascript

## Installing

Run - `npm install bip84 --save`

## Using

```javascript
var BIP84 = require('bip84')

var vprv = new BIP84('vprv9KacKBSdiYsCfJSMa2tJekrhxxvJWhpoShz5SV8MJkt4av2wiqgMWKWddjAxtizdFYmg5o4ybHWkXWSSe2g4sKKbZwFxUdu6rWoXvoACsVy')
var vpub = new BIP84('vpub5YZxigyXYvRVsnWpg4RK1toSWzknvAYeovugEsXxs6R3TiN6GNzc47q7UzcEiFkhwmzTcx83B61PEuXXkrTWPMbyjcZXBbe9BU8oKcrHb1g')

var zprv = new BIP84('zprvAd8nxfJY24ad35tHSynGRpdAPymTj8hQhYG75pjgpwz9mpZ3Sq2G2YN1VmfXsWdZeXPkpouQReKZnj7VsTC69nVnubL2U2gZeUwmGot9AaW')
var zpub = new BIP84('zpub6r89NAqRrS8vFZxkZ1KGnxZtx1bx8bRG4mBhtD9JPHX8ectBzNLWaLgVM3owthf1JVAWqLgZdsUugsDDoHrq5RdRMAtiUTaEmyUaaAkasVu')

console.log(vprv.getAddress(0))
console.log(vpub.getAddress(0))

console.log(zprv.getAddress(0))
console.log(zpub.getAddress(0))
```

## Reference

[BIP 84](https://github.com/bitcoin/bips/blob/master/bip-0084.mediawiki)

## Donate

![alt text](https://chainflyer.bitflyer.jp/Address/QR/1NzRXQa3gL1kAVZZGMjedUqM3Z3MSDFyv6 "Donate")

1NzRXQa3gL1kAVZZGMjedUqM3Z3MSDFyv6
