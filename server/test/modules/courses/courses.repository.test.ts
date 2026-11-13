import { PgCourseRepository } from "../../../src/modules/courses/courses.repository";
import type { Database } from "../../../src/database/connection";

const norm = (sql: string) => sql.replace(/\s+/g, " ").trim();
describe("PgCourseRepository", () => {
  let query: jest.Mock; let repo: PgCourseRepository;
  beforeEach(() => { query = jest.fn(); repo = new PgCourseRepository({ query } as unknown as Database); });
  test("create insere e retorna id/name", async () => { const row = { id: 7, name: "Qualidade" }; query.mockResolvedValue({ rows: [row] }); await expect(repo.create({ name: "Qualidade" })).resolves.toBe(row); expect(query).toHaveBeenCalledTimes(1); const [sql, values] = query.mock.calls[0]; expect(norm(sql)).toBe("INSERT INTO courses (name) VALUES ($1) RETURNING id, name"); expect(values).toEqual(["Qualidade"]); });
  test("findAll seleciona em ordem", async () => { const rows = [{ id: 7, name: "Qualidade" }]; query.mockResolvedValue({ rows }); await expect(repo.findAll()).resolves.toBe(rows); expect(query).toHaveBeenCalledTimes(1); const [sql, values] = query.mock.calls[0]; expect(norm(sql)).toBe("SELECT id, name FROM courses ORDER BY id"); expect(values).toBeUndefined(); });
  test("findAll retorna lista vazia", async () => { query.mockResolvedValue({ rows: [] }); await expect(repo.findAll()).resolves.toEqual([]); });
  test("findOne filtra id parametrizado", async () => { const row = { id: 7, name: "Qualidade" }; query.mockResolvedValue({ rows: [row] }); await expect(repo.findOne(7)).resolves.toBe(row); expect(query).toHaveBeenCalledTimes(1); const [sql, values] = query.mock.calls[0]; expect(norm(sql)).toBe("SELECT id, name FROM courses WHERE id = $1"); expect(values).toEqual([7]); });
  test("findOne retorna undefined sem resultado", async () => { query.mockResolvedValue({ rows: [] }); await expect(repo.findOne(7)).resolves.toBeUndefined(); });
  test.each(["create", "findAll", "findOne"] as const)("%s propaga falha do banco", async method => { const failure = new Error("db"); query.mockRejectedValue(failure); const action = method === "create" ? repo.create({ name: "Qualidade" }) : method === "findAll" ? repo.findAll() : repo.findOne(7); await expect(action).rejects.toBe(failure); });
});
