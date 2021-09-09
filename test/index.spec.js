const BIP84 = require('../src/index');

function init(networks, slip44, pub_types, isTestnet) {
  let mnemonic = BIP84.entropyToMnemonic('00000000000000000000000000000000')
  let network;
  if(networks) {
    if (isTestnet) {
      network = networks.mainnet;
    } else {
      network = networks.testnet;
    }
  }

  let root = new BIP84.fromMnemonic(mnemonic, '', isTestnet, slip44, pub_types, network);
  let child0 = root.deriveAccount(0);
  let account0 = new BIP84.fromZPrv(child0, pub_types, networks);
  return { root, child0, account0 };
}

function initFromZpub(networks, slip44, pub_types, isTestnet) {
  let zpub = 'vpub5Vm8JiyeMgCWT2SqgFkoJyaovNQH8RCF3wAUKCrFAfRdVujdYubBrYUGtggtabj71XxvUQuS5r9AgT4VhGvax9gXEpdi9XBg7jHnvm1WDii'
  return new BIP84.fromZPub(zpub, pub_types, networks);
}

let data, account1;
describe('account0', () => {
  beforeEach(() => {
    data = init();
  });

  it("Generates correct rootPublic and rootPrivate", () => {
    expect(data.root.getRootPrivateKey()).toEqual('zprvAWgYBBk7JR8Gjrh4UJQ2uJdG1r3WNRRfURiABBE3RvMXYSrRJL62XuezvGdPvG6GFBZduosCc1YP5wixPox7zhZLfiUm8aunE96BBa4Kei5');
    expect(data.root.getRootPublicKey()).toEqual('zpub6jftahH18ngZxLmXaKw3GSZzZsszmt9WqedkyZdezFtWRFBZqsQH5hyUmb4pCEeZGmVfQuP5bedXTB8is6fTv19U1GQRyQUKQGUTzyHACMF');
  });

  it("Generates correct root = m/84'/0'/0'", () => {
    expect(data.account0.getAccountPrivateKey()).toEqual('zprvAdG4iTXWBoARxkkzNpNh8r6Qag3irQB8PzEMkAFeTRXxHpbF9z4QgEvBRmfvqWvGp42t42nvgGpNgYSJA9iefm1yYNZKEm7z6qUWCroSQnE');
    expect(data.account0.getAccountPublicKey()).toEqual('zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvPhXNfE3EfH1r1ADqtfSdVCToUG868RvUUkgDKf31mGDtKsAYz2oz2AGutZYs');
  });

  it("Generates correct first receiving address = m/84'/0'/0'/0/0", () => {
    expect(data.account0.getPrivateKey(0)).toEqual('KyZpNDKnfs94vbrwhJneDi77V6jF64PWPF8x5cdJb8ifgg2DUc9d');
    expect(data.account0.getPublicKey(0)).toEqual('0330d54fd0dd420a6e5f8d3624f5f3482cae350f79d5f0753bf5beef9c2d91af3c');
    expect(data.account0.getAddress(0)).toEqual('bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu');
  });

  it("Generates correct second receiving address = m/84'/0'/0'/0/1", () => {
    expect(data.account0.getPrivateKey(1)).toEqual('Kxpf5b8p3qX56DKEe5NqWbNUP9MnqoRFzZwHRtsFqhzuvUJsYZCy');
    expect(data.account0.getPublicKey(1)).toEqual('03e775fd51f0dfb8cd865d9ff1cca2a158cf651fe997fdc9fee9c1d3b5e995ea77');
    expect(data.account0.getAddress(1)).toEqual('bc1qnjg0jd8228aq7egyzacy8cys3knf9xvrerkf9g');
  });

  it("Generates correct first change address = m/84'/0'/0'/1/0", () => {
    expect(data.account0.getPrivateKey(0, true)).toEqual('KxuoxufJL5csa1Wieb2kp29VNdn92Us8CoaUG3aGtPtcF3AzeXvF');
    expect(data.account0.getPublicKey(0, true)).toEqual('03025324888e429ab8e3dbaf1f7802648b9cd01e9b418485c5fa4c1b9b5700e1a6');
    expect(data.account0.getAddress(0, true)).toEqual('bc1q8c6fshw2dlwun7ekn9qwf37cu2rn755upcp6el');
  });
});

describe('account1', () => {
  beforeEach(() => {
    account1 = initFromZpub();
  });

  it("Generates correct root = m/84'/1'/0'", () => {
    expect(account1.getAccountPublicKey()).toEqual('vpub5Vm8JiyeMgCWT2SqgFkoJyaovNQH8RCF3wAUKCrFAfRdVujdYubBrYUGtggtabj71XxvUQuS5r9AgT4VhGvax9gXEpdi9XBg7jHnvm1WDii');
  });

  it("Generates correct first receiving address = m/84'/1'/0'/0/0", () => {
    expect(account1.getPublicKey(0)).toEqual('02176cd6a3d74e3a4f3f9c4fe517291fae7654709db13e97f41765fd6e7e1406bb');
    expect(account1.getAddress(0)).toEqual('tb1qxdz5xktump2xt0832tgqnlhf48jrarulddvaym');
  });

  it("Generates correct second receiving address = m/84'/1'/0'/0/1", () => {
    expect(account1.getPublicKey(1)).toEqual('03b3ca0a9f89350bbd0bbaca3e9701d71e86ae29582a9572a32404ecf4350f3964');
    expect(account1.getAddress(1)).toEqual('tb1q65v0jm4v49g33pys6wsv6enrl98vscpkr56zz9');
  });

  it("Generates correct first change address = m/84'/1'/0'/1/0", () => {
    expect(account1.getPublicKey(0, true)).toEqual('03fb2a8afb6ff7d628d0742601e5016c01d387a0103fff548bbfbfe06a1bfb85f9');
    expect(account1.getAddress(0, true)).toEqual('tb1qexuaj40zxzmyqsruv0ed2lw4mhtz0mvc4cvlhd');
  });

  it("Generates correct second change address = m/84'/1'/0'/1/1", () => {
    expect(account1.getPublicKey(1, true)).toEqual('03e46cb4676c6259d46f39e1ba53f7170309ea818d6b4d2fc14f959812087f5f5f');
    expect(account1.getAddress(1, true)).toEqual('tb1q97cd5cd3jp43rfcfuuv3j97t5pve7qg3eeljq8');
  });
});

describe('network specific', () => {
  it("Creates BTC network data", () => {
    let data = init();
    expect(data.account0.getAddress(0)).toEqual('bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu');
  });

  it("Creates SYS network data", () => {
    let networks = require('./networks').syscoin;
    let pub_types = { mainnet: { zprv: '04b2430c', zpub: '04b24746'}, testnet: { vprv: '045f18bc', vpub: '045f1cf6' }};
    let data = init(networks, 57, pub_types);
    expect(data.account0.getAddress(0)).toEqual('sys1q2fs58xaj4tp7qrr3slpdsm65j3nw030d246lmx');
  });

});

describe('getKeypair', () => {
  it("getKeypair data matches getPrivateKey data", () => {
    let data = init();
    expect(data.account0.getKeypair(0).toWIF()).toEqual(data.account0.getPrivateKey(0));
  });
});

describe('getPayment', () => {
  it("getPayment data matches getAddress data", () => {
    let data = initFromZpub();
    expect(data.getPayment(0).address).toEqual(data.getAddress(0));
  });
});
