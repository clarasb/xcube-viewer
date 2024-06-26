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

import i18n from "@/i18n";
import { HTTPError } from "./errors";
import { isFunction } from "@/util/types";

export type QueryComponent = [string, string];

export function makeRequestInit(accessToken: string | null): RequestInit {
  if (accessToken) {
    return {
      headers: [["Authorization", `Bearer ${accessToken}`]],
    };
  }
  return {};
}

export function makeRequestUrl(url: string, query: QueryComponent[]) {
  if (query.length > 0) {
    const queryString = query
      .map((kv) => kv.map(encodeURIComponent).join("="))
      .join("&");
    if (!url.includes("?")) {
      return url + "?" + queryString;
    } else if (!url.endsWith("&")) {
      return url + "&" + queryString;
    } else {
      return url + queryString;
    }
  }
  return url;
}

export async function callApi(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  if (import.meta.env.DEV) {
    console.debug("Calling API: ", url, init);
  }

  let response: Response;
  try {
    response = await fetch(url, init);
    if (response.ok) {
      return response;
    }
  } catch (error) {
    if (error instanceof TypeError) {
      console.error(
        `Server did not respond for ${url}. ` +
          "May be caused by timeout, refused connection, network error, etc.",
        error,
      );
      throw new Error(i18n.get("Cannot reach server"));
    } else {
      console.error(error);
      throw error;
    }
  }

  let message: string = response.statusText;
  try {
    const jsonResponse = await response.json();
    if (jsonResponse && jsonResponse.error) {
      const responseError = jsonResponse.error;
      console.error(responseError);
      if (responseError.message) {
        message += `: ${responseError.message}`;
      }
    }
  } catch (_e) {
    // ok, no JSON response
  }

  console.error(response);
  throw new HTTPError(response.status, message);
}

export type Transformer<R, T> = (jsonResponse: R) => T;

export async function callJsonApi<T>(url: string): Promise<T>;
export async function callJsonApi<T>(
  url: string,
  init: RequestInit,
): Promise<T>;
export async function callJsonApi<T, R>(
  url: string,
  transform: Transformer<R, T>,
): Promise<T>;
export async function callJsonApi<T, R>(
  url: string,
  init: RequestInit,
  transform: Transformer<R, T>,
): Promise<T>;
export async function callJsonApi<T, R>(
  url: string,
  initOrTransform?: RequestInit | Transformer<R, T>,
  transform?: Transformer<R, T>,
): Promise<T> {
  let init: RequestInit | undefined = undefined;
  if (isFunction(initOrTransform)) {
    transform = initOrTransform as Transformer<R, T>;
  } else {
    init = initOrTransform as RequestInit;
  }
  const response = await callApi(url, init);
  const jsonResponse = await response.json();
  return transform ? transform(jsonResponse) : jsonResponse;
}
