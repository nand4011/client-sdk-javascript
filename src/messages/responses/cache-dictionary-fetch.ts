import {
  ResponseBase,
  ResponseHit,
  ResponseMiss,
  ResponseError,
} from './response-base';
import {SdkError} from '../../errors/errors';
import {TextDecoder} from 'util';
import {cache_client} from '@gomomento/generated-types/dist/cacheclient';

const TEXT_DECODER = new TextDecoder();

export abstract class Response extends ResponseBase {}

class _Hit extends Response {
  private readonly items: cache_client._DictionaryFieldValuePair[];
  private readonly dictionaryUint8ArrayUint8Array: Map<Uint8Array, Uint8Array> =
    new Map();
  private readonly dictionaryStringString: Map<string, string> = new Map();
  private readonly dictionaryStringArrayBuffer: Map<string, Uint8Array> =
    new Map();
  private readonly _displayListSizeLimit = 5;

  constructor(items: cache_client._DictionaryFieldValuePair[]) {
    super();
    this.items = items;
  }

  public valueDictionaryUint8ArrayUint8Array(): Map<Uint8Array, Uint8Array> {
    for (const item of this.items) {
      this.dictionaryUint8ArrayUint8Array.set(item.field, item.value);
    }
    return this.dictionaryUint8ArrayUint8Array;
  }

  public valueDictionaryStringString(): Map<string, string> {
    for (const item of this.items) {
      this.dictionaryStringString.set(
        TEXT_DECODER.decode(item.field),
        TEXT_DECODER.decode(item.value)
      );
    }
    return this.dictionaryStringString;
  }

  public valueDictionaryStringUint8Array(): Map<string, Uint8Array> {
    for (const item of this.items) {
      this.dictionaryStringArrayBuffer.set(
        TEXT_DECODER.decode(item.field),
        item.value
      );
    }
    return this.dictionaryStringArrayBuffer;
  }

  private truncateValueStrings(): string {
    const keyValueIterable = this.valueDictionaryStringString().entries();
    const keyValueArray = Array.from(keyValueIterable);
    if (keyValueArray.length <= this._displayListSizeLimit) {
      const pairs: string[] = [];
      keyValueArray.forEach(pair => {
        pairs.push(`${pair[0]}: ${pair[1]}`);
      });
      return pairs.join(',');
    } else {
      const slicedArray = keyValueArray.slice(0, this._displayListSizeLimit);
      const pairs: string[] = [];
      slicedArray.forEach(pair => {
        pairs.push(`${pair[0]}: ${pair[1]}`);
      });
      return pairs.join(',');
    }
  }

  public override toString(): string {
    return `${super.toString()}: valueDictionaryStringString: ${this.truncateValueStrings()}`;
  }
}
export class Hit extends ResponseHit(_Hit) {}

class _Miss extends Response {}
export class Miss extends ResponseMiss(_Miss) {}

class _Error extends Response {
  constructor(protected _innerException: SdkError) {
    super();
  }
}
export class Error extends ResponseError(_Error) {}
