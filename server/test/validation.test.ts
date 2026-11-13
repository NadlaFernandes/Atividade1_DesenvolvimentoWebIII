import { HttpError } from "../src/errors";
import { parseId, positiveInteger, validateBody, validateName } from "../src/validation";

function expectBadRequest(run: () => unknown) {
  try { run(); } catch (error) {
    expect(error).toBeInstanceOf(HttpError);
    expect((error as HttpError).statusCode).toBe(400);
    return;
  }
  throw new Error("Esperava HttpError 400");
}

describe("positiveInteger", () => {
  test.each([1, 2147483647])("aceita o limite %s", value => expect(positiveInteger(value, "RA")).toBe(value));
  test.each([0, -1, 1.5, NaN, Infinity, 2147483648, "123", null, undefined])("rejeita %p", value => expectBadRequest(() => positiveInteger(value, "RA")));
});

describe("parseId", () => {
  test.each([["1", 1], ["2147483647", 2147483647]])("converte %s", (value, expected) => expect(parseId(value, "RA")).toBe(expected));
  test.each(["1abc", "1.2", "1e2", "", "-1", "0", "2147483648", 123])("rejeita %p", value => expectBadRequest(() => parseId(value, "RA")));
});

describe("validateName", () => {
  test.each(["Ana", "a".repeat(100)])("aceita nome válido de %s", value => expect(validateName(value)).toBe(value));
  test.each(["", "ab", "   ", " a ", "a".repeat(101), 123, null, undefined])("rejeita %p", value => expectBadRequest(() => validateName(value)));
});

describe("validateBody", () => {
  test("aceita objeto congelado sem modificá-lo", () => {
    const body = Object.freeze({ name: "Ana" });
    expect(validateBody(body)).toBe(body);
    expect(body).toEqual({ name: "Ana" });
  });
  test.each([null, undefined, [], "Ana", 12])("rejeita %p", value => expectBadRequest(() => validateBody(value)));
  test("aceita campos extras e preserva a referência", () => {
    const body = { name: "Ana", extra: true };
    expect(validateBody(body)).toBe(body);
    expect(body).toEqual({ name: "Ana", extra: true });
  });
});
