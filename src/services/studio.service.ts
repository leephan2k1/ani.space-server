import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LOGGER_CREATED } from '~/common/constants';
import { CreateLoggerDto } from '~/common/dtos';
import { IStudioRepository } from '~/contracts/repositories';
import {
  IStudioExternalService,
  IStudioInternalService,
} from '~/contracts/services';
import { StudioEdge } from '~/models/studio-edge.model';
import { Studio } from '~/models/studio.model';
import { StudioConnection } from '~/models/sub-models/studio-sub-models/studio-connection.model';
import { IPaginateResult } from '../contracts/dtos/paginate-result.interface';
import { getMethodName } from '~/utils/tools/functions';
import { MapResultSelect } from '~/utils/tools/object';
import { QueryStudioArg } from '~/graphql/types/args/query-studio.arg';
import { either } from '~/utils/tools/either';
import { NotFoundStudioError } from '~/graphql/types/dtos/studio/not-found-studio.error';

@Injectable()
export class StudioService
  implements IStudioInternalService, IStudioExternalService
{
  private readonly logger = new Logger(StudioService.name);

  constructor(
    @Inject(IStudioRepository)
    private readonly studioRepository: IStudioRepository,
    @InjectRepository(StudioEdge)
    private readonly studioEdgeRepo: Repository<StudioEdge>,
    @InjectRepository(StudioConnection)
    private readonly studioConnectionRepo: Repository<StudioConnection>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async getStudioByConditions(
    mapResultSelect: MapResultSelect,
    queryAnimeArg: QueryStudioArg,
  ) {
    const studio = await this.studioRepository.getStudioByConditions(
      mapResultSelect,
      queryAnimeArg,
    );

    if (!studio) {
      return either.error(
        new NotFoundStudioError({ requestObject: queryAnimeArg }),
      );
    }

    return either.of(studio);
  }

  public async saveStudioConnection(
    studioConnection: Partial<StudioConnection>,
  ) {
    try {
      return await this.studioConnectionRepo.save(studioConnection);
    } catch (error) {
      return this.handleServiceErrors(
        error,
        studioConnection,
        `${StudioService.name}.${getMethodName()}`,
      );
    }
  }

  public async saveStudioEdge(studioEdge: Partial<StudioEdge>) {
    try {
      return await this.studioEdgeRepo.save(studioEdge);
    } catch (error) {
      return this.handleServiceErrors(
        error,
        studioEdge,
        `${StudioService.name}.${getMethodName()}`,
      );
    }
  }

  public async saveStudio(studio: Partial<Studio>) {
    try {
      return await this.studioRepository.save(studio);
    } catch (error) {
      return this.handleServiceErrors(
        error,
        studio,
        `${StudioService.name}.${getMethodName()}`,
      );
    }
  }

  public async findStudioByIdAnilist(
    idAnilist: number,
    saveErrorNotFound?: boolean,
  ) {
    const studio = await this.studioRepository.findByCondition({
      where: {
        idAnilist,
      },
    });

    if (!studio && saveErrorNotFound) {
      this.eventEmitter.emit(LOGGER_CREATED, {
        requestObject: JSON.stringify(idAnilist),
        notes: `Can't not found studio with id ${idAnilist}`,
        tracePath: `${StudioService.name}.${getMethodName()}`,
      } as CreateLoggerDto);
    }

    return studio;
  }

  public async saveManyStudio(studios: Partial<Studio>[]) {
    try {
      return this.studioRepository.saveMany(studios);
    } catch (error) {
      return this.handleServiceErrors(
        error,
        studios,
        `${StudioService.name}.${getMethodName()}`,
      );
    }
  }

  public async getStudioListV1(page: number = 1, limit: number = 10) {
    const [result, count] = await this.studioRepository.findAndCount({
      relations: {
        anime: {
          nodes: true,
        },
      },
      take: limit,
      skip: (page - 1) * limit,
      order: {
        idAnilist: 'ASC',
      },
      cache: true,
    });

    const lastPage = Math.ceil(count / limit);
    const studioPage: IPaginateResult<Studio> = {
      pageInfo: {
        total: count,
        perPage: limit,
        currentPage: page,
        lastPage,
        hasNextPage: page < lastPage,
      },
      docs: result,
    };

    return studioPage;
  }

  private handleServiceErrors(
    error: any,
    obj: any,
    tracePath: string,
    notes?: string,
  ) {
    this.logger.error(error?.message);

    this.eventEmitter.emit(LOGGER_CREATED, {
      requestObject: JSON.stringify(obj),
      errorMessage: JSON.stringify(error),
      notes,
      tracePath: tracePath,
    } as CreateLoggerDto);

    return null;
  }
}
