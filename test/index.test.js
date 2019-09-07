const BIP84 = require('../src/index');

function init(network, isTestnet, slip44) {
  let mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
  let root = new BIP84.fromSeed(mnemonic, network, isTestnet, slip44);
  let child0 = root.deriveAccount(0);
  let account0 = new BIP84.fromZPrv(child0, network, isTestnet);
  let zpub = 'vpub5Vm8JiyeMgCWT2SqgFkoJyaovNQH8RCF3wAUKCrFAfRdVujdYubBrYUGtggtabj71XxvUQuS5r9AgT4VhGvax9gXEpdi9XBg7jHnvm1WDii'
  let account1 = new BIP84.fromZPub(zpub);

  return { root, child0, account0, account1 };
}

let data;
describe('btc tests', () => {
  beforeEach(() => {
    data = init();
  });

  describe('account0', () => {
    it("Generates correct rootPublic and rootPrivate", () => {
      expect(data.root.getRootPrivate()).toEqual('xprv9s21ZrQH143K3GJpoapnV8SFfukcVBSfeCficPSGfubmSFDxo1kuHnLisriDvSnRRuL2Qrg5ggqHKNVpxR86QEC8w35uxmGoggxtQTPvfUu');
      expect(data.root.getRootPublic()).toEqual('xpub661MyMwAqRbcFkPHucMnrGNzDwb6teAX1RbKQmqtEF8kK3Z7LZ59qafCjB9eCRLiTVG3uxBxgKvRgbubRhqSKXnGGb1aoaqLrpMBDrVxga8');
    });

    it("Generates correct root = m/84'/0'/0'", () => {
      expect(data.account0.getAccountPrivate()).toEqual('xprv9ybY78BftS5UGANki6oSifuQEjkpyAC8ZmBvBNTshQnCBcxnefjHS7buPMkkqhcRzmoGZ5bokx7GuyDAiktd5HemohAU4wV1ZPMDRmLpBMm');
      expect(data.account0.getAccountPublic()).toEqual('xpub6CatWdiZiodmUeTDp8LT5or8nmbKNcuyvz7WyksVFkKB4RHwCD3XyuvPEbvqAQY3rAPshWcMLoP2fMFMKHPJ4ZeZXYVUhLv1VMrjPC7PW6V');
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
    it("Generates correct root = m/84'/0'/0'", () => {
      expect(data.account1.getAccountPublic()).toEqual('xpub69Rev4KUf3HU9cq5LyL3j9mpGJhB1fBEtACusze1vgBPc7N64DvK6fnYw6c4aR2wppCXyN6Z1ArGT2Hd8fkcYd3iyW2ZKLpefBR5hx8XJis');
    });

    it("Generates correct first receiving address = m/84'/0'/0'/0/0", () => {
      expect(data.account1.getPublicKey(0)).toEqual('02176cd6a3d74e3a4f3f9c4fe517291fae7654709db13e97f41765fd6e7e1406bb');
      expect(data.account1.getAddress(0)).toEqual('bc1qxdz5xktump2xt0832tgqnlhf48jrarul8thwlg');
    });

    it("Generates correct second receiving address = m/84'/0'/0'/0/1", () => {
      expect(data.account1.getPublicKey(1)).toEqual('03b3ca0a9f89350bbd0bbaca3e9701d71e86ae29582a9572a32404ecf4350f3964');
      expect(data.account1.getAddress(1)).toEqual('bc1q65v0jm4v49g33pys6wsv6enrl98vscpkfjp3ek');
    });

    it("Generates correct first change address = m/84'/0'/0'/1/0", () => {
      expect(data.account1.getPublicKey(0, true)).toEqual('03fb2a8afb6ff7d628d0742601e5016c01d387a0103fff548bbfbfe06a1bfb85f9');
      expect(data.account1.getAddress(0, true)).toEqual('bc1qexuaj40zxzmyqsruv0ed2lw4mhtz0mvcl7hvv7');
    });

    it("Generates correct second change address = m/84'/0'/0'/1/1", () => {
      expect(data.account1.getPublicKey(1, true)).toEqual('03e46cb4676c6259d46f39e1ba53f7170309ea818d6b4d2fc14f959812087f5f5f');
      expect(data.account1.getAddress(1, true)).toEqual('bc1q97cd5cd3jp43rfcfuuv3j97t5pve7qg3nlypm5');
    });
  });

  describe('network specific', () => {
    it("Creates BTC network data", () => {
      let data = init();
      expect(data.account0.getAddress(0)).toEqual('bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu');
    });

    it("Creates SYS network data", () => {
      let network = {
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'sys',
        bip32: {
          public: 0x0488b21e,
          private: 0x0488ade4,
        },
        pubKeyHash: 0x3f,
        scriptHash: 0x05,
        wif: 0x80,
      };
      let data = init(network, false, 57);
      expect(data.account0.getAddress(0)).toEqual('sys1q2fs58xaj4tp7qrr3slpdsm65j3nw030d246lmx');
    });

  });
});
