import { TestBed } from "@angular/core/testing";
import { describe, beforeEach, expect, it } from "vitest";
import { ExampleService } from "./example.service";

describe("ExampleService", () => {
  let service: ExampleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExampleService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
