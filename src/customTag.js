const nunjucks = require('nunjucks');

const addCustomTag = (env, name, fn) => {
    function normalizeContext({ ctx } = {}) {
        if (ctx && ctx.page) return { ...ctx.page };
        return {};
    }

    function BartlebyCustomTag() {
        this.tags = [name];

        this.parse = function (parser, nodes) {
            let args;
            let tok = parser.nextToken();

            args = parser.parseSignature(true, true);

            // Make sure args aren't empty, even if not required
            if (args.children.length === 0) args.addChild(new nodes.Literal(0, 0, ""));

            parser.advanceAfterBlockEnd(tok.value);

            return new nodes.CallExtension(this, "run", args);
        };

        this.run = (context, ...args) => new nunjucks.runtime.SafeString(fn.call(normalizeContext(context), ...args));
    }

    env.addExtension(name, new BartlebyCustomTag());
}

module.exports = addCustomTag;
