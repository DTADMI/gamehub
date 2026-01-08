import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getMeta(): any {
    return {
      name: "GameHub Monolith API",
      version: "1.0.0",
      description: "Unified monolith backend for GameHub platform (Games & Projects)",
    };
  }
}
