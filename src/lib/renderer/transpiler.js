"use strict";
class Front {
    constructor(vertex, fragment, log = true) {
        this.vertex = vertex;
        this.fragment = fragment;
        this.log = log;
        this.errorStack = [];
        this
            .getEntryPoints()
            .logErrors();
    }
    logErrors() {
        if (this.errorStack.length <= 0)
            return;
        this.errorStack.forEach(e => console.error(e));
    }
    getFnDescriptor(fn) {
        const name = fn
            .replace(Front.fn.declaration, '')
            .replace(Front.fn.args, '')
            .replace(Front.fn.returnDeclaration, '')
            .replace(Front.block, '')
            .trim();
        this.log && console.log('name', name);
        const args = [];
        fn
            .replace(Front.fn.declaration, '')
            .replace(name, '')
            .replace(Front.fn.returnDeclaration, '')
            .replace(Front.fn.parentheses, '')
            .replace(Front.block, '')
            .trim()
            .split(',')
            .forEach(v => {
            const d = v.split(':');
            if (d.length !== 2) {
                this.errorStack.push(`invalid parameter in function ${name}: ${v}`);
                return;
            }
            args.push({
                type: d[1].trim(),
                name: d[0].replace(/@builtin[a-zA-Z0-9_]+/g, '').trim(),
                builtin: d[0].match(/@builtin[a-zA-Z0-9_]+/g) ? true : false
            });
            this.log && console.log(`type: ${d[1]}, name: ${d[0].replace(/@builtin[a-zA-Z0-9_]+/g, '').trim()},`);
        }, this);
        let returnType = fn
            .replace(name, '')
            .replace(Front.fn.declaration, '')
            .replace('->', '')
            .replace(Front.fn.args, '')
            .replace(Front.block, '')
            .replace(Front.fn.parentheses, '')
            .trim();
        if (returnType.length <= 0)
            returnType = 'void';
        this.log && console.log('return', returnType);
        const code = fn.slice(fn.indexOf('{'));
        this.log && console.log('code', code);
        return {
            name,
            args,
            returnType,
        };
    }
    getEntryPoints() {
        const fragmentEntry = this.fragment.match(/@fragment[\s\b]+fn[\s\b]+[-a-zA-Z0-9_(,:)\s\b@><]+{[-a-zA-Z0-9_(,:)\s\b@><=;/%.+\*{}[\]~|&!]+}/);
        const vertexEntry = this.vertex.match(/@vertex[\s\b]+fn[\s\b]+[-a-zA-Z0-9_(,:)\s\b@><]+{[-a-zA-Z0-9_(,:)\s\b@><=;/%.+\*{}[\]~|&!]+}/);
        if (!fragmentEntry) {
            this.errorStack.push('no fragment entry point found in fragment shader');
        }
        if (!vertexEntry) {
            this.errorStack.push('no vertex entry point found in vertex shader');
        }
        if (!fragmentEntry || !vertexEntry)
            return this;
        this.entryPoints = {
            fragment: this.getFnDescriptor(fragmentEntry[0]),
            vertex: this.getFnDescriptor(vertexEntry[0]),
        };
        return this;
    }
    /**
     * replaces the uniforms declaration of webgpu with variables of webgl uniforms\
     * u.delta = u_delta
     * naming convention will be nameOfUniform_nameOfProperty for the structs, in this way you can always scope the properties
     */
    replaceUniforms() {
    }
    replaceAttributes() {
        const structsDeclaration = this.entryPoints.vertex;
    }
}
/**Language syntax */
Front.block = /{[-a-zA-Z0-9_(,:)\s\b@><=;/%.+\*{}[\]]+}/;
Front.fn = Object.freeze({
    declaration: /(?:@vertex|@fragment)?[\s\b]+fn[\s\b]+/,
    args: /\([:a-zA-Z0-9_,@()\s\b]*\)/g,
    returnSyntax: /(->[\s\b])*/,
    returnDeclaration: /([\s\b]*->[\s\b]*[@<>_\b\s()a-zA-Z0-9]*)*/g,
    parentheses: /[()]/g
});
new Front(/*wgsl*/ `
struct Attrib{
      @location(0) pos: vec4<f32>,
      @location(1) color: vec4<f32>,
}
struct Var{
      @builtin(position) position: vec4f,
      @location(0) color: vec4<f32>,
}
struct Uniforms {
      delta: vec4f,
}
@group(0) @binding(0) var<uniform> u: Uniforms;
@vertex
fn vertex_shader( @builtin(position) position: vec4f, a: Attrib ) -> vec4<f32> {
      var v: Var;
      v.position = a.pos;
      v.color = a.color;
      return v;
}
`, /*wgsl*/ `
@fragment
fn fragment_shader( v: Var ) -> @location(0) vec4<f32> {
      return v.color + u.delta;
}
`);
