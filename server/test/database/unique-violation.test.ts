import { isUniqueViolation } from "../../src/database/unique-violation";

// O PostgreSQL informa violações de unicidade pelo código SQLSTATE 23505.
test("reconhece SQLSTATE 23505", () => expect(isUniqueViolation({ code: "23505" })).toBe(true));
// Valores sem esse código, inclusive strings e números isolados, não são erros reconhecidos.
test.each([null, undefined, "23505", 23503, {}, { code: "outro" }])("não reconhece %p", value => expect(isUniqueViolation(value)).toBe(false));
