// Polyfill File API for Node.js build environment
if (typeof File === 'undefined') {
  global.File = class File {
    constructor(parts, name, options = {}) {
      this.parts = parts;
      this.name = name;
      this.options = options;
    }
    get type() {
      return this.options.type || '';
    }
    async arrayBuffer() {
      return this.parts[0];
    }
    async text() {
      return this.parts[0].toString();
    }
  };
}

if (typeof Blob === 'undefined') {
  global.Blob = class Blob {
    constructor(parts, options = {}) {
      this.parts = parts;
      this.options = options;
    }
    get type() {
      return this.options.type || '';
    }
  };
}

console.log('✓ File and Blob polyfills loaded for Node.js build');
