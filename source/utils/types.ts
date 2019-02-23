import {IncomingMessage} from 'http';
import {RequestOptions} from 'https';
import {Readable as ReadableStream} from 'stream';
import {PCancelable} from 'p-cancelable';
import {Hooks} from '../known-hook-events';

export type Method = 'GET' | 'PUT' | 'HEAD' | 'DELETE' | 'OPTIONS' | 'TRACE' | 'get' | 'put' | 'head' | 'delete' | 'options' | 'trace';
export type ErrorCode = 'ETIMEDOUT' | 'ECONNRESET' | 'EADDRINUSE' | 'ECONNREFUSED' | 'EPIPE' | 'ENOTFOUND' | 'ENETUNREACH' | 'EAI_AGAIN';
export type StatusCode = 408 | 413 | 429 | 500 | 502 | 503 | 504;

export type NextFunction = (error?: Error | string) => void;

export type IterateFunction = (options: Options) => void;

export type HandlerFunction = ((options: Options, callback: NextFunction) => void) | ((options: Options, callback: IterateFunction) => void);
export type Headers = { [key: string]: any };
export interface Response extends IncomingMessage {
	body: string | Buffer;
	statusCode: number;
}

export interface Timings {
	start: number;
	socket: number | null;
	lookup: number | null;
	connect: number | null;
	upload: number | null;
	response: number | null;
	end: number | null;
	error: number | null;
	phases: {
		wait: number | null;
		dns: number | null;
		tcp: number | null;
		request: number | null;
		firstByte: number | null;
		download: number | null;
		total: number | null;
	};
}

export interface Instance {
	methods: Method[];
	options: Partial<Options>;
	handler: (options: Options, callback: NextFunction) => void;
}

export interface InterfaceWithDefaults extends Instance {
	defaults: {
		handler: HandlerFunction;
		options: Options;
	};
}

interface RetryOption {
	retries?: ((retry: number, error: Error) => number) | number;
	methods?: Method[];
	statusCodes?: StatusCode[];
	maxRetryAfter?: number;
	errorCodes?: ErrorCode[];
}

export interface MergedOptions extends Options {
  retry: RetryOption;
  mutableDefault: boolean;
}

export interface Options2 {
  dnsCache: boolean;
  cache: boolean;
  stream: boolean;
  decompress: boolean;
  throwHttpErrors: boolean;
  followRedirect: boolean;
  useElectronNet: boolean;
  responseType: "text" | "json" | "buffer";
  resolveBodyOnly: boolean;
  hooks: Partial<Hooks>;
  headers: { [key: string]: any };
  retry?: number | RetryOption;
}

export type DefaultHandler = (options: Options, callback: IterateFunction) => void;
export interface CreateDefaults {
  options: Options2;
  mutableDefaults: boolean;
  handler: HandlerFunction;
}

export interface GotOptions {
  baseUrl: string;
  headers: Headers;
  stream: boolean;
  body: string | Buffer | ReadableStream;
  json: Object | any[] | number | string | boolean | null;
  responseType: "text" | "json" | "buffer";
  resolveBodyOnly: boolean;
  cookieJar: any; // CookieJar
  encoding: BufferEncoding | null;
  form: any;
  searchParams: string | { [key: string]: string | number } | URLSearchParams;
  timeout: number | {};
  retry: number | {};
  followRedirect: boolean;
  decompress: boolean;
  cache: boolean;
  dnsCache: boolean;
  request: () => {}
  useElectronNet: boolean;
  throwHttpErrors: boolean;
  agent: any // todo;
  hooks: Partial<Hooks>;
};

export interface Options extends RequestOptions {
	host: string;
	body: string | Buffer | ReadableStream;
	hostname?: string;
	path?: string;
	socketPath?: string;
	protocol?: string;
	href?: string;
	options?: Partial<Options>;
	hooks?: Partial<Hooks>;
	decompress?: boolean;
	encoding?: BufferEncoding | null;
	method?: Method;
	retry?: number | RetryOption;
	throwHttpErrors?: boolean;
	// TODO: Remove this once TS migration is complete and all options are defined.
	[key: string]: unknown;
}

export interface CancelableRequest<T extends IncomingMessage> extends PCancelable<T> {
	on(name: string, listener: () => void): CancelableRequest<T>;
	json(): CancelableRequest<T>;
	buffer(): CancelableRequest<T>;
	text(): CancelableRequest<T>;
}
