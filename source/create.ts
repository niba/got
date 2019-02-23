import * as errors from "./errors";
import asStream from "./as-stream";
import asPromise from "./as-promise";
import * as normalizeArguments from "./normalize-arguments";
import merge, { mergeOptions, mergeInstances } from "./merge";
import deepFreeze from "./utils/deep-freeze";
import { Options, CreateDefaults, DefaultHandler, IterateFunction, GotOptions, MergedOptions } from "./utils/types";

const getPromiseOrStream = (options: Options) => options.stream ? asStream(options) : asPromise(options);

const aliases = [
	'get',
	'post',
	'put',
	'patch',
	'head',
	'delete'
];

const create = (defaults: CreateDefaults) => {
	defaults = merge({}, defaults);
	normalizeArguments.preNormalize(defaults.options);

	if (!defaults.handler) {
		// This can't be getPromiseOrStream, because when merging
		// the chain would stop at this point and no further handlers would be called.
		defaults.handler = (options: Options, next: IterateFunction) => next(options);
	}

	function got(url: string | URL, options: GotOptions) {
		try {
			return defaults.handler(normalizeArguments.default(url, options, defaults), getPromiseOrStream);
		} catch (error) {
			if (options && options.stream) {
				throw error;
			} else {
				return Promise.reject(error);
			}
		}
	}

	got.create = create;
	got.extend = (options: MergedOptions) => {
		let mutableDefaults: boolean | undefined;
		if (options && Reflect.has(options, 'mutableDefaults')) {
			mutableDefaults = options.mutableDefault;
			delete options.mutableDefaults;
		} else {
			mutableDefaults = defaults.mutableDefaults;
		}

		return create({
			options: mergeOptions(defaults.options, options),
			handler: defaults.handler,
			mutableDefaults
		});
	};

	got.mergeInstances = (...args) => create(mergeInstances(args));

	got.stream = (url, options) => got(url, {...options, stream: true});

	for (const method of aliases) {
		got[method] = (url, options) => got(url, {...options, method});
		got.stream[method] = (url, options) => got.stream(url, {...options, method});
	}

	Object.assign(got, {...errors, mergeOptions});
	Object.defineProperty(got, 'defaults', {
		value: defaults.mutableDefaults ? defaults : deepFreeze(defaults),
		writable: defaults.mutableDefaults,
		configurable: defaults.mutableDefaults,
		enumerable: true
	});

	return got;
};

module.exports = create;
