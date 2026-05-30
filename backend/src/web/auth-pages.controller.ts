import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { clearAuthCookie, setAuthCookie } from '../auth/auth.constants';
import { AuthService } from '../auth/auth.service';
import { LoginDto, RegisterDto } from '../auth/dto/auth.dto';
import { PageAuthGuard } from '../auth/page-auth.guard';

@Controller()
export class AuthPagesController {
  constructor(private readonly authService: AuthService) { }

  @Get()
  root(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies?.access_token as string | undefined;

    if (token) {
      try {
        this.authService.verifyToken(token);
        return res.redirect('/dashboard');
      } catch {
        return res.redirect('/login');
      }
    }

    return res.redirect('/login');
  }

  @Get('login')
  @Render('login')
  loginPage(@Res({ passthrough: true }) res: Response) {
    clearAuthCookie(res);
    return { title: 'Login', error: null };
  }

  @Post('login')
  async loginSubmit(@Body() body: LoginDto, @Res() res: Response) {
    try {
      const result = await this.authService.login(body);
      setAuthCookie(
        res,
        result.accessToken,
        this.authService.getJwtExpiresIn(),
      );
      return res.redirect('/dashboard');
    } catch {
      return res.render('login', {
        title: 'Login',
        error: 'Credenciais inválidas',
        email: body.email,
      });
    }
  }

  @Get('register')
  @Render('register')
  registerPage() {
    return { title: 'Cadastro', error: null };
  }

  @Post('register')
  async registerSubmit(@Body() body: RegisterDto, @Res() res: Response) {
    try {
      const result = await this.authService.register(body);
      setAuthCookie(
        res,
        result.accessToken,
        this.authService.getJwtExpiresIn(),
      );
      return res.redirect('/dashboard');
    } catch {
      return res.render('register', {
        title: 'Cadastro',
        error: 'Não foi possível criar a conta. Email já cadastrado?',
        email: body.email,
        name: body.name,
      });
    }
  }

  @Post('logout')
  @UseGuards(PageAuthGuard)
  logout(@Res() res: Response) {
    clearAuthCookie(res);
    return res.redirect('/login');
  }
}
