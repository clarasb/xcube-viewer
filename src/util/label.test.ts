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

import { expect, it, describe } from "vitest";
import { getLabelsForRange, getLabelsForValues } from "./label";

describe("Assert that label.getLabelsForRange()", () => {
  it("works for linear range", () => {
    expect(getLabelsForRange(0.0, 0.25, 5)).toEqual([
      "0",
      "0.063",
      "0.13",
      "0.19",
      "0.25",
    ]);
  });
  it("works for log-scale range", () => {
    expect(getLabelsForRange(0.001, 0.25, 5, true, false)).toEqual([
      "0.001",
      "0.004",
      "0.016",
      "0.063",
      "0.25",
    ]);
  });
  it("works for linear range, exponential", () => {
    expect(getLabelsForRange(0.0, 0.25, 5, false, true)).toEqual([
      "0.00e+0",
      "6.25e-2",
      "1.25e-1",
      "1.88e-1",
      "2.50e-1",
    ]);
  });
  it("works for log-scale range, exponential", () => {
    expect(getLabelsForRange(0.001, 0.25, 5, true, true)).toEqual([
      "1.00e-3",
      "3.98e-3",
      "1.58e-2",
      "6.29e-2",
      "2.50e-1",
    ]);
  });
});

describe("Assert that label.getLabelsForValues()", () => {
  it("works for integers", () => {
    expect(getLabelsForValues([-1, 0, 1])).toEqual(["-1", "0", "1"]);
  });
  it("works for floats", () => {
    expect(getLabelsForValues([0.01, 0.02, 0.03])).toEqual([
      "0.01",
      "0.02",
      "0.03",
    ]);
  });
  it("works for 1e-2", () => {
    expect(getLabelsForValues([0.0123, 0.0234, 0.0345])).toEqual([
      "0.012",
      "0.023",
      "0.035",
    ]);
  });
  it("works for 1e-4", () => {
    expect(getLabelsForValues([0.000123, 0.000234, 0.000345])).toEqual([
      "0.00012",
      "0.00023",
      "0.00034",
    ]);
  });
  it("works for 1e+2", () => {
    expect(getLabelsForValues([123.456, 234.567, 345.678])).toEqual([
      "123.46",
      "234.57",
      "345.68",
    ]);
  });

  it("works for 1e-4 exponential", () => {
    expect(getLabelsForValues([0.000123, 0.000234, 0.000345], true)).toEqual([
      "1.23e-4",
      "2.34e-4",
      "3.45e-4",
    ]);
  });

  it("works for 1e+2 exponential", () => {
    expect(getLabelsForValues([123.456, 234.567, 345.678], true)).toEqual([
      "1.23e+2",
      "2.35e+2",
      "3.46e+2",
    ]);
  });
});
