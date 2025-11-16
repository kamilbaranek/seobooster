import { Controller, Get, InternalServerErrorException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { fetch } from 'undici';

@Controller('admin/models')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN)
export class AdminModelsController {
  @Get('openrouter')
  async listOpenRouterModels() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('OPENROUTER_API_KEY is not configured');
    }

    const baseUrl = process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1';

    const response = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL ?? 'http://localhost:3333',
        'X-Title': process.env.OPENROUTER_APP_NAME ?? 'SEO Booster'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new InternalServerErrorException(`Failed to load OpenRouter models: ${response.status} ${text}`);
    }

    const payload = (await response.json()) as any;
    const models = Array.isArray(payload.data ?? payload.models ?? payload)
      ? (payload.data ?? payload.models ?? payload)
      : [];

    return (models as any[])
      .map((model) => ({
        id: model.id as string,
        name: (model.name as string) ?? (model.id as string),
        contextLength: (model.context_length as number) ?? (model.context_length_tokens as number) ?? null,
        pricing: model.pricing ?? null,
        provider: model.provider ?? null
      }))
      .sort((a, b) => a.id.localeCompare(b.id));
  }
}
