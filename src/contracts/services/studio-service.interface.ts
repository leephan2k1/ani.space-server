import { StudioEdge } from '~/models/studio-edge.model';
import { Studio } from '~/models/studio.model';
import { StudioConnection } from '~/models/sub-models/studio-sub-models/studio-connection.model';
import { IPaginateResult } from '../dtos';
import { MapResultSelect } from '~/utils/tools/object';
import { QueryStudioArg } from '~/graphql/types/args/query-studio.arg';
import { Either } from '~/utils/tools/either';
import { NotFoundStudioError } from '~/graphql/types/dtos/studio/not-found-studio.error';

export interface IStudioExternalService {
  getStudioByConditions(
    mapResultSelect: MapResultSelect,
    queryAnimeArg: QueryStudioArg,
  ): Promise<Either<NotFoundStudioError, never> | Either<never, Studio>>;
}

export const IStudioExternalService = Symbol('IStudioExternalService');

export interface IStudioInternalService {
  saveManyStudio(studios: Partial<Studio>[]): Promise<Studio[] | null>;

  getStudioListV1(
    page?: number,
    limit?: number,
  ): Promise<IPaginateResult<Studio>>;

  findStudioByIdAnilist(
    idAnilist: number,
    saveErrorNotFound?: boolean,
  ): Promise<Studio | null>;

  saveStudio(studio: Partial<Studio>): Promise<Studio | null>;

  saveStudioEdge(
    studioEdge: Partial<StudioEdge>,
  ): Promise<(Partial<StudioEdge> & StudioEdge) | null>;

  saveStudioConnection(
    studioConnection: Partial<StudioConnection>,
  ): Promise<(Partial<StudioConnection> & StudioConnection) | null>;
}

export const IStudioInternalService = Symbol('IStudioInternalService');
