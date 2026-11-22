const crypto = require('crypto');

const md5 = require('../../src/md5');

const reference = data => crypto.createHash('md5').update(data)
    .digest('hex');

test('RFC 1321 test suite', () => {
    expect(md5('')).toBe('d41d8cd98f00b204e9800998ecf8427e');
    expect(md5('a')).toBe('0cc175b9c0f1b6a831c399e269772661');
    expect(md5('abc')).toBe('900150983cd24fb0d6963f7d28e17f72');
    expect(md5('message digest')).toBe('f96b697d7cb7938d525a2f31aaf161d0');
    expect(md5('abcdefghijklmnopqrstuvwxyz')).toBe('c3fcd3d76192e4007dfb496cca67e13b');
    expect(md5('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'))
        .toBe('d174ab98d277d9f5a5611c2c9f419d9f');
    expect(md5('12345678901234567890123456789012345678901234567890123456789012345678901234567890'))
        .toBe('57edf4a22be3c955ac49da2e2107b67a');
});

test('strings are encoded as UTF-8', () => {
    const str = 'héllo 🌍';
    expect(md5(str)).toBe(reference(Buffer.from(str, 'utf8')));
});

test('all lengths around block boundaries, aligned and unaligned', () => {
    const buffer = crypto.randomBytes(1024 + 8);
    for (let length = 0; length <= 1024; length++) {
        for (let offset = 0; offset < 4; offset++) {
            const data = new Uint8Array(buffer.buffer, buffer.byteOffset + offset, length);
            expect(md5(data)).toBe(reference(data));
        }
    }
});

test('large inputs', () => {
    const buffer = crypto.randomBytes(300000);
    // Larger than the internal scratch buffer used for unaligned inputs
    for (const length of [65535, 65536, 65537, 131072 + 63, 299999]) {
        const aligned = new Uint8Array(buffer.buffer, buffer.byteOffset, length);
        const unaligned = new Uint8Array(buffer.buffer, buffer.byteOffset + 1, length);
        expect(md5(aligned)).toBe(reference(aligned));
        expect(md5(unaligned)).toBe(reference(unaligned));
    }
});

test('input types', () => {
    const bytes = new Uint8Array(crypto.randomBytes(200));
    const expected = reference(bytes);
    expect(md5(bytes)).toBe(expected);
    expect(md5(Buffer.from(bytes))).toBe(expected);
    expect(md5(bytes.buffer)).toBe(expected);
    expect(md5(new DataView(bytes.buffer))).toBe(expected);
    expect(md5(Array.from(bytes))).toBe(expected);
    expect(md5(new Uint32Array(bytes.buffer))).toBe(expected);
});

test('unsupported input', () => {
    expect(() => md5(null)).toThrow(TypeError);
    expect(() => md5(5)).toThrow(TypeError);
    expect(() => md5({})).toThrow(TypeError);
});
