import { isForeignKeyViolation } from "../../src/database/foreign-key-violation";

// O PostgreSQL informa violações de chave estrangeira pelo código SQLSTATE 23503.
test("reconhece SQLSTATE 23503", () => expect(isForeignKeyViolation({ code: "23503" })).toBe(true));
// Valores sem esse código, inclusive strings e números isolados, não são erros reconhecidos.
test.each([null, undefined, "23505", 23503, {}, { code: "outro" }])("não reconhece %p", value => expect(isForeignKeyViolation(value)).toBe(false));
