/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019-2024 by the xcube development team and contributors.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export type LanguageDictionaryEntry = { [locale: string]: string };

export interface LanguageDictionaryJson {
  languages: LanguageDictionaryEntry;
  dictionary: LanguageDictionaryEntry[];
}

type LanguageDictionaryContent = { [key: string]: LanguageDictionaryEntry };

export interface WithLocale {
  locale?: string;
}

const PHRASE_STYLE = "color:green;font-weight:bold;";
const LOCALE_STYLE = "color:blue;font-weight:bold;";

export class LanguageDictionary {
  private readonly _languages: LanguageDictionaryEntry;
  private readonly _content: LanguageDictionaryContent;
  private _locale: string;

  constructor(json: LanguageDictionaryJson) {
    const locales = Object.getOwnPropertyNames(json.languages);
    if (locales.findIndex((locale) => locale === "en") < 0) {
      throw new Error(
        `Internal error: locale "en" must be included in supported languages`,
      );
    }

    const content: LanguageDictionaryContent = {};
    json.dictionary.forEach((entry, index) => {
      locales.forEach((locale) => {
        if (!entry[locale]) {
          throw new Error(
            `Internal error: invalid entry at index ${index} in "./resources/lang.json":` +
              ` missing translation for locale: "${locale}": ${entry}`,
          );
        }
      });
      const phraseKey = getPhraseKey(entry["en"]);
      if (content[phraseKey]) {
        console.warn(`Translation already defined for "${entry["en"]}".`);
      }
      content[phraseKey] = entry;
    });

    this._languages = json.languages;
    this._content = content;
    this._locale = "en";
  }

  get languages(): LanguageDictionaryEntry {
    return this._languages;
  }

  get locale(): string {
    return this._locale;
  }

  set locale(value: string) {
    const locales = Object.getOwnPropertyNames(this._languages);
    if (locales.findIndex((locale) => locale === value) < 0) {
      const baseValue = value.split("-")[0];
      if (locales.findIndex((locale) => locale === baseValue) < 0) {
        console.error(
          `No translations found for locale "${value}", staying with "${this._locale}".`,
        );
        return;
      } else {
        console.warn(
          `No translations found for locale "${value}", falling back to "${baseValue}".`,
        );
        value = baseValue;
      }
    }

    this._locale = value;
  }

  get(phrase: string, values?: Record<string, unknown>): string {
    const key = getPhraseKey(phrase);
    const entry = this._content[key];
    let translatedPhrase: string;
    if (!entry) {
      console.debug(`missing translation for phrase %c${phrase}`, PHRASE_STYLE);
      translatedPhrase = phrase;
    } else {
      translatedPhrase = entry[this._locale];
      if (!translatedPhrase) {
        console.debug(
          `missing translation of phrase %c${phrase}`,
          PHRASE_STYLE,
          ` for locale %c${this._locale}`,
          LOCALE_STYLE,
        );
        translatedPhrase = phrase;
      }
    }
    if (values) {
      Object.keys(values).forEach((name) => {
        translatedPhrase = translatedPhrase.replace(
          "${" + name + "}",
          `${values[name]}`,
        );
      });
    }
    return translatedPhrase;
  }
}

export const getCurrentLocale = (): string => {
  let locale;
  if (navigator.languages && navigator.languages.length > 0) {
    locale = navigator.languages[0];
  } else {
    locale = (navigator.language ||
      (navigator as unknown as Record<string, unknown>).userLanguage ||
      (navigator as unknown as Record<string, unknown>).browserLanguage ||
      "en") as string;
  }
  return locale.split("-")[0];
};

const getPhraseKey = (phrase: string) => phrase.toLowerCase();
