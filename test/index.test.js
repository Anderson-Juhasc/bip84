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
      expect(data.account0.getAccountPrivate()).toEqual('xprv9xmnwVv4jGS2pytAGTb7myJxLRVhHByZeiZmyyZgX9oSSHSuLiXHR3t1wBuK3c6dMe5mCyT4BMNwdWmTs58nohJTTx7Rw6WZxoRNKD4TPvx');
      expect(data.account0.getAccountPublic()).toEqual('xpub6Bm9M1SxZdzL3TxdNV8897FgtTLBgehR1wVNnMyJ5VLRK5n3tFqXxrCVnVQj4zooN4eFSkf6Sma84reWc5ZCXMxPbLXQs3BcaBdTd4YQa3B');
    });

    it("Generates correct first receiving address = m/84'/0'/0'/0/0", () => {
      expect(data.account0.getPrivateKey(0)).toEqual('L2uiLxH1HL8e6ibriKqeFan6BzrUAVP5icCif86VMHabHPxdAXYN');
      expect(data.account0.getPublicKey(0)).toEqual('02e7ab2537b5d49e970309aae06e9e49f36ce1c9febbd44ec8e0d1cca0b4f9c319');
      expect(data.account0.getAddress(0)).toEqual('bc1q6rz28mcfaxtmd6v789l9rrlrusdprr9p276ldv');
    });

    it("Generates correct second receiving address = m/84'/0'/0'/0/1", () => {
      expect(data.account0.getPrivateKey(1)).toEqual('KytVKirxjufK4bouVKY5APx5S8hGCi5WMCSQuXeu8vhtaQHUYZXa');
      expect(data.account0.getPublicKey(1)).toEqual('03eeed205a69022fed4a62a02457f3699b19c06bf74bf801acc6d9ae84bc16a9e1');
      expect(data.account0.getAddress(1)).toEqual('bc1qd7spv5q28348xl4myc8zmh983w5jx32cc3dq7d');
    });

    it("Generates correct first change address = m/84'/0'/0'/1/0", () => {
      expect(data.account0.getPrivateKey(0, true)).toEqual('KyiU9zk4krEpS8By6txQCca6ynTzSQsUfFVkjtAGGz9DixZgc28V');
      expect(data.account0.getPublicKey(0, true)).toEqual('035d49eccd54d0099e43676277c7a6d4625d611da88a5df49bf9517a7791a777a5');
      expect(data.account0.getAddress(0, true)).toEqual('bc1q9u62588spffmq4dzjxsr5l297znf3z6j783fu5');
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
      expect(data.account0.getAddress(0)).toEqual('bc1q6rz28mcfaxtmd6v789l9rrlrusdprr9p276ldv');
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
