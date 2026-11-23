const ScratchStorage = require('../../src/index');

test('storage.md5', () => {
    const storage = new ScratchStorage();
    expect(storage.md5(new ArrayBuffer(0))).toBe('d41d8cd98f00b204e9800998ecf8427e');
    expect(storage.md5('hello')).toBe('5d41402abc4b2a76b9719d911017c592');
});
