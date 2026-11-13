import { EnrollmentsService } from "../../../src/modules/enrollments/enrollments.service";
import type { EnrollmentRepository } from "../../../src/modules/enrollments/enrollments.repository";

describe("EnrollmentsService", () => {
  let repo: { create: jest.Mock; findAll: jest.Mock; findOne: jest.Mock }; let service: EnrollmentsService;
  beforeEach(() => { repo = { create: jest.fn(), findAll: jest.fn(), findOne: jest.fn() }; service = new EnrollmentsService(repo as unknown as EnrollmentRepository); });
  test("cria matrícula com ids em ordem", async () => { const row = { studentRa: 123, courseId: 1, enrolledAt: new Date("2026-01-01T00:00:00Z") }; repo.create.mockResolvedValue(row); await expect(service.create({ studentRa: 123, courseId: 1 })).resolves.toBe(row); expect(repo.create).toHaveBeenCalledWith(123, 1); });
  test.each([{ studentRa: 0, courseId: 1 }, { studentRa: 123, courseId: 0 }])("rejeita chaves inválidas %p sem chamar repositório", async input => { await expect(service.create(input)).rejects.toMatchObject({ statusCode: 400 }); expect(repo.create).not.toHaveBeenCalled(); });
  test("referência inexistente retorna 404", async () => { repo.create.mockRejectedValue({ code: "23503" }); await expect(service.create({ studentRa: 123, courseId: 1 })).rejects.toMatchObject({ statusCode: 404 }); });
  test("matrícula duplicada retorna 409", async () => { repo.create.mockRejectedValue({ code: "23505" }); await expect(service.create({ studentRa: 123, courseId: 1 })).rejects.toMatchObject({ statusCode: 409 }); });
  test("matrícula inexistente retorna 404 e encaminha ids", async () => { repo.findOne.mockResolvedValue(undefined); await expect(service.findOne(123, 1)).rejects.toMatchObject({ statusCode: 404 }); expect(repo.findOne).toHaveBeenCalledWith(123, 1); });
  test("propaga falha inesperada na criação", async () => { const failure = new Error("falha"); repo.create.mockRejectedValue(failure); await expect(service.create({ studentRa: 123, courseId: 1 })).rejects.toBe(failure); });
  test("lista matrículas sem argumentos", async () => { const list = [{ studentRa: 123, courseId: 1, enrolledAt: new Date("2026-01-01T00:00:00Z") }]; repo.findAll.mockResolvedValue(list); await expect(service.findAll()).resolves.toBe(list); expect(repo.findAll).toHaveBeenCalledTimes(1); expect(repo.findAll).toHaveBeenCalledWith(); });
  test("retorna matrícula existente e encaminha ambos ids", async () => { const row = { studentRa: 123, courseId: 1, enrolledAt: new Date("2026-01-01T00:00:00Z") }; repo.findOne.mockResolvedValue(row); await expect(service.findOne(123, 1)).resolves.toBe(row); expect(repo.findOne).toHaveBeenCalledTimes(1); expect(repo.findOne).toHaveBeenCalledWith(123, 1); });
});
