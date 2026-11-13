import { PgEnrollmentRepository } from "../../../src/modules/enrollments/enrollments.repository";
import type { Database } from "../../../src/database/connection";

const norm = (sql: string) => sql.replace(/\s+/g, " ").trim();
const fields = 'student_ra AS "studentRa", course_id AS "courseId", enrolled_at AS "enrolledAt"';
describe("PgEnrollmentRepository", () => {
  let query: jest.Mock; let repo: PgEnrollmentRepository;
  beforeEach(() => { query = jest.fn(); repo = new PgEnrollmentRepository({ query } as unknown as Database); });
  test("create insere e preserva aliases camelCase e data", async () => { const row = { studentRa: 123, courseId: 7, enrolledAt: new Date("2026-01-01T00:00:00Z") }; query.mockResolvedValue({ rows: [row] }); const result = await repo.create(123, 7); expect(result).toEqual(row); expect(result.enrolledAt).toBe(row.enrolledAt); expect(query).toHaveBeenCalledTimes(1); const [sql, values] = query.mock.calls[0]; expect(norm(sql)).toBe(`INSERT INTO enrollments (student_ra, course_id) VALUES ($1, $2) RETURNING ${fields}`); expect(values).toEqual([123, 7]); });
  test("findAll seleciona aliases em ordem de chaves", async () => { const rows = [{ studentRa: 123, courseId: 7, enrolledAt: new Date("2026-01-01T00:00:00Z") }]; query.mockResolvedValue({ rows }); await expect(repo.findAll()).resolves.toBe(rows); expect(query).toHaveBeenCalledTimes(1); const [sql, values] = query.mock.calls[0]; expect(norm(sql)).toBe(`SELECT ${fields} FROM enrollments ORDER BY student_ra, course_id`); expect(values).toBeUndefined(); });
  test("findAll retorna lista vazia", async () => { query.mockResolvedValue({ rows: [] }); await expect(repo.findAll()).resolves.toEqual([]); });
  test("findOne filtra os dois ids com aliases", async () => { const row = { studentRa: 123, courseId: 7, enrolledAt: new Date("2026-01-01T00:00:00Z") }; query.mockResolvedValue({ rows: [row] }); const result = await repo.findOne(123, 7); expect(result).toEqual(row); expect(result?.enrolledAt).toBe(row.enrolledAt); expect(query).toHaveBeenCalledTimes(1); const [sql, values] = query.mock.calls[0]; expect(norm(sql)).toBe(`SELECT ${fields} FROM enrollments WHERE student_ra = $1 AND course_id = $2`); expect(values).toEqual([123, 7]); });
  test("findOne retorna undefined sem resultado", async () => { query.mockResolvedValue({ rows: [] }); await expect(repo.findOne(123, 7)).resolves.toBeUndefined(); });
  test.each(["create", "findAll", "findOne"] as const)("%s propaga falha do banco", async method => { const failure = new Error("db"); query.mockRejectedValue(failure); const action = method === "create" ? repo.create(123, 7) : method === "findAll" ? repo.findAll() : repo.findOne(123, 7); await expect(action).rejects.toBe(failure); });
});
