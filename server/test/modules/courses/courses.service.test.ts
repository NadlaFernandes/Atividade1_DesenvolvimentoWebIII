import { CoursesService } from "../../../src/modules/courses/courses.service";
import type { CourseRepository } from "../../../src/modules/courses/courses.repository";
import { HttpError } from "../../../src/errors";

describe("CoursesService", () => {
  let repo: { create: jest.Mock; findAll: jest.Mock; findOne: jest.Mock };
  let service: CoursesService;
  beforeEach(() => {
    repo = { create: jest.fn(), findAll: jest.fn(), findOne: jest.fn() };
    service = new CoursesService(repo as unknown as CourseRepository);
  });
  test("cria disciplina válida e encaminha dados", async () => {
    const record = { id: 1, name: "Qualidade" }; repo.create.mockResolvedValue(record);
    await expect(service.create({ name: "Qualidade" })).resolves.toBe(record);
    expect(repo.create).toHaveBeenCalledTimes(1); expect(repo.create).toHaveBeenCalledWith({ name: "Qualidade" });
  });
  test.each([null, {}, { name: "A" }])("rejeita criação inválida %p sem consultar repositório", async input => {
    await expect(service.create(input)).rejects.toMatchObject({ statusCode: 400 }); expect(repo.create).not.toHaveBeenCalled();
  });
  test("converte nome duplicado em 409", async () => { repo.create.mockRejectedValue({ code: "23505" }); await expect(service.create({ name: "Qualidade" })).rejects.toMatchObject({ statusCode: 409 }); });
  test("lista disciplinas usando resposta stub", async () => { const list = [{ id: 1, name: "Qualidade" }]; repo.findAll.mockResolvedValue(list); await expect(service.findAll()).resolves.toBe(list); expect(repo.findAll).toHaveBeenCalledTimes(1); });
  test("encontra disciplina e encaminha id", async () => { const row = { id: 123, name: "Qualidade" }; repo.findOne.mockResolvedValue(row); await expect(service.findOne(123)).resolves.toBe(row); expect(repo.findOne).toHaveBeenCalledWith(123); });
  test("retorna 404 quando disciplina não existe", async () => { repo.findOne.mockResolvedValue(undefined); await expect(service.findOne(123)).rejects.toMatchObject({ statusCode: 404 }); });
  test("id inválido retorna 400 sem consultar repositório", async () => { await expect(service.findOne(0)).rejects.toMatchObject({ statusCode: 400 }); expect(repo.findOne).not.toHaveBeenCalled(); });
  test.each(["create", "findAll", "findOne"] as const)("propaga falha inesperada de %s", async method => {
    const failure = new Error("falha"); repo[method].mockRejectedValue(failure);
    const action = method === "create" ? service.create({ name: "Qualidade" }) : method === "findAll" ? service.findAll() : service.findOne(1);
    await expect(action).rejects.toBe(failure);
  });
  test("spy observa findOne do stub", async () => { const row = { id: 1, name: "Qualidade" }; repo.findOne.mockResolvedValue(row); const spy = jest.spyOn(repo, "findOne"); await expect(service.findOne(1)).resolves.toBe(row); expect(spy).toHaveBeenCalledWith(1); });
  test("remove campos extras antes de criar", async () => { repo.create.mockResolvedValue({ id: 1, name: "Qualidade" }); await service.create({ name: "Qualidade", extra: true }); expect(repo.create).toHaveBeenCalledWith({ name: "Qualidade" }); });
});
