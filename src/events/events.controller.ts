import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  Res,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { SupabaseAuthGuard } from '../auth/auth.guard';

@ApiTags('Events')
@ApiBearerAuth('access-token')
@Controller('events')
@UseGuards(SupabaseAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create event',
    description: 'Creates a new event. The event_date must be a future date. Only the authenticated user is set as the creator.',
  })
  @ApiResponse({ status: 201, description: 'Event created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async createEvent(@Req() req, @Res() res, @Body() dto: CreateEventDto) {
    try {
      const data = await this.eventsService.createEvent(req, dto);
      return res.status(HttpStatus.CREATED).json(data);
    } catch (error) {
      throw new HttpException(
        { message: error?.message ?? 'Error creating event' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({
    summary: 'List active events',
    description: 'Returns all events whose event_date is greater than or equal to the current timestamp. Past events are automatically excluded.',
  })
  @ApiResponse({ status: 200, description: 'List of active events.' })
  async listEvents(@Req() req) {
    return this.eventsService.listEvents(req);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get event by ID',
    description: 'Returns a single active event by its UUID. Returns 404 if the event has passed or does not exist.',
  })
  @ApiParam({ name: 'id', description: 'Event UUID', example: 'e2f4c123-ab12-4c56-89de-abcdef012345' })
  @ApiResponse({ status: 200, description: 'Event found.' })
  @ApiResponse({ status: 404, description: 'Event not found or already closed.' })
  async getEventById(@Req() req, @Param('id') id: string) {
    return this.eventsService.getEventById(req, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update event',
    description: 'Updates an existing event. Only the creator of the event is allowed to edit it. Returns 403 for unauthorized users.',
  })
  @ApiParam({ name: 'id', description: 'Event UUID', example: 'e2f4c123-ab12-4c56-89de-abcdef012345' })
  @ApiResponse({ status: 200, description: 'Event updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden — only the creator can edit this event.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  async updateEvent(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.updateEvent(req, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete event',
    description: 'Permanently removes an event. Only the creator of the event is allowed to delete it. Returns 403 for unauthorized users.',
  })
  @ApiParam({ name: 'id', description: 'Event UUID', example: 'e2f4c123-ab12-4c56-89de-abcdef012345' })
  @ApiResponse({ status: 204, description: 'Event deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden — only the creator can delete this event.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  async deleteEvent(@Req() req, @Res() res, @Param('id') id: string) {
    try {
      await this.eventsService.deleteEvent(req, id);
      return res.status(HttpStatus.NO_CONTENT).json({});
    } catch (error) {
      if (error?.status) throw error;
      throw new HttpException(
        { message: error?.message ?? 'Error deleting event' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
