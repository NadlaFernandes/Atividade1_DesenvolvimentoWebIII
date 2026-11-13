import { StudentsService } from "../../../src/modules/students/students.service";
import type { StudentRepository } from "../../../src/modules/students/students.repository";

describe("StudentsService", () => {
  // O mock substitui o repositório e permite conferir chamadas sem depender do banco.
  let repo: { create: jest.Mock; findAll: jest.Mock; findOne: jest.Mock }; let service: StudentsService;
  beforeEach(() => { repo = { create: jest.fn(), findAll: jest.fn(), findOne: jest.fn() }; service = new StudentsService(repo as unknown as StudentRepository); });
  test("cria aluno e encaminha dados", async () => { const row = { ra: 123, name: "Ana" }; repo.create.mockResolvedValue(row); await expect(service.create(row)).resolves.toBe(row); expect(repo.create).toHaveBeenCalledWith(row); });
  test("rejeita RA inválido sem chamar repositório", async () => { await expect(service.create({ ra: 0, name: "Ana" })).rejects.toMatchObject({ statusCode: 400 }); expect(repo.create).not.toHaveBeenCalled(); });
  test("converte RA duplicado em 409", async () => { repo.create.mockRejectedValue({ code: "23505" }); await expect(service.create({ ra: 123, name: "Ana" })).rejects.toMatchObject({ statusCode: 409 }); });
  test("aluno inexistente retorna 404", async () => { repo.findOne.mockResolvedValue(undefined); await expect(service.findOne(123)).rejects.toMatchObject({ statusCode: 404 }); });
  test("propaga falha inesperada na criação", async () => { const failure = new Error("falha"); repo.create.mockRejectedValue(failure); await expect(service.create({ ra: 123, name: "Ana" })).rejects.toBe(failure); });
  test("lista alunos e chama findAll sem argumentos", async () => { const list = [{ ra: 123, name: "Ana" }]; repo.findAll.mockResolvedValue(list); await expect(service.findAll()).resolves.toBe(list); expect(repo.findAll).toHaveBeenCalledTimes(1); expect(repo.findAll).toHaveBeenCalledWith(); });
  test("retorna aluno existente e encaminha RA", async () => { const row = { ra: 123, name: "Ana" }; repo.findOne.mockResolvedValue(row); await expect(service.findOne(123)).resolves.toBe(row); expect(repo.findOne).toHaveBeenCalledTimes(1); expect(repo.findOne).toHaveBeenCalledWith(123); });
});
