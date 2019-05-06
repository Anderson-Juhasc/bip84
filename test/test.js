const BIP84 = require('../src/index')

var vprv = new BIP84('vprv9KacKBSdiYsCfJSMa2tJekrhxxvJWhpoShz5SV8MJkt4av2wiqgMWKWddjAxtizdFYmg5o4ybHWkXWSSe2g4sKKbZwFxUdu6rWoXvoACsVy')
var vpub = new BIP84('vpub5YZxigyXYvRVsnWpg4RK1toSWzknvAYeovugEsXxs6R3TiN6GNzc47q7UzcEiFkhwmzTcx83B61PEuXXkrTWPMbyjcZXBbe9BU8oKcrHb1g')

var zprv = new BIP84('zprvAd8nxfJY24ad35tHSynGRpdAPymTj8hQhYG75pjgpwz9mpZ3Sq2G2YN1VmfXsWdZeXPkpouQReKZnj7VsTC69nVnubL2U2gZeUwmGot9AaW')
var zpub = new BIP84('zpub6r89NAqRrS8vFZxkZ1KGnxZtx1bx8bRG4mBhtD9JPHX8ectBzNLWaLgVM3owthf1JVAWqLgZdsUugsDDoHrq5RdRMAtiUTaEmyUaaAkasVu')

console.log(vprv.getAddress(0))
console.log(vpub.getAddress(0))

console.log(zprv.getAddress(0))
console.log(zpub.getAddress(0))
