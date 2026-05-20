import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { PrepService } from './prep.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('prep')
@UseGuards(JwtAuthGuard)
export class PrepController {
  constructor(private readonly prepService: PrepService) {}

  @Post('seed')
  async seed() {
    return this.prepService.seedMaterials();
  }

  @Get('materials')
  async getMaterials(@Query() query: any) {
    return this.prepService.getMaterials(query);
  }

  @Get('materials/:id')
  async getMaterialById(@Param('id') id: string) {
    return this.prepService.getMaterialById(Number(id));
  }

  @Post('bookmarks/:materialId')
  async toggleBookmark(@Req() req: any, @Param('materialId') materialId: string) {
    return this.prepService.toggleBookmark(req.user.id, Number(materialId));
  }

  @Get('bookmarks')
  async getBookmarks(@Req() req: any) {
    return this.prepService.getBookmarks(req.user.id);
  }

  @Post('progress/:materialId')
  async markProgress(@Req() req: any, @Param('materialId') materialId: string) {
    return this.prepService.markProgress(req.user.id, Number(materialId));
  }

  @Get('progress')
  async getProgress(@Req() req: any) {
    return this.prepService.getProgress(req.user.id);
  }

  @Post('recently-viewed/:materialId')
  async trackRecentlyViewed(@Req() req: any, @Param('materialId') materialId: string) {
    return this.prepService.trackRecentlyViewed(req.user.id, Number(materialId));
  }

  @Get('recently-viewed')
  async getRecentlyViewed(@Req() req: any) {
    return this.prepService.getRecentlyViewed(req.user.id);
  }

  @Post('ai/explain')
  async explainConcept(@Body('concept') concept: string) {
    return this.prepService.generateExplanation(concept);
  }

  @Post('ai/cheat-sheet')
  async generateCheatSheet(@Body() body: { topic: string; content: string }) {
    return this.prepService.generateCheatSheet(body.topic, body.content);
  }

  @Post('ai/questions')
  async generatePracticeQuestions(@Body() body: { topic: string; content: string }) {
    return this.prepService.generatePracticeQuestions(body.topic, body.content);
  }

  @Post('ai/roadmap')
  async generateRoadmap(@Body('weakAreas') weakAreas: string[]) {
    return this.prepService.generateRoadmap(weakAreas || []);
  }
}
