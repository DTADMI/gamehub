import { Body, Controller, Get, Post, Req,UseGuards } from "@nestjs/common";
import { Request } from "express";

import { AuthService } from "./auth.service";
import { SigninDto,SignupDto } from "./dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post("signin")
  async signin(@Body() dto: SigninDto) {
    return this.authService.signin(dto);
  }

  @Post("signout")
  @UseGuards(JwtAuthGuard)
  async signout() {
    // JWT tokens are stateless, so signout is handled client-side
    // This endpoint is here for consistency and future session management
    return { message: "Signed out successfully" };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request & { user: any }) {
    return this.authService.getProfile(req.user.id);
  }
}
