import { PgStudentRepository } from "../../../src/modules/students/students.repository";
import type { Database } from "../../../src/database/connection";

const norm = (sql: string) => sql.replace(/\s+/g, " ").trim();
describe("PgStudentRepository", () => {
  let query: jest.Mock; let repo: PgStudentRepository;
  beforeEach(() => { query = jest.fn(); repo = new PgStudentRepository({ query } as unknown as Database); });
  test("create insere e retorna ra/name", async () => { const row = { ra: 123, name: "Ana" }; query.mockResolvedValue({ rows: [row] }); await expect(repo.create(row)).resolves.toBe(row); expect(query).toHaveBeenCalledTimes(1); const [sql, values] = query.mock.calls[0]; expect(norm(sql)).toBe("INSERT INTO students (ra, name) VALUES ($1, $2) RETURNING ra, name"); expect(values).toEqual([123, "Ana"]); });
  test("findAll seleciona por nome", async () => { const rows = [{ ra: 123, name: "Ana" }]; query.mockResolvedValue({ rows }); await expect(repo.findAll()).resolves.toBe(rows); expect(query).toHaveBeenCalledTimes(1); const [sql, values] = query.mock.calls[0]; expect(norm(sql)).toBe("SELECT ra, name FROM students ORDER BY name"); expect(values).toBeUndefined(); });
  test("findAll retorna lista vazia", async () => { query.mockResolvedValue({ rows: [] }); await expect(repo.findAll()).resolves.toEqual([]); });
  test("findOne filtra RA parametrizado", async () => { const row = { ra: 123, name: "Ana" }; query.mockResolvedValue({ rows: [row] }); await expect(repo.findOne(123)).resolves.toBe(row); expect(query).toHaveBeenCalledTimes(1); const [sql, values] = query.mock.calls[0]; expect(norm(sql)).toBe("SELECT ra, name FROM students WHERE ra = $1"); expect(values).toEqual([123]); });
  test("findOne retorna undefined sem resultado", async () => { query.mockResolvedValue({ rows: [] }); await expect(repo.findOne(123)).resolves.toBeUndefined(); });
  test.each(["create", "findAll", "findOne"] as const)("%s propaga falha do banco", async method => { const failure = new Error("db"); query.mockRejectedValue(failure); const action = method === "create" ? repo.create({ ra: 123, name: "Ana" }) : method === "findAll" ? repo.findAll() : repo.findOne(123); await expect(action).rejects.toBe(failure); });
});
